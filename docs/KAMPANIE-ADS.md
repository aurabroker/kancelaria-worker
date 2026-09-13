# Google Ads — gdzie kierować którą grupę reklam

Audyt kampanii: cały ruch szedł na stronę główną, więc reklama o alimentach
lądowała na stronie o rozwodzie. Brak trafności, zero potwierdzonych konwersji
mimo ruchu. Od teraz każda grupa reklam ma własny adres docelowy.

## Mapa grup reklam

| Grupa reklam | Adres docelowy (Final URL) | Główna fraza |
| --- | --- | --- |
| Rozwód | `https://rozwod.waw.pl/` | adwokat rozwodowy Warszawa |
| Alimenty | `https://rozwod.waw.pl/alimenty` | adwokat alimenty Warszawa |
| Podział majątku | `https://rozwod.waw.pl/podzial-majatku` | podział majątku adwokat Warszawa |
| Separacja | `https://rozwod.waw.pl/separacja` | separacja adwokat Warszawa |
| Opieka nad dzieckiem | `https://rozwod.waw.pl/opieka-nad-dzieckiem` | adwokat kontakty z dzieckiem |

Strony działają na wszystkich jedenastu domenach pod tymi samymi adresami.
Jeżeli kampania idzie z domeny dzielnicowej, użyj jej własnego adresu, na
przykład `https://rozwodtarchomin.pl/alimenty`. Nie ma przekierowania między
domenami, bo takie przekierowanie wywraca zatwierdzenie reklamy. Duplikaty
rozwiązuje adres kanoniczny, który zawsze wskazuje `rozwod.waw.pl`.

## Sufiks końcowego adresu URL

W ustawieniach kampanii, pole „Sufiks końcowego adresu URL”:

```
utm_source=google&utm_medium=cpc&utm_campaign={campaignid}&utm_content={adgroupid}&utm_term={keyword}
```

Automatyczne tagowanie (gclid) zostaw włączone. Sufiks nie psuje gclid, a daje
w Supabase i w powiadomieniu mailowym czytelne źródło leada.

## Konwersje

Obie akcje na każdej ze stron wysyłają zdarzenie:

| Akcja | Zdarzenie GA4 | Etykieta Google Ads |
| --- | --- | --- |
| Wysłanie formularza | `generate_lead` | `adsLeadLabel` w `src/worker.js` |
| Kliknięcie w numer telefonu | `contact` (method: telefon) | `adsCallLabel` w `src/worker.js` |

**Do uzupełnienia.** W `src/worker.js`, w stałej `TRACKING`, pola `adsId`,
`adsLeadLabel` i `adsCallLabel` są puste. Bez nich konwersje idą tylko do GA4,
a Google Ads ich nie zobaczy i optymalizacja stawek nie ruszy. Identyfikator
konta ma postać `AW-XXXXXXXXX`, a etykieta `AW-XXXXXXXXX/xxxxxxxxxxxxxxxxxx`.
Znajdziesz je w Google Ads: Cele → Konwersje → wybierz akcję → Konfiguracja
tagu → Zainstaluj samodzielnie.

Kampania na `rozwodtarchomin.pl` ma własny, działający tag `AW-18123853335`
z etykietą konwersji. Jest wpisany w `src/domains.js` i **nie wolno go usuwać**
bez zgody właściciela konta — pilnuje tego osobny test.

## Czego jeszcze brakuje do pełnej skuteczności

1. **Widełki cenowe.** Strony mówią „wycena po bezpłatnej konsultacji”, bo
   asystent nie zna cennika. Konkretna liczba konwertuje lepiej. Podaj widełki
   dla każdej z czterech usług, a wstawimy je w sekcję kosztów.
2. **Opinie klientów.** Nie wymyślamy cytatów. Jeżeli kancelaria ma opinie
   w wizytówce Google, podlinkujemy je i pokażemy ocenę.
3. **Weryfikacja prawna treści.** Patrz `STRONY-KAMPANII-do-weryfikacji.md`.
