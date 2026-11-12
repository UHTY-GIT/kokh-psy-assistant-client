// utils/loginRedirect.js
// Повернення на ту саму сторінку після входу. Коли токен закінчився (сторінка викидає на логін)
// або сторінку відкрили без входу, роутер додає до /login параметр ?redirect=<шлях>,
// а сторінка входу після успішного входу повертає користувача туди.

const RETURN_KEY = 'login-return';
// якщо сторінка, на яку щойно повернули, за цей час знову викидає на логін — вдруге на неї не повертаємо
const LOOP_WINDOW_MS = 20000;

// Лише внутрішній шлях сайту: «/clients/5», не «//інший-сайт», не «/\інший-сайт» і не сама сторінка входу.
export function safeRedirect(value) {
  const path = Array.isArray(value) ? value[0] : value;
  if (typeof path !== 'string' || !path.startsWith('/')) return null;
  if (path.startsWith('//') || path.startsWith('/\\')) return null;
  if (/^\/login(?:[/?#]|$)/.test(path)) return null;
  return path;
}

// Запам'ятати, на яку сторінку щойно повернули після входу.
export function rememberReturn(path) {
  try {
    sessionStorage.setItem(RETURN_KEY, JSON.stringify({ path, at: Date.now() }));
  } catch (e) {
    // без sessionStorage просто немає захисту від повторного повернення
  }
}

// Чи на цю сторінку повернули щойно після входу. Якщо вона одразу ж знову викидає на логін
// (наприклад, увійшов інший акаунт, якому ця сторінка недоступна), вхід не має ходити по колу.
export function returnedJustNow(path) {
  try {
    const saved = JSON.parse(sessionStorage.getItem(RETURN_KEY) || 'null');
    return Boolean(saved) && saved.path === path && Date.now() - saved.at < LOOP_WINDOW_MS;
  } catch (e) {
    return false;
  }
}
