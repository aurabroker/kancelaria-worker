/**
 * Cloudflare Worker — Kancelaria Adwokacka Magdalena Idzik-Cieśla
 * Obsługuje wszystkie 10 domen, zapisuje leady do Supabase
 */

// ── KONFIGURACJA DOMEN ─────────────────────────────────────────────────────
import { DOMAIN_CONFIG, DEFAULT_CONFIG, ALL_HOSTS, FIRM, AD_HEADLINES } from "./domains.js";
import { CATEGORIES, faqForHost, faqPoolGrouped } from "./faq.js";
import { sendLeadNotification } from "./mail.js";
import { photoResponse, PHOTO_DIMS } from "./photo.js";

/* Pomiar. GA4 wspolny dla calej sieci. Identyfikator Google Ads
   uzupelnic po otrzymaniu z panelu — do tego czasu tag Ads sie nie renderuje,
   a rozwodtarchomin.pl korzysta z wlasnego wpisu w konfiguracji domeny. */
export const TRACKING = {
  ga4:          "G-9QQRN32R64",
  adsId:        "",   // AW-XXXXXXXXX
  adsLeadLabel: "",   // AW-XXXXXXXXX/etykieta-formularz
  adsCallLabel: "",   // AW-XXXXXXXXX/etykieta-telefon
};

const YEAR = new Date().getUTCFullYear();
const esc = (v) => String(v ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

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
      return handleLead(request, cfg, hostname, env);
    }

    const photo = photoResponse(url.pathname);
    if (photo) return photo;

    if (url.pathname === "/robots.txt") {
      return new Response(buildRobots(hostname), {
        headers: { "Content-Type": "text/plain; charset=utf-8", ...cacheHeaders(3600) } });
    }
    if (url.pathname === "/sitemap.xml") {
      return new Response(buildSitemap(hostname), {
        headers: { "Content-Type": "application/xml; charset=utf-8", ...cacheHeaders(3600) } });
    }
    if (url.pathname === "/llms.txt") {
      return new Response(buildLlms(cfg, hostname), {
        headers: { "Content-Type": "text/plain; charset=utf-8", ...cacheHeaders(3600) } });
    }
    if (url.pathname === "/pytania") {
      return new Response(buildPytaniaHTML(cfg, hostname), {
        headers: { "Content-Type": "text/html; charset=utf-8", ...cacheHeaders(300) } });
    }
    if (url.pathname === "/polityka-prywatnosci" || url.pathname === "/rodo") {
      return new Response(buildLegalHTML(cfg, hostname, url.pathname), {
        headers: { "Content-Type": "text/html; charset=utf-8", ...cacheHeaders(3600) } });
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

    // GET /opinia.html
    if (url.pathname === "/opinia.html") {
      return new Response(buildOpiniaHTML(cfg), {
        headers: { "Content-Type": "text/html; charset=utf-8", ...cacheHeaders(300) }
      });
    }

    // GET /dziekujemy.html
    if (url.pathname === "/dziekujemy.html") {
      return new Response(buildDziekujemyHTML(cfg, hostname), {
        headers: { "Content-Type": "text/html; charset=utf-8", ...cacheHeaders(0) }
      });
    }

    // GET / — strona glowna
    if (url.pathname === "/") {
      return new Response(buildHTML(cfg, hostname, url), {
        headers: { "Content-Type": "text/html; charset=utf-8", ...cacheHeaders(300) }
      });
    }

    // Wszystko pozostale to prawdziwy 404, nie kopia strony glownej.
    return new Response(build404HTML(cfg, hostname), {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8", ...cacheHeaders(300) }
    });
  }
};

// ── OBSŁUGA LEADA ──────────────────────────────────────────────────────────
async function handleLead(request, cfg, hostname, env) {
  let body;
  try { body = await request.json(); } catch {
    return jsonError(400, "Nieprawidłowy JSON");
  }

  const { imie, telefon, email = "", temat = "", wiadomosc = "", utm = {} } = body;

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
        utm_source:    (utm.utm_source   || "").slice(0, 64),
        utm_medium:    (utm.utm_medium   || "").slice(0, 64),
        utm_campaign:  (utm.utm_campaign || "").slice(0, 64),
        utm_content:   (utm.utm_content  || "").slice(0, 64),
        utm_term:      (utm.utm_term     || "").slice(0, 64),
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("Supabase error:", err);
      return jsonError(500, "Błąd zapisu — spróbuj ponownie");
    }

    // Powiadomienie mailowe jest best-effort: lead jest juz zapisany,
    // wiec blad wysylki nie moze przerwac obslugi formularza.
    await sendLeadNotification(env, {
      imie: imie.trim(), telefon: telefon.trim(), email: email.trim(),
      temat, wiadomosc: wiadomosc.trim(), zrodlo_domena: hostname,
      dzielnica: cfg.district, ...utm,
    }, FIRM);

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
function buildHTML(cfg, hostname, url) {
  const title = cfg.title;
  const desc  = cfg.desc;
  // Naglowek dopasowany do grupy reklam, gdy adres niesie utm_content.
  const adGroup = url && url.searchParams ? url.searchParams.get("utm_content") : null;
  const h1 = (AD_HEADLINES[adGroup] && AD_HEADLINES[adGroup](cfg)) || cfg.h1;
  const faqItems = faqForHost(hostname, 8);

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
<meta property="og:locale" content="pl_PL">
<meta property="og:image" content="https://${hostname}${FIRM.photoOg}">
<meta property="og:image:width" content="${PHOTO_DIMS.square.w}">
<meta property="og:image:height" content="${PHOTO_DIMS.square.h}">
<meta name="twitter:card" content="summary_large_image">

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
  "openingHours": "${FIRM.hours}",
  "priceRange": "$$",
  "vatID": "${FIRM.nip}",
  "image": "https://${hostname}${FIRM.photoOg}",
  "areaServed": ${JSON.stringify(cfg.areas)},
  "founder": {
    "@type": "Person",
    "name": "${FIRM.attorney}",
    "jobTitle": "Adwokat",
    "identifier": "${FIRM.barNumber}",
    "image": "https://${hostname}${FIRM.photoOg}",
    "memberOf": { "@type": "Organization", "name": "${FIRM.barCouncil}" }
  },
  "hasMap": "https://maps.google.com/?q=Ceramiczna+5E,+Warszawa"
}
<\/script>

<!-- FAQ Schema — generowany z pytan faktycznie widocznych na stronie -->
<script type="application/ld+json">
${JSON.stringify({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map(f => ({
    "@type": "Question", name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a }
  }))
})}
<\/script>

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@400;600&display=swap" rel="stylesheet">
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
${trackingHead(cfg)}
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
      <a href="#adwokat" class="nav-link">Adwokat</a>
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
          ${esc(h1)}
        </h1>
        <p class="hero-sub" style="text-align:left;margin:0 0 2rem;max-width:100%;">
          ${esc(cfg.lead)}
        </p>
        <div class="hero-actions" style="justify-content:flex-start;margin-bottom:2rem;">
          <a href="#kontakt" class="btn btn-primary btn-lg">Umów bezpłatną konsultację →</a>
          <a href="tel:+48605089552" onclick="trackCall()" class="btn btn-outline btn-lg">📞 605 089 552</a>
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
      <div class="stat-item"><div class="stat-number" data-count="12" data-suffix="+">12+</div><div class="stat-label">Lat doświadczenia</div></div>
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
          <div class="pain-item"><div class="pain-icon">⚖️</div><div><h4>Nie wiem od czego zacząć</h4><p>Wyjaśniamy każdy krok po ludzku — bez żargonu, bez ukrytych kosztów.</p></div></div>
          <div class="pain-item"><div class="pain-icon">🏠</div><div><h4>Obawiamy się o mieszkanie i majątek</h4><p>Zadbamy o sprawiedliwy podział — nieruchomości, oszczędności, firma, kredyt.</p></div></div>
          <div class="pain-item"><div class="pain-icon">👶</div><div><h4>Dzieci są dla mnie najważniejsze</h4><p>Pomagamy ustalić plan wychowawczy zabezpieczający dobro dzieci i Twój realny kontakt.</p></div></div>
          <div class="pain-item"><div class="pain-icon">🤝</div><div><h4>Chcę to zakończyć polubownie</h4><p>Mediacja jest często szybsza i tańsza. Wspieramy ugodowe rozwiązania gdzie to możliwe.</p></div></div>
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
        <a href="tel:+48605089552" onclick="trackCall()" class="btn btn-primary">📞 605 089 552</a>
      </div>
      <div class="faq-list">
        ${faqItems.map(f => `<div class="faq-item"><button class="faq-btn">${esc(f.q)}<span class="faq-icon">+</span></button><div class="faq-body"><p>${esc(f.a)}</p></div></div>`).join("\n        ")}
        <p style="margin-top:1.25rem;font-size:.9rem"><a href="/pytania">Zobacz wszystkie pytania i odpowiedzi \u2192</a></p>
      </div>
    </div>
  </div>
</section>

<!-- ADWOKATKA -->
<section class="section" id="adwokat">
  <div class="container">
    <div style="display:grid;grid-template-columns:minmax(0,320px) 1fr;gap:3rem;align-items:center;" class="lawyer-grid">
      <div>
        <img src="${FIRM.photo}" alt="${esc(FIRM.attorney)}, adwokat prowadzący sprawy rozwodowe ${esc(cfg.locative)}"
             width="${PHOTO_DIMS.portrait.w}" height="${PHOTO_DIMS.portrait.h}" loading="lazy" decoding="async"
             style="width:100%;height:auto;display:block;border-radius:var(--radius-lg);box-shadow:var(--shadow-lg);">
      </div>
      <div>
        <p class="section-label">Kto poprowadzi Twoją sprawę</p>
        <h2 class="section-title" style="margin-bottom:1rem">${esc(FIRM.attorney)}</h2>
        <p class="section-desc" style="margin-bottom:1.25rem">
          Prowadzę sprawy rozwodowe i rodzinne ${esc(cfg.locative)} od kilkunastu lat. Na pierwszym
          spotkaniu mówię wprost, jak wygląda Twoja sytuacja i czego realnie możesz się spodziewać —
          także wtedy, gdy odpowiedź nie jest ta, którą chciałabyś usłyszeć.
        </p>
        <ul style="list-style:none;padding:0;margin:0;display:grid;gap:.45rem;font-size:.92rem">
          <li><strong>Wpis na listę adwokatów:</strong> ${esc(FIRM.barNumber)}</li>
          <li><strong>Izba:</strong> ${esc(FIRM.barCouncil)}</li>
          <li><strong>NIP:</strong> ${esc(FIRM.nip)}</li>
          <li><strong>Kontakt:</strong> <a href="tel:${FIRM.phone}" onclick="trackCall()">${esc(FIRM.phoneLabel)}</a> · <a href="mailto:${FIRM.email}">${esc(FIRM.email)}</a></li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- SAD WLASCIWY -->
<section class="section" style="background:var(--accent-bg);">
  <div class="container">
    <div class="section-header section-center text-center">
      <p class="section-label">Gdzie toczy się sprawa</p>
      <h2 class="section-title">${esc(cfg.court.name)}</h2>
      <p class="section-desc">${esc(cfg.courtNote)}</p>
    </div>
    <p style="text-align:center;font-size:.92rem;color:var(--text-muted)">
      ${esc(cfg.court.address)}<br>
      Obsługujemy: ${cfg.areas.map(esc).join(" · ")}
    </p>
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
      <p class="form-card-sub">Oddzwonimy w ciągu 2 godzin (pn–pt 8:00–18:00).</p>
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
      <a href="tel:+48605089552" onclick="trackCall()" class="btn btn-white btn-lg">📞 605 089 552</a>
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
          <a href="tel:+48605089552" onclick="trackCall()">📞 605 089 552</a>
          <a href="mailto:kancelaria@idzik.org.pl">✉ kancelaria@idzik.org.pl</a>
        </div>
      </div>
      <div class="footer-col"><h5>Usługi</h5><ul><li><a href="#pomoc">Rozwód</a></li><li><a href="#pomoc">Podział majątku</a></li><li><a href="#pomoc">Opieka nad dziećmi</a></li><li><a href="#pomoc">Alimenty</a></li></ul></div>
      <div class="footer-col"><h5>Biura</h5><ul><li>ul. Ceramiczna 5E/79</li><li>03-126 Warszawa</li><li style="margin-top:.4rem">ul. Bolkowska 2A/28</li><li>01-466 Warszawa</li></ul></div>
      <div class="footer-col"><h5>Dane kancelarii</h5><ul>
        <li>${esc(FIRM.attorney)}</li>
        <li>Wpis nr ${esc(FIRM.barNumber)}</li>
        <li>${esc(FIRM.barCouncil)}</li>
        <li>NIP ${esc(FIRM.nip)}</li>
      </ul></div>
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
      <span>© ${YEAR} ${esc(FIRM.name)}. Wszelkie prawa zastrzeżone.</span>
      <span><a href="/polityka-prywatnosci" style="color:inherit">Polityka prywatności</a> · <a href="/rodo" style="color:inherit">RODO</a> · <a href="/pytania" style="color:inherit">Pytania</a></span>
    </div>
  </div>
</footer>

<script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js"></script>
<script src="/assets/page.js"></script>
<script>
function trackLead() {
  try {
    if (window.gtag) {
      gtag('event', 'generate_lead', { form: 'kontakt' });
      if (window.ADS_LEAD) gtag('event', 'conversion', { send_to: window.ADS_LEAD });
    }
  } catch (e) {}
}
function trackCall() {
  try {
    if (window.gtag) {
      gtag('event', 'contact', { method: 'telefon' });
      if (window.ADS_CALL) gtag('event', 'conversion', { send_to: window.ADS_CALL });
    }
  } catch (e) {}
}

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
  const q = new URLSearchParams(location.search);
  const utm = {};
  ['utm_source','utm_medium','utm_campaign','utm_content','utm_term']
    .forEach(k => { if (q.get(k)) utm[k] = q.get(k); });
  const payload = {
    imie:      document.getElementById('imie').value,
    telefon:   document.getElementById('tel').value,
    email:     document.getElementById('email').value,
    temat:     document.getElementById('temat').value,
    wiadomosc: document.getElementById('wiadomosc').value,
    utm,
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
      // Konwersja liczona tam, gdzie uzytkownik naprawde konczy,
      // a nie na stronie /dziekujemy.html, do ktorej nikt nie trafia.
      trackLead();
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

/* Fonty ladowane wylacznie znacznikiem <link> w <head>.
   @import z arkusza tworzyl drugi, szeregowy lancuch pobran. */

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
  --section-py: clamp(4rem, 8vw, 7rem);

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
  background: var(--navy);
  overflow: hidden;
  height: 36px;
  display: flex;
  align-items: center;
  position: relative;
  z-index: 200;
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
  padding: 0 1.5rem;
  font-size: .72rem;
  font-weight: 500;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: rgba(255,255,255,.55);
  transition: color var(--transition);
}
.ticker-item.active-district {
  color: var(--accent-light);
}
.ticker-item::before {
  content: '⬥';
  font-size: .55rem;
  color: var(--accent-light);
  opacity: .6;
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
  line-height: 1.15;
}
.nav-logo-name {
  font-family: var(--serif);
  font-size: .95rem;
  font-weight: 700;
  color: var(--navy);
  letter-spacing: -.01em;
}
.nav-logo-sub {
  font-size: .68rem;
  font-weight: 400;
  color: var(--text-muted);
  letter-spacing: .06em;
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
.section-header { margin-bottom: clamp(2.5rem, 5vw, 4rem); }

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
  width: 44px; height: 44px;
  border-radius: 10px;
  background: var(--accent-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
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
  .lawyer-grid { grid-template-columns: 1fr !important; gap: 1.75rem !important; }
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

function buildOpiniaHTML(cfg) {
  const ADM_URL = SUPABASE_URL + "/functions/v1/review-admin";
  return `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Opinie klientów | Kancelaria Idzik-Cieśla · ${cfg.district}</title>
<meta name="robots" content="noindex, nofollow">
<style>:root{--accent:${cfg.accent};--accent-light:${cfg.light};--accent-bg:${cfg.bg};}</style>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@400;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/style.css">
<style>
  .hero-star{display:inline-block;font-size:2.6rem;color:var(--accent);animation:heroSpin 1.2s ease-in-out both;filter:drop-shadow(0 0 6px var(--accent-light));}
  @keyframes heroSpin{0%{transform:rotate(-30deg) scale(.6);opacity:0;}60%{transform:rotate(10deg) scale(1.2);}100%{transform:rotate(0deg) scale(1);opacity:1;}}
  .star-btn{font-size:2.2rem;cursor:pointer;color:#ddd;transition:transform .15s,color .15s;user-select:none;background:none;border:none;padding:0 2px;}
  .star-btn.lit{color:var(--accent);} .star-btn:hover{transform:scale(1.2);}
  #review-list{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:1.25rem;}
  .admin-row{display:flex;align-items:flex-start;gap:1rem;padding:.75rem 0;border-bottom:1px solid rgba(0,0,0,.06);}
  .admin-row:last-child{border-bottom:none;}
  .admin-badge{font-size:.72rem;padding:1px 8px;border-radius:10px;background:var(--accent);color:#fff;margin-left:4px;}
  .admin-badge.pending{background:#f59e0b;}
  .admin-actions{display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.4rem;}
  .admin-btn{font-size:.78rem;padding:4px 12px;border-radius:6px;border:1px solid;cursor:pointer;}
  .admin-btn.approve{background:#16a34a;color:#fff;border-color:#16a34a;}
  .admin-btn.reject{background:#f59e0b;color:#fff;border-color:#f59e0b;}
  .admin-btn.del{background:#dc2626;color:#fff;border-color:#dc2626;}
</style>
${trackingHead(cfg)}
</head>
<body>
<div class="ticker-wrap"><div class="ticker-track" id="ticker-track"></div></div>
<header class="nav">
  <div class="nav-inner">
    <a href="/" class="nav-logo">
      <span class="nav-logo-name">Kancelaria Adwokacka</span>
      <span class="nav-logo-sub">Magdalena Idzik‑Cieśla</span>
    </a>
    <nav class="nav-links nav-desktop" id="nav-desktop">
      <a href="/" class="nav-link">← Strona główna</a>
      <a href="/#kontakt" class="btn nav-cta">Bezpłatna konsultacja</a>
    </nav>
    <button class="hamburger" id="hamburger" aria-label="Menu" aria-expanded="false">
      <span></span><span></span><span></span>
    </button>
  </div>
</header>
<main>
<section class="section" style="background:var(--accent-bg);border-bottom:1px solid rgba(0,0,0,.07);padding-top:clamp(3rem,6vw,5rem);padding-bottom:clamp(2rem,4vw,3.5rem);">
  <div class="container" style="text-align:center;max-width:680px;">
    <div style="margin-bottom:1.25rem;">
      <span class="hero-star" style="animation-delay:.00s">★</span>
      <span class="hero-star" style="animation-delay:.25s">★</span>
      <span class="hero-star" style="animation-delay:.50s">★</span>
      <span class="hero-star" style="animation-delay:.75s">★</span>
      <span class="hero-star" style="animation-delay:1.00s">★</span>
    </div>
    <p class="section-label">Twoja opinia ma znaczenie</p>
    <h1 style="font-size:clamp(1.8rem,3vw,2.6rem);margin:.5rem 0 1rem;">Podziel się <em>swoją opinią</em></h1>
    <p style="color:var(--text-muted);font-size:1rem;line-height:1.7;max-width:520px;margin:0 auto;">Opinie naszych klientów pomagają innym znaleźć rzetelną pomoc prawną. Każda recenzja jest weryfikowana i publikowana ręcznie.</p>
  </div>
</section>
<section class="section">
  <div class="container" style="max-width:620px;">
    <div class="form-card">
      <div id="form-inner">
        <div class="form-card-title">Wystaw opinię</div>
        <p class="form-card-sub">Twoja opinia zostanie opublikowana po weryfikacji (do 24h).</p>
        <div style="text-align:center;margin-bottom:1.5rem;">
          <p style="font-size:.88rem;color:var(--text-muted);margin-bottom:.5rem;font-weight:500;">Twoja ocena</p>
          <div id="stars-input" style="display:flex;justify-content:center;gap:.1rem;">
            <button type="button" class="star-btn lit" data-val="1">★</button>
            <button type="button" class="star-btn lit" data-val="2">★</button>
            <button type="button" class="star-btn lit" data-val="3">★</button>
            <button type="button" class="star-btn lit" data-val="4">★</button>
            <button type="button" class="star-btn lit" data-val="5">★</button>
          </div>
          <input type="hidden" id="rating-val" value="5">
        </div>
        <div class="form-row">
          <div class="form-group"><label for="r-name">Imię *</label><input type="text" id="r-name" placeholder="Jan" required autocomplete="given-name"></div>
          <div class="form-group"><label for="r-city">Miasto *</label><input type="text" id="r-city" placeholder="${cfg.district}" required autocomplete="address-level2"></div>
        </div>
        <div class="form-group"><label for="r-zawod">Zawód (opcjonalnie)</label><input type="text" id="r-zawod" placeholder="np. inżynier, nauczyciel…"></div>
        <div class="form-group"><label for="r-comment">Komentarz (opcjonalnie)</label><textarea id="r-comment" placeholder="Opisz swoje doświadczenie z kancelarią…" rows="4"></textarea></div>
        <button type="button" id="submit-btn" class="form-submit">Wyślij opinię →</button>
        <p class="form-notice">\u{1F512} Widoczne będzie tylko Twoje imię i miasto.</p>
        <div id="form-error" style="display:none;padding:.75rem;color:#dc2626;font-size:.9rem;background:#fef2f2;border-radius:.5rem;margin-top:.5rem;"></div>
      </div>
      <div id="form-success" style="display:none;text-align:center;padding:2.5rem 0;">
        <div style="font-size:2.5rem;margin-bottom:.75rem;">\u{1F389}</div>
        <div style="font-family:var(--serif);font-size:1.3rem;font-weight:700;color:var(--navy);margin-bottom:.4rem;">Dziękujemy!</div>
        <p style="font-size:.9rem;color:var(--text-muted);">Twoja opinia zostanie opublikowana po weryfikacji.</p>
      </div>
    </div>
  </div>
</section>
<section class="section" style="background:var(--accent-bg);border-top:1px solid rgba(0,0,0,.07);">
  <div class="container">
    <div class="section-header section-center text-center" style="margin-bottom:2rem;">
      <p class="section-label">Opinie klientów</p>
      <h2 class="section-title">Co mówią <em>nasi klienci</em></h2>
    </div>
    <div id="review-list"><div style="text-align:center;color:var(--text-muted);padding:2rem;">Ładowanie opinii…</div></div>
  </div>
</section>
</main>
<footer>
  <div class="container">
    <div class="footer-grid">
      <div>
        <div class="footer-brand">Kancelaria Adwokacka Magdalena Idzik‑Cieśla</div>
        <p class="footer-tagline">Dyskretna i skuteczna pomoc prawna. ${cfg.district} · Warszawa i Mazowieckie.</p>
        <div class="footer-contact">
          <a href="tel:+48605089552" onclick="trackCall()">\u{1F4DE} 605 089 552</a>
          <a href="mailto:kancelaria@idzik.org.pl">✉ kancelaria@idzik.org.pl</a>
        </div>
      </div>
    </div>
  </div>
  <div class="footer-bottom"><div class="container"><span>© 2025 Kancelaria Adwokacka Magdalena Idzik-Cieśla. Wszelkie prawa zastrzeżone.</span></div></div>
</footer>
<div style="position:fixed;bottom:1.5rem;right:1.5rem;z-index:100;">
  <button id="admin-toggle" title="Panel admina" style="width:44px;height:44px;border-radius:50%;background:rgba(0,0,0,.1);border:none;cursor:pointer;font-size:1.2rem;display:flex;align-items:center;justify-content:center;">⚙</button>
</div>
<div id="admin-overlay" style="position:fixed;inset:0;z-index:200;display:none;align-items:center;justify-content:center;background:rgba(0,0,0,.5);">
  <div style="background:#fff;border-radius:var(--radius-lg);padding:2rem;max-width:780px;width:calc(100% - 2rem);max-height:82vh;overflow-y:auto;box-shadow:var(--shadow-lg);">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
      <h3 style="margin:0;font-family:var(--serif);">Panel moderacji opinii</h3>
      <button id="admin-close" style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">×</button>
    </div>
    <div id="admin-login">
      <p style="font-size:.9rem;color:var(--text-muted);margin-bottom:1rem;">Zaloguj się jako admin:</p>
      <div style="display:flex;flex-direction:column;gap:.5rem;">
        <input type="email" id="admin-email" placeholder="e-mail…" style="padding:.6rem .9rem;border:1px solid #ddd;border-radius:.5rem;font-size:.9rem;">
        <div style="display:flex;gap:.75rem;">
          <input type="password" id="admin-pwd" placeholder="hasło…" style="flex:1;padding:.6rem .9rem;border:1px solid #ddd;border-radius:.5rem;font-size:.9rem;">
          <button id="admin-login-btn" class="btn btn-primary" style="white-space:nowrap;">Zaloguj</button>
        </div>
      </div>
      <p id="admin-err" style="color:#dc2626;font-size:.85rem;margin-top:.5rem;display:none;">Nieprawidłowe dane lub brak uprawnień</p>
    </div>
    <div id="admin-content" style="display:none;"><div id="admin-list"></div></div>
  </div>
</div>
<script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js"><\/script>
<script src="/assets/page.js"><\/script>
<script src="https://cdn.jsdelivr.net/npm/canvas-confetti@1/dist/confetti.browser.min.js"><\/script>
<script>
const SB_URL='${SUPABASE_URL}',SB_KEY='${SUPABASE_ANON}',ADM_URL='${ADM_URL}',PLATFORM='${cfg.district}';
const esc=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const starBtns=[...document.querySelectorAll('.star-btn')];
const ratingInput=document.getElementById('rating-val');
function setRating(val){ratingInput.value=val;starBtns.forEach(s=>s.classList.toggle('lit',+s.dataset.val<=val));}
starBtns.forEach(s=>{
  s.addEventListener('click',()=>setRating(+s.dataset.val));
  s.addEventListener('mouseenter',()=>starBtns.forEach(x=>x.style.color=+x.dataset.val<=+s.dataset.val?'var(--accent)':'#ddd'));
  s.addEventListener('mouseleave',()=>starBtns.forEach(x=>x.style.color=+x.dataset.val<=+ratingInput.value?'var(--accent)':'#ddd'));
});
document.getElementById('submit-btn').addEventListener('click',async()=>{
  const name=document.getElementById('r-name').value.trim();
  const city=document.getElementById('r-city').value.trim();
  const zawod=document.getElementById('r-zawod').value.trim()||null;
  const comment=document.getElementById('r-comment').value.trim()||null;
  const rating=parseInt(ratingInput.value);
  const errEl=document.getElementById('form-error');
  if(!name||!city){errEl.textContent='Imię i miasto są wymagane.';errEl.style.display='block';return;}
  errEl.style.display='none';
  const btn=document.getElementById('submit-btn');
  btn.disabled=true;btn.textContent='Wysyłanie…';
  try{
    const res=await fetch(SB_URL+'/rest/v1/div_review',{method:'POST',headers:{apikey:SB_KEY,Authorization:'Bearer '+SB_KEY,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({name,city,zawod,comment,rating,platform:PLATFORM})});
    if(!res.ok)throw new Error(await res.text());
    document.getElementById('form-inner').style.display='none';
    document.getElementById('form-success').style.display='block';
    fireConfetti();
  }catch(e){errEl.textContent='Błąd zapisu. Spróbuj ponownie.';errEl.style.display='block';btn.disabled=false;btn.textContent='Wyślij opinię →';}
});
function fireConfetti(){const end=Date.now()+3000;(function frame(){confetti({particleCount:4,angle:60,spread:55,origin:{x:0}});confetti({particleCount:4,angle:120,spread:55,origin:{x:1}});if(Date.now()<end)requestAnimationFrame(frame);})();}
async function loadReviews(){
  const grid=document.getElementById('review-list');
  try{
    const p=new URLSearchParams({select:'name,city,rating,comment,platform,created_at',approved:'eq.true',order:'created_at.desc',limit:'50'});
    const rows=await(await fetch(SB_URL+'/rest/v1/div_review?'+p,{headers:{apikey:SB_KEY,Accept:'application/json'}})).json();
    if(!Array.isArray(rows)||!rows.length){grid.innerHTML='<div style="text-align:center;color:var(--text-muted);padding:2.5rem;border:2px dashed #ddd;border-radius:1rem;">Bądź pierwszą osobą, która wystawi opinię!</div>';return;}
    grid.innerHTML=rows.map(r=>{
      const ini=esc(r.name).split(' ').map(w=>w[0]||'').join('').slice(0,2).toUpperCase();
      const stars='★'.repeat(r.rating)+'<span style="color:#ddd">'+'★'.repeat(5-r.rating)+'</span>';
      const txt=r.comment?'„'+esc(r.comment)+'"':'<em style="color:var(--text-muted)">Brak komentarza</em>';
      return '<div class="testimonial" style="display:flex;flex-direction:column;">'+
        '<div class="t-stars" style="margin-bottom:.4rem;">'+stars+'</div>'+
        '<p class="t-quote" style="flex:1;margin-bottom:.75rem;">'+txt+'</p>'+
        '<div class="t-author"><div class="t-avatar">'+ini+'</div><div>'+
        '<div class="t-name">'+esc(r.name)+'</div>'+
        '<div class="t-meta">'+esc(r.city)+' · <span style="font-size:.72rem;background:var(--accent);color:#fff;padding:1px 7px;border-radius:10px;margin-left:3px;">'+esc(r.platform)+'</span></div>'+
        '</div></div></div>';
    }).join('');
  }catch(e){grid.innerHTML='<div style="text-align:center;color:var(--text-muted);padding:2rem;">Nie udało się załadować opinii.</div>';}
}
loadReviews();
let adminToken='';
const overlay=document.getElementById('admin-overlay');
const loginDiv=document.getElementById('admin-login');
const contentDiv=document.getElementById('admin-content');
const listDiv=document.getElementById('admin-list');
document.getElementById('admin-toggle').addEventListener('click',()=>{overlay.style.display='flex';});
document.getElementById('admin-close').addEventListener('click',()=>{overlay.style.display='none';});
overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.style.display='none';});
document.getElementById('admin-pwd').addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('admin-login-btn').click();});
document.getElementById('admin-login-btn').addEventListener('click',async()=>{
  const email=document.getElementById('admin-email').value.trim();
  const pwd=document.getElementById('admin-pwd').value;
  const errEl=document.getElementById('admin-err');
  const authRes=await fetch(SB_URL+'/auth/v1/token?grant_type=password',{method:'POST',headers:{'Content-Type':'application/json',apikey:SB_KEY},body:JSON.stringify({email,password:pwd})});
  if(!authRes.ok){errEl.style.display='block';return;}
  adminToken=(await authRes.json()).access_token;
  const res=await fetch(ADM_URL,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+adminToken},body:JSON.stringify({action:'list'})});
  if(res.status===401||res.status===403){errEl.style.display='block';adminToken='';return;}
  errEl.style.display='none';
  loginDiv.style.display='none';contentDiv.style.display='block';
  renderAdmin(await res.json());
});
async function adminAction(action,id){
  await fetch(ADM_URL,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+adminToken},body:JSON.stringify({action,id})});
  renderAdmin(await(await fetch(ADM_URL,{method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+adminToken},body:JSON.stringify({action:'list'})})).json());
  loadReviews();
}
function renderAdmin(rows){
  if(!rows.length){listDiv.innerHTML='<p style="color:var(--text-muted)">Brak opinii.</p>';return;}
  const pending=rows.filter(r=>!r.approved),approved=rows.filter(r=>r.approved);
  listDiv.innerHTML=
    (pending.length?'<h4 style="margin:.5rem 0 .75rem;color:#f59e0b;">Oczekujące ('+pending.length+')</h4>'+renderRows(pending,true):'')+
    (approved.length?'<h4 style="margin:1.5rem 0 .75rem;">Zatwierdzone ('+approved.length+')</h4>'+renderRows(approved,false):'');
}
function renderRows(rows,isPending){
  return rows.map(r=>
    '<div class="admin-row"><div style="flex:1;min-width:0;">'+
    '<div style="font-weight:600;font-size:.9rem;">'+esc(r.name)+' · '+esc(r.city)+
    ' <span class="admin-badge'+(isPending?' pending':'')+'">' +esc(r.platform)+'</span></div>'+
    '<div style="font-size:.8rem;color:var(--text-muted);">'+(r.zawod?esc(r.zawod)+' · ':'')+'★'.repeat(r.rating)+' · '+new Date(r.created_at).toLocaleDateString('pl-PL')+'</div>'+
    (r.comment?'<div style="font-size:.85rem;margin-top:.3rem;color:var(--navy);">&quot;'+esc(r.comment)+'&quot;</div>':'')+
    '<div class="admin-actions">'+
    (isPending
      ?'<button class="admin-btn approve" onclick="adminAction('approve',''+r.id+'')">Zatwierdź</button>'
      :'<button class="admin-btn reject" onclick="adminAction('reject',''+r.id+'')">Cofnij</button>')+
    '<button class="admin-btn del" onclick="if(confirm('Usunąć?')) adminAction('delete',''+r.id+'')">Usuń</button>'+
    '</div></div></div>'
  ).join('');
}
<\/script>
</body>
</html>`;
}

function buildDziekujemyHTML(cfg, hostname) {
  return `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Dziękujemy | Kancelaria Idzik-Cieśla</title>
<meta name="robots" content="noindex, nofollow">
<link rel="canonical" href="https://${hostname}/dziekujemy.html">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@400;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/style.css">
<style>:root{--accent:${cfg.accent};--accent-light:${cfg.light};--accent-bg:${cfg.bg};}</style>
${trackingHead(cfg)}
</head>
<body>
${cfg.gtag && cfg.conversionTag ? `<!-- Event snippet for Kontakt conversion page -->
<script>
  gtag('event', 'conversion', {'send_to': '${cfg.conversionTag}'});
<\/script>` : ""}
<div class="ticker-wrap"><div class="ticker-track" id="ticker-track"></div></div>
<header class="nav">
  <div class="nav-inner">
    <a href="https://${hostname}/" class="nav-logo" aria-label="Strona główna">
      <span class="nav-logo-name">Kancelaria Adwokacka</span>
      <span class="nav-logo-sub">Magdalena Idzik‑Cieśla</span>
    </a>
  </div>
</header>
<main>
<section class="section" style="min-height:60vh;display:flex;align-items:center;">
  <div class="container">
    <div style="max-width:560px;margin:0 auto;text-align:center;padding:4rem 0;">
      <div style="font-size:3.5rem;margin-bottom:1.5rem;">&#x2705;</div>
      <h1 style="font-size:clamp(1.8rem,3vw,2.5rem);margin-bottom:1rem;">Dziękujemy za wiadomość!</h1>
      <p style="color:var(--text-muted);font-size:1.05rem;line-height:1.7;margin-bottom:2rem;">
        Oddzwonimy do Ciebie w ciągu <strong>2 godzin</strong> w dni robocze (8:00–18:00).
        Jeśli wolisz zadzwonić sam — jesteśmy dostępni pod numerem poniżej.
      </p>
      <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;margin-bottom:2.5rem;">
        <a href="tel:+48605089552" onclick="trackCall()" class="btn btn-primary btn-lg">&#x1F4DE; 605 089 552</a>
        <a href="https://${hostname}/" class="btn btn-outline btn-lg">← Wróć na stronę</a>
      </div>
      <p style="font-size:.85rem;color:var(--text-muted);">
        Kancelaria Adwokacka Magdalena Idzik-Cieśla &nbsp;·&nbsp; ${cfg.district}
      </p>
    </div>
  </div>
</section>
</main>
<script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js"><\/script>
<script src="/assets/page.js"><\/script>
</body>
</html>`;
}


// ── POMIAR ─────────────────────────────────────────────────────────────────
function adsFor(cfg) {
  const id   = TRACKING.adsId || cfg.gtag || "";
  const lead = TRACKING.adsLeadLabel || cfg.conversionTag || "";
  const call = TRACKING.adsCallLabel || "";
  return { id, lead, call };
}

function trackingHead(cfg) {
  const ads = adsFor(cfg);
  const loadId = TRACKING.ga4 || ads.id;
  if (!loadId) return "";
  return `<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${loadId}"><\/script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
${TRACKING.ga4 ? `  gtag('config', '${TRACKING.ga4}');\n` : ""}${ads.id ? `  gtag('config', '${ads.id}');\n` : ""}${ads.lead ? `  window.ADS_LEAD = '${ads.lead}';\n` : ""}${ads.call ? `  window.ADS_CALL = '${ads.call}';\n` : ""}<\/script>`;
}

// ── ROBOTS / SITEMAP / LLMS ────────────────────────────────────────────────
const PATHS = ["/", "/pytania", "/polityka-prywatnosci", "/rodo"];

function buildRobots(hostname) {
  return `# ${hostname}
# Roboty AI: swiadoma decyzja wlasciciela serwisu.
# Wpuszczamy asystentow, ktorzy cytuja zrodlo z odnosnikiem.

User-agent: GPTBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

# Roboty zbierajace dane masowo, bez odsylania ruchu.
User-agent: CCBot
Disallow: /

User-agent: Bytespider
Disallow: /

User-agent: *
Allow: /
Disallow: /dziekujemy.html
Disallow: /opinia.html

Sitemap: https://${hostname}/sitemap.xml
`;
}

function buildSitemap(hostname) {
  const today = new Date().toISOString().slice(0, 10);
  const urls = PATHS.map(path => `  <url>
    <loc>https://${hostname}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${path === "/" ? "weekly" : "monthly"}</changefreq>
    <priority>${path === "/" ? "1.0" : "0.6"}</priority>
  </url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

function buildLlms(cfg, hostname) {
  const items = faqForHost(hostname, 8);
  return `# ${FIRM.name}

> Kancelaria adwokacka prowadzaca sprawy rozwodowe i rodzinne.
> Obszar: ${cfg.district} i okolice. Sad wlasciwy: ${cfg.court.name}.

Adwokat: ${FIRM.attorney}, wpis nr ${FIRM.barNumber}, ${FIRM.barCouncil}.
NIP ${FIRM.nip}. Telefon ${FIRM.phoneLabel}. E-mail ${FIRM.email}.
Pierwsza konsultacja trwajaca 30 minut jest bezplatna.

## Strony
- [Strona glowna](https://${hostname}/): zakres pomocy, proces, kontakt
- [Pytania i odpowiedzi](https://${hostname}/pytania): baza odpowiedzi na pytania o rozwod
- [Polityka prywatnosci](https://${hostname}/polityka-prywatnosci)

## Wybrane odpowiedzi
${items.map(f => `### ${f.q}\n${f.a}`).join("\n\n")}
`;
}

// ── STRONY DODATKOWE ───────────────────────────────────────────────────────
function shell(cfg, hostname, title, desc, body, opts = {}) {
  return `<!DOCTYPE html>
<html lang="pl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="${esc(desc)}">
<title>${esc(title)}</title>
${opts.noindex ? '<meta name="robots" content="noindex, follow">' : `<link rel="canonical" href="https://${hostname}${opts.path || "/"}">`}
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&family=DM+Sans:wght@400;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/style.css">
<style>:root{--accent:${cfg.accent};--accent-light:${cfg.light};--accent-bg:${cfg.bg};}
.prose{max-width:44rem;margin:0 auto}
.prose h2{margin:2rem 0 .6rem}
.prose p,.prose li{font-size:.95rem;line-height:1.7}
${opts.schema ? "" : ""}</style>
${trackingHead(cfg)}
</head>
<body>
<header class="nav"><div class="nav-inner">
  <a href="/" class="nav-logo">
    <span class="nav-logo-name">Kancelaria Adwokacka</span>
    <span class="nav-logo-sub">Magdalena Idzik‑Cieśla</span>
  </a>
  <nav class="nav-links nav-desktop"><a href="/#kontakt" class="btn nav-cta">Bezpłatna konsultacja</a></nav>
</div></header>
<main class="section"><div class="container">${body}</div></main>
<footer><div class="footer-bottom"><div class="container" style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:.5rem">
  <span>© ${YEAR} ${esc(FIRM.name)} · NIP ${esc(FIRM.nip)} · Wpis ${esc(FIRM.barNumber)}</span>
  <span><a href="/polityka-prywatnosci" style="color:inherit">Polityka prywatności</a> · <a href="/rodo" style="color:inherit">RODO</a></span>
</div></div></footer>
<script src="/assets/page.js"><\/script>
</body>
</html>`;
}

function buildPytaniaHTML(cfg, hostname) {
  const groups = faqPoolGrouped(hostname);
  const all = groups.flatMap(g => g.items);
  const schema = JSON.stringify({
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: all.map(f => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } }))
  });
  const body = `<div class="prose">
<p class="section-label">Baza wiedzy · ${esc(cfg.district)}</p>
<h1>Pytania o rozwód — ${esc(cfg.district)}</h1>
<p class="section-desc">Odpowiedzi przygotowane przez ${esc(FIRM.attorney)}. Stan prawny na ${YEAR} rok. Jeżeli nie znajdziesz swojej sytuacji, zadzwoń pod ${esc(FIRM.phoneLabel)} — pierwsza konsultacja trwa 30 minut i jest bezpłatna.</p>
${groups.map(g => `<h2>${esc(g.label)}</h2>
${g.items.map(f => `<h3 style="font-size:1rem;margin:1.2rem 0 .3rem">${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join("\n")}`).join("\n")}
<p style="margin-top:2.5rem"><a href="/#kontakt" class="btn btn-primary">Umów bezpłatną konsultację →</a></p>
</div>
<script type="application/ld+json">${schema}<\/script>`;
  return shell(cfg, hostname, `Pytania o rozwód — ${cfg.district} | Kancelaria Idzik-Cieśla`,
    `Odpowiedzi na najczęstsze pytania o rozwód, alimenty, podział majątku i opiekę nad dziećmi. ${cfg.district}.`,
    body, { path: "/pytania" });
}

function buildLegalHTML(cfg, hostname, path) {
  const rodo = path === "/rodo";
  const body = `<div class="prose">
<h1>${rodo ? "Informacja o przetwarzaniu danych osobowych" : "Polityka prywatności"}</h1>
<p><strong>Administrator danych.</strong> ${esc(FIRM.name)}, ${esc(FIRM.offices[0].street)}, ${esc(FIRM.offices[0].postal)} ${esc(FIRM.offices[0].city)}, NIP ${esc(FIRM.nip)}. Kontakt: ${esc(FIRM.email)}, ${esc(FIRM.phoneLabel)}.</p>
<h2>Jakie dane zbieramy</h2>
<p>Za pośrednictwem formularza kontaktowego zbieramy imię, numer telefonu oraz opcjonalnie adres e-mail, temat sprawy i jej krótki opis. Serwis prowadzi też własną analitykę po stronie serwera, bez plików cookie i bez zapisywania adresu IP w formie pozwalającej zidentyfikować osobę.</p>
<h2>W jakim celu i na jakiej podstawie</h2>
<p>Dane z formularza przetwarzamy wyłącznie po to, aby odpowiedzieć na zapytanie i przedstawić warunki pomocy prawnej. Podstawą jest podjęcie działań na żądanie osoby przed zawarciem umowy oraz prawnie uzasadniony interes administratora polegający na obsłudze korespondencji.</p>
<h2>Jak długo przechowujemy</h2>
<p>Zapytania niezakończone zawarciem umowy usuwamy po dwunastu miesiącach. Dane klientów, z którymi zawarto umowę, przechowujemy przez okres wymagany przepisami o wykonywaniu zawodu adwokata oraz przepisami podatkowymi.</p>
<h2>Komu przekazujemy dane</h2>
<p>Dane trafiają do dostawców usług technicznych działających na nasze zlecenie: hostingu serwisu, bazy danych zgłoszeń oraz usługi wysyłki poczty. Nie sprzedajemy danych i nie przekazujemy ich do celów marketingowych podmiotom trzecim.</p>
<h2>Twoje prawa</h2>
<p>Masz prawo dostępu do swoich danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia oraz wniesienia sprzeciwu. Możesz też wnieść skargę do Prezesa Urzędu Ochrony Danych Osobowych. Aby skorzystać z tych praw, napisz na ${esc(FIRM.email)}.</p>
<h2>Tajemnica adwokacka</h2>
<p>Informacje przekazane w związku ze sprawą objęte są tajemnicą adwokacką na zasadach określonych w ustawie Prawo o adwokaturze. Obowiązuje ona niezależnie od przepisów o ochronie danych osobowych i jest nieograniczona w czasie.</p>
<p style="margin-top:2rem;font-size:.85rem;color:var(--text-muted)">Ostatnia aktualizacja: ${new Date().toISOString().slice(0,10)}.</p>
</div>`;
  return shell(cfg, hostname, rodo ? `Informacja RODO | ${FIRM.name}` : `Polityka prywatności | ${FIRM.name}`,
    "Zasady przetwarzania danych osobowych w kancelarii adwokackiej.", body, { path });
}

function build404HTML(cfg, hostname) {
  const body = `<div class="prose" style="text-align:center">
<p class="section-label">Błąd 404</p>
<h1>Nie ma takiej strony</h1>
<p class="section-desc">Adres, który otworzyłeś, nie istnieje w tym serwisie. Być może zmieniliśmy jego strukturę albo w odnośniku jest literówka.</p>
<p style="margin-top:2rem;display:flex;gap:1rem;justify-content:center;flex-wrap:wrap">
  <a href="/" class="btn btn-primary">Strona główna</a>
  <a href="/pytania" class="btn btn-outline">Pytania o rozwód</a>
  <a href="tel:${FIRM.phone}" onclick="trackCall()" class="btn btn-outline">📞 ${esc(FIRM.phoneLabel)}</a>
</p>
</div>`;
  return shell(cfg, hostname, `Nie ma takiej strony | ${FIRM.name}`,
    "Strona o podanym adresie nie istnieje.", body, { noindex: true });
}
