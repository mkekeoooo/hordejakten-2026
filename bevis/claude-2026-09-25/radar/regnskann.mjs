// Regnsekvens 26.09 mot MET-radar over hele Sørøst-Norge (utvider Codex' 9-punktstest i #13).
// Anjas referater (default.no, CEST): regn = 07.45* 08.35 08.50 08.57 10.27 10.47 10.57 11.34 11.40 11.57 12.07,
// opphold = 09.10 09.21 09.37 10.34 11.20 12.24 (09.05 «mye mindre», 09.47/10.01 «drypp» utelatt). *07.45 «småregn».
// Per celle: snitt av 3×3 celler og ±5 min (3 tidssteg). Treff: regn ⇒ snitt ≥ terskel, opphold ⇒ snitt < terskel.
// Score = regntreff/11 + oppholdstreff/6 (lik vekt). Manglende verdier holdes som manglende (Codex).
import fs from 'fs'; import { execFileSync } from 'child_process';
const URL = 'https://thredds.met.no/thredds/dodsC/remotesensing/reflectivity-nordic/2026/09/yrwms-nordic.mos.pcappi-0-dbz.noclass-clfilter-novpr-clcorr-block.nordiclcc-1000.20260926.nc';
const enc = q => q.split('[').join('%5B').split(']').join('%5D');
const get = async q => { for (let a = 0; a < 4; a++) { const r = await fetch(`${URL}.ascii?${enc(q)}`); if (r.ok) return r.text(); await new Promise(s => setTimeout(s, 3000)); } throw new Error('feil ' + q); };
const rows = (t, key) => { const body = t.split(key)[1] || t, out = []; for (const l of body.split('\n')) { const m = l.match(/^((?:\[\d+\])+),\s*(.*)$/); if (m) out.push(m[2].split(',').map(Number)); } return out; };
const RAIN = ['05:45', '06:35', '06:50', '06:57', '08:27', '08:47', '08:57', '09:34', '09:40', '09:57', '10:07'], DRY = ['07:10', '07:21', '07:37', '08:34', '09:20', '10:24'];
// region-indekser fra grovt gitter
const S = 8, gl = rows(await get(`lat[0:${S}:2133][0:${S}:1693]`), 'lat.lat'), go = rows(await get(`lon[0:${S}:2133][0:${S}:1693]`), 'lon.lon');
let y0 = 1e9, y1 = -1, x0 = 1e9, x1 = -1;
gl.forEach((r, i) => r.forEach((v, j) => { const o = go[i][j]; if (v >= 59.4 && v <= 62.6 && o >= 9.3 && o <= 13.2) { y0 = Math.min(y0, i * S); y1 = Math.max(y1, i * S); x0 = Math.min(x0, j * S); x1 = Math.max(x1, j * S); } }));
y0 = Math.max(0, y0 - S); x0 = Math.max(0, x0 - S); y1 += S; x1 += S; const H = y1 - y0 + 1, W = x1 - x0 + 1;
console.log(`region Yc ${y0}–${y1}, Xc ${x0}–${x1} (${W}×${H} celler)`);
const LAT = rows(await get(`lat[${y0}:1:${y1}][${x0}:1:${x1}]`), 'lat.lat'), LON = rows(await get(`lon[${y0}:1:${y1}][${x0}:1:${x1}]`), 'lon.lon');
const T = (await get('time')).split('\n').slice(-3).join(' ').match(/\d{9,}/g).map(Number);
const idxNear = hhmm => { const t = Date.parse(`2026-09-26T${hhmm}:00Z`) / 1000; return T.map((v, i) => [Math.abs(v - t), i]).filter(([d]) => d <= 330).map(([, i]) => i); };
async function field(hhmm) { const I = idxNear(hhmm); const acc = new Float32Array(W * H).fill(0), cnt = new Uint8Array(W * H);
  for (const i of I) { const f = rows(await get(`lwe_precipitation_rate[${i}:1:${i}][${y0}:1:${y1}][${x0}:1:${x1}]`), 'lwe_precipitation_rate.lwe_precipitation_rate');
    f.forEach((r, y) => r.forEach((v, x) => { if (v >= 0 && v < 300) { acc[y * W + x] += v; cnt[y * W + x]++; } })); }
  const m = new Float32Array(W * H); for (let k = 0; k < W * H; k++) m[k] = cnt[k] ? acc[k] / cnt[k] : NaN;
  const sm = new Float32Array(W * H); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { let s = 0, c = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const yy = y + dy, xx = x + dx; if (yy < 0 || xx < 0 || yy >= H || xx >= W) continue; const v = m[yy * W + xx]; if (Number.isFinite(v)) { s += v; c++; } } sm[y * W + x] = c ? s / c : NaN; }
  return sm; }
const F = {}; for (const t of [...RAIN, ...DRY]) { F[t] = await field(t); process.stdout.write('.'); } console.log();
const THR = [0.05, 0.1, 0.2], score = THR.map(() => new Float32Array(W * H));
THR.forEach((th, k) => { for (let c = 0; c < W * H; c++) { let r = 0, d = 0, nr = 0, nd = 0; for (const t of RAIN) { const v = F[t][c]; if (Number.isFinite(v)) { nr++; if (v >= th) r++; } } for (const t of DRY) { const v = F[t][c]; if (Number.isFinite(v)) { nd++; if (v < th) d++; } }
  score[k][c] = nr && nd ? r / nr + d / nd : NaN; } });
fs.writeFileSync('regnskann.json', JSON.stringify({ y0, x0, W, H, THR, LAT: LAT.flat(), LON: LON.flat(), score: score.map(s => Array.from(s, v => Number.isFinite(v) ? +v.toFixed(3) : null)) }));
// punktoppslag
const pts = [['L07', 60.82353, 11.5375], ['A01', 61.23076, 11.72394], ['S03', 60.53938, 12.18334], ['#324', 60.4644, 12.1207], ['Sol 60.77395', 60.77395, 12.0867], ['Sol 60.63783', 60.63783, 12.28269], ['Sol 60.55727', 60.55727, 11.77521], ['Sol 60.96777', 60.96777, 12.18526],
  ['kand1 Mykleby', 61.3995, 11.0316], ['Messelt', 61.4571, 10.8362], ['Kongsvinger', 60.19, 12.0], ['Elverum', 60.88, 11.56], ['Trysil', 61.31, 12.26]];
const flat = LAT.flat(), flon = LON.flat(); const near = (la, lo) => { let b = -1, bd = 1e9; for (let c = 0; c < flat.length; c++) { const d = (flat[c] - la) ** 2 + ((flon[c] - lo) * 0.5) ** 2; if (d < bd) { bd = d; b = c; } } return b; };
console.log('Score (maks 2,0) ved terskel 0,05 / 0,1 / 0,2 mm/t:');
for (const [n, la, lo] of pts) { const c = near(la, lo); console.log(`  ${n.padEnd(16)} ${THR.map((_, k) => score[k][c].toFixed(2)).join(' / ')}`); }
// topp-celler (score ved 0,1)
const order = [...score[1].keys()].filter(c => Number.isFinite(score[1][c])).sort((a, b) => score[1][b] - score[1][a]);
const best = score[1][order[0]]; console.log(`Beste score ved 0,1: ${best.toFixed(2)}; celler med ≥ ${(best - 0.1).toFixed(2)}: ${order.filter(c => score[1][c] >= best - 0.1).length}`);
for (const c of order.slice(0, 15)) console.log(`  ${flat[c].toFixed(3)}, ${flon[c].toFixed(3)}  score ${score[0][c].toFixed(2)} / ${score[1][c].toFixed(2)} / ${score[2][c].toFixed(2)}`);
