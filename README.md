# kancelaria-worker

Cloudflare Worker generujący jedenaście serwisów kancelarii adwokackiej
Magdaleny Idzik-Cieśli. Jeden kod, jedenaście domen, każda z własną treścią.

## Pliki

- `src/worker.js` — routing, generatory stron, robots/sitemap/llms
- `src/domains.js` — konfiguracja 11 domen: tytuł, opis, nagłówek, sąd właściwy
- `src/faq.js` — 200 pytań i odpowiedzi, rozłączne pule domenowe, rotacja tygodniowa
- `src/mail.js` — powiadomienia o leadach przez Resend

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
