// =====================================================================
// lighthouse.mjs — Lighthouse (оценка Google: скорость, доступность, практики, SEO)
// для ru/ro/en, на телефоне и десктопе. Сайт отдаётся локальным сервером (tools/serve.mjs).
//   node tools/lighthouse.mjs dist        → новая версия
//   node tools/lighthouse.mjs .cache/v1   → старая версия (v1-seo)
// Итог печатается таблицей и сохраняется в docs/lighthouse-{new|old}.json.
// Сервер сжимает текст gzip, как GitHub Pages. Браузер запускается с русским языком (--lang=ru):
// иначе русская главная по замыслу перенаправила бы «англоязычный» Lighthouse на /en/,
// и замер шёл бы не той страницы.
// =====================================================================
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { writeFile } from 'node:fs/promises';
import { serve } from './serve.mjs';

const dir = process.argv[2] || 'dist';
const tag = dir.includes('v1') ? 'old' : 'new';
const PORT = 4430;
const server = await serve(dir, PORT);
const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new', '--no-sandbox', '--lang=ru'] });
const results = [];
// Разогрев: первый замер в только что запущенном Chrome всегда медленнее — его не считаем
await lighthouse(`http://127.0.0.1:${PORT}/`, { port: chrome.port, output: 'json', logLevel: 'error', onlyCategories: ['performance'] });

for (const form of ['mobile', 'desktop']) {
  for (const [lang, path] of [['ru', '/'], ['ro', '/ro/'], ['en', '/en/']]) {
    const config = form === 'desktop'
      ? { extends: 'lighthouse:default', settings: { formFactor: 'desktop', screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1, disabled: false }, throttling: { rttMs: 40, throughputKbps: 10240, cpuSlowdownMultiplier: 1 } } }
      : { extends: 'lighthouse:default' };
    const r = await lighthouse(`http://127.0.0.1:${PORT}${path}`, { port: chrome.port, output: 'json', logLevel: 'error' }, config);
    const c = r.lhr.categories;
    const row = {
      lang, form,
      performance: Math.round(c.performance.score * 100),
      accessibility: Math.round(c.accessibility.score * 100),
      bestPractices: Math.round(c['best-practices'].score * 100),
      seo: Math.round(c.seo.score * 100),
      lcp: r.lhr.audits['largest-contentful-paint'].displayValue,
      cls: r.lhr.audits['cumulative-layout-shift'].displayValue,
      tbt: r.lhr.audits['total-blocking-time'].displayValue,
      // Что Lighthouse посчитал проблемой (кроме «пройдено» и «не применимо»)
      failed: Object.values(r.lhr.audits).filter((a) => a.score !== null && a.score < 0.9 && a.scoreDisplayMode !== 'informative' && a.scoreDisplayMode !== 'manual').map((a) => a.id),
    };
    results.push(row);
    console.log(`${lang} ${form.padEnd(7)}  P ${row.performance}  A ${row.accessibility}  BP ${row.bestPractices}  SEO ${row.seo}   LCP ${row.lcp}  CLS ${row.cls}  TBT ${row.tbt}   ${row.failed.join(', ')}`);
  }
}
await chrome.kill();
server.close();
await writeFile(`docs/lighthouse-${tag}.json`, JSON.stringify(results, null, 2));
