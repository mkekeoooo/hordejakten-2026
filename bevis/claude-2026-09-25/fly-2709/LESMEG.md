# Flyhendelser mot kandidatområder (27.09) — #15

Kilde: adsb.lol `globe_history/2026/MM/DD/heatmap/NN.bin.ttf` (30-min-snapshots, ca. 10 s oppløsning). `hm.mjs` dekoder
(gzip, int32-poster: hex, lat·1e6, lon·1e6, alt/25 ft; tidsposter med magi 0x0E7F7C9D; kallesignalposter lat > 2^30).

- `alle.mjs` → `alle_hendelser.txt`: høyeste fly per sted og hendelse, og hele rutenettet (regnskann_norge) krysset med fly ≥ 15/20/25° alle tre dager.
- `detalj.mjs` → `passeringer.txt`: hver passering ≥ 10° (tid, høyde, asimut, kurs).
- `klokke.mjs` → `klokke_spor.txt`: nordgående spor brukt som klokke (tid → breddegrad).
- `tetthet.mjs` → `tetthet_2309.txt`: antall ulike fly ≥ 20/30/45° over hvert sted 23.09 06–18Z (for «Lite med fly her»).
- `nullregn4.mjs`: MET-radar fra ankomst 21.09 06Z til hvert «NULL REGN»-svar, med våte tidspunkt.
- `ovp.mjs`, `fin_hot2.mjs`, `solpkt.mjs`, `retning3.mjs` → `fin_hot_renavest.json`, `sol_rena.csv`, `retning_rena.csv`: 1 m K0–K4, morgensol 07.50 og ankomst ca. 129° for Rena-vest.

Høydevinkel: sfærisk jord, observatør 300 moh, barometrisk høyde (ft) uten korreksjon. Grov, men godt innenfor forskjellene som diskuteres (6° mot 44–87°).
