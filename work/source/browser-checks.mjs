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
for(const [route,s] of Object.entries(spec).filter(([r])=>r!=='/404')){
 const response=await page.goto('http://127.0.0.1:8090'+(route==='/'?route:route+'/'));
 await page.waitForFunction(()=>!!window.REACT_APP_NAVIGATE);
 await page.waitForTimeout(50);
 const actual=await page.evaluate(()=>({h1:document.querySelector('h1').textContent,title:document.title,description:document.querySelector('meta[name="description"]').content,canonical:document.querySelector('link[rel="canonical"]').href}));
 ensure(response.status()===200&&['h1','title','description','canonical'].every(k=>actual[k]===s[k]),'Direct route '+route);
 checks.push({route,direct:true});
}
await page.goto('http://127.0.0.1:8090/');await page.waitForFunction(()=>!!window.REACT_APP_NAVIGATE);
for(const [route,s] of Object.entries(spec).filter(([r])=>r!=='/404')){
 await page.evaluate(route=>window.REACT_APP_NAVIGATE(route==='/'?'/':route+'/'),route);
 await page.waitForFunction(h=>document.querySelector('h1')?.textContent===h,s.h1);
 ensure(await page.title()===s.title,'SPA Title '+route);
 ensure(await page.locator('meta[name="description"]').getAttribute('content')===s.description,'SPA description '+route);
 ensure(await page.locator('link[rel="canonical"]').getAttribute('href')===s.canonical,'SPA canonical '+route);
 const schema=await page.locator('#site-structured-data').textContent();ensure(!!JSON.parse(schema),'SPA schema '+route);
}
const spaGoals=await page.evaluate(()=>window.__testGoals);
await page.goto('http://127.0.0.1:8090/?form=calc');await page.waitForFunction(()=>!!window.REACT_APP_NAVIGATE);await page.waitForTimeout(700);
const calc=page.locator('#calculator');ensure(await calc.count()===1,'Calculator exists');
const calcRect=await calc.boundingBox();ensure(calcRect.y<300&&calcRect.y>-200,'Calculator query scroll');
const before=await calc.innerText();const inputs=calc.locator('input[type="number"]');await inputs.nth(0).fill('1500');await inputs.nth(1).fill('1800');await page.waitForTimeout(100);ensure(await calc.innerText()!==before,'Calculator updates');
const faq=page.locator('button[aria-expanded]').first();const expanded=await faq.getAttribute('aria-expanded');await faq.click();ensure(await faq.getAttribute('aria-expanded')!==expanded,'FAQ toggles');
await page.evaluate(()=>document.addEventListener('click',e=>{if(e.target.closest('a[href^="tel:"],a[href^="https://max.ru/"]'))e.preventDefault()}));
await page.locator('a[href^="tel:"]:visible').first().click();
await page.locator('a[data-max-goal]:visible').first().click();
const goals=await page.evaluate(()=>window.__testGoals);ensure(goals.some(a=>a[1]==='reachGoal'&&a[2]==='click_phone'),'Telephone goal');ensure(goals.some(a=>a[1]==='reachGoal'&&a[2]==='click_max'),'MAX goal');ensure(spaGoals.some(a=>a[1]==='hit'),'SPA Metrika hit');ensure(goals.filter(a=>a[1]==='init').length===1,'One Metrika init');
await page.goto('http://127.0.0.1:8090/rolstavni-bu/katalog/');await page.waitForFunction(()=>!!window.REACT_APP_NAVIGATE);const selects=page.locator('main select');await selects.first().selectOption({label:'Серый'});ensure((await page.locator('[data-product-shop] a').count())===1,'Used catalogue filters');
await page.goto('http://127.0.0.1:8090/nashi-raboty/');await page.waitForFunction(()=>!!window.REACT_APP_NAVIGATE);
const galleryCount=await page.locator('main article').count();ensure(galleryCount>3,'Restored gallery images');
await page.getByRole('button',{name:'Гараж',exact:true}).click();ensure(await page.locator('main article').count()===1,'Gallery filters');
await page.goto('http://127.0.0.1:8090/rolstavni-bu/alutech-1200x1800-white/');await page.waitForFunction(()=>!!window.REACT_APP_NAVIGATE);
ensure((await page.locator('main img').first().getAttribute('src')).includes('seq=bu-alutech-01'),'Original product image source');
ensure(await page.getByText('Иллюстрация. Фото изделия уточняйте.',{exact:true}).first().isVisible(),'Product illustration caption');
fs.mkdirSync('work/reports/screenshots',{recursive:true});
const routes=['/','/rolstavni/','/remont-rolstavney/remont-avtomatiki/','/rolstavni/dlya-pavilona/','/rolstavni-bu/alutech-1600x1600-white-sold/','/nashi-raboty/'];
for(const width of [1440,390]){
 await page.setViewportSize({width,height:1000});
 for(let i=0;i<routes.length;i++){
  await page.goto('http://127.0.0.1:8090'+routes[i]);await page.waitForFunction(()=>!!window.REACT_APP_NAVIGATE);await page.waitForTimeout(400);
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);ensure(!overflow,'Horizontal overflow '+width+' '+routes[i]);
  await page.screenshot({path:'work/reports/screenshots/'+width+'-'+i+'.png',fullPage:false});
 }
}
await page.goto('http://127.0.0.1:8090/');await page.waitForFunction(()=>!!window.REACT_APP_NAVIGATE);await page.getByRole('button',{name:'Меню',exact:true}).click();ensure(await page.locator('header nav').last().isVisible(),'Mobile menu opens');await page.getByRole('button',{name:'Меню',exact:true}).click();
await page.goto('http://127.0.0.1:8090/ceny/');await page.waitForFunction(()=>!!window.REACT_APP_NAVIGATE);await page.locator('a[href="/?form=calc"]').click();await page.waitForFunction(()=>document.querySelector('#calculator')?.getBoundingClientRect().y<300,null,{timeout:10000}).catch(()=>errors.push('Prices calculator link'));
// The single module script hydrates all pages without React recoverable errors.
ensure(!consoleErrors.some(x=>/Minified React error|hydration|didn.t match/i.test(x)),'Hydration warnings');
fs.writeFileSync('work/reports/browser-checks.json',JSON.stringify({directRoutes:checks.length,clientRoutes:37,viewports:[1440,390],goals,errors,consoleErrors},null,2));
console.log(JSON.stringify({directRoutes:checks.length,errors,consoleErrors},null,2));await browser.close();if(errors.length)process.exitCode=1;
