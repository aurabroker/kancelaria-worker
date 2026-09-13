/* Zrzuca cztery strony docelowe do pliku dla kancelarii.
   Uruchomienie:  node tools/eksport-kampanie.mjs  */
import { STRONY } from "../src/kampanie.js";
import { DOMAIN_CONFIG } from "../src/domains.js";
import fs from "node:fs";

const cfg = DOMAIN_CONFIG["rozwod.waw.pl"];
const dzis = new Date().toISOString().slice(0, 10);

let md = `# Strony docelowe kampanii — do weryfikacji

**Stan na ${dzis}.** Cztery strony pod cztery grupy reklam. Teksty napisał
asystent AI. **Nie są zweryfikowane przez prawnika.**

## Co wymaga sprawdzenia w pierwszej kolejności

Wszystkie kwoty opłat sądowych i zasady zwolnień. Asystent podał je z pamięci,
a przepisy mogły się zmienić. Lista liczb użytych na stronach:

${[...new Set(STRONY.flatMap(s => s.pozycje.map(([n, k]) => `- **${k}** — ${n}`)))].join("\n")}

Osobno do potwierdzenia: zwolnienie strony dochodzącej alimentów od kosztów
sądowych, opłata od wniosku o ustanowienie rozdzielności majątkowej,
opłata 100 zł od zgodnego wniosku o separację oraz opłata od wniosków
w sprawach o kontakty i o władzę rodzicielską.

## Czego na stronach celowo nie ma

Widełek honorarium. Asystent nie zna cennika kancelarii i nie wolno mu go
zgadywać, więc wszystkie strony mówią „wycena po bezpłatnej konsultacji”
i wymieniają czynniki wpływające na cenę. Jeżeli kancelaria poda widełki,
wstawimy je — konkretna liczba konwertuje lepiej niż obietnica wyceny.

Opinii klientów. Nie wymyślamy cytatów ani liczby prowadzonych spraw.
Jako dowód wiarygodności zostaje to, co sprawdzalne: numer wpisu, izba,
wyłączny zakres praktyki, adresy biur.

---

`;

for (const [i, s] of STRONY.entries()) {
  md += `## ${i + 1}. /${s.slug} — grupa reklam „${s.grupa}”

- [ ] treść zaakceptowana
- [ ] do poprawy — uwagi niżej

**Meta title (${s.title(cfg).length}/60):** ${s.title(cfg)}
**Meta description (${s.desc(cfg).length}/155):** ${s.desc(cfg)}
**Nagłówek H1:** ${s.h1(cfg)}
**Słowa kluczowe:** ${s.slowa.join(", ")}

### Zajawka

${s.lead.join("\n\n")}

### Ile to kosztuje?

${s.kosztWstep}

| Pozycja | Kwota | Opis |
| --- | --- | --- |
${s.pozycje.map(([n, k, o]) => `| ${n} | ${k} | ${o} |`).join("\n")}

Co wpływa na wycenę:

${s.czynniki.map(t => `- ${t}`).join("\n")}

### Przebieg

${s.kroki.map(([t, c, o], n) => `${n + 1}. **${t}** (${c}) — ${o}`).join("\n")}

### Pytania i odpowiedzi

${s.faq.map(([q, a]) => `**${q}**\n\n${a}`).join("\n\n")}

### Dlaczego my

${s.dlaczego}

**Uwagi kancelarii:**

> 

---

`;
}

fs.writeFileSync(new URL("../docs/STRONY-KAMPANII-do-weryfikacji.md", import.meta.url), md);
console.log("zapisano docs/STRONY-KAMPANII-do-weryfikacji.md ·", (md.length / 1024).toFixed(0), "kB");
