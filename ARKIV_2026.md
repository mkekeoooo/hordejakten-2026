# Arkivoversikt — 29. september 2026

Les [etterarbeidet](ETTERARBEID_2026-09-29.md) og [kodeoversikten](KODER_OG_HINT.md) før eldre rangeringer. Målet er at både resultatene og feilene kan forstås senere.

## Ny samlet pakke

[Hordejakten_etterarbeid_29sep.zip](Hordejakten_etterarbeid_29sep.zip) inneholder de nye dokumentene, den uendrede gamle README-en, lokale rapporter og utvalgte reproduksjonsdata fra 25.–29.09. `MANIFEST.json` angir hver fils opprinnelse, størrelse og SHA256. `LOCAL_INVENTORY.json` viser arbeidsfiler med format/størrelse; det betyr ikke at alle filene er lastet opp.

Innholdet i `historical/` er datert arbeidsmateriale. Utsagn om at jakten pågår eller at noe ikke er publisert, gjelder tidspunktet da notatet ble skrevet. Nåværende status står i repoets README.

`reproduce_audit.py` bruker kun Python-standardbiblioteket og små lagrede uttrekk. Kjør `python reproduce_audit.py` fra den utpakkede mappen. Den kontrollerer trehøydeterskelen, avstander, 65 bestående naboprøver, manglende oppfølging av weather_3 og 4,5 km-regelen. Ingen nettilgang eller avspilling brukes. Resultatet sammenlignes med de arkiverte tallene.

Fullstendige regionale rasterfiler, videofiler, installerte biblioteker, talegjenkjenningsmodell og tredjeparts webpakker er ikke duplisert i denne nye pakken. Originale kilde-URL-er, relevante hasher og tidligere pakker er bevart. De store lokale rastrene kreves for å kjøre hele den opprinnelige lands-/regionmodellen på nytt. Den portable kontrollen gjenskaper de spesifikke etterfunnene, ikke hele jakten.

## Tidligere publiserte pakker

| Pakke | Innhold |
|---|---|
| [Kontroll 25.09](https://github.com/user-attachments/files/32648877/Hordejakten_kontroll_25sep.zip) | Skript, rasterutsnitt, flyspor og modellkontroller. |
| [Landsøk, sol og appspor](https://github.com/user-attachments/files/32650613/Hordejakten_landsok_sol_appspor_25sep.zip) | Alternative spor og kildekritikk. |
| [Solsikt og parallakse](https://github.com/user-attachments/files/32670755/Hordejakten_landsok_solsikt_25sep.zip) | Geometriske scenarier og satellittbegrensninger. |
| [Ny solobservasjon 23.09](https://github.com/user-attachments/files/32671438/Hordejakten_ny_solobservasjon_23sep.zip) | Seks originalprøver ved 16.45/16.50 og sammenligning. |
| [Solør-bilder og adkomst](rapport/Hordejakten_solor_adkomst_26sep.zip) | Seks daterte bildekontroller og alternative ruter. |
| [Dahlsvegen, Toten og nye steder](https://github.com/user-attachments/files/32683560/Hordejakten_nye_steder_Dahlsvegen_Toten_26sep.zip) | K01/K02 og brede geografiske kontroller. |
| [Originaltavler og nye områder 27.09](https://github.com/user-attachments/files/32707457/Hordejakten_originaltavler_og_nye_omrader_27sep.zip) | Regntavler, skog-/hogstkontroll, råresultater og kode. |
| [Alvdal og Grue 28.09](https://github.com/user-attachments/files/32759407/Hordejakten_landskapskontroll_og_Grue_28sep.zip) | 606 horisonttester og landskapsbegrensninger. |
| [Grue: broer, ruter og dekning](https://github.com/user-attachments/files/32759989/Hordejakten_Grue_broer_ruter_dekning_28sep.zip) | Offentlige rutelag, 41 broobjekter, terreng og kommunegrense. |

## Nøkkelsaker

[1: samordnet revisjon](https://github.com/mkekeoooo/hordejakten-2026/issues/1) · [2: morgensol](https://github.com/mkekeoooo/hordejakten-2026/issues/2) · [3: temperatur](https://github.com/mkekeoooo/hordejakten-2026/issues/3) · [4: veiretning](https://github.com/mkekeoooo/hordejakten-2026/issues/4) · [5: regionpremiss](https://github.com/mkekeoooo/hordejakten-2026/issues/5) · [6: hele tavlehint](https://github.com/mkekeoooo/hordejakten-2026/issues/6) · [8: skogmodell](https://github.com/mkekeoooo/hordejakten-2026/issues/8) · [9: pekegest](https://github.com/mkekeoooo/hordejakten-2026/issues/9) · [10: vær/sol](https://github.com/mkekeoooo/hordejakten-2026/issues/10) · [11: olivin](https://github.com/mkekeoooo/hordejakten-2026/issues/11) · [12: Solør/adkomst](https://github.com/mkekeoooo/hordejakten-2026/issues/12) · [13: radar](https://github.com/mkekeoooo/hordejakten-2026/issues/13) · [14: S03](https://github.com/mkekeoooo/hordejakten-2026/issues/14) · [15: fly](https://github.com/mkekeoooo/hordejakten-2026/issues/15) · [16: Alvdal/Grue](https://github.com/mkekeoooo/hordejakten-2026/issues/16).

Sakene beholdes som diskusjonshistorikk. At jakten er avsluttet betyr ikke at alle kilde- og modellspørsmål er løst. Claudes råmateriale ligger også på [bevisgrenen](https://github.com/mkekeoooo/hordejakten-2026/tree/bevis/claude-2026-09-25).

## Før videre bruk

Koordinaten og Y2567 må få primærbekreftelse før arkivet omtales som en full fasit. Dataeiere og kildehenvisninger fra de opprinnelige manifestene følger materialet. Kartverkets/Geoveksts bilder, NIBIO-data, OpenStreetMap-data og andre kilder har egne rettigheter; se [KILDER.md](KILDER.md). Vi innfører ingen ny lisens for tredjepartsinnhold.
