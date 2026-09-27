import fs from 'fs';
const L = f => JSON.parse(fs.readFileSync(f));
const P = [...L('hm_21_38.bin.json'), ...L('hm_21_39.bin.json'), ...L('hm_22_37.bin.json'), ...L('hm_26_36.bin.json')];
const tr = (cs, a, b) => P.filter(p => p.cs === cs && p.t >= Date.parse(a) / 1000 && p.t <= Date.parse(b) / 1000).sort((x, y) => x.t - y.t);
for (const [cs, a, b] of [['NOZ56U', '2026-09-21T19:30:00Z', '2026-09-21T19:36:00Z'], ['SAS4094', '2026-09-26T18:08:00Z', '2026-09-26T18:12:30Z'], ['NOZ2KB', '2026-09-22T18:33:00Z', '2026-09-22T18:39:00Z'], ['SAS39A', '2026-09-22T18:32:00Z', '2026-09-22T18:37:00Z']]) {
  console.log(cs); for (const p of tr(cs, a, b)) console.log('  ', new Date(p.t * 1000).toISOString().slice(11, 19), p.lat.toFixed(3), p.lon.toFixed(3), 'FL' + Math.round(p.alt / 100)); }
