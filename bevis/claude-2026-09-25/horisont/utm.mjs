// WGS84/ETRS89 <-> UTM zone 33 (EPSG:25833), Kruger series (sub-mm accuracy)
const a=6378137, f=1/298.257222101, k0=0.9996, lon0=15*Math.PI/180, E0=500000;
const n=f/(2-f), A=a/(1+n)*(1+n*n/4+n**4/64);
const al=[n/2-2*n*n/3+5*n**3/16, 13*n*n/48-3*n**3/5, 61*n**3/240];
const be=[n/2-2*n*n/3+37*n**3/96, n*n/48+n**3/15, 17*n**3/480];
const de=[2*n-2*n*n/3-2*n**3, 7*n*n/3-8*n**3/5, 56*n**3/15];
export function toUTM(lat, lon){ const p=lat*Math.PI/180, l=lon*Math.PI/180-lon0;
  const e2=2*Math.sqrt(n)/(1+n); const t=Math.sinh(Math.atanh(Math.sin(p))-e2*Math.atanh(e2*Math.sin(p)));
  const xi=Math.atan(t/Math.cos(l)), eta=Math.atanh(Math.sin(l)/Math.sqrt(1+t*t));
  let x=eta, y=xi; for(let j=1;j<=3;j++){ x+=al[j-1]*Math.cos(2*j*xi)*Math.sinh(2*j*eta); y+=al[j-1]*Math.sin(2*j*xi)*Math.cosh(2*j*eta); }
  return [E0+k0*A*x, k0*A*y]; }
export function fromUTM(E, N){ const xi=N/(k0*A), eta=(E-E0)/(k0*A); let x=xi, y=eta;
  for(let j=1;j<=3;j++){ x-=be[j-1]*Math.sin(2*j*xi)*Math.cosh(2*j*eta); y-=be[j-1]*Math.cos(2*j*xi)*Math.sinh(2*j*eta); }
  const chi=Math.asin(Math.sin(x)/Math.cosh(y)); let p=chi; for(let j=1;j<=3;j++) p+=de[j-1]*Math.sin(2*j*chi);
  return [p*180/Math.PI, (lon0+Math.atan(Math.sinh(y)/Math.cos(x)))*180/Math.PI]; }
