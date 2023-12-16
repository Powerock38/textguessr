const WORDLIST = new Set(await fetch('mots.txt').then(res => res.text()).then(text => text.split('\n')));

const MIN_LETTERS_TO_REVEAL = 2;

const TEXT = await fetch('https://fr.wikipedia.org/w/api.php?action=query&prop=extracts&format=json&generator=random&grnnamespace=0&exintro&explaintext&origin=*')
  .then(res => res.json())
  .then(json => {
    const page = Object.values(json.query.pages)[0];
    return page.title + '\n\n' + page.extract;
  });

let TOKENS = [];

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
  }

  if (currentPunctuation !== '') {
    TOKENS.push({
      type: 'punctuation',
      value: currentPunctuation
    });
  }
}

function updateText() {
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

  if (WORDLIST.has(inputClean)) {

    for (const word of TOKENS.filter(token => token.type === 'word' && !token.correct)) {
      const wordNormalized = normalize(word.value);
      let letterIndexesToReveal = [];

      let started = false;
      let letterInputIndex = 0;

      for (let i = 0; i < wordNormalized.split('').length; i++) {
        const letterWord = wordNormalized[i];
        const letterInput = inputClean[letterInputIndex];

        if (letterInput === letterWord) {
          if (!started) {
            console.log("starting for", wordNormalized);
            started = true;
          }

          console.log(letterInput, "matches", letterWord);

          letterIndexesToReveal.push(i);

          letterInputIndex++;

          if (letterInputIndex === inputClean.length) {
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

      // Only reveal if at least {MIN_LETTERS_TO_REVEAL} letters are correct or if the word is fully correct
      if (started) {
        if (
          (letterIndexesToReveal.length === wordNormalized.length || letterIndexesToReveal.length >= MIN_LETTERS_TO_REVEAL)
          && inputClean.length <= letterIndexesToReveal.length + 2 // Prevent revealing short words with long inputs, with a small margin
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
  }

  if (!foundOne) {
    addRemoveClass(inputWrapper, 'shake', 500, () => {
      input.value = '';
      input.focus();
    });
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
  updateText();
}

init();