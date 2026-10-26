/* =====================================================================
   JSON-LD — «структурированные данные» по стандарту schema.org для главных страниц.
   Та же информация, что видна на странице (кто мы, где, контакты, услуги с ценами, FAQ),
   но в виде, понятном поисковику. Собирается из тех же словарей src/i18n/*.ts, что и сама
   страница, — поэтому разметка всегда дословно совпадает с видимым текстом.
   Чего нет на сайте (улица, часы работы, рейтинги, отзывы), того нет и в разметке.
   Логика 1-в-1 как в старой версии (tools/build_i18n.py, тег v1-seo).
   ===================================================================== */
import { DOMAIN, EMAIL, PHONE, TELEGRAM, ogImage, t, url, type Lang } from '../i18n';

const ORG: Record<Lang, { city: string; founder: string; role: string; areas: string[]; catalog: string }> = {
  ru: { city: 'Кишинёв', founder: 'Максим Лазарев', role: 'Основатель', areas: ['Молдова', 'Румыния'], catalog: 'Услуги' },
  ro: { city: 'Chișinău', founder: 'Maxim Lazarev', role: 'Fondator', areas: ['Moldova', 'România'], catalog: 'Servicii' },
  en: { city: 'Chișinău', founder: 'Maxim Lazarev', role: 'Founder', areas: ['Moldova', 'Romania'], catalog: 'Services' },
};

/** HTML → чистый текст (для разметки теги не нужны) */
const plain = (html: string) =>
  html.replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ').trim();

/** Строка цены с сайта («от €1 500», «+ from €250/mo», «€300») → PriceSpecification */
function price(piece: string) {
  const text = plain(piece);
  const amount = (text.match(/€\s*([\d.,  ]+)/)?.[1] ?? '').replace(/\D/g, '');
  const spec: Record<string, string> = { '@type': 'PriceSpecification', name: text.replace(/^\+\s*/, ''), priceCurrency: 'EUR' };
  // «от / de la / from» — нижняя граница (minPrice), иначе точная цена (price)
  if (/(^|\s)(от|de la|from)\s/u.test(text)) spec.minPrice = amount;
  else spec.price = amount;
  // «/мес», «/lună», «/mo» — ежемесячная оплата: единица «месяц» (код MON)
  if (/\/(мес|lună|mo)(?![\p{L}])/u.test(text)) {
    spec['@type'] = 'UnitPriceSpecification';
    spec.unitCode = 'MON';
    spec.billingDuration = 'P1M';
  }
  return spec;
}

export function homeJsonLd(lang: Lang) {
  const d = t(lang);
  const o = ORG[lang];
  const page = url(lang, '/');
  const areas = o.areas.map((name) => ({ '@type': 'Country', name }));

  const offers = d.services.items.map((s) => {
    const prices = s.price.map(price);
    return {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      priceSpecification: prices.length > 1 ? prices : prices[0],
      itemOffered: {
        '@type': 'Service', name: plain(s.name), description: plain(s.desc),
        provider: { '@id': DOMAIN + '/#org' }, areaServed: areas,
      },
    };
  });

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'ProfessionalService',
      '@id': DOMAIN + '/#org',
      name: 'MX Systems',
      url: page,
      description: d.meta.description,
      logo: DOMAIN + '/assets/apple-touch-icon.png',
      image: ogImage(lang),
      telephone: PHONE,
      email: EMAIL,
      address: { '@type': 'PostalAddress', addressLocality: o.city, addressCountry: 'MD' },
      areaServed: areas,
      knowsLanguage: ['ru', 'ro', 'en'],
      sameAs: [`https://t.me/${TELEGRAM}`],
      founder: { '@type': 'Person', name: o.founder, jobTitle: o.role },
      hasOfferCatalog: { '@type': 'OfferCatalog', name: o.catalog, itemListElement: offers },
    },
    { '@type': 'WebSite', '@id': page + '#website', name: 'MX Systems', url: page, inLanguage: lang, publisher: { '@id': DOMAIN + '/#org' } },
    {
      '@type': 'FAQPage', '@id': page + '#faq', inLanguage: lang,
      mainEntity: d.faq.items.map((f) => ({ '@type': 'Question', name: plain(f.q), acceptedAnswer: { '@type': 'Answer', text: plain(f.a) } })),
    },
  ];
  // «</» внутри текста не должно закрыть блок <script> раньше времени
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2).replace(/<\//g, '<\\/');
}
