import fs from 'fs';
const P = JSON.parse(fs.readFileSync('hm_36.bin.json'));
const R = JSON.parse(fs.readFileSync('../watch/regnskann_norge.json'));
const T0 = Date.parse('2026-09-26T18:09:50Z') / 1000, T1 = Date.parse('2026-09-26T18:11:30Z') / 1000;
const pts = P.filter(p => p.t >= T0 && p.t <= T1 && p.alt > 1000);
const rad = Math.PI / 180;
const el = (la, lo, p) => { const dn = (p.lat - la) * 111195, de = (p.lon - lo) * 111195 * Math.cos(la * rad), d = Math.hypot(dn, de); const h = p.alt * 0.3048 - 300 - d * d / (2 * 6371000 * 1.0); return Math.atan2(h, d) / rad; };
const rows = [];
for (let k = 0; k < R.LAT.length; k++) { const s = R.score[1][k]; if (s == null) continue; const la = R.LAT[k], lo = R.LON[k];
  let m = -90, who = ''; for (const p of pts) { const e = el(la, lo, p); if (e > m) { m = e; who = p.cs || p.hex; } }
  rows.push({ la, lo, s, s05: R.score[0][k], s2: R.score[2][k], m, who }); }
const hi = rows.filter(r => r.m >= 25);
console.log('celler med fly ≥25°:', hi.length, ' av', rows.length);
hi.sort((a, b) => b.s - a.s); console.log('beste regnscore blant dem:'); for (const r of hi.slice(0, 15)) console.log(r.la.toFixed(3), r.lo.toFixed(3), 'regn', r.s05?.toFixed(2), r.s.toFixed(2), r.s2?.toFixed(2), 'fly', r.m.toFixed(0) + '°', r.who);
const mx = Math.max(...rows.map(r => r.s)); console.log('maks regnscore i Norge', mx.toFixed(2));
const good = rows.filter(r => r.s >= 1.4); console.log('celler regn≥1.4:', good.length, ' hvorav fly≥25°:', good.filter(r => r.m >= 25).length, ' fly≥15°:', good.filter(r => r.m >= 15).length);
fs.writeFileSync('kryss.json', JSON.stringify(rows));
