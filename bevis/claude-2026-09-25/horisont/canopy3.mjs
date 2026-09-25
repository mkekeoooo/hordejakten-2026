// Sensitivity: (a) binary lit share with own-crown skip 5 m / 10 m; (b) canopy path length L (m of sun ray
// below the DOM surface within 400 m, after a 2 m skip) and a porous-crown transmission T=exp(-L/15).
// Medians over the 5x5 (10 m) neighbourhood of each candidate. Camera model as canopy2.mjs.
import { toUTM } from './utm.mjs'; import { raster } from './fetch.mjs'; import { solar } from './sun.mjs';
const d2r=Math.PI/180, R=6371000, kRef=0.13, CAMH=1.5;
const cands=[['1 Myklebysaeterveien vest',61.3995,11.0316],['2 Madsskardveien traktorvei',61.4443,11.1234],
 ['3a S-Messelt S1',61.4571,10.8362],['3b S-Messelt S2',61.4545,10.8406],['4 Madsskardveien ost',61.4518,11.1428],
 ['5 Jernvinneveien',61.4351,11.1435],['A1 Birkebeinerveien',61.4487,10.9775],['A2 Galaveien C07',61.4625,10.9751]];
const TIMES=[['07:40',7,40],['07:47',7,47],['07:50',7,50],['08:00',8,0],['08:30',8,30]];
function gdir(lat,lon,az){ const d=100,[x0,y0]=toUTM(lat,lon); const [x1,y1]=toUTM(lat+d*Math.cos(az*d2r)/R/d2r, lon+d*Math.sin(az*d2r)/(R*Math.cos(lat*d2r))/d2r); return [(x1-x0)/d,(y1-y0)/d]; }
const med=a=>{const b=a.filter(isFinite).sort((x,y)=>x-y); return b.length?b[Math.floor(b.length/2)]:NaN;};
console.log('Medians over 25 positions. lit% (skip5 | skip10) and transmission T% at', TIMES.map(t=>t[0]).join('/'));
for (const [name,la,lo] of cands){
  const [bx,by]=toUTM(la,lo); const X0=Math.floor(bx)-200, Y0=Math.floor(by)-450;
  const dom=await raster('DOM',X0,Y0,X0+1200,Y0+650,1), dtm1=await raster('DTM',X0,Y0,X0+1200,Y0+650,1);
  const dtm=await raster('DTM',Math.floor(bx)-250,Math.floor(by)-7050,Math.floor(bx)+19950,Math.floor(by)+2950,20);
  const sun=TIMES.map(([k,h,m])=>({k,...solar(la,lo,2026,9,21,h-2+m/60)})); sun.forEach(s=>s.v=gdir(la,lo,s.az));
  function trace(x,y,z,s,skip){ const [vx,vy]=s.v, tanE=Math.tan(s.elRefr*d2r); let L=0, blockedTerrain=false;
    for(let d=skip; d<20000; d+= d<950?0.5:20){ const sv= d<=950? dom.at(x+vx*d,y+vy*d) : dtm.at(x+vx*d,y+vy*d); if(!isFinite(sv)) continue;
      const over = sv - d*d*(1-kRef)/(2*R) - (z + d*tanE);
      if(d<=950){ const g=dtm1.at(x+vx*d,y+vy*d); if(isFinite(g) && g - (z+d*tanE) > 0) { blockedTerrain=true; break; } if(over>0 && d<=400) L+=0.5; }
      else if(over>0){ blockedTerrain=true; break; } }
    return {L, blockedTerrain}; }
  const A5=TIMES.map(()=>[]), A10=TIMES.map(()=>[]), T=TIMES.map(()=>[]); let terr=0;
  const [ex,ey]=gdir(la,lo,90), [nx,ny]=gdir(la,lo,0), [cxv,cyv]=gdir(la,lo,39);
  for(let oe=-20; oe<=20; oe+=10) for(let on=-20; on<=20; on+=10){
    const bxx=bx+ex*oe+nx*on, byy=by+ey*oe+ny*on; const cx=bxx+5*cxv, cy=byy+5*cyv; const cz=dtm1.at(cx,cy)+CAMH;
    const patch=[]; for(let az=238; az<=250; az+=1){ const [vx,vy]=gdir(la,lo,az); for(let e=8.5; e<=18.6; e+=1){ const te=Math.tan(e*d2r);
      for(let r=1; r<120; r+=0.5){ const x=cx+vx*r,y=cy+vy*r,z=cz+r*te; const top=dom.at(x,y), g=dtm1.at(x,y); if(top>z && top-g>2){ patch.push([x,y,z]); break; } } } }
    sun.forEach((s,i)=>{ let l5=0,l10=0,tt=0,tb=0; for(const [x,y,z] of patch){ const r2=trace(x,y,z,s,2); if(r2.blockedTerrain) tb++; else tt+=Math.exp(-r2.L/15);
        if(trace(x,y,z,s,5).L===0 && !r2.blockedTerrain) l5++; if(trace(x,y,z,s,10).L===0 && !r2.blockedTerrain) l10++; }
      A5[i].push(l5/patch.length); A10[i].push(l10/patch.length); T[i].push(tt/patch.length); if(i===2) terr+=tb/patch.length; });
  }
  const f=a=>a.map(v=>String(Math.round(med(v)*100)).padStart(3)).join(' ');
  console.log(name.padEnd(28),'skip5',f(A5),'| skip10',f(A10),'| T',f(T),'| terrain-blocked@07:50',Math.round(terr/25*100)+'%');
}
