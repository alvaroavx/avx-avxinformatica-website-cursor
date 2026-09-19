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


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Serve AVX Vector Field locally.")
    parser.add_argument("--port", type=int, default=8080, help="local port (default: 8080)")
    port = parser.parse_args().port
    server = ThreadingHTTPServer(("127.0.0.1", port), VectorFieldHandler)
    print(f"AVX Vector Field ready at http://127.0.0.1:{port}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
    finally:
        server.server_close()
