from pathlib import Path
import sys,json,re,shutil,csv
from bs4 import BeautifulSoup
from content import LANDINGS,REPAIRS
BASE=Path(__file__).resolve().parent
ROOT=BASE.parent
ORIGINAL=Path(sys.argv[1]).resolve() if len(sys.argv)>1 else ROOT/'original'
SITE=Path(sys.argv[2]).resolve() if len(sys.argv)>2 else ROOT/'site'
shutil.copytree(ORIGINAL,SITE,dirs_exist_ok=True)
rows=list(csv.reader((BASE/'seo.tsv').open(),delimiter='\t'))
seo={url.rstrip('/') or '/':dict(h1=h1,title=title,description=desc,canonical='https://5masters.ru'+url,noindex=False) for url,h1,title,desc in rows}
# The owner's table explicitly conditions these two entries on missing evidence.
seo['/nashi-raboty'].update(title='Наши работы | 5 Мастеров',description='Фотографии выполненных работ готовятся к публикации. Обсудите установку и ремонт рольставней для вашего объекта с компанией «5 Мастеров».')
seo['/kontakty'].update(title='Контакты «5 Мастеров» в Ижевске — телефон и email',description='Телефон и email компании «5 Мастеров» в Ижевске. Свяжитесь с нами, чтобы обсудить покупку рольставней, ремонт или установку. Время посещения согласуйте заранее.')
seo['/404']=dict(h1='Страница не найдена',title='Страница не найдена | 5 Мастеров',description='Запрашиваемая страница не найдена. Перейдите в каталог рольставней, раздел ремонта или контакты.',canonical='https://5masters.ru/404/',noindex=True)
(SITE/'assets/seo-data.json').write_text(json.dumps(seo,ensure_ascii=False,indent=2))
s=(ORIGINAL/'assets/index-DN2BKFX8.js').read_text()
start=s.index('function I({');meta=s.index('const rv=');app=s[start:meta]
replacements={
 'До 5 лет на конструкции и монтаж, гарантия на ремонт.':'Условия гарантии фиксируются в договоре.',
 'На новые конструкции и монтаж даём гарантию до 5 лет, на ремонт и замененные детали — гарантию на выполненные работы. Все обязательства фиксируем в договоре.':'Условия гарантии на конструкции, монтаж и ремонт согласуются до начала работ и фиксируются в договоре.',
 'На новые конструкции и монтаж — до 5 лет. Гарантия фиксируется в договоре вместе со сроками и стоимостью.':'Условия гарантии на конструкции и монтаж фиксируются в договоре вместе со сроками и стоимостью.',
 'Реквизиты':'Компания',
 'ООО «5 Мастеров»':'5 Мастеров', 'ИНН 1831000000':'','ОГРН 1101800000000':'',
 'Показываем реальные фото объектов, а не стоковые картинки.':'Фотографии объектов предоставляются отдельно; схемы на сайте не являются фотографиями работ.',
 'Реальные объекты в Ижевске и Удмуртии':'Обсудите задачу вашего объекта',
 'Перейдите на страницу с причиной, сроками и ориентировочной стоимостью ремонта.':'Выберите неисправность, чтобы узнать порядок диагностики и обращения.',
 'Написать в MAX в MAX':'Написать в MAX',
 'Да, выезд замерщика по Ижевску бесплатный.':'Условия выезда замерщика по Ижевску согласуются при обращении.',
 'Да. Замер бесплатный, демонтаж старых конструкций и вывоз мусора включаем в работы.':'Условия замера, демонтажа старых конструкций и вывоза мусора согласуются до начала работ.',
 'Согласуем бесплатный замер':'Согласуем замер',
 'бесплатно':'по согласованию',
 'Ламели, направляющие и приводы под основные системы в наличии.':'Совместимость и наличие деталей уточняются после диагностики.',
 'Склад новых комплектующих и б/у рольставней в Ижевске.':'Наличие комплектующих и б/у конструкций уточняйте при обращении.',
 'Работаем с 2013 года':'Продажа, монтаж и ремонт',
 'Да, замер и монтаж по Ижевску бесплатные, по Удмуртии работаем с выездом — условия уточняются при заявке.':'Условия замера, выезда и стоимость монтажа по Ижевску и Удмуртии согласуются при обращении и включаются в смету.',
 'Похожие варианты на складе':'Другие варианты каталога — наличие уточняйте',
 'Сделаем так же на вашем объекте — с замером, монтажом и гарантией.':'Обсудим размеры вашего проёма, подбор конструкции и порядок монтажа.',
 'Каждый проект — это конкретные размеры, управление, сроки и результат.':'Подтверждённые фотографии и сведения о проектах готовятся к публикации.',
}
removed=[]
def clean_literal(m):
 raw=m.group(0)
 try: value=json.loads(raw)
 except: return raw
 if not re.search('[А-Яа-я]',value) or value.startswith('http'):return raw
 before=value
 for a,b in replacements.items():value=value.replace(a,b)
 if 'мы установили тысячи конструкций' in value:value=' — работаем с частными клиентами и бизнесом. Условия заказа согласуются индивидуально.'
 if not value.endswith('?'):
  if re.search(r'\d[–—\d ]*(?:рабочих )?(?:дней|дня|часа|часов)',value) and not ('₽' in value or 'эксплуатация' in value):
   value='Сроки изготовления, монтажа или выезда согласуются при обращении с учётом конструкции и объёма работ.'
  value=re.sub(r'(?:Гарантия|гарантия|с гарантией) до 5 лет','Условия гарантии по договору',value)
  value=value.replace('Экономия 40–60%','Сравнение стоимости').replace('экономия до 70%','стоимость зависит от ремонта').replace('экономия 40–60%','стоимость зависит от состояния').replace('Дешевле новых на 40–60%','Сравните с новыми').replace('дешевле новых на 40–60%','цена зависит от состояния')
  value=value.replace('Замер бесплатно','Условия замера по согласованию').replace('Замер по Ижевску бесплатно','Замер по согласованию').replace('замер бесплатно','замер по согласованию').replace('бесплатный замер','замер по согласованию').replace('бесплатного замера','согласованного замера').replace('Замер бесплатный.','Условия замера согласуются при обращении.').replace('замерим бесплатно','согласуем замер').replace('Бесплатный выезд специалиста','Согласованный выезд специалиста').replace('Выезд по Ижевску бесплатный.','Условия выезда согласуются при обращении.')
  value=value.replace('Диагностика бесплатно','Диагностика по согласованию').replace('Диагностика ремонта бесплатно','Условия диагностики по согласованию').replace('Диагностика при выезде бесплатная','Условия диагностики согласуются при обращении').replace('диагностика бесплатно','диагностика по согласованию').replace('Диагностика при выезде — бесплатно','Условия диагностики по согласованию').replace('бесплатная диагностика','диагностика').replace('Выезд в день обращения','Выезд по согласованию')
 if value!=before:removed.append({'before':before,'after':value})
 return json.dumps(value,ensure_ascii=False)
app=re.sub(r'"(?:[^"\\]|\\.)*"',clean_literal,app)
# All remote generated images are replaced by explicit local placeholders.
app=re.sub(r'"https://readdy\.ai/api/search-image[^"\n]*"','"/assets/shutter-scheme.svg"',app)
# Preserve specific product prices from the project; detach incorrect repair pricing.
app=app.replace('["Ремонт автоматики и пультов","от 2 500 ₽"]','["Ремонт автоматики и пультов","По диагностике"]')
# The catalogue sort select showed untranslated machine values.
app=app.replace('children:r},r))','children:r},r))')
# Single SEO source for server HTML, H1 and client route updates.
custom='\nconst siteSeo='+json.dumps(seo,ensure_ascii=False)+';\nconst landingContent='+json.dumps(LANDINGS,ensure_ascii=False)+';\nconst repairContent='+json.dumps(REPAIRS,ensure_ascii=False)+';\n'+(BASE/'enhancements.js').read_text().replace('false===true?false:true','true')+'\nHc.length=0;\n'
app=app.replace('const iv=',custom+'const iv=')
oldmetaend=s.index(',zm=rv;',meta)
s=s[:start]+app+'const rv=siteSeo'+s[oldmetaend:]
s=s.replace('x.href=h.canonical},[r])','x.href=h.canonical;if(h.noindex)x.remove();updateStructuredData();const hit=r+i+c;if(window.__lastSeoHit!==undefined&&window.__lastSeoHit!==hit&&typeof window.ym==="function")window.ym(113756817,"hit",location.href,{referer:window.__lastSeoUrl});window.__lastSeoHit=hit;window.__lastSeoUrl=location.href},[r,i,c])')
# Build mode creates a clean DOM for prerendering. Production hydrates generated HTML.
s=s.replace('Zx.hydrateRoot(document.getElementById("root"),n.jsx(C.StrictMode,{children:n.jsx(cv,{})}));','const appTree=n.jsx(C.StrictMode,{children:n.jsx(cv,{})});if(window.__PRERENDER__)Zx.createRoot(document.getElementById("root")).render(appTree);else Zx.hydrateRoot(document.getElementById("root"),appTree);')
(SITE/'assets/site-app.js').write_text(s)
(SITE/'assets/index-DN2BKFX8.js').unlink()
for p in SITE.rglob('*.html'):
 soup=BeautifulSoup(p.read_text(),'html.parser')
 for node in soup.select('script[type="application/ld+json"],link[rel="preload"][as="image"]'):node.decompose()
 for node in soup.select('script[src="/assets/index-DN2BKFX8.js"]'):node['src']='/assets/site-app.js'
 for tag in soup.select('meta[name="description"], meta[property="og:description"],meta[name="twitter:description"]'):
  # overwritten on all routes by the source below
  pass
 route='/' if p==SITE/'index.html' else '/'+str(p.parent.relative_to(SITE)).strip('/')
 if p.name=='404.html':route='/404'
 spec=seo[route]
 soup.title.string=spec['title']
 for tag in soup.select('meta[name="description"],meta[property="og:description"],meta[name="twitter:description"]'):tag['content']=spec['description']
 for tag in soup.select('meta[property="og:title"],meta[name="twitter:title"]'):tag['content']=spec['title']
 for tag in soup.select('link[rel="canonical"]'):
  if spec['noindex']:tag.decompose()
  else:tag['href']=spec['canonical']
 for tag in soup.select('meta[property="og:url"]'):tag['content']=spec['canonical']
 p.write_text(str(soup))
# SVG placeholders are diagrams, visibly labelled, never used as proof of real work.
for name,label in [('shutter-scheme','Схема рольставней · не фотография'),('photo-missing','Фотография не предоставлена')]:
 (SITE/f'assets/{name}.svg').write_text(f'''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800"><rect width="1200" height="800" fill="#edf0e9"/><rect x="280" y="120" width="640" height="490" rx="14" fill="#dce4d3" stroke="#627a51" stroke-width="12"/><path d="M300 190H900M300 250H900M300 310H900M300 370H900M300 430H900M300 490H900M300 550H900" stroke="#99ac88" stroke-width="8"/><rect x="250" y="95" width="700" height="85" rx="10" fill="#476337"/><text x="600" y="710" text-anchor="middle" font-family="sans-serif" font-size="30" fill="#34452c">{label}</text></svg>''')
(SITE/'.htaccess').write_text('''Options -MultiViews -Indexes
DirectoryIndex index.html
ErrorDocument 404 /404.html
RewriteEngine On

# Combine host, HTTPS, index.html and slash normalization in one redirect.
# X-Forwarded-Proto must be set by a trusted reverse proxy only (see deployment).
RewriteCond %{HTTPS} !=on
RewriteCond %{HTTP:X-Forwarded-Proto} !^https$ [NC]
RewriteRule ^ - [E=NEED_HTTPS:1]
RewriteCond %{HTTP_HOST} !^5masters\\.ru$ [NC,OR]
RewriteCond %{ENV:NEED_HTTPS} =1
RewriteRule ^ - [E=CANONICAL_HOST:1]

RewriteCond %{THE_REQUEST} \\s/+(.*/)?index\\.html[\\s?] [NC]
RewriteRule ^(.*)index\\.html$ https://5masters.ru/$1 [R=301,L,NE]

RewriteCond %{REQUEST_FILENAME} -d
RewriteCond %{REQUEST_URI} !/$
RewriteRule ^ https://5masters.ru%{REQUEST_URI}/ [R=301,L,NE]

RewriteCond %{ENV:CANONICAL_HOST} =1
RewriteRule ^ https://5masters.ru%{REQUEST_URI} [R=301,L,NE]

# No topical evidence for legacy URLs: return a real 404 rather than guessing.
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]
RewriteRule ^ - [R=404,L]

<IfModule mod_mime.c>
 AddType application/javascript .js
 AddType text/css .css
 AddType image/svg+xml .svg
</IfModule>
''')
(ROOT/'reports/changed-claims.json').write_text(json.dumps(removed,ensure_ascii=False,indent=2))
print('Prepared',len(rows),'routes. Run prerender.mjs against Apache, then validate.')
