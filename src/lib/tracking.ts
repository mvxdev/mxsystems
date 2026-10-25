/* =====================================================================
   ID счётчиков: Google Analytics 4 и Meta Pixel. Один файл на весь сайт —
   его читают и сборка (показывать ли cookie-баннер и кнопку «Настройки cookie»),
   и скрипт согласия src/scripts/consent.ts.
   Пока стоят заглушки, баннер не показывается вовсе: спрашивать согласие не на что —
   сайт не ставит ни одного cookie, кроме необходимых. Впишите реальный ID — и баннер
   с кнопкой в подвале появятся сами при следующей сборке.
   ===================================================================== */

// [ЗАПОЛНИТЬ] ID Google Analytics 4 — вида G-XXXXXXXXXX (analytics.google.com → Администратор → Потоки данных).
export const GA_ID = 'G-XXXXXXXXXX';
// [ЗАПОЛНИТЬ] ID Meta Pixel — число из 15–16 цифр (business.facebook.com → Events Manager).
export const PIXEL_ID = '000000000000000';

export const HAS_GA = /^G-[A-Z0-9]+$/.test(GA_ID) && GA_ID !== 'G-XXXXXXXXXX';
export const HAS_PIXEL = /^\d{15,16}$/.test(PIXEL_ID) && !/^0+$/.test(PIXEL_ID);
/** Есть хотя бы один счётчик — нужен баннер согласия */
export const TRACKING = HAS_GA || HAS_PIXEL;
