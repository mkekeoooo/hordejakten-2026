// Værkonsistens per KANDIDATPUNKT (samme parallaksemodell som flerdag.mjs), for alle som består skog + morgensol +
// streng adkomst (Osen, Elverum/Løten, Solør) og de gamle kandidatene. Hendelser med dokumentert direkte sol:
//   25.09 16.50/17.00 (solstjerne, begge), 23.09 16.45/16.50 (solstjerne, Codex), 23.09 17.40 (tavla «SOL»),
//   21.09 08.30 / 16.30 / 17.00. Konflikt = minste overskudd over h ∈ {1,2,5} km ≥ 30; forenlig ≤ 15.
import fs from 'fs'; import { execFileSync } from 'child_process';
import { solar } from '../repo/bevis/claude-2026-09-25/horisont/sun.mjs';
const d2r = Math.PI / 180, RE = 6371, RS = 42164;
const B = { s: 62.6, n: 64.6, w: 9.0, e: 13.5 }, W = 700, H = 700;
const EV = [['25.09 16.50', '25', '14:40', 14 + 50 / 60], ['25.09 17.00', '25', '14:50', 15], ['23.09 16.45', '23', '14:40', 14.75], ['23.09 16.50', '23', '14:50', 14 + 50 / 60],
  ['23.09 17.40', '23', '15:30', 15 + 40 / 60], ['21.09 08.30', '21', '06:20', 6.5], ['21.09 16.30', '21', '14:20', 14.5], ['21.09 17.00', '21', '14:50', 15]];
const DAYS = ['21', '22', '23', '24', '25'];
const load = async (d, t) => { const f = `flerdag_tr/${d}_${t.replace(':', '')}.png`;
  if (!fs.existsSync(f)) { const r = await fetch(`https://view.eumetsat.int/geoserver/wms?service=WMS&version=1.3.0&request=GetMap&layers=mtg_fd:vis06_hrfi&styles=&crs=EPSG:4326&bbox=${B.s},${B.w},${B.n},${B.e}&width=${W}&height=${H}&format=image/png&time=2026-09-${d}T${t}:00Z`);
    if (!r.ok || !(r.headers.get('content-type') || '').includes('png')) return null; fs.writeFileSync(f, Buffer.from(await r.arrayBuffer())); }
  return execFileSync('ffmpeg', ['-v', 'error', '-i', f, '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], { maxBuffer: 64e6 }); };
const SHIFT = +(process.env.SHIFT || 0), EXCL = process.env.EXCL === "1";
const sh = t => { const m = +t.slice(0,2)*60 + +t.slice(3) + SHIFT; return String(Math.floor(m/60)).padStart(2,"0")+":"+String(m%60).padStart(2,"0"); };
const ex = {};
for (const [lab, d, t0] of EV) { const t = sh(t0); const today = await load(d, t); if (!today) continue; const base = (await Promise.all(DAYS.filter(dd => !EXCL || dd !== d).map(dd => load(dd, t)))).filter(Boolean);
  const e = new Int16Array(W * H); for (let i = 0; i < W * H; i++) { let b = 255; for (const x of base) if (x[i] < b) b = x[i]; e[i] = today[i] - b; } ex[lab] = e; }
const sample = (e, la, lo) => { const x = Math.round((lo - B.w) / (B.e - B.w) * W), y = Math.round((B.n - la) / (B.n - B.s) * H); if (x < 1 || y < 1 || x >= W - 1 || y >= H - 1) return null;
  let s = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) s += e[(y + dy) * W + x + dx]; return s / 9; };
const move = (la, lo, az, km) => [la + km * Math.cos(az * d2r) / 111.2, lo + km * Math.sin(az * d2r) / (111.2 * Math.cos(la * d2r))];
function satGeom(la, lo) { const p = la * d2r, l = lo * d2r, v = [RS - RE * Math.cos(p) * Math.cos(l), -RE * Math.cos(p) * Math.sin(l), -RE * Math.sin(p)];
  const E = [-Math.sin(l), Math.cos(l), 0], N = [-Math.sin(p) * Math.cos(l), -Math.sin(p) * Math.sin(l), Math.cos(p)], U = [Math.cos(p) * Math.cos(l), Math.cos(p) * Math.sin(l), Math.sin(p)];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], n = Math.hypot(...v); return { vza: Math.acos(dot(v, U) / n) / d2r, az: (Math.atan2(dot(v, E), dot(v, N)) / d2r + 360) % 360 }; }
function score(la, lo) { const sg = satGeom(la, lo); const vals = []; let k = 0, ok = 0;
  for (const [lab, d, , h] of EV) { if (!ex[lab]) { vals.push(null); continue; } const s = solar(la, lo, 2026, 9, +d, h); let best = Infinity;
    for (const hk of [1, 2, 5]) { const [a1, b1] = move(la, lo, s.az, hk / Math.tan(s.el * d2r)), [a2, b2] = move(a1, b1, (sg.az + 180) % 360, hk * Math.tan(sg.vza * d2r)); const v = sample(ex[lab], a2, b2); if (v != null && v < best) best = v; }
    vals.push(best); if (best >= 30) k++; else if (best <= 15) ok++; } return { vals, k, ok }; }
const cands = [];
// (ingen strict-lister)
for (const [n, la, lo] of [['Trøndelag 63.591/11.278', 63.591, 11.278], ['Trøndelag 63.55/11.35', 63.55, 11.35], ['Meråker 63.42/11.75', 63.42, 11.75]]) cands.push([n, la, lo, '', '']);
const res = cands.map(([n, la, lo, vei, gange]) => ({ n, la, lo, vei, gange, ...score(la, lo) })).sort((a, b) => a.k - b.k || b.ok - a.ok);
const hdr = 'område,lat,lon,konflikter,forenlige,' + EV.map(e => e[0]).join(',');
fs.writeFileSync(`kandvaer_tr.csv`, hdr + '\n' + res.map(r => [r.n, r.la, r.lo, r.k, r.ok, ...r.vals.map(v => v == null ? '' : v.toFixed(0))].join(',')).join('\n') + '\n');
const byArea = {}; for (const r of res) { const a = r.n.split(' ')[0]; (byArea[a] = byArea[a] || []).push(r); }
for (const [a, rs] of Object.entries(byArea)) console.log(`${a}: ${rs.length} kandidater, 0 konflikter: ${rs.filter(r => r.k === 0).length}, ≤1: ${rs.filter(r => r.k <= 1).length}`);
console.log('\nTopp (0 konflikter, flest forenlige):'); for (const r of res.filter(r => r.k === 0).slice(0, 25)) console.log(`${r.n.padEnd(26)} ${r.la}, ${r.lo}  forenlige ${r.ok}/${EV.length}  ${r.vei} ${r.gange}  [${r.vals.map(v => v == null ? '-' : v.toFixed(0)).join(' ')}]`);
