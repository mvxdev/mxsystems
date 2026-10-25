// =====================================================================
// review-shots.mjs — «нарезка» страницы на кадры для арт-ревью (docs/design-review.md).
// Полный скриншот длинной страницы при просмотре сжимается до нечитаемого, поэтому
// здесь страница снимается кусками высотой в экран-полтора.
//   node tools/review-shots.mjs [dist|.cache/v1] [ru|ro|en] [desktop|mobile]
// Кадры — в .cache/review/ (в git не попадают).
// =====================================================================
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { serve } from './serve.mjs';

const [dir = 'dist', lang = 'ru', dev = 'desktop'] = process.argv.slice(2);
const path = { ru: '/', ro: '/ro/', en: '/en/' }[lang];
const vp = dev === 'mobile' ? { width: 390, height: 844 } : { width: 1440, height: 900 };
const H = dev === 'mobile' ? 1400 : 1300;   // высота кадра
const out = `.cache/review`;
await mkdir(out, { recursive: true });
const server = await serve(dir, 4410);
const browser = await chromium.launch({ channel: 'chrome' });
const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1, reducedMotion: 'reduce', isMobile: dev === 'mobile' });
await ctx.addInitScript(() => { localStorage.setItem('mx-lang', 'ru'); localStorage.setItem('mx-consent', '{"a":false,"m":false}'); });
const page = await ctx.newPage();
await page.goto(`http://127.0.0.1:4410${path}`, { waitUntil: 'networkidle' });
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 50)); }
  scrollTo(0, 0);
});
await page.waitForTimeout(300);
const total = await page.evaluate(() => document.documentElement.scrollHeight);
const tag = dir.includes('v1') ? 'old' : 'new';
let i = 0;
for (let y = 0; y < total; y += H, i++) {
  await page.screenshot({ path: `${out}/${tag}-${lang}-${dev}-${String(i).padStart(2, '0')}.jpg`, type: 'jpeg', quality: 80, fullPage: true,
    clip: { x: 0, y, width: vp.width, height: Math.min(H, total - y) } });
}
console.log(`${tag} ${lang} ${dev}: высота ${total}px, кадров ${i}`);
await browser.close();
server.close();
