"""Local AVX Vector Field server with deliberately minimal SQLite persistence."""

from __future__ import annotations

import json
import sqlite3
import argparse
from datetime import UTC, datetime
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
WEB_ROOT = ROOT / "src"
DEV_LAB_ROOT = ROOT / "tools" / "audio-lab"
DATABASE = ROOT / "data" / "vector-field.sqlite3"
MAX_BODY_BYTES = 4_096
DIFFICULTIES = {"easy", "normal", "hard"}
OUTCOMES = {"victory", "game_over"}


def connection() -> sqlite3.Connection:
    DATABASE.parent.mkdir(exist_ok=True)
    db = sqlite3.connect(DATABASE)
    db.execute(
        """
        CREATE TABLE IF NOT EXISTS game_runs (
            id INTEGER PRIMARY KEY,
            created_at TEXT NOT NULL,
            score INTEGER NOT NULL,
            difficulty TEXT NOT NULL,
            outcome TEXT NOT NULL,
            threats_destroyed INTEGER NOT NULL,
            reboots INTEGER NOT NULL,
            upgrades TEXT NOT NULL
        )
        """
    )
    return db


class VectorFieldHandler(SimpleHTTPRequestHandler):
    audio_lab_enabled = False

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(WEB_ROOT), **kwargs)

    def do_POST(self) -> None:
        if self.path != "/api/runs":
            self.send_error(HTTPStatus.NOT_FOUND)
            return
        length = int(self.headers.get("Content-Length", "0"))
        if not 0 < length <= MAX_BODY_BYTES:
            self.send_error(HTTPStatus.BAD_REQUEST, "Invalid request size")
            return
        try:
            payload = json.loads(self.rfile.read(length))
            score = int(payload["score"])
            difficulty = payload["difficulty"]
            outcome = payload["outcome"]
            threats = int(payload["threatsDestroyed"])
            reboots = int(payload["reboots"])
            upgrades = payload.get("upgrades", [])
            if difficulty not in DIFFICULTIES or outcome not in OUTCOMES:
                raise ValueError("Invalid run values")
            if not all(isinstance(item, str) and len(item) <= 32 for item in upgrades):
                raise ValueError("Invalid upgrades")
            if min(score, threats, reboots) < 0:
                raise ValueError("Negative values are not allowed")
        except (KeyError, TypeError, ValueError, json.JSONDecodeError):
            self.send_error(HTTPStatus.BAD_REQUEST, "Invalid run payload")
            return
        with connection() as db:
            db.execute(
                "INSERT INTO game_runs (created_at, score, difficulty, outcome, threats_destroyed, reboots, upgrades) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (datetime.now(UTC).isoformat(), score, difficulty, outcome, threats, reboots, json.dumps(upgrades)),
            )
        self.send_response(HTTPStatus.CREATED)
        self.send_header("Content-Type", "application/json")
        self.end_headers()
        self.wfile.write(b'{"saved":true}')

    def do_GET(self) -> None:
        if self.path == "/dev/audio":
            if not self.audio_lab_enabled:
                self.send_error(HTTPStatus.NOT_FOUND)
                return
            self._serve_dev_file(DEV_LAB_ROOT / "index.html", "text/html; charset=utf-8")
            return
        if self.path.startswith("/__dev/audio-lab/"):
            if not self.audio_lab_enabled:
                self.send_error(HTTPStatus.NOT_FOUND)
                return
            name = self.path.removeprefix("/__dev/audio-lab/")
            candidate = (DEV_LAB_ROOT / name).resolve()
            if DEV_LAB_ROOT not in candidate.parents or not candidate.is_file():
                self.send_error(HTTPStatus.NOT_FOUND)
                return
            content_type = "text/css; charset=utf-8" if candidate.suffix == ".css" else "text/javascript; charset=utf-8"
            self._serve_dev_file(candidate, content_type)
            return
        super().do_GET()

    def _serve_dev_file(self, path: Path, content_type: str) -> None:
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type)
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.wfile.write(path.read_bytes())


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Serve AVX Vector Field locally.")
    parser.add_argument("--port", type=int, default=8080, help="local port (default: 8080)")
    parser.add_argument("--audio-lab", action="store_true", help="expose the development-only Audio Lab at /dev/audio")
    args = parser.parse_args()
    port = args.port
    VectorFieldHandler.audio_lab_enabled = args.audio_lab
    server = ThreadingHTTPServer(("127.0.0.1", port), VectorFieldHandler)
    print(f"AVX Vector Field ready at http://127.0.0.1:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
    finally:
        server.server_close()
