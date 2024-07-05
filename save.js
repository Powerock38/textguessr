import { API, DATE } from './main.js'
import { sendInput } from './game.js';

const deleteSaveButton = document.getElementById('delete-save');
deleteSaveButton.onclick = () => {
  if (confirm("Are you sure you want to delete your save?")) {
    let key = getSaveKey();
    localStorage.removeItem(key);
    window.location.reload();
  }
}

function getSaveKey() {
  return `${API}|${DATE}`;
}

function getSaveValue() {
  let key = getSaveKey();
  return JSON.parse(localStorage.getItem(key) ?? '[]');
}

export function save(guess) {
  if (getSaveValue().includes(guess)) return;
  let key = getSaveKey();
  let save = JSON.parse(localStorage.getItem(key) ?? '[]');
  localStorage.setItem(key, JSON.stringify([...save, guess]));
}

export function loadSave() {
  for (const guess of getSaveValue()) {
    sendInput(guess);
  }
}