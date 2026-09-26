// Værkonsistens per KANDIDATPUNKT (samme parallaksemodell som flerdag.mjs), for alle som består skog + morgensol +
// streng adkomst (Osen, Elverum/Løten, Solør) og de gamle kandidatene. Hendelser med dokumentert direkte sol:
//   25.09 16.50/17.00 (solstjerne, begge), 23.09 16.45/16.50 (solstjerne, Codex), 23.09 17.40 (tavla «SOL»),
//   21.09 08.30 / 16.30 / 17.00. Konflikt = minste overskudd over h ∈ {1,2,5} km ≥ 30; forenlig ≤ 15.
import fs from 'fs'; import { execFileSync } from 'child_process';
import { solar } from '../repo/bevis/claude-2026-09-25/horisont/sun.mjs';
const d2r = Math.PI / 180, RE = 6371, RS = 42164;
const B = { s: 58.8, n: 63.6, w: 6.0, e: 13.2 }, W = 900, H = 1245;
const EV = [["26.09 16.35", "26", "14:30", 14 + 35 / 60], ["26.09 16.45", "26", "14:40", 14.75], ["26.09 16.55", "26", "14:50", 14 + 55 / 60]];
const DAYS = ['21', '22', '23', '24', '25'];
const load = async (d, t) => { const f = `flerdag/${d}_${t.replace(':', '')}.png`;
  if (!fs.existsSync(f)) { const r = await fetch(`https://view.eumetsat.int/geoserver/wms?service=WMS&version=1.3.0&request=GetMap&layers=mtg_fd:vis06_hrfi&styles=&crs=EPSG:4326&bbox=${B.s},${B.w},${B.n},${B.e}&width=${W}&height=${H}&format=image/png&time=2026-09-${d}T${t}:00Z`);
    if (!r.ok || !(r.headers.get('content-type') || '').includes('png')) return null; fs.writeFileSync(f, Buffer.from(await r.arrayBuffer())); }
  return execFileSync('ffmpeg', ['-v', 'error', '-i', f, '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], { maxBuffer: 64e6 }); };
const ex = {};
for (const [lab, d, t] of EV) { const today = await load(d, t); if (!today) continue; const base = (await Promise.all(DAYS.map(dd => load(dd, t)))).filter(Boolean);
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
const cands = [["S03-kjerne 1",60.55432,12.14683],["S03-kjerne 4",60.57199,12.14126],["S03",60.53938,12.18334],["S03-kjerne 7",60.58579,12.13127],["S03-kjerne 13",60.56463,12.17549],["Finnskog 60.436/12.224",60.4375,12.2233],["#324",60.4644,12.1207],["Solør nord 60.675/12.10",60.675,12.10],["L07",60.82353,11.5375],["A01",61.23076,11.72394],["kand1 Mykleby",61.3995,11.0316],["Messelt",61.4571,10.8362],["Evenstad",61.42,11.08],["Trysil",61.31,12.26],["Kongsvinger",60.19,12.0],["Løten-nord",60.972,11.034],["Rena-vest",61.16,11.308]].map(([n,la,lo])=>[n,la,lo,"",""]);
const res = cands.map(([n, la, lo, vei, gange]) => ({ n, la, lo, vei, gange, ...score(la, lo) })).sort((a, b) => a.k - b.k || b.ok - a.ok);
const hdr = 'område,lat,lon,konflikter,forenlige,' + EV.map(e => e[0]).join(',');
fs.writeFileSync('kandvaer_26.csv', hdr + '\n' + res.map(r => [r.n, r.la, r.lo, r.k, r.ok, ...r.vals.map(v => v == null ? '' : v.toFixed(0))].join(',')).join('\n') + '\n');
const byArea = {}; for (const r of res) { const a = r.n.split(' ')[0]; (byArea[a] = byArea[a] || []).push(r); }
for (const [a, rs] of Object.entries(byArea)) console.log(`${a}: ${rs.length} kandidater, 0 konflikter: ${rs.filter(r => r.k === 0).length}, ≤1: ${rs.filter(r => r.k <= 1).length}`);
console.log('\nTopp (0 konflikter, flest forenlige):'); for (const r of res.filter(r => r.k === 0).slice(0, 25)) console.log(`${r.n.padEnd(26)} ${r.la}, ${r.lo}  forenlige ${r.ok}/${EV.length}  ${r.vei} ${r.gange}  [${r.vals.map(v => v == null ? '-' : v.toFixed(0)).join(' ')}]`);
