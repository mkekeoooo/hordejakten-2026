// Selvstendig kontroll av terrenghorisont mot morgensola, kun med Kartverkets åpne punkt-API (DTM1).
// Kjør: node horisont_api.mjs   (Node 18+, ingen avhengigheter)
// Går langs en geodetisk linje i sann asimut, henter DTM1-høyder, og tar maks høydevinkel
// med jordkrumning og refraksjon (k = 0,13). Øyehøyde 1,5 m over bakken.
const d2r = Math.PI / 180, R = 6371000, k = 0.13, EYE = 1.5;
const steg = [];
for (let d = 25; d <= 3000; d += 25) steg.push(d);
for (let d = 3100; d <= 20000; d += 100) steg.push(d);
function punkt(lat, lon, az, d) { // enkel sfærisk "direct" – mer enn nøyaktig nok for < 20 km
  const p1 = lat * d2r, l1 = lon * d2r, a = az * d2r, dr = d / R;
  const p2 = Math.asin(Math.sin(p1) * Math.cos(dr) + Math.cos(p1) * Math.sin(dr) * Math.cos(a));
  const l2 = l1 + Math.atan2(Math.sin(a) * Math.sin(dr) * Math.cos(p1), Math.cos(dr) - Math.sin(p1) * Math.sin(p2));
  return [l2 / d2r, p2 / d2r];
}
async function hoyder(lonlat) {
  const out = [];
  for (let i = 0; i < lonlat.length; i += 50) {
    const chunk = lonlat.slice(i, i + 50).map(([x, y]) => [+x.toFixed(6), +y.toFixed(6)]);
    const r = await fetch(`https://ws.geonorge.no/hoydedata/v1/punkt?koordsys=4326&punkter=${encodeURIComponent(JSON.stringify(chunk))}&geojson=false`);
    out.push(...(await r.json()).punkter.map(p => p.z));
  }
  return out;
}
const steder = [
  ['1 Myklebysæterveien vest', 61.3995, 11.0316],
  ['2 Madsskardveien traktorvei', 61.4443, 11.1234],
  ['3 Sørlige Messelt S1', 61.4571, 10.8362],
  ['3 Sørlige Messelt S2', 61.4545, 10.8406],
  ['4 Madsskardveien øst', 61.4518, 11.1428],
  ['5a Jernvinneveien', 61.43511, 11.14349],
  ['5b Jernvinneveien', 61.43444, 11.13907],
  ['5c Jernvinneveien', 61.43531, 11.13483],
];
const AZ = 98.8; // sola 21.09 kl. 07.51 CEST (5,7° høy); 08.00: 100,9° / 6,8°
for (const [navn, lat, lon] of steder) {
  const pts = [[lon, lat], ...steg.map(d => punkt(lat, lon, AZ, d))];
  const z = await hoyder(pts);
  let maks = -90, ved = 0, zv = 0;
  steg.forEach((d, i) => {
    const zi = z[i + 1]; if (zi == null) return;
    const v = Math.atan((zi - d * d * (1 - k) / (2 * R) - z[0] - EYE) / d) / d2r;
    if (v > maks) { maks = v; ved = d; zv = zi; }
  });
  console.log(`${navn.padEnd(28)} bakke ${z[0].toFixed(1)} moh  horisont ${maks.toFixed(1)}° mot ${AZ}°  (ved ${ved} m, ${zv.toFixed(0)} moh)`);
}
