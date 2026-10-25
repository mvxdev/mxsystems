/* Общие мелкие помощники для скриптов сайта */

// prefers-reduced-motion — системная настройка «уменьшить движение». Если включена — без анимаций
export const REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Язык текущей страницы — из <html lang="…">
export const LANG = (document.documentElement.lang || 'ru') as 'ru' | 'ro' | 'en';

// Найти элемент / все элементы по CSS-селектору (как $ в jQuery, но без библиотеки)
export const $ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel);
export const $$ = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document) => [...root.querySelectorAll<T>(sel)];

/** Запускать демо-анимацию, только пока блок виден на экране — не тратим батарею зря */
export function whileVisible(el: Element, start: () => void, stop: () => void) {
  if (!('IntersectionObserver' in window)) { start(); return; }
  new IntersectionObserver(([e]) => (e.isIntersecting ? start() : stop())).observe(el);
}

/** FLIP-анимация (First, Last, Invert, Play) — плавное перемещение элементов при изменении DOM:
 *  1) запоминаем, где элементы были; 2) меняем DOM (элементы «прыгают» на новые места);
 *  3) мгновенно сдвигаем их transform'ом обратно; 4) плавно убираем сдвиг. Только transform. */
export function flip(elements: Element[], mutate: () => void) {
  const first = new Map(elements.map((el) => [el, el.getBoundingClientRect()]));
  mutate();
  first.forEach((r, el) => {
    if (!el.isConnected) return;
    const r2 = el.getBoundingClientRect();
    const dx = r.left - r2.left, dy = r.top - r2.top;
    if (!dx && !dy) return;
    el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
      { duration: 700, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' });
  });
}
