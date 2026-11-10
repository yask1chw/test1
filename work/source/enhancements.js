// Runs before route elements are created. Original React components and interactions remain.
const seoPath = () => location.pathname.replace(/\/+$/, '') || '/';
const finalUrl = value => {
 if (typeof value !== 'string' || !value.startsWith('/') || value.startsWith('//')) return value;
 const match = value.match(/^([^?#]*)(.*)$/); let path=match[1];
 if (!/\.[^/]+$/.test(path) && path !== '/') path=path.replace(/\/+$/, '')+'/';
 return path+match[2];
};
const pageSpec = () => siteSeo[seoPath()] || siteSeo['/404'];
function contentSection(title, paragraphs) {
 return n.jsx('section',{className:'bg-background-50 py-16 md:py-24',children:n.jsxs(I,{children:[
 n.jsx(ge,{title}),n.jsx('div',{className:'mt-8 grid grid-cols-1 gap-4 md:grid-cols-2',children:paragraphs.map(([heading,text])=>n.jsxs('article',{className:'rounded-lg bg-background-100 p-6 ring-1 ring-background-200',children:[n.jsx('h2',{className:'font-heading text-base font-bold text-foreground-950',children:heading}),n.jsx('p',{className:'mt-3 text-sm leading-relaxed text-foreground-600',children:text})]},heading))})]})});
}
function detailedPage(path, repair) {
 const key=path.split('/').pop(), data=(repair?repairContent:landingContent)[key];
 if (!data) return n.jsx(Hs,{});
 const spec=siteSeo[path], headings=repair?['Что проверяют','Возможные причины','Что сообщить мастеру','Как проходит ремонт','Ограничения']:['Где применяется','Что нужно для подбора','Комплектация','Что влияет на стоимость','Порядок установки','Ограничения'];
 const faq=repair?[{q:data[5],a:data[6]},{q:'Как узнать стоимость и условия работ?',a:'Передайте описание неисправности и параметры конструкции. Стоимость диагностики, деталей, ремонта и время выезда согласуют при обращении и после осмотра.'}]:[{q:'Какие данные нужны для расчёта?',a:data[1]},{q:'Что учитывать перед заказом?',a:data[5]}];
 return n.jsxs(ct,{children:[n.jsx(Bt,{eyebrow:repair?'Ремонт рольставней':'Подбор конструкции',title:spec.h1,subtitle:spec.description,image:'/assets/shutter-scheme.svg',imageAlt:'Схема рольставней, не фотография объекта',crumbs:[{label:'Главная',path:'/'},{label:repair?'Ремонт':'Рольставни',path:repair?'/remont-rolstavney/':'/rolstavni/'},{label:spec.h1}],highlights:[{icon:'ri-file-list-line',text:'Расчёт по параметрам'},{icon:'ri-phone-line',text:'Условия по согласованию'}],primaryCta:{label:repair?'Обсудить ремонт в MAX':'Получить расчёт в MAX',href:ot,goal:repair?'max_repair':'max_calc'},secondaryCta:{label:repair?'Все услуги ремонта':'Каталог рольставней',href:repair?'/remont-rolstavney/':'/rolstavni/'}}),contentSection(repair?'Диагностика и порядок обращения':'Подбор под ваш объект',headings.map((h,i)=>[h,data[i]])),n.jsx(Zt,{eyebrow:repair?'Обращение по ремонту':'Запрос расчёта',title:repair?'Сообщите о неисправности':'Расскажите о проёме',text:repair?data[2]:'Отправьте размеры, фото проёма и пожелания к управлению. Условия замера, стоимость и сроки согласуем при обращении.',submitLabel:repair?'Обсудить ремонт':'Получить расчёт',goal:repair?'max_repair':'max_calc'}),n.jsx(ba,{items:faq,title:repair?'Вопросы по этой неисправности':'Вопросы по подбору'})]});
}
function repairedService(props){return detailedPage(props.problemPath,false===true?false:true)}
function landingService(props){return detailedPage(props.path,false)}
function portfolioPending(){return n.jsxs(ct,{children:[n.jsx(Bt,{eyebrow:'Портфолио',title:pageSpec().h1,subtitle:'Фотографии выполненных работ готовятся к публикации. Обсудите с нами задачу вашего объекта по телефону или в MAX.',image:'/assets/photo-missing.svg',imageAlt:'Фотографии объектов не предоставлены',crumbs:[{label:'Главная',path:'/'},{label:'Наши работы'}],primaryCta:{label:'Обсудить объект в MAX',href:ot,goal:'max_main'}}),contentSection('Информация о работах',[['Фотографии объектов','В предоставленных материалах нет подтверждённых фотографий выполненных работ. Карточки с иллюстрациями, размерами и стоимостью не опубликованы как реальные кейсы.']])]})}
// Remove unverified case records, retain all real catalogue records from the supplied project.
m0.length=0; bc.length=0;
Z.inn=''; Z.ogrn=''; Z.brandLegal=Z.brand;
for(const item of b0){
 const slug=item.path.split('/').pop();
 if(repairContent[slug]) item.title=siteSeo[item.path].h1;
 if(['remont-avtomatiki','remont-pulta','srochniy-remont'].includes(slug)){item.price='По диагностике';item.term='По согласованию';}
}
for (const item of Ub) {
 if(item.title==='Повреждены направляющие') item.path='/remont-rolstavney/';
 if(item.title==='Повреждение после взлома') item.path='/remont-rolstavney/';
}
for (const item of ks) {item.title=siteSeo['/rolstavni-bu/'+item.slug].h1;item.image='/assets/photo-missing.svg';}
const originalJsx=n.jsx, originalJsxs=n.jsxs;
function adapt(factory,type,props,key){
 props={...props};
 if(type===A2) type=repairedService;
 if(type===N0) type=landingService;
 if(type===W2) type=portfolioPending;
 // JSON-LD is maintained in one head script for both HTTP HTML and navigation.
 if(type==='script' && props.type==='application/ld+json') return null;
 if(type===Oe && typeof props.label==='string') props.label=props.label.replace(/(?: в MAX){2,}/g,' в MAX');
 if(type==='h1') props.children=pageSpec().h1;
 if(type==='a' && props.href) props.href=finalUrl(props.href);
 if(type===se && props.to) props.to=finalUrl(props.to);
 if(type==='img') {
  props.width=props.width||1200;props.height=props.height||800;props.decoding='async';
  const hero=String(props.className).includes('md:h-[420px]')||String(props.className).includes('md:h-[520px]');
  props.loading=hero?'eager':'lazy';
  if(hero) props.fetchPriority='high';
  if(String(props.src).includes('readdy.ai')) props.src='/assets/shutter-scheme.svg';
  if(props.src==='/assets/shutter-scheme.svg') {props.alt='Схема рольставней. Не фотография выполненных работ';props.title=props.alt;}
  if(props.src==='/assets/photo-missing.svg') {props.alt='Фотография изделия или объекта не предоставлена';props.title=props.alt;}
 }
 return factory(type,props,key);
}
n.jsx=(type,props,key)=>adapt(originalJsx,type,props,key);
n.jsxs=(type,props,key)=>adapt(originalJsxs,type,props,key);
function updateStructuredData(){
 const path=seoPath(), spec=pageSpec(), graph=[];
 if(spec.noindex){document.querySelector('#site-structured-data')?.remove();return;}
 graph.push({'@type':'LocalBusiness','@id':'https://5masters.ru/#organization',name:Z.brand,url:'https://5masters.ru/',telephone:'+73412240234',email:Z.email,areaServed:{'@type':'City',name:'Ижевск'}});
 const nav=document.querySelector('main nav[aria-label="Хлебные крошки"]');
 if(nav){const items=[...nav.querySelectorAll('a')].map(a=>({name:a.textContent.trim(),item:new URL(a.getAttribute('href'),'https://5masters.ru').href}));items.push({name:document.querySelector('h1').textContent.trim(),item:spec.canonical});graph.push({'@type':'BreadcrumbList',itemListElement:items.map((item,i)=>({'@type':'ListItem',position:i+1,...item}))});}
 const product=ks.find(p=>path==='/rolstavni-bu/'+p.slug);
 if(product){graph.push({'@type':'Product',name:product.title,sku:product.slug,brand:{'@type':'Brand',name:product.brand},description:spec.description,itemCondition:'https://schema.org/UsedCondition',offers:{'@type':'Offer',url:spec.canonical,price:product.price.replace(/[^\d]/g,''),priceCurrency:'RUB',itemCondition:'https://schema.org/UsedCondition',availability:product.status==='sold'?'https://schema.org/SoldOut':'https://schema.org/InStock',seller:{'@id':'https://5masters.ru/#organization'}}});}
 const faq=[...document.querySelectorAll('main button[aria-expanded]')].map(b=>({q:b.textContent.trim(),a:b.nextElementSibling?.textContent.trim()})).filter(f=>f.q&&f.a);
 if(faq.length) graph.push({'@type':'FAQPage',mainEntity:faq.map(f=>({'@type':'Question',name:f.q,acceptedAnswer:{'@type':'Answer',text:f.a}}))});
 let script=document.querySelector('#site-structured-data');if(!script){script=document.createElement('script');script.id='site-structured-data';script.type='application/ld+json';document.head.append(script);}script.textContent=JSON.stringify({'@context':'https://schema.org','@graph':graph}).replace(/</g,'\\u003c');
}
// Keep existing MAX goal names; telephone clicks are an independent action.
document.addEventListener('click',event=>{if(event.target.closest('a[href^="tel:"]')&&typeof window.ym==='function')window.ym(113756817,'reachGoal','click_phone');});
