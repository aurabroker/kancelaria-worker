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

- `TRACKING.adsId`, `adsLeadLabel`, `adsCallLabel` w `src/worker.js` — identyfikator
  Google Ads i etykiety konwersji dla formularza oraz kliknięcia w telefon
- (zrobione) portret adwokatki — `src/photo.js`
- weryfikacja przez adwokata: właściwość sądów w `src/domains.js` oraz każda
  kwota, termin i podstawa prawna w `src/faq.js`

## Testy

```
node test/render.mjs
```
