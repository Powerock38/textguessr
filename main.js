import apis from './apis.js';
import { loadSave, save, getSaveValue } from './save.js';
import { addRemoveClass, log } from './utils.js';
import { initTokens, initText, normalize, sendInput, checkWin, getPercentageFound } from './game.js';

const queryParams = new URLSearchParams(window.location.search);

// API selection
const DEFAULT_API = 'wikipedia';
export const API = queryParams.get("api") ?? DEFAULT_API;
const apiSelect = document.getElementById('api-select');
apiSelect.value = API;
apiSelect.onchange = () => {
  queryParams.set("api", apiSelect.value);
  window.location.search = queryParams.toString();
}

if (!apis[API]) {
  apiSelect.value = DEFAULT_API;
  apiSelect.onchange();
}

// Date picker
const DEFAULT_DATE = new Date().toISOString().split('T')[0]
export const DATE = queryParams.get("date") ?? DEFAULT_DATE;
const dateInput = document.getElementById('date');
dateInput.value = DATE;
dateInput.onchange = () => {
  queryParams.set("date", dateInput.value);
  window.location.search = queryParams.toString();
}

if (isNaN(new Date(DATE))) {
  dateInput.value = DEFAULT_DATE;
  dateInput.onchange();
}

// Lang
const DEFAULT_LANG = 'fr';
export const LANG = queryParams.get("lang") ?? DEFAULT_LANG;
const langSelect = document.getElementById('lang-select');
langSelect.value = LANG;
langSelect.onchange = () => {
  queryParams.set("lang", langSelect.value);
  window.location.search = queryParams.toString();
}

if (LANG !== 'fr' && LANG !== 'en') {
  langSelect.value = DEFAULT_LANG;
  langSelect.onchange();
}

// Guess input

const inputWrapper = document.getElementById('input-wrapper');
const input = document.getElementById('input');
const inputButton = document.getElementById('input-button');
const nbFoundDiv = document.getElementById('nb-found');
const percentFoundDiv = document.getElementById('percent-found');

inputButton.onclick = () => {
  const inputClean = normalize(input.value);
  const found = sendInput(inputClean);

  if (found) {
    save(inputClean);
    checkWin();
    nbFoundDiv.innerText = `✅${found}`;
    percentFoundDiv.innerText = `${getPercentageFound()}%`;
  } else {
    input.value = '';
    addRemoveClass(inputWrapper, 'shake', 500, () => {
      input.focus();
    });
    nbFoundDiv.innerText = '❌';
  }
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    inputButton.click();
  } else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    const save = getSaveValue();

    if (save.length === 0) return;
    const currentInput = normalize(input.value);

    const currentIndex = save.indexOf(currentInput);

    if (e.key === 'ArrowUp') {
      if (currentIndex === -1) {
        input.value = save[save.length - 1];
      } else {
        input.value = save[(currentIndex - 1 + save.length) % save.length];
      }

    } else {
      if (currentIndex === -1) {
        input.value = save[0];
      } else {
        input.value = save[(currentIndex + 1) % save.length];
      }
    }
  } else if (e.key === 'Escape') {
    input.value = '';
  } else if (e.key === 'Backspace') {
    input.value = input.value.slice(0, -1);
  }

  input.focus();
});

async function init() {
  const text = (await apis[API]()).trim();
  log(text);

  input.focus();
  initTokens(text);
  initText();
}

await init();
loadSave();