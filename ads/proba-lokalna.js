/* ATRAPA ŚRODOWISKA GOOGLE ADS
   ---------------------------------------------------------------
   Skryptu Google Ads nie da się uruchomić poza kontem, a wgranie go
   na żywo tylko po to, żeby sprawdzić, czy się wykonuje, jest złym
   pomysłem. Ten plik podstawia atrapy AdsApp, Logger, Utilities
   i MailApp, wstrzykuje wymyślone dane i wywołuje main().

   Uruchomienie:  node ads/proba-lokalna.js

   Sprawdza wyłącznie, czy kod się wykonuje i czy liczby się zgadzają.
   Nie sprawdza, czy nazwy metod Google Ads są aktualne — to weryfikuje
   przycisk „Podgląd” w edytorze skryptów, przed pierwszym uruchomieniem.

   Wszystkie trzy domyślnie wyłączone działania są tu włączone, żeby
   przejść przez cały kod. Tryb próbny zostaje włączony, więc żadna
   metoda zmieniająca konto nie jest wywoływana.
   --------------------------------------------------------------- */

const wiersze = {
  customer: [{ metrics: { clicks: 412, costMicros: 3871000000, conversions: 0, allConversions: 0, impressions: 20411 } }],
  conversion_action: [
    { conversionAction: { name: "Formularz", status: "ENABLED", type: "WEBPAGE", primaryForGoal: true } },
    { conversionAction: { name: "Telefon", status: "REMOVED", type: "WEBPAGE", primaryForGoal: false } },
  ],
  search_term_view: [
    ["ile kosztuje adwokat rozwodowy warszawa", "Rozwód — ogólna", 18, 9, 142.5, 0],
    ["ile kosztuje sprawa o alimenty", "Rozwód — ogólna", 30, 14, 210.0, 0],
    ["adwokat alimenty warszawa", "Rozwód — ogólna", 22, 11, 180.4, 1],
    ["separacja ile kosztuje u adwokata", "Rozwód — ogólna", 12, 6, 88.2, 0],
    ["podział majątku adwokat mokotów", "Rozwód — ogólna", 9, 4, 61.0, 0],
    ["kontakty z dzieckiem adwokat", "Rozwód — ogólna", 7, 3, 44.0, 0],
    ["wzór pozwu o rozwód pdf", "Rozwód — ogólna", 140, 22, 96.3, 0],
    ["praca kancelaria adwokacka warszawa", "Rozwód — ogólna", 51, 8, 33.1, 0],
    ["aplikacja adwokacka egzamin", "Rozwód — ogólna", 12, 2, 9.4, 0],
    ["rozwód forum opinie", "Rozwód — ogólna", 20, 5, 21.0, 0],
    ["jak napisać pozew o rozwód samemu", "Rozwód — ogólna", 61, 12, 55.5, 0],
    ["adwokat rozwodowy bemowo", "Rozwód — ogólna", 14, 7, 99.0, 2],
    ["komornik alimenty egzekucja", "Rozwód — ogólna", 8, 3, 18.0, 0],
  ].map(([t, g, w, k, c, kw]) => ({
    searchTermView: { searchTerm: t }, campaign: { id: "1", name: "Rozwód Warszawa" },
    adGroup: { id: "11", name: g },
    metrics: { impressions: w, clicks: k, costMicros: c * 1e6, conversions: kw },
  })),
  keyword_view: [
    ["rozwód warszawa", "PHRASE", 41, 640.0, 0], ["adwokat rozwód", "BROAD", 22, 410.0, 0],
    ["alimenty", "BROAD", 9, 120.0, 0], ["adwokat bemowo", "EXACT", 30, 290.0, 2],
  ].map(([t, d, k, c, kw], i) => ({
    adGroupCriterion: { keyword: { text: t, matchType: d }, criterionId: String(100 + i) },
    adGroup: { id: "11", name: "Rozwód — ogólna" }, campaign: { name: "Rozwód Warszawa" },
    metrics: { clicks: k, costMicros: c * 1e6, conversions: kw },
  })),
};
const iter = a => { let i = 0; return { hasNext: () => i < a.length, next: () => a[i++] }; };
global.Logger = { log: s => console.log(s) };
global.MailApp = { sendEmail: () => { throw new Error("nie powinno się wydarzyć w próbie"); } };
global.Utilities = { formatDate: (d) => d.toISOString().slice(0, 10) };
global.AdsApp = {
  currentAccount: () => ({ getName: () => "Kancelaria", getCustomerId: () => "123-456-7890",
                           getTimeZone: () => "Europe/Warsaw", getCurrencyCode: () => "PLN" }),
  search: q => { for (const k in wiersze) if (q.indexOf("FROM " + k) !== -1) return iter(wiersze[k]); return iter([]); },
  adGroups: () => ({ withIds: () => ({ get: () => iter([]) }) }),
  keywords: () => ({ withIds: () => ({ get: () => iter([]) }) }),
  campaigns: () => ({ withCondition: () => ({ get: () => iter([{
    getName: () => "Rozwód Warszawa",
    targeting: () => ({ adSchedules: () => ({ get: () => iter([]) }) }),
    urls: () => ({ getFinalUrlSuffix: () => "" }),
  }]) }) }),
};
const path = require("path");
const src = require("fs").readFileSync(path.join(__dirname, "porzadkowanie-kampanii.js"), "utf8");
const wl = src.replace("wstrzymajNierentowne: false", "wstrzymajNierentowne: true")
               .replace("harmonogramGodzin:    false", "harmonogramGodzin:    true")
               .replace("sufiksUTM:            false", "sufiksUTM:            true");
eval(wl + "\nmain();");
