# Lista kontrolna przed przepięciem na żywo

Kolejność ma znaczenie. Punkty 1–3 muszą być zrobione **przed** przepięciem.

## 1. Domena w widgecie Turnstile

Widget `rozwod_formularz` ma dziesięć domen. **Brakuje `rozwodmokotow.pl`.**
Bez niej formularz na tej domenie zwróci odmowę i zgłoszenie przepadnie.

Cloudflare → Turnstile → `rozwod_formularz` → Settings → Hostname Management
→ dodaj `rozwodmokotow.pl` → Save.

## 2. Klucz tajny Turnstile — ZROBIONE

Powiązanie `TURNSTILE_SECRET` jest w Workerze, w magazynie sekretów
`15030d8ca051490e96bd866168384aa9`, obok `RESEND_API_KEY`.

Dwie rzeczy z tym związane są już w kodzie i nie wymagają działania:

- Powiązanie z magazynem zwraca **obiekt**, nie napis. Worker rozpakowuje
  go metodą `.get()`. Bez tego do Cloudflare poleciałby napis
  `[object Object]` i każde zgłoszenie dostawałoby odmowę.
- Wpis jest zadeklarowany w `wrangler.toml`. Wrangler wysyła przy wgrywaniu
  wersji dokładnie te powiązania, które widzi w tym pliku, więc brak wpisu
  zdjąłby sekret przy następnym wdrożeniu.

## 3. Zgoda pani adwokat na treści

Trzy pliki, wszystkie pisane przez asystenta i **niezweryfikowane prawnie**:

- `FAQ-do-weryfikacji.md` — 200 odpowiedzi
- `BLOG-do-weryfikacji.md` — 8 artykułów
- `STRONY-KAMPANII-do-weryfikacji.md` — 4 strony docelowe z kwotami opłat

Do tego nowy rozdział o plikach cookie w polityce prywatności i w informacji
RODO. Opisuje Google Analytics i Google Ads oraz tryb zgody. Tekst też
wymaga akceptacji.

## 4. Przepięcie

Cloudflare → Workers → `kancelaria-worker` → Deployments → wybierz najnowszą
wersję z gałęzi `claude/ecstatic-lamport-8rp74q` → Deploy. Stara wersja
zostaje na liście, więc powrót to ta sama operacja.

Kolejność domen: najpierw `rozwodbemowo.pl`, bo nie ma tam kampanii. Dzień
obserwacji. Potem pozostałe dziewięć. `rozwodtarchomin.pl` na końcu, bo
jako jedyny ma żywą kampanię.

## 5. Sprawdzenie po przepięciu

| Co | Gdzie |
| --- | --- |
| Baner zgody pokazuje się przy pierwszej wizycie | okno prywatne przeglądarki |
| Po kliknięciu „Zgadzam się” w GA4 pojawia się ruch | GA4 → Raporty → Na żywo |
| Formularz zapisuje lead | Supabase, tabela `kancelaria_leads` |
| Powiadomienie o leadzie przychodzi | skrzynka kancelarii |
| Konwersja trafia do Ads | Ads → Cele → Konwersje → kolumna z ostatnim zdarzeniem |
| Turnstile odrzuca boty | Cloudflare → Turnstile → statystyki widgetu |

Konwersja w Google Ads potrafi pojawić się z kilkugodzinnym opóźnieniem.

## 6. Do zrobienia zaraz po

- **Etykieta konwersji kliknięcia w numer.** Pole `adsCallLabel` w
  `src/worker.js` jest puste, więc telefony liczy tylko GA4. Utworzenie:
  Ads → Cele → Konwersje → Nowa akcja → Witryna → zdarzenie własne.
- **Rotacja klucza Supabase.** Klucz anon leży jawnie w publicznym
  repozytorium. Po rotacji ustaw `SUPABASE_ANON` jako sekret Workera.
- **Zdjęcie wnętrza.** Pas nad stopką to grafika wygenerowana, nie
  fotografia biura. Do decyzji: zostawić, podpisać jako wizualizację
  albo zastąpić zdjęciem prawdziwego biura.
