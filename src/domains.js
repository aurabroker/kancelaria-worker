/* ============================================================
   KONFIGURACJA DOMEN — 11 serwisów, każdy z własną treścią
   ------------------------------------------------------------
   Wspólne pozostają wyłącznie układ, style i baza 200 pytań.
   Różne są: tytuł, opis, nagłówek, akapit otwierający, sekcja
   lokalna oraz przypisana pula pytań FAQ.

   UWAGA PRAWNA — DO POTWIERDZENIA PRZEZ ADWOKATA
   Pole `court` wskazuje sąd okręgowy właściwy dla spraw
   rozwodowych z danego obszaru. Podział na Sąd Okręgowy
   w Warszawie i Sąd Okręgowy Warszawa-Praga przyjęto według
   położenia dzielnicy względem Wisły oraz przynależności
   powiatowej. Przed publikacją każdą pozycję musi potwierdzić
   adwokat — błędna informacja o właściwości sądu jest błędem
   merytorycznym widocznym dla klienta.
   ============================================================ */

/* ZAKRES SIECI — decyzja z 8 września 2026
   Poniżej jest jedenaście domen zarejestrowanych i podpiętych pod Cloudflare.

   Kanwa marki wymienia inne dzielnice; sześć z nich nie ma domeny i na razie
   ich nie budujemy: Śródmieście, Ursynów, Praga-Południe, Białołęka,
   Targówek, Wilanów. Dokładać pojedynczo po zakupie domeny.

   Żadnej z działających domen nie wygaszamy dla zgodności z projektem
   graficznym. rozwodtarchomin.pl ma żywą kampanię Google Ads. */

export const FIRM = {
  name:        "Kancelaria Adwokacka Magdalena Idzik-Cieśla",
  attorney:    "adw. Magdalena Idzik-Cieśla",
  nip:         "8392840962",
  barNumber:   "WAW/Adw/3678",
  barCouncil:  "Okręgowa Rada Adwokacka w Warszawie",
  phone:       "+48605089552",
  phoneLabel:  "605 089 552",
  email:       "kancelaria@idzik.org.pl",
  offices: [
    { street: "ul. Ceramiczna 5E/79", postal: "03-126", city: "Warszawa" },
    { street: "ul. Bolkowska 2A/28",  postal: "01-466", city: "Warszawa" },
  ],
  hours: "Mo-Fr 08:00-18:00",
  // Portret adwokatki. Pliki osadzone w src/photo.js i serwowane
  // pod tymi adresami z rocznym cache.
  photo:   "/assets/adwokat.webp",
  photoOg: "/assets/adwokat-og.webp",
};

const SO_WARSZAWA = {
  name: "Sąd Okręgowy w Warszawie",
  address: "al. Solidarności 127, 00-898 Warszawa",
};
const SO_PRAGA = {
  name: "Sąd Okręgowy Warszawa-Praga w Warszawie",
  address: "ul. Poligonowa 3, 04-051 Warszawa",
};

export const DOMAIN_CONFIG = {

  "rozwod.waw.pl": {
    district: "Warszawa", key: "warszawa",
    // akcent z kanwy marki — paleta „Śródmieście"
    accent: "#16264A", light: "#788196", bg: "#F1ECE4",
    title: "Adwokat rozwodowy Warszawa — Kancelaria Idzik-Cieśla",
    desc:  "Adwokat rozwodowy w Warszawie. Rozwód, podział majątku, alimenty i opieka nad dziećmi. Bezpłatna konsultacja 30 minut. Tel. 605 089 552.",
    h1:    "Adwokat rozwodowy w Warszawie",
    lead:  "Prowadzimy sprawy rozwodowe w obu warszawskich sądach okręgowych. Rozwód, podział majątku, alimenty i opieka nad dziećmi — od pierwszej rozmowy do prawomocnego wyroku.",
    court: SO_WARSZAWA,
    courtNote: "Sprawy z lewobrzeżnej Warszawy trafiają do Sądu Okręgowego w Warszawie, z prawobrzeżnej do Sądu Okręgowego Warszawa-Praga. Na pierwszej konsultacji ustalamy, który sąd będzie właściwy w Twojej sprawie.",
    areas: ["Śródmieście", "Mokotów", "Wola", "Ochota", "Żoliborz", "Bielany", "Praga", "Białołęka"],
    faqProfile: ["koszty", "czas", "podstawy", "dzieci", "majatek"],
  },

  "rozwodmokotow.pl": {
    district: "Mokotów", key: "mokotow",
    // akcent z kanwy marki — paleta „Mokotów"
    accent: "#1D3557", light: "#7C8A9E", bg: "#F1ECE4",
    title: "Adwokat rozwodowy Mokotów — podział majątku i mieszkania",
    desc:  "Adwokat rozwodowy na Mokotowie. Podział majątku, mieszkanie i kredyt hipoteczny po rozwodzie. Bezpłatna konsultacja 30 minut. Tel. 605 089 552.",
    h1:    "Adwokat rozwodowy na Mokotowie",
    lead:  "Na Mokotowie najczęściej rozstrzygamy spory o mieszkanie i wspólny kredyt. Doprowadzamy sprawę do podziału, który daje obu stronom możliwość ruszenia dalej.",
    court: SO_WARSZAWA,
    courtNote: "Sprawy rozwodowe mieszkańców Mokotowa rozpoznaje Sąd Okręgowy w Warszawie przy al. Solidarności 127.",
    areas: ["Stary Mokotów", "Sadyba", "Stegny", "Służew", "Ksawerów", "Wierzbno"],
    faqProfile: ["majatek", "koszty", "podstawy"],
  },

  "rozwodwola.pl": {
    district: "Wola", key: "wola",
    // akcent z kanwy marki — paleta „Wola"
    accent: "#24425E", light: "#8091A2", bg: "#F1ECE4",
    title: "Adwokat rozwodowy Wola — alimenty i koszty rozwodu",
    desc:  "Adwokat rozwodowy na Woli. Alimenty na dzieci i małżonka, koszty sprawy rozwodowej. Bezpłatna konsultacja 30 minut. Tel. 605 089 552.",
    h1:    "Adwokat rozwodowy na Woli",
    lead:  "Na Woli najwięcej pytań dotyczy alimentów i tego, ile sprawa realnie kosztuje. Odpowiadamy konkretnie, zanim podpiszesz jakąkolwiek umowę.",
    court: SO_WARSZAWA,
    courtNote: "Sprawy rozwodowe mieszkańców Woli rozpoznaje Sąd Okręgowy w Warszawie przy al. Solidarności 127.",
    areas: ["Młynów", "Czyste", "Odolany", "Ulrychów", "Mirów", "Koło"],
    faqProfile: ["alimenty", "koszty", "czas"],
  },

  "rozwodzoliborz.pl": {
    district: "Żoliborz", key: "zoliborz",
    // akcent z kanwy marki — paleta „Żoliborz"
    accent: "#4A5580", light: "#969CB5", bg: "#F1ECE4",
    title: "Adwokat rozwodowy Żoliborz — opieka i plan wychowawczy",
    desc:  "Adwokat rozwodowy na Żoliborzu. Władza rodzicielska, kontakty z dzieckiem i plan wychowawczy. Bezpłatna konsultacja 30 minut. Tel. 605 089 552.",
    h1:    "Adwokat rozwodowy na Żoliborzu",
    lead:  "Na Żoliborzu prowadzimy głównie sprawy, w których najważniejsze są dzieci. Budujemy plan wychowawczy, który sąd zatwierdzi, a rodzice będą w stanie wykonać.",
    court: SO_WARSZAWA,
    courtNote: "Sprawy rozwodowe mieszkańców Żoliborza rozpoznaje Sąd Okręgowy w Warszawie przy al. Solidarności 127.",
    areas: ["Stary Żoliborz", "Sady Żoliborskie", "Marymont", "Powązki"],
    faqProfile: ["dzieci", "alimenty", "procedura"],
  },

  "rozwodbielany.pl": {
    district: "Bielany", key: "bielany",
    // akcent z kanwy marki — paleta „Bielany"
    accent: "#3D5A80", light: "#8E9FB5", bg: "#F1ECE4",
    title: "Adwokat rozwodowy Bielany — przesłanki i przebieg sprawy",
    desc:  "Adwokat rozwodowy na Bielanach. Przesłanki rozwodu, przebieg sprawy i terminy. Bezpłatna konsultacja 30 minut. Tel. 605 089 552.",
    h1:    "Adwokat rozwodowy na Bielanach",
    lead:  "Zaczynamy od najprostszego pytania: czy w Twojej sytuacji sąd w ogóle orzeknie rozwód i co będzie trzeba wykazać. Dopiero potem rozmawiamy o strategii.",
    court: SO_WARSZAWA,
    courtNote: "Sprawy rozwodowe mieszkańców Bielan rozpoznaje Sąd Okręgowy w Warszawie przy al. Solidarności 127.",
    areas: ["Stare Bielany", "Chomiczówka", "Wrzeciono", "Piaski", "Huta", "Młociny"],
    faqProfile: ["podstawy", "czas", "procedura"],
  },

  "rozwodochota.pl": {
    district: "Ochota", key: "ochota",
    // akcent z kanwy marki — paleta „Ursynów"
    accent: "#2A5060", light: "#839AA3", bg: "#F1ECE4",
    title: "Adwokat rozwodowy Ochota — rozwód z orzeczeniem o winie",
    desc:  "Adwokat rozwodowy na Ochocie. Rozwód z orzeczeniem o winie i jego skutki. Bezpłatna konsultacja 30 minut. Tel. 605 089 552.",
    h1:    "Adwokat rozwodowy na Ochocie",
    lead:  "Wina w rozwodzie zmienia przede wszystkim alimenty między małżonkami. Mówimy wprost, kiedy walka o nią ma sens finansowy, a kiedy tylko wydłuża sprawę.",
    court: SO_WARSZAWA,
    courtNote: "Sprawy rozwodowe mieszkańców Ochoty rozpoznaje Sąd Okręgowy w Warszawie przy al. Solidarności 127.",
    areas: ["Stara Ochota", "Rakowiec", "Szczęśliwice", "Filtry"],
    faqProfile: ["wina", "podstawy", "koszty"],
  },

  "rozwodbemowo.pl": {
    district: "Bemowo", key: "bemowo",
    // akcent z kanwy marki — paleta „Bemowo"
    accent: "#2B3E6B", light: "#848FA9", bg: "#F1ECE4",
    title: "Adwokat rozwodowy Bemowo — pozew, dowody, mediacja",
    desc:  "Adwokat rozwodowy na Bemowie. Pozew o rozwód, dowody i mediacja. Bezpłatna konsultacja 30 minut. Tel. 605 089 552.",
    h1:    "Adwokat rozwodowy na Bemowie",
    lead:  "Dobrze napisany pozew skraca sprawę bardziej niż cokolwiek innego. Przygotowujemy go tak, żeby sąd na pierwszej rozprawie miał komplet informacji.",
    court: SO_WARSZAWA,
    courtNote: "Sprawy rozwodowe mieszkańców Bemowa rozpoznaje Sąd Okręgowy w Warszawie przy al. Solidarności 127.",
    areas: ["Jelonki", "Boernerowo", "Chrzanów", "Górce", "Nowe Bemowo"],
    faqProfile: ["procedura", "czas", "podstawy"],
  },

  "rozwodtarchomin.pl": {
    district: "Tarchomin", key: "tarchomin",
    // akcent z kanwy marki — paleta „Białołęka"
    accent: "#35566E", light: "#8A9DAB", bg: "#F1ECE4",
    // ZYWA KAMPANIA GOOGLE ADS — nie usuwac bez zgody wlasciciela konta.
    // Jedyna domena w sieci z wlasnym tagiem konwersji. Do czasu uzupelnienia
    // TRACKING.adsId te wartosci sa jedynym zrodlem pomiaru konwersji.
    gtag: "AW-18123853335", conversionTag: "AW-18123853335/ocgpCLSM168cEJeckMJD",
    title: "Adwokat rozwodowy Tarchomin — kontakty z dzieckiem",
    desc:  "Adwokat rozwodowy na Tarchominie i Białołęce. Kontakty z dzieckiem i opieka naprzemienna. Bezpłatna konsultacja 30 minut. Tel. 605 089 552.",
    h1:    "Adwokat rozwodowy na Tarchominie",
    lead:  "Białołęka to dzielnica młodych rodzin, więc najczęściej rozmawiamy o kontaktach i opiece naprzemiennej. Ustalamy harmonogram, który wytrzyma zderzenie z codziennością.",
    court: SO_PRAGA,
    courtNote: "Sprawy rozwodowe mieszkańców Białołęki i Tarchomina rozpoznaje Sąd Okręgowy Warszawa-Praga przy ul. Poligonowej 3.",
    areas: ["Tarchomin", "Nowodwory", "Białołęka Dworska", "Choszczówka", "Płudy"],
    faqProfile: ["dzieci", "alimenty", "procedura"],
  },

  "rozwodlegionowo.pl": {
    district: "Legionowo", key: "legionowo",
    // akcent z kanwy marki — paleta „Targówek"
    accent: "#3A4A75", light: "#8D96AF", bg: "#F1ECE4",
    title: "Adwokat rozwodowy Legionowo — alimenty i sprawy rodzinne",
    desc:  "Adwokat rozwodowy w Legionowie. Alimenty, rozwód i sprawy rodzinne w powiecie legionowskim. Bezpłatna konsultacja 30 minut. Tel. 605 089 552.",
    h1:    "Adwokat rozwodowy w Legionowie",
    lead:  "Obsługujemy cały powiat legionowski. Konsultacja może odbyć się online albo telefonicznie, bez dojazdu do Warszawy — do sądu jedziemy z Tobą dopiero na rozprawę.",
    court: SO_PRAGA,
    courtNote: "Sprawy rozwodowe mieszkańców powiatu legionowskiego rozpoznaje Sąd Okręgowy Warszawa-Praga przy ul. Poligonowej 3.",
    areas: ["Legionowo", "Serock", "Nieporęt", "Wieliszew", "Michałów-Reginów"],
    faqProfile: ["alimenty", "koszty", "dzieci"],
  },

  "rozwodlomianki.pl": {
    district: "Łomianki", key: "lomianki",
    // akcent z kanwy marki — paleta „Wilanów"
    accent: "#1F3A44", light: "#7D8D93", bg: "#F1ECE4",
    title: "Adwokat rozwodowy Łomianki — podział majątku i nieruchomości",
    desc:  "Adwokat rozwodowy w Łomiankach. Podział majątku, dom i nieruchomości po rozwodzie. Bezpłatna konsultacja 30 minut. Tel. 605 089 552.",
    h1:    "Adwokat rozwodowy w Łomiankach",
    lead:  "W Łomiankach sprawy majątkowe najczęściej dotyczą domu i działki. Zaczynamy od spisu składników majątku, bo to on przesądza o przebiegu całego postępowania.",
    court: SO_WARSZAWA,
    courtNote: "Sprawy rozwodowe mieszkańców Łomianek i powiatu warszawskiego zachodniego rozpoznaje Sąd Okręgowy w Warszawie przy al. Solidarności 127.",
    areas: ["Łomianki", "Dąbrowa", "Kiełpin", "Sadowa", "Buraków"],
    faqProfile: ["majatek", "podstawy", "koszty"],
  },

  "rozwodjablonna.pl": {
    district: "Jabłonna", key: "jablonna",
    // akcent z kanwy marki — paleta „Praga-Płd."
    accent: "#2F5B63", light: "#86A0A5", bg: "#F1ECE4",
    title: "Adwokat rozwodowy Jabłonna — separacja i sprawy zagraniczne",
    desc:  "Adwokat rozwodowy w Jabłonnie. Separacja, unieważnienie małżeństwa i sprawy z elementem zagranicznym. Bezpłatna konsultacja 30 minut. Tel. 605 089 552.",
    h1:    "Adwokat rozwodowy w Jabłonnie",
    lead:  "Prowadzimy także sprawy nietypowe: separację zamiast rozwodu oraz postępowania, w których jedno z małżonków mieszka lub pracuje za granicą.",
    court: SO_PRAGA,
    courtNote: "Sprawy rozwodowe mieszkańców gminy Jabłonna rozpoznaje Sąd Okręgowy Warszawa-Praga przy ul. Poligonowej 3.",
    areas: ["Jabłonna", "Chotomów", "Skierdy", "Rajszew", "Trzciany"],
    faqProfile: ["separacja", "zagranica", "podstawy"],
  },

};

export const DEFAULT_HOST = "rozwod.waw.pl";
export const DEFAULT_CONFIG = DOMAIN_CONFIG[DEFAULT_HOST];
export const ALL_HOSTS = Object.keys(DOMAIN_CONFIG);

/* Warianty nagłówka dobierane po parametrze utm_content z Google Ads.
   Klucz musi odpowiadać nazwie grupy reklam wpisanej w sufiksie kampanii. */
export const AD_HEADLINES = {
  "grupa-alimenty":  d => `Alimenty ${d.locative} — adwokat po Twojej stronie`,
  "grupa-majatek":   d => `Podział majątku po rozwodzie — ${d.district}`,
  "grupa-dzieci":    d => `Opieka nad dziećmi po rozwodzie — ${d.district}`,
  "grupa-wina":      d => `Rozwód z orzeczeniem o winie — ${d.district}`,
  "grupa-szybki":    d => `Szybki rozwód bez orzekania o winie — ${d.district}`,
  "grupa-separacja": d => `Separacja zamiast rozwodu — ${d.district}`,
};

/* Miejscownik nazwy obszaru, używany w wariantach nagłówka. */
const LOCATIVE = {
  warszawa: "w Warszawie", mokotow: "na Mokotowie", wola: "na Woli",
  zoliborz: "na Żoliborzu", bielany: "na Bielanach", ochota: "na Ochocie",
  bemowo: "na Bemowie", tarchomin: "na Tarchominie", legionowo: "w Legionowie",
  lomianki: "w Łomiankach", jablonna: "w Jabłonnie",
};

for (const [host, cfg] of Object.entries(DOMAIN_CONFIG)) {
  cfg.host = host;
  cfg.locative = LOCATIVE[cfg.key] || `w ${cfg.district}`;
}
