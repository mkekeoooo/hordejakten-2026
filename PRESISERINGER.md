# Presiseringer og publiseringsstatus

Oppdatert 25. september 2026. Dette notatet følger de to originale PDF-rapportene og endrer ikke originalfilene.

## Avklaringer i den løpende revisjonen

- Den historiske kontrollrekkefølgen er **ikke en vedtatt, gjeldende rangering**. Ingen region er bekreftet. Se [samlesak #1](https://github.com/mkekeoooo/hordejakten-2026/issues/1).
- Temperatur er et betinget scenario, ikke et hardt utelukkelseskriterium. Det er heller ikke dokumentert at alle tavleverdier er for høye, eller hvilken korreksjon som eventuelt gjelder. Se [#3](https://github.com/mkekeoooo/hordejakten-2026/issues/3).
- Codex har kjørt Claudes `fly_2109.mjs` og gjenskapt resultatene fra de publiserte råsporene. Det bekrefter beregningen under dens premisser, ikke at gesten gjaldt dette flyet eller at forsinkelsen er målt for akkurat hendelsen. Se [#5](https://github.com/mkekeoooo/hordejakten-2026/issues/5).
- Codex har kjørt `horisont_api.mjs` mot Kartverket og gjenskapt 8,4° / 7,3° / 6,6° ved Jernvinneveien 5a/5b/5c mot 98,8°, fra 1,5 m. Hindringene ligger henholdsvis 800, 1050 og 1300 m unna. Dette er terrengtall; endelig kobling til den belyste flaten i morgenbildene er fortsatt under vurdering i [#2](https://github.com/mkekeoooo/hordejakten-2026/issues/2).
- Samme koordinat i flere analyser kan stamme fra samme nettside eller modell. Det gir bare selvstendig støtte når observasjonene og utledningen faktisk er uavhengige. Et populært punkt er ikke dokumentert undersøkt uten feltdokumentasjon.
- Kandidat 1s veipeiling er omtrent 94°. Et ubetinget samsvarsmerke mot et tolket 130°-hint er ikke begrunnet. Se [#4](https://github.com/mkekeoooo/hordejakten-2026/issues/4).

## Hva er publisert?

To PDF-er og 15 PNG-figurer fra den mottatte publiseringspakken, samt norske veiledningstekster. Fullrapporten er på 22 sider; kortversjonen er på 12 sider.

Rapportens vedlegg B omtaler kandidat-CSV, kameramodell og kjøreskript i en tilhørende pakke. Den komplette pakken var ikke med i opplastingen. Nye revisjonsdata og skript er senere publisert på [en separat bevisgren](https://github.com/mkekeoooo/hordejakten-2026/tree/bevis/claude-2026-09-25/bevis/claude-2026-09-25), men utgjør ikke en komplett reproduksjonspakke for rapporten.

## Viktige presiseringer ved lesing

- **«Består alle tester» betyr de valgte modellkravene**, ikke at stedet er bekreftet. Treffantall og robusthet er ikke sannsynligheter.
- **Morgensol:** originalopptaket 21.09 kl. 07.45–08.00 er ikke kontrollert her. Rapportens formuleringer om at A1/A2 er «utelukket» må forstås som betinget av soltolkning, plassering og adkomstmodell. Tabellen viser at 12 A2-posisjoner består solkravet, men ingen består både sol og den valgte adkomsttesten.
- **Temperatur:** dagverdiene som ble brukt i den tidligere værtesten gjelder det undersøkte dagvinduet. Betegnelsen «dagmaks» skal ikke automatisk leses som maksimum gjennom hele døgnet. Temperatur inne i kassen og uteluft er ikke samme observasjon.
- **Uavhengighet:** terrengtester og syntetiske utsyn bruker samme høydedata. Skogtester og stammetreff bruker samme overflatemodell. MET-analyse og radar kan også være avhengige datakilder. Enighet mellom dem teller ikke automatisk som separate bekreftelser.
- **Datapresisjon:** numeriske strålesteg på 1 cm gir ikke terrengdata med 1 cm fysisk nøyaktighet. Rasteroppløsning, målefeil og modellvalg består.
- **Adkomst:** nærmeste kartlagte vei er ikke nødvendigvis brukt adkomst. En rett linje er ikke en rute. Manglende bro i OSM/DOM dokumenterer ikke alene at ingen overgang finnes.
- **B3:** objektidentitet og diameter er ikke sikkert bestemt. Den gamle avstanden på 17–44 m er trukket tilbake. Historiske figurer kan vise gamle ringer eller utvalg.
- **Nattlys og støtteapparat:** lysskiftet gir ingen dokumentert retning til vei eller hus. Personell, strøm og nett beviser ikke at en hytte eller fast strømtilførsel ligger nær.
- **Appvaren med bever/olivenolje:** dette er en ubekreftet brukergjengivelse uten sikker produkttekst, ikke et etablert stedshint.

## Interne avvik i rapportene

Disse punktene er bevart i originalene og bør avklares ved en eventuell ny rapportversjon:

1. Myklebysæterveien omtales enkelte steder som området med «flest treff». Samletabellen viser 5 treff etter alle trinn for E6 og 21 for E2. Førsteplassen kan være en skjønnsmessig prioritering, men begrunnes ikke med høyest totalt treffantall.
2. Madsskardveien omtales med «bare to posisjoner», mens samletabellen har 3 for E3 etter alle trinn. Dette kan gjelde forskjellig geografisk avgrensning; det forklares ikke tydelig.
3. Områdetallet 13 omfatter også et nytt P2-utsnitt i nærheten av tidligere punkt 7. Tabellen samler disse under «Punkt 7 / P2». Antall navngitte tabellrader og antall rasterutsnitt er derfor ikke det samme.

Ingen av disse presiseringene etablerer en ny lokasjon. Den manglende kontrollen er fortsatt et dokumentert samsvar med det faktiske stedet.
