// Finsøk rundt A01 (61,23076 / 11,72394): kamera på 5 m-rutenett innen 300 m, eksakt 1 m K0–K4 (unike celler).
// Rapporterer antall beståtte posisjoner, klynger (8-nabo på 5 m-rutenettet), og klyngesentre med K-verdier.
import fs from 'fs';
import { toUTM, fromUTM, tile } from './trinnA2.mjs';
const d2r = Math.PI / 180, R = 6371000;
const [LA, LO] = (process.env.PT || '61.23076,11.72394').split(',').map(Number);
const [E, N] = toUTM(LA, LO); const X0 = Math.floor(E) - 400, Y0 = Math.floor(N) - 400;
const dom = await tile('DOM', X0, Y0, X0 + 800, Y0 + 800, 1), dtm = await tile('DTM', X0, Y0, X0 + 800, Y0 + 800, 1);
const at = (t, x, y) => { const c = Math.floor((x - t.x0) / t.res), r = Math.floor((t.y1 - y) / t.res); return c < 0 || r < 0 || c >= t.W || r >= t.H ? NaN : t.d[r * t.W + c]; };
const chm = (x, y) => Math.max(0, at(dom, x, y) - at(dtm, x, y));
const gd = az => { const [x0, y0] = toUTM(LA, LO), [x1, y1] = toUTM(LA + 100 * Math.cos(az * d2r) / R / d2r, LO + 100 * Math.sin(az * d2r) / (R * Math.cos(LA * d2r)) / d2r); return [(x1 - x0) / 100, (y1 - y0) / 100]; };
const K = [[212, 226, 3, 7, 'med', 3, '<'], [213, 226, 8, 17, 'med', 3, '<'], [190, 207, 3, 20, 'p90', 10, '>='], [232, 250, 5, 25, 'p90', 10, '>='], [213, 226, 25, 70, 'p90', 12, '>=']];
const offs = K.map(([a0, a1, r0, r1]) => { const o = []; for (let az = a0; az <= a1; az += 0.5) { const [vx, vy] = gd(az); for (let r = r0; r <= r1; r += 0.5) o.push([vx * r, vy * r]); } return o; });
const q = (v, p) => { v.sort((a, b) => a - b); return v[Math.floor(p * (v.length - 1))]; };
const pass = new Map(); let tested = 0;
for (let dx = -300; dx <= 300; dx += 5) for (let dy = -300; dy <= 300; dy += 5) { if (dx * dx + dy * dy > 90000) continue; tested++;
  const cx = E + dx, cy = N + dy, vals = []; let ok = true, margin = Infinity;
  for (let k = 0; k < 5 && ok; k++) { const [, , , , st, th, op] = K[k]; const cells = new Map();
    for (const [ox, oy] of offs[k]) { const x = cx + ox, y = cy + oy, kk = Math.floor(x) * 1e7 + Math.floor(y); if (!cells.has(kk)) cells.set(kk, chm(Math.floor(x) + 0.5, Math.floor(y) + 0.5)); }
    const v = [...cells.values()].filter(Number.isFinite), val = st === 'med' ? q(v, .5) : q(v, .9); vals.push(val); const m = op === '<' ? th - val : val - th; margin = Math.min(margin, m); if (m < 0) ok = false; }
  if (ok) pass.set(`${dx},${dy}`, { dx, dy, vals, margin }); }
// klynger
const seen = new Set(), cl = [];
for (const [k0, p0] of pass) { if (seen.has(k0)) continue; const st = [p0], mem = []; seen.add(k0);
  while (st.length) { const p = st.pop(); mem.push(p); for (const [a, b] of [[5, 0], [-5, 0], [0, 5], [0, -5], [5, 5], [5, -5], [-5, 5], [-5, -5]]) { const kk = `${p.dx + a},${p.dy + b}`; if (pass.has(kk) && !seen.has(kk)) { seen.add(kk); st.push(pass.get(kk)); } } }
  const best = mem.reduce((a, b) => b.margin > a.margin ? b : a); cl.push({ n: mem.length, best }); }
cl.sort((a, b) => b.n - a.n || b.best.margin - a.best.margin);
console.log(`Finsøk ${LA}, ${LO}: ${tested} posisjoner (5 m, r ≤ 300 m), består K0–K4: ${pass.size}, klynger: ${cl.length}`);
for (const c of cl.slice(0, 8)) { const [la, lo] = fromUTM(E + c.best.dx, N + c.best.dy); console.log(`  klynge ${c.n} pos · beste ${la.toFixed(5)}, ${lo.toFixed(5)} (${c.best.dx >= 0 ? '+' : ''}${c.best.dx} Ø / ${c.best.dy >= 0 ? '+' : ''}${c.best.dy} N m) margin ${c.best.margin.toFixed(1)} m · K ${c.best.vals.map(v => v.toFixed(1)).join('/')}`); }
fs.writeFileSync(`finsok_${LA}_${LO}.json`, JSON.stringify({ tested, pass: [...pass.values()], clusters: cl.map(c => ({ n: c.n, ...c.best })) }));
