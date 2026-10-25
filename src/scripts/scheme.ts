/* =====================================================================
   Схема первого экрана (src/components/Scheme.astro): анимация идёт, только пока схема видна.
   SVG-анимации (точки, кольца, свечение) ставятся на паузу методом pauseAnimations(),
   CSS-«дыхание» ядра — классом .is-paused. Вне экрана схема не тратит ни кадра.
   «Уменьшить движение» — схема статична: время анимаций сбрасывается в 0,
   а в момент 0 все точки и кольца прозрачные — остаётся рисунок, как без анимации.
   ===================================================================== */
import { $, REDUCE, whileVisible } from './util';

const fig = $('.hero .fig');
const svg = fig?.querySelector('svg');
if (fig && svg) {
  const pause = () => { svg.pauseAnimations(); fig.classList.add('is-paused'); };
  const play = () => { svg.unpauseAnimations(); fig.classList.remove('is-paused'); };
  pause();
  if (REDUCE) svg.setCurrentTime(0);
  else whileVisible(fig, play, pause);
}
