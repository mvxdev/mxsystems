/* =====================================================================
   FAQ: плавное раскрытие ответа по высоте (Web Animations API, 300 мс).
   <details name="faq"> браузер и так держит открытым только один вопрос; здесь мы
   перехватываем клик, сами анимируем высоту и плавно закрываем открытого соседа.
   Без JS аккордеон работает как обычный <details> — просто без анимации.
   ===================================================================== */
import { $$, REDUCE } from './util';

const items = $$<HTMLDetailsElement>('details.qa');
const DUR = 300, EASE = 'cubic-bezier(0.2, 0.7, 0.2, 1)';

function animate(d: HTMLDetailsElement, open: boolean) {
  const body = d.querySelector<HTMLElement>('.qa-a');
  if (!body || REDUCE) { d.open = open; return; }
  if (open) {
    d.open = true;
    const h = body.scrollHeight;
    body.animate([{ height: '0px', opacity: 0 }, { height: h + 'px', opacity: 1 }], { duration: DUR, easing: EASE });
  } else {
    const h = body.scrollHeight;
    const a = body.animate([{ height: h + 'px', opacity: 1 }, { height: '0px', opacity: 0 }], { duration: DUR, easing: EASE });
    a.onfinish = () => { d.open = false; };
  }
}

items.forEach((d) => {
  d.querySelector('summary')?.addEventListener('click', (e) => {
    e.preventDefault();                                 // открытие/закрытие делаем сами
    const willOpen = !d.open;
    if (willOpen) items.forEach((o) => { if (o !== d && o.open) animate(o, false); });
    animate(d, willOpen);
  });
});
