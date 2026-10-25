/* =====================================================================
   early.js — крошечный скрипт, который подключается САМЫМ ПЕРВЫМ в <head> (без defer).
   Зачем отдельным файлом, а не прямо в HTML: политика безопасности (CSP, см. <meta> в <head>)
   разрешает только скрипты-файлы с нашего сайта. Встроенные в HTML скрипты она блокирует —
   это главная защита от внедрения чужого кода (XSS).
   Делает две вещи:
     1. Ставит на <html> класс .js — анимации появления включаются, только если JS работает
        (без JS весь контент виден сразу).
     2. Автоопределение языка: на русской главной (<html lang="ru" data-home>) при первом визите
        отправляет румыно- и англоязычных посетителей на /ro/ или /en/. Сохранение выбора
        в переключателе — src/scripts/lang.ts.
   Шрифты теперь лежат на самом сайте и подключаются обычным CSS — грузить их отсюда не нужно.
   Поведение автоопределения — 1-в-1 как в старой версии (v1-seo).
   ===================================================================== */
(function () {
  var html = document.documentElement;

  // 1. Метка «JavaScript работает»
  html.classList.add('js');

  // 2. Автоопределение языка — только на русской главной
  if (html.lang !== 'ru' || !html.hasAttribute('data-home')) return;
  try {
    if (localStorage.getItem('mx-lang')) return;          // посетитель уже выбирал язык сам
    // Поисковых роботов не перенаправляем: иначе робот с английским языком не увидел бы русскую страницу
    if (/bot|crawl|spider|slurp|facebookexternalhit|telegrambot|whatsapp|lighthouse|headless/i.test(navigator.userAgent)) return;
    var l = ((navigator.languages && navigator.languages[0]) || navigator.language || '').toLowerCase();
    if (l.indexOf('ro') === 0 || l.indexOf('mo') === 0) location.replace('ro/');
    else if (l.indexOf('en') === 0) location.replace('en/');
  } catch (e) { /* localStorage недоступен (приватный режим) — остаёмся на странице */ }
})();
