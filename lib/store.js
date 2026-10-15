import {randomUUID} from 'node:crypto';
import {readFile,stat} from 'node:fs/promises';
export async function assetExists(src){return Boolean(await stat(new URL('..'+src,import.meta.url)).then(x=>x.isFile()).catch(()=>false));}
export const schema=`
CREATE TABLE IF NOT EXISTS lh_content (id INT PRIMARY KEY, draft JSONB NOT NULL, published JSONB NOT NULL, revision INT NOT NULL DEFAULT 1, published_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS lh_users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, password TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('owner','editor')), active BOOLEAN NOT NULL DEFAULT TRUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS lh_sessions (hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES lh_users(id), csrf TEXT NOT NULL, expires TIMESTAMPTZ NOT NULL);
CREATE TABLE IF NOT EXISTS lh_invites (hash TEXT PRIMARY KEY, email TEXT NOT NULL, created_by TEXT NOT NULL REFERENCES lh_users(id), expires TIMESTAMPTZ NOT NULL, used_at TIMESTAMPTZ);
CREATE TABLE IF NOT EXISTS lh_media (id TEXT PRIMARY KEY, data BYTEA, mime TEXT NOT NULL, src TEXT NOT NULL, alt TEXT NOT NULL, profession TEXT NOT NULL DEFAULT 'kozos', year TEXT NOT NULL DEFAULT 'mind', published BOOLEAN NOT NULL DEFAULT FALSE, position INT NOT NULL DEFAULT 0, source_id TEXT UNIQUE, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS lh_inquiries (id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL, profession TEXT NOT NULL, message TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), handled BOOLEAN NOT NULL DEFAULT FALSE);
CREATE TABLE IF NOT EXISTS lh_history (id TEXT PRIMARY KEY, actor TEXT, action TEXT NOT NULL, snapshot JSONB, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS lh_jobs (id TEXT PRIMARY KEY, lease_until TIMESTAMPTZ NOT NULL DEFAULT NOW(), state JSONB NOT NULL DEFAULT '{}');
`;
export async function seed(db,{hasAsset=assetExists}={}){await db.query(schema);const content=JSON.parse(await readFile(new URL('../content.json',import.meta.url),'utf8'));await db.query('INSERT INTO lh_content(id,draft,published) VALUES(1,$1,$1) ON CONFLICT DO NOTHING',[JSON.stringify(content)]);const items=JSON.parse(await readFile(new URL('../gallery.json',import.meta.url),'utf8'));for(const [i,m] of items.entries()){if(!await hasAsset(m.src))continue;await db.query('INSERT INTO lh_media(id,mime,src,alt,profession,year,published,position) VALUES($1,$2,$3,$4,$5,$6,TRUE,$7) ON CONFLICT DO NOTHING',[m.id,m.src.endsWith('.webp')?'image/webp':'image/jpeg',m.src,m.alt,m.profession,m.year||'mind',i]);}}
export async function transact(db,fn){const c=await db.connect();try{await c.query('BEGIN');const r=await fn(c);await c.query('COMMIT');return r;}catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}}
export async function audit(db,actor,action,snapshot=null){await db.query('INSERT INTO lh_history(id,actor,action,snapshot) VALUES($1,$2,$3,$4)',[randomUUID(),actor,action,snapshot?JSON.stringify(snapshot):null]);}
export const mediaSelect='id,src,alt,profession,year,published,position,created_at';
