import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import YAML from 'yaml';
test('Render-konfiguráció saját adatbázist kapcsol be, fizetős erőforrás nélkül',async()=>{const data=YAML.parse(await readFile(new URL('../render.yaml',import.meta.url),'utf8'));assert.equal(data.databases[0].plan,'free');const service=data.services.find(x=>x.runtime==='node');assert.equal(service.plan,'free');assert.equal(service.envVars.find(x=>x.key==='DATABASE_URL').fromDatabase.name,data.databases[0].name);assert.equal(service.envVars.find(x=>x.key==='BOOTSTRAP_TOKEN').generateValue,true);assert.equal(data.services.find(x=>x.runtime==='static').name,'liliomhaz-cukisagok');});
test('Render YAML megfelel az aktuálisan letöltött hivatalos sémának',{skip:!process.env.RENDER_SCHEMA_PATH},async()=>{const schema=JSON.parse(await readFile(process.env.RENDER_SCHEMA_PATH,'utf8'));const data=YAML.parse(await readFile(new URL('../render.yaml',import.meta.url),'utf8'));const ajv=new Ajv2020({strict:false,allErrors:true});addFormats(ajv);const check=ajv.compile(schema);assert.equal(check(data),true,JSON.stringify(check.errors));});
