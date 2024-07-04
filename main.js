import apis from './apis.js';

const MIN_LETTERS_TO_REVEAL = 2;

const queryParams = new URLSearchParams(window.location.search);

// API selection
const DEFAULT_API = 'wikipedia';
const API = queryParams.get("api") ?? DEFAULT_API;
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
const DATE = queryParams.get("date") ?? DEFAULT_DATE;
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

// Text
const TEXT = (await apis[API](DATE)).trim();

console.log(TEXT);

async function loadWordList(file) {
  return await fetch(`words/${file}.txt`).then(res => res.text()).then(text => text.split(/\r?\n/));
}

const WORDLIST = new Set((await loadWordList('fr')).concat(await loadWordList('en')));

console.log(WORDLIST.size, "words loaded");

const TOKENS = [];

const textDiv = document.getElementById('text');

function initTokens() {
  let currentWord = '';
  let currentPunctuation = '';

  for (const c of TEXT) {
    if (c.toLowerCase() === c.toUpperCase()) { // only punctuation passes this test
      currentPunctuation += c;
      if (currentWord !== '') {
        TOKENS.push({
          type: 'word',
          value: currentWord
        });
        WORDLIST.add(normalize(currentWord)); // Make sure the word is in the wordlist
        currentWord = '';
      }
    } else {
      currentWord += c;
      if (currentPunctuation !== '') {
        TOKENS.push({
          type: 'punctuation',
          value: currentPunctuation
        });
        currentPunctuation = '';
      }
    }
  }

  if (currentWord !== '') {
    TOKENS.push({
      type: 'word',
      value: currentWord
    });
    WORDLIST.add(normalize(currentWord)); // Make sure the word is in the wordlist
  }

  if (currentPunctuation !== '') {
    TOKENS.push({
      type: 'punctuation',
      value: currentPunctuation
    });
  }
}

function initText() {
  textDiv.innerHTML = '';

  for (const token of TOKENS) {
    const tokenElement = document.createElement('span');

    if (token.type === 'punctuation') {
      tokenElement.classList.add('punctuation');
      tokenElement.innerText = token.value;
    } else {
      tokenElement.classList.add('word');
      for (const _ of token.value.split('')) {
        const letterElement = document.createElement('span');
        letterElement.classList.add('letter');
        letterElement.innerText = '█';
        tokenElement.appendChild(letterElement);
      }
    }

    token.element = tokenElement;
    textDiv.appendChild(tokenElement);
  }
}

function normalize(text) {
  return text.normalize('NFKD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function addRemoveClass(element, className, duration, callback) {
  element.classList.add(...className.split(' '))
  return setTimeout(() => {
    element.classList.remove(...className.split(' '))
    if (callback) callback()
  }, duration)
}

const inputWrapper = document.getElementById('input-wrapper');
const input = document.getElementById('input');
const inputButton = document.getElementById('input-button');

inputButton.onclick = () => {
  const inputClean = normalize(input.value);

  let foundOne = false;

  for (const inputWord of inputClean.split(' ')) {

    if (WORDLIST.has(inputWord)) {

      for (const word of TOKENS.filter(token => token.type === 'word' && !token.correct)) {
        const wordNormalized = normalize(word.value);
        let letterIndexesToReveal = [];

        let started = false;
        let letterInputIndex = 0;

        for (let i = 0; i < wordNormalized.split('').length; i++) {
          const letterWord = wordNormalized[i];
          const letterInput = inputWord[letterInputIndex];

          if (letterInput === letterWord) {
            if (!started) {
              console.log("starting for", wordNormalized);
              started = true;
            }

            console.log(letterInput, "matches", letterWord);

            letterIndexesToReveal.push(i);

            letterInputIndex++;

            if (letterInputIndex === inputWord.length) {
              console.log("finished (end of input)");
              break;
            }
          } else if (started) {
            console.log(letterInput, "doesn't match", letterWord);
            break;
          }

          if (started && i === wordNormalized.length - 1) {
            console.log("finished (end of word)");
          }
        }

        if (started) {
          if (
            (letterIndexesToReveal.length === wordNormalized.length || letterIndexesToReveal.length >= MIN_LETTERS_TO_REVEAL) // Reveal fully correct words or words with at least {MIN_LETTERS_TO_REVEAL} letters correct
            && inputWord.length <= letterIndexesToReveal.length + 2 // Prevent revealing short words with long inputs, with a small margin
          ) {
            for (const i of letterIndexesToReveal) {
              if (!foundOne) {
                // Clear latest-guess classes before adding new ones
                for (const letterElement of document.querySelectorAll('.latest-guess')) {
                  letterElement.classList.remove('latest-guess');
                }
              }

              word.element.children[i].innerText = word.value[i];
              word.element.children[i].classList.add('correct', 'latest-guess');
              foundOne = true;
            }

            // Mark if word is fully revealed
            if ([...word.element.children].every(letterElement => letterElement.classList.contains('correct'))) {
              word.correct = true;
              for (const letterElement of word.element.children) {
                letterElement.classList.remove('letter', 'correct');
              }
            }
          } else {
            console.log("discarding match", wordNormalized);
          }
        }
      }

      input.value = '';
      input.focus();
    } else {
      console.log("Word not found in wordlist:", inputWord);
    }
  }

  if (foundOne) {
    checkWin();
  } else {
    addRemoveClass(inputWrapper, 'shake', 500, () => {
      input.value = '';
      input.focus();
    });
  }
}

function checkWin() {
  let firstLineWords = [];
  let i = 0;
  while (i < TOKENS.length && !TOKENS[i].value.includes('\n\n')) {
    if (TOKENS[i].type === 'word') {
      firstLineWords.push(TOKENS[i]);
    }
    i++;
  }

  if (firstLineWords.every(word => word.correct)) {
    console.log("You win!");
  }
}

input.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    inputButton.click();
  }
});

function init() {
  input.focus();
  initTokens();
  initText();
}

init();

console.log(TOKENS);