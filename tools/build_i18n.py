# -*- coding: utf-8 -*-
"""
Сборка румынской и английской версий главной страницы из русской (index.html).

Зачем так: вёрстка у всех трёх версий одна и та же. Правим её в русском index.html,
затем запускаем этот скрипт — и ro/index.html, en/index.html пересобираются с переводами.
Тексты переводов — в таблице T ниже: (русский, румынский, английский).

Запуск из папки проекта:
    python tools/build_i18n.py

Скрипт проверяет, что каждая русская фраза нашлась в index.html, и что в готовых
страницах не осталось кириллицы (кроме HTML-комментариев — они остаются на русском,
потому что это пояснения для разработчика).
"""
import re
import sys
import urllib.parse as u
from pathlib import Path

sys.stdout.reconfigure(encoding='utf-8')   # чтобы русские сообщения нормально печатались в консоли Windows
ROOT = Path(__file__).resolve().parent.parent
SRC = (ROOT / 'index.html').read_text(encoding='utf-8')

# --- Предзаполненные сообщения для Telegram / WhatsApp и тема письма ---
MSG = {
    'ru': 'Здравствуйте! Увидел сайт MX Systems, хочу записаться на разбор задачи.',
    'ro': 'Bună ziua! Am văzut site-ul MX Systems și aș vrea o analiză a situației, de 30 de minute.',
    'en': 'Hi! I saw the MX Systems website and would like to book a 30-minute project review.',
}
SUBJ = {'ru': 'Разбор задачи', 'ro': 'Analiza situației', 'en': 'Project review'}

# --- Таблица переводов: (русский, румынский, английский) ---
# Порядок важен: длинные фразы идут раньше коротких, которые в них входят.
T = [
    # ---------- <head> ----------
    ('<title>MX Systems — реклама, сайты и автоматизация для бизнеса · Кишинёв</title>',
     '<title>MX Systems — publicitate, site-uri și automatizare pentru afaceri · Chișinău</title>',
     '<title>MX Systems — ads, websites and automation for business · Chișinău</title>'),
    ('content="Студия MX Systems: реклама Google и Meta, сайты и SEO, автоматизация и интеграция с 1С и мессенджерами, аудит безопасности. Весь путь клиента от клика до оплаты. Кишинёв, Молдова."',
     'content="Studioul MX Systems: publicitate Google și Meta, site-uri și SEO, automatizare și integrare cu 1C și aplicațiile de mesagerie, audit de securitate. Tot drumul clientului, de la primul clic la plată. Chișinău, Moldova."',
     'content="MX Systems studio: Google and Meta ads, websites and SEO, automation and integrations with 1C and messengers, security audits. The whole customer journey, from first click to payment. Chișinău, Moldova."'),
    ('content="MX Systems — приводим клиентов и строим систему, в которой ни одна заявка не теряется"',
     'content="MX Systems — aducem clienți și construim sistemul în care nicio cerere nu se pierde"',
     'content="MX Systems — we bring in customers and build a system where no lead gets lost"'),
    ('content="Реклама, сайты и автоматизация — весь путь клиента от первого клика до оплаты. Встраиваем в 1С, мессенджеры и почту."',
     'content="Publicitate, site-uri și automatizare — tot drumul clientului, de la primul clic la plată. Integrăm cu 1C, mesageria și e-mailul."',
     'content="Ads, websites and automation — the whole customer journey, from first click to payment. Works with 1C, messengers and email."'),

    # ---------- Шапка ----------
    ('aria-label="MX Systems — на главную"', 'aria-label="MX Systems — pagina principală"', 'aria-label="MX Systems — home"'),
    ('aria-label="Разделы"', 'aria-label="Secțiuni"', 'aria-label="Sections"'),
    ('<a href="#cases">Кейсы</a>', '<a href="#cases">Proiecte</a>', '<a href="#cases">Work</a>'),
    ('<a href="#services">Услуги</a>', '<a href="#services">Servicii</a>', '<a href="#services">Services</a>'),
    ('<a href="#process">Как работаем</a>', '<a href="#process">Cum lucrăm</a>', '<a href="#process">How we work</a>'),
    ('<a href="#contact">Контакт</a>', '<a href="#contact">Contact</a>', '<a href="#contact">Contact</a>'),
    ('aria-label="Язык"', 'aria-label="Limba"', 'aria-label="Language"'),
    ('aria-label="Разбор задачи в Telegram"', 'aria-label="Analiza situației pe Telegram"', 'aria-label="Project review on Telegram"'),
    ('<span class="label">Разбор задачи · 30 мин</span>', '<span class="label">Analiza situației · 30 min</span>', '<span class="label">Project review · 30 min</span>'),
    ('<span class="end">с 2019</span>', '<span class="end">din 2019</span>', '<span class="end">since 2019</span>'),
    ('aria-label="Меню"', 'aria-label="Meniu"', 'aria-label="Menu"'),

    # ---------- Hero ----------
    ('Разработка · автоматизация · реклама', 'Dezvoltare · automatizare · publicitate', 'Development · automation · ads'),
    ('<span class="mid">Кишинёв · Молдова</span>', '<span class="mid">Chișinău · Moldova</span>', '<span class="mid">Chișinău · Moldova</span>'),
    ('Приводим клиентов и строим систему, <em>в которой ни одна заявка не теряется</em>',
     'Aducem clienți și construim sistemul <em>în care nicio cerere nu se pierde</em>',
     'We bring in customers and build a system <em>where no lead gets lost</em>'),
    ('aria-label="Схема: заявки с рекламы, учёт и почта идут в систему, а результат получают команда, клиенты и владелец"',
     'aria-label="Schemă: cererile din reclame, evidența și e-mailul intră în sistem, iar rezultatul ajunge la echipă, clienți și proprietar"',
     'aria-label="Diagram: leads from ads, accounting and email flow into the system; the team, customers and owner get the result"'),
    ('>РЕКЛАМА</text><text class="s-s" x="16" y="63">заявки клиентов<', '>RECLAME</text><text class="s-s" x="16" y="63">cereri clienți<', '>ADS</text><text class="s-s" x="16" y="63">customer leads<'),
    ('>УЧЁТ</text><text class="s-s" x="186" y="63">склад, остатки<', '>EVIDENȚĂ</text><text class="s-s" x="186" y="63">stoc, depozit<', '>ACCOUNTING</text><text class="s-s" x="186" y="63">stock levels<'),
    ('>ПОЧТА</text><text class="s-s" x="356" y="63">письма, заказы<', '>E-MAIL</text><text class="s-s" x="356" y="63">mesaje, comenzi<', '>EMAIL</text><text class="s-s" x="356" y="63">inbox, orders<'),
    ('>подбирает · следит · напоминает<', '>selectează · urmărește · amintește<', '>matches · tracks · reminds<'),
    ('>КОМАНДА</text><text class="s-s" x="16" y="441">уведомления<', '>ECHIPA</text><text class="s-s" x="16" y="441">notificări<', '>TEAM</text><text class="s-s" x="16" y="441">notifications<'),
    ('>КЛИЕНТЫ</text><text class="s-s" x="186" y="441">«заказ готов»<', '>CLIENȚI</text><text class="s-s" x="186" y="441">„comanda e gata”<', '>CUSTOMERS</text><text class="s-s" x="186" y="441">“order ready”<'),
    ('>ВЛАДЕЛЕЦ</text><text class="s-s" x="356" y="441">сводка 08:00<', '>PROPRIETAR</text><text class="s-s" x="356" y="441">raport 08:00<', '>OWNER</text><text class="s-s" x="356" y="441">summary 08:00<'),
    ('<figcaption>Данные идут сами — люди получают готовый результат.</figcaption>',
     '<figcaption>Datele circulă singure — oamenii primesc rezultatul gata.</figcaption>',
     '<figcaption>Data moves on its own — people get the finished result.</figcaption>'),
    ('Настраиваем рекламу, разрабатываем сайты и автоматизируем рутину — весь путь клиента от первого клика до оплаты. Встраиваем в 1С, мессенджеры и почту, сопровождаем после запуска.',
     'Configurăm publicitatea, dezvoltăm site-uri și automatizăm rutina — tot drumul clientului, de la primul clic la plată. Integrăm cu 1C, mesageria și e-mailul și rămânem alături după lansare.',
     'We set up ads, build websites and automate routine work — the whole customer journey, from first click to payment. We plug into 1C, messengers and email, and stay with you after launch.'),
    ('Разбор задачи, 30 минут <small class="btn-sub">в Telegram — без обязательств</small>',
     'Analiza situației, 30 de minute <small class="btn-sub">pe Telegram — fără obligații</small>',
     '30-minute project review <small class="btn-sub">on Telegram — no strings attached</small>'),
    ('Разбор задачи, 30 минут <small class="btn-sub">напишите мне в Telegram</small>',
     'Analiza situației, 30 de minute <small class="btn-sub">scrieți-mi pe Telegram</small>',
     '30-minute project review <small class="btn-sub">message me on Telegram</small>'),
    ('Посмотреть кейсы', 'Vezi proiectele', 'See the work'),
    ('aria-label="Системы в ежедневной работе"', 'aria-label="Sisteme folosite zilnic"', 'aria-label="Systems in daily use"'),
    ('<br>Система в ежедневной работе', '<br>Sistem folosit zilnic', '<br>System in daily use'),

    # ---------- Кейсы: общее ----------
    ('<b>01</b> / Кейсы', '<b>01</b> / Proiecte', '<b>01</b> / Work'),
    ('Две системы, которые <em>работают каждый день</em>', 'Două sisteme care <em>lucrează în fiecare zi</em>', 'Two systems that <em>run every single day</em>'),
    ('Не макеты и не пилоты — обе системы каждый день используют команды клиентов. Интерфейсы ниже — упрощённые копии на демо-данных.',
     'Nu machete și nici proiecte-pilot — ambele sisteme sunt folosite zilnic de echipele clienților. Interfețele de mai jos sunt copii simplificate, cu date demonstrative.',
     "Not mockups, not pilots — both systems are used by the clients' teams every day. The interfaces below are simplified copies with demo data."),
    ('<span class="case-no">Кейс 01</span>', '<span class="case-no">Proiect 01</span>', '<span class="case-no">Case 01</span>'),
    ('<span class="case-no">Кейс 02</span>', '<span class="case-no">Proiect 02</span>', '<span class="case-no">Case 02</span>'),
    ('<i class="live-dot"></i>В эксплуатации</span>', '<i class="live-dot"></i>În funcțiune</span>', '<i class="live-dot"></i>In production</span>'),
    ('<dt>Клиент</dt>', '<dt>Client</dt>', '<dt>Client</dt>'),
    ('<dt>Отрасль</dt>', '<dt>Domeniu</dt>', '<dt>Industry</dt>'),
    ('<dt>Команда</dt>', '<dt>Echipa</dt>', '<dt>Team</dt>'),
    ('<h4>Задача</h4>', '<h4>Problema</h4>', '<h4>The problem</h4>'),
    ('<h4>Что сделали</h4>', '<h4>Ce am făcut</h4>', '<h4>What we built</h4>'),
    ('<h4>Результат</h4>', '<h4>Rezultat</h4>', '<h4>Results</h4>'),
    ('<span>Стек</span>', '<span>Tehnologii</span>', '<span>Stack</span>'),
    ('<span class="r">демо</span>', '<span class="r">demo</span>', '<span class="r">demo</span>'),

    # ---------- Кейс 4Power ----------
    ('Система управления автосервисом <em>4Power Club</em>', 'Sistem de management pentru service-ul auto <em>4Power Club</em>', 'Workshop management system for <em>4Power Club</em>'),
    ('<dd>Автосервис · Кишинёв</dd>', '<dd>Service auto · Chișinău</dd>', '<dd>Car service · Chișinău</dd>'),
    ('<span class="k">Автосервис · Кишинёв</span>', '<span class="k">Service auto · Chișinău</span>', '<span class="k">Car service · Chișinău</span>'),
    ('<dd>6 постов, 5–6 механиков, 3 приёмщика, склад</dd>', '<dd>6 posturi, 5–6 mecanici, 3 recepționeri, depozit</dd>', '<dd>6 bays, 5–6 mechanics, 3 service advisors, warehouse</dd>'),
    ('<b>Слой поверх 1С.</b> 1С остаётся учётом, а система ведёт процесс: статусы машин, ответственные, связь «запчасть ↔ машина», уведомления.',
     '<b>Un strat peste 1C.</b> 1C rămâne contabilitatea, iar sistemul conduce procesul: statusurile mașinilor, responsabilii, legătura „piesă ↔ mașină”, notificările.',
     '<b>A layer on top of 1C.</b> 1C stays the accounting system; this one runs the process: car statuses, who is responsible, the “part ↔ car” link, notifications.'),
    ('Информация терялась на стыках между людьми: приёмщик не узнавал, что машина готова, если её принимал коллега; машины, ждущие заказных запчастей 2–3 недели, забывались; склад принимал детали, но никому не сообщал; запчасти, заказанные под машину не на территории, теряли привязку к ней; клиентов о готовности оповещали вручную. Учёт запчастей при этом вёлся в 1С.',
     'Informația se pierdea între oameni: recepționerul nu afla că mașina e gata dacă o primise un coleg; mașinile care așteptau 2–3 săptămâni piese comandate erau uitate; depozitul primea piesele, dar nu anunța pe nimeni; piesele comandate pentru o mașină aflată în afara service-ului își pierdeau legătura cu ea; clienții erau anunțați manual că mașina e gata. Evidența pieselor se ținea în 1C.',
     "Information got lost between people: an advisor didn't learn a car was ready if a colleague had checked it in; cars waiting 2–3 weeks for ordered parts were forgotten; the warehouse received parts but told no one; parts ordered for a car that wasn't on site lost their link to it; customers were told their car was ready by hand. Parts were tracked in 1C."),
    ('<b>Доска машин в реальном времени</b> — по дням и по колонкам статусов, срочные подсвечиваются, видно, сколько дней машина ждёт.',
     '<b>Panou cu mașinile în timp real</b> — pe zile și pe coloane de status; cele urgente sunt evidențiate și se vede câte zile așteaptă fiecare mașină.',
     '<b>Real-time car board</b> — by day and by status column; urgent cars are highlighted, and you can see how many days each one has been waiting.'),
    ('<b>Учёт запчастей по циклу</b> «машины ждут → заказано → на складе → установка» и отдельная вкладка для деталей, пришедших без привязки к машине.',
     '<b>Evidența pieselor pe tot ciclul</b> „mașina așteaptă → comandat → în depozit → montaj” și o filă separată pentru piesele venite fără legătură cu o mașină.',
     '<b>Parts tracked through the full cycle</b> “car waiting → ordered → in stock → fitted”, plus a separate tab for parts that arrived without a linked car.'),
    ('<b>Синхронизация с 1С</b> — приходы на склад подтягиваются автоматически, без двойного ввода.',
     '<b>Sincronizare cu 1C</b> — intrările în depozit se preiau automat, fără introducere dublă.',
     '<b>1C sync</b> — warehouse receipts come in automatically, with no double entry.'),
    ('<b>«Экран цеха»</b> — общий монитор для механиков, ничего ставить не нужно.',
     '<b>„Ecranul atelierului”</b> — un monitor comun pentru mecanici, fără nimic de instalat.',
     '<b>“Shop floor screen”</b> — a shared monitor for the mechanics, nothing to install.'),
    ('<b>Пороги и рабочие часы</b> — система сама поднимает тревогу, если машина или деталь застряли дольше нормы.',
     '<b>Praguri și ore de lucru</b> — sistemul dă singur alarma dacă o mașină sau o piesă stă blocată mai mult decât e normal.',
     '<b>Thresholds and working hours</b> — the system raises the alarm by itself when a car or a part is stuck longer than it should be.'),
    ('<b>Уведомления</b> сотрудникам в Telegram и автоматические уведомления клиентам о готовности авто.',
     '<b>Notificări</b> pentru angajați în Telegram și mesaje automate către clienți când mașina e gata.',
     '<b>Notifications</b> to staff in Telegram and automatic messages to customers when their car is ready.'),
    ('<b>Ежедневная сводка владельцу.</b>', '<b>Raport zilnic pentru proprietar.</b>', '<b>A daily summary for the owner.</b>'),
    ('<b>Поиск</b> по госномеру, VIN, телефону, фамилии, номеру наряда; роли и доступы сотрудников.',
     '<b>Căutare</b> după numărul de înmatriculare, VIN, telefon, nume sau numărul comenzii; roluri și drepturi de acces pentru angajați.',
     '<b>Search</b> by plate number, VIN, phone, surname or work order number; staff roles and access rights.'),
    ('Упрощённый макет доски машин 4Power Club на демо-данных: колонки «В ожидании ремонта», «Ждёт запчасти», «Готова».',
     'Machetă simplificată a panoului de mașini 4Power Club, cu date demonstrative: coloanele „Așteaptă reparația”, „Așteaptă piese”, „Gata”.',
     'Simplified mockup of the 4Power Club car board with demo data: columns “Waiting for repair”, “Waiting for parts”, “Ready”.'),
    ('<span>4Power · доска машин</span>', '<span>4Power · panou mașini</span>', '<span>4Power · car board</span>'),
    ('<span>Сегодня</span><span>6 постов</span><span>склад · синхр. с 1С</span>', '<span>Azi</span><span>6 posturi</span><span>depozit · sincr. 1C</span>', '<span>Today</span><span>6 bays</span><span>stock · 1C sync</span>'),
    ('<h5>В ожидании ремонта ', '<h5>Așteaptă reparația ', '<h5>Waiting for repair '),
    ('<h5>Ждёт запчасти ', '<h5>Așteaptă piese ', '<h5>Waiting for parts '),
    ('<h5>Готова ', '<h5>Gata ', '<h5>Ready '),
    ('пост 3 · 1 дн<', 'post 3 · 1 zi<', 'bay 3 · 1 day<'),
    ('пост 5 · сегодня<', 'post 5 · azi<', 'bay 5 · today<'),
    ("""data-labels='["заказано · 9 дн","деталь на складе","клиент уведомлён"]'""",
     """data-labels='["comandat · 9 zile","piesa e în depozit","client anunțat"]'""",
     """data-labels='["ordered · 9 days","part in stock","customer notified"]'"""),
    ('>заказано · 9 дн<', '>comandat · 9 zile<', '>ordered · 9 days<'),
    ('>ждёт 16 дн · срочно<', '>așteaptă 16 zile · urgent<', '>waiting 16 days · urgent<'),
    ('>клиент уведомлён<', '>client anunțat<', '>customer notified<'),
    ('✓ Клиенту ушло сообщение в WhatsApp', '✓ Clientul a primit mesaj pe WhatsApp', '✓ Customer got a WhatsApp message'),
    ('<span>автопроверок, все проходят</span>', '<span>verificări automate, toate trec</span>', '<span>automated checks, all passing</span>'),
    ('<span>постов в одной системе</span>', '<span>posturi într-un singur sistem</span>', '<span>bays in one system</span>'),
    ('<span>приёмщика видят одно и то же</span>', '<span>recepționeri văd același lucru</span>', '<span>advisors see the same picture</span>'),
    ('<b>1С</b><span>синхронизация склада</span>', '<b>1C</b><span>sincronizare depozit</span>', '<b>1C</b><span>warehouse sync</span>'),
    ('<li>В эксплуатации — вся команда работает в одной системе.</li>', '<li>În funcțiune — toată echipa lucrează într-un singur sistem.</li>', '<li>Live — the whole team works in one system.</li>'),
    ('<li>Меньше созвонов и переписки «готова ли машина / пришла ли деталь» — статус видно, а не выясняется.</li>',
     '<li>Mai puține apeluri și mesaje de tipul „e gata mașina? / a venit piesa?” — statusul se vede, nu trebuie aflat.</li>',
     '<li>Fewer calls and chats along the lines of “is the car ready? / did the part arrive?” — the status is visible, not something you have to chase.</li>'),
    ('<li>Ни одна машина не теряется в ожидании запчастей — система сама напоминает.</li>',
     '<li>Nicio mașină nu se pierde în așteptarea pieselor — sistemul amintește singur.</li>',
     '<li>No car gets forgotten while waiting for parts — the system sends reminders on its own.</li>'),
    ('<li>886 автоматических проверок — все проходят. Они идут против настоящей базы и настоящего сервера, без заглушек: проверяется путь целиком — вход, права, запрос, запись, ответ.</li>',
     '<li>886 de verificări automate — toate trec. Rulează pe baza de date și serverul reale, fără simulări: se verifică tot drumul — autentificare, drepturi, cerere, scriere, răspuns.</li>',
     '<li>886 automated checks — all passing. They run against the real database and the real server, no mocks: the whole path is checked — login, permissions, request, write, response.</li>'),
    ('<li>Под капотом: 68 адресов API, 17 таблиц, 8 экранов; на каждые 4 строки кода — строка теста.</li>',
     '<li>Sub capotă: 68 de adrese API, 17 tabele, 8 ecrane; la fiecare 4 rânduri de cod — un rând de test.</li>',
     '<li>Under the hood: 68 API endpoints, 17 tables, 8 screens; one line of tests for every 4 lines of code.</li>'),
    ('1С (REST API) · SSE (обновления в реальном времени)', '1C (REST API) · SSE (actualizări în timp real)', '1C (REST API) · SSE (real-time updates)'),

    # ---------- Кейс FastLoad ----------
    ('FastLoad — платформа для диспетчерской <em>MIRTEH GRUP</em>', 'FastLoad — platformă pentru dispeceratul <em>MIRTEH GRUP</em>', 'FastLoad — a platform for the <em>MIRTEH GRUP</em> dispatch team'),
    ('<dd>Логистика · США</dd>', '<dd>Logistică · SUA</dd>', '<dd>Logistics · USA</dd>'),
    ('<span class="k">Логистика · США</span>', '<span class="k">Logistică · SUA</span>', '<span class="k">Logistics · USA</span>'),
    ('<dd>17 диспетчеров, 98 водителей</dd>', '<dd>17 dispeceri, 98 de șoferi</dd>', '<dd>17 dispatchers, 98 drivers</dd>'),
    ('Диспетчеры вручную мониторили биржу грузов Sylectus (американская площадка, где брокеры выкладывают грузы): обновляли страницу, сверяли каждый груз с местоположением и типом трака каждого водителя, вручную писали брокерам ставки. Хорошие грузы разбирают за минуты, а всё, что публиковалось вне смены, компания теряла.',
     'Dispecerii monitorizau manual bursa de mărfuri Sylectus (o platformă americană unde brokerii publică încărcături): reîncărcau pagina, verificau fiecare încărcătură față de locația și tipul camionului fiecărui șofer și scriau manual oferte brokerilor. Încărcăturile bune dispar în câteva minute, iar tot ce se publica în afara turei era pierdut.',
     "Dispatchers watched the Sylectus load board by hand (a US marketplace where brokers post freight): refreshing the page, checking every load against each driver's location and truck type, and writing bids to brokers manually. Good loads are gone within minutes, and anything posted outside working hours was simply lost."),
    ('<b>Мониторинг биржи 24/7.</b> Система сама забирает новые грузы и подбирает их под каждого водителя — по зоне и радиусу, типу трака, датам и лимиту пробега; сразу считает порожний пробег до точки загрузки.',
     '<b>Monitorizarea bursei 24/7.</b> Sistemul preia singur încărcăturile noi și le potrivește fiecărui șofer — după zonă și rază, tipul camionului, date și limita de kilometraj; calculează imediat drumul în gol până la încărcare.',
     '<b>24/7 load board monitoring.</b> The system pulls new loads on its own and matches them to each driver — by area and radius, truck type, dates and mileage limit — and instantly works out the deadhead miles to pickup.'),
    ('<b>Мгновенные уведомления в Telegram.</b> Подходящий груз приходит диспетчеру сразу после публикации — уже подобранный под конкретного водителя.',
     '<b>Notificări instant în Telegram.</b> Încărcătura potrivită ajunge la dispecer imediat după publicare — deja potrivită pentru un anumit șofer.',
     "<b>Instant Telegram alerts.</b> A matching load reaches the dispatcher right after it's posted — already matched to a specific driver."),
    ('<b>Ставка брокеру в один клик.</b> Письмо уходит с Gmail водителя или компании с готовой подписью и описанием трака (доступ к Gmail прошёл проверку Google).',
     '<b>Ofertă către broker dintr-un clic.</b> E-mailul pleacă din Gmail-ul șoferului sau al companiei, cu semnătură și descrierea camionului (accesul la Gmail a trecut verificarea Google).',
     "<b>One-click bids to brokers.</b> The email goes out from the driver's or the company's Gmail with a ready signature and truck details (Gmail access passed Google's verification)."),
    ('<b>Кабинет водителя:</b> свои грузы, профиль, зоны работы, подключение Gmail и Telegram.',
     '<b>Contul șoferului:</b> încărcăturile proprii, profilul, zonele de lucru, conectarea Gmail și Telegram.',
     '<b>Driver portal:</b> their loads, profile, working areas, Gmail and Telegram connection.'),
    ('<b>Панель SMS-рассылок с AI-вариативностью текстов</b> — каждое сообщение уникально, меньше попадает в спам.',
     '<b>Panou pentru SMS-uri în masă, cu texte variate prin AI</b> — fiecare mesaj e unic și ajunge mai rar în spam.',
     '<b>Bulk SMS panel with AI-varied texts</b> — every message is unique, so fewer land in spam.'),
    ('Упрощённый макет интерфейса FastLoad на демо-данных: список подобранных грузов с кнопкой отправки ставки.',
     'Machetă simplificată a interfeței FastLoad, cu date demonstrative: lista încărcăturilor potrivite, cu butonul de trimitere a ofertei.',
     'Simplified mockup of the FastLoad interface with demo data: a list of matched loads with a send-bid button.'),
    ('<span>FastLoad · подходящие грузы</span>', '<span>FastLoad · încărcături potrivite</span>', '<span>FastLoad · matched loads</span>'),
    ('<span>Водитель: Demo D.</span>', '<span>Șofer: Demo D.</span>', '<span>Driver: Demo D.</span>'),
    ('<span>зона: Southeast · 300 mi</span>', '<span>zonă: Southeast · 300 mi</span>', '<span>area: Southeast · 300 mi</span>'),
    ('<span class="tag">новый · 4 сек</span>', '<span class="tag">nou · 4 sec</span>', '<span class="tag">new · 4 sec</span>'),
    ('<span class="tag">12 мин</span>', '<span class="tag">12 min</span>', '<span class="tag">12 min</span>'),
    ('<span class="tag">ставка отправлена</span>', '<span class="tag">ofertă trimisă</span>', '<span class="tag">bid sent</span>'),
    ('<span>порожний ', '<span>gol ', '<span>deadhead '),
    ('✓ Отправлено', '✓ Trimis', '✓ Sent'),
    ('<span>грузов за счёт нерабочих часов</span>', '<span>încărcături în plus din orele nelucrătoare</span>', '<span>more loads from off-hours</span>'),
    ('<span>мониторинг биржи</span>', '<span>monitorizarea bursei</span>', '<span>load board monitoring</span>'),
    ('<span>диспетчеров в системе</span>', '<span>dispeceri în sistem</span>', '<span>dispatchers on the system</span>'),
    ('<span>водителей, под которых подбираются грузы</span>', '<span>șoferi pentru care se potrivesc încărcături</span>', '<span>drivers getting loads matched</span>'),
    ('<li>Система ловит грузы, пока диспетчеры не на смене.</li>', '<li>Sistemul prinde încărcături cât timp dispecerii nu sunt de tură.</li>', '<li>The system catches loads while dispatchers are off shift.</li>'),
    ('<li>Главное — время: диспетчеры не сидят на бирже с ручным обновлением, а работают только с уже подобранными грузами.</li>',
     '<li>Principalul e timpul: dispecerii nu mai stau pe bursă reîncărcând pagina, ci lucrează doar cu încărcături deja potrivite.</li>',
     '<li>Above all, time: dispatchers no longer sit on the load board hitting refresh — they work only with loads that are already matched.</li>'),
    ('<li>В ежедневной работе у всей команды, клиент на платном сопровождении.</li>',
     '<li>Folosit zilnic de toată echipa; clientul are un contract plătit de mentenanță.</li>',
     '<li>Used daily by the whole team; the client is on a paid support plan.</li>'),
    ('<li>На базе проекта вырос отдельный продукт — ', '<li>Din proiect a crescut un produs separat — ', '<li>The project grew into a standalone product — '),

    # ---------- Кто делает ----------
    ('<b>02</b> / Кто делает', '<b>02</b> / Cine lucrează', '<b>02</b> / Who does the work'),
    ('alt="Максим Лазарев"', 'alt="Maxim Lazarev"', 'alt="Maxim Lazarev"'),
    ('<figcaption>Кишинёв · с 2019</figcaption>', '<figcaption>Chișinău · din 2019</figcaption>', '<figcaption>Chișinău · since 2019</figcaption>'),
    ('>Максим Лазарев</h2>', '>Maxim Lazarev</h2>', '>Maxim Lazarev</h2>'),
    ('Основатель · разработка и запуск', 'Fondator · dezvoltare și lansare', 'Founder · development and launch'),
    ('Проект ведёт один человек — от первого разговора до запуска. Никаких менеджеров между вами и тем, кто делает работу. Под задачу подключаю проверенных специалистов.',
     'Proiectul îl conduce un singur om — de la prima discuție până la lansare. Fără manageri între dumneavoastră și cel care face munca. Când proiectul o cere, aduc specialiști verificați.',
     'One person runs the project — from the first conversation to launch. No managers between you and the person doing the work. When the job calls for it, I bring in specialists I trust.'),

    # ---------- Услуги ----------
    ('<b>03</b> / Услуги', '<b>03</b> / Servicii', '<b>03</b> / Services'),
    ('От первого клика <em>до оплаты</em>', 'De la primul clic <em>până la plată</em>', 'From first click <em>to payment</em>'),
    ('Можно взять одну услугу или собрать связку: реклама приводит клиентов, сайт их встречает, система не даёт заявке потеряться.',
     'Puteți lua un singur serviciu sau mai multe împreună: reclama aduce clienți, site-ul îi întâmpină, iar sistemul nu lasă nicio cerere să se piardă.',
     'Take a single service or combine them: ads bring customers in, the website greets them, and the system makes sure no lead slips through.'),
    ('<span>Услуга</span><span>Что входит</span><span>Срок</span><span>Цена</span>', '<span>Serviciu</span><span>Ce include</span><span>Termen</span><span>Preț</span>', "<span>Service</span><span>What's included</span><span>Timeline</span><span>Price</span>"),
    ('<small>Срок</small>', '<small>Termen</small>', '<small>Timeline</small>'),
    ('<small>Цена</small>', '<small>Preț</small>', '<small>Price</small>'),
    ('</small>сайт от €600<br>система от €1 500<', '</small>site de la €600<br>sistem de la €1.500<', '</small>website from €600<br>system from €1,500<'),
    ('</small>запуск от €250<br>+ от €250/мес<', '</small>lansare de la €250<br>+ de la €250/lună<', '</small>setup from €250<br>+ from €250/mo<'),
    ('</small>от €150/мес<', '</small>de la €150/lună<', '</small>from €150/mo<'),
    ('</small>от €800<', '</small>de la €800<', '</small>from €800<'),
    ('</small>от €350<', '</small>de la €350<', '</small>from €350<'),
    ('<span class="svc-name">Аудит процессов</span>', '<span class="svc-name">Audit de procese</span>', '<span class="svc-name">Process audit</span>'),
    ('Разбираю, где бизнес теряет время и деньги на ручной работе, и выдаю план: что автоматизировать, в каком порядке и что это даст. План остаётся у вас, а стоимость аудита засчитывается в проект, если продолжаем.',
     'Analizez unde afacerea pierde timp și bani pe muncă manuală și vă dau un plan: ce automatizăm, în ce ordine și ce aduce. Planul rămâne la dumneavoastră, iar costul auditului se scade din proiect dacă mergem mai departe.',
     'I find where the business loses time and money on manual work and hand you a plan: what to automate, in what order, and what it will give you. The plan is yours to keep, and the audit fee counts towards the project if we continue.'),
    ('</small>1–2 недели', '</small>1–2 săptămâni', '</small>1–2 weeks'),
    ('<span class="svc-name">Разработка</span>', '<span class="svc-name">Dezvoltare</span>', '<span class="svc-name">Development</span>'),
    ('Сайты, личные кабинеты и внутренние системы — от лендинга до платформы для всей команды. SEO-основа включена: скорость, структура, мета-теги, карта сайта.',
     'Site-uri, conturi pentru clienți și sisteme interne — de la o pagină de prezentare la o platformă pentru toată echipa. Baza SEO e inclusă: viteză, structură, meta-taguri, hartă a site-ului.',
     'Websites, client portals and internal systems — from a landing page to a platform for the whole team. SEO basics included: speed, structure, meta tags, sitemap.'),
    ('</small>по объёму', '</small>după volum', '</small>depends on scope'),
    ('<span class="svc-name">Автоматизация</span>', '<span class="svc-name">Automatizare</span>', '<span class="svc-name">Automation</span>'),
    ('Одна конкретная задача, собранная от и до: интеграция, AI-агент, уведомления, бэк-офис. Встраивается в 1С, мессенджеры, почту и сервисы, которые у вас уже работают.',
     'O problemă concretă, rezolvată cap-coadă: integrare, agent AI, notificări, back-office. Se integrează cu 1C, mesageria, e-mailul și serviciile pe care le folosiți deja.',
     'One specific job, built end to end: an integration, an AI agent, notifications, a back office. It plugs into 1C, messengers, email and the tools you already use.'),
    ('</small>по задаче', '</small>după proiect', '</small>per project'),
    ('<span class="svc-name">Реклама</span>', '<span class="svc-name">Publicitate</span>', '<span class="svc-name">Advertising</span>'),
    ('Настройка и ведение рекламы в Google и Meta (Facebook, Instagram), аналитика и пиксели. Заявки с рекламы сразу попадают в вашу систему, а не теряются в переписке. Рекламный бюджет вы платите площадке напрямую — моя плата фиксированная.',
     'Configurarea și administrarea reclamelor în Google și Meta (Facebook, Instagram), analitică și pixeli. Cererile din reclame ajung direct în sistemul dumneavoastră, nu se pierd prin conversații. Bugetul de publicitate îl plătiți direct platformei — onorariul meu e fix.',
     'Setting up and running ads on Google and Meta (Facebook, Instagram), plus analytics and pixels. Leads from ads land straight in your system instead of getting lost in chats. You pay the ad budget to the platform directly — my fee is fixed.'),
    ('</small>запуск и ведение', '</small>lansare și administrare', '</small>launch and management'),
    ('<span class="svc-name">Аудит безопасности</span>', '<span class="svc-name">Audit de securitate</span>', '<span class="svc-name">Security audit</span>'),
    ('Базовая проверка сайта или системы: уязвимости, настройки сервера и HTTPS, утечки персональных данных, работа cookie и согласий по закону 195/2024 (техническая часть — вместе с вашим юристом). На выходе — отчёт с приоритетами и план исправлений. Только по договору и с вашего письменного разрешения.',
     'Verificare de bază a site-ului sau a sistemului: vulnerabilități, setările serverului și HTTPS, scurgeri de date personale, funcționarea cookie-urilor și a consimțămintelor conform Legii 195/2024 (partea tehnică — împreună cu juristul dumneavoastră). Rezultatul: un raport cu priorități și un plan de remediere. Doar pe bază de contract și cu permisiunea dumneavoastră scrisă.',
     "A baseline check of your website or system: vulnerabilities, server and HTTPS settings, personal data leaks, and how cookies and consent work under Moldova's Law 195/2024 (the technical side — together with your lawyer). You get a prioritised report and a fix plan. Only under contract and with your written permission."),
    ('<span class="svc-name">Сопровождение</span>', '<span class="svc-name">Mentenanță</span>', '<span class="svc-name">Ongoing support</span>'),
    ('Поддержка, доработки, мониторинг, быстрые ответы. Система остаётся вашей.',
     'Suport, îmbunătățiri, monitorizare, răspunsuri rapide. Sistemul rămâne al dumneavoastră.',
     'Support, improvements, monitoring, quick answers. The system stays yours.'),
    ('</small>ежемесячно', '</small>lunar', '</small>monthly'),

    # ---------- Калькулятор ----------
    ('<b>04</b> / Калькулятор потерь', '<b>04</b> / Calculator de pierderi', '<b>04</b> / Loss calculator'),
    ('Сколько стоят <em>потерянные заявки</em>', 'Cât vă costă <em>cererile pierdute</em>', 'What <em>lost leads</em> cost you'),
    ('Не перезвонили, забыли, ответили на следующий день — клиент ушёл к конкурентам. Посчитайте, во сколько это обходится в месяц.',
     'Nu ați sunat înapoi, ați uitat, ați răspuns a doua zi — iar clientul a plecat la concurență. Calculați cât vă costă asta pe lună.',
     "Didn't call back, forgot, replied the next day — and the customer went to a competitor. Work out what that costs you each month."),
    ('<span>Заявок в месяц</span>', '<span>Cereri pe lună</span>', '<span>Leads per month</span>'),
    ('<span>Средний чек, €</span>', '<span>Valoarea medie a comenzii, €</span>', '<span>Average order value, €</span>'),
    ('<span>Сколько заявок теряется ', '<span>Câte cereri se pierd ', '<span>Share of leads lost '),
    ('<span class="calc-label">Вы теряете примерно</span>', '<span class="calc-label">Pierdeți aproximativ</span>', '<span class="calc-label">You lose roughly</span>'),
    ('≈ €4 500', '≈ €4.500', '≈ €4,500'),
    ('<span class="calc-label">в месяц</span>', '<span class="calc-label">pe lună</span>', '<span class="calc-label">a month</span>'),
    ('Это оценка, а не обещание: заявки × средний чек × доля потерянных. Где именно теряются — видно на разборе.',
     'Este o estimare, nu o promisiune: cereri × valoarea medie × cota pierdută. Unde anume se pierd — vedem la analiză.',
     "This is an estimate, not a promise: leads × average order × share lost. Where exactly they leak — we'll see in the review."),
    ('Разберём, где теряются — 30 минут', 'Aflăm unde se pierd — 30 de minute', "Let's find where they leak — 30 minutes"),

    # ---------- Как работаем ----------
    ('<b>05</b> / Как работаем', '<b>05</b> / Cum lucrăm', '<b>05</b> / How we work'),
    ('Четыре шага — <em>от разговора до запуска</em>', 'Patru pași — <em>de la discuție la lansare</em>', 'Four steps — <em>from first chat to launch</em>'),
    ('Первый шаг — 30-минутный разбор задачи без обязательств: после него вы спокойно решаете, идти ли дальше.',
     'Primul pas este o analiză de 30 de minute, fără obligații: după ea decideți liniștit dacă mergem mai departe.',
     'The first step is a 30-minute review with no strings attached: afterwards you decide, no pressure, whether to go further.'),
    ('01 · без обязательств', '01 · fără obligații', '01 · no strings attached'),
    ('<h3>Разговор</h3>', '<h3>Discuția</h3>', '<h3>Conversation</h3>'),
    ('Опишите задачу в Telegram — текстом или голосовым, как удобнее. Созваниваемся на 30 минут и разбираем её.',
     'Descrieți situația pe Telegram — în scris sau prin mesaj vocal, cum vă e comod. Ne auzim 30 de minute și o analizăm.',
     'Describe the problem on Telegram — text or voice message, whatever is easier. We get on a 30-minute call and work through it.'),
    ('<h3>Аудит</h3>', '<h3>Auditul</h3>', '<h3>Audit</h3>'),
    ('Разбираю процессы и предлагаю решение: что делаем, сколько стоит и где границы работ. Всё фиксируем до старта.',
     'Analizez procesele și propun o soluție: ce facem, cât costă și unde sunt limitele lucrării. Totul se fixează înainte de start.',
     'I look at your processes and propose a solution: what we will do, what it costs and where the scope ends. Everything is agreed before we start.'),
    ('<h3>Сборка</h3>', '<h3>Construcția</h3>', '<h3>Build</h3>'),
    ('Показываю промежуточные результаты по ходу работы — вы видите систему задолго до сдачи.',
     'Vă arăt rezultatele intermediare pe parcurs — vedeți sistemul cu mult înainte de predare.',
     'I show you interim results as we go — you see the system long before handover.'),
    ('<h3>Запуск и сопровождение</h3>', '<h3>Lansare și mentenanță</h3>', '<h3>Launch and support</h3>'),
    ('Внедряем в работу команды и дальше развиваем систему вместе с бизнесом.',
     'Îl introducem în munca echipei și îl dezvoltăm mai departe, odată cu afacerea.',
     'We roll it out to your team and keep developing it as the business grows.'),
    ('Всё остаётся <em>у вас</em>', 'Totul <em>vă aparține</em>', 'It all <em>stays yours</em>'),
    ('<b>Код и доступы</b><span>Исходный код, серверы и аккаунты сервисов принадлежат вам с первого дня.</span>',
     '<b>Cod și accese</b><span>Codul sursă, serverele și conturile serviciilor vă aparțin din prima zi.</span>',
     '<b>Code and access</b><span>Source code, servers and service accounts belong to you from day one.</span>'),
    ('<b>Документация</b><span>Описание того, как устроена система и как её поддерживать.</span>',
     '<b>Documentație</b><span>Descrierea felului în care e construit sistemul și cum se întreține.</span>',
     '<b>Documentation</b><span>A description of how the system is built and how to maintain it.</span>'),
    ('<b>Свобода выбора</b><span>Систему сможет развивать любой разработчик — вы ни к кому не привязаны.</span>',
     '<b>Libertate de alegere</b><span>Sistemul poate fi dezvoltat de orice programator — nu depindeți de nimeni.</span>',
     "<b>Freedom to choose</b><span>Any developer can take the system further — you're not tied to anyone.</span>"),

    # ---------- FAQ ----------
    ('<b>06</b> / Вопросы', '<b>06</b> / Întrebări', '<b>06</b> / Questions'),
    ('То, что <em>неловко спросить</em>', 'Întrebările <em>pe care ezitați să le puneți</em>', 'The questions <em>people hesitate to ask</em>'),
    ('Сколько стоит и от чего зависит цена?', 'Cât costă și de ce depinde prețul?', 'How much does it cost, and what drives the price?'),
    ('От объёма: сколько процессов, интеграций и пользователей, нужна ли реклама и сайт. После первого разбора называю ориентир, после аудита — точную цену и границы работ. Цена фиксируется до старта.',
     'De volum: câte procese, integrări și utilizatori, dacă e nevoie de publicitate și de site. După prima analiză vă dau un reper, după audit — prețul exact și limitele lucrării. Prețul se fixează înainte de start.',
     'Scope: how many processes, integrations and users, and whether you need ads and a website. After the first review I give you a ballpark; after the audit, the exact price and scope. The price is fixed before we start.'),
    ('Сколько времени займёт?', 'Cât durează?', 'How long will it take?'),
    ('Аудит — 1–2 недели. Срок сборки называю после аудита: одну задачу можно запустить быстро, большую систему делаем по этапам — и первые результаты вы видите по ходу работы.',
     'Auditul durează 1–2 săptămâni. Termenul de construcție îl spun după audit: o problemă punctuală se poate lansa repede, un sistem mare îl facem pe etape — și vedeți primele rezultate pe parcurs.',
     'The audit takes 1–2 weeks. I give the build timeline after the audit: a single job can go live quickly, a large system is built in stages — and you see first results along the way.'),
    ('Работаете ли с 1С и моей CRM?', 'Lucrați cu 1C și cu CRM-ul meu?', 'Do you work with 1C and my CRM?'),
    ('Да. С 1С — через REST API, как в системе для 4Power Club. С CRM и другими сервисами — если у них есть API или выгрузка данных; это проверяем на разборе.',
     'Da. Cu 1C — prin REST API, ca în sistemul pentru 4Power Club. Cu CRM-uri și alte servicii — dacă au API sau export de date; verificăm asta la analiză.',
     'Yes. 1C through its REST API, as in the 4Power Club system. CRMs and other tools — if they have an API or a data export; we check that during the review.'),
    ('Что будет, если вы пропадёте?', 'Ce se întâmplă dacă dispăreți?', 'What happens if you disappear?'),
    ('Код, серверы и доступы — у вас с первого дня, плюс документация. Систему сможет поддерживать и развивать любой разработчик.',
     'Codul, serverele și accesele sunt la dumneavoastră din prima zi, plus documentația. Sistemul poate fi întreținut și dezvoltat de orice programator.',
     'The code, servers and access are yours from day one, along with the documentation. Any developer can maintain and extend the system.'),
    ('Работаете по договору?', 'Lucrați pe bază de contract?', 'Do you work under a contract?'),
    ('Да, всегда по письменному договору: что делаем, в какие сроки, сколько стоит и как проходит оплата.',
     'Da, mereu pe bază de contract scris: ce facem, în ce termene, cât costă și cum se face plata.',
     'Yes, always under a written contract: what we will do, the timeline, the price and how payment works.'),

    # ---------- Контакт ----------
    ('<b>07</b> / Контакт', '<b>07</b> / Contact', '<b>07</b> / Contact'),
    ('Расскажите о задаче — <em>отвечу в течение дня</em>', 'Povestiți-mi despre proiect — <em>vă răspund în decurs de o zi</em>', "Tell me about the problem — <em>I'll reply within a day</em>"),
    ('Первые 30 минут — за мой счёт: разберём задачу и решим, есть ли смысл идти дальше. Можно текстом или голосовым.',
     'Primele 30 de minute sunt din partea mea: analizăm situația și decidem dacă are sens să mergem mai departe. Puteți scrie sau trimite un mesaj vocal.',
     'The first 30 minutes are on me: we look at the problem and decide whether it makes sense to go further. Text or voice message — both work.'),
    ('Telegram <i>· быстрее всего</i>', 'Telegram <i>· cel mai rapid</i>', 'Telegram <i>· fastest</i>'),
    ('<span class="ct-label">Телефон</span>', '<span class="ct-label">Telefon</span>', '<span class="ct-label">Phone</span>'),

    # ---------- Футер ----------
    ('>Политика конфиденциальности</a>', '>Politica de confidențialitate</a>', '>Privacy policy</a>'),
    ('>Настройки cookie</button>', '>Setări cookie</button>', '>Cookie settings</button>'),
    ('MX Systems · Кишинёв, Молдова · © 2019–2026', 'MX Systems · Chișinău, Moldova · © 2019–2026', 'MX Systems · Chișinău, Moldova · © 2019–2026'),

    # ---------- Cookie-баннер ----------
    ('>Cookie и аналитика</p>', '>Cookie-uri și analitică</p>', '>Cookies and analytics</p>'),
    ('Сайт работает и без них. С вашего согласия включу Google Analytics — чтобы понимать, какие разделы полезны, — и Meta Pixel — чтобы измерять рекламу. <a href="privacy/">Подробнее</a>',
     'Site-ul funcționează și fără ele. Cu acordul dumneavoastră activez Google Analytics — ca să înțeleg ce secțiuni sunt utile — și Meta Pixel — ca să măsor reclamele. <a href="privacy/">Detalii</a>',
     "The site works without them. With your consent I'll turn on Google Analytics — to see which sections are useful — and Meta Pixel — to measure ads. <a href=\"privacy/\">Details</a>"),
    ('<span>Необходимые<small>Всегда включены: запоминают язык и этот выбор</small></span>',
     '<span>Necesare<small>Mereu active: rețin limba și această alegere</small></span>',
     '<span>Essential<small>Always on: remember your language and this choice</small></span>'),
    ('<span>Аналитика<small>', '<span>Analitică<small>', '<span>Analytics<small>'),
    ('<span>Реклама<small>', '<span>Publicitate<small>', '<span>Advertising<small>'),
    ('>Принять все</button>', '>Acceptă toate</button>', '>Accept all</button>'),
    ('>Только необходимые</button>', '>Doar cele necesare</button>', '>Essential only</button>'),
    ('>Настроить</button>', '>Setări</button>', '>Customise</button>'),
    ('>Сохранить выбор</button>', '>Salvează alegerea</button>', '>Save choice</button>'),
]


def swap_cases(html):
    """EN: кейс FastLoad идёт первым (иностранному читателю он ближе), 4Power — вторым."""
    a = html.index('        <!-- ===== КЕЙС 01 — 4Power Club =====')
    b = html.index('        <!-- ===== КЕЙС 02 — FastLoad ===== -->')
    end = html.index('\n\n      </div>\n    </section>', b)
    fp, fl = html[a:b], html[b:end]
    fp = (fp.replace('<!-- ===== КЕЙС 01 — 4Power Club =====', '<!-- ===== КЕЙС 02 — 4Power Club =====')
            .replace('Кейс 01', 'Кейс 02')
            .replace('<div class="case-body">', '<div class="case-body case-body--flip">', 1))
    fl = (fl.replace('<!-- ===== КЕЙС 02 — FastLoad ===== -->', '<!-- ===== КЕЙС 01 — FastLoad (на EN идёт первым) ===== -->')
            .replace('Кейс 02', 'Кейс 01')
            .replace('<div class="case-body case-body--flip">', '<div class="case-body">', 1))
    html = html[:a] + fl.rstrip('\n') + '\n' + fp.rstrip('\n') + html[end:]
    # Сноски в hero — в том же порядке, что и кейсы
    n4 = '<li><sup>¹</sup><a href="#case-4power"><span class="k">Автосервис · Кишинёв</span><br>Система в ежедневной работе</a></li>'
    nf = '<li><sup>²</sup><a href="#case-fastload"><span class="k">Логистика · США</span><br>Система в ежедневной работе</a></li>'
    assert n4 in html and nf in html
    html = html.replace(n4, '@@N4@@').replace(nf, '@@NF@@')
    html = (html.replace('@@N4@@', nf.replace('<sup>²</sup>', '<sup>¹</sup>'))
                .replace('@@NF@@', n4.replace('<sup>¹</sup>', '<sup>²</sup>')))
    return html


def build(lang):
    col = {'ro': 1, 'en': 2}[lang]
    html = SRC
    if lang == 'en':
        html = swap_cases(html)

    # 1) Шапочный комментарий файла
    html = re.sub(r'<!--\n  MX Systems — главная страница, русская версия.*?-->',
                  '<!--\n  MX Systems — главная страница, ' + {'ro': 'румынская', 'en': 'английская'}[lang] +
                  ' версия (/' + lang + '/).\n  ФАЙЛ СОБРАН АВТОМАТИЧЕСКИ скриптом tools/build_i18n.py из русского index.html.\n'
                  '  Не правьте его руками: правьте index.html или переводы в скрипте и запустите скрипт заново.\n-->',
                  html, count=1, flags=re.S)

    # 2) Язык страницы, адреса и превью для соцсетей
    html = html.replace('<html lang="ru">', f'<html lang="{lang}">')
    html = html.replace('<link rel="canonical" href="https://mxsystems.ro/">', f'<link rel="canonical" href="https://mxsystems.ro/{lang}/">')
    html = html.replace('<meta property="og:url" content="https://mxsystems.ro/">', f'<meta property="og:url" content="https://mxsystems.ro/{lang}/">')
    loc = {'ru': 'ru_RU', 'ro': 'ro_RO', 'en': 'en_US'}
    others = [l for l in ('ru', 'ro', 'en') if l != lang]
    html = html.replace(
        '<meta property="og:locale" content="ru_RU">\n  <meta property="og:locale:alternate" content="ro_RO">\n  <meta property="og:locale:alternate" content="en_US">',
        f'<meta property="og:locale" content="{loc[lang]}">\n  <meta property="og:locale:alternate" content="{loc[others[0]]}">\n  <meta property="og:locale:alternate" content="{loc[others[1]]}">')

    # Картинка-превью на языке страницы
    html = html.replace('https://mxsystems.ro/assets/og-image.png', f'https://mxsystems.ro/assets/og-image-{lang}.png')

    # 3) Пути: страница лежит в папке ro/ или en/ — к общим файлам ведём через ../
    html = html.replace('href="assets/', 'href="../assets/').replace('src="assets/', 'src="../assets/')

    # 4) Переключатель языков
    html = html.replace('<a href="./" hreflang="ru" lang="ru" data-lang="ru" aria-current="page">RU</a>', '<a href="../" hreflang="ru" lang="ru" data-lang="ru">RU</a>')
    html = html.replace('<a href="ro/" hreflang="ro" lang="ro" data-lang="ro">RO</a>',
                        '<a href="./" hreflang="ro" lang="ro" data-lang="ro" aria-current="page">RO</a>' if lang == 'ro' else '<a href="../ro/" hreflang="ro" lang="ro" data-lang="ro">RO</a>')
    html = html.replace('<a href="en/" hreflang="en" lang="en" data-lang="en">EN</a>',
                        '<a href="./" hreflang="en" lang="en" data-lang="en" aria-current="page">EN</a>' if lang == 'en' else '<a href="../en/" hreflang="en" lang="en" data-lang="en">EN</a>')

    # 5) Сообщения для Telegram / WhatsApp и тема письма
    html = html.replace(u.quote(MSG['ru']), u.quote(MSG[lang]))
    html = html.replace('subject=' + u.quote(SUBJ['ru']), 'subject=' + u.quote(SUBJ[lang]))

    # 6) Тексты
    missing = []
    for row in T:
        ru, tr = row[0], row[col]
        if ru not in html:
            missing.append(ru[:70])
            continue
        html = html.replace(ru, tr)
    if missing:
        sys.exit(f'[{lang}] не нашлись фразы (index.html поменялся?):\n  ' + '\n  '.join(missing))

    # 7) Проверка: кириллицы вне комментариев быть не должно
    visible = re.sub(r'<!--.*?-->', '', html, flags=re.S)
    left = sorted(set(re.findall(r'[^\s<>"]*[А-Яа-яЁё][^<>"]*', visible)))
    if left:
        sys.exit(f'[{lang}] остался непереведённый текст:\n  ' + '\n  '.join(left[:30]))

    out = ROOT / lang / 'index.html'
    out.parent.mkdir(exist_ok=True)
    out.write_text(html, encoding='utf-8')
    print(f'ok: {out.relative_to(ROOT)}')


if __name__ == '__main__':
    for lang in ('ro', 'en'):
        build(lang)
