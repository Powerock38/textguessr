import { addRemoveClass, log } from './utils.js';

const MIN_LETTERS_TO_REVEAL = 2;

async function loadWordList(file) {
  return await fetch(`words/${file}.txt`).then(res => res.text()).then(text => text.split(/\r?\n/));
}

const WORDLIST = new Set((await loadWordList('fr')).concat(await loadWordList('en')));
log(WORDLIST.size, "words loaded");

const TOKENS = [];

const textDiv = document.getElementById('text');

export function initTokens(text) {
  let currentWord = '';
  let currentPunctuation = '';

  for (const c of text) {
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

export function initText() {
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

// returns bool foundOne
export function sendInput(inputClean) {
  let foundOne = false;

  const words = inputClean.split('').map(c => c.toLowerCase() === c.toUpperCase() ? ' ' : c).join('').split(' ');

  for (const inputWord of words) {

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
              log("starting for", wordNormalized);
              started = true;
            }

            log(letterInput, "matches", letterWord);

            letterIndexesToReveal.push(i);

            letterInputIndex++;

            if (letterInputIndex === inputWord.length) {
              log("finished (end of input)");
              break;
            }
          } else if (started) {
            log(letterInput, "doesn't match", letterWord);
            break;
          }

          if (started && i === wordNormalized.length - 1) {
            log("finished (end of word)");
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
            log("discarding match", wordNormalized);
          }
        }
      }

      input.value = '';
      input.focus();
    } else {
      log("Word not found in wordlist:", inputWord);
    }
  }

  return foundOne;
}

export function normalize(text) {
  return text.normalize('NFKD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

const winDiv = document.getElementById('win');

export function checkWin() {
  let firstLineWords = [];
  let i = 0;
  while (i < TOKENS.length && !TOKENS[i].value.includes('\n\n')) {
    if (TOKENS[i].type === 'word') {
      firstLineWords.push(TOKENS[i]);
    }
    i++;
  }

  if (firstLineWords.every(word => word.correct)) {
    log("You win!");

    if (new URLSearchParams(window.location.search).has('funky')) {
      const emojis = ['🎉', '✨', '🥳', '🎊', '🍾', '🌟', '🎁', '🔥', '🍻', '🎶', '❤️'];
      for (let i = 0; i < 999; i++) {
        const t = document.createElement('span');
        t.innerText = emojis[Math.floor(Math.random() * emojis.length)]
        winDiv.appendChild(t);

        t.style.transition = `transform ${Math.random() * 2}s ease-in-out`;

        let p = 0;
        let interval = setInterval(() => {
          t.style.transform = `translate(${(Math.random() * 100 - 50) * p}vw, ${(Math.random() * 100 - 50) * p}vh) rotate(${(Math.random() * 360) * p}deg)`;
          p += 0.3 * Math.random();

          if (p >= 1) {
            clearInterval(interval);
            t.remove();
          }

        }, Math.random() * 1000);
      }
    }

    addRemoveClass(winDiv, 'win', 5000);
  }
}