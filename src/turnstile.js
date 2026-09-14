/* ============================================================
   TURNSTILE — OCHRONA FORMULARZA
   ------------------------------------------------------------
   Widget zalozony w koncie Cloudflare pod nazwa rozwod_formularz.
   Klucz witryny jest publiczny i moze lezec w repozytorium.
   Klucz tajny NIE MOZE — Worker czyta go z powiazania TURNSTILE_SECRET.
   W koncie jest to powiazanie z magazynem sekretow, wiec env.TURNSTILE_SECRET
   daje OBIEKT, z ktorego wartosc wyciaga sie przez .get(). Obsluga obu form
   ponizej kosztuje kilka linii i chroni przed cicha zmiana typu powiazania.

   ZACHOWANIE PRZY BRAKU KLUCZA TAJNEGO. Sprawdzenie jest wtedy
   pomijane, a formularz dziala. To swiadomy wybor: zgubiony sekret
   ma kosztowac spam, a nie wszystkie zgloszenia. Brak klucza trafia
   do logow Workera.
   ============================================================ */

export const TURNSTILE_ACTION = "lead";

/* Plan bezplatny pozwala na dziesiec nazw hosta w jednym widgecie, a siec
   ma jedenascie domen. Stad dwa widgety. Klucz witryny jest publiczny
   i moze lezec w repozytorium; klucz tajny idzie do magazynu sekretow
   pod nazwa z pola "powiazanie".

   DODAJESZ DOMENE? Dopisz ja do widgetu w panelu Cloudflare i tutaj.
   Test pilnuje, zeby zadna domena nie zostala bez ochrony po cichu. */
export const WIDGETY = [
  {
    nazwa: "rozwod_formularz",
    sitekey: "0x4AAAAAAE0dkaYqWjSNBY_Q",
    powiazanie: "TURNSTILE_SECRET",
    domeny: [
      "rozwod.waw.pl", "rozwodbemowo.pl", "rozwodbielany.pl", "rozwodjablonna.pl",
      "rozwodlegionowo.pl", "rozwodlomianki.pl", "rozwodochota.pl",
      "rozwodtarchomin.pl", "rozwodwola.pl", "rozwodzoliborz.pl",
    ],
  },
  {
    // DO UZUPELNIENIA. Zaloz w panelu widget rozwod_formularz_2 z jedna
    // domena rozwodmokotow.pl, wklej tu jego klucz witryny i dodaj sekret
    // do magazynu pod nazwa TURNSTILE_SECRET_2.
    nazwa: "rozwod_formularz_2",
    sitekey: "",
    powiazanie: "TURNSTILE_SECRET_2",
    domeny: ["rozwodmokotow.pl"],
  },
];

/** Widget obslugujacy dana domene albo null, gdy jeszcze go nie ma. */
export function widgetDla(hostname) {
  return WIDGETY.find(w => w.sitekey && w.domeny.includes(hostname)) || null;
}

/** Domeny, ktore nie maja jeszcze widgetu — formularz na nich nie jest chroniony. */
export function domenyBezWidgetu(hosty) {
  return hosty.filter(h => !widgetDla(h));
}

const ENDPOINT = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Sprawdza zeton z formularza.
 * Zwraca { ok, powod } — nigdy nie rzuca wyjatkiem.
 */
/**
 * Zwraca wartosc sekretu niezaleznie od typu powiazania w Cloudflare.
 * Powiazanie "Secret" daje wprost napis, "Secrets Store Secret" obiekt
 * z metoda .get(). Bez tego do Cloudflare poleciałby napis
 * "[object Object]", a kazde zgloszenie dostawaloby odmowe.
 */
async function czytajSekret(binding) {
  if (!binding) return "";
  if (typeof binding === "string") return binding;
  if (typeof binding.get === "function") {
    try { return (await binding.get()) || ""; } catch { return ""; }
  }
  return "";
}

export async function sprawdzTurnstile(token, env, hostname, ip) {
  const widget = widgetDla(hostname);
  if (!widget) {
    // Domena bez widgetu: formularz nie pokazuje sprawdzenia, wiec nie ma
    // czego weryfikowac. Przepuszczamy, zeby zgloszenia nie przepadaly.
    console.error(`turnstile: brak widgetu dla ${hostname} — sprawdzenie pominiete`);
    return { ok: true, powod: "brak widgetu" };
  }
  const secret = await czytajSekret(env && env[widget.powiazanie]);
  if (!secret) {
    console.error(`turnstile: brak ${widget.powiazanie} — sprawdzenie pominiete`);
    return { ok: true, powod: "brak klucza" };
  }
  if (!token) return { ok: false, powod: "brak zetonu" };

  const dane = new URLSearchParams({ secret, response: token });
  if (ip) dane.set("remoteip", ip);

  let wynik;
  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: dane,
      signal: AbortSignal.timeout(10_000),
    });
    wynik = await res.json();
  } catch (e) {
    // Cloudflare nie odpowiedzialo. Przepuszczamy: lead jest wart wiecej
    // niz pewnosc, ze po drugiej stronie siedzi czlowiek.
    console.error("turnstile:", e instanceof Error ? e.message : String(e));
    return { ok: true, powod: "brak odpowiedzi" };
  }

  if (!wynik.success) {
    return { ok: false, powod: (wynik["error-codes"] || []).join(",") || "odrzucony" };
  }
  if (wynik.action !== TURNSTILE_ACTION) {
    return { ok: false, powod: `obce dzialanie: ${wynik.action}` };
  }
  // Worker sciaga przedrostek www, wiec porownujemy takze forme z nim.
  if (wynik.hostname !== hostname && wynik.hostname !== "www." + hostname) {
    return { ok: false, powod: `obcy host: ${wynik.hostname}` };
  }
  return { ok: true };
}
