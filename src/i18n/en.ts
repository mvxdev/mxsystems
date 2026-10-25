/* =====================================================================
   Тексты сайта — английская версия (/en/).
   ЭТО ИСТОЧНИК ТЕКСТОВ: правьте фразы, цифры и цены здесь, затем пересоберите сайт (npm run build).
   Структура одинаковая у ru.ts, ro.ts и en.ts: тип Dict выводится из ru.ts (src/i18n/index.ts),
   и если в ro/en пропущено поле — сборка сообщит об ошибке.
   Строки могут содержать простой HTML: <em> — курсивный оранжевый акцент в заголовках,
   <b> — жирное начало пункта, <a class="link"> — ссылка. Неразрывные пробелы и типографику
   расставляет функция typo() из src/i18n/typo.ts при сборке — здесь их писать не нужно.
   Первоначально перенесено скриптом tools/extract_i18n.py из версии v1-seo (без правок текста).
   ===================================================================== */
import type { Dict } from './index';

const dict: Dict = {
  "meta": {
    "title": "Websites, CRM & Business Automation, Moldova — MX Systems",
    "description": "Websites and CRM in Chișinău, business automation and 1C integration, Google and Meta ads for companies in Moldova and Romania. 30-minute project review.",
    "ogTitle": "MX Systems — we bring in customers and build a system where no lead gets lost",
    "ogDescription": "Ads, websites and automation — the whole customer journey, from first click to payment. Works with 1C, messengers and email."
  },
  "ui": {
    "logoAria": "MX Systems — home",
    "navAria": "Sections",
    "nav": [
      {
        "href": "#cases",
        "label": "Projects"
      },
      {
        "href": "#services",
        "label": "Services"
      },
      {
        "href": "#process",
        "label": "How we work"
      },
      {
        "href": "#contact",
        "label": "Contact"
      }
    ],
    "langAria": "Language",
    "ctaAria": "Project review on Telegram",
    "ctaLabel": "Project review · 30 min",
    "burgerAria": "Menu",
    "tgText": "Hi! I saw the MX Systems website and would like to book a 30-minute project review.",
    "mailSubject": "Project review"
  },
  "masthead": [
    "Development · automation · ads",
    "Chișinău · Moldova",
    "since 2019"
  ],
  "hero": {
    "h1Prefix": "MX Systems",
    "h1": "We bring in customers and build a system <em>where no lead gets lost</em>",
    "figAria": "Diagram: leads from ads, accounting and email flow into the system; the team, customers and owner get the result",
    "inputs": [
      {
        "t": "ADS",
        "s": "customer leads"
      },
      {
        "t": "ACCOUNTING",
        "s": "stock levels"
      },
      {
        "t": "EMAIL",
        "s": "inbox, orders"
      }
    ],
    "coreSub": "matches · tracks · reminds",
    "outputs": [
      {
        "t": "TEAM",
        "s": "notifications"
      },
      {
        "t": "CUSTOMERS",
        "s": "“order ready”"
      },
      {
        "t": "OWNER",
        "s": "summary 08:00"
      }
    ],
    "figcaption": "Data moves on its own — people get the finished result.",
    "lead": "We set up ads, build websites and automate routine work — the whole customer journey, from first click to payment. We plug into 1C, messengers and email, and stay with you after launch.",
    "cta": "30-minute project review",
    "ctaSub": "on Telegram — no strings attached",
    "cta2": "See the projects",
    "notesAria": "Systems in daily use",
    "notes": [
      {
        "href": "#case-fastload",
        "k": "Logistics · USA",
        "text": "System in daily use"
      },
      {
        "href": "#case-4power",
        "k": "Car service · Chișinău",
        "text": "System in daily use"
      }
    ]
  },
  "cases": {
    "eyebrow": "Projects",
    "title": "Systems that <em>run every single day</em>",
    "intro": "Client implementations and platforms — all in daily use. The interfaces below are simplified copies with demo data.",
    "groupImpl": "Implementations",
    "order": [
      "fastload",
      "4power"
    ]
  },
  "case4power": {
    "no": "Case 02",
    "badge": "In production",
    "title": "Website and CRM for the <em>4Power Club</em> workshop",
    "meta": [
      {
        "dt": "Client",
        "dd": "4Power Club"
      },
      {
        "dt": "Industry",
        "dd": "Car service · Chișinău"
      },
      {
        "dt": "Website",
        "dd": "<a class=\"link\" href=\"https://4power.club\" rel=\"noopener\" target=\"_blank\">4power.club ↗</a>"
      },
      {
        "dt": "Team",
        "dd": "7 bays, technicians, 4 service advisors, warehouse"
      }
    ],
    "taskH": "The problem",
    "task": "Information got lost between people: an advisor didn't learn a car was ready if a colleague had checked it in; cars waiting 2–3 weeks for ordered parts were forgotten; the warehouse received parts but told no one; parts ordered for a car that wasn't on site lost their link to it; customers were told their car was ready by hand. Parts were tracked in 1C.",
    "doneH": "What we built",
    "done": [
      "<b>The workshop’s website</b> <a class=\"link\" href=\"https://4power.club\" rel=\"noopener\" target=\"_blank\">4power.club ↗</a> — in Romanian and Russian: services, repair booking, and Google markup so the workshop shows up in search and on maps.",
      "<b>A layer on top of 1C.</b> 1C stays the accounting system; this one runs the process: car statuses, who is responsible, the “part ↔ car” link, notifications.",
      "<b>Real-time car board</b> — by day and by status column; urgent cars are highlighted, and you can see how many days each one has been waiting.",
      "<b>Parts tracked through the full cycle</b> “car waiting → ordered → in stock → fitted”, plus a separate tab for parts that arrived without a linked car.",
      "<b>1C link</b> — work orders and warehouse receipts come in from 1C on their own, no double entry; a repeated receipt never duplicates a part.",
      "<b>“Shop floor screen”</b> — a shared monitor for the mechanics, nothing to install.",
      "<b>Thresholds and working hours</b> — the system raises the alarm by itself when a car or a part is stuck longer than it should be.",
      "<b>Messages to customers on behalf of the workshop</b> — “your car is ready” and the work order go out automatically once 1C closes the order, with the responsible advisor’s phone number.",
      "<b>Appointment SMS</b> — the customer gets when and where to come; rescheduling, cancellation and a reminder the day before — in Romanian or Russian.",
      "<b>Telegram bot for staff</b> — notifications with buttons right in the message and the work order as a PDF reply.",
      "<b>Appointment calendar</b> as a single queue per day, plus a “Book for repair” button once all parts have arrived.",
      "<b>Foreman screen on the phone</b> and a test-drive mark: whoever hands over the keys sees whether the car was test-driven.",
      "<b>A daily summary for the owner.</b>",
      "<b>Search</b> by plate number, VIN, phone, surname or work order number; staff roles and access rights."
    ],
    "uiSr": "Simplified mockup of the 4Power Club car board with demo data: columns “Waiting for repair”, “Waiting for parts”, “Ready”.",
    "resultH": "Results",
    "kpis": [
      {
        "value": "<span class=\"count\" data-to=\"886\">886</span>",
        "label": "automated checks, all passing",
        "acc": true
      },
      {
        "value": "<span class=\"count\" data-to=\"7\">7</span>",
        "label": "bays in one system",
        "acc": false
      },
      {
        "value": "<span class=\"count\" data-to=\"4\">4</span>",
        "label": "advisors see the same picture",
        "acc": false
      },
      {
        "value": "1C",
        "label": "warehouse sync",
        "acc": false
      }
    ],
    "results": [
      "Live — the whole team works in one system.",
      "Fewer calls and chats along the lines of “is the car ready? / did the part arrive?” — the status is visible, not something you have to chase.",
      "No car gets forgotten while waiting for parts — the system sends reminders on its own.",
      "886 automated checks — all passing. They run against the real database and the real server, no mocks: the whole path is checked — login, permissions, request, write, response.",
      "Under the hood: 68 API endpoints, 17 tables, 8 screens; one line of tests for every 4 lines of code."
    ],
    "stackLabel": "Stack",
    "stack": [
      "Node.js",
      "PostgreSQL",
      "Vue 3 PWA",
      "1C (REST API)",
      "SSE (real-time updates)",
      "Telegram",
      "WhatsApp Business",
      "website: Astro, Tailwind"
    ],
    "ui": {
      "bar": "4Power · car board",
      "demo": "demo",
      "sub": [
        "Today",
        "7 bays",
        "stock · 1C sync"
      ],
      "cols": [
        {
          "key": "wait",
          "title": "Waiting for repair",
          "cars": [
            {
              "name": "Toyota RAV4",
              "status": "bay 3 · 1 day",
              "cls": "",
              "moving": false
            },
            {
              "name": "Kia Sportage",
              "status": "bay 5 · today",
              "cls": "",
              "moving": false
            }
          ]
        },
        {
          "key": "parts",
          "title": "Waiting for parts",
          "cars": [
            {
              "name": "Audi Q5",
              "status": "ordered · 9 days",
              "cls": "",
              "moving": true
            },
            {
              "name": "BMW M3",
              "status": "waiting 16 days · urgent",
              "cls": "is-urgent",
              "moving": false
            }
          ]
        },
        {
          "key": "ready",
          "title": "Ready",
          "cars": [
            {
              "name": "VW Passat",
              "status": "customer notified",
              "cls": "is-done",
              "moving": false
            }
          ]
        }
      ],
      "labels": [
        "ordered · 9 days",
        "part in stock",
        "customer notified"
      ],
      "toast": "✓ Customer got a WhatsApp message"
    }
  },
  "caseFastload": {
    "no": "Case 01",
    "badge": "In production",
    "title": "FastLoad — a platform for the <em>MIRTEH GRUP</em> dispatch team",
    "meta": [
      {
        "dt": "Client",
        "dd": "MIRTEH GRUP"
      },
      {
        "dt": "Industry",
        "dd": "Logistics · USA"
      },
      {
        "dt": "Team",
        "dd": "17 dispatchers, 98 drivers"
      }
    ],
    "taskH": "The problem",
    "task": "Dispatchers watched the Sylectus load board by hand (a US marketplace where brokers post freight): refreshing the page, checking every load against each driver's location and truck type, and writing bids to brokers manually. Good loads are gone within minutes, and anything posted outside working hours was simply lost.",
    "doneH": "What we built",
    "done": [
      "<b>24/7 load board monitoring.</b> The system pulls new loads on its own and matches them to each driver — by area and radius, truck type, dates and mileage limit — and instantly works out the deadhead miles to pickup.",
      "<b>Instant Telegram alerts.</b> A matching load reaches the dispatcher right after it's posted — already matched to a specific driver.",
      "<b>One-click bids to brokers.</b> The email goes out from the driver's or the company's Gmail with a ready signature and truck details (Gmail access passed Google's verification).",
      "<b>Driver portal:</b> their loads, profile, working areas, Gmail and Telegram connection.",
      "<b>Bulk SMS panel with AI-varied texts</b> — every message is unique, so fewer land in spam."
    ],
    "uiSr": "Simplified mockup of the FastLoad interface with demo data: a list of matched loads with a send-bid button.",
    "resultH": "Results",
    "kpis": [
      {
        "value": "+<span class=\"count\" data-to=\"20\">20</span>–<span class=\"count\" data-to=\"30\">30</span>%",
        "label": "more loads from off-hours",
        "acc": true
      },
      {
        "value": "24/7",
        "label": "load board monitoring",
        "acc": false
      },
      {
        "value": "<span class=\"count\" data-to=\"17\">17</span>",
        "label": "dispatchers on the system",
        "acc": false
      },
      {
        "value": "<span class=\"count\" data-to=\"98\">98</span>",
        "label": "drivers getting loads matched",
        "acc": false
      }
    ],
    "results": [
      "The system catches loads while dispatchers are off shift.",
      "Above all, time: dispatchers no longer sit on the load board hitting refresh — they work only with loads that are already matched.",
      "Used daily by the whole team; the client is on a paid support plan.",
      "The project grew into a standalone product — <a class=\"link\" href=\"https://fastload.app\" rel=\"noopener\" target=\"_blank\">fastload.app ↗</a>"
    ],
    "stackLabel": "Stack",
    "stack": [
      "Node.js",
      "Express",
      "PostgreSQL (Supabase)",
      "Puppeteer",
      "Telegram Bot API",
      "Gmail API",
      "OpenPhone API",
      "Claude API"
    ],
    "ui": {
      "bar": "FastLoad · matched loads",
      "demo": "demo",
      "sub": [
        "Driver: Demo D.",
        "Dry Van 53'",
        "area: Southeast · 300 mi"
      ],
      "loads": [
        {
          "broker": "Get Freight LLC",
          "tag": "new · 4 sec",
          "from": "Miami, FL",
          "to": "Dayton, NJ",
          "meta": [
            "1 214 mi",
            "deadhead 38 mi",
            "Dry Van"
          ],
          "rate": "$ 2 450",
          "send": "Send bid",
          "sent": false
        },
        {
          "broker": "Sample Logistics Co",
          "tag": "12 min",
          "from": "Orlando, FL",
          "to": "Charlotte, NC",
          "meta": [
            "526 mi",
            "deadhead 52 mi",
            "Dry Van"
          ],
          "rate": "$ 1 240",
          "send": "Send bid",
          "sent": false
        },
        {
          "broker": "Demo Brokerage Inc",
          "tag": "bid sent",
          "from": "Tampa, FL",
          "to": "Atlanta, GA",
          "meta": [
            "456 mi",
            "deadhead 17 mi",
            "Dry Van"
          ],
          "rate": "$ 1 100",
          "send": "✓ Sent",
          "sent": true
        }
      ],
      "deadhead": "deadhead",
      "newTag": "new · 4 sec"
    }
  },
  "products": {
    "label": "Platforms",
    "title": "Platforms that are <em>live right now</em>",
    "items": [
      {
        "img": "carbids",
        "alt": "CarBids home page: VIN search and number of lots",
        "badge": "Live",
        "offer": null,
        "link": {
          "href": "https://carbids.info",
          "label": "carbids.info ↗"
        },
        "name": "CarBids",
        "what": "US auction car history by VIN",
        "desc": "Copart and IAAI sales: photos, mileage, damage, title and final price. The data updates itself, every car gets its own page for Google search, and a Telegram channel with daily deals runs automatically.",
        "kpis": [
          {
            "dt": "3.7M",
            "dd": "lots in the database"
          },
          {
            "dt": "61",
            "dd": "makes"
          },
          {
            "dt": "4",
            "dd": "languages"
          }
        ],
        "cta": null
      },
      {
        "img": "fastload",
        "alt": "FastLoad home page: a broker load with the real rate and a bid button",
        "badge": "Live",
        "offer": null,
        "link": {
          "href": "https://fastload.app",
          "label": "fastload.app ↗"
        },
        "name": "FastLoad",
        "what": "Loads straight from brokers — for owner-operators",
        "desc": "A service for owner-operators and expedite drivers in the US: loads come straight from the broker with the real rate, and your own bid goes to the broker from your own email — no dispatcher in the middle. Grown out of the MIRTEH GRUP system.",
        "kpis": [
          {
            "dt": "up to 40%",
            "dd": "of the rate stays with the driver"
          },
          {
            "dt": "1 click",
            "dd": "to bid to the broker"
          }
        ],
        "cta": null
      },
      {
        "img": "crm",
        "alt": "4Power CRM car board by day — demo data",
        "badge": null,
        "offer": "For car workshops",
        "link": {
          "href": "https://4power.club",
          "label": "4power.club ↗"
        },
        "name": "4Power · website and CRM",
        "what": "Booking website and CRM on top of 1C",
        "desc": "The same pairing that runs every day at 4Power Club: a website where customers book repairs, and a CRM that tracks each car from check-in to handover. Each workshop gets its own server and database — I adapt it to your bays, process and 1C.",
        "kpis": [],
        "cta": {
          "href": "#contact",
          "label": "Discuss it for your workshop"
        }
      }
    ]
  },
  "about": {
    "eyebrow": "Who does the work",
    "alt": "Maxim Lazarev",
    "caption": "Chișinău · since 2019",
    "name": "Maxim Lazarev",
    "role": "Founder · development and launch",
    "lead": "One person runs the project — from the first conversation to launch. No managers between you and the person doing the work. When the job calls for it, I bring in specialists I trust.",
    "cta": "30-minute project review",
    "ctaSub": "message me on Telegram"
  },
  "services": {
    "eyebrow": "Services",
    "title": "From first click <em>to payment</em>",
    "intro": "Take a single service or combine them: ads bring customers in, the website greets them, and the system makes sure no lead slips through.",
    "head": [
      "№",
      "Service",
      "What's included",
      "Timeline",
      "Price"
    ],
    "items": [
      {
        "n": "01",
        "name": "Process audit",
        "desc": "I find where the business loses time and money on manual work and hand you a plan: what to automate, in what order, and what it will give you. The plan is yours to keep, and the audit fee counts towards the project if we continue.",
        "termLabel": "Timeline",
        "term": "1–2 weeks",
        "priceLabel": "Price",
        "price": [
          "€300"
        ]
      },
      {
        "n": "02",
        "name": "Development",
        "desc": "Websites, client portals and internal systems — from a landing page to a platform for the whole team. SEO basics included: speed, structure, meta tags, sitemap.",
        "termLabel": "Timeline",
        "term": "depends on scope",
        "priceLabel": "Price",
        "price": [
          "website from €600",
          "system from €1,500"
        ]
      },
      {
        "n": "03",
        "name": "Automation",
        "desc": "One specific job, built end to end: an integration, an AI agent, notifications, a back office. It plugs into 1C, messengers, email and the tools you already use.",
        "termLabel": "Timeline",
        "term": "per project",
        "priceLabel": "Price",
        "price": [
          "from €800"
        ]
      },
      {
        "n": "04",
        "name": "Advertising",
        "desc": "Setting up and running ads on Google and Meta (Facebook, Instagram), plus analytics and pixels. Leads from ads land straight in your system instead of getting lost in chats. You pay the ad budget to the platform directly — my fee is fixed.",
        "termLabel": "Timeline",
        "term": "launch and management",
        "priceLabel": "Price",
        "price": [
          "setup from €250",
          "+ from €250/mo"
        ]
      },
      {
        "n": "05",
        "name": "Security audit",
        "desc": "A baseline check of your website or system: vulnerabilities, server and HTTPS settings, personal data leaks, and how cookies and consent work under Moldova's Law 195/2024 (the technical side — together with your lawyer). You get a prioritised report and a fix plan. Only under contract and with your written permission.",
        "termLabel": "Timeline",
        "term": "depends on scope",
        "priceLabel": "Price",
        "price": [
          "from €350"
        ]
      },
      {
        "n": "06",
        "name": "Ongoing support",
        "desc": "Support, improvements, monitoring, quick answers. The system stays yours.",
        "termLabel": "Timeline",
        "term": "monthly",
        "priceLabel": "Price",
        "price": [
          "from €150/mo"
        ]
      }
    ]
  },
  "calc": {
    "eyebrow": "Loss calculator",
    "title": "What <em>lost leads</em> cost you",
    "intro": "Didn't call back, forgot, replied the next day — and the customer went to a competitor. Work out what that costs you each month.",
    "leads": "Leads per month",
    "check": "Average order value, €",
    "pct": "Share of leads lost",
    "scale": [
      "5%",
      "40%"
    ],
    "resultLabel": "You lose roughly",
    "perMonth": "a month",
    "defaultSum": "≈ €4,500",
    "note": "This is an estimate, not a promise: leads × average order × share lost. Where exactly they leak — we'll see in the review.",
    "cta": "Let's find where they leak — 30 minutes",
    "msg": "Hi! I used the calculator on the MX Systems site: I lose about €{sum} a month on lost leads. I would like a project review."
  },
  "process": {
    "eyebrow": "How we work",
    "title": "Four steps — <em>from first chat to launch</em>",
    "intro": "The first step is a 30-minute review with no strings attached: afterwards you decide, no pressure, whether to go further.",
    "steps": [
      {
        "n": "01 · no strings attached",
        "title": "Conversation",
        "text": "Describe the problem on Telegram — text or voice message, whatever is easier. We get on a 30-minute call and work through it."
      },
      {
        "n": "02",
        "title": "Audit",
        "text": "I look at your processes and propose a solution: what we will do, what it costs and where the scope ends. Everything is agreed before we start."
      },
      {
        "n": "03",
        "title": "Build",
        "text": "I show you interim results as we go — you see the system long before handover."
      },
      {
        "n": "04",
        "title": "Launch and support",
        "text": "We roll it out to your team and keep developing it as the business grows."
      }
    ],
    "ownTitle": "It all <em>stays yours</em>",
    "own": [
      {
        "title": "Code and access",
        "text": "Source code, servers and service accounts belong to you from day one."
      },
      {
        "title": "Documentation",
        "text": "A description of how the system is built and how to maintain it."
      },
      {
        "title": "Freedom to choose",
        "text": "Any developer can take the system further — you're not tied to anyone."
      }
    ]
  },
  "faq": {
    "eyebrow": "Questions",
    "title": "The questions <em>people hesitate to ask</em>",
    "items": [
      {
        "q": "How much does it cost, and what drives the price?",
        "a": "Scope: how many processes, integrations and users, and whether you need ads and a website. After the first review I give you a ballpark; after the audit, the exact price and scope. The price is fixed before we start."
      },
      {
        "q": "How long will it take?",
        "a": "The audit takes 1–2 weeks. I give the build timeline after the audit: a single job can go live quickly, a large system is built in stages — and you see first results along the way."
      },
      {
        "q": "Do you work with 1C and my CRM?",
        "a": "Yes. 1C through its REST API, as in the 4Power Club system. CRMs and other tools — if they have an API or a data export; we check that during the review."
      },
      {
        "q": "What happens if you disappear?",
        "a": "The code, servers and access are yours from day one, along with the documentation. Any developer can maintain and extend the system."
      },
      {
        "q": "Do you work under a contract?",
        "a": "Yes, always under a written contract: what we will do, the timeline, the price and how payment works."
      }
    ]
  },
  "contact": {
    "eyebrow": "Contact",
    "title": "Tell me about the problem — <em>I'll reply within a day</em>",
    "sub": "The first 30 minutes are on me: we look at the problem and decide whether it makes sense to go further. Text or voice message — both work.",
    "items": [
      {
        "kind": "telegram",
        "label": "Telegram",
        "hint": "fastest",
        "value": "@mvxev"
      },
      {
        "kind": "whatsapp",
        "label": "WhatsApp",
        "hint": null,
        "value": "+373 69 589 555"
      },
      {
        "kind": "phone",
        "label": "Phone",
        "hint": null,
        "value": "+373 69 589 555"
      },
      {
        "kind": "email",
        "label": "Email",
        "hint": null,
        "value": "mvxrev@gmail.com"
      }
    ]
  },
  "footer": {
    "tag": "Development · automation · ads",
    "links": [
      {
        "href": "#cases",
        "label": "Projects"
      },
      {
        "href": "#services",
        "label": "Services"
      },
      {
        "href": "privacy/",
        "label": "Privacy policy"
      }
    ],
    "cookieBtn": "Cookie settings",
    "bottom": "MX Systems · Chișinău, Moldova · © 2019–2026"
  },
  "cookie": {
    "title": "Cookies and analytics",
    "text": "The site works without them. With your consent I'll turn on Google Analytics — to see which sections are useful — and Meta Pixel — to measure ads. <a href=\"privacy/\">Details</a>",
    "necessary": {
      "t": "Essential",
      "s": "Always on: remember your language and this choice"
    },
    "analytics": {
      "t": "Analytics",
      "s": "Google Analytics 4"
    },
    "marketing": {
      "t": "Advertising",
      "s": "Meta Pixel (Facebook, Instagram)"
    },
    "yes": "Accept all",
    "no": "Essential only",
    "cfg": "Customise",
    "save": "Save choice"
  }
};

export default dict;
