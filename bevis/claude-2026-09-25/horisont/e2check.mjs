import { toUTM, fromUTM } from './utm.mjs'; import { raster } from './fetch.mjs';
const d2r=Math.PI/180, R=6371000, kRef=0.13;
function gdir(lat,lon,az){ const d=100,[x0,y0]=toUTM(lat,lon); const [x1,y1]=toUTM(lat+d*Math.cos(az*d2r)/R/d2r, lon+d*Math.sin(az*d2r)/(R*Math.cos(lat*d2r))/d2r); return [(x1-x0)/d,(y1-y0)/d]; }
const pts=[['5a',61.43511,11.14349],['5b',61.43444,11.13907],['5c',61.43531,11.13483]];
for (const [n,la,lo] of pts){
  const [x,y]=toUTM(la,lo); const X0=Math.floor(x)-200,Y0=Math.floor(y)-450;
  const d1=await raster('DTM',X0,Y0,X0+1200,Y0+650,1), dc=await raster('DTM',Math.floor(x)-250,Math.floor(y)-7050,Math.floor(x)+19950,Math.floor(y)+2950,20);
  const z0=d1.at(x,y); const row=[];
  for (const az of [96,98.8,101]) { const [vx,vy]=gdir(la,lo,az); let h=-90, at=0; for(let d=5; d<20000; d+= d<950?1:20){ const g=(d<=950?d1:dc).at(x+vx*d,y+vy*d); if(!isFinite(g)) continue; const a=Math.atan((g-d*d*(1-kRef)/(2*R)-z0-1.5)/d)/d2r; if(a>h){h=a;at=d;} } row.push(`az${az}: ${h.toFixed(1)}° @${at}m`); }
  // independent check of the blocking profile via Kartverket point API
  const [vx,vy]=gdir(la,lo,98.8); const q=[200,400,600,800,1000,1500].map(d=>{const [a,b]=fromUTM(x+vx*d,y+vy*d); return [+b.toFixed(6),+a.toFixed(6)];});
  const j=await (await fetch(`https://ws.geonorge.no/hoydedata/v1/punkt?koordsys=4326&punkter=${encodeURIComponent(JSON.stringify([[lo,la],...q]))}&geojson=false`)).json();
  const zs=j.punkter.map(p=>p.z); const ang=[200,400,600,800,1000,1500].map((d,i)=>`${d}m:${zs[i+1].toFixed(0)} (${(Math.atan((zs[i+1]-zs[0]-1.5)/d)/d2r).toFixed(1)}°)`);
  console.log(n, `site ${z0.toFixed(1)} (API ${zs[0].toFixed(1)})`, row.join(' | ')); console.log('   API profile az98.8:', ang.join('  '));
}
