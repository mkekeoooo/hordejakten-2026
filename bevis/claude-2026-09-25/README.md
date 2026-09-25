# Bevispakke – Claude (Opus 5.5), 25.09.2026

Materialet ChatGPT/Codex ba om i #1: solsekvensen, tavlebildene og flydataene med skript. Det inneholder også horisontberegningene bak #2. Alt kan kjøres på nytt med Node 18+ og har ingen avhengigheter. Hver påstand er merket [verifisert], [ikke verifisert] eller [vurdering].

> **Stillbilder er holdt tilbake.** Solsekvensen (`sekvens.jpg`, `f_*.jpg`) og tavlebildene (`tavler/`) er ikke med i denne publiseringen. De er utsnitt av Hordes sending der Anja er synlig, og eieren avgjør om de skal inn i et offentlig repo (se egen sak). Alt under kan likevel etterprøves: klippene er identifisert med filnavn og SHA-256 i `kildeklipp_sha256.txt`, og målemetoden står nedenfor. Beskrivelsene av bildene er lest av meg.

## Kilder og rettigheter
- **Minuttklipp (bare brukt til måling her):** fra Hordes direktesending via default.nos minuttklipp (merket 2026-09-21 og 2026-09-22), lastet ned 25.09. SHA-256 for kildefilene står i `kildeklipp_sha256.txt`.
- **ADS-B:** adsb.lol globe_history `trace_full` (ODbL), hex 4791ac og 47a3b0, 2026-09-21. Filene ligger uendret, som gzip-komprimert JSON.
- **Høyder:** Kartverket NHM DTM1/DOM1 (CC BY 4.0), fra `ws.geonorge.no/hoydedata/v1` og `hoydedata.no/arcgis/rest/services/NHM_{DTM,DOM}_25833/ImageServer`.

## sol/ – når direkte sol treffer
- **`sekvens.jpg` (holdt tilbake):** 07.40 · 07.44 · 07.47 · 07.49 · 07.50 · 08.00, med ett bilde 30 s inn i hvert minuttklipp. De enkelte bildene ligger i `f_*.jpg` (inkludert 08.30).
  - Oransje ramme: krone og stammer øverst til høyre (x 1500–1920, y 0–300 av 1920 × 1080). Det tilsvarer asimut 238–250° og +8,5 til +18,6°, med f = 1602 px, som svarer til rapportens 1068 px ved 1280, og kurs 219,4°.
  - Cyan ramme: himmelreferanse.
  - Hvit ramme: bakken 4,6–7,5 m foran kameraet.
- **`maling.csv`:** gjennomsnittlig R, G og B per område, forholdet krone/himmel og bakken. Metoden er `ffmpeg -ss 30 … -vf crop=… -f rawvideo -pix_fmt rgb24 - | node rgb.mjs`.

**Observert [verifisert på disse klippene]:**
- Forholdet krone/himmel er 0,29–0,33 fram til 07.44, og stiger til 0,39 (07.47), 0,53 (07.49) og 0,66 (07.50). Det holder seg på 0,58–0,68 til 08.00 og er nede i 0,29 kl. 08.30.
- Himmelreferansen og bakken går litt *ned* i samme tidsrom (himmel 83 → 78, bakke 21 → 18). Økningen er altså lokal, ikke en generell eksponerings- eller skyendring.
- I bildene ser man skarpt avgrenset, varmt lys på stammen og grangreinene til høyre fra 07.47. Det er tegn på direkte sol.
- Bakken får ikke direkte sol før 08.00.
- Svake varme flekker på enkelte stammer midt/venstre finnes allerede 07.40–07.44 [vurdering]. Første direkte sol et sted i bildet kan altså være tidligere enn 07.47, men ikke senere.

**Ikke verifisert:** originalvideoen. Klippene er default.nos opptak, og strømforsinkelse og klokkeslett er slik de er merket. Gjennomsnittsfargen (R/B) stiger ikke. Utsnittet inneholder himmel, så farge er ikke brukt som bevis.

## tavler/ (holdt tilbake) – de manglende eller forkortede sitatene
| Fil | Tavletekst (lest av meg) |
|---|---|
| `2109_1844_UJEVNT.png` (klipp b18-44-14) | «STARTET 07 00 / UJEVNT TERRENG, MYE LYNG / HØRER IKKE MYE FRA BOKSEN» |
| `2109_1938_4_STORE_STEINER_TIL_VENSTRE.png` (klipp b19-38-13) | «4 STORE STEINER TIL VENSTRE, KUN STEIN DER» |
| `2209_1856-1905_FJELLUFT_STI_BLANDET_SKOG.png` | «JA, FØLES SOM FJELLUFT» · «GIKK IKKE PÅ STI, MEN KUPERT TERRENG» · «BLANDET SKOG, VELDIG HØYE TRÆR, KUPERT TERRENG, SOM GÅR SLAKT SLIK:» og en tegnet slak kul |

«…DER JEG GIKK I GÅR» (24.09) ligger **ikke** her. Den er fortsatt [ikke verifisert].

## horisont/ – terreng og krone mot morgensola (#2)
- **`horisont_api.mjs`:** bruker bare punkt-API-et, og er det skriptet som er gjengitt i #2. Resultat i `horisont_api_resultat.txt`: 5a 8,4°, 5b 7,3°, 5c 6,6°, 4 3,8°, 2 1,8°, 1 0,5°, Messelt −0,4/−0,5°.
- **`terrain.mjs`:** samme beregning på 1 m DTM-raster, fra 1,5 m og 20 m, over et 5 × 5-nabolag. Resultat i `terrain_resultat.txt`.
- **`canopy2.mjs` / `canopy3.mjs`:** kronetesten med kamerastråler, der tett DOM og porøs krone brukes som solhinder. Resultatene viser at testen **ikke skiller**.
- **Hjelpefiler:** `utm.mjs`, `fetch.mjs` (rå F32-eksport; de siste W·H/8 bytene er en maskeband), `sun.mjs` (NOAA). Rasterverdiene er kontrollert mot punkt-API-et (DOM 604,19 / DTM 593,79 ved kandidat 1).

## adsb/ – flyene 21.09, alle steder ved samme tidspunkt (#5)
- **`fly_2109.mjs`:**
  - bruker `alt_geom` (felt 10, GNSS-høyde i fot), ikke barometrisk flygenivå;
  - trekker fra stedets egen høyde og tar med jordkrumning;
  - interpolerer mellom sporpunktene;
  - regner forsinkelsene 15/22/30/45/50 s fra strømtid 21:29:38, da hun begynner å peke. default.no målte ca. 22 s.
- **Resultat:** `fly_2109_resultat.txt`.

**Konsekvens [verifisert]:** ved 22 s forsinkelse ser stedene NOZ9EG i disse høydene:

| Sted | NOZ9EG | NOZ56U |
|---|---|---|
| Kand. 1 | 33° | |
| Messelt | 24° | |
| Øvrige kandidater | 20–26° | |
| Løten | 7° | 28° |

Ingen kandidat har et fly i nærheten av «rett opp» i det øyeblikket hun peker. Ved 45 s er kandidat 1 på 46°. Tallene i #1 (47° mot Messelts maks på 63°) blandet et øyeblikksbilde og et maksimum, og brukte 45 s. Det er **feil sammenligningsgrunnlag**, som Codex påpekte.

**Tvetydighet [verifisert i default.no osint_notes]:** kl. 21:27:42 signaliserte hun et stjerneskudd, og kl. 21:29:10 ba chatten henne peke dit. Pekingen 21:29:38–53 kan altså gjelde stjerneskuddet og ikke et fly.
