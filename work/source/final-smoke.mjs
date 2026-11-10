import {createRequire} from 'node:module';const {chromium}=createRequire(import.meta.url)('playwright-core');
import fs from 'node:fs';import http from 'node:http';
const request=target=>new Promise((resolve,reject)=>http.get('http://127.0.0.1:8090'+target,{headers:{Host:'5masters.ru','X-Forwarded-Proto':'https'}},res=>{let chunks=[];res.on('data',x=>chunks.push(x));res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body:Buffer.concat(chunks)}))}).on('error',reject));
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,args:['--no-sandbox','--no-proxy-server']});
const context=await browser.newContext({viewport:{width:1440,height:1000}});
await context.route('**/*',async route=>{const url=new URL(route.request().url());if(url.hostname!=='127.0.0.1')return route.abort();await route.fulfill(await request(url.pathname+url.search));});
await context.addInitScript(()=>{window.__testGoals=[];window.ym=(...args)=>window.__testGoals.push(args);});
const page=await context.newPage(),errors=[],consoleErrors=[],checks=[];
page.on('pageerror',e=>errors.push(String(e)));page.on('console',msg=>{if(msg.type()==='error'&&!msg.text().includes('net::ERR_FAILED'))consoleErrors.push(msg.text())});
const spec=JSON.parse(fs.readFileSync('work/site/assets/seo-data.json'));
const ensure=(v,msg)=>{if(!v)errors.push(msg);};
for(const [route,s] of Object.entries(spec).filter(([r])=>['/','/rolstavni','/kontakty'].includes(r))){
 const response=await page.goto('http://127.0.0.1:8090'+(route==='/'?route:route+'/'));
 await page.waitForFunction(()=>!!window.REACT_APP_NAVIGATE);
 await page.waitForTimeout(50);
 const actual=await page.evaluate(()=>({h1:document.querySelector('h1').textContent,title:document.title,description:document.querySelector('meta[name="description"]').content,canonical:document.querySelector('link[rel="canonical"]').href}));
 ensure(response.status()===200&&['h1','title','description','canonical'].every(k=>actual[k]===s[k]),'Direct route '+route);
 checks.push({route,direct:true});
}

console.log(JSON.stringify({checks,errors,consoleErrors},null,2));fs.writeFileSync('work/reports/final-copy-checks.json',JSON.stringify({checks,errors,consoleErrors},null,2));await browser.close();if(errors.length)process.exitCode=1;
