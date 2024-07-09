import { API, DATE, LANG } from './main.js'
import { sendInput } from './game.js';

const deleteSaveButton = document.getElementById('delete-save');
deleteSaveButton.onclick = () => {
  let key = getSaveKey();
  if (confirm(LANG === 'fr' ? `Êtes vous sûr de supprimer votre sauvegarde ${key} ?`
    : `Are you sure you want to delete your save ${key}?`)) {
    localStorage.removeItem(key);
    window.location.reload();
  }
}

function getSaveKey() {
  return `${LANG}|${API}|${DATE}`;
}

export function getSaveValue() {
  let key = getSaveKey();
  return JSON.parse(localStorage.getItem(key) ?? '[]');
}

const historyDiv = document.getElementById('history');

function addToHistory(guess) {
  const span = document.createElement('span');
  span.innerText = guess;
  span.onclick = () => {
    document.getElementById('input').value = guess;
  }
  historyDiv.appendChild(span);
}

export function save(guess) {
  if (getSaveValue().includes(guess)) return;
  let key = getSaveKey();
  let save = JSON.parse(localStorage.getItem(key) ?? '[]');
  localStorage.setItem(key, JSON.stringify([...save, guess]));
  addToHistory(guess);
}

export function loadSave() {
  for (const guess of getSaveValue()) {
    sendInput(guess);
    addToHistory(guess);
  }
}