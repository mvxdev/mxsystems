/* =====================================================================
   Шапка: (1) фон с размытием после прокрутки; (2) подсветка пункта меню той секции,
   которая сейчас на экране; (3) полноэкранное меню на телефоне.
   ===================================================================== */
import { $, $$ } from './util';

const header = $('#header');
if (header) {
  // 1. После прокрутки на 8px шапка получает фон и линию снизу (.is-scrolled).
  //    passive: true — обещаем не отменять прокрутку, браузер прокручивает плавнее
  const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 8);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 2. Активный пункт меню (scrollspy). Секция «текущая», когда пересекает полосу
  //    в верхней части экрана (rootMargin отрезает всё остальное)
  const links = $$<HTMLAnchorElement>('[data-spy]');
  if (links.length && 'IntersectionObserver' in window) {
    const byId = new Map(links.map((a) => [a.dataset.spy!, a]));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        const a = byId.get(e.target.id);
        if (!a) return;
        if (e.isIntersecting) { links.forEach((l) => l.classList.remove('is-active')); a.classList.add('is-active'); }
        else a.classList.remove('is-active');
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    byId.forEach((_a, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
  }

  // 3. Мобильное меню: бургер открывает и закрывает полноэкранную панель.
  //    Класс .nav-open ставим на <html>: там же он запрещает прокрутку страницы под меню
  const burger = $('#burger');
  if (burger) {
    const root = document.documentElement;
    const setOpen = (open: boolean) => {
      root.classList.toggle('nav-open', open);
      burger.setAttribute('aria-expanded', String(open));   // для скринридеров
    };
    burger.addEventListener('click', () => setOpen(!root.classList.contains('nav-open')));
    // Нажали на пункт меню или кнопку — закрываем (переход к разделу произойдёт сам)
    $$('#nav a').forEach((a) => a.addEventListener('click', () => setOpen(false)));
    addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
    // Расширили окно до десктопа — меню закрываем
    matchMedia('(min-width: 1000px)').addEventListener('change', (m) => { if (m.matches) setOpen(false); });
  }
}
