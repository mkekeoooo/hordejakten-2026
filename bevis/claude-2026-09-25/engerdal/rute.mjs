// Faktisk adkomst (Codex #12): raskeste gangrute fra der en bil kan kjøre til kameraet, langs OSM-nettet.
// Graf: alle OSM highway-linjer innen 2,5 km. Start = noder på kjørbare veier (track/service/unclassified/…).
// Kostnad = Toblers gangtid med helning fra DTM (10 m-steg). Siste strekning utenfor sti: rett linje fra en node
// (≤ 700 m), gangtid × 1,4 (terreng uten sti) og krysser-sjekk mot OSM-vann. Bæring av Anja er ikke modellert.
// Terrengform: TPI (høyde minus snitt i ring 50–150 m) og relieff i 200 m-radius.
import fs from 'fs';
import { toUTM, tile } from './trinnA2.mjs';
const P = [['A01 Osen', 61.23076, 11.72394], ['L07 Elverum/Løten', 60.82353, 11.53750], ['Solør 60.61433', 60.61433, 12.32469], ['Solør 60.53938', 60.53938, 12.18334]];
const DRIVE = /^(track|service|unclassified|tertiary|secondary|primary|residential|trunk)$/;
async function osm(la, lo) { const f = `rute_${la}_${lo}.json`; if (!fs.existsSync(f)) { const d = 0.025, e = 0.05;
  const Q = `[out:json][timeout:90];(way["highway"](${la - d},${lo - e},${la + d},${lo + e});way["waterway"~"^(river|stream|canal)$"](${la - d},${lo - e},${la + d},${lo + e});way["natural"~"^(water|wetland)$"](${la - d},${lo - e},${la + d},${lo + e}););out geom;`;
  const r = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', headers: { 'User-Agent': 'hordejakten-audit/1.0', 'Content-Type': 'application/x-www-form-urlencoded' }, body: 'data=' + encodeURIComponent(Q) }); fs.writeFileSync(f, await r.text()); }
  return JSON.parse(fs.readFileSync(f, 'utf8')).elements; }
const tob = (dx, dz) => dx / 1000 / (6 * Math.exp(-3.5 * Math.abs(dz / dx + 0.05))) * 60; // minutter
const segX = (a, b, c, d) => { const o = (p, q, r) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])); return o(a, b, c) !== o(a, b, d) && o(c, d, a) !== o(c, d, b); };
for (const [navn, la, lo] of P) {
  const el = await osm(la, lo), C = toUTM(la, lo);
  const dtm = await tile('DTM', Math.floor(C[0]) - 2600, Math.floor(C[1]) - 2800, Math.floor(C[0]) + 2600, Math.floor(C[1]) + 2800, 2);
  const z = (x, y) => { const c = Math.floor((x - dtm.x0) / dtm.res), r = Math.floor((dtm.y1 - y) / dtm.res); return c < 0 || r < 0 || c >= dtm.W || r >= dtm.H ? NaN : dtm.d[r * dtm.W + c]; };
  const nodes = new Map(), adj = new Map(), start = new Set(), water = [];
  const nid = p => { const k = `${p.lat.toFixed(7)},${p.lon.toFixed(7)}`; if (!nodes.has(k)) { nodes.set(k, toUTM(p.lat, p.lon)); adj.set(k, []); } return k; };
  for (const w of el) { const t = w.tags || {}; if (!w.geometry) continue;
    if (t.waterway || t.natural) { water.push({ kind: t.waterway || t.natural, pts: w.geometry.map(p => toUTM(p.lat, p.lon)) }); continue; }
    if (!t.highway) continue; const ks = w.geometry.map(nid); if (DRIVE.test(t.highway)) ks.forEach(k => start.add(k));
    for (let i = 1; i < ks.length; i++) { const a = nodes.get(ks[i - 1]), b = nodes.get(ks[i]); let cost = 0; const L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / 10));
      let prev = z(a[0], a[1]); for (let j = 1; j <= n; j++) { const x = a[0] + (b[0] - a[0]) * j / n, y = a[1] + (b[1] - a[1]) * j / n, h = z(x, y); cost += tob(L / n, (h - prev) || 0); prev = h; }
      let back = 0; prev = z(b[0], b[1]); for (let j = 1; j <= n; j++) { const x = b[0] + (a[0] - b[0]) * j / n, y = b[1] + (a[1] - b[1]) * j / n, h = z(x, y); back += tob(L / n, (h - prev) || 0); prev = h; }
      adj.get(ks[i - 1]).push([ks[i], cost, t.highway]); adj.get(ks[i]).push([ks[i - 1], back, t.highway]); } }
  // Dijkstra fra alle kjørbare noder (kostnad 0)
  const dist = new Map(), from = new Map(), Q = [...start].map(k => [0, k]); start.forEach(k => dist.set(k, 0));
  while (Q.length) { Q.sort((a, b) => a[0] - b[0]); const [d, k] = Q.shift(); if (d > (dist.get(k) ?? Infinity)) continue;
    for (const [m, c, hw] of adj.get(k)) { const nd = d + c; if (nd < (dist.get(m) ?? Infinity)) { dist.set(m, nd); from.set(m, [k, hw]); Q.push([nd, m]); } } }
  // beste avslutning utenfor sti
  let best = null;
  for (const [k, d] of dist) { const p = nodes.get(k), L = Math.hypot(C[0] - p[0], C[1] - p[1]); if (L > 700) continue;
    const n = Math.max(1, Math.round(L / 10)); let t = 0, up = 0, prev = z(p[0], p[1]); for (let j = 1; j <= n; j++) { const x = p[0] + (C[0] - p[0]) * j / n, y = p[1] + (C[1] - p[1]) * j / n, h = z(x, y); t += 1.4 * tob(L / n, (h - prev) || 0); if (h > prev) up += h - prev; prev = h; }
    const tot = d + t; if (!best || tot < best.tot) best = { k, d, t, tot, L, up, dz: z(C[0], C[1]) - z(p[0], p[1]) }; }
  let sti = 0, stiUp = 0, path = [], k = best.k; while (from.has(k)) { const [pk, hw] = from.get(k); const a = nodes.get(pk), b = nodes.get(k); sti += Math.hypot(b[0] - a[0], b[1] - a[1]); const dz = z(b[0], b[1]) - z(a[0], a[1]); if (dz > 0) stiUp += dz; path.push(hw); k = pk; }
  const cross = new Set(); const pn = nodes.get(best.k);
  for (const w of water) { for (let i = 1; i < w.pts.length; i++) if (segX(pn, C, w.pts[i - 1], w.pts[i])) cross.add(w.kind); }
  // terrengform
  const z0 = z(C[0], C[1]); let s = 0, n = 0, zs = []; for (let r = 50; r <= 150; r += 10) for (let a = 0; a < 360; a += 10) { const h = z(C[0] + r * Math.sin(a * Math.PI / 180), C[1] + r * Math.cos(a * Math.PI / 180)); if (Number.isFinite(h)) { s += h; n++; } }
  for (let dx = -200; dx <= 200; dx += 10) for (let dy = -200; dy <= 200; dy += 10) if (dx * dx + dy * dy <= 40000) { const h = z(C[0] + dx, C[1] + dy); if (Number.isFinite(h)) zs.push(h); }
  zs.sort((a, b) => a - b);
  const typer = [...new Set(path)].join('/') || '–';
  console.log(`${navn}: raskest ${best.tot.toFixed(1)} min = ${best.d.toFixed(1)} min på ${Math.round(sti)} m ${typer} (+${Math.round(stiUp)} m) + ${best.t.toFixed(1)} min utenfor sti ${Math.round(best.L)} m (${best.dz >= 0 ? '+' : ''}${best.dz.toFixed(0)} m, opp ${best.up.toFixed(0)} m)` +
    ` · krysser utenfor sti: ${[...cross].join('+') || '–'} · TPI(50–150 m) ${(z0 - s / n).toFixed(1)} m · relieff 200 m: ${(zs[Math.floor(zs.length * .95)] - zs[Math.floor(zs.length * .05)]).toFixed(0)} m (p5–p95)`);
}
