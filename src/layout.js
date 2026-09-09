/* ============================================================
   UKŁAD STRONY — z kanwy marki (Claude Design, wrzesień 2026)
   ------------------------------------------------------------
   To jest układ z kanwy, a nie stary szablon w nowych kolorach.
   Różnice wobec poprzedniej strony:

   - pasek akcentu dzielnicy nad nagłówkiem
   - nagłówek: logo, cztery linki, telefon
   - hero dwukolumnowy 1.35/1, H1 Newsreader 400 w 52 px
   - zaufanie jako siatka 2×2 z obramowaniem, nie lista ptaszków
   - trzy sekcje, do których prowadzi nawigacja: przebieg sprawy,
     koszty, mieszkanie i kredyt
   - moduł zaufania jako dane kancelarii, nie odznaka jakości
   - znika pasek statystyk, ticker dzielnic i wideo

   CZEGO Z KANWY NIE BIORĘ
   Kanwa podaje widełki honorarium i kwoty łączne. To dane
   biznesowe, których nie potwierdzono, więc sekcja kosztów
   operuje wyłącznie opłatą sądową i odsyła do wyceny na rozmowie.
   ============================================================ */

import { FIRM } from "./domains.js";
import { icon } from "./icons.js";

/* Sieć domen w stopce — nazwy obszarów, nie dzielnic z kanwy. */
const SIEC = [
  ["rozwod.waw.pl", "Warszawa"], ["rozwodmokotow.pl", "Mokotów"],
  ["rozwodwola.pl", "Wola"], ["rozwodzoliborz.pl", "Żoliborz"],
  ["rozwodbielany.pl", "Bielany"], ["rozwodochota.pl", "Ochota"],
  ["rozwodbemowo.pl", "Bemowo"], ["rozwodtarchomin.pl", "Tarchomin"],
  ["rozwodlegionowo.pl", "Legionowo"], ["rozwodlomianki.pl", "Łomianki"],
  ["rozwodjablonna.pl", "Jabłonna"],
];

const esc = (v) => String(v ?? "").replace(/[&<>"]/g, c =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

/* ---------- DROGA PRZEZ SPRAWĘ ----------
   Rysunek pokazuje mechanizm, a nie listę: sprawa biegnie wspólnym
   pniem do odpowiedzi na pozew i dopiero tam rozgałęzia się na dwie
   ścieżki o bardzo różnej długości. To rozgałęzienie jest tu
   informacją — lista sześciu kroków je ukrywała. */

const PIEN = [
  ["Pierwsza rozmowa", "30 minut, bez opłaty"],
  ["Przygotowanie pozwu", "1–3 tygodnie"],
  ["Złożenie pozwu", "opłata 600 zł"],
  ["Odpowiedź na pozew", "2 tygodnie od doręczenia"],
];
const ZGODNA = [["Jedna rozprawa", "ok. 30 minut"], ["Wyrok", "uprawomocnienie 3 tyg."]];
const SPORNA = [["Świadkowie", "kilka terminów"], ["Opinia biegłych", "4–8 miesięcy"],
                ["Kolejne rozprawy", "co 2–4 miesiące"], ["Wyrok", "możliwa apelacja"]];

/* ---------- SCENARIUSZE MIESZKANIOWE ---------- */
const MIESZKANIE = [
  { nr: 1, ikona: "mieszkanie", tytul: "Zostaję i spłacam drugą stronę",
    cytat: "Chcę zostać w mieszkaniu z dziećmi i mam zdolność, żeby udźwignąć ratę sama.",
    kroki: ["Wycena mieszkania i ustalenie spłaty — zwykle połowa różnicy między wartością a saldem kredytu.",
            "Wniosek do banku o zwolnienie drugiego małżonka z długu. Bank bada Twoją zdolność samodzielnie.",
            "Umowa o podział majątku u notariusza albo postanowienie sądu."],
    ryzyko: "bank może odmówić. Wtedy zostajecie oboje na kredycie — scenariusz 3." },
  { nr: 2, ikona: "podzial-majatku", tytul: "Sprzedajemy i dzielimy nadwyżkę",
    cytat: "Żadne z nas nie chce ani nie może zostać w tym mieszkaniu samo.",
    kroki: ["Zgoda obojga na sprzedaż i wspólne ustalenie ceny minimalnej.",
            "Spłata kredytu z ceny sprzedaży, reszta dzielona według udziałów.",
            "Rozliczenie nakładów, jeśli któreś wnosiło środki osobiste."],
    ryzyko: "sprzedaż wymaga zgody obu stron. Bez niej pozostaje sprawa o zniesienie współwłasności." },
  { nr: 3, ikona: "kredyt-hipoteczny", tytul: "Zostajemy oboje na kredycie",
    cytat: "Na razie nie stać nas na żadne z powyższych.",
    kroki: ["Pisemne ustalenie, kto mieszka i kto płaci ratę.",
            "Dokumentowanie wpłat — po ustaniu wspólności można żądać rozliczenia połowy.",
            "Powrót do scenariusza 1 lub 2, gdy zmieni się zdolność kredytowa."],
    ryzyko: "wobec banku odpowiadacie solidarnie. Zaległość drugiej strony obciąża też Ciebie." },
];


/* ---------- ZAKRES SPRAW ----------
   Kanwa marki dala dwadziescia cztery ikony. Ta sekcja jest ich
   glownym miejscem pracy: jeden kafelek to jedna sprawa, ktora
   kancelaria prowadzi, opisana jednym zdaniem. */
const ZAKRES = [
  ["rozwod-bez-orzekania-o-winie", "Rozwód bez orzekania o winie",
   "Najkrótsza droga, gdy oboje chcecie zakończyć małżeństwo."],
  ["rozwod-z-orzeczeniem-o-winie", "Rozwód z orzeczeniem o winie",
   "Gdy wina ma znaczenie dla alimentów albo dla Ciebie samej."],
  ["separacja", "Separacja",
   "Rozdzielenie bez rozwiązania małżeństwa. Da się ją znieść."],
  ["podzial-majatku", "Podział majątku",
   "W sprawie rozwodowej albo osobno, także lata po wyroku."],
  ["mieszkanie", "Mieszkanie",
   "Kto zostaje, kto spłaca, kto korzysta do czasu podziału."],
  ["kredyt-hipoteczny", "Kredyt hipoteczny",
   "Zwolnienie z długu, sprzedaż, rozliczenie wspólnych rat."],
  ["alimenty-na-dziecko", "Alimenty na dziecko",
   "Liczone od potrzeb dziecka i możliwości zarobkowych rodzica."],
  ["alimenty-na-malzonka", "Alimenty na małżonka",
   "Po rozwodzie, gdy uzasadnia je wina albo niedostatek."],
  ["wladza-rodzicielska", "Władza rodzicielska",
   "Wspólna, ograniczona albo powierzona jednemu z rodziców."],
  ["kontakty-z-dzieckiem", "Kontakty z dzieckiem",
   "Harmonogram tygodnia, święta, wakacje, wyjazdy za granicę."],
  ["plan-wychowawczy", "Plan wychowawczy",
   "Porozumienie rodziców, które sąd może włączyć do wyroku."],
  ["mediacja", "Mediacja",
   "Ze skierowania sądu albo dobrowolnie, jeszcze przed pozwem."],
  ["rozprawa", "Reprezentacja na rozprawie",
   "Przygotowanie do przesłuchania i prowadzenie sprawy na sali."],
  ["wyrok", "Po wyroku",
   "Uzasadnienie, apelacja, wykonanie kontaktów i alimentów."],
  ["sprawa-zagraniczna", "Sprawy z elementem zagranicznym",
   "Gdy jedno z małżonków, ślub albo majątek są poza Polską."],
];

/* ---------- RYSUNEK: ROZGAŁĘZIENIE SPRAWY ----------
   Dwa warianty tej samej treści, bo poziomy diagram na 360 px daje
   tekst wielkości czterech pikseli, a pionowy na 1120 px marnuje
   dwie trzecie szerokości. Dane są jedne, renderery dwa. */

const OPIS = "Droga przez sprawę rozwodową. Wspólny początek: pierwsza rozmowa, " +
  "przygotowanie pozwu, złożenie pozwu, odpowiedź na pozew. Przy odpowiedzi sprawa " +
  "rozgałęzia się. Ścieżka zgodna to jedna rozprawa i wyrok w cztery do ośmiu miesięcy. " +
  "Ścieżka sporna to świadkowie, opinia biegłych i kolejne rozprawy, łącznie od półtora roku do trzech lat.";

const GROTY = `<defs>
    <marker id="gz" viewBox="0 0 8 8" refX="5" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--agree)"/></marker>
    <marker id="gs" viewBox="0 0 8 8" refX="5" refY="4" markerWidth="6" markerHeight="6" orient="auto">
      <path d="M0 0 L8 4 L0 8 z" fill="var(--dispute)"/></marker>
  </defs>`;

/* Etykieta wchodzi do srodka kola, wiec kolo musi byc na tyle duze, zeby
   zmiescic dwie linie tekstu. Podzial jest prosty: dwa slowa to dwie
   linie, trzy lamia sie po pierwszym slowie. Dluzszych podpisow tu nie ma. */
function linie(t) {
  const w = t.split(" ");
  if (w.length < 2) return [t];
  if (w.length === 2) return w;
  return [w[0], w.slice(1).join(" ")];
}

/* Kolo z etykieta w srodku. Jedna linia siada na linii bazowej
   przesunietej o .35em, dwie ustawiaja sie symetrycznie wzgledem srodka. */
function wezel(x, y, r, tytul, fs, wyp, obw, kol) {
  const ls = linie(tytul), lh = Math.round(fs * 1.28);
  const y0 = ls.length === 1 ? y + fs * 0.35 : y - lh / 2 + fs * 0.35;
  const tekst = ls.map((l, i) =>
    `<text x="${x}" y="${+(y0 + i * lh).toFixed(1)}" text-anchor="middle" font-size="${fs}"
          font-weight="500" fill="${kol}">${esc(l)}</text>`).join("\n    ");
  return `<circle cx="${x}" cy="${y}" r="${r}" fill="${wyp}" stroke="${obw}" stroke-width="2.5"/>
    ${tekst}`;
}

function diagramPoziomy() {
  const Y = 230, X0 = 72, KROK = 140, R = 62, RB = 46;
  const KONIEC = X0 + KROK * 3 + R;      // prawa krawedz ostatniego wezla pnia
  const YZ = 96, YS = 372, XG = 700;     // wysokosci galezi, pierwszy wezel za widelkami
  const KZ = 134, KS = 112;              // odstepy na galezi zgodnej i spornej
  const START = XG - RB;                 // tu zaczynaja sie proste odcinki galezi

  const pien = PIEN.map(([t, c], k) => {
    const x = X0 + k * KROK;
    return `${wezel(x, Y, R, t, 14, "var(--paper)", "var(--accent)", "var(--ink)")}
    <text x="${x}" y="${Y + R + 26}" text-anchor="middle" font-size="11.5" fill="var(--muted)">${esc(c)}</text>`;
  }).join("\n    ");

  const zg = ZGODNA.map(([t, c], k) => {
    const x = XG + k * KZ;
    return `${wezel(x, YZ, RB, t, 13, "var(--agree)", "var(--agree)", "#fff")}
    <text x="${x}" y="${YZ - RB - 16}" text-anchor="middle" font-size="11" fill="var(--muted)">${esc(c)}</text>`;
  }).join("\n    ");

  const sp = SPORNA.map(([t, c], k) => {
    const x = XG + k * KS;
    return `${wezel(x, YS, RB, t, 13, "var(--dispute)", "var(--dispute)", "#fff")}
    <text x="${x}" y="${YS + RB + 26}" text-anchor="middle" font-size="11" fill="var(--muted)">${esc(c)}</text>`;
  }).join("\n    ");

  return `<svg class="d-poziom" viewBox="0 0 1180 460" role="img" aria-label="${esc(OPIS)}" xmlns="http://www.w3.org/2000/svg">
  ${GROTY}
  <line x1="${X0}" y1="${Y}" x2="${KONIEC}" y2="${Y}" stroke="currentColor" stroke-width="2.5" opacity=".26"/>
  <text x="466" y="150" text-anchor="middle" font-size="10.5" font-weight="600"
        letter-spacing=".1em" fill="var(--muted)">TU SPRAWA SIĘ ROZDZIELA</text>
  <path d="M${KONIEC} ${Y} C ${KONIEC + 46} ${Y} ${START - 52} ${YZ} ${START} ${YZ}"
        stroke="var(--agree)" stroke-width="3" fill="none"/>
  <path d="M${KONIEC} ${Y} C ${KONIEC + 46} ${Y} ${START - 52} ${YS} ${START} ${YS}"
        stroke="var(--dispute)" stroke-width="3" fill="none"/>
  <line x1="${START}" y1="${YZ}" x2="${XG + KZ + RB + 32}" y2="${YZ}"
        stroke="var(--agree)" stroke-width="3" marker-end="url(#gz)"/>
  <line x1="${START}" y1="${YS}" x2="${XG + KS * 3 + RB + 32}" y2="${YS}"
        stroke="var(--dispute)" stroke-width="3" marker-end="url(#gs)"/>
  ${pien}
  ${zg}
  ${sp}
  <text x="${XG + KZ + RB + 44}" y="${YZ - 4}" font-size="16" font-weight="600" fill="var(--agree)">4–8 miesięcy</text>
  <text x="${XG + KZ + RB + 44}" y="${YZ + 16}" font-size="11.5" fill="var(--muted)">ścieżka zgodna</text>
  <text x="1176" y="${YS - 28}" text-anchor="end" font-size="16" font-weight="600" fill="var(--dispute)">1,5–3 lata</text>
  <text x="1176" y="${YS - 46}" text-anchor="end" font-size="11.5" fill="var(--muted)">ścieżka sporna</text>
</svg>`;
}

function diagramPionowy() {
  const X = 200, R = 58, KROK = 146, Y0 = 66;
  const XZ = 102, XS = 298, RB = 42, KROKB = 110, YB = 748;
  // Podpisy leza na liniach laczacych, wiec dostaja obwodke w kolorze tla.
  const podpis = (x, y, t) =>
    `<text x="${x}" y="${y}" text-anchor="middle" font-size="10.5" fill="var(--muted)"
          stroke="var(--paper)" stroke-width="4" paint-order="stroke">${esc(t)}</text>`;

  const pien = PIEN.map(([t, c], k) => {
    const y = Y0 + k * KROK;
    return `${wezel(X, y, R, t, 13, "var(--paper)", "var(--accent)", "var(--ink)")}
    ${podpis(X, y + R + 20, c)}`;
  }).join("\n    ");

  const galaz = (dane, x, kolor) => dane.map(([t, c], k) => {
    const y = YB + k * KROKB;
    return `${wezel(x, y, RB, t, 12, kolor, kolor, "#fff")}
    ${podpis(x, y + RB + 18, c)}`;
  }).join("\n    ");

  return `<svg class="d-pion" viewBox="0 0 400 1225" role="img" aria-label="${esc(OPIS)}" xmlns="http://www.w3.org/2000/svg">
  ${GROTY}
  <line x1="${X}" y1="${Y0}" x2="${X}" y2="596" stroke="currentColor" stroke-width="2.5" opacity=".26"/>
  <text x="${X}" y="624" text-anchor="middle" font-size="10.5" font-weight="600"
        letter-spacing=".1em" fill="var(--muted)">TU SPRAWA SIĘ ROZDZIELA</text>
  <path d="M${X} 640 C ${X} 686 ${XZ} 668 ${XZ} 706" stroke="var(--agree)" stroke-width="3" fill="none"/>
  <path d="M${X} 640 C ${X} 686 ${XS} 668 ${XS} 706" stroke="var(--dispute)" stroke-width="3" fill="none"/>
  <line x1="${XZ}" y1="706" x2="${XZ}" y2="940" stroke="var(--agree)" stroke-width="3" marker-end="url(#gz)"/>
  <line x1="${XS}" y1="706" x2="${XS}" y2="1160" stroke="var(--dispute)" stroke-width="3" marker-end="url(#gs)"/>
  ${pien}
  ${galaz(ZGODNA, XZ, "var(--agree)")}
  ${galaz(SPORNA, XS, "var(--dispute)")}
  <text x="${XZ}" y="984" text-anchor="middle" font-size="14.5" font-weight="600" fill="var(--agree)">4–8 miesięcy</text>
  <text x="${XZ}" y="1002" text-anchor="middle" font-size="10.5" fill="var(--muted)">ścieżka zgodna</text>
  <text x="${XS}" y="1196" text-anchor="middle" font-size="14.5" font-weight="600" fill="var(--dispute)">1,5–3 lata</text>
  <text x="${XS}" y="1214" text-anchor="middle" font-size="10.5" fill="var(--muted)">ścieżka sporna</text>
</svg>`;
}

/* ============================================================
   ARKUSZ STYLÓW
   ============================================================ */
export const CSS = `/* Układ z kanwy marki. Projektowany od 360 px w górę. */
/* Sześć wartości wspólnych dla całej sieci. Akcent dzielnicy dokłada
   nagłówek strony, bo jest inny na każdej domenie. */
:root{--ink:#12203C;--paper:#FAF7F2;--chalk:#F1ECE4;
  --clay:#A85A3C;--agree:#3D6B54;--dispute:#96342C;
  --muted:#46536B;--rule:#DDD5C9;--rule-strong:#C9BFAF}
*,*::before,*::after{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--paper);color:var(--ink);
  font:400 16px/1.6 'IBM Plex Sans',system-ui,-apple-system,sans-serif;
  -webkit-font-smoothing:antialiased}
img,svg,video{max-width:100%;display:block}
a{color:var(--clay);text-decoration:underline;text-underline-offset:2px}
a:hover{color:#8E4931}
h1,h2,h3{font-family:'Newsreader',Georgia,serif;font-weight:400;color:var(--ink);
  letter-spacing:-.01em;text-wrap:balance;margin:0}
button{font:inherit;cursor:pointer}
:focus-visible{outline:2px solid var(--clay);outline-offset:2px}

.wrap{max-width:1120px;margin:0 auto;padding:0 20px}
@media(min-width:900px){.wrap{padding:0 40px}}

/* ── pasek akcentu i nagłówek ── */
.accent-bar{height:4px;background:var(--accent)}
.top{border-bottom:1px solid var(--rule);background:var(--paper);
  position:sticky;top:0;z-index:50}
.top-in{display:flex;align-items:center;justify-content:space-between;
  gap:16px;padding:14px 0}
.brand{display:flex;flex-direction:column;text-decoration:none}
.brand-name{font-family:'Newsreader',serif;font-size:18px;color:var(--ink)}
.brand-sub{font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
.top-nav{display:none;gap:26px;font-size:15px}
.top-nav a{color:var(--muted);text-decoration:none}
.top-nav a:hover{color:var(--accent)}
.top-tel{display:flex;align-items:center;gap:8px;color:var(--accent);
  font-weight:500;font-size:15px;text-decoration:none;white-space:nowrap}
@media(min-width:980px){.top-nav{display:flex}.brand-name{font-size:19px}.top-tel{font-size:17px}}

/* ── hero ── */
.hero{padding:36px 0 44px}
.hero-grid{display:grid;gap:32px}
.hero h1{font-size:clamp(31px,7vw,52px);line-height:1.08;max-width:15ch;margin:0 0 16px}
.hero-lead{font-size:clamp(16.5px,2.2vw,19px);line-height:1.55;color:var(--muted);
  max-width:46ch;margin:0 0 22px}
.hero-cta{display:flex;flex-wrap:wrap;gap:12px;margin-bottom:14px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:9px;
  font-weight:500;font-size:16px;padding:15px 26px;border-radius:3px;
  text-decoration:none;border:1.5px solid transparent;transition:.18s}
.btn-main{background:var(--clay);color:#fff;border-color:var(--clay)}
.btn-main:hover{background:#8E4931;color:#fff}
.hero-note{font-size:13.5px;line-height:1.5;color:var(--muted);max-width:52ch;margin:0 0 24px}

.trust{display:grid;grid-template-columns:1fr;gap:1px;background:var(--rule);
  border:1px solid var(--rule);border-radius:3px;overflow:hidden}
.trust div{background:var(--paper);padding:15px 17px;display:flex;gap:11px;align-items:flex-start;
  font-size:14.5px;line-height:1.45}
.trust .ico{width:19px;height:19px;flex:none;color:var(--accent);margin-top:1px}
.trust strong{font-weight:500}
@media(min-width:560px){.trust{grid-template-columns:1fr 1fr}
  .trust div:last-child:nth-child(odd){grid-column:1/-1}}
@media(min-width:980px){.hero-grid{grid-template-columns:minmax(0,1.35fr) minmax(0,1fr);gap:56px;align-items:center}
  .hero{padding:48px 0 40px}}

.hero-foto figure{margin:0}
.hero-foto img{width:100%;height:auto;border-radius:3px;border:1px solid var(--rule)}
.hero-foto figcaption{font-size:13px;line-height:1.5;color:var(--muted);margin-top:10px}

/* ── sekcje ── */
.sec{padding:52px 0;border-top:1px solid var(--rule)}
.sec-alt{background:var(--chalk)}
.sec-head{max-width:62ch;margin-bottom:28px}
.eyebrow{display:flex;align-items:center;gap:11px;font-size:11px;font-weight:600;
  letter-spacing:.14em;text-transform:uppercase;color:var(--accent);margin:0 0 10px}
.eyebrow::before{content:"";width:22px;height:2px;background:var(--accent)}
.sec h2{font-size:clamp(23px,3.6vw,30px);line-height:1.18;margin:0 0 12px}
.sec-desc{font-size:15.5px;line-height:1.6;color:var(--muted);margin:0}

/* ── przebieg sprawy: rysunek ── */
.rysunek{margin:0}
.rysunek svg{width:100%;height:auto;color:var(--ink);display:block}
.rysunek .d-poziom{display:none}
.rysunek figcaption{font-size:13.5px;line-height:1.6;color:var(--muted);
  margin-top:18px;max-width:78ch}
@media(min-width:900px){
  .rysunek .d-poziom{display:block}
  .rysunek .d-pion{display:none}
  .rysunek figcaption{margin-top:22px}
}

/* ── stara oś (nieużywana, do usunięcia przy sprzątaniu) ── */
.legenda{display:flex;flex-wrap:wrap;gap:8px 18px;margin-bottom:22px;font-size:13px;color:var(--muted)}
.legenda span{display:flex;align-items:center;gap:7px}
.kropka{width:9px;height:9px;border-radius:50%;flex:none}
.krok{display:grid;grid-template-columns:auto 1fr;gap:0 16px;padding-bottom:22px;position:relative}
.krok:last-child{padding-bottom:0}
.krok-nr{width:30px;height:30px;border-radius:50%;border:1.5px solid var(--accent);
  color:var(--accent);display:flex;align-items:center;justify-content:center;
  font-size:13px;font-weight:500;background:var(--paper);z-index:1}
.krok::before{content:"";position:absolute;left:14.5px;top:30px;bottom:0;width:1px;background:var(--rule)}
.krok:last-child::before{display:none}
.krok h3{font-family:'IBM Plex Sans',sans-serif;font-weight:600;font-size:16px;margin:4px 0 2px}
.krok-czas{font-size:12.5px;color:var(--accent);font-weight:500;margin:0 0 5px}
.krok p{font-size:14.5px;line-height:1.55;color:var(--muted);margin:0}

/* ── koszty ── */
.koszt{display:grid;gap:1px;background:var(--rule);border:1px solid var(--rule);border-radius:3px;overflow:hidden}
.koszt-poz{background:var(--paper);padding:18px 20px}
.koszt-top{display:flex;justify-content:space-between;align-items:baseline;gap:14px;margin-bottom:6px}
.koszt-top h3{font-family:'IBM Plex Sans',sans-serif;font-weight:600;font-size:15.5px}
.koszt-kwota{font-weight:600;font-size:15.5px;white-space:nowrap}
.koszt-poz p{font-size:14px;line-height:1.55;color:var(--muted);margin:0}
.tag{display:inline-block;font-size:10.5px;font-weight:600;letter-spacing:.08em;
  text-transform:uppercase;padding:3px 8px;border-radius:2px;margin-bottom:14px}
.tag-stale{color:var(--agree);background:#E6EFE9}
.tag-zmienne{color:var(--dispute);background:#F6E8E6}

/* ── mieszkanie ── */
.scen{display:grid;gap:16px}
@media(min-width:900px){.scen{grid-template-columns:repeat(3,1fr)}}
.scen-karta{background:var(--paper);border:1px solid var(--rule);border-radius:3px;
  padding:20px;display:flex;flex-direction:column;gap:12px}
.scen-nr{font-size:11px;font-weight:600;letter-spacing:.12em;text-transform:uppercase;color:var(--accent)}
.scen-karta h3{font-family:'IBM Plex Sans',sans-serif;font-weight:600;font-size:16.5px;line-height:1.3}
.scen-cytat{font-family:'Newsreader',serif;font-style:italic;font-size:15px;line-height:1.5;
  color:var(--ink);border-left:2px solid var(--accent);padding-left:13px;margin:0}
.scen-karta ol{margin:0;padding-left:19px;display:grid;gap:7px}
.scen-karta li{font-size:14px;line-height:1.5;color:var(--muted)}
.scen-ryzyko{font-size:13.5px;line-height:1.5;color:var(--muted);
  border-top:1px solid var(--rule);padding-top:11px;margin:0}
.scen-ryzyko b{color:var(--dispute);font-weight:600}

/* ── FAQ ── */
.faq{border-top:1px solid var(--rule)}
.faq details{border-bottom:1px solid var(--rule)}
.faq summary{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;
  padding:17px 0;font-weight:500;font-size:16px;line-height:1.45;cursor:pointer;list-style:none}
.faq summary::-webkit-details-marker{display:none}
.faq summary::after{content:"+";font-size:21px;line-height:1;color:var(--accent);flex:none}
.faq details[open] summary::after{content:"−"}
.faq p{font-size:15px;line-height:1.65;color:var(--muted);margin:0 0 18px;max-width:70ch;padding-right:34px}
.faq-more{margin-top:20px;font-size:15px}

/* ── formularz ── */
.form-grid{display:grid;gap:28px}
@media(min-width:900px){.form-grid{grid-template-columns:minmax(0,1fr) minmax(0,420px);gap:48px;align-items:start}}
.form-karta{background:var(--paper);border:1px solid var(--rule);border-radius:3px;padding:24px}
.pole{display:flex;flex-direction:column;gap:6px;margin-bottom:16px}
.pole label{font-size:13.5px;font-weight:500}
.pole label span{color:var(--muted);font-weight:400}
.pole input,.pole select,.pole textarea{font:inherit;font-size:15px;padding:11px 13px;
  border:1px solid var(--rule-strong);border-radius:3px;background:#fff;color:var(--ink);width:100%}
.pole input:focus,.pole select:focus,.pole textarea:focus{border-color:var(--accent);outline:none}
.pole textarea{min-height:96px;resize:vertical}
.zgoda{display:flex;gap:10px;align-items:flex-start;margin-bottom:18px}
.zgoda input{width:auto;flex:none;margin-top:3px}
.zgoda label{font-size:12.5px;line-height:1.5;color:var(--muted);font-weight:400}
.wyslij{width:100%;background:var(--clay);color:#fff;border:none;border-radius:3px;
  padding:15px;font-size:16px;font-weight:500}
.wyslij:hover{background:#8E4931}
.wyslij:disabled{opacity:.6}
.tajemnica{display:flex;gap:9px;align-items:flex-start;font-size:12.5px;line-height:1.5;
  color:var(--muted);margin:14px 0 0}
.tajemnica .ico{width:16px;height:16px;flex:none;color:var(--agree);margin-top:1px}
.ok{display:none;text-align:center;padding:26px 0}
.ok-znak{width:44px;height:44px;border-radius:50%;background:#E6EFE9;color:var(--agree);
  display:flex;align-items:center;justify-content:center;margin:0 auto 12px}
.ok h3{font-size:20px;margin-bottom:6px}
.ok p{font-size:14.5px;color:var(--muted);margin:0}

/* ── zaufanie i stopka ── */
.dane{display:grid;gap:26px}
@media(min-width:900px){.dane{grid-template-columns:minmax(0,280px) minmax(0,1fr);gap:44px;align-items:start}}
.dane-foto img{width:100%;border-radius:3px;border:1px solid var(--rule)}
.dane h2{font-size:24px;margin-bottom:10px}
.dane-bio{font-size:15.5px;line-height:1.6;color:var(--muted);max-width:58ch;margin:0 0 22px}
.dane-siatka{display:grid;gap:22px}
@media(min-width:640px){.dane-siatka{grid-template-columns:repeat(2,1fr)}}
.dane-blok h4{font-family:'IBM Plex Sans',sans-serif;font-size:11px;font-weight:600;
  letter-spacing:.13em;text-transform:uppercase;color:var(--muted);margin:0 0 9px}
.dane-blok dl{margin:0;display:grid;grid-template-columns:auto 1fr;gap:5px 14px;font-size:14px}
.dane-blok dt{color:var(--muted)}
.dane-blok dd{margin:0;font-weight:500}
.dane-blok p{font-size:14px;line-height:1.55;margin:0 0 3px}
.dane-blok .drobne{font-size:13px;color:var(--muted)}

footer{background:var(--ink);color:#C6CEDC;padding:36px 0 26px;margin-top:0}
footer a{color:#C6CEDC;text-decoration:none}
footer a:hover{color:#fff;text-decoration:underline}
.stopka-siec{display:flex;flex-wrap:wrap;gap:8px 20px;font-size:14px;
  padding-bottom:20px;border-bottom:1px solid #26314B}
.stopka-dol{display:flex;flex-wrap:wrap;justify-content:space-between;gap:12px;
  padding-top:18px;font-size:12.5px;color:#8B97AC}
.stopka-dol nav{display:flex;flex-wrap:wrap;gap:16px}
.zastrzezenie{font-size:12.5px;line-height:1.6;color:#8B97AC;margin:16px 0 0;max-width:72ch}

/* ── zakres spraw ── */
.zakres{display:grid;grid-template-columns:1fr;gap:1px;background:var(--rule);
  border:1px solid var(--rule);border-radius:3px;overflow:hidden}
.zakres>div{background:var(--paper);padding:16px 18px;display:flex;gap:12px;align-items:flex-start}
.zakres .ico{width:22px;height:22px;flex:none;color:var(--accent);margin-top:2px}
.zakres h3{font-family:'IBM Plex Sans',sans-serif;font-size:14.5px;font-weight:600;
  line-height:1.3;margin:0 0 3px}
.zakres p{font-size:13px;line-height:1.5;color:var(--muted);margin:0}
@media(min-width:560px){.zakres{grid-template-columns:1fr 1fr}}
@media(min-width:900px){.zakres{grid-template-columns:repeat(3,1fr)}}

/* ── obietnice nad formularzem ── */
.obietnice{display:grid;grid-template-columns:1fr;gap:1px;background:var(--rule);
  border:1px solid var(--rule);border-radius:3px;overflow:hidden;list-style:none;margin:0 0 22px;padding:0}
.obietnice li{background:var(--paper);padding:15px 17px;display:flex;gap:11px;
  align-items:flex-start;font-size:14px;line-height:1.45}
.obietnice .ico{width:19px;height:19px;flex:none;color:var(--accent);margin-top:1px}
.obietnice strong{font-weight:600}
@media(min-width:640px){.obietnice{grid-template-columns:1fr 1fr}}
@media(min-width:1000px){.obietnice{grid-template-columns:repeat(4,1fr)}}

/* ── formularz na całej szerokości, pola w dwóch kolumnach ── */
.form-pola{display:grid;grid-template-columns:1fr;gap:0 26px}
@media(min-width:760px){.form-pola{grid-template-columns:1fr 1fr}}
.pole-szer{grid-column:1/-1}
.form-stopka{display:flex;flex-wrap:wrap;align-items:center;gap:14px 22px;
  border-top:1px solid var(--rule);padding-top:18px}
.form-stopka .wyslij{width:auto;min-width:250px}
.form-stopka .tajemnica{margin:0;flex:1 1 240px}

/* ── ikony w nagłówkach kosztów, scenariuszy i biur ── */
.koszt-top h3,.scen-nr,.dane-blok h4{display:flex;align-items:center;gap:8px}
.koszt-top .ico{width:18px;height:18px;flex:none;color:var(--accent)}
.scen-nr .ico{width:17px;height:17px;flex:none}
.dane-blok h4 .ico{width:15px;height:15px;flex:none;color:var(--accent)}

@media(prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
`;

/* ============================================================
   STRONA GŁÓWNA
   ============================================================ */
export function buildHome({ cfg, hostname, h1, faqItems, head, schema }) {
  const tel = FIRM.phone, telTxt = FIRM.phoneLabel;
  const ptak = icon("bezplatne-30-minut");

  return `<!DOCTYPE html>
<html lang="pl">
<head>
${head}
${schema}
</head>
<body>

<div class="accent-bar"></div>

<header class="top"><div class="wrap"><div class="top-in">
  <a class="brand" href="/">
    <span class="brand-name">${esc(FIRM.attorney.replace(/^adw\.\s*/, ""))}</span>
    <span class="brand-sub">Kancelaria adwokacka${cfg.district === "Warszawa" ? "" : " · " + esc(cfg.district)}</span>
  </a>
  <nav class="top-nav">
    <a href="#zakres">Zakres spraw</a>
    <a href="#przebieg">Przebieg sprawy</a>
    <a href="#koszty">Koszty</a>
    <a href="#mieszkanie">Mieszkanie i kredyt</a>
    <a href="#pytania">Pytania</a>
  </nav>
  <a class="top-tel" href="tel:${tel}" onclick="trackCall()">${icon("konsultacja-telefoniczna")}${esc(telTxt)}</a>
</div></div></header>

<main>

<section class="hero"><div class="wrap"><div class="hero-grid">
  <div>
    <h1>${esc(h1)}</h1>
    <p class="hero-lead">${esc(cfg.lead)}</p>
    <div class="hero-cta">
      <a class="btn btn-main" href="#kontakt">Umów bezpłatną konsultację</a>
    </div>
    <p class="hero-note">To rozmowa organizacyjna — ustalamy zakres sprawy, potrzebne dokumenty.
      Po analizie dokumentów ustalamy koszt porady prawnej lub prowadzenia procesu.</p>
    <div class="trust">
      <div>${ptak}<span>Wpis <strong>${esc(FIRM.barNumber)}</strong>, ${esc(FIRM.barCouncil)}</span></div>
      <div>${ptak}<span>Pierwsze <strong>30 minut</strong> bez opłaty</span></div>
      <div>${ptak}<span>Biura <strong>Bemowo</strong> i <strong>Białołęka</strong> · online</span></div>
    </div>
  </div>
  <div class="hero-foto"><figure>
    <img src="${FIRM.photo}" width="560" height="747" decoding="async"
         alt="${esc(FIRM.attorney)}, adwokat prowadzący sprawy rozwodowe ${esc(cfg.locative)}">
    <figcaption>${esc(FIRM.attorney)}</figcaption>
  </figure></div>
</div></div></section>

<section class="sec sec-alt" id="zakres"><div class="wrap">
  <div class="sec-head">
    <p class="eyebrow">Zakres spraw</p>
    <h2>Czym się zajmuję</h2>
    <p class="sec-desc">Wyłącznie prawo rodzinne. Poniżej sprawy, które prowadzę najczęściej —
      od pierwszego pozwu po wykonanie wyroku.</p>
  </div>
  <div class="zakres">
    ${ZAKRES.map(([ik, t, o]) => `<div>${icon(ik)}<div>
      <h3>${esc(t)}</h3><p>${esc(o)}</p></div></div>`).join("\n    ")}
  </div>
</div></section>

<section class="sec" id="przebieg"><div class="wrap">
  <div class="sec-head">
    <p class="eyebrow">Przebieg sprawy</p>
    <h2>Od pierwszej rozmowy do prawomocnego wyroku</h2>
    <p class="sec-desc">Widełki z warszawskich sądów okręgowych. Twoja sprawa może być szybsza —
      nie obiecuję terminu, którego nie kontroluję.</p>
  </div>
  <figure class="rysunek">
    ${diagramPoziomy()}
    ${diagramPionowy()}
    <figcaption>Obie ścieżki mają ten sam początek. Różnica pojawia się dopiero przy odpowiedzi
      na pozew i decyduje o tym, czy sprawa potrwa pół roku, czy kilka lat. Widełki z warszawskich
      sądów okręgowych — nie obiecuję terminu, którego nie kontroluję.</figcaption>
  </figure>
</div></section>

<section class="sec sec-alt" id="koszty"><div class="wrap">
  <div class="sec-head">
    <p class="eyebrow">Koszty</p>
    <h2>Z czego składa się koszt rozwodu</h2>
    <p class="sec-desc">Cztery pozycje. Dwie są takie same dla każdego, dwie zależą od tego,
      jak potoczy się sprawa.</p>
  </div>
  <p class="tag tag-stale">Stałe — wiesz z góry</p>
  <div class="koszt" style="margin-bottom:26px">
    <div class="koszt-poz">
      <div class="koszt-top"><h3>${icon("pozew")}Opłata sądowa od pozwu</h3><span class="koszt-kwota">600 zł</span></div>
      <p>Płatna przy złożeniu pozwu. Przy rozwodzie bez orzekania o winie sąd zwraca 300 zł po
         uprawomocnieniu. Przy trudnej sytuacji finansowej można wnioskować o zwolnienie od kosztów.</p>
    </div>
    <div class="koszt-poz">
      <div class="koszt-top"><h3>${icon("dokumenty")}Honorarium kancelarii</h3><span class="koszt-kwota">wycena na rozmowie</span></div>
      <p>Ryczałt za prowadzenie sprawy w instancji, ustalany indywidualnie i zapisany w umowie.
         Pełną kwotę poznajesz przed podpisaniem. Liczba rozpraw jej nie zmienia.</p>
    </div>
  </div>
  <p class="tag tag-zmienne">Zależne od sprawy — nie u każdego</p>
  <div class="koszt">
    <div class="koszt-poz">
      <div class="koszt-top"><h3>${icon("mediacja")}Mediacja</h3><span class="koszt-kwota">wg rozporządzenia</span></div>
      <p>Przy skierowaniu przez sąd wynagrodzenie mediatora jest określone przepisami i dzielone
         zwykle po połowie. Udana mediacja zwykle oszczędza więcej, niż kosztuje.</p>
    </div>
    <div class="koszt-poz">
      <div class="koszt-top"><h3>${icon("dowody")}Opinia biegłych</h3><span class="koszt-kwota">zaliczka sądowa</span></div>
      <p>Pojawia się przy sporze o dzieci albo przy wycenie nieruchomości. Badanie w zespole
         sądowych specjalistów jest dla stron nieodpłatne; opinia rzeczoznawcy jest płatna zaliczkowo.</p>
    </div>
  </div>
</div></section>

<section class="sec" id="mieszkanie"><div class="wrap">
  <div class="sec-head">
    <p class="eyebrow">Mieszkanie i kredyt</p>
    <h2>Co się stanie z mieszkaniem i kredytem</h2>
    <p class="sec-desc">Rozwód nie rusza kredytu — dla banku dalej jesteście dwoma dłużnikami.
      Wyjścia są trzy. Przeczytaj pierwsze zdanie każdego i znajdź swoje.</p>
  </div>
  <div class="scen">
    ${MIESZKANIE.map(s => `<article class="scen-karta">
      <span class="scen-nr">${icon(s.ikona)}Scenariusz ${s.nr}</span>
      <h3>${esc(s.tytul)}</h3>
      <p class="scen-cytat">${esc(s.cytat)}</p>
      <ol>${s.kroki.map(k => `<li>${esc(k)}</li>`).join("")}</ol>
      <p class="scen-ryzyko"><b>Ryzyko:</b> ${esc(s.ryzyko)}</p>
    </article>`).join("\n    ")}
  </div>
</div></section>

<section class="sec sec-alt" id="pytania"><div class="wrap">
  <div class="sec-head">
    <p class="eyebrow">Pytania</p>
    <h2>Pytania, które słyszę najczęściej</h2>
  </div>
  <div class="faq">
    ${faqItems.map(f => `<details><summary>${esc(f.q)}</summary><p>${esc(f.a)}</p></details>`).join("\n    ")}
  </div>
  <p class="faq-more"><a href="/pytania">Zobacz wszystkie pytania i odpowiedzi →</a></p>
  <p class="sec-desc" style="margin-top:16px;font-size:13.5px">
    Odpowiedzi przygotowała ${esc(FIRM.attorney)}, wpis ${esc(FIRM.barNumber)}.
    Stan prawny na <time datetime="${new Date().toISOString().slice(0, 10)}">${new Date().toISOString().slice(0, 10)}</time>.
  </p>
</div></section>

<section class="sec" id="kontakt"><div class="wrap">
  <div class="sec-head">
    <p class="eyebrow">Kontakt</p>
    <h2>Umów bezpłatne 30 minut</h2>
    <p class="sec-desc">Oddzwaniam w ciągu 2 godzin w dni robocze. Wystarczy imię i telefon —
      resztę ustalimy w rozmowie.</p>
  </div>
  <ul class="obietnice">
    <li>${icon("bezplatne-30-minut")}<span><strong>Pierwsze 30 minut bez opłaty.</strong>
      Rozmowa organizacyjna, nie porada prawna.</span></li>
    <li>${icon("termin")}<span><strong>Oddzwaniam w 2 godziny</strong> w dni robocze,
      w godzinach 9:00–17:00.</span></li>
    <li>${icon("konsultacja-online")}<span><strong>Online albo w biurze.</strong>
      Konsultacje zdalne dla całej Polski.</span></li>
    <li>${icon("dyskrecja")}<span><strong>Tajemnica adwokacka</strong> obejmuje
      już pierwszą wiadomość.</span></li>
  </ul>
  <div class="form-karta">
    <form id="contact-form" onsubmit="submitLead(event)">
      <div class="form-pola">
        <div class="pole"><label for="imie">Imię *</label>
          <input type="text" id="imie" name="imie" required placeholder="Jak mam się do Ciebie zwracać"></div>
        <div class="pole"><label for="tel">Telefon *</label>
          <input type="tel" id="tel" name="telefon" required placeholder="600 000 000"></div>
        <div class="pole"><label for="email">E-mail <span>jeśli wolisz kontakt pisemny</span></label>
          <input type="email" id="email" name="email"></div>
        <div class="pole"><label for="temat">Czego dotyczy sprawa</label>
          <select id="temat" name="temat">
            <option value="" disabled selected>Wybierz temat</option>
            <option>Rozwód bez orzekania o winie</option>
            <option>Rozwód z orzeczeniem o winie</option>
            <option>Podział majątku wspólnego</option>
            <option>Opieka nad dziećmi i alimenty</option>
            <option>Separacja</option>
            <option>Inne</option>
          </select></div>
        <div class="pole pole-szer"><label for="wiadomosc">Krótki opis <span>kilka zdań wystarczy</span></label>
          <textarea id="wiadomosc" name="wiadomosc" placeholder="Nie musisz opisywać wszystkiego."></textarea></div>
        <div class="zgoda pole-szer">
          <input type="checkbox" id="zgoda" name="zgoda" required>
          <label for="zgoda">Zgadzam się na kontakt w sprawie mojego zapytania. Administratorem danych jest
            ${esc(FIRM.name)}. <a href="/rodo">Pełna informacja RODO</a>. *</label>
        </div>
      </div>
      <div class="form-stopka">
        <button type="submit" class="wyslij">Poproś o telefon</button>
        <p class="tajemnica">${icon("dokumenty")}<span>Dane trafiają wyłącznie do kancelarii.
          Gwiazdką oznaczono pola wymagane.</span></p>
      </div>
    </form>
    <div class="ok" id="form-success">
      <div class="ok-znak">${icon("bezplatne-30-minut")}</div>
      <h3>Dziękuję</h3>
      <p>Oddzwonię w ciągu 2 godzin w dni robocze (9:00–17:00).</p>
    </div>
  </div>
</div></section>

<section class="sec sec-alt"><div class="wrap"><div class="dane">
  <div class="dane-foto">
    <img src="${FIRM.photo}" width="560" height="747" loading="lazy" decoding="async"
         alt="${esc(FIRM.attorney)}">
  </div>
  <div>
    <h2>${esc(FIRM.attorney)}</h2>
    <p class="dane-bio">Prowadzę wyłącznie sprawy rodzinne — rozwód, podział majątku, alimenty
      i opiekę nad dziećmi. ${esc(cfg.courtNote)}</p>
    <div class="dane-siatka">
      <div class="dane-blok"><h4>Dane kancelarii</h4><dl>
        <dt>Wpis</dt><dd>${esc(FIRM.barNumber)}</dd>
        <dt>Izba</dt><dd>${esc(FIRM.barCouncil)}</dd>
        <dt>NIP</dt><dd>${esc(FIRM.nip)}</dd>
      </dl></div>
      <div class="dane-blok"><h4>Kontakt</h4>
        <p><a href="tel:${tel}" onclick="trackCall()">${esc(telTxt)}</a></p>
        <p><a href="mailto:${FIRM.email}">${esc(FIRM.email)}</a></p>
        <p class="drobne">Wiadomości odczytuję do 2 godzin w dni robocze.
          Konsultacje online i telefoniczne dla całej Polski.</p>
      </div>
      ${FIRM.offices.map((o, i) => `<div class="dane-blok">
        <h4>${icon("dojazd-do-sadu")}Biuro ${esc(o.district)}</h4>
        <p>${esc(o.street)}</p><p>${esc(o.postal)} ${esc(o.city)}</p>
        <p class="drobne">pon.–pt. 9:00–17:00${i ? ", po umówieniu" : ""}</p>
      </div>`).join("\n      ")}
    </div>
  </div>
</div></div></section>

</main>

<footer><div class="wrap">
  <div class="stopka-siec">
    ${SIEC.map(([h, n]) => h === hostname
      ? `<span style="color:#fff">${esc(n)}</span>`
      : `<a href="https://${h}">${esc(n)}</a>`).join("\n    ")}
  </div>
  <p class="zastrzezenie">Treści na tej stronie mają charakter informacyjny i nie stanowią porady
    prawnej. Ocena konkretnej sprawy wymaga zapoznania się z dokumentami.</p>
  <div class="stopka-dol">
    <span>© ${new Date().getUTCFullYear()} ${esc(FIRM.name)} · NIP ${esc(FIRM.nip)}</span>
    <nav>
      <a href="/pytania">Pytania</a>
      <a href="/polityka-prywatnosci">Polityka prywatności</a>
      <a href="/rodo">Informacja RODO</a>
    </nav>
  </div>
</div></footer>

<script src="/assets/page.js"><\/script>
</body>
</html>`;
}
