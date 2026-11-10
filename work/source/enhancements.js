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
 const picture=repair?g0:(Uc.find(item=>item.path===path)?.image||j2);
 const spec=siteSeo[path], headings=repair?['Что проверяют','Возможные причины','Что сообщить мастеру','Как проходит ремонт','Ограничения']:['Где применяется','Что нужно для подбора','Комплектация','Что влияет на стоимость','Порядок установки','Ограничения'];
 const faq=repair?[{q:data[5],a:data[6]},{q:'Как узнать стоимость и условия работ?',a:'Передайте описание неисправности и параметры конструкции. Стоимость диагностики, деталей, ремонта и время выезда согласуют при обращении и после осмотра.'}]:[{q:'Какие данные нужны для расчёта?',a:data[1]},{q:'Что учитывать перед заказом?',a:data[5]}];
 return n.jsxs(ct,{children:[n.jsx(Bt,{eyebrow:repair?'Ремонт рольставней':'Подбор конструкции',title:spec.h1,subtitle:spec.description,image:picture,imageAlt:'Иллюстрация — '+spec.h1,crumbs:[{label:'Главная',path:'/'},{label:repair?'Ремонт':'Рольставни',path:repair?'/remont-rolstavney/':'/rolstavni/'},{label:spec.h1}],highlights:[{icon:'ri-file-list-line',text:'Расчёт по параметрам'},{icon:'ri-phone-line',text:'Условия по согласованию'}],primaryCta:{label:repair?'Обсудить ремонт в MAX':'Получить расчёт в MAX',href:ot,goal:repair?'max_repair':'max_calc'},secondaryCta:{label:repair?'Все услуги ремонта':'Каталог рольставней',href:repair?'/remont-rolstavney/':'/rolstavni/'}}),contentSection(repair?'Диагностика и порядок обращения':'Подбор под ваш объект',headings.map((h,i)=>[h,data[i]])),!repair&&n.jsx(Xc,{}),n.jsx(Zt,{eyebrow:repair?'Обращение по ремонту':'Запрос расчёта',title:repair?'Сообщите о неисправности':'Расскажите о проёме',text:repair?data[2]:'Отправьте размеры, фото проёма и пожелания к управлению. Условия замера, стоимость и сроки согласуем при обращении.',submitLabel:repair?'Обсудить ремонт':'Получить расчёт',goal:repair?'max_repair':'max_calc'}),n.jsx(ba,{items:faq,title:repair?'Вопросы по этой неисправности':'Вопросы по подбору'})]});
}
function repairedService(props){return detailedPage(props.problemPath,false===true?false:true)}
function landingService(props){return detailedPage(props.path,false)}
function illustrationGallery({preview=false}={}) {
 const [selected,setSelected]=C.useState('Все');
 const records=preview?m0:bc;
 const groups=['Все',...new Set(records.map(item=>item.object))];
 const shown=selected==='Все'?records:records.filter(item=>item.object===selected);
 return n.jsx('section',{className:'bg-background-100 py-16 md:py-24',children:n.jsxs(I,{children:[
 n.jsx(ge,{eyebrow:'Иллюстрации',title:'Варианты решений для объектов',subtitle:'Изображения приведены для иллюстрации. Это не фотографии подтверждённых выполненных работ.'}),
 !preview&&n.jsx('div',{className:'mt-8 flex flex-wrap gap-2',children:groups.map(group=>n.jsx('button',{type:'button',onClick:()=>setSelected(group),className:'rounded-full px-4 py-2 font-label text-xs font-semibold '+(selected===group?'bg-primary-500 text-background-50':'bg-background-50 text-foreground-700'),children:group},group))}),
 n.jsx('div',{className:'mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3',children:shown.map(item=>n.jsxs('article',{className:'overflow-hidden rounded-lg bg-background-50 ring-1 ring-background-200',children:[
 n.jsx('div',{className:'relative h-52 w-full',children:n.jsx('img',{src:item.image,alt:'Иллюстрация: '+item.title,className:'h-full w-full object-cover object-top'})}),
 n.jsxs('div',{className:'p-6',children:[n.jsx('h3',{className:'font-heading text-base font-bold text-foreground-950',children:item.title}),n.jsx('p',{className:'mt-3 text-sm text-foreground-600',children:'Иллюстрация, не фотография выполненного объекта.'})]})]},item.slug))}),
 preview&&n.jsx(se,{to:'/nashi-raboty/',className:'mt-6 inline-flex rounded-md bg-primary-500 px-6 py-3 font-label text-sm font-bold text-background-50',children:'Смотреть все изображения'})
 ]})});
}
function portfolioIllustrations(){return n.jsxs(ct,{children:[n.jsx(Bt,{eyebrow:'Наши работы',title:pageSpec().h1,subtitle:'Иллюстрации вариантов установки рольставней для разных объектов. Подтверждённые фотографии выполненных работ готовятся к публикации.',image:F2,imageAlt:'Иллюстрация установки рольставней',crumbs:[{label:'Главная',path:'/'},{label:'Наши работы'}],primaryCta:{label:'Обсудить объект в MAX',href:ot,goal:'max_main'}}),n.jsx(illustrationGallery,{})]})}
// Original images and gallery records are retained; fabricated project metrics are not rendered.
Z.inn=''; Z.ogrn=''; Z.brandLegal=Z.brand;
for(const item of b0){
 const slug=item.path.split('/').pop();
 const entireCurtain=item.title==='Требуется замена полотна';
 if(item.term.startsWith('Сроки изготовления')) item.term='Срок по согласованию';
 if(repairContent[slug]) item.title=siteSeo[item.path].h1;
 if(slug==='zamena-lamelej'){
  item.title=entireCurtain?'Замена полотна рольставней целиком':'Замена отдельных ламелей рольставней';
  item.description=entireCurtain?'Замена всего полотна, если восстановление отдельных ламелей невозможно или нецелесообразно.':'Замена повреждённых ламелей с сохранением остального полотна.';
 }
 if(['remont-avtomatiki','remont-pulta','srochniy-remont'].includes(slug)){item.price='По диагностике';item.term='По согласованию';}
}
for (const item of Ub) {
 if(item.title==='Повреждены направляющие') item.path='/remont-rolstavney/';
 if(item.title==='Повреждение после взлома') item.path='/remont-rolstavney/';
}
for (const item of ks) {item.title=siteSeo['/rolstavni-bu/'+item.slug].h1;}
const originalJsx=n.jsx, originalJsxs=n.jsxs;
function adapt(factory,type,props,key){
 props={...props};
 if(type===A2) type=repairedService;
 if(type===N0) type=landingService;
 if(type===W2) type=portfolioIllustrations;
 if(type===Yc) {type=illustrationGallery;props.preview=true;}
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
  if(String(props.src).includes('readdy.ai')) {props.alt='Иллюстрация: '+String(props.alt||'рольставни').replace(/^Иллюстрация[: —]*/,'');props.title=props.alt;}
  if(props.src==='/assets/shutter-scheme.svg') {props.alt='Схема рольставней. Не фотография выполненных работ';props.title=props.alt;}
  if(props.src==='/assets/photo-missing.svg') {props.alt='Фотография изделия или объекта не предоставлена';props.title=props.alt;}
 }
 if(type==='img'&&ks.some(item=>item.image===props.src)) return originalJsxs(n.Fragment,{children:[factory(type,props,key),originalJsx('span',{style:{position:'absolute',left:'8px',bottom:'8px',padding:'4px 8px',background:'rgba(255,255,255,.94)',color:'#222',fontSize:'11px',borderRadius:'4px'},children:'Иллюстрация. Фото изделия уточняйте.'})]},key);
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
