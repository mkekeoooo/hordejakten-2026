// Camera-ray version. Frame 1920x1080, f=1602 px (report: f=1068 @1280), heading 219.4 true, level camera, h=1.5 m.
// Bright patch = x 1500-1920, y 0-300  ->  az 238-250, elevation +8.5..+18.6 deg.
// Ground band  = y 860-1060           ->  elevation -11.3..-18 deg  (ground 4.6-7.5 m ahead).
import { toUTM } from './utm.mjs'; import { raster } from './fetch.mjs'; import { solar } from './sun.mjs';
const d2r=Math.PI/180, R=6371000, kRef=0.13, CAMH=1.5, SKIP=2.0;
const cands=[['1 Myklebysaeterveien vest',61.3995,11.0316],['2 Madsskardveien traktorvei',61.4443,11.1234],
 ['3a S-Messelt S1',61.4571,10.8362],['3b S-Messelt S2',61.4545,10.8406],['4 Madsskardveien ost',61.4518,11.1428],
 ['5 Jernvinneveien',61.4351,11.1435],['A1 Birkebeinerveien',61.4487,10.9775],['A2 Galaveien C07',61.4625,10.9751]];
const TIMES=[['07:40',7,40],['07:44',7,44],['07:47',7,47],['07:50',7,50],['08:00',8,0],['08:30',8,30]];
function gdir(lat,lon,az){ const d=100,[x0,y0]=toUTM(lat,lon); const [x1,y1]=toUTM(lat+d*Math.cos(az*d2r)/R/d2r, lon+d*Math.sin(az*d2r)/(R*Math.cos(lat*d2r))/d2r); return [(x1-x0)/d,(y1-y0)/d]; }
const res=[];
for (const [name,la,lo] of cands){
  const [bx,by]=toUTM(la,lo); const X0=Math.floor(bx)-200, Y0=Math.floor(by)-450;
  const dom=await raster('DOM',X0,Y0,X0+1200,Y0+650,1), dtm1=await raster('DTM',X0,Y0,X0+1200,Y0+650,1);
  const dtm=await raster('DTM',Math.floor(bx)-250,Math.floor(by)-7050,Math.floor(bx)+19950,Math.floor(by)+2950,20);
  const sun=TIMES.map(([k,h,m])=>({k,...solar(la,lo,2026,9,21,h-2+m/60)})); sun.forEach(s=>s.v=gdir(la,lo,s.az));
  function lit(x,y,z,s){ const [vx,vy]=s.v, tanE=Math.tan(s.elRefr*d2r);
    for(let d=SKIP; d<20000; d+= d<950?0.5:20){ const sv= d<=950? dom.at(x+vx*d,y+vy*d) : dtm.at(x+vx*d,y+vy*d); if(!isFinite(sv)) continue;
      if(sv - d*d*(1-kRef)/(2*R) > z + d*tanE) return false; } return true; }
  const perPos=[];
  const [ex,ey]=gdir(la,lo,90), [nx,ny]=gdir(la,lo,0), [cxv,cyv]=gdir(la,lo,39);
  for(let oe=-20; oe<=20; oe+=10) for(let on=-20; on<=20; on+=10){      // 5x5 neighbourhood, 10 m grid
    const bxx=bx+ex*oe+nx*on, byy=by+ey*oe+ny*on; const cx=bxx+5*cxv, cy=byy+5*cyv; const cz=dtm1.at(cx,cy)+CAMH;
    const patch=[]; for(let az=238; az<=250; az+=1) { const [vx,vy]=gdir(la,lo,az); for(let e=8.5; e<=18.6; e+=1) { const te=Math.tan(e*d2r);
      for(let r=1; r<120; r+=0.5){ const x=cx+vx*r,y=cy+vy*r,z=cz+r*te; const top=dom.at(x,y), g=dtm1.at(x,y); if(top>z && top-g>2){ patch.push([x,y,z]); break; } } } }
    const ground=[]; for(let az=190; az<=250; az+=4) { const [vx,vy]=gdir(la,lo,az); for(const r of [4.6,5.5,6.5,7.5]) { const x=cx+vx*r,y=cy+vy*r; ground.push([x,y,dtm1.at(x,y)+0.3]); } }
    const frac=pts=>sun.map(s=>pts.length? pts.filter(([x,y,z])=>lit(x,y,z,s)).length/pts.length : NaN);
    perPos.push({patchN:patch.length, P:frac(patch), G:frac(ground), off:[oe,on]});
  }
  // consistency score per position: patch dark at 07:40 (<15%), clearly brighter by 07:50 (+>=20 pts vs 07:40), ground dark at 08:00 (<15%)
  const ok=p=> p.patchN>=40 && p.P[0]<0.15 && (p.P[3]-p.P[0])>=0.20 && p.G[4]<0.15;
  const nOK=perPos.filter(ok).length, centre=perPos[12];
  res.push({name, nOK, centre, best: perPos.filter(ok).map(p=>p.off.join(',')).join(' ')});
  console.error('done', name, nOK);
}
const pct=a=>a.map(v=>isFinite(v)?String(Math.round(v*100)).padStart(3):'  -').join(' ');
console.log('Share of visible top-right patch in direct sun at', TIMES.map(t=>t[0]).join(' / '));
console.log('name'.padEnd(28),'pos OK/25','centre patch lit %'.padEnd(26),'centre ground lit %'.padEnd(26),'patchN','OK offsets (E,N m)');
for(const r of res) console.log(r.name.padEnd(28), String(r.nOK).padStart(9), pct(r.centre.P).padEnd(26), pct(r.centre.G).padEnd(26), String(r.centre.patchN).padStart(6), r.best);
