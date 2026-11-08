// Bundles the lucide icons used by the real site into src/icons.gen.js (no runtime fetch needed)
const fs=require('fs'),path=require('path');
const dir=path.join(__dirname,'../node_modules/lucide-static/icons');
const names=['feather','book-open','log-in','coins','user','log-out','refresh-cw','sparkles','file-type','arrow-left-right','clipboard-paste','copy','check','lock','file-text','cloud-upload','circle-check','trash-2','arrow-right','loader-circle','loader','mail','eye','eye-off','wallet','x','clock-3','shield-check','check-check','headphones','external-link','qr-code','file-up','circle-alert','download','fast-forward','smartphone','server','database','file','file-down','shield','scan-text','layers','hourglass','user-check','sparkle','send','badge-check','circle-dashed','file-check'];
const out={};const missing=[];
for(const n of names){const f=path.join(dir,n+'.svg');if(!fs.existsSync(f)){missing.push(n);continue;}
 let s=fs.readFileSync(f,'utf8').replace(/<!--[\s\S]*?-->/g,'').replace(/\s*\n\s*/g,' ').trim();
 s=s.replace(/class="[^"]*"/,'').replace(/width="24"/,'width="100%"').replace(/height="24"/,'height="100%"');out[n]=s;}
fs.writeFileSync(path.join(__dirname,'../src/icons.gen.js'),'// AUTO-GENERATED from lucide-static (ISC licence)\nwindow.ICONS='+JSON.stringify(out)+';\n');
console.log('icons',Object.keys(out).length,'missing',missing);
