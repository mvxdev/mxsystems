/* =====================================================================
   Счётчики: цифры в «Результатах» досчитываются от 0 до значения, когда плитка впервые
   появляется на экране. Разметка: <span class="count" data-to="40">40</span> — в HTML уже
   стоит итоговое число, поэтому без JS посетитель (и поисковик) видит правильные цифры.
   ===================================================================== */
import { $$, REDUCE } from './util';

const nums = $$('.count');
if (nums.length && !REDUCE && 'IntersectionObserver' in window) {
  const run = (el: HTMLElement) => {
    const to = Number(el.dataset.to);
    const dur = 1400;                                   // длительность, мс
    const t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);          // прогресс 0…1
      const eased = 1 - Math.pow(1 - p, 3);             // easeOutCubic: быстро в начале, плавно в конце
      el.textContent = String(Math.round(to * eased));
      if (p < 1) requestAnimationFrame(step);           // следующий кадр отрисовки
    };
    requestAnimationFrame(step);
  };
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    run(e.target as HTMLElement);
    io.unobserve(e.target);
  }), { threshold: 0.6 });                              // старт, когда видно 60% числа
  nums.forEach((el) => { el.textContent = '0'; io.observe(el); });
}
