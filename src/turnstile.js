/* ============================================================
   TURNSTILE — OCHRONA FORMULARZA
   ------------------------------------------------------------
   Widget zalozony w koncie Cloudflare pod nazwa rozwod_formularz.
   Klucz witryny jest publiczny i moze lezec w repozytorium.
   Klucz tajny NIE MOZE — Worker czyta go ze zmiennej srodowiskowej
   TURNSTILE_SECRET, ustawianej poleceniem:

       npx wrangler secret put TURNSTILE_SECRET

   ZACHOWANIE PRZY BRAKU KLUCZA TAJNEGO. Sprawdzenie jest wtedy
   pomijane, a formularz dziala. To swiadomy wybor: zgubiony sekret
   ma kosztowac spam, a nie wszystkie zgloszenia. Brak klucza trafia
   do logow Workera.
   ============================================================ */

export const TURNSTILE_SITEKEY = "0x4AAAAAAE0dkaYqWjSNBY_Q";
export const TURNSTILE_ACTION = "lead";

const ENDPOINT = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/**
 * Sprawdza zeton z formularza.
 * Zwraca { ok, powod } — nigdy nie rzuca wyjatkiem.
 */
export async function sprawdzTurnstile(token, env, hostname, ip) {
  const secret = env && env.TURNSTILE_SECRET;
  if (!secret) {
    console.error("turnstile: brak TURNSTILE_SECRET — sprawdzenie pominiete");
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
