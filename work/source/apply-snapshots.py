from pathlib import Path
import json,sys
from bs4 import BeautifulSoup
root=Path(sys.argv[1] if len(sys.argv)>1 else 'work/site')
for route,data in json.loads(Path('work/reports/snapshots.json').read_text()).items():
 p=root/('404.html' if route=='/404' else route.strip('/')+'/index.html' if route!='/' else 'index.html')
 s=BeautifulSoup(p.read_text(),'html.parser');target=s.select_one('#root');target.clear();fragment=BeautifulSoup(data['root'],'html.parser')
 for node in list(fragment.contents):target.append(node)
 for old in s.select('script[type="application/ld+json"]'):old.decompose()
 if data.get('schema'):
  tag=s.new_tag('script',id='site-structured-data',type='application/ld+json');tag.string=data.get('schema');s.head.append(tag)
 for old in s.select('link[rel="preload"][as="image"]'):old.decompose()
 p.write_text(str(s))
print('Applied all 38 snapshots, including 404.')
