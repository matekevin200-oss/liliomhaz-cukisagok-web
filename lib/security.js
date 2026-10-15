import {randomBytes,createHash,scrypt,timingSafeEqual} from 'node:crypto';
import {promisify} from 'node:util';
const derive=promisify(scrypt);
export const token=()=>randomBytes(32).toString('base64url');
export const digest=v=>createHash('sha256').update(String(v)).digest('hex');
export const equal=(a,b)=>timingSafeEqual(Buffer.from(digest(a)),Buffer.from(digest(b)));
export function fail(status,message){throw Object.assign(new Error(message),{status});}
export function email(v){const s=String(v||'').trim().toLowerCase();if(s.length>254||!/^\S+@\S+\.\S+$/.test(s))fail(400,'Adj meg érvényes e-mail-címet.');return s;}
export async function hashPassword(value){if(typeof value!=='string'||value.length<12||value.length>200)fail(400,'A jelszó 12–200 karakter hosszú legyen.');const salt=randomBytes(16).toString('hex');const key=await derive(value,salt,64,{N:32768,r:8,p:1,maxmem:64*1024*1024});return `${salt}:${key.toString('hex')}`;}
export async function verifyPassword(value,stored){if(typeof value!=='string'||value.length>200)return false;const [salt,key]=String(stored).split(':');if(!salt||!key)return false;const actual=await derive(value,salt,64,{N:32768,r:8,p:1,maxmem:64*1024*1024});return equal(actual.toString('hex'),key);}
export function imageType(bytes){if(bytes.length<16)fail(400,'A kép sérült vagy hiányos.');if(bytes[0]===255&&bytes[1]===216&&bytes[2]===255)return 'image/jpeg';if(bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))return 'image/png';if(bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP')return 'image/webp';fail(400,'JPG, PNG vagy WebP képet válassz.');}
export function safeImage(v){return typeof v==='string'&&(/^\/(assets\/photos\/|media\/)[a-zA-Z0-9._/-]+$/.test(v)||/^\/[a-zA-Z0-9_-]+\.webp$/.test(v));}
export function validateContent(c){
 if(!c||typeof c!=='object'||Array.isArray(c)||JSON.stringify(c).length>500000)fail(400,'A tartalom nem megfelelő.');
 for(const k of ['site','home','professions','teachers','teaching','exam','pastry','faq','contact','privacy'])if(!c[k])fail(400,`Hiányzó tartalom: ${k}`);
 if(!Array.isArray(c.professions)||c.professions.length!==2||!['szakacs','cukrasz'].every(k=>c.professions.some(p=>p.id===k)))fail(400,'A szakács és cukrász képzés egyaránt szükséges.');
 if(!String(c.site.name||'').trim()||!Array.isArray(c.teachers)||!Array.isArray(c.faq))fail(400,'Töltsd ki az alapadatokat.');
 function walk(o,key=''){if(o===null)return;if(typeof o==='string'){if(o.length>10000)fail(400,'Egy szöveg legfeljebb 10 000 karakter lehet.');if(['image','heroImage','secondaryImage'].includes(key)&&o&&!safeImage(o))fail(400,'A képhez a médiatárból válassz fájlt.');}else if(Array.isArray(o)){if(o.length>100)fail(400,'Egy listában legfeljebb 100 elem lehet.');for(const x of o)walk(x,key);}else if(typeof o==='object'){for(const [k,v]of Object.entries(o)){if(['__proto__','constructor','prototype'].includes(k))fail(400,'Tiltott mező.');walk(v,k);}}else if(!['boolean','number'].includes(typeof o))fail(400,'Érvénytelen mező.');}
 walk(c);for(const p of c.professions)if(!Array.isArray(p.years)||!['10','11'].every(y=>p.years.some(x=>x.id===y)))fail(400,'Mindkét szakmánál szükséges a 10. és a 11. évfolyam.');
 if(c.contact.phone&&!/^\+?[\d ()-]{6,30}$/.test(c.contact.phone))fail(400,'Ellenőrizd a telefonszámot.');
 if(c.contact.facebook){let u;try{u=new URL(c.contact.facebook);}catch{fail(400,'Hibás Facebook-cím.');}if(u.protocol!=='https:'||!['www.facebook.com','facebook.com'].includes(u.hostname))fail(400,'HTTPS Facebook-oldalcímet adj meg.');}
 return c;
}
