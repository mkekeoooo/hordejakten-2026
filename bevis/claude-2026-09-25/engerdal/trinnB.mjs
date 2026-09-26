// Trinn B: eksakt K0–K4 på 1 m (unike celler, Codex-varianten) i et 5x5-nabolag (±20 m) rundt trinn A-treffene,
// og morgensolgrensen (#2): laveste flatehøyde i lyssektoren 238–250°, 5–150 m som får sol kl. 07.50 21.09.
import fs from 'fs';
import { toUTM, fromUTM, tile } from './trinnA.mjs';
const d2r = Math.PI / 180, R = 6371000, k = 0.13;
const K = [['K0', 212, 226, 3, 7, 'med', 3, '<'], ['K1', 213, 226, 8, 17, 'med', 3, '<'], ['K2', 190, 207, 3, 20, 'p90', 10, '>='], ['K3', 232, 250, 5, 25, 'p90', 10, '>='], ['K4', 213, 226, 25, 70, 'p90', 12, '>=']];
const rows = fs.readFileSync('trinnA.csv', 'utf8').trim().split('\n').slice(1).map(l => l.split(',').map(Number));
const q = (v, p) => { v.sort((a, b) => a - b); return v[Math.floor(p * (v.length - 1))]; };
for (const [E, N, la, lo] of rows) {
  const gd = az => { const [x0, y0] = toUTM(la, lo); const [x1, y1] = toUTM(la + 100 * Math.cos(az * d2r) / R / d2r, lo + 100 * Math.sin(az * d2r) / (R * Math.cos(la * d2r)) / d2r); return [(x1 - x0) / 100, (y1 - y0) / 100]; };
  const X0 = Math.floor(E) - 200, Y0 = Math.floor(N) - 200;
  const dom = await tile('DOM', X0, Y0, X0 + 400, Y0 + 400, 1), dtm = await tile('DTM', X0, Y0, X0 + 400, Y0 + 400, 1);
  const at = (t, x, y) => { const c = Math.floor((x - t.x0) / t.res), r = Math.floor((t.y1 - y) / t.res); return c < 0 || r < 0 || c >= t.W || r >= t.H ? NaN : t.d[r * t.W + c]; };
  const chm = (x, y) => Math.max(0, at(dom, x, y) - at(dtm, x, y));
  let pass = 0, best = null;
  for (let oe = -20; oe <= 20; oe += 10) for (let on = -20; on <= 20; on += 10) {
    const [ex, ey] = gd(90), [nx, ny] = gd(0), cx = E + ex * oe + nx * on, cy = N + ey * oe + ny * on; const vals = []; let ok = true;
    for (const [, a0, a1, r0, r1, st, th, op] of K) { const cells = new Map();
      for (let az = a0; az <= a1; az += 0.25) { const [vx, vy] = gd(az); for (let r = r0; r <= r1; r += 0.25) { const x = cx + vx * r, y = cy + vy * r, kk = Math.floor(x) * 1e7 + Math.floor(y); if (!cells.has(kk)) cells.set(kk, chm(Math.floor(x) + 0.5, Math.floor(y) + 0.5)); } }
      const v = [...cells.values()].filter(Number.isFinite), val = st === 'med' ? q(v, .5) : q(v, .9); vals.push(val.toFixed(1)); if (!(op === '<' ? val < th : val >= th)) ok = false; }
    if (ok) { pass++; if (!best) best = [cx, cy, vals]; } }
  let sunTxt = '–';
  if (best) { // morgensolgrense fra beste beståtte posisjon
    const [cx, cy] = best, far = await tile('DTM', Math.floor(cx) - 400, Math.floor(cy) - 6000, Math.floor(cx) + 20000, Math.floor(cy) + 2000, 20), near = await tile('DTM', Math.floor(cx) - 250, Math.floor(cy) - 450, Math.floor(cx) + 1250, Math.floor(cy) + 250, 1);
    const [vx, vy] = gd(97.9), tanE = Math.tan(5.65 * d2r); let minZ = Infinity;
    for (let az = 238; az <= 250; az += 1) { const [ux, uy] = gd(az); for (let r = 5; r <= 150; r += 5) { const x = cx + ux * r, y = cy + uy * r, g = at(near, x, y); if (!Number.isFinite(g)) continue; let need = 0;
      for (let d = 2; d < 20000; d += d < 1200 ? 1 : 20) { const t = at(d < 1200 ? near : far, x + vx * d, y + vy * d); if (!Number.isFinite(t)) continue; const v = t - d * d * (1 - k) / (2 * R) - (g + d * tanE); if (v > need) need = v; } if (need < minZ) minZ = need; } }
    sunTxt = `${minZ.toFixed(1)} m`; }
  const [bla, blo] = best ? fromUTM(best[0], best[1]) : [la, lo];
  console.log(`${la.toFixed(5)}, ${lo.toFixed(5)}: 1 m K0–K4 består ${pass}/25` + (best ? ` · beste ${bla.toFixed(5)}, ${blo.toFixed(5)} K=${best[2].join('/')} · morgensol krever flate ≥ ${sunTxt}` : ''));
}
