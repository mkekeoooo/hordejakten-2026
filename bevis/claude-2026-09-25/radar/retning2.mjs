// Kombinert ankomsttest (Codex #12: «ikke ubetinget samsvar både på oppoverbakke og retning ved å bruke ulike veier»).
// For hvert robust punkt: finn kjørbare veipunkter (fortettet hvert 20 m) der retningen kandidat→vei er 100–160°
// (tavla «KOM FRA DEN VEIEN ←» lest som ca. 129°, se #4), og rett linje vei→kandidat gir 4–12 min (Tobler × 1,4),
// ≥ +10 m opp og ingen kryssing av OSM-elv/-bekk/-vann. Myk test: pil-tolkningen er usikker.
import fs from 'fs';
import { toUTM, tile } from './trinnA2.mjs';
const d2r = Math.PI / 180;
const rob = fs.readFileSync(process.env.ROB || '../watch/robuste.csv', 'utf8').trim().split('\n').slice(1).map(l => { const a = l.split(','); return { area: a[0], la: +a[1], lo: +a[2] }; });
const cache = {};
const load = area => { if (cache[area]) return cache[area];
  const rd = JSON.parse(fs.readFileSync(`roads_${area}.json`, 'utf8')).elements, wt = fs.existsSync(`water_${area}.json`) ? JSON.parse(fs.readFileSync(`water_${area}.json`, 'utf8')).elements : [];
  const pts = []; for (const w of rd) { const g = w.geometry.map(p => toUTM(p.lat, p.lon)); for (let i = 1; i < g.length; i++) { const [a, b] = [g[i - 1], g[i]], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(L / 20)); for (let j = 0; j <= n; j++) pts.push([a[0] + (b[0] - a[0]) * j / n, a[1] + (b[1] - a[1]) * j / n, w.tags?.highway]); } }
  const water = []; for (const e of wt) { const gs = e.type === 'relation' ? (e.members || []).filter(m => m.geometry).map(m => m.geometry) : [e.geometry]; for (const g of gs) if (g) water.push({ kind: e.tags?.waterway || e.tags?.natural, pts: g.map(p => toUTM(p.lat, p.lon)) }); }
  return cache[area] = { pts, water }; };
const segX = (a, b, c, d) => { const o = (p, q, r) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])); return o(a, b, c) !== o(a, b, d) && o(c, d, a) !== o(c, d, b); };
const tob = (dx, dz) => dx / 1000 / (6 * Math.exp(-3.5 * Math.abs(dz / dx + 0.05))) * 60;
const out = ['område,lat,lon,beste_retning,avstand_m,stigning_m,gange_min,veitype,vann_krysset'];
for (const c of rob) {
  const { pts, water } = load('solor'), C = toUTM(c.la, c.lo);
  const near = pts.filter(p => { const d = Math.hypot(p[0] - C[0], p[1] - C[1]); if (d < 100 || d > 1100) return false; const brg = (Math.atan2(p[0] - C[0], p[1] - C[1]) / d2r + 360) % 360; return brg >= 100 && brg <= 160; });
  let best = null;
  if (near.length) { const X0 = Math.floor(C[0]) - 1200, Y0 = Math.floor(C[1]) - 1200, dtm = await tile('DTM', X0, Y0, X0 + 2400, Y0 + 2400, 2);
    const z = (x, y) => dtm.d[Math.floor((dtm.y1 - y) / 2) * dtm.W + Math.floor((x - dtm.x0) / 2)];
    for (const p of near) { const L = Math.hypot(p[0] - C[0], p[1] - C[1]), n = Math.max(2, Math.round(L / 10)); let t = 0, prev = z(p[0], p[1]);
      for (let j = 1; j <= n; j++) { const x = p[0] + (C[0] - p[0]) * j / n, y = p[1] + (C[1] - p[1]) * j / n, h = z(x, y); t += 1.4 * tob(L / n, (h - prev) || 0); prev = h; }
      const up = z(C[0], C[1]) - z(p[0], p[1]); if (!(t >= 4 && t <= 12 && up >= 10)) continue;
      let wet = false; for (const w of water) { if (!/river|stream|canal|water/.test(w.kind || '')) continue; for (let i = 1; i < w.pts.length && !wet; i++) if (segX(p, C, w.pts[i - 1], w.pts[i])) wet = true; if (wet) break; }
      if (wet) continue; const brg = (Math.atan2(p[0] - C[0], p[1] - C[1]) / d2r + 360) % 360;
      const sc = Math.abs(brg - 129); if (!best || sc < best.sc) best = { sc, brg, L, up, t, hw: p[2] }; } }
  out.push(best ? [c.area, c.la, c.lo, best.brg.toFixed(0), best.L.toFixed(0), best.up.toFixed(0), best.t.toFixed(1), best.hw, 'nei'].join(',') : [c.area, c.la, c.lo, '', '', '', '', '', ''].join(','));
}
fs.writeFileSync(process.env.OUT || 'retning.csv', out.join('\n') + '\n');
const ok = out.slice(1).filter(l => l.split(',')[3] !== '');
console.log(`${ok.length} av ${rob.length} robuste punkter har en ankomst fra 100–160° som er 4–12 min, ≥ +10 m opp og uten kartlagt vannkryssing:`);
for (const l of ok) console.log('  ' + l);
