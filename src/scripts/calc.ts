/* =====================================================================
   Калькулятор потерь: потери в месяц ≈ заявок × средний чек × доля потерянных.
   Сумма плавно «перетекает» к новому значению и сразу подставляется в текст сообщения
   для Telegram — человеку не нужно пересказывать цифры. Логика как в старой версии.
   ===================================================================== */
import { $, LANG, REDUCE } from './util';

const form = $<HTMLFormElement>('#calc-form');
if (form) {
  const leads = $<HTMLInputElement>('#calc-leads')!;
  const check = $<HTMLInputElement>('#calc-check')!;
  const pct = $<HTMLInputElement>('#calc-pct')!;
  const pctOut = $('#calc-pct-out')!, out = $('#calc-out')!, cta = $<HTMLAnchorElement>('#calc-cta')!;
  // Intl.NumberFormat — число по правилам языка: «4 500» (ru), «4.500» (ro), «4,500» (en)
  const nf = new Intl.NumberFormat({ ru: 'ru-RU', ro: 'ro-RO', en: 'en-US' }[LANG] || 'ru-RU', { maximumFractionDigits: 0 });
  const MSG = form.dataset.msg || '';                  // текст сообщения на языке страницы, {sum} → сумма
  const num = (el: HTMLInputElement) => Math.max(0, Number(el.value) || 0);   // пустое/отрицательное → 0
  const show = (v: number) => { out.textContent = '≈ €' + nf.format(v); };

  let shown = 0, raf = 0;
  // Плавный переход отображаемой суммы к новой (300 мс). Меняется только текст
  const animateTo = (target: number) => {
    cancelAnimationFrame(raf);
    if (REDUCE) { shown = target; show(target); return; }
    const from = shown, t0 = performance.now();
    const step = (now: number) => {
      const p = Math.min((now - t0) / 300, 1);
      shown = Math.round(from + (target - from) * (1 - Math.pow(1 - p, 3)));
      show(shown);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  };

  const update = (instant = false) => {
    const p = num(pct);
    const sum = Math.round(num(leads) * num(check) * p / 100);
    pctOut.textContent = p + '%';
    if (instant) { shown = sum; show(sum); } else animateTo(sum);
    // Заливка дорожки ползунка до ручки. style.setProperty — это CSSOM из файла-скрипта:
    // строгая CSP его разрешает (запрещены только style="…" в HTML)
    pct.style.setProperty('--p', ((p - Number(pct.min)) / (Number(pct.max) - Number(pct.min)) * 100) + '%');
    // encodeURIComponent — переводит текст в формат, допустимый внутри ссылки
    cta.href = 'https://t.me/mvxev?text=' + encodeURIComponent(MSG.replace('{sum}', nf.format(sum)));
  };
  form.addEventListener('input', () => update());        // одно событие на всю форму — от любого поля
  form.addEventListener('submit', (e) => e.preventDefault());   // Enter не перезагружает страницу
  update(true);
}
