/* Zrzuca osiem wpisow bloga do pliku, ktory pani adwokat czyta i poprawia.
   Uruchomienie:  node tools/eksport-blog.mjs  */
import { WPISY } from "../src/blog.js";
import { FIRM } from "../src/domains.js";
import fs from "node:fs";

const dzis = new Date().toISOString().slice(0, 10);
const slow = w => w.sekcje.reduce((a, s) => a + s.p.join(" ").split(/\s+/).length, 0);

let md = `# Blog — osiem tekstów do weryfikacji

**Stan na ${dzis}. Do sprawdzenia przez ${FIRM.attorney}.**

Teksty napisał asystent AI na podstawie materiału z bazy 200 pytań.
**Żaden z nich nie został zweryfikowany przez prawnika.** Nic z tego pliku
nie może trafić na stronę, zanim kancelaria nie potwierdzi każdego akapitu.

Szczególnej uwagi wymagają liczby i terminy: opłaty sądowe, terminy na
uzasadnienie i apelację, zasady zwrotu połowy opłaty, opłaty w sprawie
o podział majątku oraz zasady dzielenia świadczenia wychowawczego przy
opiece naprzemiennej. Przepisy mogły się zmienić po dacie, z której
pochodzi wiedza asystenta.

Blog stoi wyłącznie na rozwod.waw.pl. Pozostałe dziesięć domen
przekierowuje na główną, żeby nie tworzyć dziesięciu kopii tej samej treści.

Sposób pracy z plikiem: przy każdym tekście jest pole wyboru i miejsce na
uwagi. Wystarczy dopisać uwagę pod akapitem, którego dotyczy.

---

## Spis

${WPISY.map((w, i) => `${i + 1}. **${w.tytul}** — ${w.kategoria}, ${slow(w)} słów, \`/blog/${w.slug}\``).join("\n")}

---

`;

for (const [i, w] of WPISY.entries()) {
  md += `## ${i + 1}. ${w.tytul}

- [ ] tekst zaakceptowany bez zmian
- [ ] tekst do poprawy — uwagi niżej

**Adres:** \`/blog/${w.slug}\`
**Kategoria:** ${w.kategoria}
**Opis dla wyszukiwarki:** ${w.opis}
**Zajawka:** ${w.lead}

`;
  for (const s of w.sekcje) {
    md += `### ${s.h}\n\n${s.p.join("\n\n")}\n\n`;
  }
  md += `### Co zapamiętać\n\n${w.zapamietaj.map(t => `- ${t}`).join("\n")}\n\n`;
  md += `**Uwagi kancelarii:**\n\n> \n\n---\n\n`;
}

fs.writeFileSync(new URL("../docs/BLOG-do-weryfikacji.md", import.meta.url), md);
console.log("zapisano docs/BLOG-do-weryfikacji.md ·", (md.length / 1024).toFixed(0), "kB");
