/**
 * Cloudflare Worker — Kancelaria Adwokacka Magdalena Idzik-Cieśla
 * Obsługuje wszystkie 10 domen, zapisuje leady do Supabase
 */

// ── KONFIGURACJA DOMEN ─────────────────────────────────────────────────────
const DOMAIN_CONFIG = {
  "rozwod.waw.pl":         { district: "Warszawa",  key: "warszawa",  accent: "#8B5E1A", light: "#C49A3C", bg: "#FDF6E9" },
  "rozwodbielany.pl":      { district: "Bielany",   key: "bielany",   accent: "#1A4E8B", light: "#4A7FC1", bg: "#EEF4FB" },
  "rozwodzoliborz.pl":     { district: "Żoliborz",  key: "zoliborz",  accent: "#5B2D8E", light: "#8B5EC1", bg: "#F3EEF9" },
  "rozwodwola.pl":         { district: "Wola",      key: "wola",      accent: "#8B3A1A", light: "#C46A3C", bg: "#FDF0E9" },
  "rozwodochota.pl":       { district: "Ochota",    key: "ochota",    accent: "#1A6B5B", light: "#3CA48B", bg: "#EEFAF7" },
  "rozwodmokotow.pl":      { district: "Mokotów",   key: "mokotow",   accent: "#2D4A6B", light: "#5A7FA8", bg: "#EEF2F8" },
  "rozwodtarchomin.pl":    { district: "Tarchomin", key: "tarchomin", accent: "#4A6B1A", light: "#7FA83C", bg: "#F2F7EE" },
  "rozwodlegionowo.pl":    { district: "Legionowo", key: "legionowo", accent: "#1A5E6B", light: "#3C9AA8", bg: "#EEF8FA" },
  "rozwodlomianki.pl":     { district: "Łomianki",  key: "lomianki",  accent: "#2D6B1A", light: "#5AA83C", bg: "#EEF8EE" },
  "rozwodjablonna.pl":     { district: "Jabłonna",  key: "jablonna",  accent: "#6B5B1A", light: "#A89040", bg: "#FAF7EE" },
};

const DEFAULT_CONFIG = DOMAIN_CONFIG["rozwod.waw.pl"];

// ── SUPABASE ───────────────────────────────────────────────────────────────
const SUPABASE_URL  = "https://kukvgsjrmrqtzhkszzum.supabase.co";
// Klucz anon — tylko INSERT na kancelaria_leads (RLS ogranicza resztę)
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt1a3Znc2pybXJxdHpoa3N6enVtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI5MTI0NzYsImV4cCI6MjA4ODQ4ODQ3Nn0.wOB-4CJTcRksSUY7WD7CXEccTKNxPIVF8AT8hczS5zY";

// ── GŁÓWNA OBSŁUGA ─────────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const url      = new URL(request.url);
    const hostname = url.hostname.replace(/^www\./, "");
    const cfg      = DOMAIN_CONFIG[hostname] || DEFAULT_CONFIG;

    // POST /api/lead — zapis do Supabase
    if (request.method === "POST" && url.pathname === "/api/lead") {
      return handleLead(request, cfg, hostname);
    }

    // GET /assets/style.css
    if (url.pathname === "/assets/style.css") {
      return new Response(CSS, {
        headers: { "Content-Type": "text/css; charset=utf-8", ...cacheHeaders(86400) }
      });
    }

    // GET /assets/page.js
    if (url.pathname === "/assets/page.js") {
      return new Response(buildPageJS(cfg), {
        headers: { "Content-Type": "application/javascript; charset=utf-8", ...cacheHeaders(3600) }
      });
    }

    // GET /polityka-prywatnosci
    if (url.pathname === "/polityka-prywatnosci") {
      return new Response(buildPrivacyPolicyHTML(cfg), {
        headers: { "Content-Type": "text/html; charset=utf-8", ...cacheHeaders(86400) }
      });
    }

    // GET /rodo
    if (url.pathname === "/rodo") {
      return new Response(buildRODOHTML(cfg), {
        headers: { "Content-Type": "text/html; charset=utf-8", ...cacheHeaders(86400) }
      });
    }

    // GET / — HTML strony
    return new Response(buildHTML(cfg, hostname), {
      headers: { "Content-Type": "text/html; charset=utf-8", ...cacheHeaders(300) }
    });
  }
};

// ── OBSŁUGA LEADA ──────────────────────────────────────────────────────────
async function handleLead(request, cfg, hostname) {
  let body;
  try { body = await request.json(); } catch {
    return jsonError(400, "Nieprawidłowy JSON");
  }

  const { imie, telefon, email = "", temat = "", wiadomosc = "" } = body;

  if (!imie?.trim() || !telefon?.trim()) {
    return jsonError(400, "Imię i telefon są wymagane");
  }

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/kancelaria_leads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey":        SUPABASE_ANON,
        "Authorization": `Bearer ${SUPABASE_ANON}`,
        "Prefer":        "return=minimal",
      },
      body: JSON.stringify({
        imie:          imie.trim(),
        telefon:       telefon.trim(),
        email:         email.trim(),
        temat,
        wiadomosc:     wiadomosc.trim(),
        zrodlo_domena: hostname,
        dzielnica:     cfg.district,
        status:        "nowy",
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Supabase error:", err);
      return jsonError(500, "Błąd zapisu — spróbuj ponownie");
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders() }
    });

  } catch (e) {
    console.error(e);
    return jsonError(500, "Błąd serwera");
  }
}

// ── POMOCNICZE ─────────────────────────────────────────────────────────────
function jsonError(status, msg) {
  return new Response(JSON.stringify({ ok: false, error: msg }), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders() }
  });
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin":  "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function cacheHeaders(seconds) {
  return { "Cache-Control": `public, max-age=${seconds}` };
}

// ── POLITYKA PRYWATNOŚCI ───────────────────────────────────────────────────
function buildPrivacyPolicyHTML(cfg) {
  return `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Polityka Prywatności — Kancelaria Adwokacka Magdalena Idzik-Cieśla</title>
<meta name="robots" content="noindex,follow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/style.css">
<style>
  .legal-page { max-width: 780px; margin: 0 auto; }
  .legal-page h1 { font-family: var(--serif); font-size: clamp(1.8rem,3.5vw,2.6rem); font-weight:700; color:var(--navy); margin-bottom:.5rem; }
  .legal-page h2 { font-family: var(--serif); font-size: 1.2rem; font-weight:700; color:var(--navy); margin: 2rem 0 .5rem; }
  .legal-page p, .legal-page li { font-size:.95rem; color:var(--text); line-height:1.85; font-weight:300; margin-bottom:.6rem; }
  .legal-page ul { padding-left: 1.4rem; margin-bottom:1rem; }
  .legal-page li { margin-bottom:.3rem; }
  .legal-page .meta { font-size:.8rem; color:var(--text-muted); margin-bottom:2.5rem; }
  .legal-page a { color:var(--accent); }
  .legal-nav { background:var(--white); border-bottom:1px solid var(--border); padding:.9rem var(--px); display:flex; align-items:center; gap:1rem; }
  .legal-nav a { font-family:var(--serif); font-size:1rem; font-weight:700; color:var(--navy); }
  .legal-nav span { color:var(--text-muted); font-size:.85rem; }
</style>
</head>
<body>
<nav class="legal-nav">
  <a href="/">← Kancelaria Adwokacka Magdalena Idzik-Cieśla</a>
  <span>/ Polityka Prywatności</span>
</nav>
<main>
<section style="padding:clamp(2.5rem,5vw,4rem) 0 clamp(3rem,6vw,5rem)">
  <div class="container">
    <div class="legal-page">
      <p class="section-label">Dokument prawny</p>
      <h1>Polityka Prywatności</h1>
      <p class="meta">Ostatnia aktualizacja: styczeń 2025</p>

      <h2>1. Administrator danych osobowych</h2>
      <p>Administratorem Twoich danych osobowych jest adwokat <strong>Magdalena Idzik-Cieśla</strong>, prowadząca Kancelarię Adwokacką z siedzibą przy ul. Ceramiczna 5E/79, 03-126 Warszawa.</p>
      <p>Kontakt z Administratorem: <a href="mailto:kancelaria@idzik.org.pl">kancelaria@idzik.org.pl</a> lub tel. <a href="tel:+48605089552">605 089 552</a>.</p>

      <h2>2. Jakie dane zbieramy?</h2>
      <p>Za pośrednictwem formularza kontaktowego dostępnego na stronie internetowej zbieramy:</p>
      <ul>
        <li>imię,</li>
        <li>numer telefonu,</li>
        <li>adres e-mail (opcjonalnie),</li>
        <li>krótki opis sprawy (opcjonalnie).</li>
      </ul>
      <p>Dane są przekazywane dobrowolnie. Podanie imienia i numeru telefonu jest niezbędne do umówienia bezpłatnej konsultacji.</p>

      <h2>3. Cel i podstawa prawna przetwarzania</h2>
      <ul>
        <li><strong>Odpowiedź na zapytanie i umówienie konsultacji</strong> — art. 6 ust. 1 lit. b RODO (działania zmierzające do zawarcia umowy na żądanie osoby).</li>
        <li><strong>Realizacja umowy o świadczenie pomocy prawnej</strong> — art. 6 ust. 1 lit. b RODO.</li>
        <li><strong>Wypełnienie obowiązków prawnych</strong> (m.in. przepisów regulujących zawód adwokata) — art. 6 ust. 1 lit. c RODO.</li>
        <li><strong>Prawnie uzasadniony interes Administratora</strong> (np. obrona przed roszczeniami) — art. 6 ust. 1 lit. f RODO.</li>
      </ul>

      <h2>4. Jak długo przechowujemy Twoje dane?</h2>
      <p>Dane przesłane przez formularz kontaktowy przechowujemy przez czas niezbędny do obsługi zapytania, nie dłużej niż 2 lata od ostatniego kontaktu. W przypadku nawiązania współpracy — przez okres wymagany przepisami prawa (dokumentacja adwokacka).</p>

      <h2>5. Odbiorcy danych</h2>
      <p>Twoje dane mogą być przekazywane wyłącznie:</p>
      <ul>
        <li>podmiotom świadczącym usługi IT (hosting, systemy CRM) — na podstawie umów powierzenia przetwarzania danych,</li>
        <li>pracownikom i współpracownikom kancelarii (aplikantom adwokackim, sekretariatowi) — w zakresie niezbędnym do obsługi sprawy.</li>
      </ul>
      <p>Kancelaria nie sprzedaje danych osobowych ani nie udostępnia ich podmiotom zewnętrznym w celach marketingowych.</p>

      <h2>6. Twoje prawa</h2>
      <p>Na podstawie przepisów RODO przysługuje Ci prawo do:</p>
      <ul>
        <li>dostępu do swoich danych (art. 15 RODO),</li>
        <li>sprostowania danych (art. 16 RODO),</li>
        <li>usunięcia danych — „prawo do bycia zapomnianym" (art. 17 RODO),</li>
        <li>ograniczenia przetwarzania (art. 18 RODO),</li>
        <li>przenoszenia danych (art. 20 RODO),</li>
        <li>sprzeciwu wobec przetwarzania (art. 21 RODO).</li>
      </ul>
      <p>Aby skorzystać z powyższych praw, skontaktuj się z nami: <a href="mailto:kancelaria@idzik.org.pl">kancelaria@idzik.org.pl</a>. Odpowiemy bez zbędnej zwłoki, nie później niż w terminie 30 dni.</p>

      <h2>7. Prawo do skargi</h2>
      <p>Jeśli uważasz, że przetwarzanie Twoich danych narusza przepisy RODO, masz prawo wnieść skargę do Prezesa Urzędu Ochrony Danych Osobowych (UODO), ul. Stawki 2, 00-193 Warszawa, tel. 606 950 000.</p>

      <h2>8. Pliki cookies</h2>
      <p>Strona internetowa kancelarii korzysta wyłącznie z technicznie niezbędnych plików cookies służących do prawidłowego działania strony. Nie stosujemy plików cookies marketingowych, śledzących ani analitycznych bez Twojej wyraźnej zgody.</p>

      <h2>9. Kontakt w sprawach ochrony danych</h2>
      <p>W sprawach związanych z ochroną danych osobowych możesz kontaktować się z nami pod adresem: <a href="mailto:kancelaria@idzik.org.pl">kancelaria@idzik.org.pl</a> lub pisemnie: Kancelaria Adwokacka Magdalena Idzik-Cieśla, ul. Ceramiczna 5E/79, 03-126 Warszawa.</p>
    </div>
  </div>
</section>
</main>
<footer>
  <div class="footer-bottom" style="margin-top:0">
    <div class="container" style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:.5rem;padding:1.5rem var(--px)">
      <span style="color:rgba(255,255,255,.5);font-size:.8rem">© 2025 Kancelaria Adwokacka Magdalena Idzik-Cieśla. Wszelkie prawa zastrzeżone.</span>
      <span style="font-size:.8rem"><a href="/polityka-prywatnosci" style="color:rgba(255,255,255,.5)">Polityka prywatności</a> · <a href="/rodo" style="color:rgba(255,255,255,.5)">RODO</a></span>
    </div>
  </div>
</footer>
</body>
</html>`;
}

// ── RODO ───────────────────────────────────────────────────────────────────
function buildRODOHTML(cfg) {
  return `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>RODO — Twoje prawa — Kancelaria Adwokacka Magdalena Idzik-Cieśla</title>
<meta name="robots" content="noindex,follow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/style.css">
<style>
  .legal-page { max-width: 780px; margin: 0 auto; }
  .legal-page h1 { font-family: var(--serif); font-size: clamp(1.8rem,3.5vw,2.6rem); font-weight:700; color:var(--navy); margin-bottom:.5rem; }
  .legal-page h2 { font-family: var(--serif); font-size: 1.2rem; font-weight:700; color:var(--navy); margin: 2rem 0 .5rem; }
  .legal-page p, .legal-page li { font-size:.95rem; color:var(--text); line-height:1.85; font-weight:300; margin-bottom:.6rem; }
  .legal-page ul { padding-left: 1.4rem; margin-bottom:1rem; }
  .legal-page li { margin-bottom:.3rem; }
  .legal-page .meta { font-size:.8rem; color:var(--text-muted); margin-bottom:2.5rem; }
  .legal-page a { color:var(--accent); }
  .right-card { background:var(--accent-bg); border:1px solid rgba(139,94,26,.2); border-radius:var(--radius-lg); padding:1.5rem 1.75rem; margin-bottom:1.25rem; }
  .right-card h2 { margin-top:0; }
  .legal-nav { background:var(--white); border-bottom:1px solid var(--border); padding:.9rem var(--px); display:flex; align-items:center; gap:1rem; }
  .legal-nav a { font-family:var(--serif); font-size:1rem; font-weight:700; color:var(--navy); }
  .legal-nav span { color:var(--text-muted); font-size:.85rem; }
</style>
</head>
<body>
<nav class="legal-nav">
  <a href="/">← Kancelaria Adwokacka Magdalena Idzik-Cieśla</a>
  <span>/ RODO</span>
</nav>
<main>
<section style="padding:clamp(2.5rem,5vw,4rem) 0 clamp(3rem,6vw,5rem)">
  <div class="container">
    <div class="legal-page">
      <p class="section-label">Ochrona danych osobowych</p>
      <h1>RODO — Twoje prawa</h1>
      <p class="meta">Rozporządzenie (UE) 2016/679 z dnia 27 kwietnia 2016 r.</p>

      <p>Rozporządzenie Parlamentu Europejskiego i Rady (UE) 2016/679 — RODO — przyznaje Ci szerokie uprawnienia w zakresie ochrony Twoich danych osobowych. Poniżej opisujemy każde z nich w kontekście relacji z naszą kancelarią.</p>
      <p><strong>Administrator danych:</strong> adw. Magdalena Idzik-Cieśla, ul. Ceramiczna 5E/79, 03-126 Warszawa<br>
      Kontakt: <a href="mailto:kancelaria@idzik.org.pl">kancelaria@idzik.org.pl</a> · <a href="tel:+48605089552">605 089 552</a></p>

      <div class="right-card">
        <h2>1. Prawo dostępu do danych (art. 15 RODO)</h2>
        <p>Możesz w każdej chwili zapytać, czy przetwarzamy Twoje dane, a jeśli tak — uzyskać do nich dostęp oraz informacje o celu przetwarzania, kategoriach danych, odbiorcach i planowanym czasie przechowywania.</p>
      </div>

      <div class="right-card">
        <h2>2. Prawo do sprostowania danych (art. 16 RODO)</h2>
        <p>Jeśli Twoje dane są nieprawidłowe lub niekompletne, masz prawo żądać ich niezwłocznego sprostowania lub uzupełnienia.</p>
      </div>

      <div class="right-card">
        <h2>3. Prawo do usunięcia danych (art. 17 RODO)</h2>
        <p>Możesz żądać usunięcia swoich danych, gdy nie są już niezbędne do celu, w którym zostały zebrane, cofnęłeś/-aś zgodę lub przetwarzanie było bezprawne. Prawo to nie ma zastosowania, gdy przetwarzanie jest niezbędne do wywiązania się z obowiązku prawnego lub ustalenia, dochodzenia albo obrony roszczeń.</p>
      </div>

      <div class="right-card">
        <h2>4. Prawo do ograniczenia przetwarzania (art. 18 RODO)</h2>
        <p>Możesz zażądać ograniczenia przetwarzania Twoich danych, jeśli kwestionujesz ich prawidłowość, przetwarzanie jest bezprawne i sprzeciwiasz się usunięciu, lub wnosisz sprzeciw — do czasu jego rozpatrzenia.</p>
      </div>

      <div class="right-card">
        <h2>5. Prawo do przenoszenia danych (art. 20 RODO)</h2>
        <p>Jeśli przetwarzanie odbywa się na podstawie zgody lub umowy i jest zautomatyzowane, masz prawo otrzymać swoje dane w ustrukturyzowanym, powszechnie używanym formacie lub zażądać ich przekazania innemu administratorowi.</p>
      </div>

      <div class="right-card">
        <h2>6. Prawo do sprzeciwu (art. 21 RODO)</h2>
        <p>Masz prawo w dowolnym momencie wnieść sprzeciw wobec przetwarzania Twoich danych opartego na naszym prawnie uzasadnionym interesie. Po jego wniesieniu zaprzestaniemy przetwarzania, chyba że wykażemy ważne, nadrzędne podstawy prawne.</p>
      </div>

      <div class="right-card">
        <h2>7. Prawo do skargi do organu nadzorczego</h2>
        <p>Jeśli uważasz, że przetwarzanie Twoich danych narusza RODO, masz prawo złożyć skargę do:</p>
        <p><strong>Prezes Urzędu Ochrony Danych Osobowych (UODO)</strong><br>
        ul. Stawki 2, 00-193 Warszawa<br>
        Tel. 606 950 000 · <a href="mailto:kancelaria@uodo.gov.pl">kancelaria@uodo.gov.pl</a></p>
      </div>

      <h2>Jak skorzystać ze swoich praw?</h2>
      <p>Wyślij wiadomość e-mail na adres <a href="mailto:kancelaria@idzik.org.pl">kancelaria@idzik.org.pl</a> lub zadzwoń pod numer <a href="tel:+48605089552">605 089 552</a>. Odpowiemy bez zbędnej zwłoki, nie później niż w ciągu <strong>30 dni</strong> od otrzymania żądania (z możliwością przedłużenia do 3 miesięcy w wyjątkowo skomplikowanych przypadkach — poinformujemy Cię o tym z wyprzedzeniem).</p>

      <p style="margin-top:2rem"><a href="/polityka-prywatnosci">Przeczytaj pełną Politykę Prywatności →</a></p>
    </div>
  </div>
</section>
</main>
<footer>
  <div class="footer-bottom" style="margin-top:0">
    <div class="container" style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:.5rem;padding:1.5rem var(--px)">
      <span style="color:rgba(255,255,255,.5);font-size:.8rem">© 2025 Kancelaria Adwokacka Magdalena Idzik-Cieśla. Wszelkie prawa zastrzeżone.</span>
      <span style="font-size:.8rem"><a href="/polityka-prywatnosci" style="color:rgba(255,255,255,.5)">Polityka prywatności</a> · <a href="/rodo" style="color:rgba(255,255,255,.5)">RODO</a></span>
    </div>
  </div>
</footer>
</body>
</html>`;
}

// ── PAGE.JS Z WSTRZYKNIĘTĄ KONFIGURACJĄ ───────────────────────────────────
function buildPageJS(cfg) {
  return `
window.SITE_CONFIG = {
  district:     "${cfg.district}",
  districtKey:  "${cfg.key}",
  accentColor:  "${cfg.accent}",
  accentLight:  "${cfg.light}",
  accentBg:     "${cfg.bg}"
};
${PAGE_JS}`;
}

// ── HTML TEMPLATE ──────────────────────────────────────────────────────────
function buildHTML(cfg, hostname) {
  const title = `Adwokat Rozwodowy ${cfg.district} | Kancelaria Idzik-Cieśla`;
  const desc  = `Adwokat rozwodowy ${cfg.district} — Kancelaria Magdalena Idzik-Cieśla. Bezpłatna konsultacja 30 minut. Tel. 605 089 552.`;

  return `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="${desc}">
<link rel="canonical" href="https://${hostname}">
<title>${title}</title>
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="https://${hostname}">
<meta property="og:type" content="website">

<!-- JSON-LD Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "LegalService",
  "name": "Kancelaria Adwokacka Magdalena Idzik-Cieśla",
  "description": "${desc}",
  "url": "https://${hostname}",
  "telephone": "+48605089552",
  "email": "kancelaria@idzik.org.pl",
  "areaServed": "${cfg.district}",
  "address": [
    {"@type":"PostalAddress","streetAddress":"ul. Ceramiczna 5E/79","addressLocality":"Warszawa","postalCode":"03-126","addressCountry":"PL"},
    {"@type":"PostalAddress","streetAddress":"ul. Bolkowska 2A/28","addressLocality":"Warszawa","postalCode":"01-466","addressCountry":"PL"}
  ],
  "openingHours": "Mo-Fr 08:00-18:00",
  "priceRange": "$$",
  "hasMap": "https://maps.google.com/?q=Ceramiczna+5E,+Warszawa"
}
<\/script>

<!-- FAQ Schema -->
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {"@type":"Question","name":"Ile trwa sprawa rozwodowa?","acceptedAnswer":{"@type":"Answer","text":"Rozwód bez orzekania o winie trwa 3–6 miesięcy. Sprawy sporne z dziećmi i majątkiem — rok lub dłużej."}},
    {"@type":"Question","name":"Ile kosztuje adwokat rozwodowy?","acceptedAnswer":{"@type":"Answer","text":"Honorarium ustalane indywidualnie. Opłata sądowa od pozwu to 600 zł. Pierwsza konsultacja 30 minut jest bezpłatna."}},
    {"@type":"Question","name":"Czy można się skonsultować online?","acceptedAnswer":{"@type":"Answer","text":"Tak. Konsultacje przez Teams, Zoom lub telefon dla klientów z całej Polski. Pierwsza konsultacja bezpłatna."}}
  ]
}
<\/script>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&family=DM+Sans:wght@300;400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/style.css">
<style>
  :root {
    --accent:       ${cfg.accent};
    --accent-light: ${cfg.light};
    --accent-bg:    ${cfg.bg};
  }
  @media (max-width: 760px) {
    .hero-2col { grid-template-columns: 1fr !important; }
    .hero-2col .hero-actions { flex-direction: column; }
  }
</style>
</head>
<body>

<div class="ticker-wrap" aria-label="Obszary działania kancelarii">
  <div class="ticker-track" id="ticker-track"></div>
</div>

<header class="nav">
  <div class="nav-inner">
    <a href="/" class="nav-logo">
      <span class="nav-logo-name">Kancelaria Adwokacka</span>
      <span class="nav-logo-sub">Magdalena Idzik‑Cieśla</span>
    </a>
    <nav class="nav-links nav-desktop" id="nav-desktop">
      <a href="#pomoc"   class="nav-link">Zakres pomocy</a>
      <a href="#proces"  class="nav-link">Jak działamy</a>
      <a href="#opinie"  class="nav-link">Opinie</a>
      <a href="#faq"     class="nav-link">FAQ</a>
      <a href="#kontakt" class="btn nav-cta">Bezpłatna konsultacja</a>
    </nav>
    <button class="hamburger" id="hamburger" aria-label="Menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>

<main>

<!-- HERO -->
<section class="hero section" style="padding-top:clamp(4rem,8vw,6rem);padding-bottom:clamp(3rem,6vw,5rem);background:var(--bg);">
  <div class="container">
    <div class="hero-2col" style="display:grid;grid-template-columns:1fr 1fr;gap:3.5rem;align-items:center;">

      <!-- LEWA: tekst -->
      <div>
        <p class="hero-eyebrow" style="justify-content:flex-start;">
          <span class="hero-eyebrow-dot"></span>
          Kancelaria Adwokacka · ${cfg.district} · Prawo Rodzinne
        </p>
        <h1 style="text-align:left;margin:0 0 1.25rem;font-size:clamp(1.9rem,3.2vw,2.9rem);">
          Skuteczna pomoc prawna<br>w <em>najtrudniejszym</em> momencie
        </h1>
        <p class="hero-sub" style="text-align:left;margin:0 0 2rem;max-width:100%;">
          Rozwód, podział majątku, opieka nad dziećmi — przeprowadzimy Cię przez cały
          proces jasno, dyskretnie i po Twojej stronie.
        </p>
        <div class="hero-actions" style="justify-content:flex-start;margin-bottom:2rem;">
          <a href="#kontakt" class="btn btn-primary btn-lg">Umów bezpłatną konsultację →</a>
          <a href="tel:+48605089552" class="btn btn-outline btn-lg">📞 605 089 552</a>
        </div>
        <div class="hero-trust" style="justify-content:flex-start;flex-direction:column;align-items:flex-start;gap:.6rem;">
          <span class="hero-trust-item"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M12 3L5.5 10 2 6.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Bezpłatna konsultacja 30 min</span>
          <span class="hero-trust-item"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M12 3L5.5 10 2 6.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Pełna dyskrecja</span>
          <span class="hero-trust-item"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M12 3L5.5 10 2 6.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>${cfg.district} i Mazowieckie</span>
          <span class="hero-trust-item"><svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M12 3L5.5 10 2 6.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>Konsultacje online</span>
        </div>
      </div>

      <!-- PRAWA: wideo rozciągnięte -->
      <div style="position:relative;border-radius:var(--radius-lg);overflow:hidden;box-shadow:var(--shadow-lg);background:var(--navy);align-self:stretch;min-height:320px;">
        <video id="hero-video" src="https://github.com/user-attachments/assets/7c593bf7-b8ff-47d8-af33-d6ca0661c832"
          playsinline controls preload="metadata"
          style="position:absolute;inset:0;width:100%;height:100%;display:block;object-fit:cover;"></video>
        <div id="video-overlay" onclick="playVideo()" style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;transition:opacity .3s;background:rgba(15,31,56,.42);z-index:1;">
          <div id="play-btn" style="width:72px;height:72px;border-radius:50%;background:rgba(255,255,255,.13);backdrop-filter:blur(12px);border:1.5px solid rgba(255,255,255,.35);display:flex;align-items:center;justify-content:center;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="white" style="margin-left:4px"><path d="M8 5v14l11-7z"/></svg>
          </div>
          <p style="margin-top:1rem;font-family:var(--serif);font-size:.95rem;font-style:italic;color:rgba(255,255,255,.85);">Posłuchaj o kancelarii</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- STATYSTYKI -->
<div class="stats-bar">
  <div class="container">
    <div class="stats-inner">
      <div class="stat-item"><div class="stat-number" data-count="15" data-suffix="+">15+</div><div class="stat-label">Lat doświadczenia</div></div>
      <div class="stat-item"><div class="stat-number" data-count="850" data-suffix="+">850+</div><div class="stat-label">Zakończonych spraw</div></div>
      <div class="stat-item"><div class="stat-number" data-count="97" data-suffix="%">97%</div><div class="stat-label">Klientów poleca dalej</div></div>
      <div class="stat-item"><div class="stat-number" data-count="10">10</div><div class="stat-label">Lokalizacji</div></div>
    </div>
  </div>
</div>

<!-- LOKALIZACJE -->
<div class="location-strip">
  <div class="container">
    <div class="location-strip-inner">
      <span class="location-chip"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>ul. Ceramiczna 5E/79, Warszawa</span>
      <span class="location-chip"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>ul. Bolkowska 2A/28, Warszawa</span>
      <span class="location-chip"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>Legionowo · Łomianki · online</span>
    </div>
  </div>
</div>

<!-- POMOC -->
<section class="section" id="pomoc">
  <div class="container">
    <div class="pain-grid">
      <div>
        <div class="section-header">
          <p class="section-label">Rozumiem Twoją sytuację</p>
          <h2 class="section-title">To jeden z najtrudniejszych momentów.<br><em>Nie musisz</em> przez to przechodzić sam.</h2>
          <p class="section-desc">Każda sprawa jest inna. Niezależnie od tego, jak skomplikowana jest Twoja sytuacja — masz prawo do rzetelnej i ludzkiej pomocy prawnej.</p>
        </div>
        <div class="pain-items">
          <div class="pain-item"><div class="pain-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="3" x2="12" y2="20"/><path d="M5 20h14"/><line x1="4" y1="7" x2="20" y2="7"/><path d="M4 7l-3 6h6l-3-6z"/><path d="M20 7l-3 6h6l-3-6z"/></svg></div><div><h4>Nie wiem od czego zacząć</h4><p>Wyjaśniamy każdy krok po ludzku — bez żargonu, bez ukrytych kosztów.</p></div></div>
          <div class="pain-item"><div class="pain-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg></div><div><h4>Obawiamy się o mieszkanie i majątek</h4><p>Zadbamy o sprawiedliwy podział — nieruchomości, oszczędności, firma, kredyt.</p></div></div>
          <div class="pain-item"><div class="pain-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></div><div><h4>Dzieci są dla mnie najważniejsze</h4><p>Pomagamy ustalić plan wychowawczy zabezpieczający dobro dzieci i Twój realny kontakt.</p></div></div>
          <div class="pain-item"><div class="pain-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></svg></div><div><h4>Chcę to zakończyć polubownie</h4><p>Mediacja jest często szybsza i tańsza. Wspieramy ugodowe rozwiązania gdzie to możliwe.</p></div></div>
        </div>
      </div>
      <div>
        <div class="pain-quote-block">
          <blockquote>„Kiedy trafiłam do kancelarii, czułam się całkowicie zagubiona. Pani mecenas spokojnie wyjaśniła mi każdy krok. Po raz pierwszy od miesięcy poczułam, że mam kogoś po swojej stronie."</blockquote>
          <cite>— Klientka kancelarii, Warszawa 2024</cite>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- USŁUGI -->
<section class="section" style="background:var(--bg-card);">
  <div class="container">
    <div class="section-header section-center text-center">
      <p class="section-label">Zakres pomocy</p>
      <h2 class="section-title">Czym możemy <em>Ci pomóc</em></h2>
      <p class="section-desc">Kompleksowa obsługa prawna w sprawach rodzinnych — od pierwszej rozmowy do prawomocnego wyroku.</p>
    </div>
    <div class="services-grid">
      <div class="service-card"><div class="service-num">01</div><h3>Rozwód</h3><p>Pozew, reprezentacja przed sądem, negocjacje. Sprawy polubowne i sporne.</p><div class="service-tags"><span class="tag">Z orzekaniem o winie</span><span class="tag">Bez orzekania</span><span class="tag">Separacja</span></div></div>
      <div class="service-card"><div class="service-num">02</div><h3>Podział majątku</h3><p>Analiza majątku wspólnego, negocjacje, reprezentacja sądowa lub notarialna.</p><div class="service-tags"><span class="tag">Nieruchomości</span><span class="tag">Firmy</span><span class="tag">Kredyty</span></div></div>
      <div class="service-card"><div class="service-num">03</div><h3>Opieka i alimenty</h3><p>Plan wychowawczy, alimenty, prawo do kontaktów. Zmiana ustalonych warunków.</p><div class="service-tags"><span class="tag">Plan wychowawczy</span><span class="tag">Alimenty</span><span class="tag">Kontakty</span></div></div>
    </div>
  </div>
</section>

<!-- PROCES -->
<section class="section process-section" id="proces">
  <div class="container">
    <div class="section-header section-center text-center">
      <p class="section-label">Jak działamy</p>
      <h2 class="section-title">Cztery kroki do <em>nowego początku</em></h2>
      <p class="section-desc">Przejrzysty, przewidywalny proces — bez niespodzianek.</p>
    </div>
    <div class="process-steps">
      <div class="process-step"><div class="step-badge">1</div><h4>Bezpłatna konsultacja</h4><p>30 minut bez zobowiązań. Słuchamy i odpowiadamy na najważniejsze pytania.</p></div>
      <div class="process-step"><div class="step-badge">2</div><h4>Analiza i strategia</h4><p>Analizujemy dokumenty i opracowujemy indywidualną strategię działania.</p></div>
      <div class="process-step"><div class="step-badge">3</div><h4>Reprezentacja</h4><p>Przygotowujemy pisma, negocjujemy i reprezentujemy Cię przed sądem.</p></div>
      <div class="process-step"><div class="step-badge">4</div><h4>Wyrok i nowy etap</h4><p>Prawomocny wyrok z pewnością, że kluczowe kwestie zostały zabezpieczone.</p></div>
    </div>
  </div>
</section>

<!-- OPINIE -->
<section class="section" id="opinie">
  <div class="container">
    <div class="section-header section-center text-center">
      <p class="section-label">Opinie klientów</p>
      <h2 class="section-title">Co mówią <em>nasi klienci</em></h2>
    </div>
    <div class="testimonials-grid">
      <div class="testimonial"><div class="t-stars">★★★★★</div><p class="t-quote">„Profesjonalizm i spokój — przez cały czas miałem poczucie, że wszystko jest pod kontrolą. Serdecznie polecam."</p><div class="t-author"><div class="t-avatar">MK</div><div><div class="t-name">Marek K.</div><div class="t-meta">Sprawa rozwodowa · Warszawa</div></div></div></div>
      <div class="testimonial"><div class="t-stars">★★★★★</div><p class="t-quote">„Pani mecenas skutecznie zawalczyła o moje prawa. Warunki, które ustaliliśmy, są dobre dla całej rodziny."</p><div class="t-author"><div class="t-avatar">AW</div><div><div class="t-name">Anna W.</div><div class="t-meta">Opieka nad dziećmi · Legionowo</div></div></div></div>
      <div class="testimonial"><div class="t-stars">★★★★★</div><p class="t-quote">„Sprawny kontakt, zawsze dostępni. Podział majątku zakończony szybciej niż myślałem."</p><div class="t-author"><div class="t-avatar">PT</div><div><div class="t-name">Piotr T.</div><div class="t-meta">Podział majątku · Łomianki</div></div></div></div>
    </div>
  </div>
</section>

<!-- FAQ -->
<section class="section faq-section" id="faq">
  <div class="container">
    <div class="faq-layout">
      <div class="faq-sticky">
        <p class="section-label no-line">Najczęstsze pytania</p>
        <h2 class="section-title">Odpowiadamy<br>na <em>Twoje</em><br>pytania</h2>
        <p class="section-desc" style="margin-bottom:2rem">Nie znajdziesz odpowiedzi? Zadzwoń — oddzwonimy w ciągu 2 godzin.</p>
        <a href="tel:+48605089552" class="btn btn-primary">📞 605 089 552</a>
      </div>
      <div class="faq-list">
        <div class="faq-item"><button class="faq-btn">Ile trwa sprawa rozwodowa w Polsce?<span class="faq-icon">+</span></button><div class="faq-body"><p>Rozwód bez orzekania o winie trwa 3–6 miesięcy. Sprawy sporne z dziećmi i majątkiem — rok lub dłużej. Podczas pierwszej konsultacji ocenimy realny czas dla Twojej sprawy.</p></div></div>
        <div class="faq-item"><button class="faq-btn">Ile kosztuje pomoc adwokata?<span class="faq-icon">+</span></button><div class="faq-body"><p>Honorarium ustalane indywidualnie. Opłata sądowa od pozwu to 600 zł. Przed podpisaniem umowy przedstawiamy pełne wynagrodzenie — bez niespodzianek.</p></div></div>
        <div class="faq-item"><button class="faq-btn">Czy mogę uzyskać rozwód bez orzekania o winie?<span class="faq-icon">+</span></button><div class="faq-body"><p>Tak — jeśli obie strony się zgadzają. To szybsze i tańsze rozwiązanie. Doradzimy która opcja jest lepsza w Twoim przypadku.</p></div></div>
        <div class="faq-item"><button class="faq-btn">Co z mieszkaniem i kredytem hipotecznym?<span class="faq-icon">+</span></button><div class="faq-body"><p>Podział majątku — w tym nieruchomości i kredytów — może być przeprowadzony w trakcie lub po sprawie. Możliwe scenariusze: sprzedaż, spłata jednego małżonka lub współwłasność.</p></div></div>
        <div class="faq-item"><button class="faq-btn">Czy mogę skonsultować się online?<span class="faq-icon">+</span></button><div class="faq-body"><p>Tak. Konsultacje przez Teams, Zoom lub telefon dla klientów z całej Polski. Pierwsza konsultacja 30 minut bezpłatna.</p></div></div>
      </div>
    </div>
  </div>
</section>

<!-- KONTAKT -->
<section class="contact-section" id="kontakt">
  <div class="container">
    <div class="section-header section-center text-center">
      <p class="section-label">Bezpłatna konsultacja</p>
      <h2 class="section-title">Zrób pierwszy krok<br><em>w swoim tempie</em></h2>
      <p class="section-desc">Oddzwonimy w ciągu 2 godzin w dni robocze.</p>
    </div>
    <form id="contact-form" class="form-card" onsubmit="submitLead(event)">
      <div class="form-card-title">Umów bezpłatną konsultację</div>
      <p class="form-card-sub">Oddzwonimy jak najszybciej!</p>
      <div class="form-row">
        <div class="form-group"><label for="imie">Imię *</label><input type="text" id="imie" name="imie" required></div>
        <div class="form-group"><label for="tel">Telefon *</label><input type="tel" id="tel" name="telefon" required></div>
      </div>
      <div class="form-group"><label for="email">E-mail</label><input type="email" id="email" name="email"></div>
      <div class="form-group"><label for="temat">Czego dotyczy sprawa?</label>
        <select id="temat" name="temat">
          <option value="" disabled selected>Wybierz temat</option>
          <option>Rozwód bez orzekania o winie</option>
          <option>Rozwód z orzeczeniem o winie</option>
          <option>Podział majątku wspólnego</option>
          <option>Opieka nad dziećmi / alimenty</option>
          <option>Separacja prawna</option>
          <option>Inne</option>
        </select>
      </div>
      <div class="form-group"><label for="wiadomosc">Krótki opis sytuacji</label><textarea id="wiadomosc" name="wiadomosc"></textarea></div>
      <button type="submit" class="form-submit">Wyślij i umów konsultację →</button>
      <p class="form-notice">🔒 Dane są bezpieczne i chronione. Przetwarzamy je wyłącznie w celu obsługi zapytania.</p>
      <div id="form-success" style="display:none;text-align:center;padding:1.5rem 0;">
        <div style="font-size:2rem;margin-bottom:.75rem">✅</div>
        <div style="font-family:var(--serif);font-size:1.2rem;font-weight:700;color:var(--navy);margin-bottom:.4rem">Dziękujemy!</div>
        <p style="font-size:.9rem;color:var(--text-muted)">Oddzwonimy wkrótce.</p>
      </div>
    </form>
    <div style="text-align:center;margin-top:2.5rem;display:flex;gap:2rem;justify-content:center;flex-wrap:wrap;">
      <a href="tel:+48605089552" class="btn btn-white btn-lg">📞 605 089 552</a>
      <a href="mailto:kancelaria@idzik.org.pl" class="btn btn-white btn-lg">✉ kancelaria@idzik.org.pl</a>
    </div>
  </div>
</section>
</main>

<footer>
  <div class="container">
    <div class="footer-grid">
      <div>
        <div class="footer-brand">Kancelaria Adwokacka Magdalena Idzik‑Cieśla</div>
        <p class="footer-tagline">Dyskretna i skuteczna pomoc prawna w sprawach rodzinnych. Warszawa i Mazowieckie.</p>
        <div class="footer-contact">
          <a href="tel:+48605089552">📞 605 089 552</a>
          <a href="mailto:kancelaria@idzik.org.pl">✉ kancelaria@idzik.org.pl</a>
        </div>
      </div>
      <div class="footer-col"><h5>Usługi</h5><ul><li><a href="#pomoc">Rozwód</a></li><li><a href="#pomoc">Podział majątku</a></li><li><a href="#pomoc">Opieka nad dziećmi</a></li><li><a href="#pomoc">Alimenty</a></li></ul></div>
      <div class="footer-col"><h5>Biura</h5><ul><li>ul. Ceramiczna 5E/79</li><li>03-126 Warszawa</li><li style="margin-top:.4rem">ul. Bolkowska 2A/28</li><li>01-466 Warszawa</li></ul></div>
      <div class="footer-col"><h5>Inne dzielnice</h5><ul>
        <li><a href="https://rozwodbielany.pl">Bielany</a></li>
        <li><a href="https://rozwodzoliborz.pl">Żoliborz</a></li>
        <li><a href="https://rozwodwola.pl">Wola</a></li>
        <li><a href="https://rozwodmokotow.pl">Mokotów</a></li>
        <li><a href="https://rozwodlegionowo.pl">Legionowo</a></li>
        <li><a href="https://rozwodlomianki.pl">Łomianki</a></li>
      </ul></div>
    </div>
  </div>
  <div class="footer-bottom">
    <div class="container" style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:.5rem">
      <span>© 2025 Kancelaria Adwokacka Magdalena Idzik-Cieśla. Wszelkie prawa zastrzeżone.</span>
      <span><a href="/polityka-prywatnosci" style="color:inherit">Polityka prywatności</a> · <a href="/rodo" style="color:inherit">RODO</a></span>
    </div>
  </div>
</footer>

<script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js"></script>
<script src="/assets/page.js"></script>
<script>
function playVideo() {
  const video = document.getElementById('hero-video');
  const overlay = document.getElementById('video-overlay');
  video.play();
  anime({ targets: overlay, opacity: [1,0], duration: 400, easing: 'easeOutCubic',
    complete: () => { overlay.style.display = 'none'; } });
}
async function submitLead(e) {
  e.preventDefault();
  const btn = e.target.querySelector('.form-submit');
  btn.disabled = true;
  btn.textContent = 'Wysyłanie...';
  const payload = {
    imie:      document.getElementById('imie').value,
    telefon:   document.getElementById('tel').value,
    email:     document.getElementById('email').value,
    temat:     document.getElementById('temat').value,
    wiadomosc: document.getElementById('wiadomosc').value,
  };
  try {
    const res = await fetch('/api/lead', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (data.ok) {
      document.getElementById('contact-form').style.display = 'none';
      document.getElementById('form-success').style.display = 'block';
    } else {
      btn.disabled = false;
      btn.textContent = 'Błąd — spróbuj ponownie';
      setTimeout(() => { btn.textContent = 'Wyślij i umów konsultację →'; }, 3000);
    }
  } catch {
    btn.disabled = false;
    btn.textContent = 'Błąd — spróbuj ponownie';
  }
}
</script>
</body>
</html>`;
}

// ── WBUDOWANY CSS (importowany z pliku style.css) ──────────────────────────
// Wklej tutaj zawartość style.css lub załaduj z KV Storage
const CSS = `/* ============================================================
   Kancelaria Adwokacka Magdalena Idzik-Cieśla
   Shared stylesheet — wszystkie domeny
   Dostosowanie per domena: nadpisz zmienne CSS w <style> w index.html
   ============================================================ */

@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600;1,700&family=DM+Sans:wght@300;400;500;600&display=swap');

/* ── RESET ── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { scroll-behavior: smooth; }
img, video { max-width: 100%; display: block; }
button { cursor: pointer; font-family: inherit; }
a { text-decoration: none; }

/* ── DESIGN TOKENS ── */
:root {
  /* Kolory bazowe — nadpisywane per domena */
  --accent:        #8B5E1A;   /* złoty (default) */
  --accent-light:  #C49A3C;
  --accent-bg:     #FDF6E9;

  /* Paleta stała */
  --navy:          #0F1F38;
  --navy-mid:      #1A3254;
  --white:         #FFFFFF;
  --bg:            #F8F7F4;
  --bg-card:       #FFFFFF;
  --border:        rgba(15,31,56,.1);
  --text:          #1A2435;
  --text-muted:    #6B7A8D;
  --text-light:    #A0AABA;

  /* Typografia */
  --serif:  'Playfair Display', Georgia, serif;
  --sans:   'DM Sans', system-ui, -apple-system, sans-serif;

  /* Spacing */
  --max-w:  1100px;
  --px:     clamp(1.25rem, 5vw, 4rem);
  --section-py: clamp(2rem, 4vw, 3.5rem);

  /* Misc */
  --radius:  6px;
  --radius-lg: 14px;
  --shadow:  0 2px 20px rgba(15,31,56,.07);
  --shadow-lg: 0 8px 48px rgba(15,31,56,.13);
  --transition: .22s cubic-bezier(.4,0,.2,1);
}

/* ── BASE ── */
body {
  font-family: var(--sans);
  background: var(--bg);
  color: var(--text);
  font-size: 16px;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ── CONTAINER ── */
.container {
  width: 100%;
  max-width: var(--max-w);
  margin-left: auto;
  margin-right: auto;
  padding-left: var(--px);
  padding-right: var(--px);
}

/* ── TICKER ── */
.ticker-wrap {
  background: linear-gradient(90deg, #0A1828 0%, var(--navy) 50%, #0A1828 100%);
  overflow: hidden;
  height: 46px;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 200;
  border-bottom: 1px solid rgba(255,255,255,.12);
}
.ticker-track {
  display: flex;
  align-items: center;
  gap: 0;
  white-space: nowrap;
  will-change: transform;
}
.ticker-item {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  padding: 0 1.75rem;
  font-size: .8rem;
  font-weight: 500;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: rgba(255,255,255,.78);
  transition: color var(--transition);
}
.ticker-item.active-district {
  color: var(--accent-light);
  font-weight: 700;
}
.ticker-item::before {
  content: '⬥';
  font-size: .6rem;
  color: var(--accent-light);
  opacity: .9;
}
.ticker-item a {
  color: inherit;
  transition: color var(--transition);
}
.ticker-item a:hover { color: var(--accent-light); }

/* ── NAV ── */
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: rgba(248,247,244,.97);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
  height: 68px;
  display: flex;
  align-items: center;
}
.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  width: 100%;
  max-width: var(--max-w);
  margin: 0 auto;
  padding: 0 var(--px);
}
.nav-logo {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}
.nav-logo-name {
  font-family: var(--serif);
  font-size: 1.18rem;
  font-weight: 700;
  color: var(--navy);
  letter-spacing: -.01em;
}
.nav-logo-sub {
  font-size: .78rem;
  font-weight: 500;
  color: var(--accent);
  letter-spacing: .05em;
  text-transform: uppercase;
}
.nav-links {
  display: flex;
  align-items: center;
  gap: 1.75rem;
}
.nav-links a {
  font-size: .82rem;
  font-weight: 500;
  color: var(--text-muted);
  letter-spacing: .04em;
  transition: color var(--transition);
}
.nav-links a:hover { color: var(--navy); }
.nav-cta {
  background: var(--accent) !important;
  color: var(--white) !important;
  padding: 9px 20px;
  border-radius: var(--radius);
  font-size: .82rem !important;
  font-weight: 600 !important;
  letter-spacing: .03em !important;
  white-space: nowrap;
  transition: opacity var(--transition) !important;
}
.nav-cta:hover { opacity: .87; }
.hamburger {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  padding: 6px;
}
.hamburger span {
  display: block;
  width: 22px;
  height: 1.5px;
  background: var(--navy);
  border-radius: 2px;
  transition: all .25s;
}

/* ── HERO ── */
.hero {
  padding: clamp(3.5rem, 7vw, 6rem) 0 clamp(3rem, 6vw, 5rem);
  text-align: center;
}
.hero-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  font-size: .75rem;
  font-weight: 600;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 1.25rem;
  opacity: 0;
}
.hero-eyebrow-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--accent);
  display: inline-block;
}
.hero h1 {
  font-family: var(--serif);
  font-size: clamp(2.5rem, 6vw, 4.2rem);
  font-weight: 800;
  line-height: 1.15;
  color: var(--navy);
  letter-spacing: -.02em;
  max-width: 820px;
  margin: 0 auto 1.5rem;
  opacity: 0;
}
.hero h1 em {
  font-style: italic;
  color: var(--accent);
}
.hero-sub {
  font-size: clamp(1rem, 1.8vw, 1.15rem);
  color: var(--text-muted);
  font-weight: 300;
  max-width: 560px;
  margin: 0 auto 2.5rem;
  line-height: 1.8;
  opacity: 0;
}
.hero-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 3rem;
  opacity: 0;
}
.hero-trust {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  opacity: 0;
}
.hero-trust-item {
  display: flex;
  align-items: center;
  gap: .45rem;
  font-size: .82rem;
  color: var(--text-muted);
  font-weight: 400;
}
.hero-trust-item svg {
  color: var(--accent);
  flex-shrink: 0;
}

/* ── BUTTONS ── */
.btn {
  display: inline-flex;
  align-items: center;
  gap: .5rem;
  padding: 13px 26px;
  border-radius: var(--radius);
  font-family: var(--sans);
  font-size: .88rem;
  font-weight: 600;
  letter-spacing: .03em;
  transition: all var(--transition);
  border: 1.5px solid transparent;
  white-space: nowrap;
}
.btn-primary {
  background: var(--accent);
  color: var(--white);
  border-color: var(--accent);
}
.btn-primary:hover { opacity: .88; transform: translateY(-1px); }
.btn-outline {
  background: transparent;
  color: var(--navy);
  border-color: var(--border);
}
.btn-outline:hover { border-color: var(--navy); background: var(--white); }
.btn-white {
  background: var(--white);
  color: var(--navy);
  border-color: var(--white);
}
.btn-white:hover { opacity: .9; }
.btn-lg { padding: 15px 32px; font-size: .95rem; }

/* ── STATS BAR ── */
.stats-bar {
  background: var(--navy);
  padding: 2.5rem 0;
}
.stats-inner {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: rgba(255,255,255,.07);
}
.stat-item {
  background: transparent;
  padding: 1.5rem 2rem;
  text-align: center;
}
.stat-number {
  font-family: var(--serif);
  font-size: clamp(2rem, 4vw, 2.8rem);
  font-weight: 700;
  color: var(--white);
  line-height: 1;
  margin-bottom: .35rem;
}
.stat-number sup {
  font-size: 1.2rem;
  color: var(--accent-light);
}
.stat-label {
  font-size: .72rem;
  font-weight: 500;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: rgba(255,255,255,.45);
}

/* ── LOCATION STRIP ── */
.location-strip {
  background: var(--accent-bg);
  border-top: 1px solid rgba(139,94,26,.12);
  border-bottom: 1px solid rgba(139,94,26,.12);
  padding: .65rem 0;
}
.location-strip-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2.5rem;
  flex-wrap: wrap;
}
.location-chip {
  display: flex;
  align-items: center;
  gap: .4rem;
  font-size: .78rem;
  font-weight: 500;
  color: var(--accent);
}
.location-chip svg { opacity: .7; }

/* ── SECTION COMMONS ── */
.section { padding: var(--section-py) 0; }
.section-center { text-align: center; }
.section-label {
  display: inline-flex;
  align-items: center;
  gap: .6rem;
  font-size: .72rem;
  font-weight: 600;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: .9rem;
}
.section-label::before, .section-label::after {
  content: '';
  display: block;
  width: 20px;
  height: 1.5px;
  background: var(--accent);
  opacity: .6;
}
.section-label.no-line::before, .section-label.no-line::after { display: none; }
.section-title {
  font-family: var(--serif);
  font-size: clamp(1.9rem, 4vw, 2.9rem);
  font-weight: 700;
  color: var(--navy);
  line-height: 1.2;
  letter-spacing: -.02em;
  margin-bottom: 1rem;
}
.section-title em {
  font-style: italic;
  color: var(--accent);
}
.section-desc {
  font-size: 1rem;
  color: var(--text-muted);
  font-weight: 300;
  line-height: 1.8;
  max-width: 580px;
}
.section-center .section-desc { margin: 0 auto; }
.section-header { margin-bottom: clamp(1.5rem, 3vw, 2.5rem); }

/* ── PAIN SECTION ── */
.pain-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 5rem;
  align-items: center;
}
.pain-items { margin-top: 2rem; }
.pain-item {
  display: flex;
  gap: 1.25rem;
  padding: 1.35rem 0;
  border-bottom: 1px solid var(--border);
}
.pain-item:first-child { border-top: 1px solid var(--border); }
.pain-icon {
  width: 50px; height: 50px;
  border-radius: 12px;
  background: var(--accent-bg);
  border: 1.5px solid rgba(var(--accent-rgb, 139,94,26),.18);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent);
  flex-shrink: 0;
}
.pain-item h4 {
  font-family: var(--serif);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--navy);
  margin-bottom: .3rem;
  line-height: 1.3;
}
.pain-item p {
  font-size: .88rem;
  color: var(--text-muted);
  font-weight: 300;
  line-height: 1.7;
}
.pain-quote-block {
  background: var(--navy);
  border-radius: var(--radius-lg);
  padding: 3rem;
  position: relative;
  overflow: hidden;
}
.pain-quote-block::before {
  content: '"';
  font-family: var(--serif);
  font-size: 9rem;
  color: var(--accent-light);
  opacity: .15;
  position: absolute;
  top: -1rem; left: 1.5rem;
  line-height: 1;
  pointer-events: none;
}
.pain-quote-block blockquote {
  font-family: var(--serif);
  font-size: 1.25rem;
  font-style: italic;
  color: var(--white);
  line-height: 1.7;
  position: relative;
  margin-bottom: 2rem;
}
.pain-quote-block cite {
  font-family: var(--sans);
  font-size: .78rem;
  font-style: normal;
  font-weight: 500;
  letter-spacing: .06em;
  color: var(--accent-light);
  text-transform: uppercase;
}

/* ── SERVICES ── */
.services-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}
.service-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 2.25rem 2rem;
  transition: box-shadow var(--transition), transform var(--transition), border-color var(--transition);
  position: relative;
  overflow: hidden;
}
.service-card::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 3px;
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--transition);
}
.service-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-4px);
  border-color: rgba(139,94,26,.2);
}
.service-card:hover::after { transform: scaleX(1); }
.service-num {
  font-family: var(--serif);
  font-size: 3.5rem;
  font-weight: 700;
  color: var(--border);
  line-height: 1;
  margin-bottom: 1.25rem;
  transition: color var(--transition);
}
.service-card:hover .service-num { color: var(--accent-bg); }
.service-card h3 {
  font-family: var(--serif);
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--navy);
  margin-bottom: .6rem;
}
.service-card p {
  font-size: .875rem;
  color: var(--text-muted);
  font-weight: 300;
  line-height: 1.75;
  margin-bottom: 1.25rem;
}
.service-tags { display: flex; gap: .4rem; flex-wrap: wrap; }
.tag {
  font-size: .68rem;
  font-weight: 600;
  letter-spacing: .06em;
  text-transform: uppercase;
  padding: 3px 10px;
  background: var(--accent-bg);
  color: var(--accent);
  border-radius: 20px;
}

/* ── PROCESS ── */
.process-section { background: var(--navy); }
.process-section .section-label { color: var(--accent-light); }
.process-section .section-label::before,
.process-section .section-label::after { background: var(--accent-light); }
.process-section .section-title { color: var(--white); }
.process-section .section-desc { color: rgba(255,255,255,.55); }
.process-steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.5rem;
  margin-top: 3.5rem;
}
.process-step {
  position: relative;
  padding-top: 1rem;
}
.process-step::before {
  content: '';
  position: absolute;
  top: 2rem;
  right: -0.75rem;
  width: calc(100% - 1.5rem);
  height: 1px;
  background: rgba(255,255,255,.1);
  z-index: 0;
}
.process-step:last-child::before { display: none; }
.step-badge {
  width: 44px; height: 44px;
  border-radius: 50%;
  border: 1.5px solid rgba(255,255,255,.15);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--serif);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--accent-light);
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 1;
  background: var(--navy);
}
.process-step h4 {
  font-family: var(--serif);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--white);
  margin-bottom: .5rem;
}
.process-step p {
  font-size: .85rem;
  color: rgba(255,255,255,.5);
  font-weight: 300;
  line-height: 1.75;
}

/* ── TESTIMONIALS ── */
.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.25rem;
}
.testimonial {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 2rem;
  transition: box-shadow var(--transition);
}
.testimonial:hover { box-shadow: var(--shadow-lg); }
.t-stars { font-size: 1rem; color: var(--accent); margin-bottom: 1.25rem; letter-spacing: .1em; }
.t-quote {
  font-family: var(--serif);
  font-size: 1.05rem;
  font-style: italic;
  color: var(--navy);
  line-height: 1.7;
  margin-bottom: 1.5rem;
}
.t-author { display: flex; align-items: center; gap: .75rem; }
.t-avatar {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: var(--accent-bg);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--serif);
  font-size: .9rem;
  font-weight: 700;
  color: var(--accent);
  flex-shrink: 0;
}
.t-name { font-size: .88rem; font-weight: 600; color: var(--navy); }
.t-meta { font-size: .75rem; color: var(--text-muted); font-weight: 300; }

/* ── FAQ ── */
.faq-section { background: var(--bg-card); }
.faq-layout {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 6rem;
  align-items: start;
}
.faq-sticky { position: sticky; top: 90px; }
.faq-list { }
.faq-item { border-bottom: 1px solid var(--border); }
.faq-btn {
  width: 100%;
  background: none;
  border: none;
  text-align: left;
  padding: 1.25rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  font-family: var(--sans);
  font-size: .97rem;
  font-weight: 500;
  color: var(--navy);
  transition: color var(--transition);
}
.faq-btn:hover { color: var(--accent); }
.faq-icon {
  width: 24px; height: 24px;
  border-radius: 50%;
  border: 1.5px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  font-size: .8rem;
  color: var(--text-muted);
  transition: all var(--transition);
}
.faq-item.open .faq-icon {
  background: var(--accent);
  border-color: var(--accent);
  color: var(--white);
  transform: rotate(45deg);
}
.faq-body {
  overflow: hidden;
  max-height: 0;
  transition: max-height .35s cubic-bezier(.4,0,.2,1);
}
.faq-body p {
  padding-bottom: 1.25rem;
  font-size: .9rem;
  color: var(--text-muted);
  font-weight: 300;
  line-height: 1.8;
}
.faq-item.open .faq-body { max-height: 400px; }

/* ── CONTACT / CTA ── */
.contact-section {
  background: linear-gradient(135deg, var(--navy) 0%, var(--navy-mid) 100%);
  padding: var(--section-py) 0;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.contact-section::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse 60% 80% at 20% 50%, rgba(139,94,26,.12) 0%, transparent 65%),
    radial-gradient(ellipse 40% 60% at 80% 20%, rgba(196,154,60,.08) 0%, transparent 60%);
  pointer-events: none;
}
.contact-section .section-label { color: var(--accent-light); }
.contact-section .section-label::before,
.contact-section .section-label::after { background: var(--accent-light); }
.contact-section .section-title { color: var(--white); }
.contact-section .section-desc { color: rgba(255,255,255,.6); margin: 0 auto 2.5rem; }

/* ── FORM ── */
.form-card {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: 2.5rem;
  box-shadow: var(--shadow-lg);
  max-width: 560px;
  margin: 0 auto;
  text-align: left;
}
.form-card-title {
  font-family: var(--serif);
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--navy);
  margin-bottom: .35rem;
}
.form-card-sub {
  font-size: .85rem;
  color: var(--text-muted);
  font-weight: 300;
  margin-bottom: 1.75rem;
}
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { margin-bottom: 1rem; }
.form-group label {
  display: block;
  font-size: .72rem;
  font-weight: 600;
  letter-spacing: .08em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: .4rem;
}
.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 11px 14px;
  border: 1.5px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg);
  font-family: var(--sans);
  font-size: .9rem;
  color: var(--text);
  transition: border-color var(--transition), background var(--transition);
  appearance: none;
  -webkit-appearance: none;
}
.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--accent);
  background: var(--white);
}
.form-group textarea { resize: vertical; min-height: 90px; }
.form-group select {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%236B7A8D' d='M6 8L0 0h12z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  padding-right: 36px;
}
.form-submit {
  width: 100%;
  padding: 14px;
  background: var(--accent);
  color: var(--white);
  border: none;
  border-radius: var(--radius);
  font-family: var(--sans);
  font-size: .92rem;
  font-weight: 600;
  letter-spacing: .04em;
  transition: opacity var(--transition);
  margin-top: .5rem;
}
.form-submit:hover { opacity: .87; }
.form-submit:disabled { opacity: .6; cursor: not-allowed; }
.form-notice {
  text-align: center;
  font-size: .73rem;
  color: var(--text-light);
  margin-top: .75rem;
  line-height: 1.5;
}

/* ── FOOTER ── */
footer {
  background: #0A1626;
  padding: 4rem 0 0;
}
.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 3rem;
  padding-bottom: 3rem;
}
.footer-brand {
  font-family: var(--serif);
  font-size: 1rem;
  font-weight: 700;
  color: var(--white);
  margin-bottom: .5rem;
}
.footer-tagline {
  font-size: .82rem;
  color: rgba(255,255,255,.4);
  font-weight: 300;
  line-height: 1.7;
  margin-bottom: 1.5rem;
  max-width: 260px;
}
.footer-contact a {
  display: flex;
  align-items: center;
  gap: .5rem;
  font-size: .85rem;
  font-weight: 500;
  color: var(--accent-light);
  margin-bottom: .5rem;
  transition: opacity var(--transition);
}
.footer-contact a:hover { opacity: .8; }
.footer-col h5 {
  font-size: .68rem;
  font-weight: 600;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: rgba(255,255,255,.3);
  margin-bottom: 1rem;
}
.footer-col ul { list-style: none; }
.footer-col li {
  margin-bottom: .45rem;
  font-size: .82rem;
  font-weight: 300;
}
.footer-col li a {
  color: rgba(255,255,255,.55);
  transition: color var(--transition);
}
.footer-col li a:hover { color: var(--accent-light); }
.footer-bottom {
  border-top: 1px solid rgba(255,255,255,.06);
  padding: 1.1rem 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: .72rem;
  color: rgba(255,255,255,.25);
}

/* ── UTILITIES ── */
.text-center { text-align: center; }
.mt-1 { margin-top: .5rem; }
.mt-2 { margin-top: 1rem; }
.mt-3 { margin-top: 1.5rem; }
.mb-3 { margin-bottom: 1.5rem; }
.hidden { display: none !important; }

/* ── ANIMATIONS ── */
.anim-ready { opacity: 0; }

/* ── RESPONSIVE ── */
@media (max-width: 960px) {
  .pain-grid { grid-template-columns: 1fr; gap: 3rem; }
  .services-grid { grid-template-columns: 1fr 1fr; }
  .process-steps { grid-template-columns: 1fr 1fr; }
  .testimonials-grid { grid-template-columns: 1fr 1fr; }
  .faq-layout { grid-template-columns: 1fr; gap: 3rem; }
  .faq-sticky { position: static; }
  .footer-grid { grid-template-columns: 1fr 1fr; }
  .stats-inner { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 640px) {
  :root { --px: 1.25rem; }
  .hamburger { display: flex; }
  .nav-desktop { display: none; }
  .nav-desktop.open {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 68px; left: 0; right: 0;
    background: var(--bg);
    padding: 1.5rem var(--px) 2rem;
    border-bottom: 1px solid var(--border);
    gap: 1.25rem;
    z-index: 99;
    box-shadow: var(--shadow-lg);
  }
  .services-grid { grid-template-columns: 1fr; }
  .process-steps { grid-template-columns: 1fr; }
  .testimonials-grid { grid-template-columns: 1fr; }
  .footer-grid { grid-template-columns: 1fr; }
  .stats-inner { grid-template-columns: 1fr 1fr; }
  .form-row { grid-template-columns: 1fr; }
  .footer-bottom { flex-direction: column; gap: .5rem; text-align: center; }
  .process-step::before { display: none; }
}

/* ── PER-DISTRICT THEMES ── */
/* Użyj w <style> na danej domenie: */
/* body { --accent: #...; --accent-light: #...; --accent-bg: #...; } */
`;

// ── WBUDOWANY PAGE.JS ──────────────────────────────────────────────────────
const PAGE_JS = `
const DISTRICTS = [
  { name: "Warszawa",   url: "https://rozwod.waw.pl",       key: "warszawa" },
  { name: "Bielany",    url: "https://rozwodbielany.pl",    key: "bielany" },
  { name: "Żoliborz",  url: "https://rozwodzoliborz.pl",   key: "zoliborz" },
  { name: "Wola",       url: "https://rozwodwola.pl",       key: "wola" },
  { name: "Ochota",     url: "https://rozwodochota.pl",     key: "ochota" },
  { name: "Mokotów",   url: "https://rozwodmokotow.pl",    key: "mokotow" },
  { name: "Tarchomin", url: "https://rozwodtarchomin.pl",  key: "tarchomin" },
  { name: "Legionowo", url: "https://rozwodlegionowo.pl",  key: "legionowo" },
  { name: "Łomianki",  url: "https://rozwodlomianki.pl",   key: "lomianki" },
  { name: "Jabłonna",  url: "https://rozwodjablonna.pl",   key: "jablonna" },
];

document.addEventListener("DOMContentLoaded", () => {
  applyTheme();
  initTicker();
  initNav();
  initAnimations();
  initFAQ();
});

function applyTheme() {
  const r = document.documentElement.style;
  r.setProperty("--accent",       SITE_CONFIG.accentColor);
  r.setProperty("--accent-light", SITE_CONFIG.accentLight);
  r.setProperty("--accent-bg",    SITE_CONFIG.accentBg);
}

function initTicker() {
  const wrap = document.getElementById("ticker-track");
  if (!wrap) return;
  const items = [...DISTRICTS, ...DISTRICTS];
  wrap.innerHTML = items.map(d =>
    '<span class="ticker-item' + (d.key === SITE_CONFIG.districtKey ? " active-district" : "") + '">' +
    '<a href="' + d.url + '">' + d.name + '</a></span>'
  ).join("");
  const singleWidth = DISTRICTS.length * 180;
  anime({ targets: "#ticker-track", translateX: ["0px", "-" + singleWidth + "px"],
    duration: DISTRICTS.length * 2200, easing: "linear", loop: true });
}

function initNav() {
  const hamburger = document.getElementById("hamburger");
  const navDesktop = document.getElementById("nav-desktop");
  if (!hamburger || !navDesktop) return;
  hamburger.addEventListener("click", () => {
    const isOpen = navDesktop.classList.toggle("open");
    hamburger.setAttribute("aria-expanded", isOpen);
    const spans = hamburger.querySelectorAll("span");
    if (isOpen) {
      anime({ targets: spans[0], rotate: 45,  translateY: 6.5,  duration: 200, easing: "easeInOutSine" });
      anime({ targets: spans[1], opacity: 0,                    duration: 200, easing: "easeInOutSine" });
      anime({ targets: spans[2], rotate: -45, translateY: -6.5, duration: 200, easing: "easeInOutSine" });
    } else {
      anime({ targets: spans[0], rotate: 0, translateY: 0, duration: 200, easing: "easeInOutSine" });
      anime({ targets: spans[1], opacity: 1,               duration: 200, easing: "easeInOutSine" });
      anime({ targets: spans[2], rotate: 0, translateY: 0, duration: 200, easing: "easeInOutSine" });
    }
  });
}

function initAnimations() {
  // Logo entrance
  anime({ targets: ".nav-logo-name", translateX: [-20, 0], opacity: [0, 1], duration: 800, easing: "easeOutCubic" });
  anime({ targets: ".nav-logo-sub",  translateX: [-14, 0], opacity: [0, 1], duration: 650, delay: 160, easing: "easeOutCubic" });

  const seq = [
    { targets: ".hero-eyebrow", translateY: [20,0], opacity: [0,1], duration: 600 },
    { targets: ".hero h1",      translateY: [30,0], opacity: [0,1], duration: 700 },
    { targets: ".hero-sub",     translateY: [20,0], opacity: [0,1], duration: 600 },
    { targets: ".hero-actions", translateY: [15,0], opacity: [0,1], duration: 500 },
    { targets: ".hero-trust",   translateY: [10,0], opacity: [0,1], duration: 500 },
  ];
  let delay = 0;
  seq.forEach(cfg => {
    const el = document.querySelector(cfg.targets);
    if (!el) return;
    anime({ ...cfg, easing: "easeOutCubic", delay });
    delay += 180;
  });

  const stats = document.querySelectorAll(".stat-number[data-count]");
  if (stats.length) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || "";
        const counter = { val: 0 };
        anime({ targets: counter, val: target, round: 1, duration: 1600, easing: "easeOutExpo",
          update() { el.innerHTML = Math.round(counter.val) + suffix; } });
        obs.unobserve(el);
      });
    }, { threshold: 0.5 });
    stats.forEach(s => obs.observe(s));
  }

  const fadeEls = document.querySelectorAll(".service-card,.testimonial,.process-step,.pain-item,.faq-item");
  const fadeObs = new IntersectionObserver(entries => {
    const visible = entries.filter(e => e.isIntersecting).map(e => e.target);
    if (!visible.length) return;
    anime({ targets: visible, translateY: [24,0], opacity: [0,1], duration: 650,
      delay: anime.stagger(80), easing: "easeOutCubic" });
    visible.forEach(el => fadeObs.unobserve(el));
  }, { threshold: 0.1 });
  fadeEls.forEach(el => { el.style.opacity="0"; el.style.transform="translateY(24px)"; fadeObs.observe(el); });
}

function initFAQ() {
  document.querySelectorAll(".faq-item").forEach(item => {
    const btn  = item.querySelector(".faq-btn");
    const body = item.querySelector(".faq-body");
    if (!btn || !body) return;
    btn.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      document.querySelectorAll(".faq-item.open").forEach(other => {
        other.classList.remove("open");
        anime({ targets: other.querySelector(".faq-body"), maxHeight: 0, duration: 280, easing: "easeInCubic" });
      });
      if (!isOpen) {
        item.classList.add("open");
        anime({ targets: body, maxHeight: [0, body.scrollHeight + 20], duration: 360, easing: "easeOutCubic" });
      }
    });
  });
}
`;
