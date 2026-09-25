// Mean R,G,B of a raw rgb24 crop read from stdin.  usage: ffmpeg ... -f rawvideo -pix_fmt rgb24 - | node rgb.mjs
let n=0,r=0,g=0,b=0; process.stdin.on('data',d=>{for(let i=0;i+2<d.length;i+=3){r+=d[i];g+=d[i+1];b+=d[i+2];n++;}}).on('end',()=>console.log((r/n).toFixed(1),(g/n).toFixed(1),(b/n).toFixed(1)));
