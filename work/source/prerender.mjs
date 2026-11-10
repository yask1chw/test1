import {createRequire} from 'node:module';
const {chromium}=createRequire(import.meta.url)('playwright-core');
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
const localRequest = target => new Promise((resolve,reject)=>{http.get('http://127.0.0.1:8090'+target,{headers:{Host:'5masters.ru','X-Forwarded-Proto':'https'}},res=>{const chunks=[];res.on('data',x=>chunks.push(x));res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body:Buffer.concat(chunks)}));}).on('error',reject);});
const site=path.resolve(process.argv[2]||'work/site');
const seo=JSON.parse(fs.readFileSync(site+'/assets/seo-data.json'));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--no-proxy-server']});
const context=await browser.newContext();
await context.route('**/*',async route=>{
 const url=new URL(route.request().url());
 if(url.hostname!=='127.0.0.1')return route.abort();
 const response=await localRequest(url.pathname+url.search);
 await route.fulfill({status:response.status,headers:response.headers,body:response.body});
});
await context.addInitScript(()=>window.__PRERENDER__=true);
const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(String(e)));
const snapshots={};
for(const [url,spec] of Object.entries(seo)){
 const target=url==='/404'?'/__prerender-missing__/':url==='/'?'/':url+'/';
 await page.goto('http://127.0.0.1:8090'+target);
 await page.waitForFunction(h=>document.querySelector('h1')?.textContent===h,spec.h1,{timeout:15000});
 await page.waitForTimeout(120);
 snapshots[url]=await page.evaluate(()=>{
  const markTextBoundaries = element => {let previous=null;for(const node of [...element.childNodes]){if(node.nodeType===Node.TEXT_NODE && previous?.nodeType===Node.TEXT_NODE)element.insertBefore(document.createComment(' '),node);if(node.nodeType===Node.ELEMENT_NODE)markTextBoundaries(node);previous=node;}};
  markTextBoundaries(document.querySelector('#root'));
  document.querySelectorAll('.reveal.is-visible').forEach(e=>e.classList.remove('is-visible'));
  return {root:document.querySelector('#root').innerHTML,schema:document.querySelector('#site-structured-data')?.textContent};
 });
 console.log(url);
}
fs.writeFileSync('work/reports/snapshots.json',JSON.stringify(snapshots));
fs.writeFileSync('work/reports/prerender-errors.json',JSON.stringify(errors,null,2));
await browser.close();if(errors.length){console.error(errors);process.exitCode=1;}
