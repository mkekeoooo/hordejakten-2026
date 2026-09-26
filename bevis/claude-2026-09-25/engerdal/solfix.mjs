// Retting (Codex #12): fjernrasteret (20 m) ble indeksert som 1 m i trinnB/trinnB2, så terreng > 1,2 km falt bort.
// Her regnes morgensolgrensen på nytt for alle streng-adkomst-kandidater + gamle, med korrekt indeks (÷ res).
import fs from 'fs';
import { toUTM, tile } from './trinnA2.mjs';
const d2r = Math.PI / 180, R = 6371000, k = 0.13;
const at = (t, x, y) => { const c = Math.floor((x - t.x0) / t.res), r = Math.floor((t.y1 - y) / t.res); return c < 0 || r < 0 || c >= t.W || r >= t.H ? NaN : t.d[r * t.W + c]; };
const cand = [];
for (const f of ['strict.md', 'strict_solor.md']) for (const l of fs.readFileSync(f, 'utf8').trim().split('\n')) { const c = l.split('|').map(s => s.trim()); const [la, lo] = c[2].split(',').map(Number); cand.push([c[1], la, lo]); }
for (const [n, la, lo] of [['engerdal', 61.78589, 11.9141], ['engerdal', 61.76689, 11.93231], ['engerdal', 61.74803, 11.95753], ['engerdal', 61.73449, 11.96226]]) cand.push([n, la, lo]);
const out = ['område,lat,lon,min_flatehoyde_m,gyldige_fjernprover'];
for (const [n, la, lo] of cand) {
  const [cx, cy] = toUTM(la, lo); const gd = az => { const [x0, y0] = toUTM(la, lo), [x1, y1] = toUTM(la + 100 * Math.cos(az * d2r) / R / d2r, lo + 100 * Math.sin(az * d2r) / (R * Math.cos(la * d2r)) / d2r); return [(x1 - x0) / 100, (y1 - y0) / 100]; };
  const far = await tile('DTM', Math.floor(cx) - 400, Math.floor(cy) - 6000, Math.floor(cx) + 20000, Math.floor(cy) + 2000, 20), near = await tile('DTM', Math.floor(cx) - 250, Math.floor(cy) - 450, Math.floor(cx) + 1250, Math.floor(cy) + 250, 1);
  const [vx, vy] = gd(97.9), tanE = Math.tan(5.65 * d2r); let minZ = Infinity, farOk = 0;
  for (let az = 238; az <= 250; az += 1) { const [ux, uy] = gd(az); for (let r = 5; r <= 150; r += 5) { const x = cx + ux * r, y = cy + uy * r, g = at(near, x, y); if (!Number.isFinite(g)) continue; let need = 0;
    for (let d = 2; d < 20000; d += d < 1200 ? 1 : 20) { const t = at(d < 1200 ? near : far, x + vx * d, y + vy * d); if (!Number.isFinite(t)) continue; if (d >= 1200) farOk++; const v = t - d * d * (1 - k) / (2 * R) - (g + d * tanE); if (v > need) need = v; }
    if (need < minZ) minZ = need; } }
  out.push(`${n},${la},${lo},${minZ.toFixed(1)},${farOk}`);
}
fs.writeFileSync('solfix.csv', out.join('\n') + '\n');
const changed = out.slice(1).map(l => l.split(',')).filter(a => +a[3] > 0);
console.log(`${cand.length} kandidater regnet på nytt. Nødvendig flatehøyde > 0 m: ${changed.length}`); for (const a of changed) console.log('  ', a.join(' '));
