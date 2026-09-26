// Uavhengige bevis (regnsekvens 26.09 + seks solhendelser) mot default.nos fusjonsmodell (23.09).
// default.no: posterior ∝ exp(−score). «Kjerne» = cellene med topp 50 % av massen, «bred» = topp 80 %.
// Norge-maske = celler der default.no har gyldig score (< 1e5); Sverige og hav faller bort.
import fs from 'fs';
const D = JSON.parse(fs.readFileSync('../dno_fusion.json', 'utf8'));
const idx = (la, lo) => { const i = Math.round((la - D.lat_min) / D.lat_step), j = Math.round((lo - D.lon_min) / D.lon_step); return i < 0 || j < 0 || i >= D.nlat || j >= D.nlon ? -1 : i * D.nlon + j; };
const valid = D.score.map(s => s < 1e5), p = D.score.map((s, k) => valid[k] ? Math.exp(-s) : 0), tot = p.reduce((a, b) => a + b, 0);
const order = [...p.keys()].filter(k => valid[k]).sort((a, b) => p[b] - p[a]); const cum = new Float64Array(p.length).fill(1); let c = 0; for (const k of order) { c += p[k] / tot; cum[k] = c; }
const R = JSON.parse(fs.readFileSync('regnskann_norge.json', 'utf8'));
const F = fs.readFileSync('flerdag.csv', 'utf8').trim().split('\n').slice(1).map(l => l.split(',').map(Number)); // lat,lon,6 verdier,konflikter,forenlige
const fl = (la, lo) => { let b = null, bd = 1e9; for (const r of F) { const d = (r[0] - la) ** 2 + ((r[1] - lo) * 0.5) ** 2; if (d < bd) { bd = d; b = r; } } return bd < 0.003 ? b : null; };
const cells = [];
for (let k = 0; k < R.LAT.length; k++) { const s = R.score[1][k]; if (s == null || s < 1.4) continue; const la = R.LAT[k], lo = R.LON[k], di = idx(la, lo); if (di < 0 || !valid[di]) continue;
  const f = fl(la, lo); cells.push({ la, lo, s, s05: R.score[0][k], s2: R.score[2][k], cum: cum[di], konf: f ? f[8] : null }); }
// grupper i 10 km-klynger
const cl = []; for (const x of cells.sort((a, b) => b.s - a.s)) { const g = cl.find(g => Math.hypot((g.la - x.la) * 111, (g.lo - x.lo) * 55) < 10); if (g) { g.n++; g.best = g.best.s >= x.s ? g.best : x; } else cl.push({ la: x.la, lo: x.lo, n: 1, best: x }); }
const lab = cm => cm <= 0.5 ? 'default-KJERNE' : cm <= 0.8 ? 'default-bred' : 'UTENFOR default';
console.log('Regnsekvens ≥ 1,4 (0,1 mm/t) i Norge, gruppert i 10 km-klynger. Sol-konflikter fra flerdag (0 = forenlig):');
for (const g of cl.sort((a, b) => b.best.s - a.best.s)) console.log(`  ${g.best.la.toFixed(3)}, ${g.best.lo.toFixed(3)}  celler ${String(g.n).padStart(2)}  score ${g.best.s05?.toFixed(2)}/${g.best.s.toFixed(2)}/${g.best.s2?.toFixed(2)}  sol-konflikter ${g.best.konf ?? '–'}  default-masseposisjon ${(100 * g.best.cum).toFixed(0)} %  → ${lab(g.best.cum)}`);
fs.writeFileSync('utenfor_default.json', JSON.stringify(cl, null, 1));
