/* =====================================================================
   early.js — крошечный скрипт, который подключается САМЫМ ПЕРВЫМ в <head> (без defer).
   Зачем отдельным файлом, а не прямо в HTML: политика безопасности (CSP, см. <meta> в <head>)
   разрешает только скрипты-файлы с нашего сайта. Встроенные в HTML скрипты она блокирует —
   это главная защита от внедрения чужого кода (XSS).
   Делает три вещи:
     1. Ставит на <html> класс .js — стили анимаций включаются, только если JS работает.
     2. Подключает шрифты Google без блокировки отрисовки страницы.
     3. Автоопределение языка: на русской главной (<html lang="ru" data-home>) при первом визите
        отправляет румыно- и англоязычных посетителей на /ro/ или /en/. Сохранение выбора
        в переключателе — main.js, раздел 8.
   ===================================================================== */
(function () {
  var html = document.documentElement;

  // 1. Метка «JavaScript работает»
  html.classList.add('js');

  // 2. Шрифты: таблица стилей, добавленная скриптом, не задерживает первую отрисовку
  var fonts = document.createElement('link');
  fonts.rel = 'stylesheet';
  fonts.href = 'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Golos+Text:wght@400;500&family=JetBrains+Mono:wght@400;500&display=swap';
  document.head.appendChild(fonts);

  // 3. Автоопределение языка — только на русской главной
  if (html.lang !== 'ru' || !html.hasAttribute('data-home')) return;
  try {
    if (localStorage.getItem('mx-lang')) return;          // посетитель уже выбирал язык сам
    // Поисковых роботов не перенаправляем: иначе робот с английским языком не увидел бы русскую страницу
    if (/bot|crawl|spider|slurp|facebookexternalhit|telegrambot|whatsapp/i.test(navigator.userAgent)) return;
    var l = ((navigator.languages && navigator.languages[0]) || navigator.language || '').toLowerCase();
    if (l.indexOf('ro') === 0 || l.indexOf('mo') === 0) location.replace('ro/');
    else if (l.indexOf('en') === 0) location.replace('en/');
  } catch (e) { /* localStorage недоступен (приватный режим) — остаёмся на странице */ }
})();
