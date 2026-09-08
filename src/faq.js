/* ============================================================
   BAZA 200 PYTAŃ I ODPOWIEDZI — PRAWO RODZINNE
   ------------------------------------------------------------
   UWAGA PRAWNA
   Każda kwota, termin i podstawa prawna w tym pliku wymaga
   potwierdzenia przez adwokata przed publikacją. Stan na
   wrzesień 2026. Opłaty sądowe zmieniają się ustawą, a linia
   orzecznicza bywa niejednolita.

   STRUKTURA WPISU
   id  — stały identyfikator, nigdy nie zmieniaj (wchodzi w pule domen)
   cat — klucz kategorii z CATEGORIES
   q   — pytanie w formie, w jakiej zadaje je klient
   a   — odpowiedź: jeden akapit, samodzielny, cytowalny bez kontekstu,
         z liczbą albo terminem tam, gdzie to możliwe
   ============================================================ */

export const CATEGORIES = {
  podstawy:   "Rozwód — podstawy i przesłanki",
  wina:       "Wina i jej skutki",
  czas:       "Czas trwania i przebieg sprawy",
  koszty:     "Koszty, opłaty i honorarium",
  dzieci:     "Dzieci — władza rodzicielska i kontakty",
  alimenty:   "Alimenty",
  majatek:    "Majątek, mieszkanie i kredyt",
  separacja:  "Separacja i unieważnienie małżeństwa",
  zagranica:  "Sprawy z elementem zagranicznym",
  procedura:  "Procedura — pozew, dowody, mediacja",
};

export const FAQ = [

/* ---------- PODSTAWY I PRZESŁANKI (25) ---------- */
{ id: "p01", cat: "podstawy", q: "Kiedy sąd może orzec rozwód?",
  a: "Sąd orzeka rozwód, gdy między małżonkami nastąpił zupełny i trwały rozkład pożycia. Zupełny oznacza zerwanie więzi uczuciowej, fizycznej i gospodarczej. Trwały oznacza, że nie ma realnych widoków na powrót do wspólnego życia. Obie przesłanki muszą wystąpić łącznie — sam konflikt czy wyprowadzka jednego z małżonków to za mało." },
{ id: "p02", cat: "podstawy", q: "Czy sąd może odmówić rozwodu, mimo że oboje go chcemy?",
  a: "Tak. Sąd odmówi rozwodu, jeżeli ucierpiałoby na tym dobro wspólnych małoletnich dzieci albo gdy orzeczenie rozwodu byłoby sprzeczne z zasadami współżycia społecznego. Zgoda obu stron nie zwalnia sądu z badania tych przesłanek, choć w praktyce zgodne stanowisko małżonków znacząco skraca postępowanie." },
{ id: "p03", cat: "podstawy", q: "Czy mogę dostać rozwód, jeśli mąż albo żona się nie zgadza?",
  a: "Tak, zgoda drugiego małżonka nie jest warunkiem rozwodu. Sprzeciw ma znaczenie tylko w jednej sytuacji: gdy rozwodu żąda małżonek wyłącznie winny rozkładu pożycia, a niewinny nie wyraża zgody. Wtedy sąd rozwodu nie orzeknie, chyba że odmowa zgody jest sprzeczna z zasadami współżycia społecznego." },
{ id: "p04", cat: "podstawy", q: "Ile czasu trzeba być w separacji faktycznej, żeby dostać rozwód?",
  a: "Prawo nie przewiduje żadnego minimalnego okresu. Liczy się stan rozkładu pożycia, a nie czas jego trwania. W praktyce kilkumiesięczne osobne życie ułatwia wykazanie trwałości rozkładu, ale zdarzają się rozwody orzekane przy krótszym rozstaniu, gdy przyczyna jest oczywista." },
{ id: "p05", cat: "podstawy", q: "Do jakiego sądu składa się pozew o rozwód?",
  a: "Pozew o rozwód składa się do sądu okręgowego, nie rejonowego. Właściwy jest sąd, w którego okręgu małżonkowie mieli ostatnie wspólne miejsce zamieszkania, o ile choć jedno z nich nadal tam mieszka. Jeśli nie — decyduje miejsce zamieszkania pozwanego." },
{ id: "p06", cat: "podstawy", q: "Czy muszę mieć powód, żeby wnieść o rozwód?",
  a: "W pozwie trzeba wskazać, na czym polega rozkład pożycia i co go spowodowało. Nie musi to być jedno dramatyczne wydarzenie — wystarczy opis narastającego oddalenia, braku wspólnego życia i wygaśnięcia więzi. Szczegółowość opisu zależy od tego, czy wnosisz o orzeczenie winy." },
{ id: "p07", cat: "podstawy", q: "Czy rozwód jest możliwy, gdy mamy małe dziecko?",
  a: "Tak. Posiadanie małoletnich dzieci nie blokuje rozwodu, ale sąd bada, czy rozwód nie naruszy ich dobra. Kluczowe jest przedstawienie sensownego planu opieki, kontaktów i alimentów. Sąd rzadko odmawia rozwodu z tego powodu, gdy rodzice potrafią uzgodnić warunki dotyczące dziecka." },
{ id: "p08", cat: "podstawy", q: "Czy zdrada wystarczy do rozwodu?",
  a: "Zdrada bardzo często prowadzi do zupełnego i trwałego rozkładu pożycia i wtedy wystarcza. Sama w sobie nie jest jednak automatyczną podstawą — sąd bada skutek, jaki wywołała. Jeżeli małżonkowie po zdradzie wrócili do wspólnego życia, przesłanka trwałości może nie być spełniona." },
{ id: "p09", cat: "podstawy", q: "Czym różni się rozwód od separacji?",
  a: "Rozwód rozwiązuje małżeństwo i pozwala zawrzeć nowe. Separacja jedynie uchyla wspólne pożycie — małżeństwo trwa, nie można ponownie wstąpić w związek, a separację da się znieść wspólnym wnioskiem. Przy separacji wystarczy zupełny rozkład pożycia, bez wykazywania jego trwałości." },
{ id: "p10", cat: "podstawy", q: "Czy mogę wycofać pozew o rozwód?",
  a: "Tak, powód może cofnąć pozew. Do rozpoczęcia rozprawy nie potrzeba zgody pozwanego. Później zgoda jest wymagana, chyba że jednocześnie zrzekasz się roszczenia. Cofnięcie pozwu kończy sprawę bez wyroku, a część opłaty sądowej może podlegać zwrotowi." },
{ id: "p11", cat: "podstawy", q: "Czy da się rozwieść bez udziału w rozprawie?",
  a: "Sąd zwykle chce wysłuchać obu stron, bo musi ustalić przyczyny rozkładu pożycia. Można wnosić o przeprowadzenie rozprawy pod nieobecność strony albo o przesłuchanie w drodze pomocy sądowej, gdy mieszkasz daleko. W sprawach zgodnych, bez orzekania o winie, wystarcza często jedno posiedzenie." },
{ id: "p12", cat: "podstawy", q: "Czy sąd zawsze próbuje nas pogodzić?",
  a: "Sąd może skierować małżonków do mediacji, jeżeli widzi szanse na utrzymanie małżeństwa, i może zawiesić postępowanie. W praktyce, gdy obie strony konsekwentnie podtrzymują żądanie rozwodu i opisują rozkład pożycia jako trwały, sąd nie przedłuża sprawy próbami pojednania." },
{ id: "p13", cat: "podstawy", q: "Co znaczy, że rozkład pożycia jest zupełny?",
  a: "Zupełny rozkład to zerwanie wszystkich trzech więzi: uczuciowej, fizycznej i gospodarczej. Jeżeli małżonkowie nadal prowadzą wspólne gospodarstwo, wspólnie wypoczywają albo utrzymują pożycie, rozkład nie jest zupełny. Mieszkanie pod jednym dachem z powodów finansowych samo w sobie zupełności nie wyklucza." },
{ id: "p14", cat: "podstawy", q: "Czy można się rozwieść, mieszkając nadal razem?",
  a: "Tak. Wspólne mieszkanie z przyczyn ekonomicznych nie przekreśla rozwodu, jeżeli małżonkowie żyją obok siebie, a nie ze sobą: osobne pokoje, osobne finanse, brak wspólnych posiłków i planów. Trzeba to jednak w sądzie opisać konkretnie, bo sąd bada realną treść relacji." },
{ id: "p15", cat: "podstawy", q: "Kto może wnieść pozew o rozwód?",
  a: "Pozew może wnieść każdy z małżonków. Prokurator nie może żądać rozwodu. Powództwo ma charakter ściśle osobisty, więc nie przechodzi na spadkobierców — śmierć małżonka w toku sprawy powoduje umorzenie postępowania rozwodowego." },
{ id: "p16", cat: "podstawy", q: "Co się dzieje, gdy jedno z małżonków umrze w trakcie sprawy?",
  a: "Postępowanie rozwodowe zostaje umorzone, a małżeństwo uznaje się za ustałe wskutek śmierci, nie rozwodu. Ma to istotne skutki spadkowe: małżonek pozostały przy życiu zachowuje prawo do dziedziczenia, chyba że spadkodawca wcześniej wystąpił o rozwód z winy tego małżonka i żądanie było uzasadnione." },
{ id: "p17", cat: "podstawy", q: "Czy rozwód kościelny i cywilny to to samo?",
  a: "Nie. Rozwód cywilny orzeka sąd okręgowy i dotyczy skutków prawnych małżeństwa w prawie państwowym. Stwierdzenie nieważności małżeństwa przed sądem kościelnym to odrębne postępowanie o innych przesłankach. Jedno nie zastępuje drugiego i oba można prowadzić niezależnie." },
{ id: "p18", cat: "podstawy", q: "Czy po rozwodzie wracam do poprzedniego nazwiska automatycznie?",
  a: "Nie, potrzebne jest oświadczenie złożone przed kierownikiem urzędu stanu cywilnego w terminie trzech miesięcy od uprawomocnienia się wyroku rozwodowego. Po upływie tego terminu zmiana nazwiska wymaga już postępowania administracyjnego o zmianę nazwiska, które jest dłuższe." },
{ id: "p19", cat: "podstawy", q: "Czy w pozwie muszę od razu wnosić o podział majątku?",
  a: "Nie i zwykle się tego nie robi. Sąd rozwodowy może dokonać podziału majątku, ale tylko jeżeli nie spowoduje to nadmiernej zwłoki w sprawie — w praktyce wyłącznie przy pełnej zgodzie stron. Sporny podział prowadzi się w osobnym postępowaniu przed sądem rejonowym." },
{ id: "p20", cat: "podstawy", q: "Czy rozwód wpływa na testament?",
  a: "Rozwód nie unieważnia wcześniej sporządzonego testamentu. Jeżeli w testamencie powołałeś byłego małżonka do spadku, powołanie pozostaje skuteczne mimo rozwodu. Po uprawomocnieniu wyroku warto sporządzić nowy testament, bo dawny dokument nadal działa." },
{ id: "p21", cat: "podstawy", q: "Czy rozwód pozbawia byłego małżonka prawa do dziedziczenia?",
  a: "Tak, w zakresie dziedziczenia ustawowego. Z chwilą uprawomocnienia wyroku rozwodowego były małżonek przestaje należeć do kręgu spadkobierców ustawowych i traci prawo do zachowku z tego tytułu. Nie dotyczy to powołania w testamencie, które trzeba odwołać osobno." },
{ id: "p22", cat: "podstawy", q: "Czy mogę wnieść o rozwód, będąc w ciąży?",
  a: "Tak, ciąża nie stanowi przeszkody. Sąd bada jednak dobro dziecka i może uznać, że orzeczenie rozwodu przed porodem mu zagraża. Dodatkowo działa domniemanie, że dziecko urodzone w czasie małżeństwa lub przed upływem trzystu dni od jego ustania pochodzi od męża matki." },
{ id: "p23", cat: "podstawy", q: "Jak długo po rozwodzie mogę ponownie zawrzeć małżeństwo?",
  a: "Nie ma okresu karencji. Nowe małżeństwo można zawrzeć od dnia uprawomocnienia się wyroku rozwodowego. Do urzędu stanu cywilnego trzeba przedstawić odpis wyroku z klauzulą prawomocności albo skrócony odpis aktu małżeństwa z odpowiednią wzmianką." },
{ id: "p24", cat: "podstawy", q: "Czy rozwód jest jawny? Czy ktoś obcy może przyjść na rozprawę?",
  a: "Rozprawy rozwodowe odbywają się przy drzwiach zamkniętych. Na sali mogą być obecne strony, pełnomocnicy oraz po dwie osoby zaufania wskazane przez każdą ze stron. Publiczność nie ma wstępu, a uzasadnienie wyroku ogłasza się publicznie tylko w ograniczonym zakresie." },
{ id: "p25", cat: "podstawy", q: "Czy dane z mojej sprawy trafią do internetu?",
  a: "Nie. Sprawy rozwodowe toczą się przy drzwiach zamkniętych, a orzeczenia w sprawach rodzinnych nie są publikowane w otwartych bazach w formie pozwalającej zidentyfikować strony. Akta sprawy są dostępne stronom i ich pełnomocnikom, nie osobom postronnym." },

/* ---------- WINA I JEJ SKUTKI (20) ---------- */
{ id: "w01", cat: "wina", q: "Co daje orzeczenie rozwodu z winy małżonka?",
  a: "Największe znaczenie ma dla alimentów. Małżonek uznany za wyłącznie winnego nie może żądać alimentów od drugiego, a sam może być zobowiązany do ich płacenia nawet wtedy, gdy niewinny nie żyje w niedostatku — wystarczy istotne pogorszenie jego sytuacji materialnej po rozwodzie." },
{ id: "w02", cat: "wina", q: "Czy orzeczenie winy wpływa na opiekę nad dziećmi?",
  a: "Nie bezpośrednio. Wina za rozkład pożycia dotyczy relacji między małżonkami, a o władzy rodzicielskiej i kontaktach decyduje wyłącznie dobro dziecka. Zachowanie, które przesądziło o winie, może mieć znaczenie tylko wtedy, gdy jednocześnie świadczy o zagrożeniu dla dziecka." },
{ id: "w03", cat: "wina", q: "Czy orzeczenie winy wpływa na podział majątku?",
  a: "Nie. Udziały w majątku wspólnym są co do zasady równe niezależnie od winy za rozkład pożycia. Nierówne udziały można ustalić tylko z ważnych powodów i przy różnym stopniu przyczynienia się do powstania majątku — a to inna przesłanka niż wina rozwodowa." },
{ id: "w04", cat: "wina", q: "O ile dłużej trwa rozwód z orzekaniem o winie?",
  a: "Zwykle wielokrotnie dłużej. Rozwód bez orzekania o winie kończy się często na jednej rozprawie w ciągu kilku miesięcy. Sprawa z winą wymaga postępowania dowodowego ze świadkami, dokumentami i niekiedy opinią biegłych, co realnie oznacza rok lub dłużej." },
{ id: "w05", cat: "wina", q: "Czy sąd może orzec winę obu stron?",
  a: "Tak i jest to częste rozstrzygnięcie. Sąd nie stopniuje winy — nie ustala, kto zawinił bardziej. Orzeczenie winy obu stron w skutkach alimentacyjnych jest zbliżone do rozwodu bez orzekania o winie, bo żaden z małżonków nie jest wyłącznie winny." },
{ id: "w06", cat: "wina", q: "Czy można zmienić zdanie i zrezygnować z orzekania o winie?",
  a: "Tak, aż do zamknięcia rozprawy przed sądem pierwszej instancji można zmodyfikować żądanie i wnieść o zaniechanie orzekania o winie. Wymaga to zgodnego wniosku obu stron. To najczęstszy sposób na skrócenie sprawy, która ugrzęzła w postępowaniu dowodowym." },
{ id: "w07", cat: "wina", q: "Jakie dowody przekonują sąd o winie?",
  a: "Zeznania świadków mających bezpośrednią wiedzę, korespondencja, dokumentacja medyczna przy przemocy, notatki policyjne z interwencji, wyroki karne. Sąd ocenia całość materiału — pojedyncza wiadomość rzadko przesądza sprawę. Dowody zdobyte z naruszeniem prawa mogą zostać pominięte." },
{ id: "w08", cat: "wina", q: "Czy nagranie małżonka bez jego wiedzy jest dowodem?",
  a: "Sądy dopuszczają takie nagrania niejednolicie. Nagranie własnej rozmowy bywa uznawane, natomiast podsłuchiwanie cudzych rozmów lub czytanie korespondencji jest naruszeniem prawa i może skutkować pominięciem dowodu oraz odpowiedzialnością karną. Przed nagrywaniem skonsultuj się z adwokatem." },
{ id: "w09", cat: "wina", q: "Czy przemoc domowa przesądza o winie?",
  a: "Przemoc jest jedną z najsilniejszych podstaw przypisania winy za rozkład pożycia. Dowodem bywają Niebieskie Karty, obdukcje, notatki z interwencji policji i wyrok karny. W takiej sprawie warto równolegle rozważyć wniosek o zabezpieczenie i o nakazanie opuszczenia mieszkania." },
{ id: "w10", cat: "wina", q: "Czy związek z inną osobą po rozstaniu obciąża mnie winą?",
  a: "Jeżeli nowy związek powstał już po zupełnym i trwałym rozkładzie pożycia, zwykle nie jest traktowany jako przyczyna rozkładu. Kluczowa jest chronologia: sąd bada, czy relacja była skutkiem rozpadu małżeństwa, czy jego przyczyną. Dlatego daty w tej sprawie mają wagę." },
{ id: "w11", cat: "wina", q: "Czy alkoholizm małżonka to podstawa do orzeczenia winy?",
  a: "Tak, uzależnienie połączone z zaniedbywaniem rodziny, agresją lub trwonieniem majątku bywa uznawane za zawinioną przyczynę rozkładu pożycia. Sąd bada, czy małżonek podejmował leczenie i jak jego zachowanie wpływało na życie rodziny." },
{ id: "w12", cat: "wina", q: "Czy odmowa współżycia może być uznana za winę?",
  a: "Trwała i nieuzasadniona odmowa współżycia bywa uznawana za zawinioną przyczynę rozkładu pożycia. Sąd bada jednak kontekst: choroba, uraz, wcześniejsze zachowanie drugiego małżonka czy przemoc mogą tę odmowę w pełni usprawiedliwiać." },
{ id: "w13", cat: "wina", q: "Czy porzucenie rodziny to wina?",
  a: "Opuszczenie rodziny bez uzasadnionej przyczyny i zaprzestanie łożenia na jej utrzymanie jest klasyczną podstawą przypisania winy. Inaczej sąd oceni wyprowadzkę będącą ucieczką przed przemocą — taka decyzja zwykle nie obciąża wyprowadzającego się." },
{ id: "w14", cat: "wina", q: "Czy da się orzec rozwód bez winy, gdy jedna strona chce winy?",
  a: "Zaniechanie orzekania o winie wymaga zgodnego żądania obu małżonków. Jeżeli jedna strona konsekwentnie żąda orzeczenia winy, sąd musi tę kwestię zbadać i przeprowadzić postępowanie dowodowe, co wydłuża sprawę." },
{ id: "w15", cat: "wina", q: "Czy mogę żądać winy dopiero w toku sprawy?",
  a: "Tak, żądanie można zmodyfikować do zamknięcia rozprawy w pierwszej instancji. Trzeba wtedy liczyć się z otwarciem postępowania dowodowego i wydłużeniem sprawy. Zmiana stanowiska bywa też odczytywana jako element negocjacji majątkowych." },
{ id: "w16", cat: "wina", q: "Co jeśli oboje jesteśmy trochę winni?",
  a: "Sąd orzeka wtedy winę obu stron i nie ustala proporcji. Dla większości skutków prawnych sytuacja jest zbliżona do rozwodu bez orzekania o winie, bo kluczowa dla alimentów jest kategoria małżonka wyłącznie winnego, która wtedy nie występuje." },
{ id: "w17", cat: "wina", q: "Czy wina wpływa na to, kto zostanie w mieszkaniu?",
  a: "Może wpłynąć na orzeczenie o sposobie korzystania ze wspólnego mieszkania na czas po rozwodzie. W skrajnych przypadkach, gdy małżonek swoim rażąco nagannym postępowaniem uniemożliwia wspólne zamieszkiwanie, sąd może nakazać mu eksmisję na żądanie drugiego małżonka." },
{ id: "w18", cat: "wina", q: "Czy zdrada emocjonalna, bez fizycznej, może być winą?",
  a: "Tak. Sądy uznają za zawinioną przyczynę rozkładu pożycia także związek pozbawiony kontaktów fizycznych, jeżeli naruszał obowiązek wierności i lojalności wobec małżonka oraz doprowadził do zerwania więzi. Dowodem bywa korespondencja." },
{ id: "w19", cat: "wina", q: "Jak wina wpływa na koszty procesu?",
  a: "Zasadą jest, że koszty ponosi strona przegrywająca. Przy rozwodzie z orzeczeniem winy jednej strony sąd zwykle obciąża ją kosztami procesu przeciwnika, w tym opłatą od pozwu i wynagrodzeniem pełnomocnika według stawek minimalnych." },
{ id: "w20", cat: "wina", q: "Czy warto walczyć o winę?",
  a: "Warto, gdy realnie zmienia sytuację finansową: gdy zależy ci na alimentach dla siebie albo chcesz się przed nimi zabezpieczyć. W pozostałych przypadkach koszt czasu, pieniędzy i obciążenia emocjonalnego bywa wyższy niż korzyść, zwłaszcza gdy w tle są dzieci." },

/* ---------- CZAS TRWANIA I PRZEBIEG SPRAWY (20) ---------- */
{ id: "c01", cat: "czas", q: "Ile trwa sprawa rozwodowa?",
  a: "Rozwód bez orzekania o winie, przy zgodnym stanowisku i uzgodnionych sprawach dzieci, kończy się zwykle na jednej rozprawie w ciągu trzech do sześciu miesięcy od złożenia pozwu. Sprawa z orzekaniem o winie, sporem o dzieci lub majątek trwa rok albo dłużej." },
{ id: "c02", cat: "czas", q: "Ile czeka się na pierwszą rozprawę?",
  a: "W dużych miastach termin pierwszej rozprawy wyznaczany jest zwykle po dwóch do pięciu miesięcy od wniesienia pozwu. Termin zależy od obciążenia konkretnego wydziału. Braki formalne w pozwie wydłużają ten okres o kolejne tygodnie na wezwanie i uzupełnienie." },
{ id: "c03", cat: "czas", q: "Ile rozpraw odbywa się w typowej sprawie rozwodowej?",
  a: "Przy zgodnym rozwodzie bez orzekania o winie wystarcza jedna rozprawa. Gdy sąd bada winę, rozpraw jest zwykle od trzech do sześciu, bo świadków przesłuchuje się partiami. Każdy dodatkowy termin oznacza średnio dwa do czterech miesięcy przerwy." },
{ id: "c04", cat: "czas", q: "Kiedy wyrok rozwodowy staje się prawomocny?",
  a: "Jeżeli żadna ze stron nie zapowie apelacji, wyrok uprawomocnia się po upływie terminu do jej wniesienia. Przy zgodnym rozwodzie strony mogą od razu oświadczyć, że zrzekają się doręczenia uzasadnienia i nie będą składać apelacji, co przyspiesza uprawomocnienie." },
{ id: "c05", cat: "czas", q: "Ile mam czasu na apelację od wyroku rozwodowego?",
  a: "Najpierw w terminie tygodnia od ogłoszenia wyroku składa się wniosek o doręczenie wyroku z uzasadnieniem. Apelację wnosi się w terminie dwóch tygodni od doręczenia wyroku z uzasadnieniem. Pominięcie pierwszego kroku zamyka drogę do apelacji." },
{ id: "c06", cat: "czas", q: "Ile trwa sprawa w drugiej instancji?",
  a: "Postępowanie apelacyjne w sprawach rozwodowych trwa zwykle od sześciu miesięcy do roku od wpływu akt do sądu apelacyjnego. Sąd drugiej instancji często orzeka na jednym posiedzeniu, ale samo oczekiwanie na termin jest długie." },
{ id: "c07", cat: "czas", q: "Czy da się przyspieszyć rozwód?",
  a: "Najskuteczniej działa uzgodnienie z drugą stroną trzech rzeczy przed złożeniem pozwu: rezygnacji z orzekania o winie, planu opieki nad dziećmi i wysokości alimentów. Taki pozew z gotowym porozumieniem sąd rozpoznaje zwykle na pierwszej rozprawie." },
{ id: "c08", cat: "czas", q: "Co najbardziej opóźnia sprawę rozwodową?",
  a: "Spór o winę wymagający przesłuchania wielu świadków, wniosek o opinię opiniodawczego zespołu specjalistów sądowych w sprawie dzieci, zmiana pełnomocnika w toku sprawy oraz nieprawidłowe adresy do doręczeń. Opinia biegłych potrafi dołożyć od czterech do ośmiu miesięcy." },
{ id: "c09", cat: "czas", q: "Co się dzieje na pierwszej rozprawie?",
  a: "Sąd sprawdza obecność, poucza o możliwości mediacji i przesłuchuje obie strony na okoliczność rozkładu pożycia oraz sytuacji dzieci. Przy sprawie zgodnej często na tym samym posiedzeniu zamyka rozprawę i ogłasza wyrok. Rozprawa trwa zwykle od dwudziestu minut do godziny." },
{ id: "c10", cat: "czas", q: "Czy muszę być obecna na każdej rozprawie?",
  a: "Sąd wzywa strony do osobistego stawiennictwa przynajmniej na przesłuchanie. Na pozostałych terminach może wystarczyć obecność pełnomocnika. Nieusprawiedliwiona nieobecność powoda na pierwszej rozprawie może skutkować zawieszeniem postępowania." },
{ id: "c11", cat: "czas", q: "Ile czasu zajmuje przygotowanie pozwu?",
  a: "Przy skompletowanych dokumentach adwokat przygotowuje pozew zwykle w ciągu kilku dni roboczych. Najwięcej czasu zajmuje zebranie odpisu aktu małżeństwa, odpisów aktów urodzenia dzieci oraz dokumentów obrazujących sytuację majątkową i koszty utrzymania." },
{ id: "c12", cat: "czas", q: "Jak długo czeka się na odpis prawomocnego wyroku?",
  a: "Po uprawomocnieniu wyroku wniosek o odpis z klauzulą prawomocności realizowany jest zwykle w ciągu jednego do trzech tygodni. Ten dokument będzie potrzebny w urzędzie stanu cywilnego, w banku i przy sprawie o podział majątku." },
{ id: "c13", cat: "czas", q: "Czy sprawa o alimenty toczy się równolegle z rozwodem?",
  a: "Alimenty na dzieci sąd zasądza w wyroku rozwodowym z urzędu, więc odrębna sprawa nie jest potrzebna. Na czas trwania procesu można złożyć wniosek o zabezpieczenie, który sąd rozpoznaje zwykle w ciągu kilku tygodni, znacznie wcześniej niż zapadnie wyrok." },
{ id: "c14", cat: "czas", q: "Ile trwa sprawa o podział majątku?",
  a: "Zgodny podział u notariusza to kwestia jednej wizyty. Sprawa sporna przed sądem rejonowym trwa zwykle od roku do trzech lat, głównie z powodu wyceny nieruchomości przez biegłego i sporów o nakłady z majątków osobistych." },
{ id: "c15", cat: "czas", q: "Czy rozwód można przeprowadzić w wakacje?",
  a: "Sądy pracują cały rok, ale w lipcu i sierpniu wyznacza się mniej terminów z powodu urlopów sędziów i pełnomocników. Pozew złożony w czerwcu często doczeka się rozprawy dopiero jesienią." },
{ id: "c16", cat: "czas", q: "Co jeśli pozwany nie odbiera korespondencji z sądu?",
  a: "Sąd stosuje doręczenie przez komornika, a przy braku skutku może ustanowić kuratora dla nieznanego z miejsca pobytu. Każdy z tych kroków wydłuża sprawę o kilka miesięcy, dlatego prawidłowy adres pozwanego w pozwie ma realną wartość." },
{ id: "c17", cat: "czas", q: "Czy mediacja wydłuża sprawę?",
  a: "Sąd kieruje strony do mediacji zwykle na okres do trzech miesięcy. Jeżeli kończy się ugodą co do dzieci i alimentów, oszczędza więcej czasu, niż zabiera, bo eliminuje postępowanie dowodowe. Nieudana mediacja realnie opóźnia sprawę o jeden termin." },
{ id: "c18", cat: "czas", q: "Kiedy ustaje wspólność majątkowa małżeńska?",
  a: "Z chwilą uprawomocnienia się wyroku rozwodowego, a nie z dniem faktycznego rozstania ani ogłoszenia wyroku. Do tego momentu majątek nabywany przez każdego z małżonków co do zasady wchodzi do majątku wspólnego, co przy długiej sprawie ma duże znaczenie." },
{ id: "c19", cat: "czas", q: "Czy mogę wziąć ślub zaraz po ogłoszeniu wyroku?",
  a: "Nie. Liczy się prawomocność, a nie ogłoszenie. Dopóki biegnie termin do zaskarżenia albo trwa postępowanie apelacyjne, małżeństwo prawnie istnieje. Urząd stanu cywilnego wymaga dokumentu potwierdzającego prawomocność." },
{ id: "c20", cat: "czas", q: "Ile trwa uzyskanie zabezpieczenia kontaktów z dzieckiem?",
  a: "Wniosek o zabezpieczenie kontaktów sąd powinien rozpoznać bezzwłocznie, w praktyce w ciągu kilku tygodni od złożenia, często na posiedzeniu niejawnym. Postanowienie obowiązuje do prawomocnego zakończenia sprawy i podlega przymusowemu wykonaniu." },

/* ---------- KOSZTY, OPŁATY I HONORARIUM (20) ---------- */
{ id: "k01", cat: "koszty", q: "Ile kosztuje opłata sądowa od pozwu o rozwód?",
  a: "Opłata stała od pozwu o rozwód wynosi 600 zł i uiszcza ją powód przy składaniu pozwu. Przy rozwodzie bez orzekania o winie sąd po uprawomocnieniu wyroku zwraca powodowi połowę tej kwoty, czyli 300 zł, a drugą stronę obciąża połową kosztów." },
{ id: "k02", cat: "koszty", q: "Ile kosztuje adwokat od rozwodu?",
  a: "Honorarium ustala się indywidualnie, bo rozpiętość pracy między rozwodem zgodnym a sporem o winę i majątek jest wielokrotna. Kancelaria przedstawia pełną kwotę przed podpisaniem umowy. Odrębną wielkością są stawki minimalne zasądzane od strony przegrywającej." },
{ id: "k03", cat: "koszty", q: "Kto płaci koszty rozwodu?",
  a: "Zasadą jest, że koszty ponosi strona przegrywająca. Przy rozwodzie bez orzekania o winie sąd zwykle znosi koszty wzajemnie albo dzieli je po połowie. Przy orzeczeniu winy jednej strony to ona zwraca przeciwnikowi opłatę od pozwu i koszty zastępstwa." },
{ id: "k04", cat: "koszty", q: "Ile kosztuje podział majątku?",
  a: "Opłata sądowa od wniosku o podział majątku wspólnego wynosi 1000 zł, a przy zgodnym projekcie podziału 300 zł. U notariusza koszt zależy od wartości majątku według taksy notarialnej i przy większych majątkach bywa wyższy niż opłata sądowa, ale sprawa kończy się od razu." },
{ id: "k05", cat: "koszty", q: "Czy mogę nie płacić opłaty sądowej?",
  a: "Można złożyć wniosek o zwolnienie od kosztów sądowych wraz z oświadczeniem o stanie rodzinnym, majątku i dochodach na urzędowym formularzu. Sąd zwalnia w całości lub w części, jeżeli wykażesz, że nie jesteś w stanie ponieść kosztów bez uszczerbku dla utrzymania siebie i rodziny." },
{ id: "k06", cat: "koszty", q: "Ile kosztuje opinia biegłych w sprawie o dzieci?",
  a: "Badanie przez opiniodawczy zespół sądowych specjalistów jest dla stron nieodpłatne, gdy zleca je sąd, natomiast opinia biegłego prywatnego albo psychologa powołanego poza zespołem to zwykle koszt od kilkuset do kilku tysięcy złotych, płatny zaliczkowo przez stronę wnioskującą." },
{ id: "k07", cat: "koszty", q: "Czy przegrywający zwraca mi honorarium adwokata w pełnej wysokości?",
  a: "Nie. Sąd zasądza zwrot kosztów zastępstwa procesowego według stawek określonych rozporządzeniem, a nie według twojej faktycznej umowy z kancelarią. Jeżeli honorarium było wyższe niż stawka minimalna, różnicę ponosisz sam." },
{ id: "k08", cat: "koszty", q: "Ile kosztuje sprawa o alimenty?",
  a: "Strona dochodząca alimentów jest zwolniona od kosztów sądowych z mocy ustawy, więc nie płaci opłaty od pozwu. Opłatę ponosi natomiast pozwany w razie przegranej, liczoną od wartości przedmiotu sporu, czyli od sumy świadczeń za rok." },
{ id: "k09", cat: "koszty", q: "Czy pierwsza konsultacja jest płatna?",
  a: "W tej kancelarii pierwsza konsultacja trwająca trzydzieści minut jest bezpłatna. Służy ocenie sytuacji, wskazaniu możliwych scenariuszy i oszacowaniu czasu oraz kosztu sprawy. Nie zastępuje pełnej analizy dokumentów." },
{ id: "k10", cat: "koszty", q: "Czy honorarium można rozłożyć na raty?",
  a: "Tak, kancelaria dopuszcza rozłożenie wynagrodzenia na raty powiązane z etapami sprawy: przygotowanie pozwu, postępowanie przed sądem pierwszej instancji, ewentualna apelacja. Warunki ustala się w umowie przed rozpoczęciem pracy." },
{ id: "k11", cat: "koszty", q: "Ile kosztuje apelacja od wyroku rozwodowego?",
  a: "Opłata od apelacji w sprawie o rozwód wynosi 600 zł. Dochodzi do tego wniosek o uzasadnienie wyroku, którego opłata podlega zaliczeniu na poczet opłaty od apelacji, oraz honorarium pełnomocnika za drugą instancję." },
{ id: "k12", cat: "koszty", q: "Czy koszty rozwodu można odliczyć od podatku?",
  a: "Nie. Wydatki na postępowanie rozwodowe są kosztem prywatnym i nie stanowią kosztu uzyskania przychodu ani nie podlegają odliczeniu od dochodu. Inaczej bywa z wydatkami związanymi z prowadzeniem firmy, jeśli spór dotyczy jej udziałów." },
{ id: "k13", cat: "koszty", q: "Ile kosztuje zabezpieczenie alimentów na czas procesu?",
  a: "Wniosek o zabezpieczenie zgłoszony w pozwie o rozwód nie podlega odrębnej opłacie. Złożony w toku sprawy jako osobne pismo podlega opłacie, chyba że dotyczy alimentów, gdzie działa zwolnienie ustawowe dla strony dochodzącej." },
{ id: "k14", cat: "koszty", q: "Czy muszę płacić za każdą rozprawę osobno?",
  a: "To zależy od modelu rozliczenia. Kancelaria stosuje wynagrodzenie ryczałtowe za prowadzenie sprawy w instancji, co oznacza, że liczba rozpraw nie zmienia ustalonej kwoty. Model godzinowy bywa korzystniejszy tylko przy sprawach bardzo prostych." },
{ id: "k15", cat: "koszty", q: "Ile kosztuje odpis wyroku z klauzulą prawomocności?",
  a: "Opłata kancelaryjna za odpis orzeczenia wynosi 20 zł za każde rozpoczęte dziesięć stron. Pierwszy odpis wyroku doręczany z urzędu jest bezpłatny, ale odpis z klauzulą prawomocności potrzebny do urzędu stanu cywilnego trzeba zamówić osobno." },
{ id: "k16", cat: "koszty", q: "Czy da się przeprowadzić rozwód bez adwokata?",
  a: "Tak, w sprawach rozwodowych nie ma przymusu adwokackiego w pierwszej i drugiej instancji. Samodzielne prowadzenie sprawy bywa rozsądne przy rozwodzie zgodnym, bez dzieci i bez majątku. Przy sporze o winę, dzieci lub nieruchomość ryzyko błędu jest kosztowne i często nieodwracalne." },
{ id: "k17", cat: "koszty", q: "Ile kosztuje mediacja?",
  a: "Przy mediacji ze skierowania sądu w sprawach niemajątkowych wynagrodzenie mediatora jest ustalone rozporządzeniem i wynosi kilkaset złotych za całość postępowania, dzielone zwykle po połowie między strony. Mediacja prywatna rozliczana jest według stawki mediatora." },
{ id: "k18", cat: "koszty", q: "Czy wygrywając rozwód odzyskam wszystkie pieniądze?",
  a: "Nie w całości. Odzyskasz opłatę od pozwu i koszty zastępstwa według stawek minimalnych, jeżeli sąd obciąży nimi drugą stronę. Różnica między stawką minimalną a rzeczywistym honorarium, koszty dojazdów i zaliczki na biegłych zwykle pozostają po twojej stronie." },
{ id: "k19", cat: "koszty", q: "Co składa się na całkowity koszt rozwodu?",
  a: "Cztery pozycje: opłata sądowa od pozwu 600 zł, honorarium adwokata, ewentualne zaliczki na biegłych oraz opłaty kancelaryjne za odpisy. Przy rozwodzie zgodnym realny koszt zamyka się w opłacie i honorarium, przy sporze potrafi wzrosnąć kilkukrotnie." },
{ id: "k20", cat: "koszty", q: "Czy przysługuje mi adwokat z urzędu?",
  a: "Tak, jeżeli wykażesz, że nie jesteś w stanie ponieść kosztów wynagrodzenia adwokata bez uszczerbku dla utrzymania siebie i rodziny. Wniosek składa się w sądzie wraz z oświadczeniem majątkowym na urzędowym formularzu. Sąd wyznacza adwokata przez okręgową radę adwokacką." },

/* ---------- DZIECI — WŁADZA RODZICIELSKA I KONTAKTY (30) ---------- */
{ id: "d01", cat: "dzieci", q: "Czy sąd zawsze zostawia dziecko przy matce?",
  a: "Nie. Prawo nie daje żadnej ze stron pierwszeństwa ze względu na płeć. Sąd bada więź z dzieckiem, dotychczasowe zaangażowanie w opiekę, warunki mieszkaniowe, stabilność i gotowość do współpracy z drugim rodzicem. Praktyka pokazuje jednak, że decyduje głównie to, kto sprawował opiekę na co dzień." },
{ id: "d02", cat: "dzieci", q: "Co to jest plan wychowawczy?",
  a: "To pisemne porozumienie rodziców o sposobie wykonywania władzy rodzicielskiej i utrzymywaniu kontaktów po rozwodzie. Określa miejsce zamieszkania dziecka, harmonogram kontaktów, podział decyzji o zdrowiu, edukacji i wyjazdach oraz zasady komunikacji. Sąd, który je zatwierdzi, zwykle nie ogranicza władzy żadnemu z rodziców." },
{ id: "d03", cat: "dzieci", q: "Czy sąd musi ograniczyć władzę rodzicielską jednemu z rodziców?",
  a: "Nie, jeżeli rodzice przedstawią zgodne porozumienie o sposobie wykonywania władzy rodzicielskiej i sąd uzna je za zgodne z dobrem dziecka. Bez porozumienia sąd rozstrzyga o sposobie wykonywania władzy i może ją ograniczyć jednemu z rodziców do określonych spraw." },
{ id: "d04", cat: "dzieci", q: "Czym jest opieka naprzemienna?",
  a: "To model, w którym dziecko mieszka na przemian u każdego z rodziców przez porównywalne okresy, najczęściej tydzień na tydzień. Wymaga bliskiego zamieszkania rodziców, dobrej komunikacji i wieku dziecka pozwalającego na taką organizację. Sąd rzadko orzeka ją wbrew woli jednego z rodziców." },
{ id: "d05", cat: "dzieci", q: "Czy przy opiece naprzemiennej płaci się alimenty?",
  a: "Tak, jeśli różnica w możliwościach zarobkowych rodziców jest istotna. Podział czasu po połowie nie znosi obowiązku alimentacyjnego, bo alimenty mają wyrównywać poziom życia dziecka u obojga rodziców. Przy zbliżonych dochodach sąd bywa skłonny alimentów nie zasądzać." },
{ id: "d06", cat: "dzieci", q: "Od jakiego wieku sąd pyta dziecko o zdanie?",
  a: "Ustawa nie wskazuje sztywnej granicy. Sąd wysłuchuje dziecka, jeżeli pozwala na to jego rozwój umysłowy, stan zdrowia i stopień dojrzałości, i uwzględnia jego rozsądne życzenia. W praktyce dotyczy to zwykle dzieci powyżej dziesiątego roku życia, a wysłuchanie odbywa się poza salą rozpraw." },
{ id: "d07", cat: "dzieci", q: "Jak wygląda typowy harmonogram kontaktów?",
  a: "Najczęściej spotykany model to co drugi weekend od piątku po szkole do niedzieli wieczorem, jedno popołudnie w tygodniu, połowa ferii i wakacji oraz naprzemienne święta. To punkt wyjścia, który dostosowuje się do wieku dziecka, odległości i grafiku pracy rodziców." },
{ id: "d08", cat: "dzieci", q: "Co zrobić, gdy drugi rodzic nie wydaje dziecka na kontakty?",
  a: "Postępowanie jest dwuetapowe. Najpierw sąd zagrożenie nakazaniem zapłaty określonej sumy pieniężnej za każde naruszenie, a dopiero po kolejnym naruszeniu nakazuje jej zapłatę. Każdy udaremniony kontakt trzeba dokumentować: data, godzina, miejsce i świadkowie." },
{ id: "d09", cat: "dzieci", q: "Czy mogę wyjechać z dzieckiem za granicę bez zgody drugiego rodzica?",
  a: "Nie, jeżeli oboje macie pełnię władzy rodzicielskiej. Wyjazd zagraniczny to istotna sprawa dziecka i wymaga zgody obojga rodziców. Przy odmowie rozstrzyga sąd opiekuńczy. Wyjazd bez zgody może zostać uznany za uprowadzenie rodzicielskie." },
{ id: "d10", cat: "dzieci", q: "Czy mogę zmienić dziecku szkołę bez zgody byłego małżonka?",
  a: "Wybór szkoły należy do istotnych spraw dziecka, więc przy pełnej władzy rodzicielskiej obojga rodziców wymaga zgody drugiej strony. Przy braku porozumienia rozstrzyga sąd opiekuńczy na wniosek jednego z rodziców." },
{ id: "d11", cat: "dzieci", q: "Czy sąd może zabrać mi władzę rodzicielską?",
  a: "Pozbawienie władzy rodzicielskiej jest środkiem ostatecznym i wymaga trwałej przeszkody w jej wykonywaniu, nadużywania władzy albo rażącego zaniedbywania obowiązków. Sam rozwód, konflikt z byłym małżonkiem czy zamieszkanie osobno nie są podstawą do pozbawienia władzy." },
{ id: "d12", cat: "dzieci", q: "Czym różni się ograniczenie od pozbawienia władzy rodzicielskiej?",
  a: "Ograniczenie zawęża zakres decyzji rodzica, zwykle do współdecydowania o istotnych sprawach jak leczenie, edukacja czy wyjazdy, i jest standardem przy braku porozumienia. Pozbawienie odbiera władzę w całości i stosuje się je tylko w razie poważnych nieprawidłowości." },
{ id: "d13", cat: "dzieci", q: "Czy babcia i dziadek mają prawo do kontaktów z wnukiem?",
  a: "Tak. Prawo do kontaktów z dzieckiem przysługuje także dziadkom oraz rodzeństwu i innym osobom, które sprawowały nad dzieckiem pieczę przez dłuższy czas. Wniosek składa się do sądu rejonowego, wydziału rodzinnego, właściwego dla miejsca zamieszkania dziecka." },
{ id: "d14", cat: "dzieci", q: "Kto decyduje o miejscu zamieszkania dziecka?",
  a: "Sąd w wyroku rozwodowym określa miejsce zamieszkania dziecka jako miejsce zamieszkania jednego z rodziców. Nie oznacza to odebrania władzy drugiemu — chodzi o adres, pod którym dziecko przebywa na stałe i który decyduje o rejonizacji szkoły oraz świadczeniach." },
{ id: "d15", cat: "dzieci", q: "Czy można zmienić orzeczenie o kontaktach po latach?",
  a: "Tak. Orzeczenia dotyczące dzieci nie mają powagi rzeczy osądzonej w klasycznym rozumieniu — w razie zmiany okoliczności sąd opiekuńczy może je zmienić na wniosek rodzica. Typowe powody to dorastanie dziecka, przeprowadzka albo zmiana grafiku pracy." },
{ id: "d16", cat: "dzieci", q: "Czy dziecko może odmówić kontaktu z rodzicem?",
  a: "Formalnie orzeczenie o kontaktach wiąże rodziców, nie dziecko. W praktyce opór starszego dziecka sąd bierze pod uwagę, badając jednocześnie, czy nie jest on skutkiem negatywnego nastawiania przez drugiego rodzica. Bierne przyzwolenie na odmowę bywa uznane za utrudnianie kontaktów." },
{ id: "d17", cat: "dzieci", q: "Co to jest opiniodawczy zespół sądowych specjalistów?",
  a: "To zespół psychologów i pedagogów przy sądzie okręgowym, który na zlecenie sądu bada rodzinę i wydaje opinię o więziach dziecka z rodzicami oraz o ich kompetencjach wychowawczych. Badanie trwa zwykle jeden dzień, a na samą opinię czeka się od kilku do kilkunastu miesięcy." },
{ id: "d18", cat: "dzieci", q: "Jak przygotować się do badania w zespole specjalistów?",
  a: "Przyjdź wypoczęta, punktualnie, z dokumentacją dotyczącą dziecka. Nie instruuj dziecka, co ma mówić — specjaliści to rozpoznają i wpłynie to negatywnie na ocenę twoich kompetencji. Mów o dziecku, nie o winach byłego małżonka." },
{ id: "d19", cat: "dzieci", q: "Czy nowy partner może być obecny podczas kontaktów?",
  a: "Co do zasady tak, chyba że sąd zastrzegł inaczej albo obecność tej osoby zagraża dobru dziecka. Konflikt między byłym małżonkiem a nowym partnerem nie jest sam w sobie podstawą do zakazu, ale bywa argumentem za stopniowym wprowadzaniem tej osoby w życie dziecka." },
{ id: "d20", cat: "dzieci", q: "Czy sąd rozdziela rodzeństwo?",
  a: "Bardzo rzadko i tylko wtedy, gdy przemawia za tym szczególny wzgląd na dobro któregoś z dzieci. Zasadą jest utrzymanie rodzeństwa razem, bo więź między dziećmi traktowana jest jako istotna wartość, zwłaszcza w sytuacji rozpadu rodziny." },
{ id: "d21", cat: "dzieci", q: "Kto odbiera dziecko na kontakty i kto ponosi koszty dojazdu?",
  a: "Sąd zwykle wskazuje, że rodzic uprawniony odbiera dziecko z miejsca zamieszkania i tam je odwozi, ponosząc koszty dojazdu. Przy dużej odległości spotyka się podział trasy albo naprzemienne przejazdy. Warto uregulować to precyzyjnie w porozumieniu." },
{ id: "d22", cat: "dzieci", q: "Co zrobić, gdy rodzic nie odbiera dziecka mimo ustalonych kontaktów?",
  a: "Kontakty są zarówno prawem, jak i obowiązkiem rodzica. Systematyczne nieodbieranie dziecka można zgłosić do sądu opiekuńczego jako podstawę zmiany orzeczenia. Można też domagać się zwrotu wydatków poniesionych w związku z przygotowanym kontaktem, który się nie odbył." },
{ id: "d23", cat: "dzieci", q: "Czy muszę informować byłego małżonka o leczeniu dziecka?",
  a: "Tak, jeżeli zachowuje on władzę rodzicielską. Istotne decyzje medyczne, jak zabieg operacyjny czy rozpoczęcie terapii, wymagają zgody obojga rodziców. Doraźna wizyta u lekarza przy infekcji mieści się w bieżącej pieczy i zgody nie wymaga." },
{ id: "d24", cat: "dzieci", q: "Czy przy rozwodzie trzeba osobno wnosić o alimenty na dziecko?",
  a: "Nie. Sąd rozwodowy orzeka o alimentach na wspólne małoletnie dzieci z urzędu, nawet bez wniosku. Warto jednak wskazać w pozwie żądaną kwotę i udokumentować koszty utrzymania dziecka, bo sąd orzeka na podstawie przedstawionego materiału." },
{ id: "d25", cat: "dzieci", q: "Jak udokumentować koszty utrzymania dziecka?",
  a: "Zestawieniem miesięcznych wydatków popartym dowodami: czynsz i media w części przypadającej na dziecko, żywność, odzież, przedszkole lub szkoła, zajęcia dodatkowe, leczenie, wypoczynek. Rachunki z kilku reprezentatywnych miesięcy są bardziej przekonujące niż jedno oświadczenie." },
{ id: "d26", cat: "dzieci", q: "Czy dziecko z poprzedniego związku wpływa na alimenty?",
  a: "Tak. Sąd bierze pod uwagę wszystkie osoby, wobec których zobowiązany ma obowiązek alimentacyjny, i rozdziela jego możliwości zarobkowe. Pojawienie się kolejnego dziecka bywa podstawą wniosku o obniżenie alimentów, choć samo w sobie nie przesądza sprawy." },
{ id: "d27", cat: "dzieci", q: "Czy rodzic pozbawiony władzy rodzicielskiej płaci alimenty?",
  a: "Tak. Obowiązek alimentacyjny wynika z pokrewieństwa, a nie z władzy rodzicielskiej, więc jej ograniczenie ani pozbawienie go nie znosi. Podobnie zakaz kontaktów nie zwalnia z płacenia na dziecko." },
{ id: "d28", cat: "dzieci", q: "Co to jest piecza naprzemienna a co opieka wspólna?",
  a: "Piecza naprzemienna dotyczy fizycznego podziału czasu, w którym dziecko przebywa u każdego z rodziców. Wspólne wykonywanie władzy rodzicielskiej dotyczy decyzji o dziecku i jest możliwe także wtedy, gdy dziecko mieszka głównie u jednego rodzica. To dwie niezależne kwestie." },
{ id: "d29", cat: "dzieci", q: "Czy mogę zapisać dziecko na terapię bez zgody drugiego rodzica?",
  a: "Rozpoczęcie psychoterapii to istotna sprawa dziecka, więc przy pełnej władzy obojga rodziców wymaga zgody drugiej strony. Przy jej braku decyduje sąd opiekuńczy. Wyjątkiem są sytuacje nagłe, gdy zwłoka zagrażałaby zdrowiu dziecka." },
{ id: "d30", cat: "dzieci", q: "Jak rozmawiać z dzieckiem o rozwodzie?",
  a: "Najlepiej wspólnie, krótko i bez obwiniania drugiego rodzica, z jasnym przekazem, że decyzja dotyczy dorosłych i że dziecko nie ponosi za nią odpowiedzialności. Dziecko potrzebuje konkretów: gdzie będzie mieszkać, kiedy zobaczy drugiego rodzica i co się nie zmieni." },

/* ---------- ALIMENTY (25) ---------- */
{ id: "a01", cat: "alimenty", q: "Od czego zależy wysokość alimentów na dziecko?",
  a: "Od dwóch wielkości: usprawiedliwionych potrzeb dziecka oraz zarobkowych i majątkowych możliwości zobowiązanego. Sąd bada nie tyle faktyczne dochody, co zdolność do ich osiągania — celowe zwolnienie się z pracy albo przejście na niższe wynagrodzenie nie obniża alimentów." },
{ id: "a02", cat: "alimenty", q: "Czy istnieje tabela alimentów albo stawki minimalne?",
  a: "Nie ma ustawowej tabeli ani kwoty minimalnej. Każdą sprawę sąd ocenia indywidualnie na podstawie udokumentowanych kosztów utrzymania dziecka i sytuacji rodziców. Kwoty spotykane w warszawskich sądach są zróżnicowane i zależą przede wszystkim od wykazanych wydatków." },
{ id: "a03", cat: "alimenty", q: "Czy alimenty obejmują tylko jedzenie i ubranie?",
  a: "Nie. Usprawiedliwione potrzeby obejmują także udział dziecka w kosztach mieszkania i mediów, przedszkole lub szkołę, zajęcia dodatkowe, leczenie, wypoczynek i rozrywkę odpowiednią do wieku. Zakres potrzeb rośnie wraz z możliwościami finansowymi rodziców." },
{ id: "a04", cat: "alimenty", q: "Do kiedy płaci się alimenty na dziecko?",
  a: "Obowiązek nie kończy się z osiemnastymi urodzinami. Trwa, dopóki dziecko nie jest w stanie utrzymać się samodzielnie, co przy kontynuowaniu nauki oznacza często okres studiów. Rodzic może uchylić się od świadczeń, gdy dorosłe dziecko nie dokłada starań, by się usamodzielnić." },
{ id: "a05", cat: "alimenty", q: "Jak uzyskać alimenty na czas trwania sprawy rozwodowej?",
  a: "Przez wniosek o zabezpieczenie roszczenia, złożony w pozwie albo w toku sprawy. Sąd rozpoznaje go zwykle w ciągu kilku tygodni, przed wyrokiem. Postanowienie jest natychmiast wykonalne i stanowi tytuł do egzekucji komorniczej." },
{ id: "a06", cat: "alimenty", q: "Czy mogę żądać alimentów dla siebie po rozwodzie?",
  a: "Tak, jeżeli nie zostałeś uznany za wyłącznie winnego rozkładu pożycia i znajdujesz się w niedostatku. Gdy drugi małżonek został uznany za wyłącznie winnego, wystarczy wykazać istotne pogorszenie twojej sytuacji materialnej wskutek rozwodu — niedostatek nie jest wtedy wymagany." },
{ id: "a07", cat: "alimenty", q: "Jak długo płaci się alimenty na byłego małżonka?",
  a: "Gdy zobowiązany nie został uznany za winnego, obowiązek wygasa po pięciu latach od orzeczenia rozwodu, chyba że sąd ze względu na wyjątkowe okoliczności przedłuży ten termin. Gdy zobowiązany jest wyłącznie winny, ograniczenia czasowego nie ma." },
{ id: "a08", cat: "alimenty", q: "Kiedy wygasa obowiązek alimentacyjny wobec byłego małżonka?",
  a: "Zawsze z chwilą zawarcia przez uprawnionego nowego małżeństwa. Poza tym wygasa z upływem pięciu lat, gdy zobowiązany nie był winny, oraz w razie ustania przesłanek, na przykład gdy uprawniony przestaje być w niedostatku." },
{ id: "a09", cat: "alimenty", q: "Czy konkubinat byłego małżonka znosi alimenty?",
  a: "Formalnie obowiązek wygasa dopiero przy zawarciu nowego małżeństwa, nie przy nieformalnym związku. Wspólne pożycie z nowym partnerem bywa jednak podstawą wniosku o uchylenie alimentów, jeżeli realnie poprawiło sytuację materialną uprawnionego i ustał stan niedostatku." },
{ id: "a10", cat: "alimenty", q: "Jak podwyższyć alimenty?",
  a: "Przez pozew o podwyższenie alimentów do sądu rejonowego właściwego dla miejsca zamieszkania dziecka. Trzeba wykazać zmianę okoliczności od poprzedniego orzeczenia: wzrost kosztów utrzymania dziecka albo poprawę sytuacji zobowiązanego. Strona dochodząca alimentów jest zwolniona od opłaty." },
{ id: "a11", cat: "alimenty", q: "Jak obniżyć alimenty?",
  a: "Przez pozew o obniżenie alimentów, w którym wykazujesz istotną zmianę okoliczności: utratę pracy nie ze swojej winy, chorobę, pojawienie się kolejnego dziecka. Dobrowolne pogorszenie własnej sytuacji, na przykład rezygnacja z pracy, nie jest podstawą do obniżenia." },
{ id: "a12", cat: "alimenty", q: "Co zrobić, gdy alimenty nie są płacone?",
  a: "Z wyrokiem lub postanowieniem o zabezpieczeniu, zaopatrzonym w klauzulę wykonalności, składasz wniosek egzekucyjny do komornika. Komornik zajmuje wynagrodzenie, rachunki i świadczenia. W sprawach alimentacyjnych obowiązują korzystniejsze zasady zajęcia wynagrodzenia niż przy zwykłych długach." },
{ id: "a13", cat: "alimenty", q: "Czy niepłacenie alimentów to przestępstwo?",
  a: "Tak. Uchylanie się od obowiązku alimentacyjnego, gdy zaległość odpowiada równowartości co najmniej trzech świadczeń okresowych, jest przestępstwem. Zawiadomienie składa się na policji lub w prokuraturze, dołączając wyrok i dowody bezskutecznej egzekucji." },
{ id: "a14", cat: "alimenty", q: "Czym jest fundusz alimentacyjny?",
  a: "To świadczenie wypłacane przez gminę, gdy egzekucja alimentów okazała się bezskuteczna. Przysługuje po spełnieniu kryterium dochodowego i ma ustawowy limit kwotowy na dziecko. Wniosek składa się w ośrodku pomocy społecznej wraz z zaświadczeniem od komornika." },
{ id: "a15", cat: "alimenty", q: "Czy alimenty są opodatkowane?",
  a: "Alimenty na rzecz dzieci do dwudziestego piątego roku życia są zwolnione z podatku dochodowego w całości. Alimenty na rzecz innych osób, w tym byłego małżonka, są zwolnione do ustawowego limitu rocznego, a nadwyżka podlega opodatkowaniu." },
{ id: "a16", cat: "alimenty", q: "Czy mogę płacić alimenty do ręki?",
  a: "Można, ale to ryzykowne dowodowo. Bez pokwitowania nie udowodnisz zapłaty w razie egzekucji. Bezpieczny jest przelew na rachunek z tytułem wskazującym miesiąc, którego dotyczy, na przykład alimenty za wrzesień 2026." },
{ id: "a17", cat: "alimenty", q: "Czy alimenty można potrącić z innych rozliczeń?",
  a: "Nie. Wierzytelności alimentacyjnych nie można potrącać z innymi roszczeniami wobec uprawnionego. Nawet jeżeli były małżonek jest ci winien pieniądze z innego tytułu, alimenty trzeba płacić w pełnej wysokości." },
{ id: "a18", cat: "alimenty", q: "Od kiedy sąd zasądza alimenty — od pozwu czy od wyroku?",
  a: "Zwykle od dnia wniesienia pozwu, a przy zabezpieczeniu od daty wskazanej w postanowieniu. Można żądać alimentów także za okres wsteczny, jeżeli pozostały niezaspokojone potrzeby lub zobowiązania zaciągnięte na utrzymanie dziecka." },
{ id: "a19", cat: "alimenty", q: "Czy alimenty wzrastają automatycznie z inflacją?",
  a: "Nie. Polskie sądy zasądzają kwoty stałe, bez klauzuli waloryzacyjnej. Wzrost kosztów utrzymania trzeba przełożyć na pozew o podwyższenie alimentów. Dlatego przy dłuższej perspektywie warto co kilka lat weryfikować wysokość świadczenia." },
{ id: "a20", cat: "alimenty", q: "Czy 800 plus wpływa na wysokość alimentów?",
  a: "Nie. Świadczenia wychowawcze i rodzinne nie są wliczane do dochodu rodzica przy ustalaniu alimentów ani nie zmniejszają zakresu obowiązku alimentacyjnego drugiego rodzica. Ustawa wprost tak stanowi." },
{ id: "a21", cat: "alimenty", q: "Czy zobowiązany może płacić w naturze zamiast pieniędzy?",
  a: "Obowiązek alimentacyjny wobec dziecka może być częściowo wykonywany przez osobiste starania o jego utrzymanie i wychowanie. Sąd bierze to pod uwagę przy rodzicu sprawującym opiekę. Rodzic mieszkający osobno realizuje obowiązek zasadniczo w pieniądzu." },
{ id: "a22", cat: "alimenty", q: "Jakich dokumentów potrzebuję do sprawy o alimenty?",
  a: "Odpisu aktu urodzenia dziecka, zestawienia miesięcznych kosztów jego utrzymania wraz z rachunkami, zaświadczenia o własnych dochodach oraz wszelkich informacji o dochodach i majątku zobowiązanego. Przydają się też dowody wydatków nadzwyczajnych, jak leczenie czy korepetycje." },
{ id: "a23", cat: "alimenty", q: "Czy sąd sprawdzi rzeczywiste dochody byłego małżonka?",
  a: "Sąd może zwrócić się do urzędu skarbowego, Zakładu Ubezpieczeń Społecznych i pracodawcy, a także zobowiązać stronę do przedstawienia wyciągów z rachunków. Przy działalności gospodarczej sąd ocenia możliwości zarobkowe, a nie tylko wykazany dochód." },
{ id: "a24", cat: "alimenty", q: "Czy alimenty przedawniają się?",
  a: "Roszczenia o świadczenia alimentacyjne przedawniają się z upływem trzech lat. Bieg przedawnienia wobec dziecka nie rozpoczyna się jednak i nie biegnie przez czas trwania władzy rodzicielskiej rodzica zobowiązanego. Zaległości warto egzekwować bez zwłoki." },
{ id: "a25", cat: "alimenty", q: "Czy dorosłe dziecko może samo pozwać o alimenty?",
  a: "Tak. Po ukończeniu osiemnastu lat dziecko samodzielnie występuje z pozwem o alimenty albo o ich podwyższenie i samo jest stroną postępowania. Rodzic, który dotąd je reprezentował, przestaje być przedstawicielem ustawowym." },

/* ---------- MAJĄTEK, MIESZKANIE I KREDYT (30) ---------- */
{ id: "m01", cat: "majatek", q: "Co wchodzi do majątku wspólnego?",
  a: "Wszystko, co małżonkowie nabyli w czasie trwania wspólności: wynagrodzenie za pracę, dochody z działalności, nieruchomości kupione w małżeństwie, oszczędności, samochody. Do majątku osobistego należy to, co nabyte przed ślubem, z darowizny lub spadku oraz przedmioty osobistego użytku." },
{ id: "m02", cat: "majatek", q: "Czy mieszkanie kupione przed ślubem podlega podziałowi?",
  a: "Nie, należy do majątku osobistego tego małżonka, który je nabył. Podziałowi mogą jednak podlegać nakłady poczynione z majątku wspólnego na tę nieruchomość, na przykład spłata kredytu albo remont finansowany ze wspólnych dochodów w czasie małżeństwa." },
{ id: "m03", cat: "majatek", q: "Czy udziały w majątku wspólnym są zawsze równe?",
  a: "Zasadą są udziały równe, niezależnie od tego, kto ile zarabiał. Ustalenia nierównych udziałów można żądać wyjątkowo, przy ważnych powodach i różnym stopniu przyczynienia się do powstania majątku. Sama różnica zarobków to za mało — potrzebne jest naganne zachowanie, na przykład trwonienie majątku." },
{ id: "m04", cat: "majatek", q: "Kiedy można podzielić majątek?",
  a: "Dopiero po ustaniu wspólności majątkowej, czyli zwykle po uprawomocnieniu się wyroku rozwodowego. Wcześniej możliwe jest ustanowienie rozdzielności majątkowej umową u notariusza albo wyrokiem sądu, i dopiero wtedy podział." },
{ id: "m05", cat: "majatek", q: "Czy podział majątku ma termin przedawnienia?",
  a: "Roszczenie o podział majątku wspólnego nie przedawnia się — można go dokonać także wiele lat po rozwodzie. Zwłoka jest jednak ryzykowna: nieruchomości zmieniają wartość, dokumenty giną, a druga strona może zaciągnąć zobowiązania obciążające wspólny składnik." },
{ id: "m06", cat: "majatek", q: "Co zrobić ze wspólnym mieszkaniem po rozwodzie?",
  a: "Trzy typowe scenariusze: sprzedaż i podział ceny, przyznanie mieszkania jednemu małżonkowi ze spłatą drugiego, albo pozostawienie współwłasności. Pierwszy jest najczystszy finansowo, drugi wymaga zdolności kredytowej, trzeci zwykle tylko odracza konflikt." },
{ id: "m07", cat: "majatek", q: "Co dzieje się ze wspólnym kredytem hipotecznym po rozwodzie?",
  a: "Wyrok rozwodowy nie zmienia umowy z bankiem — oboje pozostajecie dłużnikami solidarnymi. Bank może żądać całej raty od każdego z was niezależnie od tego, co ustalił sąd. Uwolnienie jednego małżonka wymaga zgody banku na przejęcie długu lub refinansowania kredytu." },
{ id: "m08", cat: "majatek", q: "Czy sąd może podzielić kredyt między małżonków?",
  a: "Sąd dzieli aktywa, a nie zobowiązania wobec banku. Może natomiast uwzględnić obciążenie hipoteczne przy wycenie nieruchomości oraz rozliczyć raty spłacone przez jednego małżonka po ustaniu wspólności. Wobec banku nadal odpowiadacie oboje." },
{ id: "m09", cat: "majatek", q: "Jak wyjść z kredytu wspólnego z byłym małżonkiem?",
  a: "Realne są trzy drogi: sprzedaż nieruchomości i spłata kredytu, przejęcie długu przez jednego małżonka za zgodą banku po badaniu zdolności kredytowej, albo refinansowanie kredytu nowym zobowiązaniem zaciągniętym samodzielnie. Każda wymaga współpracy banku." },
{ id: "m10", cat: "majatek", q: "Kto płaci ratę kredytu w trakcie sprawy rozwodowej?",
  a: "Wobec banku oboje, solidarnie. Małżonek, który po ustaniu wspólności spłacał raty samodzielnie, może żądać rozliczenia połowy tych wpłat w sprawie o podział majątku. Dlatego warto zachować potwierdzenia wszystkich przelewów." },
{ id: "m11", cat: "majatek", q: "Czy firma małżonka podlega podziałowi?",
  a: "Jeżeli przedsiębiorstwo powstało w trakcie małżeństwa ze środków wspólnych, jego wartość wchodzi do majątku wspólnego. Sąd zwykle przyznaje firmę temu małżonkowi, który ją prowadzi, i zasądza spłatę na rzecz drugiego, po wycenie przez biegłego." },
{ id: "m12", cat: "majatek", q: "Czy dziedziczone mieszkanie wejdzie do podziału?",
  a: "Nie. Przedmioty nabyte przez dziedziczenie, zapis lub darowiznę należą do majątku osobistego, chyba że spadkodawca albo darczyńca postanowił inaczej. Podziałowi podlegają jedynie nakłady z majątku wspólnego poczynione na taką nieruchomość." },
{ id: "m13", cat: "majatek", q: "Co to jest rozdzielność majątkowa i kiedy warto ją ustanowić?",
  a: "To ustrój, w którym każdy z małżonków ma wyłącznie majątek osobisty. Ustanawia się ją umową u notariusza albo wyrokiem sądu, gdy zgody brak. Warto rozważyć, gdy jeden małżonek prowadzi ryzykowną działalność albo zaciąga zobowiązania bez porozumienia." },
{ id: "m14", cat: "majatek", q: "Czy rozdzielność majątkowa działa wstecz?",
  a: "Umowna rozdzielność działa od dnia jej zawarcia. Sąd może ustanowić rozdzielność z datą wcześniejszą niż dzień wytoczenia powództwa, ale tylko w wyjątkowych wypadkach, na przykład gdy małżonkowie żyli w rozłączeniu. Jest to rozwiązanie stosowane rzadko." },
{ id: "m15", cat: "majatek", q: "Czy mogę sprzedać wspólne mieszkanie bez zgody małżonka?",
  a: "Nie. Rozporządzenie nieruchomością wchodzącą do majątku wspólnego wymaga zgody drugiego małżonka. Umowa zawarta bez tej zgody jest bezskuteczna, dopóki małżonek jej nie potwierdzi. Po ustaniu wspólności potrzebna jest zgoda współwłaściciela." },
{ id: "m16", cat: "majatek", q: "Ile kosztuje wycena nieruchomości przez biegłego?",
  a: "Opinia rzeczoznawcy majątkowego w sprawie o podział majątku to zwykle wydatek rzędu od tysiąca do kilku tysięcy złotych, płatny zaliczkowo. Przy sporze o wartość każda ze stron może zgłaszać zarzuty do opinii, co generuje koszty opinii uzupełniającej." },
{ id: "m17", cat: "majatek", q: "Według jakiej daty wycenia się majątek?",
  a: "Skład majątku wspólnego ustala się według stanu na chwilę ustania wspólności, a wartość według cen z chwili orzekania o podziale. Oznacza to, że wzrost cen nieruchomości między rozwodem a podziałem działa na korzyść obojga po równo." },
{ id: "m18", cat: "majatek", q: "Czy oszczędności na koncie małżonka podlegają podziałowi?",
  a: "Tak, jeżeli pochodzą z dochodów uzyskanych w czasie trwania wspólności. Rachunek prowadzony na jedno nazwisko nie czyni środków majątkiem osobistym. Wypłata dużych kwot tuż przed rozwodem podlega rozliczeniu jako uszczuplenie majątku wspólnego." },
{ id: "m19", cat: "majatek", q: "Co jeśli małżonek ukrywa majątek?",
  a: "Sąd może zażądać wyjaśnień, zwrócić się do banków, urzędu skarbowego i Krajowego Rejestru Sądowego, a także przesłuchać strony pod rygorem odpowiedzialności karnej za fałszywe zeznania. Celowe wyzbycie się składników majątku bywa rozliczane tak, jakby nadal do majątku należały." },
{ id: "m20", cat: "majatek", q: "Czy podział majątku u notariusza jest tańszy niż w sądzie?",
  a: "Przy większych majątkach taksa notarialna bywa wyższa niż opłata sądowa wynosząca 1000 zł, ale sprawa kończy się w jeden dzień zamiast po latach. Warunkiem jest pełna zgoda co do składu, wartości i sposobu podziału. Bez zgody droga notarialna jest zamknięta." },
{ id: "m21", cat: "majatek", q: "Co z samochodem w leasingu?",
  a: "Przedmiot leasingu pozostaje własnością finansującego, więc nie wchodzi do majątku wspólnego. Podziałowi podlegać mogą prawa z umowy leasingu i wpłacone raty, a po wykupie także samo auto, jeżeli wykup nastąpił ze środków wspólnych." },
{ id: "m22", cat: "majatek", q: "Czy nakłady na dom teściów można odzyskać?",
  a: "Tak, przez roszczenie o zwrot nakładów albo o bezpodstawne wzbogacenie, kierowane przeciwko właścicielom nieruchomości, a nie przeciwko małżonkowi. To odrębna sprawa od podziału majątku i wymaga udokumentowania poniesionych wydatków." },
{ id: "m23", cat: "majatek", q: "Kto odpowiada za długi zaciągnięte przez małżonka?",
  a: "Za zobowiązanie zaciągnięte bez zgody drugiego małżonka wierzyciel może sięgnąć jedynie do majątku osobistego dłużnika oraz do jego wynagrodzenia. Zgoda małżonka wyrażona przy zaciąganiu długu otwiera drogę do egzekucji z majątku wspólnego." },
{ id: "m24", cat: "majatek", q: "Czy mieszkanie kupione ze środków przedmałżeńskich jest wspólne?",
  a: "Jeżeli w całości sfinansowano je ze środków osobistych, pozostaje majątkiem osobistym na zasadzie surogacji, ale trzeba to udowodnić dokumentami. Przy finansowaniu mieszanym powstaje współwłasność w częściach odpowiadających wkładom, co bywa źródłem sporu." },
{ id: "m25", cat: "majatek", q: "Czy PPK i środki emerytalne dzieli się przy rozwodzie?",
  a: "Środki zgromadzone na rachunku pracowniczego planu kapitałowego oraz w otwartym funduszu emerytalnym, w części przypadającej na okres trwania wspólności, podlegają podziałowi. Realizuje się to przez wypłatę transferową albo rozliczenie wartości w ramach podziału." },
{ id: "m26", cat: "majatek", q: "Co z mieszkaniem wynajmowanym przez małżonków?",
  a: "Małżonkowie są najemcami wspólnie, jeżeli lokal służył zaspokojeniu potrzeb rodziny, niezależnie od tego, kto podpisał umowę. Sąd w wyroku rozwodowym może orzec o sposobie korzystania z takiego mieszkania na czas wspólnego w nim zamieszkiwania." },
{ id: "m27", cat: "majatek", q: "Czy sąd może nakazać małżonkowi wyprowadzkę?",
  a: "Tak. W wyjątkowych wypadkach, gdy jeden z małżonków swoim rażąco nagannym postępowaniem uniemożliwia wspólne zamieszkiwanie, sąd może w wyroku rozwodowym nakazać jego eksmisję na żądanie drugiego małżonka. Dotyczy to sytuacji poważnych, zwykle związanych z przemocą." },
{ id: "m28", cat: "majatek", q: "Czy przy podziale majątku płaci się podatek?",
  a: "Podział majątku wspólnego po ustaniu wspólności małżeńskiej nie podlega podatkowi od czynności cywilnoprawnych ani podatkowi dochodowemu, o ile mieści się w wartości udziału. Spłata przekraczająca udział może rodzić skutki podatkowe — warto to sprawdzić przed podpisaniem." },
{ id: "m29", cat: "majatek", q: "Czy mogę żądać rozliczenia opieki nad dziećmi przy podziale majątku?",
  a: "Nie w ramach podziału majątku. Osobiste starania o wychowanie dzieci uwzględnia się przy obowiązku alimentacyjnym oraz wyjątkowo przy ustalaniu nierównych udziałów, jeżeli tłumaczą mniejszy wkład finansowy jednego z małżonków." },
{ id: "m30", cat: "majatek", q: "Od czego zacząć porządkowanie spraw majątkowych?",
  a: "Od spisu: nieruchomości z numerami ksiąg wieczystych, rachunki bankowe, kredyty z saldem, pojazdy, polisy, udziały w spółkach, środki emerytalne. Do tego dokumenty źródłowe pokazujące, kiedy i z jakich środków każdy składnik nabyto. Ten spis przesądza o przebiegu całej sprawy." },

/* ---------- SEPARACJA I UNIEWAŻNIENIE (10) ---------- */
{ id: "s01", cat: "separacja", q: "Kiedy warto wybrać separację zamiast rozwodu?",
  a: "Gdy istnieje realna szansa na pojednanie, gdy przeszkodą są przekonania religijne albo gdy zależy ci na zachowaniu uprawnień wynikających z małżeństwa, na przykład w zakresie dziedziczenia. Separacja porządkuje sytuację majątkową, nie zamykając drogi powrotnej." },
{ id: "s02", cat: "separacja", q: "Czym separacja różni się od rozwodu w skutkach?",
  a: "Separacja nie pozwala zawrzeć nowego małżeństwa i nie znosi wzajemnego obowiązku pomocy. Zachowany zostaje krąg dziedziczenia ustawowego, chyba że sąd orzekł inaczej. Podobnie jak rozwód, separacja powoduje ustanie wspólności majątkowej." },
{ id: "s03", cat: "separacja", q: "Czy separację można znieść?",
  a: "Tak, na zgodne żądanie obojga małżonków sąd orzeka zniesienie separacji. Z tą chwilą ustają jej skutki, a małżeństwo wraca do normalnego funkcjonowania. Ustrój majątkowy nie wraca jednak automatycznie do wspólności — trzeba go ustanowić osobno." },
{ id: "s04", cat: "separacja", q: "Ile kosztuje separacja?",
  a: "Przy zgodnym wniosku obojga małżonków, gdy nie mają wspólnych małoletnich dzieci, opłata wynosi 100 zł i sprawę rozpoznaje sąd w trybie nieprocesowym. Pozew o separację przy braku zgody podlega opłacie 600 zł, tak jak pozew o rozwód." },
{ id: "s05", cat: "separacja", q: "Czy przy separacji orzeka się o winie?",
  a: "Tak, na tych samych zasadach co przy rozwodzie. Na zgodny wniosek małżonków sąd zaniechuje orzekania o winie. Przy separacji wystarczy wykazać zupełny rozkład pożycia — trwałość nie jest wymagana, co odróżnia ją od rozwodu." },
{ id: "s06", cat: "separacja", q: "Czy separacja sądowa to to samo co rozstanie?",
  a: "Nie. Separacja faktyczna to po prostu osobne życie i nie wywołuje skutków prawnych — wspólność majątkowa trwa nadal. Separacja sądowa to orzeczenie sądu, które ustanawia rozdzielność majątkową i reguluje sprawy dzieci." },
{ id: "s07", cat: "separacja", q: "Czy w trakcie separacji mogę wnieść o rozwód?",
  a: "Tak. Orzeczona separacja nie blokuje późniejszego pozwu o rozwód, a wręcz ułatwia wykazanie trwałości rozkładu pożycia. Jeżeli jeden małżonek żąda rozwodu, a drugi separacji, sąd co do zasady orzeka rozwód, o ile jest dopuszczalny." },
{ id: "s08", cat: "separacja", q: "Na czym polega unieważnienie małżeństwa?",
  a: "To stwierdzenie, że małżeństwo od początku nie powinno było zostać zawarte z powodu przeszkody istniejącej w chwili ślubu: bigamii, pokrewieństwa, ubezwłasnowolnienia całkowitego, choroby psychicznej czy wady oświadczenia. To postępowanie zupełnie inne niż rozwód." },
{ id: "s09", cat: "separacja", q: "Czy unieważnienie małżeństwa wpływa na dzieci?",
  a: "Nie w zakresie ich pochodzenia i praw. Dzieci z małżeństwa unieważnionego zachowują status dzieci pochodzących z małżeństwa, a do władzy rodzicielskiej, kontaktów i alimentów stosuje się odpowiednio przepisy o rozwodzie." },
{ id: "s10", cat: "separacja", q: "Czy separacja chroni mnie przed długami małżonka?",
  a: "Tak, od chwili orzeczenia. Separacja powoduje powstanie rozdzielności majątkowej, więc zobowiązania zaciągane później przez małżonka nie obciążają twojego majątku. Nie działa jednak wstecz wobec długów powstałych wcześniej." },

/* ---------- SPRAWY Z ELEMENTEM ZAGRANICZNYM (10) ---------- */
{ id: "z01", cat: "zagranica", q: "Czy mogę się rozwieść w Polsce, mieszkając za granicą?",
  a: "Tak, jeżeli zachodzi jedna z podstaw jurysdykcji, na przykład oboje małżonkowie są obywatelami polskimi albo w Polsce znajdowało się ostatnie wspólne miejsce zamieszkania i jedno z was nadal tam mieszka. Sprawę można prowadzić przez pełnomocnika, bez stałych przyjazdów." },
{ id: "z02", cat: "zagranica", q: "Czy rozwód orzeczony za granicą jest ważny w Polsce?",
  a: "Orzeczenia z państw Unii Europejskiej, poza Danią, są uznawane z mocy prawa i wystarczy złożyć je w urzędzie stanu cywilnego wraz z odpowiednim świadectwem. Orzeczenia spoza Unii wymagają zwykle postępowania o uznanie przed sądem okręgowym." },
{ id: "z03", cat: "zagranica", q: "Jak wpisać zagraniczny wyrok rozwodowy do polskich akt?",
  a: "Wniosek składa się do kierownika urzędu stanu cywilnego, dołączając odpis orzeczenia z klauzulą prawomocności, tłumaczenie przysięgłe oraz świadectwo przewidziane rozporządzeniem unijnym. Po wpisaniu wzmianki polski akt małżeństwa odzwierciedla rozwód." },
{ id: "z04", cat: "zagranica", q: "Które prawo stosuje sąd przy małżeństwie mieszanym?",
  a: "Polski sąd stosuje prawo wskazane przez normy kolizyjne, przede wszystkim prawo wspólnego miejsca zamieszkania małżonków, a w dalszej kolejności prawo wspólnego obywatelstwa. Może się więc zdarzyć, że polski sąd orzeka na podstawie prawa obcego." },
{ id: "z05", cat: "zagranica", q: "Co zrobić, gdy małżonek wywiózł dziecko za granicę?",
  a: "Jeżeli państwo docelowe jest stroną konwencji haskiej dotyczącej uprowadzenia dziecka, składa się wniosek o powrót dziecka za pośrednictwem organu centralnego, którym w Polsce jest Ministerstwo Sprawiedliwości. Liczy się czas — po roku szanse na powrót maleją." },
{ id: "z06", cat: "zagranica", q: "Czy alimenty zasądzone w Polsce można egzekwować za granicą?",
  a: "Tak. W Unii Europejskiej służy do tego rozporządzenie o zobowiązaniach alimentacyjnych, a poza nią konwencje międzynarodowe i umowy dwustronne. Wniosek kieruje się przez sąd okręgowy, który przekazuje go organowi w państwie zobowiązanego." },
{ id: "z07", cat: "zagranica", q: "Czy muszę przyjechać do Polski na rozprawę rozwodową?",
  a: "Sąd zwykle chce przesłuchać strony, ale przy pobycie za granicą można wnosić o przesłuchanie w drodze pomocy prawnej przez konsula albo sąd zagraniczny, a w wielu sądach także o udział zdalny. Pozostałe czynności prowadzi pełnomocnik." },
{ id: "z08", cat: "zagranica", q: "Gdzie złożyć pozew, gdy małżonkowie mieszkają w różnych krajach?",
  a: "W sprawach unijnych jurysdykcję ustala rozporządzenie, dopuszczając między innymi sąd miejsca zwykłego pobytu pozwanego albo ostatniego wspólnego pobytu, jeżeli jedno z małżonków tam pozostało. Kto pierwszy złoży pozew, ten zwykle przesądza o miejscu sprawy." },
{ id: "z09", cat: "zagranica", q: "Czy zagraniczny akt małżeństwa wystarczy w polskim sądzie?",
  a: "Trzeba przedłożyć odpis aktu wraz z tłumaczeniem przysięgłym na język polski, a zwykle także dokonać transkrypcji aktu do polskiego rejestru stanu cywilnego. Bez transkrypcji urząd stanu cywilnego nie naniesie wzmianki o rozwodzie." },
{ id: "z10", cat: "zagranica", q: "Czy różnica obywatelstwa utrudnia sprawę o dzieci?",
  a: "Sama różnica obywatelstwa nie utrudnia. Komplikacją bywa natomiast planowana przeprowadzka dziecka za granicę, bo wymaga zgody drugiego rodzica albo zezwolenia sądu, oraz ustalenie, sąd którego państwa jest właściwy w sprawach opiekuńczych." },

/* ---------- PROCEDURA: POZEW, DOWODY, MEDIACJA (10) ---------- */
{ id: "r01", cat: "procedura", q: "Co musi zawierać pozew o rozwód?",
  a: "Oznaczenie sądu i stron, żądanie rozwiązania małżeństwa z orzeczeniem winy albo bez, wnioski dotyczące władzy rodzicielskiej, kontaktów i alimentów, uzasadnienie opisujące rozkład pożycia oraz wnioski dowodowe. Do pozwu dołącza się odpis aktu małżeństwa i odpisy aktów urodzenia dzieci." },
{ id: "r02", cat: "procedura", q: "Jakie dokumenty przygotować na pierwszą konsultację?",
  a: "Odpis skrócony aktu małżeństwa, odpisy aktów urodzenia dzieci, dokumenty dotyczące dochodów obu stron, informacje o nieruchomościach i kredytach oraz chronologiczny opis wydarzeń z datami. Ten opis skraca późniejszą pracę nad pozwem najbardziej." },
{ id: "r03", cat: "procedura", q: "Ilu świadków warto powołać?",
  a: "Zwykle od dwóch do czterech osób mających bezpośrednią wiedzę o okolicznościach rozkładu pożycia. Liczba nie zastępuje jakości — jeden świadek relacjonujący konkretne zdarzenia waży więcej niż pięciu powtarzających zasłyszane opinie. Zbyt wielu świadków wydłuża sprawę." },
{ id: "r04", cat: "procedura", q: "Czy dziecko może zeznawać jako świadek?",
  a: "Małoletni poniżej trzynastu lat nie może być przesłuchany w charakterze świadka w sprawie rozwodowej rodziców. Starsze dziecko formalnie może, ale sądy tego unikają, korzystając zamiast tego z wysłuchania dziecka poza salą rozpraw." },
{ id: "r05", cat: "procedura", q: "Czy wiadomości SMS i e-maile są dowodem?",
  a: "Tak, stanowią dowód i przedstawia się je jako wydruki albo zrzuty ekranu z widoczną datą i nadawcą. Warto zabezpieczyć oryginał w urządzeniu, bo druga strona może kwestionować autentyczność. Nie zbieraj korespondencji, do której nie masz legalnego dostępu." },
{ id: "r06", cat: "procedura", q: "Na czym polega mediacja i czy muszę się zgodzić?",
  a: "Mediacja to rozmowa stron z bezstronnym mediatorem, zmierzająca do ugody co do dzieci, alimentów lub majątku. Udział jest dobrowolny — sąd może skierować strony do mediacji, ale nie może zmusić do jej prowadzenia ani do zawarcia ugody." },
{ id: "r07", cat: "procedura", q: "Czy ugoda zawarta przed mediatorem jest wiążąca?",
  a: "Po zatwierdzeniu przez sąd ugoda mediacyjna ma moc ugody sądowej, a zatwierdzona przez nadanie klauzuli wykonalności stanowi tytuł wykonawczy. Można więc na jej podstawie prowadzić egzekucję komorniczą tak jak na podstawie wyroku." },
{ id: "r08", cat: "procedura", q: "Co to jest zabezpieczenie na czas procesu?",
  a: "To tymczasowe uregulowanie przez sąd spraw pilnych na czas trwania postępowania: alimentów, kontaktów z dzieckiem, miejsca pobytu dziecka czy sposobu korzystania z mieszkania. Postanowienie obowiązuje do prawomocnego zakończenia sprawy i podlega wykonaniu." },
{ id: "r09", cat: "procedura", q: "Czy mogę zmienić adwokata w trakcie sprawy?",
  a: "Tak, w każdym momencie, wypowiadając pełnomocnictwo i ustanawiając nowego pełnomocnika. Zmiana bywa jednak kosztowna: nowy adwokat musi poznać akta, a sąd może wyznaczyć dodatkowy termin, co wydłuża sprawę o kilka miesięcy." },
{ id: "r10", cat: "procedura", q: "Co się dzieje po ogłoszeniu wyroku rozwodowego?",
  a: "Biegnie tygodniowy termin na wniosek o uzasadnienie, a po jego doręczeniu dwutygodniowy na apelację. Po uprawomocnieniu zamawiasz odpis z klauzulą prawomocności, składasz ewentualne oświadczenie o powrocie do nazwiska i możesz wystąpić o podział majątku." },

];

/* ============================================================
   PULE DOMENOWE I ROTACJA TYGODNIOWA
   ------------------------------------------------------------
   Pule są rozłączne: żadne pytanie nie pojawia się na dwóch
   domenach. Suma pul = 200, więc każdy wpis ma swoje miejsce.

   Rotacja: numer tygodnia ISO przesuwa okno w obrębie puli.
   Treść jest stabilna przez siedem dni, a schemat FAQPage
   generowany jest zawsze z tego, co faktycznie widać.
   ============================================================ */

/* Kolejność ma znaczenie — decyduje o pierwszeństwie przy podziale.
   Domena flagowa bierze przekrój, pozostałe swoje specjalizacje. */
export const POOL_QUOTAS = [
  ["rozwod.waw.pl",      30, ["koszty", "czas", "podstawy", "dzieci", "majatek"]],
  ["rozwodjablonna.pl",  17, ["separacja", "zagranica", "podstawy"]],
  ["rozwodochota.pl",    17, ["wina", "podstawy", "koszty"]],
  ["rozwodmokotow.pl",   17, ["majatek", "koszty", "podstawy"]],
  ["rozwodlomianki.pl",  17, ["majatek", "podstawy", "koszty"]],
  ["rozwodzoliborz.pl",  17, ["dzieci", "alimenty", "procedura"]],
  ["rozwodtarchomin.pl", 17, ["dzieci", "alimenty", "procedura"]],
  ["rozwodwola.pl",      17, ["alimenty", "koszty", "czas"]],
  ["rozwodlegionowo.pl", 17, ["alimenty", "koszty", "dzieci"]],
  ["rozwodbemowo.pl",    17, ["procedura", "czas", "podstawy"]],
  ["rozwodbielany.pl",   17, ["podstawy", "czas", "procedura"]],
];

function buildPools() {
  const remaining = new Map();
  for (const e of FAQ) {
    if (!remaining.has(e.cat)) remaining.set(e.cat, []);
    remaining.get(e.cat).push(e);
  }
  const pools = {};
  for (const [host, quota, profile] of POOL_QUOTAS) {
    const picked = [];
    // najpierw kategorie profilowe, po kolei
    for (const cat of profile) {
      const bucket = remaining.get(cat) || [];
      while (picked.length < quota && bucket.length) picked.push(bucket.shift());
      if (picked.length >= quota) break;
    }
    // dopełnienie z najliczniejszej pozostałej kategorii — deterministycznie
    while (picked.length < quota) {
      let best = null;
      for (const [cat, bucket] of [...remaining.entries()].sort((a, b) => a[0] < b[0] ? -1 : 1)) {
        if (bucket.length && (!best || bucket.length > remaining.get(best).length)) best = cat;
      }
      if (!best) break;
      picked.push(remaining.get(best).shift());
    }
    pools[host] = picked;
  }
  return pools;
}

export const POOLS = buildPools();

/** Numer tygodnia ISO — wyznacza okno rotacji. */
export function isoWeek(date = new Date()) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

/**
 * Pytania na stronę główną danej domeny w bieżącym tygodniu.
 * Okno przesuwa się cyklicznie, więc w kolejnych tygodniach
 * widoczny jest inny wycinek tej samej puli.
 */
export function faqForHost(host, count = 8, date = new Date()) {
  const pool = POOLS[host] || POOLS["rozwod.waw.pl"];
  if (!pool.length) return [];
  const n = Math.min(count, pool.length);
  const offset = (isoWeek(date) * n) % pool.length;
  const out = [];
  for (let i = 0; i < n; i++) out.push(pool[(offset + i) % pool.length]);
  return out;
}

/** Pełna pula domeny, pogrupowana po kategoriach — na podstronę /pytania. */
export function faqPoolGrouped(host) {
  const pool = POOLS[host] || POOLS["rozwod.waw.pl"];
  const groups = new Map();
  for (const e of pool) {
    if (!groups.has(e.cat)) groups.set(e.cat, []);
    groups.get(e.cat).push(e);
  }
  return [...groups.entries()].map(([cat, items]) => ({ cat, label: CATEGORIES[cat], items }));
}
