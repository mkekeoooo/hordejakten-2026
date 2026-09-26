// Fint søk i regn-hotspotene (#13): kamera på 20 m-rutenett, 150–900 m fra kjørbar OSM-vei, eksakt 1 m K0–K4
// (unike celler, fail-fast K0→K4), direkte uten 5 m-grovfilter. Klynger (8-nabo) + representant med størst margin.
// Bruk: HOT="navn,lat0,lat1,lon0,lon1" node fin_hot.mjs
import fs from 'fs';
import { toUTM, fromUTM, tile } from './trinnA2.mjs';
const d2r = Math.PI / 180, R = 6371000;
const [NAME, LA0, LA1, LO0, LO1] = (process.env.HOT || 's03,60.52,60.61,12.08,12.22').split(',').map((v, i) => i ? +v : v);
const [cla, clo] = [(LA0 + LA1) / 2, (LO0 + LO1) / 2];
const gd = az => { const [x0, y0] = toUTM(cla, clo), [x1, y1] = toUTM(cla + 100 * Math.cos(az * d2r) / R / d2r, clo + 100 * Math.sin(az * d2r) / (R * Math.cos(cla * d2r)) / d2r); return [(x1 - x0) / 100, (y1 - y0) / 100]; };
const [e0, n0] = toUTM(LA0, LO0), [e1, n1] = toUTM(LA1, LO1), [e2] = toUTM(LA0, LO1), [e3] = toUTM(LA1, LO0);
const X0 = Math.floor(Math.min(e0, e3) / 2000) * 2000, X1 = Math.ceil(Math.max(e1, e2) / 2000) * 2000, Y0 = Math.floor(n0 / 2000) * 2000, Y1 = Math.ceil(n1 / 2000) * 2000;
const tiles = new Map(); async function T(kind, x, y) { const tx = Math.floor(x / 2000) * 2000, ty = Math.floor(y / 2000) * 2000, k = `${kind}${tx},${ty}`; if (!tiles.has(k)) tiles.set(k, await tile(kind, tx, ty, tx + 2000, ty + 2000, 1)); return tiles.get(k); }
// forhåndslast alle fliser (med 100 m margin)
for (const kind of ['DOM', 'DTM']) for (let x = X0 - 2000; x < X1 + 2000; x += 2000) for (let y = Y0 - 2000; y < Y1 + 2000; y += 2000) await T(kind, x, y);
const at = (kind, x, y) => { const tx = Math.floor(x / 2000) * 2000, ty = Math.floor(y / 2000) * 2000, t = tiles.get(`${kind}${tx},${ty}`); if (!t) return NaN; const c = Math.floor(x - t.x0), r = Math.floor(t.y1 - y); return c < 0 || r < 0 || c >= t.W || r >= t.H ? NaN : t.d[r * t.W + c]; };
const chm = (x, y) => Math.max(0, at('DOM', x, y) - at('DTM', x, y));
const segs = []; for (const w of JSON.parse(fs.readFileSync('roads_solor.json', 'utf8')).elements) { const g = w.geometry.map(p => toUTM(p.lat, p.lon)); for (let i = 1; i < g.length; i++) segs.push([...g[i - 1], ...g[i]]); }
const H5 = new Map(), key = (x, y) => `${Math.floor(x / 500)},${Math.floor(y / 500)}`;
for (const s of segs) { const [ax, ay, bx, by] = s, L = Math.hypot(bx - ax, by - ay), m = Math.max(1, Math.ceil(L / 250)); const ks = new Set(); for (let i = 0; i <= m; i++) ks.add(key(ax + (bx - ax) * i / m, ay + (by - ay) * i / m)); for (const k of ks) { if (!H5.has(k)) H5.set(k, []); H5.get(k).push(s); } }
const roadDist = (x, y) => { let best = Infinity; const cx = Math.floor(x / 500), cy = Math.floor(y / 500); for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) for (const [ax, ay, bx, by] of H5.get(`${cx + i},${cy + j}`) || []) { const vx = bx - ax, vy = by - ay, t = Math.max(0, Math.min(1, ((x - ax) * vx + (y - ay) * vy) / (vx * vx + vy * vy || 1))); best = Math.min(best, Math.hypot(x - ax - t * vx, y - ay - t * vy)); } return best; };
const K = [[212, 226, 3, 7, 'med', 3, '<'], [213, 226, 8, 17, 'med', 3, '<'], [190, 207, 3, 20, 'p90', 10, '>='], [232, 250, 5, 25, 'p90', 10, '>='], [213, 226, 25, 70, 'p90', 12, '>=']];
const offs = K.map(([a0, a1, r0, r1]) => { const o = []; for (let az = a0; az <= a1; az += 0.5) { const [vx, vy] = gd(az); for (let r = r0; r <= r1; r += 0.5) o.push([vx * r, vy * r]); } return o; });
const q = (v, p) => { v.sort((a, b) => a - b); return v[Math.floor(p * (v.length - 1))]; };
const pass = new Map(); let tested = 0;
for (let x = Math.ceil(Math.min(e0, e3) / 20) * 20; x <= Math.max(e1, e2); x += 20) for (let y = Math.ceil(n0 / 20) * 20; y <= n1; y += 20) {
  const rd = roadDist(x, y); if (!(rd >= 150 && rd <= 900)) continue; tested++; const vals = []; let margin = Infinity, ok = true;
  for (let k = 0; k < 5 && ok; k++) { const [, , , , st, th, op] = K[k], cells = new Map(); for (const [ox, oy] of offs[k]) { const xx = x + ox, yy = y + oy, kk = Math.floor(xx) * 1e7 + Math.floor(yy); if (!cells.has(kk)) cells.set(kk, chm(Math.floor(xx) + 0.5, Math.floor(yy) + 0.5)); }
    const v = [...cells.values()].filter(Number.isFinite); if (!v.length) { ok = false; break; } const val = st === 'med' ? q(v, .5) : q(v, .9); vals.push(val); const m = op === '<' ? th - val : val - th; margin = Math.min(margin, m); if (m < 0) ok = false; }
  if (ok) pass.set(`${x},${y}`, { x, y, vals, margin, rd }); }
const seen = new Set(), cl = [];
for (const [k0, p0] of pass) { if (seen.has(k0)) continue; const st = [p0], mem = []; seen.add(k0); while (st.length) { const p = st.pop(); mem.push(p); for (const [a, b] of [[20, 0], [-20, 0], [0, 20], [0, -20], [20, 20], [20, -20], [-20, 20], [-20, -20]]) { const kk = `${p.x + a},${p.y + b}`; if (pass.has(kk) && !seen.has(kk)) { seen.add(kk); st.push(pass.get(kk)); } } }
  cl.push({ n: mem.length, best: mem.reduce((a, b) => b.margin > a.margin ? b : a) }); }
cl.sort((a, b) => b.n - a.n || b.best.margin - a.best.margin);
const out = cl.map(c => { const [la, lo] = fromUTM(c.best.x, c.best.y); return { la: +la.toFixed(5), lo: +lo.toFixed(5), n: c.n, margin: +c.best.margin.toFixed(2), vei: Math.round(c.best.rd), K: c.best.vals.map(v => +v.toFixed(1)) }; });
fs.writeFileSync(`fin_hot_${NAME}.json`, JSON.stringify(out, null, 1));
console.log(`${NAME}: ${tested} posisjoner (20 m, 150–900 m fra vei), består 1 m K0–K4: ${pass.size}, klynger: ${cl.length}`);
for (const o of out.slice(0, 12)) console.log(`  ${o.la}, ${o.lo}  klynge ${o.n} pos · margin ${o.margin} m · vei ${o.vei} m · K ${o.K.join('/')}`);
