// Høydevinkel fra hvert sted til NOZ9EG (LN-NIQ, hex 4791ac) og NOZ56U (LN-ENN, hex 47a3b0) 21.09.2026,
// ALLE steder ved SAMME tidspunkt. Data: adsb.lol globe_history trace_full (ODbL), gzip-JSON.
// Høyde: alt_geom (felt 10, fot, GNSS) - ikke barometrisk flygenivå. Stedets egen høyde (DTM1) trekkes fra.
// Posisjon interpoleres lineært mellom sporpunktene. Jordkrumning tas med.
import fs from 'fs'; import zlib from 'zlib';
const d2r=Math.PI/180, R=6371000;
const load=f=>JSON.parse(zlib.gunzipSync(fs.readFileSync(f)));
const steder=[['1 Myklebysæterveien vest',61.3995,11.0316,594],['2 Madsskardveien traktorvei',61.4443,11.1234,598],['3 S-Messelt S1',61.4571,10.8362,898],
 ['3 S-Messelt S2',61.4545,10.8406,877],['4 Madsskardveien øst',61.4518,11.1428,646],['5a Jernvinneveien',61.43511,11.14349,556],['A1 Birkebeinerveien',61.4487,10.9775,605],
 ['A2 Gålaveien C07',61.4625,10.9751,365],['Sjusjøen',61.23,10.62,850],['Rudshøgda',60.912,10.808,300],['Løten',60.82,11.35,250],['Elverum S (default.no #1)',60.70,11.60,250]];
function pos(j,t){ const t0=j.timestamp, tr=j.trace; for(let i=1;i<tr.length;i++){ const a=tr[i-1], b=tr[i]; const ta=t0+a[0], tb=t0+b[0];
  if(ta<=t && t<=tb && b[0]-a[0]<60){ const f=(t-ta)/(tb-ta); const g=x=>x[10]??(typeof x[3]==='number'?x[3]:null); return {lat:a[1]+f*(b[1]-a[1]), lon:a[2]+f*(b[2]-a[2]), ft:g(a)+f*(g(b)-g(a))}; } } return null; }
function elev(la,lo,moh,p){ const x=(p.lon-lo)*d2r*Math.cos((la+p.lat)/2*d2r)*R, y=(p.lat-la)*d2r*R, D=Math.hypot(x,y); const h=p.ft*0.3048-moh-D*D/(2*R); return Math.atan2(h,D)/d2r; }
const fly={NOZ9EG:load('trace_4791ac.json'), NOZ56U:load('trace_47a3b0.json')};
const stream=Date.UTC(2026,8,21,19,29,38)/1000;          // 21:29:38 CEST strømtid: hun begynner å peke (default.no osint_notes)
const forsinkelser=[15,22,30,45,50];                        // s; default.no målte ~22 s, rapporten bruker 15-50 s
console.log('Høydevinkel (°) ved samme øyeblikk = strømtid 21:29:38 minus forsinkelse. Kolonner: forsinkelse i sekunder.');
for(const [cs,j] of Object.entries(fly)){
  console.log(`\n${cs} (${j.r}, ${j.icao})  posisjon ved 22 s: ${(()=>{const p=pos(j,stream-22);return p?`${p.lat.toFixed(3)} N ${p.lon.toFixed(3)} E, ${Math.round(p.ft)} ft geom`:'-'})()}`);
  console.log('sted'.padEnd(28)+forsinkelser.map(d=>String(d).padStart(6)).join('')+'   maks i 21:29:40–21:34:00 strøm (22 s)');
  for(const [n,la,lo,moh] of steder){
    const v=forsinkelser.map(d=>{const p=pos(j,stream-d); return p?elev(la,lo,moh,p).toFixed(0).padStart(6):'     -';}).join('');
    let mx=-90, mt=0; for(let t=stream+2-22; t<=stream+262-22; t+=2){ const p=pos(j,t); if(p){ const e=elev(la,lo,moh,p); if(e>mx){mx=e; mt=t;} } }
    console.log(n.padEnd(28)+v+`   ${mx.toFixed(0)}° kl. ${new Date((mt+22)*1000+2*3600e3).toISOString().slice(11,19)} strøm`);
  }
}
