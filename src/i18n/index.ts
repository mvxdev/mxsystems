/* =====================================================================
   i18n — всё, что связано с языками сайта.
   Три языка: русский живёт в корне «/», румынский — «/ro/», английский — «/en/».
   Здесь: словари текстов, адреса страниц на каждом языке и ссылки на мессенджеры.
   ===================================================================== */
import ru from './ru';
import ro from './ro';
import en from './en';

// Тип словаря выводится из русского файла: ro.ts и en.ts обязаны иметь ту же структуру
export type Dict = typeof ru;
export type Lang = 'ru' | 'ro' | 'en';

export const LANGS: Lang[] = ['ru', 'ro', 'en'];
export const DOMAIN = 'https://mxsystems.md';

const DICTS: Record<Lang, Dict> = { ru, ro, en };
export const t = (lang: Lang): Dict => DICTS[lang];

/** Префикс адреса языка: '' для русского (корень), '/ro', '/en' */
export const prefix = (lang: Lang) => (lang === 'ru' ? '' : `/${lang}`);

/** Путь страницы на нужном языке: path('ro', '/privacy/') → '/ro/privacy/' */
export const path = (lang: Lang, p = '/') => `${prefix(lang)}${p}`;

/** Полный адрес страницы: url('en', '/') → 'https://mxsystems.md/en/' */
export const url = (lang: Lang, p = '/') => DOMAIN + path(lang, p);

/** Код языка для Open Graph (превью ссылок в Facebook, Telegram и т. п.) */
export const OG_LOCALE: Record<Lang, string> = { ru: 'ru_RU', ro: 'ro_RO', en: 'en_US' };

/** Картинка-превью ссылки на языке страницы (1200×630, лежит в public/assets) */
export const ogImage = (lang: Lang) =>
  `${DOMAIN}/assets/${lang === 'ru' ? 'og-image.png' : `og-image-${lang}.png`}`;

// ---------- Контакты ----------
export const TELEGRAM = 'mvxev';
export const PHONE = '+373 69 589 555';
export const PHONE_RAW = '37369589555';
export const EMAIL = 'mvxrev@gmail.com';

/** Ссылка в Telegram с готовым текстом сообщения на языке страницы */
export const tgHref = (lang: Lang, text = t(lang).ui.tgText) =>
  `https://t.me/${TELEGRAM}?text=${encodeURIComponent(text)}`;
/** То же для WhatsApp */
export const waHref = (lang: Lang) => `https://wa.me/${PHONE_RAW}?text=${encodeURIComponent(t(lang).ui.tgText)}`;
export const telHref = `tel:+${PHONE_RAW}`;
export const mailHref = (lang: Lang) => `mailto:${EMAIL}?subject=${encodeURIComponent(t(lang).ui.mailSubject)}`;
