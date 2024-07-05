import apis from './apis.js';
import { loadSave, save } from './save.js';
import { addRemoveClass, log } from './utils.js';
import { initTokens, initText, normalize, sendInput, checkWin } from './game.js';

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

inputButton.onclick = () => {
  const inputClean = normalize(input.value);
  const foundOne = sendInput(inputClean);

  if (foundOne) {
    save(inputClean);
    checkWin();
  } else {
    input.value = '';
    addRemoveClass(inputWrapper, 'shake', 500, () => {
      input.focus();
    });
  }
}

input.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    inputButton.click();
  }
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