// Adkomstkontroll (Codex #10: «nærmeste veilinje alene var det som ga C07-problemet»). For hver bekreftet kandidat
// (trinnB-linjer med «beste lat, lon»): nærmeste punkt på kjørbar OSM-vei, rett linje vei→kamera, og langs den:
//  - krysser den elv/bekk/kanal (OSM waterway), innsjø/tjern (natural=water) eller myr (natural=wetland)?
//  - stigning (sluttpunkt − start), største helning over 10 m, samlet høydemeter opp; gangtid etter Toblers funksjon.
// Rapporterer også minste margin til K-tersklene (følsomhet). Bruk: ONAME=<område> node adkomst.mjs
import fs from 'fs';
import { toUTM, tile } from './trinnA2.mjs';
const ON = process.env.ONAME || 'engerdal';
const src = ON === 'engerdal' ? 'trinnB_resultat.txt' : `trinnB_${ON}.txt`;
const rd = JSON.parse(fs.readFileSync(`roads_${ON}.json`, 'utf8')).elements;
const cand = fs.readFileSync(src, 'utf8').split('\n').map(l => l.match(/beste ([\d.]+), ([\d.]+) K=([\d./]+) · morgensol krever flate ≥ ([\d.]+) m/)).filter(Boolean)
  .map(m => ({ la: +m[1], lo: +m[2], K: m[3].split('/').map(Number), sun: +m[4] })).filter(c => c.sun <= 10);
const la0 = Math.min(...cand.map(c => c.la)) - 0.02, la1 = Math.max(...cand.map(c => c.la)) + 0.02, lo0 = Math.min(...cand.map(c => c.lo)) - 0.04, lo1 = Math.max(...cand.map(c => c.lo)) + 0.04;
const wf = `water_${ON}.json`;
if (!fs.existsSync(wf)) { const Q = `[out:json][timeout:180];(way["waterway"~"^(river|stream|canal)$"](${la0},${lo0},${la1},${lo1});way["natural"~"^(water|wetland)$"](${la0},${lo0},${la1},${lo1});relation["natural"~"^(water|wetland)$"](${la0},${lo0},${la1},${lo1}););out geom;`;
  const r = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', headers: { 'User-Agent': 'hordejakten-audit/1.0', 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'data=' + encodeURIComponent(Q) });
  fs.writeFileSync(wf, await r.text()); }
const W = JSON.parse(fs.readFileSync(wf, 'utf8')).elements;
const lines = [], polys = [];
for (const e of W) { const geoms = e.type === 'relation' ? (e.members || []).filter(m => m.geometry).map(m => m.geometry) : [e.geometry];
  for (const g of geoms) { const pts = g.map(p => toUTM(p.lat, p.lon)); const t = e.tags || {};
    if (t.waterway) lines.push({ kind: t.waterway, pts }); else polys.push({ kind: t.natural === 'wetland' ? 'myr' : 'vann', pts }); } }
const segX = (a, b, c, d) => { const o = (p, q, r) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])); return o(a, b, c) !== o(a, b, d) && o(c, d, a) !== o(c, d, b); };
const inPoly = (p, pts) => { let c = false; for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) { const [xi, yi] = pts[i], [xj, yj] = pts[j]; if ((yi > p[1]) !== (yj > p[1]) && p[0] < (xj - xi) * (p[1] - yi) / (yj - yi) + xi) c = !c; } return c; };
const roadSegs = []; for (const w of rd) { const g = w.geometry.map(p => toUTM(p.lat, p.lon)); for (let i = 1; i < g.length; i++) roadSegs.push([g[i - 1], g[i], w.tags?.highway]); }
const TH = [[3, '<'], [3, '<'], [10, '>='], [10, '>='], [12, '>=']];
const out = ['lat,lon,veitype,avstand_m,stigning_m,hoydemeter_opp,maks_helning_pst,gangtid_min,krysser,min_K_margin_m,morgensol_m'];
for (const c of cand) {
  const P = toUTM(c.la, c.lo); let best = null;
  for (const [a, b, hw] of roadSegs) { const vx = b[0] - a[0], vy = b[1] - a[1], t = Math.max(0, Math.min(1, ((P[0] - a[0]) * vx + (P[1] - a[1]) * vy) / (vx * vx + vy * vy || 1))); const q = [a[0] + t * vx, a[1] + t * vy], d = Math.hypot(P[0] - q[0], P[1] - q[1]); if (!best || d < best.d) best = { d, q, hw }; }
  const cross = new Set();
  for (const l of lines) for (let i = 1; i < l.pts.length; i++) if (segX(best.q, P, l.pts[i - 1], l.pts[i])) cross.add(l.kind === 'river' ? 'elv' : l.kind === 'stream' ? 'bekk' : 'kanal');
  for (const pg of polys) { let hit = inPoly(P, pg.pts) || inPoly(best.q, pg.pts); if (!hit) for (let i = 1; i < pg.pts.length && !hit; i++) if (segX(best.q, P, pg.pts[i - 1], pg.pts[i])) hit = true; if (hit) cross.add(pg.kind); }
  const X0 = Math.floor(Math.min(P[0], best.q[0])) - 20, Y0 = Math.floor(Math.min(P[1], best.q[1])) - 20, X1 = Math.ceil(Math.max(P[0], best.q[0])) + 20, Y1 = Math.ceil(Math.max(P[1], best.q[1])) + 20;
  const dtm = await tile('DTM', X0, Y0, X1, Y1, 1); const z = (x, y) => dtm.d[Math.floor(dtm.y1 - y) * dtm.W + Math.floor(x - dtm.x0)];
  const n = Math.max(2, Math.round(best.d / 10)); let up = 0, maxS = 0, tMin = 0, prev = z(best.q[0], best.q[1]);
  for (let i = 1; i <= n; i++) { const x = best.q[0] + (P[0] - best.q[0]) * i / n, y = best.q[1] + (P[1] - best.q[1]) * i / n, h = z(x, y), dz = h - prev, dx = best.d / n, s = dz / dx;
    if (dz > 0) up += dz; maxS = Math.max(maxS, Math.abs(s)); tMin += dx / 1000 / (6 * Math.exp(-3.5 * Math.abs(s + 0.05))) * 60; prev = h; }
  const margin = Math.min(...c.K.map((v, i) => TH[i][1] === '<' ? TH[i][0] - v : v - TH[i][0]));
  out.push([c.la, c.lo, best.hw, best.d.toFixed(0), (z(P[0], P[1]) - z(best.q[0], best.q[1])).toFixed(0), up.toFixed(0), (100 * maxS).toFixed(0), tMin.toFixed(1), [...cross].join('+') || '–', margin.toFixed(1), c.sun].join(','));
}
fs.writeFileSync(`adkomst_${ON}.csv`, out.join('\n') + '\n');
console.log(out.join('\n'));
