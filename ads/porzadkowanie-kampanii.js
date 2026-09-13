/**
 * PORZĄDKOWANIE KAMPANII — Kancelaria Adwokacka Magdalena Idzik-Cieśla
 * =====================================================================
 * Skrypt do Google Ads: Narzędzia → Operacje zbiorcze → Skrypty.
 *
 * Powstał po audycie, który wykazał trzy rzeczy: cały ruch szedł na jedną
 * stronę, zapytania dotyczą głównie ceny, a konto nie ma potwierdzonych
 * konwersji mimo ruchu. Skrypt nie rusza adresów docelowych — te zmieniamy
 * osobno, ręcznie, po wdrożeniu podstron.
 *
 * CO ROBI
 *   1. Sprawdza zdrowie pomiaru konwersji i krzyczy, gdy go nie ma.
 *   2. Dzieli zapytania na intencje: cena, usługa, informacja, śmieci.
 *   3. Dopisuje wykluczenia dla zapytań bezspornie niesprzedażowych.
 *   4. Pokazuje, które zapytania należą do innej grupy reklam niż ta,
 *      w której się wyświetliły — to materiał pod nowe grupy.
 *   5. Wstrzymuje słowa, które przepaliły budżet bez jednej konwersji.
 *   6. Ustawia harmonogram wyświetlania pod godziny pracy 9:00–17:00.
 *   7. Ustawia sufiks adresu z parametrami UTM.
 *
 * BEZPIECZEŃSTWO
 *   TRYB PRÓBNY jest domyślnie włączony. W tym trybie skrypt niczego nie
 *   zmienia — tylko wypisuje, co by zrobił. Przeczytaj log, popraw listy,
 *   i dopiero wtedy przestaw trybProbny na false.
 *
 *   Każde działanie ma osobny przełącznik. Trzy najbardziej inwazyjne
 *   (wstrzymywanie słów, harmonogram, sufiks UTM) są domyślnie wyłączone.
 *
 *   Skrypt nigdy nie usuwa słów kluczowych, nie podnosi budżetów i nie
 *   dotyka ustawień konwersji ani adresów docelowych reklam.
 */

/* ═══════════════════════════════════════════════════════════════════
   USTAWIENIA — to jedyna część, którą zwykle się zmienia
   ═══════════════════════════════════════════════════════════════════ */

var USTAWIENIA = {

  // false dopiero po przeczytaniu logu z trybu próbnego
  trybProbny: true,

  // ile dni wstecz analizujemy
  okresDni: 30,

  // adres do raportu; pusty ciąg = bez maila
  email: '',

  // analizuj tylko kampanie, których nazwa zawiera ten fragment
  // (pusty ciąg = wszystkie kampanie w koncie)
  filtrKampanii: '',

  dzialania: {
    raportKonwersji:      true,   // zawsze warto
    raportIntencji:       true,   // podział zapytań wg intencji
    wykluczeniaSmieciowe: true,   // dopisuje wykluczenia z listy niżej
    grupowanieTematyczne: true,   // raport: zapytanie w złej grupie reklam
    wstrzymajNierentowne: false,  // pauzuje słowa bez konwersji
    harmonogramGodzin:    false,  // godziny wyświetlania
    sufiksUTM:            false,  // parametry UTM w adresie
  },

  progi: {
    // słowo oceniamy dopiero, gdy ma dość danych
    minKlikniec: 15,
    // i wstrzymujemy, gdy przepaliło tyle bez konwersji (w walucie konta)
    maxKosztBezKonwersji: 300,
    // zapytanie trafia do raportu, gdy miało choć tyle wyświetleń
    minWyswietlen: 3,
  },

  // Wykluczenia dopisywane automatycznie. Lista jest celowo wąska:
  // wchodzą tu wyłącznie zapytania, przy których nie ma wątpliwości,
  // że nie pochodzą od klienta. Wszystko inne idzie do raportu i czeka
  // na decyzję człowieka.
  //
  // UWAGA: nie wykluczamy słów „bezpłatny” ani „darmowy”, bo własna
  // oferta kancelarii to bezpłatne trzydzieści minut i takie zapytanie
  // bywa zapytaniem klienta.
  wykluczenia: [
    'praca', 'oferty pracy', 'zarobki', 'wynagrodzenie adwokata praca',
    'rekrutacja', 'staż', 'praktyki',
    'aplikacja adwokacka', 'egzamin adwokacki', 'studia prawnicze',
    'wzór', 'wzory', 'pdf', 'doc', 'druk do pobrania', 'formularz do pobrania',
    'forum', 'memy', 'cytaty', 'film', 'serial', 'piosenka',
    'komornik', 'kancelaria komornicza',
    'rozwód po angielsku', 'tłumaczenie',
  ],

  // Słowa, po których poznajemy intencję zapytania.
  intencje: {
    cena:        ['ile kosztuje', 'ile bierze', 'cena', 'cennik', 'koszt', 'koszty',
                  'stawka', 'stawki', 'opłata', 'oplata', 'ile zapłacę', 'ile placi'],
    usluga:      ['adwokat', 'prawnik', 'kancelaria', 'pomoc prawna', 'pełnomocnik',
                  'reprezentacja', 'porada'],
    informacja:  ['jak', 'czy', 'kiedy', 'co to', 'ile trwa', 'krok po kroku',
                  'samemu', 'samodzielnie', 'bez adwokata'],
  },

  // Tematy odpowiadające nowym podstronom. Służą do pokazania, ile
  // zapytań wyświetla się w grupie reklam o innym temacie.
  tematy: {
    'alimenty':             ['aliment', 'alimenty na dziecko', 'podwyższenie aliment'],
    'podział majątku':      ['podział majątku', 'podzial majatku', 'rozdzielność',
                             'rozdzielnosc', 'wspólność majątkowa', 'intercyza'],
    'separacja':            ['separacj'],
    'opieka nad dzieckiem': ['kontakty z dzieckiem', 'władza rodzicielska',
                             'wladza rodzicielska', 'opieka nad dzieckiem',
                             'opieka naprzemienna', 'ograniczenie praw'],
    'rozwód':               ['rozwód', 'rozwod', 'rozwieść', 'pozew o rozwód'],
  },

  // Harmonogram wyświetlania. Telefon odbieramy 9:00–17:00 w dni robocze,
  // ale formularz działa całą dobę, więc nocy nie wyłączamy — obniżamy
  // stawkę. Mnożnik 1.0 to brak zmiany, 0.7 to minus trzydzieści procent.
  harmonogram: [
    { dni: ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY'], od: 9,  do: 17, mnoznik: 1.0  },
    { dni: ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY'], od: 17, do: 22, mnoznik: 0.8  },
    { dni: ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY'], od: 22, do: 24, mnoznik: 0.5  },
    { dni: ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY'], od: 0,  do: 9,  mnoznik: 0.5  },
    { dni: ['SATURDAY','SUNDAY'],                                od: 9,  do: 20, mnoznik: 0.7  },
    { dni: ['SATURDAY','SUNDAY'],                                od: 20, do: 24, mnoznik: 0.5  },
    { dni: ['SATURDAY','SUNDAY'],                                od: 0,  do: 9,  mnoznik: 0.5  },
  ],

  sufiksUTM: 'utm_source=google&utm_medium=cpc&utm_campaign={campaignid}' +
             '&utm_content={adgroupid}&utm_term={keyword}',
};

/* ═══════════════════════════════════════════════════════════════════
   GŁÓWNA FUNKCJA
   ═══════════════════════════════════════════════════════════════════ */

function main() {
  var log = [];
  var d = USTAWIENIA.dzialania;
  var okres = zakresDat(USTAWIENIA.okresDni);

  naglowek(log, 'PORZĄDKOWANIE KAMPANII');
  log.push('Konto: ' + AdsApp.currentAccount().getName() +
           ' (' + AdsApp.currentAccount().getCustomerId() + ')');
  log.push('Okres: ' + okres.od + ' — ' + okres.do + ' (' + USTAWIENIA.okresDni + ' dni)');
  log.push('Tryb: ' + (USTAWIENIA.trybProbny
    ? 'PRÓBNY — nic nie zostanie zmienione'
    : 'WYKONANIE — zmiany zostaną zapisane'));
  if (USTAWIENIA.filtrKampanii) log.push('Filtr kampanii: "' + USTAWIENIA.filtrKampanii + '"');

  var zapytania = null;

  try {
    if (d.raportKonwersji)      raportKonwersji(log, okres);
    if (d.raportIntencji || d.wykluczeniaSmieciowe || d.grupowanieTematyczne) {
      zapytania = pobierzZapytania(okres);
      log.push('');
      log.push('Pobrano ' + zapytania.length + ' zapytań z wyszukiwarki.');
    }
    if (d.raportIntencji)       raportIntencji(log, zapytania);
    if (d.wykluczeniaSmieciowe) dopiszWykluczenia(log, zapytania);
    if (d.grupowanieTematyczne) raportTematow(log, zapytania);
    if (d.wstrzymajNierentowne) wstrzymajNierentowne(log, okres);
    if (d.harmonogramGodzin)    ustawHarmonogram(log);
    if (d.sufiksUTM)            ustawSufiks(log);
  } catch (e) {
    log.push('');
    log.push('BŁĄD: ' + e.message);
    log.push(e.stack ? String(e.stack) : '');
  }

  naglowek(log, 'KONIEC');
  if (USTAWIENIA.trybProbny) {
    log.push('To był tryb próbny. Żadna zmiana nie została zapisana.');
    log.push('Po sprawdzeniu logu ustaw USTAWIENIA.trybProbny = false.');
  }

  var tekst = log.join('\n');
  Logger.log(tekst);
  if (USTAWIENIA.email) {
    MailApp.sendEmail(USTAWIENIA.email,
      'Google Ads — porządkowanie kampanii (' + AdsApp.currentAccount().getName() + ')',
      tekst);
  }
}

/* ═══════════════════════════════════════════════════════════════════
   1. ZDROWIE POMIARU KONWERSJI
   Audyt: ruch jest, potwierdzonych konwersji nie ma. Bez tego licytacja
   nie ma się czego uczyć, więc ten raport idzie pierwszy.
   ═══════════════════════════════════════════════════════════════════ */

function raportKonwersji(log, okres) {
  naglowek(log, '1. POMIAR KONWERSJI');

  var wiersz = pierwszy(
    'SELECT metrics.clicks, metrics.cost_micros, metrics.conversions, ' +
    '       metrics.all_conversions, metrics.impressions ' +
    'FROM customer WHERE segments.date BETWEEN "' + okres.od + '" AND "' + okres.do + '"');

  if (!wiersz) { log.push('Brak danych o ruchu w tym okresie.'); return; }

  var m = wiersz.metrics;
  var koszt = Number(m.costMicros || 0) / 1e6;
  var kliki = Number(m.clicks || 0);
  var konw = Number(m.conversions || 0);
  var wszystkie = Number(m.allConversions || 0);

  log.push('Wyświetlenia: ' + m.impressions);
  log.push('Kliknięcia:   ' + kliki);
  log.push('Koszt:        ' + kwota(koszt));
  log.push('Konwersje:    ' + konw.toFixed(1) + ' (wszystkie: ' + wszystkie.toFixed(1) + ')');
  if (kliki > 0) log.push('Koszt kliknięcia: ' + kwota(koszt / kliki));

  if (konw === 0 && kliki > 0) {
    log.push('');
    log.push('>>> UWAGA. ' + kliki + ' kliknięć za ' + kwota(koszt) + ' i zero konwersji.');
    log.push('>>> Sprawdź w pierwszej kolejności, czy pomiar w ogóle działa:');
    log.push('>>> Cele → Konwersje → czy akcja ma status „Aktywna” i ostatnie zdarzenia.');
    log.push('>>> Strona wysyła zdarzenia tylko wtedy, gdy w kodzie serwisu');
    log.push('>>> uzupełniono identyfikator AW- i etykiety konwersji.');
  } else if (konw > 0) {
    log.push('Koszt konwersji: ' + kwota(koszt / konw));
  }

  // Lista akcji konwersji — pokazuje, czy któraś w ogóle zbiera zdarzenia.
  try {
    var akcje = AdsApp.search(
      'SELECT conversion_action.name, conversion_action.status, ' +
      '       conversion_action.type, conversion_action.primary_for_goal ' +
      'FROM conversion_action');
    var ile = 0;
    log.push('');
    log.push('Skonfigurowane akcje konwersji:');
    while (akcje.hasNext()) {
      var a = akcje.next().conversionAction;
      ile++;
      log.push('  · ' + a.name + ' — ' + a.status + ', typ ' + a.type +
               (a.primaryForGoal ? ', główna' : ', pomocnicza'));
    }
    if (ile === 0) log.push('  BRAK. Konto nie ma żadnej akcji konwersji.');
  } catch (e) {
    log.push('  (nie udało się pobrać listy akcji konwersji: ' + e.message + ')');
  }
}

/* ═══════════════════════════════════════════════════════════════════
   POBRANIE ZAPYTAŃ
   ═══════════════════════════════════════════════════════════════════ */

function pobierzZapytania(okres) {
  var gaql =
    'SELECT search_term_view.search_term, campaign.id, campaign.name, ' +
    '       ad_group.id, ad_group.name, metrics.impressions, metrics.clicks, ' +
    '       metrics.cost_micros, metrics.conversions ' +
    'FROM search_term_view ' +
    'WHERE segments.date BETWEEN "' + okres.od + '" AND "' + okres.do + '"';

  var out = [];
  var it = AdsApp.search(gaql);
  while (it.hasNext()) {
    var r = it.next();
    if (USTAWIENIA.filtrKampanii &&
        r.campaign.name.indexOf(USTAWIENIA.filtrKampanii) === -1) continue;
    var m = r.metrics;
    if (Number(m.impressions || 0) < USTAWIENIA.progi.minWyswietlen) continue;
    out.push({
      fraza:     String(r.searchTermView.searchTerm).toLowerCase(),
      kampania:  r.campaign.name,
      grupa:     r.adGroup.name,
      grupaId:   r.adGroup.id,
      wyswietl:  Number(m.impressions || 0),
      kliki:     Number(m.clicks || 0),
      koszt:     Number(m.costMicros || 0) / 1e6,
      konwersje: Number(m.conversions || 0),
    });
  }
  return out;
}

/* ═══════════════════════════════════════════════════════════════════
   2. INTENCJA ZAPYTAŃ
   Audyt: ruch przychodzi głównie z pytań o cenę. Ten raport pokazuje,
   ile go naprawdę jest i ile kosztuje.
   ═══════════════════════════════════════════════════════════════════ */

function raportIntencji(log, zapytania) {
  naglowek(log, '2. INTENCJA ZAPYTAŃ');

  var kubelki = { cena: [], usluga: [], informacja: [], inne: [] };
  for (var i = 0; i < zapytania.length; i++) {
    kubelki[intencjaFrazy(zapytania[i].fraza)].push(zapytania[i]);
  }

  var nazwy = { cena: 'pytania o cenę', usluga: 'szukanie adwokata',
                informacja: 'pytania informacyjne', inne: 'pozostałe' };
  var razemKoszt = suma(zapytania, 'koszt');

  for (var k in kubelki) {
    var g = kubelki[k];
    var koszt = suma(g, 'koszt');
    var udzial = razemKoszt > 0 ? (100 * koszt / razemKoszt) : 0;
    log.push(pad(nazwy[k], 22) + pad(g.length + ' zapytań', 16) +
             pad(kwota(koszt), 14) + udzial.toFixed(0) + '% kosztu, ' +
             suma(g, 'konwersje').toFixed(1) + ' konw.');
  }

  log.push('');
  log.push('Dwadzieścia najdroższych zapytań o cenę:');
  var cenowe = kubelki.cena.sort(function (a, b) { return b.koszt - a.koszt; }).slice(0, 20);
  if (!cenowe.length) log.push('  (brak)');
  for (var j = 0; j < cenowe.length; j++) {
    var z = cenowe[j];
    log.push('  ' + pad(kwota(z.koszt), 12) + pad(z.kliki + ' kl.', 9) +
             pad(z.konwersje.toFixed(1) + ' konw.', 12) + z.fraza);
  }
  log.push('');
  log.push('Te zapytania muszą trafiać na stronę, która odpowiada na pytanie');
  log.push('o cenę w pierwszym ekranie. Adresy docelowe ustawiamy osobno.');
}

function intencjaFrazy(fraza) {
  var i = USTAWIENIA.intencje;
  if (zawiera(fraza, i.cena)) return 'cena';
  if (zawiera(fraza, i.usluga)) return 'usluga';
  if (zawiera(fraza, i.informacja)) return 'informacja';
  return 'inne';
}

/* ═══════════════════════════════════════════════════════════════════
   3. WYKLUCZENIA
   Dopisujemy tylko to, co bezspornie nie pochodzi od klienta. Wszystko
   inne idzie do raportu i czeka na decyzję człowieka.
   ═══════════════════════════════════════════════════════════════════ */

function dopiszWykluczenia(log, zapytania) {
  naglowek(log, '3. WYKLUCZENIA');

  var doDodania = {};   // grupaId -> { fraza: koszt }
  var nazwyGrup = {};
  var lacznyKoszt = 0;

  for (var i = 0; i < zapytania.length; i++) {
    var z = zapytania[i];
    if (z.konwersje > 0) continue;                    // konwertowało — nie ruszamy
    var trafienie = ktoreZawiera(z.fraza, USTAWIENIA.wykluczenia);
    if (!trafienie) continue;
    if (!doDodania[z.grupaId]) { doDodania[z.grupaId] = {}; nazwyGrup[z.grupaId] = z.grupa; }
    doDodania[z.grupaId][trafienie] = (doDodania[z.grupaId][trafienie] || 0) + z.koszt;
    lacznyKoszt += z.koszt;
  }

  var ile = 0;
  for (var g in doDodania) {
    var frazy = doDodania[g];
    var lista = [];
    for (var f in frazy) lista.push(f);
    if (!lista.length) continue;

    log.push('Grupa „' + nazwyGrup[g] + '”: ' + lista.join(', '));
    ile += lista.length;

    if (!USTAWIENIA.trybProbny) {
      var it = AdsApp.adGroups().withIds([Number(g)]).get();
      if (it.hasNext()) {
        var grupa = it.next();
        for (var n = 0; n < lista.length; n++) {
          // dopasowanie do wyrażenia — ostrożniejsze niż przybliżone
          grupa.createNegativeKeyword('"' + lista[n] + '"');
        }
      }
    }
  }

  if (!ile) { log.push('Nic do dodania — żadne zapytanie nie pasuje do listy.'); return; }
  log.push('');
  log.push('Razem ' + ile + ' wykluczeń. Zmarnowany koszt w okresie: ' + kwota(lacznyKoszt) + '.');
  log.push(USTAWIENIA.trybProbny
    ? 'Tryb próbny — wykluczenia NIE zostały dodane.'
    : 'Wykluczenia dodane jako dopasowanie do wyrażenia.');
}

/* ═══════════════════════════════════════════════════════════════════
   4. ZAPYTANIA W NIEWŁAŚCIWEJ GRUPIE
   Materiał pod nowe grupy reklam: alimenty, podział majątku, separacja,
   opieka nad dzieckiem. Sam raport, bez zmian w koncie.
   ═══════════════════════════════════════════════════════════════════ */

function raportTematow(log, zapytania) {
  naglowek(log, '4. TEMATY ZAPYTAŃ A GRUPY REKLAM');

  var wgTematu = {};
  for (var t in USTAWIENIA.tematy) wgTematu[t] = { koszt: 0, kliki: 0, konw: 0, obce: [] };

  for (var i = 0; i < zapytania.length; i++) {
    var z = zapytania[i];
    var temat = tematFrazy(z.fraza);
    if (!temat) continue;
    var w = wgTematu[temat];
    w.koszt += z.koszt; w.kliki += z.kliki; w.konw += z.konwersje;
    // grupa reklam nie wspomina tematu — zapytanie ląduje nie tam, gdzie trzeba
    if (z.grupa.toLowerCase().indexOf(temat.split(' ')[0]) === -1) {
      w.obce.push(z);
    }
  }

  for (var t2 in wgTematu) {
    var d = wgTematu[t2];
    if (!d.kliki && !d.koszt) continue;
    log.push(pad(t2, 22) + pad(kwota(d.koszt), 14) + pad(d.kliki + ' kl.', 9) +
             d.konw.toFixed(1) + ' konw. · poza własną grupą: ' + d.obce.length);
  }

  log.push('');
  log.push('Zapytania, które wyświetliły się w grupie o innym temacie:');
  var razem = 0;
  for (var t3 in wgTematu) {
    var obce = wgTematu[t3].obce.sort(function (a, b) { return b.koszt - a.koszt; }).slice(0, 8);
    if (!obce.length) continue;
    log.push('  [' + t3 + ']');
    for (var j = 0; j < obce.length; j++) {
      log.push('    ' + pad(kwota(obce[j].koszt), 12) + pad('„' + obce[j].fraza + '”', 46) +
               '→ grupa „' + obce[j].grupa + '”');
      razem += obce[j].koszt;
    }
  }
  if (!razem) { log.push('  (brak — tematy trafiają do właściwych grup)'); return; }
  log.push('');
  log.push('To jest lista pod nowe grupy reklam. Dopóki reklama o alimentach');
  log.push('pokazuje nagłówek o rozwodzie, trafność zostaje niska.');
}

function tematFrazy(fraza) {
  var t = USTAWIENIA.tematy;
  // kolejność ma znaczenie: „rozwód” jest najszerszy, więc sprawdzamy go ostatni
  var kolejnosc = ['alimenty', 'podział majątku', 'separacja', 'opieka nad dzieckiem', 'rozwód'];
  for (var i = 0; i < kolejnosc.length; i++) {
    if (zawiera(fraza, t[kolejnosc[i]])) return kolejnosc[i];
  }
  return null;
}

/* ═══════════════════════════════════════════════════════════════════
   5. SŁOWA, KTÓRE PRZEPALAJĄ BUDŻET
   Domyślnie wyłączone. Wstrzymuje, nigdy nie usuwa.
   ═══════════════════════════════════════════════════════════════════ */

function wstrzymajNierentowne(log, okres) {
  naglowek(log, '5. SŁOWA BEZ KONWERSJI');

  var gaql =
    'SELECT ad_group_criterion.keyword.text, ad_group_criterion.keyword.match_type, ' +
    '       ad_group_criterion.criterion_id, ad_group.id, ad_group.name, campaign.name, ' +
    '       metrics.clicks, metrics.cost_micros, metrics.conversions ' +
    'FROM keyword_view ' +
    'WHERE segments.date BETWEEN "' + okres.od + '" AND "' + okres.do + '" ' +
    '  AND ad_group_criterion.status = "ENABLED"';

  var kandydaci = [];
  var it = AdsApp.search(gaql);
  while (it.hasNext()) {
    var r = it.next();
    if (USTAWIENIA.filtrKampanii &&
        r.campaign.name.indexOf(USTAWIENIA.filtrKampanii) === -1) continue;
    var kliki = Number(r.metrics.clicks || 0);
    var koszt = Number(r.metrics.costMicros || 0) / 1e6;
    var konw  = Number(r.metrics.conversions || 0);
    if (konw > 0) continue;
    if (kliki < USTAWIENIA.progi.minKlikniec) continue;
    if (koszt < USTAWIENIA.progi.maxKosztBezKonwersji) continue;
    kandydaci.push({
      tekst: r.adGroupCriterion.keyword.text,
      dopas: r.adGroupCriterion.keyword.matchType,
      id: r.adGroupCriterion.criterionId,
      grupaId: r.adGroup.id, grupa: r.adGroup.name,
      kliki: kliki, koszt: koszt,
    });
  }

  if (!kandydaci.length) {
    log.push('Żadne słowo nie przekroczyło progu ' +
             kwota(USTAWIENIA.progi.maxKosztBezKonwersji) + ' bez konwersji.');
    return;
  }

  kandydaci.sort(function (a, b) { return b.koszt - a.koszt; });
  var razem = 0;
  for (var i = 0; i < kandydaci.length; i++) {
    var k = kandydaci[i];
    razem += k.koszt;
    log.push('  ' + pad(kwota(k.koszt), 12) + pad(k.kliki + ' kl.', 9) +
             pad('[' + k.dopas + '] ' + k.tekst, 48) + 'grupa „' + k.grupa + '”');
    if (!USTAWIENIA.trybProbny) {
      var sel = AdsApp.keywords().withIds([[Number(k.grupaId), Number(k.id)]]).get();
      if (sel.hasNext()) sel.next().pause();
    }
  }
  log.push('');
  log.push('Razem ' + kandydaci.length + ' słów, ' + kwota(razem) + ' bez jednej konwersji.');
  log.push(USTAWIENIA.trybProbny
    ? 'Tryb próbny — słowa NIE zostały wstrzymane.'
    : 'Słowa wstrzymane. Nie zostały usunięte — historia zostaje.');
  log.push('Jeżeli konto nie mierzy konwersji, ten raport kłamie. Najpierw pomiar.');
}

/* ═══════════════════════════════════════════════════════════════════
   6. HARMONOGRAM
   Domyślnie wyłączony. Kancelaria odbiera telefon 9:00–17:00, ale
   formularz działa całą dobę, więc nocy nie wyłączamy — obniżamy stawkę.
   ═══════════════════════════════════════════════════════════════════ */

function ustawHarmonogram(log) {
  naglowek(log, '6. HARMONOGRAM WYŚWIETLANIA');

  var kampanie = AdsApp.campaigns().withCondition('campaign.status = "ENABLED"').get();
  var ile = 0;

  while (kampanie.hasNext()) {
    var k = kampanie.next();
    if (USTAWIENIA.filtrKampanii && k.getName().indexOf(USTAWIENIA.filtrKampanii) === -1) continue;

    var istniejace = k.targeting().adSchedules().get();
    if (istniejace.hasNext()) {
      log.push('Kampania „' + k.getName() + '” ma już harmonogram — pomijam.');
      continue;
    }

    log.push('Kampania „' + k.getName() + '”:');
    for (var i = 0; i < USTAWIENIA.harmonogram.length; i++) {
      var h = USTAWIENIA.harmonogram[i];
      for (var j = 0; j < h.dni.length; j++) {
        if (!USTAWIENIA.trybProbny) {
          k.addAdSchedule({
            dayOfWeek: h.dni[j],
            startHour: h.od, startMinute: 0,
            endHour: h.do, endMinute: 0,
            bidModifier: h.mnoznik,
          });
        }
        ile++;
      }
      log.push('  ' + pad(h.dni.join(', '), 46) + h.od + ':00–' + h.do + ':00, ' +
               'stawka ×' + h.mnoznik.toFixed(2));
    }
  }

  if (!ile) { log.push('Nic do ustawienia.'); return; }
  log.push('');
  log.push(USTAWIENIA.trybProbny
    ? 'Tryb próbny — harmonogram NIE został ustawiony (' + ile + ' pozycji).'
    : 'Ustawiono ' + ile + ' pozycji harmonogramu.');
  log.push('UWAGA: kampania bez harmonogramu wyświetla się całą dobę. Po dodaniu');
  log.push('pozycji wyświetla się WYŁĄCZNIE w podanych oknach — dlatego powyższa');
  log.push('lista pokrywa pełną dobę, a nie tylko godziny pracy.');
}

/* ═══════════════════════════════════════════════════════════════════
   7. SUFIKS UTM
   Domyślnie wyłączony. Nie rusza adresów docelowych — dokłada tylko
   parametry, po których poznajemy źródło leada w bazie i w mailu.
   ═══════════════════════════════════════════════════════════════════ */

function ustawSufiks(log) {
  naglowek(log, '7. SUFIKS ADRESU (UTM)');
  log.push('Sufiks: ' + USTAWIENIA.sufiksUTM);
  log.push('');

  var kampanie = AdsApp.campaigns().withCondition('campaign.status = "ENABLED"').get();
  var ile = 0;
  while (kampanie.hasNext()) {
    var k = kampanie.next();
    if (USTAWIENIA.filtrKampanii && k.getName().indexOf(USTAWIENIA.filtrKampanii) === -1) continue;
    var obecny = '';
    try { obecny = k.urls().getFinalUrlSuffix() || ''; } catch (e) { obecny = ''; }
    if (obecny === USTAWIENIA.sufiksUTM) {
      log.push('  „' + k.getName() + '” — już ustawiony, pomijam.');
      continue;
    }
    log.push('  „' + k.getName() + '” — ' + (obecny ? 'zmiana z: ' + obecny : 'ustawienie'));
    if (!USTAWIENIA.trybProbny) k.urls().setFinalUrlSuffix(USTAWIENIA.sufiksUTM);
    ile++;
  }

  if (!ile) { log.push('  Nic do zmiany.'); return; }
  log.push('');
  log.push(USTAWIENIA.trybProbny
    ? 'Tryb próbny — sufiks NIE został zapisany (' + ile + ' kampanii).'
    : 'Sufiks ustawiony w ' + ile + ' kampaniach.');
  log.push('Automatyczne tagowanie (gclid) zostaw włączone — sufiks go nie psuje.');
}

/* ═══════════════════════════════════════════════════════════════════
   NARZĘDZIA
   ═══════════════════════════════════════════════════════════════════ */

function zakresDat(dni) {
  var strefa = AdsApp.currentAccount().getTimeZone();
  var teraz = new Date();
  var wczoraj = new Date(teraz.getTime() - 24 * 3600 * 1000);
  var start = new Date(teraz.getTime() - dni * 24 * 3600 * 1000);
  return {
    od: Utilities.formatDate(start, strefa, 'yyyy-MM-dd'),
    do: Utilities.formatDate(wczoraj, strefa, 'yyyy-MM-dd'),
  };
}

function pierwszy(gaql) {
  var it = AdsApp.search(gaql);
  return it.hasNext() ? it.next() : null;
}

function zawiera(tekst, lista) {
  return !!ktoreZawiera(tekst, lista);
}

function ktoreZawiera(tekst, lista) {
  for (var i = 0; i < lista.length; i++) {
    if (tekst.indexOf(lista[i]) !== -1) return lista[i];
  }
  return null;
}

function suma(tablica, pole) {
  var s = 0;
  for (var i = 0; i < tablica.length; i++) s += tablica[i][pole];
  return s;
}

function kwota(x) {
  return x.toFixed(2) + ' ' + AdsApp.currentAccount().getCurrencyCode();
}

function pad(s, n) {
  s = String(s);
  while (s.length < n) s += ' ';
  return s;
}

function naglowek(log, tytul) {
  log.push('');
  log.push('══════════════════════════════════════════════════════════');
  log.push(tytul);
  log.push('══════════════════════════════════════════════════════════');
}
