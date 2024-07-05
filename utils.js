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