// Flerdags værkonsistens med parallakse (utvider Codex' #10-metode til alle dokumenterte solmomenter).
// For hvert rutenettpunkt og hver hendelse med direkte sol på stedet:
//   skyens sanne posisjon = punkt + (h / tan(solhøyde)) mot solas asimut; tilsynelatende posisjon i satellittbildet =
//   sann posisjon + h·tan(satellittsenitvinkel) bort fra satellitten (MTG på 0° Ø). Skyhøyde h ∈ {1, 2, 5} km.
//   Overskudd = VIS-gråverdi − laveste verdi samme tidssteg 21.–25.09 (per piksel). Rausest: minste overskudd over h.
//   forenlig: ≤ 15, konflikt: ≥ 30. Hendelsesscore samles per punkt. Utdata: flerdag.csv + flerdag.png.
import fs from 'fs'; import { execFileSync } from 'child_process';
import { solar } from '../horisont/sun.mjs';
const d2r = Math.PI / 180, RE = 6371, RS = 42164;
const B = { s: 58.8, n: 63.6, w: 6.0, e: 13.2 }, W = 900, H = 1245;
// hendelser: [etikett, dato, tidssteg UTC (MTG), faktisk solmoment UTC (for solgeometri)]
const EV = [['25.09 16.50', '25', '14:40', 14 + 50 / 60], ['25.09 17.00', '25', '14:50', 15 + 0 / 60],
  ['21.09 08.30', '21', '06:20', 6 + 30 / 60], ['21.09 16.30', '21', '14:20', 14 + 30 / 60], ['21.09 17.00', '21', '14:50', 15 + 0 / 60],
  ['23.09 17.40', '23', '15:30', 15 + 40 / 60]];
const DAYS = ['21', '22', '23', '24', '25'];
fs.mkdirSync('flerdag', { recursive: true });
const load = async (d, t) => { const f = `flerdag/${d}_${t.replace(':', '')}.png`;
  if (!fs.existsSync(f)) { const r = await fetch(`https://view.eumetsat.int/geoserver/wms?service=WMS&version=1.3.0&request=GetMap&layers=mtg_fd:vis06_hrfi&styles=&crs=EPSG:4326&bbox=${B.s},${B.w},${B.n},${B.e}&width=${W}&height=${H}&format=image/png&time=2026-09-${d}T${t}:00Z`);
    if (!r.ok || !(r.headers.get('content-type') || '').includes('png')) return null; fs.writeFileSync(f, Buffer.from(await r.arrayBuffer())); }
  return execFileSync('ffmpeg', ['-v', 'error', '-i', f, '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], { maxBuffer: 64e6 }); };
const ex = {}; // overskuddsbilde per hendelse
for (const [lab, d, t] of EV) { const today = await load(d, t); if (!today) { console.log('mangler', lab); continue; }
  const base = []; for (const dd of DAYS) { const im = await load(dd, t); if (im) base.push(im); }
  const e = new Int16Array(W * H); for (let i = 0; i < W * H; i++) { let b = 255; for (const x of base) if (x[i] < b) b = x[i]; e[i] = today[i] - b; } ex[lab] = e;
  console.log('hendelse', lab, 'basisdager', base.length); }
const sample = (e, la, lo) => { const x = Math.round((lo - B.w) / (B.e - B.w) * W), y = Math.round((B.n - la) / (B.n - B.s) * H);
  if (x < 1 || y < 1 || x >= W - 1 || y >= H - 1) return null; let s = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) s += e[(y + dy) * W + x + dx]; return s / 9; };
const move = (la, lo, az, km) => [la + km * Math.cos(az * d2r) / 111.2, lo + km * Math.sin(az * d2r) / (111.2 * Math.cos(la * d2r))];
function satGeom(la, lo) { // MTG ved 0° Ø: senitvinkel og asimut fra punktet mot satellitten
  const p = la * d2r, l = lo * d2r, x = RS - RE * Math.cos(p) * Math.cos(l), y = -RE * Math.cos(p) * Math.sin(l), z = -RE * Math.sin(p);
  const E = [-Math.sin(l), Math.cos(l), 0], N = [-Math.sin(p) * Math.cos(l), -Math.sin(p) * Math.sin(l), Math.cos(p)], U = [Math.cos(p) * Math.cos(l), Math.cos(p) * Math.sin(l), Math.sin(p)];
  const v = [x, y, z], n = Math.hypot(...v), dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const up = dot(v, U) / n; return { vza: Math.acos(up) / d2r, az: (Math.atan2(dot(v, E), dot(v, N)) / d2r + 360) % 360 }; }
const rows = ['lat,lon,' + EV.map(e => e[0]).join(',') + ',konflikter,forenlige'];
const labs = EV.map(e => e[0]).filter(l => ex[l]);
const img = Buffer.alloc(W * H * 3); const today = await load('25', '14:50');
for (let i = 0; i < W * H; i++) { const g = today[i] * 0.35; img[i * 3] = img[i * 3 + 1] = img[i * 3 + 2] = g; }
const STEP = 0.05; let pts = 0;
for (let la = B.s + 0.1; la <= B.n - 0.1; la += STEP) for (let lo = B.w + 0.1; lo <= B.e - 0.1; lo += STEP / Math.cos(la * d2r) * 1) {
  const sg = satGeom(la, lo); let konf = 0, ok = 0; const vals = [];
  for (const [lab, d, , hUTC] of EV) { if (!ex[lab]) { vals.push(''); continue; } const s = solar(la, lo, 2026, 9, +d, hUTC);
    let best = Infinity; for (const h of [1, 2, 5]) { const [cla, clo] = move(la, lo, s.az, h / Math.tan(s.el * d2r)); const [ala, alo] = move(cla, clo, (sg.az + 180) % 360, h * Math.tan(sg.vza * d2r));
      const v = sample(ex[lab], ala, alo); if (v != null && v < best) best = v; }
    vals.push(isFinite(best) ? best.toFixed(0) : ''); if (best >= 30) konf++; else if (best <= 15) ok++; }
  rows.push(`${la.toFixed(3)},${lo.toFixed(3)},${vals.join(',')},${konf},${ok}`); pts++;
  const x = Math.round((lo - B.w) / (B.e - B.w) * W), y = Math.round((B.n - la) / (B.n - B.s) * H);
  const col = konf === 0 && ok >= labs.length - 1 ? [40, 200, 60] : konf === 0 ? [170, 200, 60] : konf === 1 ? [230, 170, 40] : [210, 40, 40];
  for (let dy = -3; dy <= 3; dy++) for (let dx = -3; dx <= 3; dx++) { const j = ((y + dy) * W + x + dx) * 3; if (j >= 0 && j < img.length - 2) { img[j] = col[0]; img[j + 1] = col[1]; img[j + 2] = col[2]; } } }
fs.writeFileSync('flerdag.csv', rows.join('\n') + '\n'); fs.writeFileSync('flerdag/kart.rgb', img);
const byer = [['Oslo', 59.91, 10.75], ['Hamar', 60.79, 11.07], ['Elverum', 60.88, 11.56], ['Rena', 61.13, 11.37], ['Evenstad', 61.42, 11.08], ['Koppang', 61.57, 11.04],
  ['Trysil', 61.31, 12.26], ['Engerdal', 61.76, 11.96], ['Femunden', 62.05, 11.87], ['Tynset', 62.28, 10.78], ['Roros', 62.57, 11.38], ['Lillehammer', 61.12, 10.47],
  ['Kongsvinger', 60.19, 12.00], ['Fagernes', 60.99, 9.23], ['Kongsberg', 59.67, 9.65], ['Sigdal', 60.05, 9.63], ['Halden', 59.12, 11.39], ['Aheim', 62.04, 5.58], ['Otta', 61.77, 9.54]];
fs.writeFileSync('flerdag/f.txt', byer.filter(([, la, lo]) => lo > B.w).map(([n, la, lo]) => { const x = Math.round((lo - B.w) / (B.e - B.w) * W), y = Math.round((B.n - la) / (B.n - B.s) * H);
  return `drawbox=x=${x - 2}:y=${y - 2}:w=5:h=5:color=white:t=fill,drawtext=fontfile=arial.ttf:text=${n}:x=${x + 5}:y=${y - 7}:fontsize=13:fontcolor=white:box=1:boxcolor=black@0.7`; }).join(',')
  + `,drawtext=fontfile=arial.ttf:text=${labs.length} solhendelser 21-25.09 med parallakse (h 1-5 km)  gronn=ingen konflikt  oransje=1  rod=2+:x=5:y=5:fontsize=15:fontcolor=white:box=1:boxcolor=black@0.8`);
execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-i', 'flerdag/kart.rgb', '-filter_script:v', 'flerdag/f.txt', 'flerdag.png']);
console.log(pts, 'punkter; hendelser brukt:', labs.join(' | '));
