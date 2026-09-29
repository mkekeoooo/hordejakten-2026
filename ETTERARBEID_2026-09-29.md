# Etterarbeid — Hordejakten 2026

Datert 29.09.2026. Formålet er å bevare beslutningene, feilene og dokumentasjonen slik at senere arbeid kan begynne uten hele samtalehistorikken. Dette er Codex' gjennomgang av tilgjengelige arbeidsfiler og repoet, ikke en offisiell forklaring fra Horde eller en full revisjon av alle Claudes beregninger.

## Resultat og avgrensning

Vi fant ikke kassen før andre åpnet den. På Hordes [sending](https://www.youtube.com/watch?v=EQHgfmZicc8) ble åpen dør og folk ved kassen observert rundt 13.48 CEST 29.09. Horde hadde festet en takk til følgerne og varslet informasjon om hint og lokasjon. Observasjonstid er ikke nødvendigvis åpningstid; sendingens forsinkelse er ikke kalibrert.

En seer i [skibens Twitch-chat](https://www.twitch.tv/skiben) skrev kl. 13.44 i den synlige chatten **60°31′39,7″N 12°08′51,5″E**, tilsvarende **60.5276944444, 12.1476388889**. Chatten er flyktig, og vi har ikke en permanent meldingslenke. Dette er **ikke en offisiell lokasjonsbekreftelse**. Etterkontrollene nedenfor gjelder denne koordinaten. Opplysningen må erstattes eller bekreftes med arrangørens dokumentasjon før den kalles fasit.

S03 lå 2,346 km unna. Det betyr at vi hadde et nærliggende område på arbeidslisten, ikke at vi identifiserte stedet. En beregnet prøve 331 m unna er heller ikke et sted vi faktisk hadde kjent igjen eller undersøkt i felt.

## Hvorfor den rapporterte flekken ikke ble fulgt opp

Etterkontrollen bruker de **lagrede dataene fra før åpningen**, med de opprinnelige tersklene. Vi har ikke justert kravene for å få et etterpåtreff.

| Trinn | Hva vi fant i etterkontrollen | Følge |
|---|---|---|
| Regional dekning 27.09 | Koordinaten lå innenfor rasteret og innenfor den lagrede offisielle Grue-grensen. | Den kjente mangelen på dekning av 44,8% av Grue forklarer ikke denne flekken. |
| Grov skogtest | Nærmeste rastermidtpunkt, 8,6 m unna, hadde 16% høye overflateprøver i et 5×5-nabolag. Kravet var minst 40% over 12 m. Nærmeste faktisk prøvde rutenettpunkt, 117,4 m unna, hadde også 16%. | Flekken ble filtrert bort før kandidatlisten. Data var gyldige og terrengrelieffet besto. |
| Naboprøver | Nærmeste bestående prøve var 331,1 m unna; 65 prøver innen 3 km besto. | Skogfilteret alene forklarer ikke at hele nærområdet ble oversett. |
| Valgt værrepresentant | `weather_3`, 60.5193873971, 12.1255322308, lå 1,522 km unna. | Den kom med blant 22 regionrepresentanter, men var utelatt fra den uttrykkelige listen over ti detaljområder. Ingen stedsspesifikk forkastingsgrunn er dokumentert i disse filene. |
| Senere søk etter nye steder | `forest_select.py` hoppet over forslag mindre enn 4,5 km fra tidligere kandidater, inkludert S03. | Dette passet kunne ikke velge den rapporterte flekken, selv om øvrige krav skulle være oppfylt. Det var en regel for å finne nye områder, ikke dokumentasjon på undersøkt terreng. |
| Bildekontroll av S03 | Det lagrede 2025-utsnittet var 677×336,5 m. | Koordinaten 2,346 km sørvest lå utenfor. Inspeksjon av S03 ga ikke sammenhengende dekning rundt punktet. |

Den aktuelle skogvariabelen var **overflatehøyde minus terrenghøyde**, brukt som tilnærming til høye trær. Den målte ikke stammer, fri sikt under trekroner eller dagens vegetasjon direkte. Lokal opptaksårgang var ikke fastslått. Resultatet 16% viser hvordan vår modell behandlet flekken, ikke hvordan skogen faktisk så ut ved åpningen.

Den mest konkrete prosessfeilen var at vi ikke førte et fullstendig kart over **hvilke flater som faktisk var sett i detalj**. En region kunne være hentet som grovdata, ha mange modellprøver og ha én inspisert kartnål uten at resten var vurdert. Regelen om å søke langt fra gamle punkter bygde på dette skillet uten å håndtere det godt nok.

Se `audit/coverage_audit.json`, `audit/audit_inputs.json` og `reproduce_audit.py` i [dokumentasjonspakken](Hordejakten_etterarbeid_29sep.zip). Den portable etterkontrollen bruker små uttrekk av de opprinnelige rastrene og det lagrede kandidatsettet. Den gjentar de konkrete tallene uten nye nettforespørsler.

## Tidslinje: hva vi prioriterte

| Dato | Arbeid og beslutning | Hva vi lærte / ikke avklarte |
|---|---|---|
| 25.09 | Revisjon av Evenstad/Messelt, kamerageometri, skog- og morgensolkrav, veiretning og kryssinger. Flere skogtester ble gjenskapt med unike rasterceller og alternative kameraforskyvninger. | Modelltreff var følsomme for avstander, siktlinjer og antatt kronegeometri. Zoom ga ikke påvist stereobaseline. Temperatur måtte behandles mykt. |
| 25.–26.09 | Originalbilder viste direkte sol også 23.09 kl. 16.45/16.50. Solør og Engerdal ble undersøkt ved siden av eldre områder. | Fravær av synlig solstjerne beviste ikke skydekke. Satellittparallakse, skyhøyde og opptakstid hadde stor betydning. |
| 26.09 | Seks Solør-punkter kontrollert i valgt 2025-ortofoto. S03 beholdt; to eksakte punkter lå ved større hogstflater. L07 fikk en alternativ adkomst på samme side av bekken. | Nærmeste vei var ikke nødvendigvis den faktiske ruten. Nye flyfoto daterte ikke automatisk høydemodellen. |
| 26.09 | En 17-leddet regnserie løftet S03. Et bredt 5 km-søk ga K01 Dahlsvegen og K02 Burmavegen lenger nord. | Flere implementasjoner brukte samme sekundære observasjoner og MET-data. Samstemthet var ikke uavhengig kildebekreftelse. |
| 27.09 | Flyhypotesen ga mer oppmerksomhet til Rena/Åmot og vestlige alternativer. Flyspor ble hentet direkte og sammenlignet symmetrisk mellom kvelder. | Sporene var reelle; hvilket fly hun så, forsinkelsen og betydningen av armen var fortsatt uavklart. Strenge vinkelkrav ga innbyrdes konflikt. |
| 27.09 | Regionalt pass: 355 216 prøver, 8 135 besto grovfiltre, 22 representanter, ti detaljområder og 16 utvalgte detaljpunkter. | Store antall var prøver, ikke identifiserte lysninger. `weather_3` ble ikke fulgt opp. Utvalgsreglene og dokumentert arealdekning var utilstrekkelige. |
| 27.09 | To regntavler kontrollert i originalvideo: 07.45 og 10.57. Nyere skog-/hogstdata brukt ved flere detaljpunkter. | Resten av de 17 referatene var fortsatt ikke originalverifisert. Historiske skogdata ga reelle hogstfalskpositiver. |
| 28.09 | Offisielle besøksvideoer, brokommentarer, Linstow/Høegh, matsporet og Grue/Finnskogen undersøkt. 606 Alvdal-horisonttester og offentlig Grue-GIS samlet. | Besøk ble bekreftet, men ikke lokasjon. Original brokommentar manglet. Landskapsbildet ble ikke sikkert plassert; 891 m var ikke dokumentert moh. |
| 29.09 | Nye besøksvideoer, åpning observert, chatkoordinat funnet og etterkontroll utført. | Ingen egen stedsløsning før åpningen. Endelig koordinat, koder og hintforklaringer mangler primærbekreftelse. |

## Andre metodefeil som må følge arkivet

**Uavklarte observasjoner fikk for presise modeller.** En oppadrettet arm i et bilde er ikke en målt flyhøydevinkel. Eksakte ADS-B-koordinater gjør ikke koblingen til en bestemt visuell hendelse sikker. En tidsforskyvning og et annet fly er alternative forklaringer som må bevares gjennom rangeringen.

**Regnserien ble brukt til både utvalg og bekreftelse.** En kontroll med første ni referater mot siste åtte ga svak generalisering: de tre beste tidlige treffene fikk 0,50 på resten. Det var en etteranalyse av sekundærdata, ikke en kalibrert sannsynlighetsmodell. Radaren kan dessuten overse yr; null radar er ikke en sikker motsetning til «småregn».

**Felles kilder ble omtalt for sterkt.** Claude og Codex kunne være enige fordi samme referater, samme værdata og samme antakelser lå i begge løp. Formuleringene «eneste klynge i Norge» og «alle uavhengige tester» i den gamle README-en var for sterke. De bevares som historikk, ikke gjeldende vurdering.

**Kart og bilder ble gitt større dekningsbetydning enn de hadde.** OSM-uttrekk kunne mangle innsjørelasjoner og små vannløp. Null kryssing langs en rett linje dokumenterte ikke en gangrute. Opptaksår varierer mellom nærliggende bilder. En eldre høydeoverflate kan beskrive skog som senere er hogd. En negativ feltrapport dekker bare dokumentert areal og synsretning.

**Scenelikhet ble aldri etablert.** Skog, vei og relativt flatt terreng passer mange steder. Ingen kombinasjon av flere særpregede stammer, steiner og terrengformer ble identifisert som samme sted. Kameraets ukjente kalibrering og endret utsnitt gjorde fine avstandsberegninger sårbare.

**Hint fikk geografisk betydning før meningen var kjent.** 2,7 Eiffeltårn kunne ikke uten videre bli 810–891 moh. En bridge-rapport manglet originaltekst og kontekst. En plankevegg beviste ikke permanent hytte. Dyrebokstaver, mat, arkitektur og produktordspill hadde flere mulige tolkninger. Ingen av disse uklarhetene er løst av at en kommune virker plausibel.

**Arbeidsflyten var for oppstykket.** Brukeren måtte gjentatte ganger be om videre arbeid. Nye punkter og modeller fikk ofte oppmerksomhet før en sammenhengende kontroll av gamle sterke områder var ferdig. Forbehold ble skrevet ned uten alltid å endre utvalgsreglene. Det er Codex' ansvar å skille faktisk framdrift fra flere beregninger av samme usikre premisser.

## Hva som var nyttig og kan gjenbrukes

- Bevarte råkilder, datoer, parameterverdier og kildehasher gjør dagens konkrete etterkontroll mulig.
- Direkte kontroll av flyspor verifiserte beregningene og synliggjorde motstridende vinkelantakelser.
- Originale tavlebilder korrigerte hva regnobservasjonene faktisk kunne bære.
- Oppdaterte flyfoto og hogstdata avdekket utdaterte skogtreff.
- Flere geografiske grener og alternative adkomster hindret enkelte kategoriske utelukkelser.

Disse resultatene er nyttig metodearbeid, men de leverte ikke den eksakte lokasjonen. Nærhet til en senere rapportert koordinat er ikke en seier eller et bevis på at modellen var riktig.

## Åpent før en endelig fasitgjennomgang

1. Dokumenter arrangørens eksakte koordinat og tidspunkt; skill kamerasted, boks og eventuell parkering.
2. Bekreft dørkoden og hver hengelås separat. Bevar brukerens omtrentlige `Y2567` som en datert opplysning inntil da.
3. Skaff arrangørens forklaring av Y2/kvinne/LD, 5008, dyrene, arkitekttegningen, gjeldfriveg1 og Eiffeltårn-tallet.
4. Kjør de gamle modellene ved fasiten uten å endre terskler. Skill dokumentert falsk negativ fra antatt årsak.
5. Fastslå om vinnerens avgjørende spor var offentlig tilgjengelig, lokalkunnskap, feltobservasjon eller noe vi ikke hadde. Vi vet foreløpig ikke hva som faktisk gjorde at andre fant stedet.

Kildeinngang: [samlesak #1](https://github.com/mkekeoooo/hordejakten-2026/issues/1), [sol og vær #10](https://github.com/mkekeoooo/hordejakten-2026/issues/10), [Solør #12](https://github.com/mkekeoooo/hordejakten-2026/issues/12), [regn #13](https://github.com/mkekeoooo/hordejakten-2026/issues/13), [S03 #14](https://github.com/mkekeoooo/hordejakten-2026/issues/14), [fly #15](https://github.com/mkekeoooo/hordejakten-2026/issues/15), [Alvdal/Grue #16](https://github.com/mkekeoooo/hordejakten-2026/issues/16). Originale sakstekster er historiske påstander og kan være korrigert i kommentarene.
