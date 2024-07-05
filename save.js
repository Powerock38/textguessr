import { API, DATE } from './main.js'

const deleteSaveButton = document.getElementById('delete-save');
deleteSaveButton.onclick = () => {
  if (confirm("Are you sure you want to delete your save?")) {
    let key = getSaveKey();
    localStorage.removeItem(key);
    location.reload();
  }
}

function getSaveKey() {
  return `${API}|${DATE}`;
}

export function save(guess) {
  let key = getSaveKey();
  let save = JSON.parse(localStorage.getItem(key) ?? '[]');
  localStorage.setItem(key, JSON.stringify([...save, guess]));
}

export function loadSave() {
  let key = getSaveKey();
  for (const guess of JSON.parse(localStorage.getItem(key) ?? '[]')) {
    sendInput(guess);
  }
}