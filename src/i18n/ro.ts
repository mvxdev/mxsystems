/* =====================================================================
   Тексты сайта — румынская версия (/ro/).
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
    "title": "Site-uri, CRM și automatizare afaceri Chișinău — MX Systems",
    "description": "Dezvoltare site-uri și CRM în Chișinău, automatizare afaceri, integrare 1C, publicitate Google și Meta. Prima analiză — 30 de minute, fără obligații.",
    "ogTitle": "MX Systems — aducem clienți și construim sistemul în care nicio cerere nu se pierde",
    "ogDescription": "Publicitate, site-uri și automatizare — tot drumul clientului, de la primul clic la plată. Integrăm cu 1C, mesageria și e-mailul."
  },
  "ui": {
    "logoAria": "MX Systems — pagina principală",
    "navAria": "Secțiuni",
    "nav": [
      {
        "href": "#cases",
        "label": "Proiecte"
      },
      {
        "href": "#services",
        "label": "Servicii"
      },
      {
        "href": "#process",
        "label": "Cum lucrăm"
      },
      {
        "href": "#contact",
        "label": "Contact"
      }
    ],
    "langAria": "Limba",
    "ctaAria": "Analiza situației pe Telegram",
    "ctaLabel": "Analiza situației · 30 min",
    "burgerAria": "Meniu",
    "tgText": "Bună ziua! Am văzut site-ul MX Systems și aș vrea o analiză a situației, de 30 de minute.",
    "mailSubject": "Analiza situației"
  },
  "masthead": [
    "Dezvoltare · automatizare · publicitate",
    "Chișinău · Moldova",
    "din 2019"
  ],
  "hero": {
    "h1Prefix": "MX Systems",
    "h1": "Aducem clienți și construim sistemul <em>în care nicio cerere nu se pierde</em>",
    "figAria": "Schemă: cererile din reclame, evidența și e-mailul intră în sistem, iar rezultatul ajunge la echipă, clienți și proprietar",
    "inputs": [
      {
        "t": "RECLAME",
        "s": "cereri clienți"
      },
      {
        "t": "EVIDENȚĂ",
        "s": "stoc, depozit"
      },
      {
        "t": "E-MAIL",
        "s": "mesaje, comenzi"
      }
    ],
    "coreSub": "selectează · urmărește · amintește",
    "outputs": [
      {
        "t": "ECHIPA",
        "s": "notificări"
      },
      {
        "t": "CLIENȚI",
        "s": "„comanda e gata”"
      },
      {
        "t": "PROPRIETAR",
        "s": "raport 08:00"
      }
    ],
    "figcaption": "Datele circulă singure — oamenii primesc rezultatul gata.",
    "lead": "Configurăm publicitatea, dezvoltăm site-uri și automatizăm rutina — tot drumul clientului, de la primul clic la plată. Integrăm cu 1C, mesageria și e-mailul și rămânem alături după lansare.",
    "cta": "Analiza situației, 30 de minute",
    "ctaSub": "pe Telegram — fără obligații",
    "cta2": "Vezi proiectele",
    "notesAria": "Sisteme folosite zilnic",
    "notes": [
      {
        "href": "#case-4power",
        "k": "Service auto · Chișinău",
        "text": "4Power Club, 7 posturi"
      },
      {
        "href": "#case-fastload",
        "k": "Logistică · SUA",
        "text": "17 dispeceri, 98 de șoferi"
      },
      {
        "href": "#prod-carbids",
        "k": "Licitații auto · SUA",
        "text": "CarBids, 3,7 mil. loturi"
      }
    ]
  },
  "cases": {
    "eyebrow": "Proiecte",
    "title": "Sisteme care <em>lucrează în fiecare zi</em>",
    "intro": "Implementări la clienți și platforme — toate folosite zilnic. Interfețele de mai jos sunt copii simplificate, cu date demonstrative.",
    "groupImpl": "Implementări",
    "order": [
      "4power",
      "fastload"
    ]
  },
  "case4power": {
    "no": "Proiect 01",
    "badge": "În funcțiune",
    "title": "Site și CRM pentru service-ul auto <em>4Power Club</em>",
    "meta": [
      {
        "dt": "Client",
        "dd": "4Power Club"
      },
      {
        "dt": "Domeniu",
        "dd": "Service auto · Chișinău"
      },
      {
        "dt": "Site",
        "dd": "<a class=\"link\" href=\"https://4power.club\" rel=\"noopener\" target=\"_blank\">4power.club ↗</a>"
      },
      {
        "dt": "Echipa",
        "dd": "7 posturi, meșteri, 4 recepționeri, depozit"
      }
    ],
    "taskH": "Problema",
    "task": "Informația se pierdea între oameni: recepționerul nu afla că mașina e gata dacă o primise un coleg; mașinile care așteptau 2–3 săptămâni piese comandate erau uitate; depozitul primea piesele, dar nu anunța pe nimeni; piesele comandate pentru o mașină aflată în afara service-ului își pierdeau legătura cu ea; clienții erau anunțați manual că mașina e gata. Evidența pieselor se ținea în 1C.",
    "doneH": "Ce am făcut",
    "done": [
      "<b>Site-ul service-ului</b> <a class=\"link\" href=\"https://4power.club\" rel=\"noopener\" target=\"_blank\">4power.club ↗</a> — în română și rusă: servicii, programare la reparație, marcaj pentru Google, ca service-ul să apară în căutare și pe hărți.",
      "<b>Un strat peste 1C.</b> 1C rămâne contabilitatea, iar sistemul conduce procesul: statusurile mașinilor, responsabilii, legătura „piesă ↔ mașină”, notificările.",
      "<b>Panou cu mașinile în timp real</b> — pe zile și pe coloane de status; cele urgente sunt evidențiate și se vede câte zile așteaptă fiecare mașină.",
      "<b>Evidența pieselor pe tot ciclul</b> „mașina așteaptă → comandat → în depozit → montaj” și o filă separată pentru piesele venite fără legătură cu o mașină.",
      "<b>Legătura cu 1C</b> — comenzile și intrările în depozit vin singure din 1C, fără introducere dublă; o intrare repetată nu dublează piesa.",
      "<b>„Ecranul atelierului”</b> — un monitor comun pentru mecanici, fără nimic de instalat.",
      "<b>Praguri și ore de lucru</b> — sistemul dă singur alarma dacă o mașină sau o piesă stă blocată mai mult decât e normal.",
      "<b>Mesaje către clienți în numele service-ului</b> — „mașina e gata” și comanda de lucru pleacă singure când 1C a închis comanda, cu telefonul recepționerului responsabil.",
      "<b>SMS despre programare</b> — clientul află când și unde să vină; reprogramarea, anularea și reamintirea din ajun — în română sau rusă.",
      "<b>Bot Telegram pentru angajați</b> — notificări cu butoane direct în mesaj și comanda de lucru în PDF ca răspuns.",
      "<b>Calendarul programărilor</b> — o singură coadă pe zi și butonul „Programează la reparație” când au sosit toate piesele.",
      "<b>Ecranul maistrului pe telefon</b> și marcajul de test-drive: cine predă cheile vede dacă mașina a fost testată.",
      "<b>Raport zilnic pentru proprietar.</b>",
      "<b>Căutare</b> după numărul de înmatriculare, VIN, telefon, nume sau numărul comenzii; roluri și drepturi de acces pentru angajați."
    ],
    "uiSr": "Machetă simplificată a panoului de mașini 4Power Club, cu date demonstrative: coloanele „Așteaptă reparația”, „Așteaptă piese”, „Gata”.",
    "resultH": "Rezultat",
    "kpis": [
      {
        "value": "<span class=\"count\" data-to=\"886\">886</span>",
        "label": "verificări automate, toate trec",
        "acc": true
      },
      {
        "value": "<span class=\"count\" data-to=\"7\">7</span>",
        "label": "posturi într-un singur sistem",
        "acc": false
      },
      {
        "value": "<span class=\"count\" data-to=\"4\">4</span>",
        "label": "recepționeri văd același lucru",
        "acc": false
      },
      {
        "value": "1C",
        "label": "sincronizare depozit",
        "acc": false
      }
    ],
    "results": [
      "În funcțiune — toată echipa lucrează într-un singur sistem.",
      "Mai puține apeluri și mesaje de tipul „e gata mașina? / a venit piesa?” — statusul se vede, nu trebuie aflat.",
      "Nicio mașină nu se pierde în așteptarea pieselor — sistemul amintește singur.",
      "886 de verificări automate — toate trec. Rulează pe baza de date și serverul reale, fără simulări: se verifică tot drumul — autentificare, drepturi, cerere, scriere, răspuns.",
      "Sub capotă: 68 de adrese API, 17 tabele, 8 ecrane; la fiecare 4 rânduri de cod — un rând de test."
    ],
    "stackLabel": "Tehnologii",
    "stack": [
      "Node.js",
      "PostgreSQL",
      "Vue 3 PWA",
      "1C (REST API)",
      "SSE (actualizări în timp real)",
      "Telegram",
      "WhatsApp Business",
      "site: Astro, Tailwind"
    ],
    "ui": {
      "bar": "4Power · panou mașini",
      "demo": "demo",
      "sub": [
        "Azi",
        "7 posturi",
        "depozit · sincr. 1C"
      ],
      "cols": [
        {
          "key": "wait",
          "title": "Așteaptă reparația",
          "cars": [
            {
              "name": "Toyota RAV4",
              "status": "post 3 · 1 zi",
              "cls": "",
              "moving": false
            },
            {
              "name": "Kia Sportage",
              "status": "post 5 · azi",
              "cls": "",
              "moving": false
            }
          ]
        },
        {
          "key": "parts",
          "title": "Așteaptă piese",
          "cars": [
            {
              "name": "Audi Q5",
              "status": "comandat · 9 zile",
              "cls": "",
              "moving": true
            },
            {
              "name": "BMW M3",
              "status": "așteaptă 16 zile · urgent",
              "cls": "is-urgent",
              "moving": false
            }
          ]
        },
        {
          "key": "ready",
          "title": "Gata",
          "cars": [
            {
              "name": "VW Passat",
              "status": "client anunțat",
              "cls": "is-done",
              "moving": false
            }
          ]
        }
      ],
      "labels": [
        "comandat · 9 zile",
        "piesa e în depozit",
        "client anunțat"
      ],
      "toast": "✓ Clientul a primit mesaj pe WhatsApp"
    }
  },
  "caseFastload": {
    "no": "Proiect 02",
    "badge": "În funcțiune",
    "title": "FastLoad — platformă pentru dispeceratul <em>MIRTEH GRUP</em>",
    "meta": [
      {
        "dt": "Client",
        "dd": "MIRTEH GRUP"
      },
      {
        "dt": "Domeniu",
        "dd": "Logistică · SUA"
      },
      {
        "dt": "Echipa",
        "dd": "17 dispeceri, 98 de șoferi"
      }
    ],
    "taskH": "Problema",
    "task": "Dispecerii monitorizau manual bursa de mărfuri Sylectus (o platformă americană unde brokerii publică încărcături): reîncărcau pagina, verificau fiecare încărcătură față de locația și tipul camionului fiecărui șofer și scriau manual oferte brokerilor. Încărcăturile bune dispar în câteva minute, iar tot ce se publica în afara turei era pierdut.",
    "doneH": "Ce am făcut",
    "done": [
      "<b>Monitorizarea bursei 24/7.</b> Sistemul preia singur încărcăturile noi și le potrivește fiecărui șofer — după zonă și rază, tipul camionului, date și limita de kilometraj; calculează imediat drumul în gol până la încărcare.",
      "<b>Notificări instant în Telegram.</b> Încărcătura potrivită ajunge la dispecer imediat după publicare — deja potrivită pentru un anumit șofer.",
      "<b>Ofertă către broker dintr-un clic.</b> E-mailul pleacă din Gmail-ul șoferului sau al companiei, cu semnătură și descrierea camionului (accesul la Gmail a trecut verificarea Google).",
      "<b>Contul șoferului:</b> încărcăturile proprii, profilul, zonele de lucru, conectarea Gmail și Telegram.",
      "<b>Panou pentru SMS-uri în masă, cu texte variate prin AI</b> — fiecare mesaj e unic și ajunge mai rar în spam."
    ],
    "uiSr": "Machetă simplificată a interfeței FastLoad, cu date demonstrative: lista încărcăturilor potrivite, cu butonul de trimitere a ofertei.",
    "resultH": "Rezultat",
    "kpis": [
      {
        "value": "+<span class=\"count\" data-to=\"20\">20</span>–<span class=\"count\" data-to=\"30\">30</span>%",
        "label": "încărcături în plus din orele nelucrătoare",
        "acc": true
      },
      {
        "value": "24/7",
        "label": "monitorizarea bursei",
        "acc": false
      },
      {
        "value": "<span class=\"count\" data-to=\"17\">17</span>",
        "label": "dispeceri în sistem",
        "acc": false
      },
      {
        "value": "<span class=\"count\" data-to=\"98\">98</span>",
        "label": "șoferi pentru care se potrivesc încărcături",
        "acc": false
      }
    ],
    "results": [
      "Sistemul prinde încărcături cât timp dispecerii nu sunt de tură.",
      "Principalul e timpul: dispecerii nu mai stau pe bursă reîncărcând pagina, ci lucrează doar cu încărcături deja potrivite.",
      "Folosit zilnic de toată echipa; clientul are un contract plătit de mentenanță.",
      "Din proiect a crescut un produs separat — <a class=\"link\" href=\"https://fastload.app\" rel=\"noopener\" target=\"_blank\">fastload.app ↗</a>"
    ],
    "stackLabel": "Tehnologii",
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
      "bar": "FastLoad · încărcături potrivite",
      "demo": "demo",
      "sub": [
        "Șofer: Demo D.",
        "Dry Van 53'",
        "zonă: Southeast · 300 mi"
      ],
      "loads": [
        {
          "broker": "Get Freight LLC",
          "tag": "nou · 4 sec",
          "from": "Miami, FL",
          "to": "Dayton, NJ",
          "meta": [
            "1 214 mi",
            "gol 38 mi",
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
            "gol 52 mi",
            "Dry Van"
          ],
          "rate": "$ 1 240",
          "send": "Send bid",
          "sent": false
        },
        {
          "broker": "Demo Brokerage Inc",
          "tag": "ofertă trimisă",
          "from": "Tampa, FL",
          "to": "Atlanta, GA",
          "meta": [
            "456 mi",
            "gol 17 mi",
            "Dry Van"
          ],
          "rate": "$ 1 100",
          "send": "✓ Trimis",
          "sent": true
        }
      ],
      "deadhead": "gol",
      "newTag": "nou · 4 sec"
    }
  },
  "products": {
    "label": "Platforme",
    "title": "Platforme care <em>funcționează chiar acum</em>",
    "items": [
      {
        "img": "carbids",
        "alt": "Pagina principală CarBids: căutare după VIN și numărul de loturi",
        "badge": "Funcționează",
        "offer": null,
        "link": {
          "href": "https://carbids.info",
          "label": "carbids.info ↗"
        },
        "name": "CarBids",
        "what": "Istoricul mașinilor de la licitațiile din SUA după VIN",
        "desc": "Vânzările Copart și IAAI: fotografii, kilometraj, avarii, documente și prețul final. Datele se actualizează singure, fiecare mașină are propria pagină pentru căutarea Google, iar canalul de Telegram cu chilipirurile zilei merge automat.",
        "kpis": [
          {
            "dt": "3,7 mil.",
            "dd": "loturi în bază"
          },
          {
            "dt": "61",
            "dd": "de mărci"
          },
          {
            "dt": "4",
            "dd": "limbi"
          }
        ],
        "cta": null
      },
      {
        "img": "fastload",
        "alt": "Pagina principală FastLoad: încărcătură de la broker cu tariful real și butonul de ofertă",
        "badge": "Funcționează",
        "offer": null,
        "link": {
          "href": "https://fastload.app",
          "label": "fastload.app ↗"
        },
        "name": "FastLoad",
        "what": "Încărcături direct de la brokeri — pentru proprietarii de camioane",
        "desc": "Un serviciu pentru proprietarii de camioane și șoferii de expediere din SUA: încărcătura vine direct de la broker, cu tariful real, iar oferta proprie pleacă la broker de pe propriul e-mail — fără dispecer la mijloc. A crescut din sistemul pentru MIRTEH GRUP.",
        "kpis": [
          {
            "dt": "până la 40%",
            "dd": "din tarif rămâne la șofer"
          },
          {
            "dt": "1 clic",
            "dd": "până la oferta către broker"
          }
        ],
        "cta": null
      },
      {
        "img": "crm",
        "alt": "Panoul de mașini 4Power CRM pe zile — date demonstrative",
        "badge": null,
        "offer": "Pentru service-uri auto",
        "link": {
          "href": "https://4power.club",
          "label": "4power.club ↗"
        },
        "name": "4Power · site și CRM",
        "what": "Site cu programare și CRM peste 1C",
        "desc": "Același tandem care funcționează zilnic la 4Power Club: un site prin care clienții se programează la reparație și un CRM în care mașina e urmărită de la recepție până la predare. Fiecare service primește propriul server și propria bază de date — îl adaptez la posturile, procesul și 1C-ul dumneavoastră.",
        "kpis": [],
        "cta": {
          "href": "#contact",
          "label": "Discutăm pentru service-ul dvs."
        }
      }
    ]
  },
  "about": {
    "eyebrow": "Cine lucrează",
    "alt": "Maxim Lazarev",
    "caption": "Chișinău · din 2019",
    "name": "Maxim Lazarev",
    "role": "Fondator · dezvoltare și lansare",
    "lead": "Proiectul îl conduce un singur om — de la prima discuție până la lansare. Fără manageri între dumneavoastră și cel care face munca. Când proiectul o cere, aduc specialiști verificați.",
    "cta": "Analiza situației, 30 de minute",
    "ctaSub": "scrieți-mi pe Telegram"
  },
  "services": {
    "eyebrow": "Servicii",
    "title": "De la primul clic <em>până la plată</em>",
    "intro": "Puteți lua un singur serviciu sau mai multe împreună: reclama aduce clienți, site-ul îi întâmpină, iar sistemul nu lasă nicio cerere să se piardă.",
    "head": [
      "№",
      "Serviciu",
      "Ce include",
      "Termen",
      "Preț"
    ],
    "items": [
      {
        "n": "01",
        "name": "Audit de procese",
        "desc": "Analizez unde afacerea pierde timp și bani pe muncă manuală și vă dau un plan: ce automatizăm, în ce ordine și ce aduce. Planul rămâne la dumneavoastră, iar costul auditului se scade din proiect dacă mergem mai departe.",
        "termLabel": "Termen",
        "term": "1–2 săptămâni",
        "priceLabel": "Preț",
        "price": [
          "€300"
        ]
      },
      {
        "n": "02",
        "name": "Dezvoltare",
        "desc": "Site-uri, conturi pentru clienți și sisteme interne — de la o pagină de prezentare la o platformă pentru toată echipa. Baza SEO e inclusă: viteză, structură, meta-taguri, hartă a site-ului.",
        "termLabel": "Termen",
        "term": "după volum",
        "priceLabel": "Preț",
        "price": [
          "site de la €600",
          "sistem de la €1.500"
        ]
      },
      {
        "n": "03",
        "name": "Automatizare",
        "desc": "O problemă concretă, rezolvată cap-coadă: integrare, agent AI, notificări, back-office. Se integrează cu 1C, mesageria, e-mailul și serviciile pe care le folosiți deja.",
        "termLabel": "Termen",
        "term": "după proiect",
        "priceLabel": "Preț",
        "price": [
          "de la €800"
        ]
      },
      {
        "n": "04",
        "name": "Publicitate",
        "desc": "Configurarea și administrarea reclamelor în Google și Meta (Facebook, Instagram), analitică și pixeli. Cererile din reclame ajung direct în sistemul dumneavoastră, nu se pierd prin conversații. Bugetul de publicitate îl plătiți direct platformei — onorariul meu e fix.",
        "termLabel": "Termen",
        "term": "lansare și administrare",
        "priceLabel": "Preț",
        "price": [
          "lansare de la €250",
          "+ de la €250/lună"
        ]
      },
      {
        "n": "05",
        "name": "Audit de securitate",
        "desc": "Verificare de bază a site-ului sau a sistemului: vulnerabilități, setările serverului și HTTPS, scurgeri de date personale, funcționarea cookie-urilor și a consimțămintelor conform Legii 195/2024 (partea tehnică — împreună cu juristul dumneavoastră). Rezultatul: un raport cu priorități și un plan de remediere. Doar pe bază de contract și cu permisiunea dumneavoastră scrisă.",
        "termLabel": "Termen",
        "term": "după volum",
        "priceLabel": "Preț",
        "price": [
          "de la €350"
        ]
      },
      {
        "n": "06",
        "name": "Mentenanță",
        "desc": "Suport, îmbunătățiri, monitorizare, răspunsuri rapide. Sistemul rămâne al dumneavoastră.",
        "termLabel": "Termen",
        "term": "lunar",
        "priceLabel": "Preț",
        "price": [
          "de la €150/lună"
        ]
      }
    ]
  },
  "calc": {
    "eyebrow": "Calculator de pierderi",
    "title": "Cât vă costă <em>cererile pierdute</em>",
    "intro": "Nu ați sunat înapoi, ați uitat, ați răspuns a doua zi — iar clientul a plecat la concurență. Calculați cât vă costă asta pe lună.",
    "leads": "Cereri pe lună",
    "check": "Valoarea medie a comenzii, €",
    "pct": "Câte cereri se pierd",
    "scale": [
      "5%",
      "40%"
    ],
    "resultLabel": "Pierdeți aproximativ",
    "perMonth": "pe lună",
    "defaultSum": "≈ €4.500",
    "note": "Este o estimare, nu o promisiune: cereri × valoarea medie × cota pierdută. Unde anume se pierd — vedem la analiză.",
    "cta": "Aflăm unde se pierd — 30 de minute",
    "msg": "Bună ziua! Am calculat pe site-ul MX Systems: pierd aproximativ €{sum} pe lună din cereri pierdute. Aș vrea o analiză a situației."
  },
  "process": {
    "eyebrow": "Cum lucrăm",
    "title": "Patru pași — <em>de la discuție la lansare</em>",
    "intro": "Primul pas este o analiză de 30 de minute, fără obligații: după ea decideți liniștit dacă mergem mai departe.",
    "steps": [
      {
        "n": "01 · fără obligații",
        "title": "Discuția",
        "text": "Descrieți situația pe Telegram — în scris sau prin mesaj vocal, cum vă e comod. Ne auzim 30 de minute și o analizăm."
      },
      {
        "n": "02",
        "title": "Auditul",
        "text": "Analizez procesele și propun o soluție: ce facem, cât costă și unde sunt limitele lucrării. Totul se fixează înainte de start."
      },
      {
        "n": "03",
        "title": "Construcția",
        "text": "Vă arăt rezultatele intermediare pe parcurs — vedeți sistemul cu mult înainte de predare."
      },
      {
        "n": "04",
        "title": "Lansare și mentenanță",
        "text": "Îl introducem în munca echipei și îl dezvoltăm mai departe, odată cu afacerea."
      }
    ],
    "ownTitle": "Totul <em>vă aparține</em>",
    "own": [
      {
        "title": "Cod și accese",
        "text": "Codul sursă, serverele și conturile serviciilor vă aparțin din prima zi."
      },
      {
        "title": "Documentație",
        "text": "Descrierea felului în care e construit sistemul și cum se întreține."
      },
      {
        "title": "Libertate de alegere",
        "text": "Sistemul poate fi dezvoltat de orice programator — nu depindeți de nimeni."
      }
    ]
  },
  "faq": {
    "eyebrow": "Întrebări",
    "title": "Întrebările <em>pe care ezitați să le puneți</em>",
    "items": [
      {
        "q": "Cât costă și de ce depinde prețul?",
        "a": "De volum: câte procese, integrări și utilizatori, dacă e nevoie de publicitate și de site. După prima analiză vă dau un reper, după audit — prețul exact și limitele lucrării. Prețul se fixează înainte de start."
      },
      {
        "q": "Cât durează?",
        "a": "Auditul durează 1–2 săptămâni. Termenul de construcție îl spun după audit: o problemă punctuală se poate lansa repede, un sistem mare îl facem pe etape — și vedeți primele rezultate pe parcurs."
      },
      {
        "q": "Lucrați cu 1C și cu CRM-ul meu?",
        "a": "Da. Cu 1C — prin REST API, ca în sistemul pentru 4Power Club. Cu CRM-uri și alte servicii — dacă au API sau export de date; verificăm asta la analiză."
      },
      {
        "q": "Ce se întâmplă dacă dispăreți?",
        "a": "Codul, serverele și accesele sunt la dumneavoastră din prima zi, plus documentația. Sistemul poate fi întreținut și dezvoltat de orice programator."
      },
      {
        "q": "Lucrați pe bază de contract?",
        "a": "Da, mereu pe bază de contract scris: ce facem, în ce termene, cât costă și cum se face plata."
      }
    ]
  },
  "contact": {
    "eyebrow": "Contact",
    "title": "Povestiți-mi despre proiect — <em>vă răspund în decurs de o zi</em>",
    "sub": "Primele 30 de minute sunt din partea mea: analizăm situația și decidem dacă are sens să mergem mai departe. Puteți scrie sau trimite un mesaj vocal.",
    "items": [
      {
        "kind": "telegram",
        "label": "Telegram",
        "hint": "cel mai rapid",
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
        "label": "Telefon",
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
    "tag": "Dezvoltare · automatizare · publicitate",
    "links": [
      {
        "href": "#cases",
        "label": "Proiecte"
      },
      {
        "href": "#services",
        "label": "Servicii"
      },
      {
        "href": "privacy/",
        "label": "Politica de confidențialitate"
      }
    ],
    "cookieBtn": "Setări cookie",
    "bottom": "MX Systems · Chișinău, Moldova · © 2019–2026"
  },
  "cookie": {
    "title": "Cookie-uri și analitică",
    "text": "Site-ul funcționează și fără ele. Cu acordul dumneavoastră activez Google Analytics — ca să înțeleg ce secțiuni sunt utile — și Meta Pixel — ca să măsor reclamele. <a href=\"privacy/\">Detalii</a>",
    "necessary": {
      "t": "Necesare",
      "s": "Mereu active: rețin limba și această alegere"
    },
    "analytics": {
      "t": "Analitică",
      "s": "Google Analytics 4"
    },
    "marketing": {
      "t": "Publicitate",
      "s": "Meta Pixel (Facebook, Instagram)"
    },
    "yes": "Acceptă toate",
    "no": "Doar cele necesare",
    "cfg": "Setări",
    "save": "Salvează alegerea"
  }
};

export default dict;
