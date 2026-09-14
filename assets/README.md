# Pliki źródłowe grafiki

Tu wrzucasz oryginały. Ja je stąd biorę, przerabiam na WebP i osadzam
w kodzie workera, żeby strona nie wysyłała zapytań do obcych serwerów.

**Ten katalog nie jest serwowany.** Adresy typu `/assets/adwokat.webp`
obsługuje `src/photo.js`, który trzyma obrazy zakodowane w treści workera.

## Czego potrzebuję i pod jaką nazwą

| Plik | Co to jest | Format |
| --- | --- | --- |
| `logo.svg` | Znak kancelarii, najlepiej wektor | SVG, w ostateczności PNG z przezroczystym tłem, min. 1000 px szerokości |
| `adwokat.jpg` | Portret pani adwokat | JPG lub PNG, min. 1200 px krótszego boku |
| `dol-strony.jpg` | Zdjęcie na dole strony, jeśli ma być inne niż portret | JPG lub PNG, min. 1600 px szerokości |

Nazwy mogą być inne — napisz tylko, co jest czym. Ważne, żeby pliki
w ogóle tu trafiły, bo wklejony do czatu obrazek nie zapisuje się
na dysku i nie da się go osadzić.

## Jak wrzucić przez stronę GitHuba

1. Wejdź na `https://github.com/aurabroker/kancelaria-worker`.
2. Przełącz gałąź na `claude/ecstatic-lamport-8rp74q` — to ta, na której
   pracujemy. Gałąź wybiera się przyciskiem po lewej, nad listą plików.
3. Wejdź do katalogu `assets`.
4. **Add file → Upload files**, przeciągnij pliki.
5. Na dole zaznacz **Commit directly to the claude/ecstatic-lamport-8rp74q
   branch** i kliknij **Commit changes**.

Jeśli wrzucisz na `main`, też dam radę — będzie tylko o jeden krok więcej.

## Co się dzieje dalej

Logo: podmieniam ścieżkę w `src/icons.js` na kształt z pliku. Przy SVG
wychodzi jeden do jednego. Przy PNG osadzam obraz albo go wektoryzuję,
a wtedy jakość zależy od rozdzielczości źródła.

Zdjęcia: przeliczam na WebP w dwóch rozmiarach, koduję w `src/photo.js`
i podpinam pod adresy `/assets/...`. Tak samo jak obecny portret, który
waży 23 kB przy szerokości 560 px.

## Czego tu nie wrzucać

Skanów dokumentów, pism procesowych, czegokolwiek z danymi klientów.
Repozytorium jest publiczne.
