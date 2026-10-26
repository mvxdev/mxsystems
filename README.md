# MX Systems — сайт mxsystems.md

Astro, статическая сборка. Тексты на трёх языках — `src/i18n/{ru,ro,en}.ts`.
Подробный отчёт — `docs/REPORT.md`, спорные решения — `DECISIONS.md`.

## Сборка и просмотр

```bash
npm install
npm run build      # сайт → dist/
npm run preview    # http://localhost:4321/
npm run seo        # SEO-проверка dist/ (код выхода ≠ 0 при ошибках)
npm run compare    # сверка текстов и ссылок со старой версией (тег v1-seo)
npm run lighthouse # замер Lighthouse ru/ro/en × телефон/десктоп
```

## Скриншоты и страница сравнения

Папка `docs/screens/` в git не хранится — её пересоздаёт одна команда (после `npm run build`):

```bash
npm run screens
```

Она снимает старую версию (тег `v1-seo`; при первом запуске сама распакует его в `.cache/v1`)
и новую (`dist/`) — ru/ro/en, десктоп 1440 и телефон 390 — и кладёт рядом страницу сравнения.
Откройте `docs/screens/compare.html` двойным щелчком. Исходники страницы — `tools/compare/`.
Нужен установленный Google Chrome (Playwright использует системный).
