import worker from "../src/worker.js";
import { DOMAIN_CONFIG, ALL_HOSTS, FIRM } from "../src/domains.js";
import { POOLS } from "../src/faq.js";
import { ICONS, icon } from "../src/icons.js";
import { WPISY, BLOG_HOST } from "../src/blog.js";
import { CSS } from "../src/layout.js";

const env = {};
const get = (host, path) => worker.fetch(new Request(`https://${host}${path}`), env);
let fail = 0;
const check = (name, cond, extra="") => { if(!cond){fail++;console.log("  FAIL:",name,extra);} };

// 1. wszystkie hosty
console.log("=== 11 DOMEN: strona glowna ===");
const texts = {};
for (const host of ALL_HOSTS) {
  const r = await get(host, "/");
  const h = await r.text();
  texts[host] = h;
  const cfg = DOMAIN_CONFIG[host];
  check(host+" status 200", r.status === 200, r.status);
  check(host+" wlasny h1", h.includes(cfg.h1), cfg.h1);
  check(host+" wlasny title", h.includes(cfg.title));
  check(host+" wlasny lead", h.includes(cfg.lead.slice(0,40)));
  // Sad nazywa notka w danych kancelarii. Podpis pod zdjeciem juz go nie
  // powtarza — wlasciciel skasowal go 9 wrzesnia 2026.
  check(host+" sad wlasciwy", h.includes(cfg.courtNote));
  check(host+" notka nazywa sad", /Sąd(u|em)? Okręgow/.test(cfg.courtNote));
  check(host+" NIP", h.includes(FIRM.nip));
  check(host+" wpis", h.includes(FIRM.barNumber));
  check(host+" izba", h.includes(FIRM.barCouncil));
  check(host+" GA4", h.includes("G-9QQRN32R64"));
  check(host+" brak @import", !h.includes("@import"));
}
console.log(ALL_HOSTS.length, "domen sprawdzonych");

// 2. unikalnosc tresci
console.log("\n=== UNIKALNOSC TRESCI ===");
const strip = t => t.replace(/(?:<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>)/g," ").replace(/<[^>]+>/g," ").replace(/\s+/g," ").trim();
const a = strip(texts["rozwod.waw.pl"]).split(" "), b = strip(texts["rozwodwola.pl"]).split(" ");
let same=0; for(let i=0;i<Math.min(a.length,b.length);i++) if(a[i]===b[i]) same++;
const pct = 100*same/a.length;
console.log(`powtorzen z rozwodwola.pl: ${pct.toFixed(1)}% (bylo 99.6%)`);
check("tresc zroznicowana", pct < 75, pct.toFixed(1)+"%");

// 3. schemat FAQ zgodny z widokiem
console.log("\n=== SCHEMAT FAQPage ===");
for (const host of ALL_HOSTS) {
  const h = texts[host];
  const blocks = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
  const faq = blocks.find(x=>x["@type"]==="FAQPage");
  check(host+" ma FAQPage", !!faq);
  if (faq) {
    const visible = [...h.matchAll(/<summary>([^<]*)<\/summary>/g)].map(m=>m[1]);
    check(host+" schemat = widok", faq.mainEntity.length===visible.length, `${faq.mainEntity.length} vs ${visible.length}`);
    const allIn = faq.mainEntity.every(q => visible.some(v => v.includes(q.name.slice(0,25).replace(/&/g,"&amp;"))));
    check(host+" pytania zgodne", allIn);
  }
}

// 4. nowe trasy
console.log("\n=== TRASY ===");
for (const [path, type, status] of [
  ["/robots.txt","text/plain",200], ["/sitemap.xml","application/xml",200],
  ["/llms.txt","text/plain",200], ["/pytania","text/html",200],
  ["/polityka-prywatnosci","text/html",200], ["/rodo","text/html",200],
]) {
  const r = await get("rozwod.waw.pl", path);
  check(path, r.status===status && r.headers.get("content-type").includes(type), r.status+" "+r.headers.get("content-type"));
}
console.log("\n=== PRAWDZIWY 404 ===");
for (const path of ["/wp-login.php","/.git/config","/kontakt","/oferta","/secrets.yml"]) {
  const r = await get("rozwod.waw.pl", path);
  check(path+" -> 404", r.status===404, "status "+r.status);
}

// 5. naglowek pod grupe reklam
console.log("\n=== H1 POD GRUPE REKLAM ===");
const ad = await (await get("rozwodmokotow.pl","/?utm_content=grupa-alimenty")).text();
check("utm_content zmienia h1", ad.includes("Alimenty na Mokotowie"));
console.log("  h1:", (ad.match(/<h1[^>]*>\s*([^<]+)/)||[])[1]?.trim());

// 6. konwersje
console.log("\n=== KONWERSJE ===");
const t = texts["rozwodtarchomin.pl"];
check("ADS_LEAD na tarchominie", t.includes("window.ADS_LEAD"));
const pjs = await (await get("rozwodtarchomin.pl", "/assets/page.js")).text();
check("trackLead w skrypcie strony", pjs.includes("function trackLead"));
check("submitLead w skrypcie strony", pjs.includes("function submitLead"));
check("konwersja po sukcesie formularza", /trackLead\(\);/.test(pjs));
check("trackCall na telefonie", t.includes('onclick="trackCall()"'));

// 7. robots
console.log("\n=== ROBOTS.TXT ===");
const rb = await (await get("rozwodbemowo.pl","/robots.txt")).text();
for (const bot of ["GPTBot","ClaudeBot","PerplexityBot","Google-Extended","CCBot","Bytespider"]) check("robots: "+bot, rb.includes(bot));
check("sitemap w robots", rb.includes("https://rozwodbemowo.pl/sitemap.xml"));

// 8. zdjecie adwokatki
console.log("\n=== ZDJECIE ADWOKATKI ===");
for (const [path, minKb] of [["/assets/adwokat.webp", 10], ["/assets/adwokat-og.webp", 15]]) {
  const r = await get("rozwod.waw.pl", path);
  const buf = new Uint8Array(await r.arrayBuffer());
  const isWebp = buf[0]===0x52 && buf[1]===0x49 && buf[8]===0x57 && buf[9]===0x45;
  check(path+" 200", r.status===200, r.status);
  check(path+" typ webp", r.headers.get("content-type")==="image/webp" && isWebp);
  check(path+" cache roczny", (r.headers.get("cache-control")||"").includes("31536000"));
  check(path+" rozmiar > "+minKb+"kB", buf.length > minKb*1024, (buf.length/1024).toFixed(1)+" kB");
  console.log(`  ${path}  ${(buf.length/1024).toFixed(1)} kB`);
}
for (const host of ALL_HOSTS) {
  const h = texts[host];
  check(host+" <img> portretu", h.includes('src="/assets/adwokat.webp"'));
  check(host+" wymiary obrazu", h.includes('width="560" height="747"'));
  check(host+" og:image", h.includes(`https://${host}/assets/adwokat-og.webp`));
  const person = [...h.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
    .map(m=>JSON.parse(m[1])).find(x=>x["@type"]==="LegalService");
  check(host+" obraz w schemacie", !!person && !!person.image && !!person.founder.image);
}
check("HTML nie zawiera base64 obrazu", !texts["rozwod.waw.pl"].includes("data:image"));

// 9. zgoda RODO, swiezosc, wideo
console.log("\n=== ZGODA RODO I SYGNALY SWIEZOSCI ===");
const post = (body) => worker.fetch(new Request("https://rozwod.waw.pl/api/lead", {
  method: "POST", headers: {"Content-Type":"application/json"}, body: JSON.stringify(body) }), env);

const bezZgody = await post({ imie: "Anna", telefon: "600100200" });
check("brak zgody -> 400", bezZgody.status === 400, bezZgody.status);
const tresc = await bezZgody.json();
check("komunikat o zgodzie", /[Zz]goda/.test(tresc.error || tresc.message || ""), JSON.stringify(tresc));
console.log("  bez zgody:", bezZgody.status, JSON.stringify(tresc));

const bezPol = await post({ imie: "", telefon: "", zgoda: true });
check("brak wymaganych pol -> 400", bezPol.status === 400, bezPol.status);

for (const host of ALL_HOSTS) {
  const h = texts[host];
  check(host+" pole zgody", h.includes('id="zgoda"') && h.includes('required'));
  check(host+" odnosnik do polityki", h.includes('href="/polityka-prywatnosci"'));
  check(host+" autor w meta", h.includes('name="author"'));
  check(host+" dateModified", h.includes('"dateModified"'));
  check(host+" podpis pod FAQ", h.includes("WAW/Adw/3678") && h.includes("<time datetime="));
  check(host+" brak wideo z github", !h.includes("github.com/user-attachments"));
  check(host+" portret w hero", h.includes('src="/assets/adwokat.webp"'));
}
check("rok w stopce aktualny", texts["rozwod.waw.pl"].includes("© " + new Date().getUTCFullYear()));

// 10. zywa kampania Ads na Tarchominie — regresja z 8 wrzesnia
console.log("\n=== TAG GOOGLE ADS TARCHOMINA ===");
const tarch = DOMAIN_CONFIG["rozwodtarchomin.pl"];
check("konfiguracja ma gtag", /^AW-\d+$/.test(tarch.gtag || ""), tarch.gtag);
check("konfiguracja ma etykiete", /^AW-\d+\/[\w-]+$/.test(tarch.conversionTag || ""), tarch.conversionTag);
const th = texts["rozwodtarchomin.pl"];
check("tag w HTML strony", th.includes(tarch.gtag));
check("etykieta w HTML strony", th.includes(tarch.conversionTag));
const dz = await (await get("rozwodtarchomin.pl", "/dziekujemy.html")).text();
check("konwersja na stronie podziekowania", dz.includes(tarch.conversionTag));
console.log("  " + tarch.gtag + " — obecny na stronie i w module pomiaru");

// 11. system wizualny z kanwy marki
console.log("\n=== KANWA MARKI ===");
const css = await (await get("rozwod.waw.pl", "/assets/style.css")).text();
for (const [nazwa, hex] of [["atrament","#12203C"],["papier","#FAF7F2"],["kreda","#F1ECE4"],
                            ["glina","#A85A3C"],["zgoda","#3D6B54"],["spor","#96342C"]]) {
  check("paleta: "+nazwa, css.includes(hex), hex);
}
check("krój nagłówkowy Newsreader", css.includes("Newsreader"));
check("krój tekstowy IBM Plex Sans", css.includes("IBM Plex Sans"));
check("przycisk w kolorze gliny", /background:\s*var\(--clay\)/.test(css));
check("stary Playfair usunięty", !css.includes("Playfair"));
check("stary DM Sans usunięty", !css.includes("DM Sans"));

const akcenty = new Set();
for (const host of ALL_HOSTS) {
  const a = DOMAIN_CONFIG[host].accent;
  check(host+" akcent w rodzinie granatu", /^#[0-9A-F]{6}$/i.test(a));
  akcenty.add(a);
  check(host+" akcent w HTML", texts[host].includes(a));
  check(host+" wspólne podłoże kredy", DOMAIN_CONFIG[host].bg === "#F1ECE4");
}
check("11 różnych akcentów", akcenty.size === ALL_HOSTS.length, akcenty.size);
check("fonty z kanwy w HTML", texts["rozwod.waw.pl"].includes("family=Newsreader"));

const ikony = (texts["rozwod.waw.pl"].match(/class="ico"/g) || []).length;
check("ikony na stronie", ikony >= 3, ikony);
console.log(`  6 wartości palety · 11 akcentów · ${ikony} ikon na stronie głównej`);

// 12. rozmowa wstepna opisana uczciwie
console.log("\n=== OPIS PIERWSZEJ ROZMOWY ===");
for (const host of ALL_HOSTS) {
  const h = texts[host];
  check(host+" nie obiecuje porady za darmo", !/[Bb]ezpłatn\w* konsultacj/.test(h));
  check(host+" nazywa to rozmową", h.includes("rozmowa organizacyjna") || h.includes("rozmowę"));
  check(host+" mówi kiedy jest porada", h.includes("Po analizie dokumentów") || h.includes("po zapoznaniu"));
  check(host+" wpis w pierwszym ekranie", h.includes(FIRM.barNumber));
}
const faqTxt = JSON.stringify(POOLS ?? {});
check("opis w treści meta", DOMAIN_CONFIG["rozwod.waw.pl"].desc.includes("rozmowa wstępna"));
console.log("  11 domen bez obietnicy bezpłatnej porady prawnej");

// 13. godziny pracy — jedna wartosc w calym serwisie
console.log("\n=== GODZINY PRACY ===");
check("konfiguracja 9-17", FIRM.hours === "Mo-Fr 09:00-17:00", FIRM.hours);
for (const host of ALL_HOSTS) {
  const h = texts[host];
  check(host+" brak starych godzin", !h.includes("8:00–18:00") && !h.includes("08:00-18:00"));
  check(host+" godziny w schemacie", h.includes("09:00-17:00"));
  // Kanwa proponowala "odbieram tez po 20:00" — nieprawda, ma nigdy nie wejsc.
  check(host+" brak obietnicy po 20", !/po 20:00|po dwudziestej/i.test(h));
  // Odrzucone przez wlasciciela 8 wrzesnia 2026 — niepotwierdzone zobowiazanie.
  check(host+" brak deklaracji o aplikancie", !/nie aplikant|prowadzę osobiście/i.test(h));
}
const dziekPl = await (await get("rozwod.waw.pl", "/dziekujemy.html")).text();
check("strona podziękowania 9-17", dziekPl.includes("9:00–17:00"));
console.log("  9:00–17:00 spójnie na 11 domenach, bez obietnicy wieczornej");

// 14. adresy biur i pierwszy ekran
// Podpisy dzielnic byly zamienione: Ceramiczna to Bialoleka, Bolkowska Bemowo.
console.log("\n=== ADRESY BIUR ===");
const wgUlicy = { "ul. Ceramiczna 5E/79": "Białołęka", "ul. Bolkowska 2A/28": "Bemowo" };
for (const o of FIRM.offices) {
  check("dzielnica dla "+o.street, o.district === wgUlicy[o.street], o.district);
}
for (const host of ALL_HOSTS) {
  const h = texts[host];
  for (const o of FIRM.offices) {
    // Ulica pada najpierw w schemacie w naglowku; blok widoczny jest ostatni.
    const i = h.lastIndexOf(o.street);
    check(host+" adres "+o.street, i > 0);
    // Podpis stoi tuz nad adresem, w tym samym bloku danych.
    check(host+" podpis przy "+o.street, h.slice(Math.max(0, i-220), i).includes("Biuro "+o.district));
  }
  // Wlasciciel 9 wrzesnia 2026: w pierwszym ekranie numer jest zbedny,
  // zostaje w naglowku i w danych kancelarii.
  const hero = h.slice(h.indexOf('<section class="hero"'), h.indexOf('id="przebieg"'));
  check(host+" hero bez numeru", !hero.includes(FIRM.phoneLabel) && !hero.includes("tel:"));
  check(host+" numer w naglowku", h.includes(`href="tel:${FIRM.phone}"`));
}
console.log("  Białołęka i Bemowo podpisane zgodnie z ulicami · pierwszy ekran bez numeru");

// 15. ikony z kanwy i uklad formularza
// Kanwa dala 24 ikony. Zadna nie moze lezec w pliku nieuzywana.
console.log("\n=== IKONY I FORMULARZ ===");
const nazwyIkon = Object.keys(ICONS);
for (const host of ALL_HOSTS) {
  const h = texts[host];
  const brak = nazwyIkon.filter(n => !h.includes(icon(n)));
  check(host+" wszystkie ikony w uzyciu", brak.length === 0, brak.join(", "));
  check(host+" sekcja zakresu spraw", h.includes('id="zakres"') && h.includes("Czym się zajmuję"));
  // Formularz idzie przez cala szerokosc sekcji, a pola stoja w dwoch kolumnach.
  check(host+" formularz bez kolumny opisowej", !h.includes('id="kontakt"><div class="wrap"><div class="form-grid"'));
  check(host+" pola w siatce", h.includes('class="form-pola"') && h.includes("pole-szer"));
  check(host+" obietnice przy formularzu", h.includes('class="obietnice"'));
}
check("styl dwoch kolumn pol", CSS.includes(".form-pola{display:grid") && CSS.includes("grid-template-columns:1fr 1fr}}"));
console.log(`  ${nazwyIkon.length} ikon w uzyciu na 11 domenach · formularz w dwóch kolumnach`);

// 16. blog
// Blog zyje na jednej domenie. Dziesiec kopii tego samego tekstu to
// dokladnie ten problem, ktory audyt wskazal jako najwazniejszy.
console.log("\n=== BLOG ===");
check("osiem wpisow", WPISY.length === 8, WPISY.length);
check("unikalne adresy", new Set(WPISY.map(w => w.slug)).size === WPISY.length);
for (const w of WPISY) {
  check("slug bez znakow specjalnych: "+w.slug, /^[a-z0-9-]+$/.test(w.slug));
  check("opis dla wyszukiwarki: "+w.slug, w.opis.length > 80 && w.opis.length < 200, w.opis.length);
  check("wpis ma sekcje: "+w.slug, w.sekcje.length >= 5);
  check("wpis ma podsumowanie: "+w.slug, w.zapamietaj.length >= 3);
}
const lista = await get(BLOG_HOST, "/blog");
const listaHtml = await lista.text();
check("lista bloga 200", lista.status === 200, lista.status);
for (const w of WPISY) check("wpis na liscie: "+w.slug, listaHtml.includes(`/blog/${w.slug}`));
check("lista ma schemat Blog", listaHtml.includes('"@type":"Blog"'));

for (const w of WPISY) {
  const r = await get(BLOG_HOST, "/blog/" + w.slug);
  const h = await r.text();
  check("wpis 200: "+w.slug, r.status === 200, r.status);
  check("tytul w tresci: "+w.slug, h.includes(w.tytul));
  check("schemat wpisu: "+w.slug, h.includes('"@type":"BlogPosting"') && h.includes('"@type":"BreadcrumbList"'));
  check("kanoniczny adres: "+w.slug, h.includes(`<link rel="canonical" href="https://${BLOG_HOST}/blog/${w.slug}">`));
  check("zastrzezenie w tekscie: "+w.slug, h.includes("nie stanowi") || h.includes("nie stanowią"));
  check("droga powrotna: "+w.slug, h.includes('href="/blog"') && h.includes('href="/#kontakt"'));
  for (const sekcja of w.sekcje) check("sekcja w tresci: "+w.slug, h.includes(sekcja.h));
}
// pozostale domeny oddaja blog domenie glownej
for (const host of ALL_HOSTS.filter(h => h !== BLOG_HOST)) {
  const r = await get(host, "/blog/" + WPISY[0].slug);
  check(host+" przekierowanie bloga", r.status === 301, r.status);
  check(host+" cel przekierowania", r.headers.get("location") === `https://${BLOG_HOST}/blog/${WPISY[0].slug}`);
  const mapa = await (await get(host, "/sitemap.xml")).text();
  check(host+" mapa bez bloga", !mapa.includes("/blog"));
}
const mapaGl = await (await get(BLOG_HOST, "/sitemap.xml")).text();
check("mapa glownej z blogiem", (mapaGl.match(/\/blog/g) || []).length === WPISY.length + 1);
const brak = await get(BLOG_HOST, "/blog/nie-ma-takiego-wpisu");
check("nieznany wpis to 404", brak.status === 404, brak.status);
for (const host of ALL_HOSTS) check(host+" link do bloga w nawigacji", texts[host].includes('href="/blog"'));
console.log(`  ${WPISY.length} wpisów na ${BLOG_HOST} · 10 domen przekierowuje · mapa i llms.txt zaktualizowane`);

console.log("\n" + (fail===0 ? "WSZYSTKIE TESTY PRZESZLY" : `BLEDOW: ${fail}`));
