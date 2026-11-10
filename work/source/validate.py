from pathlib import Path
from bs4 import BeautifulSoup
import http.client,json,csv,urllib.parse,xml.etree.ElementTree as ET
ROOT=Path('work/site');REPORT=Path('work/reports');seo=json.loads((ROOT/'assets/seo-data.json').read_text())
errors=[];pages=[];links=set();titles=set();descs=set()
def req(path,host='5masters.ru',secure=True):
 c=http.client.HTTPConnection('127.0.0.1',8090,timeout=10);headers={'Host':host}
 if secure:headers['X-Forwarded-Proto']='https'
 c.request('GET',urllib.parse.quote(path,safe='/%?=&:'),headers=headers);r=c.getresponse();body=r.read();data=(r.status,dict(r.getheaders()),body);c.close();return data
def check(condition,text):
 if not condition:errors.append(text)
urls=[u.text for u in ET.parse(ROOT/'sitemap.xml').iter() if u.tag.endswith('loc')]
for url in urls:
 path=urllib.parse.urlsplit(url).path;status,_,body=req(path);s=BeautifulSoup(body,'html.parser');spec=seo[path.rstrip('/') or '/']
 title=s.title.get_text();desc=s.select_one('meta[name="description"]')['content'];h1=s.h1.get_text();canonical=s.select_one('link[rel="canonical"]')['href']
 pages.append([url,status,h1,title,desc,canonical])
 check(status==200,path+' status');check(len(s.select('title'))==len(s.select('meta[name="description"]'))==len(s.select('h1'))==len(s.select('link[rel="canonical"]'))==1,path+' duplicate tags')
 check([h1,title,desc,canonical]==[spec[k] for k in ['h1','title','description','canonical']],path+' spec mismatch')
 check(title not in titles and desc not in descs,path+' duplicate metadata');titles.add(title);descs.add(desc)
 check(not any(x in s.body.get_text() for x in ['undefined','null','[object Object]','1831000000','1101800000000']),path+' invalid text')
 check('readdy.ai/api/search-image' not in str(s),path+' remote generated image')
 check(len(s.select('link[rel="preload"][as="image"]'))<=1,path+' preload count')
 for img in s.select('main img'):check(img.has_attr('width') and img.has_attr('height'),path+' missing image size')
 for script in s.select('script[type="application/ld+json"]'):
  data=json.loads(script.string);graph=data.get('@graph',[data]);types=[x['@type'] for x in graph]
  check(types.count('LocalBusiness')==1,path+' LocalBusiness count')
  if path.startswith('/rolstavni-bu/') and path not in ['/rolstavni-bu/','/rolstavni-bu/katalog/','/rolstavni-bu/vykup/']:
   product=next(x for x in graph if x['@type']=='Product');check(product['itemCondition'].endswith('UsedCondition'),path+' condition');check(product['offers']['priceCurrency']=='RUB',path+' currency');check(product['offers']['availability'].endswith('SoldOut' if '-sold/' in path else 'InStock'),path+' stock')
  else:check('Product' not in types,path+' category as product')
 for a in s.select('a[href]'):
  href=a['href'];parsed=urllib.parse.urlsplit(href)
  if href.startswith('/') and not href.startswith('//'):
   check(parsed.path=='/' or '.' in parsed.path.rsplit('/',1)[-1] or parsed.path.endswith('/'),path+' slash: '+href);links.add(parsed.path)
  if href.startswith('#') and href!='#':check(s.find(id=urllib.parse.unquote(href[1:])) is not None,path+' missing fragment '+href)
 for asset in s.select('script[src],link[href],img[src]'):
  href=asset.get('src',asset.get('href',''))
  if href.startswith('/') and not href.startswith('//') and asset.get('rel')!=['canonical']:links.add(urllib.parse.urlsplit(href).path)
for link in sorted(links):check(req(link)[0]==200,'internal link '+link)
legacy=['/Remont-Okon/krysha-na-balkon/','/Инфо/gost-na-okna/','/slovar-okna/Замена-Стеклопакетов/','/Детский-замок-BSL/Ремонт-Рольставен/','/Замена-Стеклопакетов/Remont-Okon/']
redirects=[]
for old in legacy:
 status,headers,_=req(old);check(status==404,old+' legacy status');redirects.append([old,'—',status,'Нет содержимого старой страницы и подтверждённого аналога в архиве; тематический 301 не назначен.'])
for path in ['/not-a-real-page/','/assets/missing.js','/rolstavni/not-a-real-service/']:
 status,_,body=req(path);check(status==404,path+' unknown status');check('noindex' in body.decode(),path+' noindex')
for path,host,secure,target in [('/', 'www.5masters.ru',False,'https://5masters.ru/'),('/rolstavni','www.5masters.ru',False,'https://5masters.ru/rolstavni/'),('/rolstavni/index.html','www.5masters.ru',False,'https://5masters.ru/rolstavni/'),('/rolstavni/','5masters.ru',False,'https://5masters.ru/rolstavni/'),('/rolstavni?x=1','5masters.ru',True,'https://5masters.ru/rolstavni/?x=1')]:
 status,headers,_=req(path,host,secure);check(status==301 and headers.get('Location')==target,'redirect '+path+' '+str((status,headers.get('Location'))));redirects.append([('https' if secure else 'http')+'://'+host+path,target,status,'Нормализация домена, HTTPS и канонического пути за один переход.'])
robots=req('/robots.txt');check(robots[0]==200 and b'https://5masters.ru/sitemap.xml' in robots[2],'robots')
with (REPORT/'pages.csv').open('w',encoding='utf-8-sig',newline='') as f:
 w=csv.writer(f);w.writerow(['URL','HTTP','H1','Title','Description','canonical']);w.writerows(pages)
with (REPORT/'redirects.csv').open('w',encoding='utf-8-sig',newline='') as f:
 w=csv.writer(f);w.writerow(['Старый URL','Назначение','HTTP','Обоснование']);w.writerows(redirects)
result={'pages':len(pages),'internal_targets':len(links),'errors':errors};(REPORT/'http-checks.json').write_text(json.dumps(result,ensure_ascii=False,indent=2));print(json.dumps(result,ensure_ascii=False,indent=2));raise SystemExit(bool(errors))
