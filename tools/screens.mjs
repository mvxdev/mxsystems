// =====================================================================
// screens.mjs — скриншоты сайта для сравнения и арт-ревью (Playwright, Chrome без окна).
//   node tools/screens.mjs new        → docs/screens/new/  (папка dist/, новая версия)
//   node tools/screens.mjs old        → docs/screens/old/  (.cache/v1 — распакованный тег v1-seo;
//                                        если папки нет, скрипт сам распакует тег через git archive)
//   npm run screens                    → обе версии + страница сравнения docs/screens/compare.html
// Папка docs/screens/ в git не хранится (.gitignore): скриншоты пересоздаются этой командой.
// Исходники страницы сравнения — tools/compare/, они копируются в docs/screens/ при каждом запуске.
// Для каждого языка (ru/ro/en) и устройства (десктоп 1440, телефон 390):
//   {lang}-{device}.jpg        — вся страница целиком;
//   {lang}-{device}-first.jpg  — только первый экран (1440×900 / 390×844) с cookie-баннером.
// Анимации появления включены сразу: эмулируем «уменьшить движение» — сайт тогда
// показывает все блоки в конечном виде (иначе на снимке были бы пустые места).
// Попутно собирает ошибки консоли, нарушения CSP и горизонтальную прокрутку — в отчёт.
// =====================================================================
import { chromium } from 'playwright';
import { mkdir, writeFile, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { serve } from './serve.mjs';

const which = process.argv[2] || 'new';
const DIR = which === 'old' ? '.cache/v1' : 'dist';
const OUT = `docs/screens/${which}`;
const PORT = which === 'old' ? 4401 : 4402;
const DEVICES = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  mobile: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};
const PAGES = { ru: '/', ro: '/ro/', en: '/en/' };

await mkdir(OUT, { recursive: true });
// Старая версия: распаковать тег v1-seo в .cache/v1, если ещё не распакован
if (which === 'old' && !existsSync(`${DIR}/index.html`)) {
  await mkdir(DIR, { recursive: true });
  execSync(`git archive v1-seo | tar -x -C ${DIR}`, { stdio: 'inherit', shell: true });
}
// Страница сравнения (compare.html + стили и скрипт) — рядом с папками old/ и new/
for (const f of ['compare.html', 'compare.css', 'compare.js']) await copyFile(`tools/compare/${f}`, `docs/screens/${f}`);
const server = await serve(DIR, PORT);
// Системный Chrome — чтобы не скачивать отдельный браузер
const browser = await chromium.launch({ channel: 'chrome' });
const report = [];

for (const [dev, opts] of Object.entries(DEVICES)) {
  for (const [lang, path] of Object.entries(PAGES)) {
    for (const mode of ['full', 'first']) {
      const ctx = await browser.newContext({ ...opts, reducedMotion: mode === 'full' ? 'reduce' : 'no-preference', locale: 'ru-RU' });
      // Язык выбран (без автоперехода); для полного снимка — согласие уже дано, чтобы баннер не висел посреди страницы
      await ctx.addInitScript((m) => {
        localStorage.setItem('mx-lang', 'ru');
        if (m === 'full') localStorage.setItem('mx-consent', JSON.stringify({ a: false, m: false, t: 'x' }));
        else localStorage.removeItem('mx-consent');
      }, mode);
      const page = await ctx.newPage();
      const errors = [];
      page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
      page.on('pageerror', (e) => errors.push(String(e)));
      await page.goto(`http://127.0.0.1:${PORT}${path}`, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      if (mode === 'full') {
        // Прокручиваем страницу до конца, чтобы догрузились lazy-картинки
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
          window.scrollTo(0, 0);
        });
        await page.waitForTimeout(400);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        await page.screenshot({ path: `${OUT}/${lang}-${dev}.jpg`, fullPage: true, type: 'jpeg', quality: 78 });
        report.push({ lang, dev, overflow, errors });
      } else {
        await page.waitForTimeout(1200);
        await page.screenshot({ path: `${OUT}/${lang}-${dev}-first.jpg`, type: 'jpeg', quality: 82 });
      }
      await ctx.close();
    }
  }
}
await browser.close();
server.close();
await writeFile(`${OUT}/report.json`, JSON.stringify(report, null, 2));
for (const r of report) console.log(`${r.lang} ${r.dev}: горизонтальная прокрутка ${r.overflow}px, ошибок консоли ${r.errors.length}${r.errors.length ? ' → ' + r.errors.join(' | ') : ''}`);
