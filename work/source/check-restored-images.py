from pathlib import Path
from bs4 import BeautifulSoup
import json
root=Path(__file__).resolve().parent.parent
results=[];errors=[]
for original in (root/'original').rglob('*.html'):
 if original.name=='404.html':continue
 relative=original.relative_to(root/'original');updated=root/'site'/relative
 def images(p):
  soup=BeautifulSoup(p.read_text(),'html.parser')
  return [img['src'] for img in soup.select('main img[src]')]
 before,after=images(original),images(updated)
 missing=sorted(set(before)-set(after));unexpected=sorted(set(after)-set(before))
 if missing or unexpected:errors.append(str(relative))
 results.append({'page':str(relative),'original_images':len(before),'restored_images':len(after),'missing':missing,'unexpected':unexpected})
report={'pages':len(results),'errors':errors,'image_sources_match_original':not errors,'external_provider_check':'Not verified: environment proxy blocks readdy.ai (CONNECT 403). Original URLs preserved.','results':results}
(root/'reports/restored-images.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print(json.dumps({'pages':len(results),'errors':errors,'image_sources_match_original':not errors},ensure_ascii=False));raise SystemExit(bool(errors))
