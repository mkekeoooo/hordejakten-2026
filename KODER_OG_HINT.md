# Koder og hint — arbeidslogg og uavklarte løsninger

Arkivert 29.09.2026. Denne oversikten skiller det vi undersøkte fra senere opplysninger. Ingen kode ble fysisk testet av oss, og vi løste ikke alle låsene under jakten.

## Kodeoversikt

| Kode / tegn | Hva vi faktisk har | Hva som mangler |
|---|---|---|
| **`Y2567`** | Brukerens opplysning 29.09 etter åpningen: «The code was Y2567 or something like that». Registrert som mulig dørkode, **omtrentlig erindring**. | Offisiell ordlyd, korrekt tegn-/tallrekkefølge, låstype og forklaring av hvert tegn. Ikke før den som bekreftet eller egen løsning. |
| **`2023`** | default.no oppga 26.09 at fire Kodejakten-stadier var løst. 27.09 så vi et offentlig innsendt resultatskjermbilde hos Praktiskinfo som viste 2023 for én hengelås. | Vi oppnådde ikke resultatet selv i spillet og testet ikke låsen. Dette var kjent fra andre før vår skjermbildekontroll. |
| **`5008`** | Offentlig hintoppsummering beskrev en skjult kode i kredittscoren. Tallet står også i Hordes publiserte Bergen-adresse. | Original appvisning, nøyaktig utledningskjede og hvilken lås tallet åpnet. Adresse-/postnummerlikhet bekrefter ikke geografisk plassering. |
| **`Y2` + kvinnefigur + `LD`** | Fanoppsummering fra @hordejegeren, kontrollert 29.09, omtalte dette som et nytt hint. En teorislide koblet Y til en knapp på et CL200-tastatur, kvinnen til Anja og LD til mulige bokstaver/initialer. | Original arrangørvisning og bekreftet løsning. Fanens teorislide var uttrykkelig ubekreftet. Y2-likheten med brukerens Y2567 er interessant, men forklarer ikke 567. |
| **CL200** | Modellbetegnelsen ble brukt av seere og i fanens teori. | Uavhengig identifikasjon av akkurat låsen, variant, tillatte tegn og betjeningsmåte. Ingen påstand om rekkefølgeuavhengighet eller andre mekaniske egenskaper er etablert her. |

Kilder: [Kodejakten](https://horde.no/secret/kodejakten), [Praktiskinfo 2026](https://praktiskinfo.no/hordejakten-2026/), [skattejakthint](https://skattejakthint.no/), [fanoppsummering 29.09](https://www.tiktok.com/@hordejegeren/photo/7690904977245506838), [Hordes kampanjeside](https://horde.no/gjeldfri/hordejakten). Nettsider kan være endret etter de oppgitte observasjonene.

## Hva vi undersøkte i spill og nettsidekode

25.09 ble Kodejakten-siden åpnet; den viste at spillet ikke var tilgjengelig, og hjelpedialogen ga «Vær bedre». Offentlig HTML og to publiserte JavaScript-filer ble lest. Spillet hadde serverkall for status/start/verifisering/svar, slik at en full løsning ikke nødvendigvis lå i klientfilene. Ingen bekreftet lokasjonsnøkkel eller endelig kode ble funnet i det undersøkte materialet. En avgrenset negativ kontroll beviser ikke at alle sider og appflater var uten hint.

Kampanjesidens offentlige HTML, åtte lenkede JavaScript-filer, kampanjekomponent og sju identifiserte avhengigheter ble også undersøkt. De viste blant annet sendingens video-ID og kampanje-/FAQ-tekst; ingen lokasjonsfasit ble funnet. En 403-side ble ikke omgått. Horde-appen ble ikke gjennomgått som innlogget bruker. Vi bør derfor ikke omtale dette som en full apprevisjon eller en selvstendig spillgjennomføring.

27.09 lastet det offisielle spillet første stadium. Skjermbildet av 2023 styrket dokumentasjonen av en allerede kjent opplysning; det var ikke et nytt kodegjennombrudd fra vår side. Manifestene og de avgrensede kodenotatene er i ZIP-en; tredjeparts app-/webpakker er ikke republisert i sin helhet.

## Bokstavtavla og andre mulige kodespor

Tavlebildet viste **`THILPRTE` + `OESHF`**. Bokstavtelling ga nøyaktig samsvar med `THE SHOPLIFTER`, `FILTER THE SHOP` og `HELHET FOR TIPS`. `THE FOREST HILL` var ikke eksakt: P manglet og L forekom én gang for mye. Ingen av de tre gyldige anagrammene ble bekreftet som tilsiktet løsning. Flere gyldige anagrammer viser hvorfor en språklig match alene ikke avgjør gåten.

En mulig hilsen til BobTheShoplifter ville heller ikke godkjenne default.nos geografiske modeller. Ballongoppgaven kunne være kode, underholdning eller hilsen; hele sekvensen ble ikke avklart. [Tavlebilde](https://horde.pladsen.dev/img/tavle-2509-shoplifter.jpg) · [sekundær tavleoversikt](https://horde.pladsen.dev/?fane=tavla).

| Spor | Arbeid / status | Feilslutning som må unngås |
|---|---|---|
| Hordeminus / 2,7 Eiffeltårn | 891 m ble omtalt; 810–891 m oppsto som høydegren i deler av søket. Ingen sikker betydning ble etablert. | At et tall med meter nødvendigvis betyr høyde over havet. |
| gjeldfriveg1 | Adressefelt og landskapsbilde; 606 horisonttester i Alvdal ga ingen sikker bildematch. | At bildet nødvendigvis viser kassens nærområde, eller at et testpunkt er bokskoordinat. |
| Olivenoljestativ / dyrefigur | Olivenolje→olivin undersøkt mot dokumentert olivinskog. Dyreart, parodi og produktordspill diskutert. | Å gjøre ett ubekreftet ordspill til flere uavhengige stedsbevis. |
| Grevling–Rev–Ugle–Ekorn→GRUE | Seerteori; utvalg og rekkefølge ikke forklart, andre dyr forekom i oversiktene. | Å føre akrostikonet som arrangørens løsning. |
| Linstow / Høegh / Grue kirke | Den historiske arkitektkoblingen ble bekreftet i eksterne kilder. Original apphintformidling var delvis sekundær. | At en reell historisk forbindelse alene fastsetter kasseplasseringen. |

## Hvor kodearbeidet var svakt

Geografisøket tok mesteparten av oppmerksomheten. Vi hadde ingen fullstendig, oppdatert logg per lås med originalhint, prøvd løsning og faktisk resultat. Ulike tall ble derfor omtalt uten at de alltid var knyttet sikkert til dør eller hengelås. Samtidig kunne geografiske tolkninger av kodetall sende søket langt av gårde.

Neste gang må kodearbeidet ha en egen løpende tabell: **hvilken lås → originalhint → utledning → kandidatkode → verifisering → kilde og tid**. Registrer mislykkede løsninger og hvorfor de ble forkastet. Et løst spill, en offentlig skjermdump og en fysisk åpning er tre forskjellige dokumentasjonsnivåer.

## Fasitfelt som skal fylles senere

- Dørkode: **ubekreftet**; nåværende erindring Y2567.
- Hengelås A/B og rekkefølge: **ubekreftet hos oss**; offentlig rapportert 2023 og 5008 må knyttes til riktig lås.
- Arrangørens originale forklaringslenke og dato: **mangler**.
- Hvordan Y2, kvinnefiguren og LD eventuelt ga resten av koden: **mangler**.
- Hva vinneren faktisk løste og hvilke hjelpemidler som var avgjørende: **mangler**.

Ikke konstruer en forklaring baklengs fra Y2567 og før den som historisk løst. Bevar denne loggen når bekreftet fasit legges til.
