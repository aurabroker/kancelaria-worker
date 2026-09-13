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

**Stan pomiaru.** Konto `AW-18123853335` jest wpisane w `src/worker.js`
w stałej `TRACKING` i ładuje się na wszystkich jedenastu domenach, na czterech
stronach kampanii i na blogu. Do 13 września 2026 tag miała tylko jedna domena,
więc dziesięć pozostałych nie mierzyło niczego.

Formularz raportuje konwersję pod akcją `Kontakt`, tą samą, której używa żywa
kampania na `rozwodtarchomin.pl`. Dzięki temu leady z całej sieci trafiają do
jednej akcji konwersji, zamiast ginąć. Jeżeli kancelaria chce mierzyć domeny
osobno, wystarczy założyć osobne akcje konwersji i wpisać ich etykiety w
`src/domains.js` przy konkretnych domenach — wpis domeny ma pierwszeństwo
przed ustawieniem sieciowym.

**Czego wciąż brakuje: etykiety kliknięcia w numer.** Pole `adsCallLabel` jest
puste, bo w koncie nie ma jeszcze takiej akcji konwersji. Kliknięcia w numer
lecą do GA4 jako zdarzenie `contact`, ale Google Ads ich nie policzy.
Utworzenie: Cele → Konwersje → Nowa akcja → Witryna → zdarzenie własne;
potem skopiuj etykietę w postaci `AW-18123853335/xxxxxxxxxxxxxxxxxx`.

Tag żywej kampanii w `src/domains.js` **nie wolno usuwać** bez zgody
właściciela konta — pilnują tego dwa testy.

## Czego jeszcze brakuje do pełnej skuteczności

1. **Widełki cenowe.** Strony mówią „wycena po bezpłatnej konsultacji”, bo
   asystent nie zna cennika. Konkretna liczba konwertuje lepiej. Podaj widełki
   dla każdej z czterech usług, a wstawimy je w sekcję kosztów.
2. **Opinie klientów.** Nie wymyślamy cytatów. Jeżeli kancelaria ma opinie
   w wizytówce Google, podlinkujemy je i pokażemy ocenę.
3. **Weryfikacja prawna treści.** Patrz `STRONY-KAMPANII-do-weryfikacji.md`.

---

# Skrypt porządkujący kampanie

Plik: `ads/porzadkowanie-kampanii.js`. Wklej go w Google Ads:
**Narzędzia → Operacje zbiorcze → Skrypty → +**, autoryzuj, zapisz.

## Pierwsze uruchomienie

1. Nie zmieniaj nic w ustawieniach. `trybProbny` jest ustawiony na `true`.
2. Kliknij **Podgląd**. To sprawdza, czy nazwy metod zgadzają się z Twoją
   wersją API — czego lokalna próba sprawdzić nie może.
3. Przeczytaj log. Zobaczysz, co skrypt *by* zrobił.
4. Popraw listy w sekcji `USTAWIENIA`, zwłaszcza `wykluczenia`.
5. Dopiero teraz ustaw `trybProbny: false` i uruchom.

Trzy najbardziej inwazyjne działania są domyślnie wyłączone:
wstrzymywanie słów, harmonogram wyświetlania i sufiks UTM. Włączaj je
pojedynczo, każde po osobnym przebiegu w trybie próbnym.

## Co skrypt robi

| Sekcja | Działanie | Domyślnie |
| --- | --- | --- |
| 1 | Raport zdrowia pomiaru konwersji | włączone |
| 2 | Podział zapytań na intencje: cena, usługa, informacja | włączone |
| 3 | Dopisanie wykluczeń bezspornie niesprzedażowych | włączone |
| 4 | Raport: zapytanie w grupie reklam o innym temacie | włączone |
| 5 | Wstrzymanie słów bez konwersji powyżej progu kosztu | **wyłączone** |
| 6 | Harmonogram wyświetlania pod godziny pracy | **wyłączone** |
| 7 | Sufiks adresu z parametrami UTM | **wyłączone** |

Skrypt **nie dotyka adresów docelowych reklam** — te zmieniamy osobno,
po wdrożeniu podstron. Nie usuwa słów kluczowych, nie podnosi budżetów
i nie rusza ustawień konwersji.

## Czego skrypt nie naprawi

Sekcja 5 opiera się na konwersjach. Dopóki konto ich nie mierzy, każde
słowo wygląda na nierentowne i skrypt wstrzymałby cały ruch. Dlatego to
działanie jest wyłączone i takie ma zostać, dopóki w `src/worker.js` nie
pojawi się identyfikator `AW-` z etykietami.

## Harmonogram — ważne zastrzeżenie

Kampania bez harmonogramu wyświetla się całą dobę. Po dodaniu choćby
jednej pozycji wyświetla się **wyłącznie** w podanych oknach. Dlatego
tabela w skrypcie pokrywa pełną dobę i siedem dni, a nie tylko godziny
pracy: telefon odbieramy 9:00–17:00, ale formularz działa non stop,
więc noc dostaje niższą stawkę zamiast wyłączenia.

Skrypt pomija kampanie, które już mają własny harmonogram.

## Próba lokalna

`node ads/proba-lokalna.js` uruchamia skrypt na wymyślonych danych, poza
Google Ads. Sprawdza, czy kod się wykonuje i czy liczby się zgadzają —
nie sprawdza, czy nazwy metod Google Ads są aktualne. Od tego jest
przycisk **Podgląd** w edytorze skryptów.
