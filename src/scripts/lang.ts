/* =====================================================================
   Язык: выбор в переключателе RU / RO / EN запоминаем в localStorage (хранилище браузера),
   чтобы автоопределение языка (public/assets/js/early.js) больше не перебивало решение
   посетителя. Само перенаправление по языку браузера — в early.js, оно срабатывает раньше.
   ===================================================================== */
import { $$ } from './util';

const KEY = 'mx-lang';
const set = (v: string) => { try { localStorage.setItem(KEY, v); } catch { /* приватный режим — не страшно */ } };
$$<HTMLAnchorElement>('.lang a[data-lang]').forEach((a) => a.addEventListener('click', () => set(a.dataset.lang!)));
