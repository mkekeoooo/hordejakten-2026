// «NULL REGN» på tavla 22. og 23.09 (rapporten, s. 6: «tavla sa ‹NULL REGN› 22. og 23.09»). Radar per kandidat:
// andel 5-min-steg 04–18Z med ≥ 0,1 mm/t i 3×3 celler, og akkumulert nedbør (mm) samme vindu. Manglende = manglende.
const U = d => `https://thredds.met.no/thredds/dodsC/remotesensing/reflectivity-nordic/2026/09/yrwms-nordic.mos.pcappi-0-dbz.noclass-clfilter-novpr-clcorr-block.nordiclcc-1000.202609${d}.nc`;
const enc = q => q.split('[').join('%5B').split(']').join('%5D');
const get = async (d, q) => { for (let a = 0; a < 4; a++) { const r = await fetch(`${U(d)}.ascii?${enc(q)}`); if (r.ok) return r.text(); await new Promise(s => setTimeout(s, 3000)); } throw new Error(q); };
const rows = (t, k) => { const b = t.split(k)[1] || t, o = []; for (const l of b.split('\n')) { const m = l.match(/^((?:\[\d+\])+),\s*(.*)$/); if (m) o.push(m[2].split(',').map(Number)); } return o; };
const P = [['S03', 60.53938, 12.18334], ['S03-klynge 60.56/12.16', 60.56, 12.16], ['Finnskog-klynge 60.45/12.22', 60.45, 12.22], ['#324', 60.4644, 12.1207], ['Sol 60.60/12.11', 60.603, 12.107],
  ['L07', 60.82353, 11.5375], ['A01', 61.23076, 11.72394], ['kand1 Mykleby', 61.3995, 11.0316], ['Evenstad', 61.42, 11.08], ['Kongsvinger', 60.19, 12.0]];
for (const d of ['22', '23']) {
  const S = 8, gl = rows(await get(d, `lat[0:${S}:2133][0:${S}:1693]`), 'lat.lat'), go = rows(await get(d, `lon[0:${S}:2133][0:${S}:1693]`), 'lon.lon');
  const T = (await get(d, 'time')).split('\n').slice(-3).join(' ').match(/\d{9,}/g).map(Number);
  const I = T.map((t, i) => [t, i]).filter(([t]) => { const h = (t % 86400) / 3600; return h >= 4 && h <= 18; }).map(([, i]) => i);
  console.log(`== ${d}.09: ${I.length} tidssteg 04–18Z`);
  for (const [n, la, lo] of P) {
    let b = null; gl.forEach((r, i) => r.forEach((v, j) => { const dd = (v - la) ** 2 + ((go[i][j] - lo) * 0.5) ** 2; if (!b || dd < b.d) b = { d: dd, y: i * S, x: j * S }; }));
    const y0 = b.y - 8, x0 = b.x - 8, LA = rows(await get(d, `lat[${y0}:1:${y0 + 16}][${x0}:1:${x0 + 16}]`), 'lat.lat'), LO = rows(await get(d, `lon[${y0}:1:${y0 + 16}][${x0}:1:${x0 + 16}]`), 'lon.lon');
    let c = null; LA.forEach((r, i) => r.forEach((v, j) => { const dd = (v - la) ** 2 + ((LO[i][j] - lo) * 0.5) ** 2; if (!c || dd < c.d) c = { d: dd, y: y0 + i, x: x0 + j }; }));
    const t = await get(d, `lwe_precipitation_rate[${I[0]}:1:${I[I.length - 1]}][${c.y - 1}:1:${c.y + 1}][${c.x - 1}:1:${c.x + 1}]`);
    const v = rows(t, 'lwe_precipitation_rate.lwe_precipitation_rate'); // rader = [tid][y] med 3 verdier
    let wet = 0, n5 = 0, mm = 0; for (let k = 0; k + 2 < v.length; k += 3) { const cells = [...v[k], ...v[k + 1], ...v[k + 2]].filter(x => x >= 0 && x < 300); if (!cells.length) continue; const m = cells.reduce((a, b) => a + b, 0) / cells.length; n5++; if (m >= 0.1) wet++; mm += m * 5 / 60; }
    console.log(`  ${n.padEnd(28)} våte steg ${(100 * wet / n5).toFixed(0).padStart(3)} %  akkumulert ${mm.toFixed(1)} mm`);
  }
}
