# Сверка содержимого v1-seo → новая версия

Скрипт: `python tools/compare_content.py .cache/v1 dist`.

Намеренно не сравниваются: cookie-баннер и кнопка «Настройки cookie» (не выводятся без ID GA4/Pixel)
и сноски первого экрана (переписаны) — см. DECISIONS.md, п. 33–34.

## Расхождения

- index.html: aria-label не найден: «Разбор задачи в Telegram»
- ro/index.html: aria-label не найден: «Analiza situației pe Telegram»
- en/index.html: aria-label не найден: «Project review on Telegram»
- privacy/index.html: aria-label не найден: «Меню»
- ro/privacy/index.html: aria-label не найден: «Meniu»
- en/privacy/index.html: aria-label не найден: «Menu»
