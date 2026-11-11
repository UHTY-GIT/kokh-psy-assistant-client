// Розтягування textarea по висоті за власний тримач (рисочки по центру знизу поля).
// Працює для всіх textarea у полях CRM — мишею, пальцем і стилусом; системний кутик вимкнено в CSS.
// Підключається один раз у main.js: installTextareaResize().

const SELECTOR = '.container-input textarea, .container-input_froms_user textarea, textarea[data-resizable]';
const GRIP_ZONE = 22; // висота зони тримача від нижнього краю, px

let drag = null;
let hovered = null;

const isResizable = (el) => el && el.tagName === 'TEXTAREA' && el.matches(SELECTOR) && !el.disabled;

function inGrip(el, event) {
  const rect = el.getBoundingClientRect();
  return event.clientY >= rect.bottom - GRIP_ZONE && event.clientY <= rect.bottom + 2
      && event.clientX >= rect.left && event.clientX <= rect.right;
}

function setHover(el) {
  if (hovered && hovered !== el) {
    hovered.classList.remove('is-grip-hover');
    hovered.style.cursor = '';
  }
  hovered = el;
  if (el) {
    el.classList.add('is-grip-hover');
    el.style.cursor = 'ns-resize';
  }
}

function onPointerMove(event) {
  if (drag) {
    const height = Math.max(drag.minHeight, drag.startHeight + event.clientY - drag.startY);
    drag.el.style.height = `${Math.round(height)}px`;
    event.preventDefault();
    return;
  }
  if (event.pointerType !== 'mouse') return;
  const el = event.target;
  setHover(isResizable(el) && inGrip(el, event) ? el : null);
}

function onPointerDown(event) {
  const el = event.target;
  if (!isResizable(el) || !inGrip(el, event)) return;
  event.preventDefault(); // не ставимо курсор у текст і не виділяємо
  const style = getComputedStyle(el);
  drag = {
    el,
    pointerId: event.pointerId,
    startY: event.clientY,
    startHeight: el.getBoundingClientRect().height,
    minHeight: parseFloat(style.minHeight) || 54,
  };
  el.classList.add('is-resizing');
  document.documentElement.style.cursor = 'ns-resize';
  if (el.setPointerCapture) el.setPointerCapture(event.pointerId);
}

function endDrag() {
  if (!drag) return;
  drag.el.classList.remove('is-resizing');
  if (drag.el.releasePointerCapture && drag.el.hasPointerCapture && drag.el.hasPointerCapture(drag.pointerId)) {
    drag.el.releasePointerCapture(drag.pointerId);
  }
  document.documentElement.style.cursor = '';
  drag = null;
}

// на дотик: поки тягнемо, сторінка не прокручується
function onTouchMove(event) {
  if (drag) event.preventDefault();
}

let installed = false;

export function installTextareaResize() {
  if (installed || typeof document === 'undefined') return;
  installed = true;
  document.addEventListener('pointerdown', onPointerDown, { passive: false });
  document.addEventListener('pointermove', onPointerMove, { passive: false });
  document.addEventListener('pointerup', endDrag);
  document.addEventListener('pointercancel', endDrag);
  document.addEventListener('touchmove', onTouchMove, { passive: false });
}
