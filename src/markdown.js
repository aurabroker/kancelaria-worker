/* ============================================================
   MARKDOWN DLA AGENTÓW
   ------------------------------------------------------------
   Agent proszący o `Accept: text/markdown` dostaje czystą treść
   zamiast HTML-a z nawigacją, banerem zgody i stopką.

   Markdown NIE POWSTAJE z konwersji HTML-a. Składamy go wprost
   z tych samych danych, z których budujemy strony: pytań w
   faq.js, wpisów w blog.js, stron kampanii w kampanie.js.
   Dlatego nie ma w nim śmieci, a treść jest identyczna co do
   znaczenia z tym, co widzi człowiek.

   PRZEŁĄCZNIK. Stała poniżej to stan domyślny; nadpisuje go zmienna
   MARKDOWN_DLA_AGENTOW ("tak" włącza, "nie" wyłącza). Zmienną ustawia
   się w wrangler.toml, NIE w panelu Workera — wrangler wysyła przy
   wgrywaniu wersji dokładnie te ustawienia, które widzi w pliku, więc
   wpis dodany ręcznie w panelu zniknąłby przy najbliższym wdrożeniu.
   Włączone 17 września 2026.
   ============================================================ */

import { FIRM } from "./domains.js";
import { PIEN, ZGODNA, SPORNA, MIESZKANIE, ZAKRES, SIEC } from "./layout.js";
import { CATEGORIES, faqPoolGrouped } from "./faq.js";
import { WPISY } from "./blog.js";
import { miasto } from "./kampanie.js";

/** Domyślny stan, gdy nie ma zmiennej środowiskowej. */
export const MARKDOWN_DOMYSLNIE = false;

export function markdownWlaczony(env) {
  const v = env && env.MARKDOWN_DLA_AGENTOW;
  if (typeof v === "string") {
    const w = v.trim().toLowerCase();
    if (["tak", "true", "1", "on"].includes(w)) return true;
    if (["nie", "false", "0", "off"].includes(w)) return false;
  }
  return MARKDOWN_DOMYSLNIE;
}

/* Przeglądarka wysyła "text/html,application/xhtml+xml,...". Agent musi
   wymienić text/markdown wprost. Zero jako waga to odmowa, nie prośba. */
export function chceMarkdown(naglowek) {
  if (!naglowek) return false;
  for (const czesc of String(naglowek).split(",")) {
    const [typ, ...parametry] = czesc.trim().split(";");
    if (typ.trim().toLowerCase() !== "text/markdown") continue;
    const q = parametry.map(p => p.trim()).find(p => p.startsWith("q="));
    return !q || parseFloat(q.slice(2)) > 0;
  }
  return false;
}

export function odpowiedzMarkdown(tresc, sekundy = 600) {
  return new Response(tresc, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      // Bez tego pamięć podręczna poda markdown przeglądarce albo HTML agentowi.
      "Vary": "Accept",
      "Cache-Control": `public, max-age=${sekundy}`,
    },
  });
}

/* ---------- elementy wspólne ---------- */

const stopka = (hostname) => `
## Kontakt

- Telefon: ${FIRM.phoneLabel}
- Formularz: https://${hostname}/#kontakt
- Godziny: poniedziałek–piątek 9:00–17:00
${FIRM.offices.map(o =>
  `- Biuro ${o.district}: ${o.street}, ${o.postal} ${o.city}${o.naUmowienie ? " (po umówieniu)" : ""}`).join("\n")}

## Kancelaria

${FIRM.attorney}, wpis ${FIRM.barNumber}, ${FIRM.barCouncil}. NIP ${FIRM.nip}.

Pierwsze 30 minut bez opłaty. To rozmowa organizacyjna: ustalamy zakres sprawy
i potrzebne dokumenty. Koszt porady prawnej lub prowadzenia procesu ustalamy
po ich analizie.

---

Treści mają charakter informacyjny i nie stanowią porady prawnej. Ocena
konkretnej sprawy wymaga zapoznania się z dokumentami.
`;

const naglowekPliku = (tytul, opis, adres) =>
  `# ${tytul}\n\n> ${opis}\n\nŹródło: ${adres}\n`;

/* ---------- strona główna ---------- */

export function mdStronaGlowna({ cfg, hostname, h1, faqItems }) {
  return naglowekPliku(h1, cfg.desc, `https://${hostname}/`) + `
${cfg.lead}

Sąd właściwy: ${cfg.courtNote}

## Czym się zajmuję

${ZAKRES.map(([, t, o]) => `- **${t}** — ${o}`).join("\n")}

## Przebieg sprawy

Wspólny początek, niezależnie od tego, jak potoczy się sprawa:

${PIEN.map(([t, c], i) => `${i + 1}. **${t}** (${c})`).join("\n")}

Przy odpowiedzi na pozew sprawa się rozdziela.

**Ścieżka zgodna — łącznie 4–8 miesięcy:**

${ZGODNA.map(([t, c]) => `- ${t} (${c})`).join("\n")}

**Ścieżka sporna — łącznie od 1,5 roku do 3 lat:**

${SPORNA.map(([t, c]) => `- ${t} (${c})`).join("\n")}

## Koszty rozwodu

| Pozycja | Kwota | Uwagi |
| --- | --- | --- |
| Opłata sądowa od pozwu | 600 zł | Przy rozwodzie bez orzekania o winie sąd zwraca 300 zł. |
| Honorarium kancelarii | wycena na rozmowie | Ryczałt za instancję, zapisany w umowie. Liczba rozpraw go nie zmienia. |
| Mediacja | wg rozporządzenia | Tylko przy skierowaniu przez sąd; koszt zwykle dzielony. |
| Opinia biegłych | zaliczka sądowa | Badanie w zespole sądowych specjalistów jest dla stron nieodpłatne. |

Rozwód bez orzekania o winie: zwykle jedna rozprawa, 4–8 miesięcy, zwrot
300 zł z opłaty. Rozwód z orzeczeniem o winie: postępowanie dowodowe,
kilka rozpraw, 1,5–3 lata, bez zwrotu opłaty.

## Mieszkanie i kredyt

Rozwód nie zmienia umowy kredytowej. Wobec banku nadal odpowiadacie oboje.

${MIESZKANIE.map(s => `### Scenariusz ${s.nr}: ${s.tytul}

${s.kroki.map(k => `- ${k}`).join("\n")}

Ryzyko: ${s.ryzyko}`).join("\n\n")}

## Najczęstsze pytania

${faqItems.map(f => `### ${f.q}\n\n${f.a}`).join("\n\n")}
` + stopka(hostname) + `
## Pozostałe strony

- Baza pytań: https://${hostname}/pytania
- Blog: https://${hostname}/blog
- Alimenty: https://${hostname}/alimenty
- Podział majątku: https://${hostname}/podzial-majatku
- Separacja: https://${hostname}/separacja
- Kontakty z dzieckiem: https://${hostname}/opieka-nad-dzieckiem

## Sieć kancelarii

${SIEC.map(([h, n]) => `- ${n}: https://${h}`).join("\n")}
`;
}

/* ---------- strona kampanii ---------- */

export function mdKampania({ cfg, hostname, strona }) {
  return naglowekPliku(strona.h1(cfg), strona.desc(cfg),
                       `https://${hostname}/${strona.slug}`) + `
${strona.lead.join("\n\n")}

## Ile to kosztuje?

${strona.kosztWstep}

| Pozycja | Kwota | Uwagi |
| --- | --- | --- |
${strona.pozycje.map(([n, k, o]) => `| ${n} | ${k} | ${o} |`).join("\n")}

Co wpływa na wysokość wyceny:

${strona.czynniki.map(t => `- ${t}`).join("\n")}

## Jak wygląda sprawa krok po kroku

${strona.kroki.map(([t, c, o], i) => `${i + 1}. **${t}** (${c}) — ${o}`).join("\n")}

## Najczęstsze pytania

${strona.faq.map(([q, a]) => `### ${q}\n\n${a}`).join("\n\n")}

## Dlaczego my

${strona.dlaczego}

Obszar: ${miasto(cfg)} i okolice.
` + stopka(hostname) + `
## Powiązane strony

${strona.linki.map(([u, t]) => `- ${t}: https://${hostname}${u}`).join("\n")}
`;
}

/* ---------- blog ---------- */

export function mdBlogLista(hostname) {
  return naglowekPliku("Blog — wiedza o rozwodzie",
    "Teksty o przebiegu sprawy rozwodowej: czas, koszty, mieszkanie, dzieci, majątek.",
    `https://${hostname}/blog`) + `
${WPISY.map(w => `## ${w.tytul}

${w.lead}

Kategoria: ${w.kategoria}. Adres: https://${hostname}/blog/${w.slug}`).join("\n\n")}
` + stopka(hostname);
}

export function mdBlogWpis(hostname, w) {
  return naglowekPliku(w.tytul, w.opis, `https://${hostname}/blog/${w.slug}`) + `
Kategoria: ${w.kategoria}. Data: ${w.data}. Autor: ${FIRM.attorney}.

${w.lead}

${w.sekcje.map(s => `## ${s.h}\n\n${s.p.join("\n\n")}`).join("\n\n")}

## Co zapamiętać

${w.zapamietaj.map(t => `- ${t}`).join("\n")}
` + stopka(hostname);
}

/* ---------- baza pytań ---------- */

export function mdPytania(cfg, hostname) {
  const wiersze = faqPoolGrouped(hostname).map(g =>
    `## ${g.label || CATEGORIES[g.cat] || g.cat}\n\n` +
    g.items.map(f => `### ${f.q}\n\n${f.a}`).join("\n\n")).join("\n\n");
  return naglowekPliku(`Pytania i odpowiedzi — ${cfg.district}`,
    "Baza odpowiedzi na pytania o rozwód, alimenty, majątek i opiekę nad dziećmi.",
    `https://${hostname}/pytania`) + "\n" + wiersze + "\n" + stopka(hostname);
}
