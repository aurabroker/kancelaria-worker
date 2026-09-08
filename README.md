# kancelaria-worker

Cloudflare Worker generujący jedenaście serwisów kancelarii adwokackiej
Magdaleny Idzik-Cieśli. Jeden kod, jedenaście domen, każda z własną treścią.

## Pliki

- `src/worker.js` — routing, generatory stron, robots/sitemap/llms
- `src/domains.js` — konfiguracja 11 domen: tytuł, opis, nagłówek, sąd właściwy
- `src/faq.js` — 200 pytań i odpowiedzi, rozłączne pule domenowe, rotacja tygodniowa
- `src/mail.js` — powiadomienia o leadach przez Resend

## System wizualny

Pochodzi z kanwy marki (Claude Design, wrzesień 2026) i jest zaimplementowany
w trzech miejscach:

- `src/worker.js` — tokeny palety w `:root` oraz typografia
- `src/domains.js` — akcent granatowy per domena
- `src/icons.js` — 24 ikony z kanwy, jedna siatka 24×24, kreska 1.5

Sześć wartości wspólnych dla całej sieci: atrament `#12203C`, papier `#FAF7F2`,
kreda `#F1ECE4`, glina `#A85A3C`, zgoda `#3D6B54`, spór `#96342C`.
Kroje: Newsreader w nagłówkach, IBM Plex Sans w tekście.

Zasada z kanwy, której trzymamy się w kodzie: **glina jest jedynym kolorem
akcji** — przycisk konsultacji, wysyłka formularza, telefon. Akcent dzielnicy
dotyka wyłącznie ikon, paska nad nagłówkiem i podkreślenia aktywnego wiersza.
Podłoże, typografia i przyciski zostają wspólne, dlatego jedenaście stron
czyta się jak jedna kancelaria.

## Zakres domen — decyzja z 8 września 2026

Sieć obejmuje **jedenaście domen, które są zarejestrowane i podpięte pod
Cloudflare**. Ich lista jest w `src/domains.js` i pokrywa się ze strefami
w koncie.

Kanwa marki z Claude Design wymienia inny zestaw jedenastu dzielnic.
Sześć z nich **nie ma zarejestrowanej domeny**: Śródmieście, Ursynów,
Praga-Południe, Białołęka, Targówek, Wilanów. Tych stron na razie
nie budujemy. Wrócimy do nich pojedynczo, gdy domeny zostaną kupione
i podpięte.

Nie wygaszamy żadnej z działających domen po to, żeby lista zgadzała się
z projektem graficznym. Dotyczy to zwłaszcza:

- `rozwodtarchomin.pl` — jedyna domena z żywym tagiem konwersji Google Ads;
  jej wyłączenie urwałoby pomiar działającej kampanii,
- `rozwod.waw.pl` — flagowa domena ogólnomiejska, na nią leci ruch płatny,
- `rozwodochota.pl`, `rozwodlegionowo.pl`, `rozwodlomianki.pl`,
  `rozwodjablonna.pl` — obszary spoza listy dzielnic, ale z własną treścią
  i własną pulą pytań.

Kanwa wnosi system wizualny: paletę, typografię, ikony i układy. Nie
rozstrzyga o zasięgu sieci.

## Sekrety

Klucza API nie trzymamy w repozytorium:

```
wrangler secret put RESEND_API_KEY
```

Domena nadawcza `rozwod.waw.pl` jest zweryfikowana w Resend. Bez klucza
formularz nadal działa — lead zapisuje się w bazie, wysyłka jest pomijana.

## Do uzupełnienia przed publikacją

Jedno pole i dwie weryfikacje:

1. `TRACKING` w `src/worker.js` — identyfikator Google Ads (`AW-...`) oraz etykiety
   konwersji dla formularza i kliknięcia w telefon. Do czasu uzupełnienia GA4
   działa normalnie, a tag Ads po prostu się nie renderuje.
2. Weryfikacja przez adwokata: właściwość sądów okręgowych w `src/domains.js`
   oraz każda kwota, termin i podstawa prawna w `src/faq.js`.

## Rotacja klucza Supabase

Klucz `anon` jest nadal literałem w kodzie, bo pochodzi z publicznego repozytorium.
Worker czyta najpierw sekret `SUPABASE_ANON`, a literał jest tylko awaryjny.
Po rotacji ustaw sekret i usuń literał z `src/worker.js`.

```
wrangler secret put SUPABASE_ANON --name kancelaria-worker
```

## Testy

```
node test/render.mjs
```
