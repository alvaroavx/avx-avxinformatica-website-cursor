import { AUDIO_CATALOG, GameAudio } from "/js/audio/game-audio.js";

const audio = new GameAudio();
const catalog = document.querySelector("#catalog"), editor = document.querySelector("#editor"), events = document.querySelector("#events"), active = document.querySelector("#active"), status = document.querySelector("#status"), arena = document.querySelector("#arena");
let selected = AUDIO_CATALOG[0], baseline = audio.preset(selected.id), presetA = null, presetB = null;

const sendArena = (command) => arena.contentWindow.postMessage({ type: "avx-audio-lab-command", command }, location.origin);
const escape = (value) => String(value).replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char]);

function renderCatalog() {
  const term = document.querySelector("#search").value.toLowerCase(); let previous = "";
  catalog.replaceChildren(...AUDIO_CATALOG.filter((event) => `${event.group} ${event.label} ${event.id}`.toLowerCase().includes(term)).flatMap((event) => {
    const group = event.group === previous ? [] : [Object.assign(document.createElement("div"), { className: "group", textContent: event.group })]; previous = event.group;
    const button = Object.assign(document.createElement("button"), { className: `event ${event.id === selected.id ? "active" : ""}`, textContent: `${event.label} · ${event.id}` }); button.onclick = () => { selected = event; baseline = audio.preset(event.id); renderCatalog(); renderEditor(); }; return [...group, button];
  }));
}
function renderEditor() {
  const preset = audio.preset(selected.id), dirty = JSON.stringify(preset) !== JSON.stringify(baseline);
  editor.innerHTML = `<h2>${escape(selected.label)}</h2><p>${escape(selected.id)} <span class="state">${escape(preset.review)}</span> ${dirty ? '<b class="dirty">CAMBIOS SIN GUARDAR</b>' : ""}</p>
  <div class="actions"><button data-action="play">▶ PLAY</button><button data-action="stop">■ STOP</button><button data-action="ten">SIMULAR x10</button><button data-action="arena">TEST IN ARENA</button><button data-action="save">GUARDAR</button><button data-action="reset">RESET</button><button data-action="a">A</button><button data-action="b">B</button><button data-action="ab">A/B</button></div>
  ${field("Volumen", "gain", preset.gain, 0, 1, .01)}${field("Pitch (cents)", "detune", preset.detune, -600, 600, 1)}${field("Playback rate", "rate", preset.rate, .5, 2, .01)}${field("Variación", "variation", preset.variation, 0, 120, 1)}
  <div class="field"><label>Revisión</label><select id="review">${["SIN REVISAR", "APROBADO", "REVISAR", "DESCARTADO"].map((value) => `<option ${value === preset.review ? "selected" : ""}>${value}</option>`).join("")}</select></div><label><input id="favorite" type="checkbox" ${preset.favorite ? "checked" : ""}/> Favorito</label><h3>MASTER MIXER <small>0–200 %</small></h3>${Object.entries(audio.mix).map(([name, value]) => mixField(name, value)).join("")}<p>Perfil: ${selected.group === "PLAYER" ? "preciso y electrónico" : selected.group === "BOSS" ? "extraño y pesado" : "físico y fragmentado"}.</p>`;
  editor.querySelectorAll("input[data-preset]").forEach((input) => input.oninput = () => { audio.savePreset(selected.id, { [input.name]: Number(input.value) }); renderEditor(); });
  editor.querySelectorAll("input[data-mix]").forEach((input) => input.oninput = () => { audio.setMix(input.name, input.value); input.nextElementSibling.textContent = `${Math.round(input.value * 100)} %`; });
  editor.querySelector("#review").onchange = (event) => { audio.savePreset(selected.id, { review: event.target.value }); renderEditor(); };
  editor.querySelector("#favorite").onchange = (event) => { audio.savePreset(selected.id, { favorite: event.target.checked }); renderEditor(); };
  editor.querySelectorAll("[data-action]").forEach((button) => button.onclick = async () => { await audio.unlock(); status.textContent = "Audio activo"; const action = button.dataset.action; if (action === "play") audio.playEvent(selected.id); if (action === "stop") audio.stopEngine(); if (action === "ten") Array.from({ length: 10 }, (_, index) => setTimeout(() => audio.playEvent(selected.id), index * 110)); if (action === "arena") sendArena(selected.id); if (action === "save") { baseline = audio.preset(selected.id); renderEditor(); } if (action === "reset") { audio.resetPreset(selected.id); baseline = audio.preset(selected.id); renderEditor(); } if (action === "a") presetA = audio.preset(selected.id); if (action === "b") presetB = audio.preset(selected.id); if (action === "ab") { const next = presetA && presetB && JSON.stringify(audio.preset(selected.id)) === JSON.stringify(presetA) ? presetB : presetA; if (next) { audio.savePreset(selected.id, next); renderEditor(); audio.playEvent(selected.id); } } });
}
function field(label, name, value, min, max, step) { return `<div class="field"><label>${label}</label><input data-preset name="${name}" type="range" min="${min}" max="${max}" step="${step}" value="${value}"/><output>${value}</output></div>`; }
function mixField(name, value) { return `<div class="field"><label>${name.toUpperCase()}</label><input data-mix name="${name}" type="range" min="0" max="2" step=".01" value="${value}"/><output>${Math.round(value * 100)} %</output></div>`; }

audio.onEvent((event) => { active.textContent = `${audio.activeSounds} voces`; const item = document.createElement("li"); item.textContent = `${event.at}  ${event.id}`; events.prepend(item); while (events.children.length > 30) events.lastChild.remove(); });
document.querySelector("#search").oninput = renderCatalog;
document.querySelectorAll("[data-arena]").forEach((button) => button.onclick = () => sendArena(button.dataset.arena));
document.querySelector("#export").onclick = async () => { await navigator.clipboard.writeText(audio.exportPresets()); status.textContent = "JSON copiado"; };
document.querySelector("#import").onclick = () => { const source = prompt("Pega el JSON de presets"); if (!source) return; try { audio.importPresets(source); baseline = audio.preset(selected.id); renderCatalog(); renderEditor(); } catch { status.textContent = "JSON inválido"; } };
renderCatalog(); renderEditor();
