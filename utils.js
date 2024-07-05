export function log() {
  if (window.location.hostname.includes('localhost') || window.location.hostname.includes('0.0.0.0')) {
    console.log(...arguments);
  }
}

export function addRemoveClass(element, className, duration, callback) {
  element.classList.add(...className.split(' '))
  return setTimeout(() => {
    element.classList.remove(...className.split(' '))
    if (callback) callback()
  }, duration)
}

export function seededRandom(dateISO) {
  var x = Math.sin(new Date(dateISO).getTime()) * 10000;
  return x - Math.floor(x);
}

export function random(dateISO, min, max) {
  return Math.floor(seededRandom(dateISO) * (max - min + 1)) + min;
}

export function randomChoice(dateISO, array) {
  return array[random(dateISO, 0, array.length - 1)];
}