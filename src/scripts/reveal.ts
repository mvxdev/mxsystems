/* =====================================================================
   Появление при прокрутке. IntersectionObserver — API браузера, который сообщает,
   когда элемент попал в зону видимости (экономнее, чем считать положение на каждую прокрутку).
   Элемент получает .is-in ОДИН раз и больше не отслеживается: при повторной прокрутке
   анимация не повторяется (это раздражает и мешает читать).
   ===================================================================== */
import { $$, REDUCE } from './util';

const items = $$('.reveal, .stagger');
if (items.length) {
  if (REDUCE || !('IntersectionObserver' in window)) {
    items.forEach((el) => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -8% 0px' });   // срабатывает, когда элемент поднялся на 8% над нижним краем
    items.forEach((el) => io.observe(el));
  }
}

// «Уменьшить движение» — ставим на паузу и SVG-анимации (точки на схеме первого экрана)
if (REDUCE) $$<SVGSVGElement>('svg').forEach((svg) => svg.pauseAnimations?.());
