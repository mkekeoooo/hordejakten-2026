import fs from 'fs';
const L = f => JSON.parse(fs.readFileSync(f));
const P = [...L('hm_21_38.bin.json'), ...L('hm_21_39.bin.json'), ...L('hm_22_37.bin.json'), ...L('hm_26_36.bin.json')].filter(p => p.alt > 1000);
const ev = [['21.09 21:29 peker', '2026-09-21T19:28:45Z', '2026-09-21T19:30:15Z'], ['21.09 21:33 rumling', '2026-09-21T19:32:30Z', '2026-09-21T19:34:00Z'],
  ['22.09 20:32', '2026-09-22T18:31:00Z', '2026-09-22T18:34:30Z'], ['22.09 20:34 ser sørover', '2026-09-22T18:33:30Z', '2026-09-22T18:36:30Z'], ['26.09 20:10 arm opp', '2026-09-26T18:09:50Z', '2026-09-26T18:11:30Z']]
  .map(([n, a, b]) => ({ n, pts: P.filter(p => p.t >= Date.parse(a) / 1000 && p.t <= Date.parse(b) / 1000) }));
ev.forEach(e => console.log(e.n, e.pts.length, 'punkter', [...new Set(e.pts.map(p => p.cs || p.hex))].length, 'fly'));
const rad = Math.PI / 180;
const el = (la, lo, p) => { const dn = (p.lat - la) * 111195, de = (p.lon - lo) * 111195 * Math.cos(la * rad), d = Math.hypot(dn, de); return Math.atan2(p.alt * 0.3048 - 300 - d * d / 12742000, d) / rad; };
const maxel = (la, lo, pts) => { let m = -90, w = ''; for (const p of pts) { const e = el(la, lo, p); if (e > m) { m = e; w = p.cs || p.hex; } } return [m, w]; };
const sites = { S03: [60.53938, 12.18334], 'S03 topp3': [60.5544, 12.1468], 'Finnskog #324': [60.462, 12.229], 'Solør nord': [60.675, 12.10], L07: [60.82353, 11.5375], A01: [61.23076, 11.72394], 'Rena-vest': [61.160, 11.308], 'Åmot dno': [61.30, 11.40], 'Løten': [60.82, 11.35], Ringebu: [61.50, 10.55] };
console.log('\nhøyeste fly (°) per hendelse:'); console.log(''.padEnd(15) + ev.map(e => e.n.padEnd(24)).join(''));
for (const [n, [la, lo]] of Object.entries(sites)) console.log(n.padEnd(15) + ev.map(e => { const [m, w] = maxel(la, lo, e.pts); return `${m.toFixed(0).padStart(3)}° ${w}`.padEnd(24); }).join(''));
// rutenett: celler i regnskann med regnscore, telling av hendelser med fly ≥ 20°
const R = L('../watch/regnskann_norge.json'); const rows = [];
for (let k = 0; k < R.LAT.length; k++) { const s = R.score[1][k]; if (s == null) continue; const la = R.LAT[k], lo = R.LON[k]; if (la < 59.6 || la > 62.4 || lo < 9.6 || lo > 13.4) continue;
  const m = ev.map(e => maxel(la, lo, e.pts)[0]); rows.push({ la, lo, s, m }); }
fs.writeFileSync('alle.json', JSON.stringify(rows));
for (const th of [15, 20, 25]) { const c = rows.map(r => ({ ...r, n: [Math.max(r.m[0], r.m[1]), Math.max(r.m[2], r.m[3]), r.m[4]].filter(x => x >= th).length }));
  const hist = [0, 0, 0, 0]; c.forEach(r => hist[r.n]++); console.log(`\nterskel ${th}°: antall celler som består 0/1/2/3 av tre dager:`, hist.join(' / '));
  const top = c.filter(r => r.n >= 2).sort((a, b) => b.n - a.n || b.s - a.s).slice(0, 8); for (const r of top) console.log('  ', r.la.toFixed(3), r.lo.toFixed(3), 'dager', r.n, 'regn', r.s.toFixed(2), r.m.map(x => x.toFixed(0)).join('/')); }
