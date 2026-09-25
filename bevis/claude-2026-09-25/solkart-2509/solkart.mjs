// Kart: hvor var det klart mens stedet hadde direkte sol 25.09 kl. 14:33–15:22Z (egne livebilder, solstjerne)?
// MTG vis06_hrfi, tidssteg 14:30–15:10Z (FCI skanner Norge ca. 8 min inn i hvert steg). Klarværsbasis per piksel =
// laveste verdi samme tidssteg 21.–24.09. Overskudd per piksel for 25.09. Klassifisering over de fem stegene:
//   grønn = overskudd ≤ 15 i minst 4 av 5 steg (forenlig), rød = ≥ 30 i minst 4 av 5 (konflikt), gul = ellers (kan ikke skilles).
// Ingen gamle kandidatmarkører; bare tettsteder for orientering.
import fs from 'fs'; import { execFileSync } from 'child_process';
const B = { s: 58.8, n: 63.6, w: 6.0, e: 13.2 }, W = 900, H = Math.round(900 * (B.n - B.s) / ((B.e - B.w) * Math.cos(61.2 * Math.PI / 180)));
const slots = ['14:30', '14:40', '14:50', '15:00', '15:10'], days = ['21', '22', '23', '24', '25'];
fs.mkdirSync('solkart', { recursive: true });
const img = {};
for (const d of days) for (const t of slots) {
  const f = `solkart/${d}_${t.replace(':', '')}.png`;
  if (!fs.existsSync(f)) { const r = await fetch(`https://view.eumetsat.int/geoserver/wms?service=WMS&version=1.3.0&request=GetMap&layers=mtg_fd:vis06_hrfi&styles=&crs=EPSG:4326&bbox=${B.s},${B.w},${B.n},${B.e}&width=${W}&height=${H}&format=image/png&time=2026-09-${d}T${t}:00Z`);
    if (!r.ok || !(r.headers.get('content-type') || '').includes('png')) { console.log('mangler', d, t, r.status); continue; } fs.writeFileSync(f, Buffer.from(await r.arrayBuffer())); }
  img[`${d} ${t}`] = execFileSync('ffmpeg', ['-v', 'error', '-i', f, '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], { maxBuffer: 64e6 });
}
const N = W * H, green = new Uint8Array(N), red = new Uint8Array(N); let okSlots = 0;
for (const t of slots) { const today = img[`25 ${t}`]; const base = ['21', '22', '23', '24'].map(d => img[`${d} ${t}`]).filter(Boolean); if (!today || !base.length) continue; okSlots++;
  for (let i = 0; i < N; i++) { let b = 255; for (const x of base) if (x[i] < b) b = x[i]; const ex = today[i] - b; if (ex <= 15) green[i]++; if (ex >= 30) red[i]++; } }
const need = Math.max(1, okSlots - 1), rgb = Buffer.alloc(N * 3), today = img['25 15:00'] || img['25 14:50'];
let cG = 0, cR = 0;
for (let i = 0; i < N; i++) { const g = today[i] * 0.5; let r = g, gg = g, bb = g;
  if (green[i] >= need) { gg = 90 + g; r = g * 0.4; bb = g * 0.4; cG++; } else if (red[i] >= need) { r = 110 + g; gg = g * 0.4; bb = g * 0.4; cR++; } else { r = 80 + g; gg = 70 + g; bb = g * 0.3; }
  rgb[i * 3] = Math.min(255, r); rgb[i * 3 + 1] = Math.min(255, gg); rgb[i * 3 + 2] = Math.min(255, bb); }
fs.writeFileSync('solkart/klass.rgb', rgb);
const byer = [['Oslo', 59.91, 10.75], ['Hamar', 60.79, 11.07], ['Elverum', 60.88, 11.56], ['Rena', 61.13, 11.37], ['Evenstad', 61.42, 11.08], ['Koppang', 61.57, 11.04],
  ['Trysil', 61.31, 12.26], ['Engerdal', 61.76, 11.96], ['Tynset', 62.28, 10.78], ['Røros', 62.57, 11.38], ['Lillehammer', 61.12, 10.47], ['Gjøvik', 60.80, 10.69],
  ['Kongsvinger', 60.19, 12.00], ['Fagernes', 60.99, 9.23], ['Otta', 61.77, 9.54], ['Gol', 60.70, 8.94], ['Kongsberg', 59.67, 9.65], ['Oppdal', 62.59, 9.69], ['Åheim', 62.04, 5.58]]
  .filter(([, la, lo]) => la > B.s && la < B.n && lo > B.w && lo < B.e);
const px = (la, lo) => [Math.round((lo - B.w) / (B.e - B.w) * W), Math.round((B.n - la) / (B.n - B.s) * H)];
const filt = byer.map(([n, la, lo]) => { const [x, y] = px(la, lo); return `drawbox=x=${x - 3}:y=${y - 3}:w=7:h=7:color=white:t=fill,drawtext=fontfile=arial.ttf:text=${n}:x=${x + 6}:y=${y - 8}:fontsize=14:fontcolor=white:box=1:boxcolor=black@0.6`; }).join(',')
  + `,drawtext=fontfile=arial.ttf:text=25.09 14.30–15.10Z  grønn = klart (forenlig)  rød = sky (konflikt)  gul = uavklart:x=6:y=6:fontsize=16:fontcolor=white:box=1:boxcolor=black@0.7`;
fs.writeFileSync('solkart/filt.txt', filt);
execFileSync('ffmpeg', ['-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-i', 'solkart/klass.rgb', '-filter_script:v', 'solkart/filt.txt', 'solkart_2509.png']);
console.log(`bilde ${W}x${H}, ${okSlots} tidssteg brukt; grønn ${(100 * cG / N).toFixed(1)} %, rød ${(100 * cR / N).toFixed(1)} % av kartet`);
// verdier ved tettstedene for tekst
for (const [n, la, lo] of byer) { const [x, y] = px(la, lo); let g = 0, r = 0, c = 0; for (let dy = -4; dy <= 4; dy++) for (let dx = -4; dx <= 4; dx++) { const i = (y + dy) * W + x + dx; if (i < 0 || i >= N) continue; c++; if (green[i] >= need) g++; if (red[i] >= need) r++; }
  console.log(n.padEnd(12), `klart ${(100 * g / c).toFixed(0).padStart(3)} %  sky ${(100 * r / c).toFixed(0).padStart(3)} %`); }
