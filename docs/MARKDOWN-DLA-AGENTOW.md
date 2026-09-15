# Markdown dla agentów

Asystent proszący o `Accept: text/markdown` dostaje czystą treść zamiast
HTML-a z nagłówkiem, banerem zgody, formularzem i stopką. Przeglądarka
dostaje HTML dokładnie jak dotąd.

**Jest wyłączone.** Kod jest wdrożony i przetestowany, ale nie działa,
dopóki nie włączysz przełącznika.

## Jak włączyć

Cloudflare → Workers i Pages → `kancelaria-worker` → Settings → Variables
and Secrets → Add variable:

```
MARKDOWN_DLA_AGENTOW = tak
```

Działa od razu, bez wdrożenia. Wartość `nie` wyłącza z powrotem. Usunięcie
zmiennej też wyłącza, bo stan domyślny w `src/markdown.js` to `false`.

## Czego dotyczy

| Adres | Co zawiera wariant markdown |
| --- | --- |
| `/` | zakres spraw, przebieg obu ścieżek, tabela kosztów, trzy scenariusze mieszkaniowe, osiem pytań, kontakt |
| `/pytania` | cała pula pytań domeny, pogrupowana po kategoriach |
| `/blog` | lista wpisów z zajawkami |
| `/blog/<wpis>` | pełny tekst z sekcjami i podsumowaniem |
| `/alimenty`, `/podzial-majatku`, `/separacja`, `/opieka-nad-dzieckiem` | koszty, przebieg, pytania, powiązane strony |

Wagi na stronie głównej: 49 kB HTML wobec 8 kB markdown. Na stronie
alimentów 25 kB wobec 7 kB.

## Dlaczego nie funkcja Cloudflare

Cloudflare oferuje konwersję HTML na markdown na brzegu sieci, w planie
Pro lub Business. Konwerter dostaje gotowy HTML i musi zgadywać, co jest
treścią. Nasz Worker składa markdown wprost z danych źródłowych: pytań
w `faq.js`, wpisów w `blog.js`, stron kampanii w `kampanie.js`. Wychodzi
czyściej, działa na wszystkich jedenastu domenach i nic nie kosztuje.

## Jedna rzecz, której nie wolno zepsuć

Strony z wariantem markdown odpowiadają nagłówkiem `Vary: Accept`. Bez
niego pamięć podręczna Cloudflare podałaby markdown przeglądarce albo
HTML agentowi, zależnie od tego, kto trafił pierwszy. Test tego pilnuje
dla każdego adresu, w obu wariantach odpowiedzi.

## Zastrzeżenie

Ułatwiamy maszynom czytanie treści, którą napisał asystent. Jeżeli
w dwustu odpowiedziach albo ośmiu artykułach siedzi błąd, markdown
sprawi, że rozejdzie się szybciej i w formie łatwiejszej do zacytowania.
