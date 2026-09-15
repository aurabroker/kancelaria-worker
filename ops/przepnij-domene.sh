#!/usr/bin/env bash
# =============================================================================
# PRZEPIĘCIE DOMENY DZIELNICOWEJ Z CLOUDFLARE PAGES NA WORKERA
# -----------------------------------------------------------------------------
# Dziesięć domen dzielnicowych stoi na projektach Cloudflare Pages i serwuje
# starą wersję strony. Ten skrypt oddaje domenę z Pages i podpina ją do
# Workera `kancelaria-worker`, który obsługuje już rozwod.waw.pl.
#
# REKORDÓW DNS NIE KASUJEMY RĘCZNIE. Wpis należy do projektu Pages i zostanie
# odtworzony albo zablokuje podpięcie. Skrypt najpierw oddaje domenę z Pages,
# a dopiero potem sprząta ewentualne pozostałości.
#
# TRYB PRÓBNY JEST DOMYŚLNY. Bez zmiennej WYKONAJ=1 skrypt niczego nie zmienia,
# tylko wypisuje, co by zrobił.
#
# UŻYCIE
#   export CF_API_TOKEN=...            # uprawnienia niżej
#   export CF_ACCOUNT_ID=1f52c869d091ebf55a2d1789dad4842d
#
#   ./przepnij-domene.sh --stan                     # raport, nic nie zmienia
#   ./przepnij-domene.sh rozwodbemowo.pl            # próba, nic nie zmienia
#   WYKONAJ=1 ./przepnij-domene.sh rozwodbemowo.pl  # wykonanie
#
# UPRAWNIENIA TOKENU
#   Konto: Cloudflare Pages — Edytowanie
#   Konto: Workers Scripts — Edytowanie
#   Strefa: DNS — Edytowanie
#   Strefa: Zone — Odczyt
#
# KOLEJNOŚĆ DOMEN
#   Najpierw rozwodbemowo.pl, bo nie ma tam kampanii reklamowej.
#   rozwodtarchomin.pl na końcu, bo jako jedyny ma żywy budżet.
#
# DROGA ODWROTU
#   Nie kasuj projektów Pages. Powrót to usunięcie domeny z Workera
#   i ponowne dodanie jej do projektu Pages.
# =============================================================================

set -uo pipefail

WORKER="${WORKER:-kancelaria-worker}"
API="https://api.cloudflare.com/client/v4"
WYKONAJ="${WYKONAJ:-0}"
DOMENY_SIECI=(rozwodbemowo.pl rozwodbielany.pl rozwodjablonna.pl rozwodlegionowo.pl
              rozwodlomianki.pl rozwodmokotow.pl rozwodochota.pl rozwodtarchomin.pl
              rozwodwola.pl rozwodzoliborz.pl)

: "${CF_API_TOKEN:?Ustaw CF_API_TOKEN}"
: "${CF_ACCOUNT_ID:?Ustaw CF_ACCOUNT_ID}"

# --- narzędzia -------------------------------------------------------------

cf() {  # cf METODA ŚCIEŻKA [CIAŁO]
  local metoda="$1" sciezka="$2" cialo="${3:-}"
  if [ -n "$cialo" ]; then
    curl -sS -X "$metoda" "$API$sciezka" \
      -H "Authorization: Bearer $CF_API_TOKEN" \
      -H "Content-Type: application/json" --data "$cialo"
  else
    curl -sS -X "$metoda" "$API$sciezka" -H "Authorization: Bearer $CF_API_TOKEN"
  fi
}

# Wyciąga wartość z odpowiedzi. Zero zależności poza pythonem.
pyt() { python3 -c "$1" 2>/dev/null; }

sprawdz_odpowiedz() {  # sprawdz_odpowiedz JSON OPIS
  echo "$1" | python3 -c '
import json,sys
d=json.load(sys.stdin)
if d.get("success"): sys.exit(0)
print("  BŁĄD:", "; ".join(e.get("message","?") for e in d.get("errors",[])), file=sys.stderr)
sys.exit(1)' || { echo "  przerywam: $2" >&2; return 1; }
}

krok() { printf "\n\033[1m%s\033[0m\n" "$*"; }
info() { printf "  %s\n" "$*"; }
zrobie() { printf "  [próba] %s\n" "$*"; }

id_strefy() {  # id_strefy DOMENA
  cf GET "/zones?name=$1" | pyt 'import json,sys
d=json.load(sys.stdin); r=d.get("result") or []
print(r[0]["id"] if r else "")'
}

projekt_pages() {  # projekt_pages DOMENA -> nazwa projektu albo pusto
  cf GET "/accounts/$CF_ACCOUNT_ID/pages/projects?per_page=100" | pyt "import json,sys
d=json.load(sys.stdin)
for p in d.get('result') or []:
    if '$1' in (p.get('domains') or []): print(p['name']); break"
}

# --- raport stanu ----------------------------------------------------------

if [ "${1:-}" = "--stan" ]; then
  krok "Stan domen sieci"
  printf "  %-24s %-22s %s\n" "domena" "projekt Pages" "domena Workera"
  wlasne=$(cf GET "/accounts/$CF_ACCOUNT_ID/workers/domains?per_page=100" | pyt "import json,sys
d=json.load(sys.stdin)
print(' '.join(x['hostname'] for x in (d.get('result') or []) if x.get('service')=='$WORKER'))")
  for d in "${DOMENY_SIECI[@]}" rozwod.waw.pl; do
    proj=$(projekt_pages "$d"); [ -z "$proj" ] && proj="brak"
    case " $wlasne " in *" $d "*) w="TAK";; *) w="nie";; esac
    printf "  %-24s %-22s %s\n" "$d" "$proj" "$w"
  done
  echo
  info "Domena z projektem Pages i bez domeny Workera serwuje starą wersję."
  exit 0
fi

DOMENA="${1:-}"
[ -z "$DOMENA" ] && { echo "Podaj domenę albo --stan. Przykład: $0 rozwodbemowo.pl"; exit 1; }

case " ${DOMENY_SIECI[*]} " in
  *" $DOMENA "*) ;;
  *) echo "»$DOMENA« nie jest domeną tej sieci. Przerywam."; exit 1;;
esac

[ "$WYKONAJ" = "1" ] || echo "TRYB PRÓBNY. Nic nie zostanie zmienione. Uruchom z WYKONAJ=1, żeby wykonać."

# --- 1. rozpoznanie --------------------------------------------------------

krok "1/5  Rozpoznanie: $DOMENA"
ZONE=$(id_strefy "$DOMENA")
[ -z "$ZONE" ] && { echo "  Nie znalazłem strefy dla $DOMENA. Przerywam."; exit 1; }
info "strefa: $ZONE"

PROJEKT=$(projekt_pages "$DOMENA")
if [ -n "$PROJEKT" ]; then info "projekt Pages: $PROJEKT"; else info "projekt Pages: brak"; fi

# --- 2. oddanie domeny z Pages --------------------------------------------

krok "2/5  Oddanie domeny z Pages"
if [ -z "$PROJEKT" ]; then
  info "nic do zrobienia"
else
  for host in "$DOMENA" "www.$DOMENA"; do
    ma=$(cf GET "/accounts/$CF_ACCOUNT_ID/pages/projects/$PROJEKT" | pyt "import json,sys
d=json.load(sys.stdin)
print('tak' if '$host' in ((d.get('result') or {}).get('domains') or []) else '')")
    [ -z "$ma" ] && continue
    if [ "$WYKONAJ" = "1" ]; then
      odp=$(cf DELETE "/accounts/$CF_ACCOUNT_ID/pages/projects/$PROJEKT/domains/$host")
      sprawdz_odpowiedz "$odp" "usuwanie $host z Pages" || exit 1
      info "usunięto $host z projektu $PROJEKT"
    else
      zrobie "usunąłbym $host z projektu Pages $PROJEKT"
    fi
  done
fi

# --- 3. pozostałości w DNS -------------------------------------------------
# Tylko A, AAAA i CNAME dla domeny głównej i www. MX oraz TXT zostają:
# to poczta i weryfikacje, ich skasowanie zerwałoby korespondencję.

krok "3/5  Pozostałości w DNS"
for host in "$DOMENA" "www.$DOMENA"; do
  for typ in A AAAA CNAME; do
    rekordy=$(cf GET "/zones/$ZONE/dns_records?name=$host&type=$typ" | pyt "import json,sys
d=json.load(sys.stdin)
for r in d.get('result') or []: print(r['id'], r['type'], r['name'], r['content'])")
    [ -z "$rekordy" ] && continue
    while read -r rid rtyp rnazwa rtresc; do
      [ -z "$rid" ] && continue
      if [ "$WYKONAJ" = "1" ]; then
        odp=$(cf DELETE "/zones/$ZONE/dns_records/$rid")
        sprawdz_odpowiedz "$odp" "usuwanie rekordu $rtyp $rnazwa" || exit 1
        info "usunięto $rtyp $rnazwa -> $rtresc"
      else
        zrobie "usunąłbym $rtyp $rnazwa -> $rtresc"
      fi
    done <<< "$rekordy"
  done
done

# --- 4. podpięcie do Workera ----------------------------------------------

krok "4/5  Podpięcie do Workera $WORKER"
for host in "$DOMENA" "www.$DOMENA"; do
  cialo="{\"environment\":\"production\",\"hostname\":\"$host\",\"service\":\"$WORKER\",\"zone_id\":\"$ZONE\"}"
  if [ "$WYKONAJ" = "1" ]; then
    odp=$(cf PUT "/accounts/$CF_ACCOUNT_ID/workers/domains" "$cialo")
    if sprawdz_odpowiedz "$odp" "podpinanie $host"; then
      info "podpięto $host"
    else
      [ "$host" = "$DOMENA" ] && exit 1
      info "wariant www pominięty — jeśli nie jest potrzebny, to w porządku"
    fi
  else
    zrobie "podpiąłbym $host do $WORKER"
  fi
done

# --- 5. sprawdzenie --------------------------------------------------------

krok "5/5  Sprawdzenie"
if [ "$WYKONAJ" = "1" ]; then
  info "czekam 20 s na certyfikat i propagację"
  sleep 20
  kod=$(curl -sS -o /tmp/przepniecie.html -w "%{http_code}" --max-time 20 "https://$DOMENA/" || echo 000)
  info "kod odpowiedzi: $kod"
  if grep -q "/assets/logo.webp" /tmp/przepniecie.html 2>/dev/null; then
    info "NOWA WERSJA działa: znalazłem logo z nowego układu"
  else
    info "UWAGA: nie widzę znacznika nowej wersji."
    info "Certyfikat bywa wystawiany kilka minut. Sprawdź ponownie za chwilę:"
    info "  curl -s https://$DOMENA/ | grep -c /assets/logo.webp"
  fi
else
  zrobie "sprawdziłbym https://$DOMENA/ pod kątem znacznika nowej wersji"
fi

krok "Gotowe"
cat <<UWAGI
  Do zrobienia ręcznie po tym kroku:
   · otwórz https://$DOMENA/ i sprawdź układ, baner zgody i widget pod formularzem
   · wyślij jedno zgłoszenie testowe
   · sprawdź w Supabase, czy w tabeli kancelaria_leads pojawił się wiersz
     z wartością "$DOMENA" w polu zrodlo_domena

  Powrót, gdyby coś poszło nie tak:
   1. usuń domenę z Workera: Workers → $WORKER → Domains
   2. dodaj ją z powrotem do projektu Pages${PROJEKT:+ $PROJEKT}
  Projektów Pages nie kasuj przez najbliższy tydzień.
UWAGI
