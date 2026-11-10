from pathlib import Path
import json
replacements={
'До 5 лет на конструкции и монтаж, гарантия на ремонт.':'Условия гарантии фиксируются в договоре.',
'На новые конструкции и монтаж даём гарантию до 5 лет, на ремонт и замененные детали — гарантию на выполненные работы. Все обязательства фиксируем в договоре.':'Условия гарантии на конструкции, монтаж и ремонт согласуются до начала работ и фиксируются в договоре.',
'На новые конструкции и монтаж — до 5 лет. Гарантия фиксируется в договоре вместе со сроками и стоимостью.':'Условия гарантии на конструкции и монтаж фиксируются в договоре вместе со сроками и стоимостью.',
'Реквизиты':'Компания'
}
# Extend the reproducible literal transformation, then update the built copy in place.
p=Path('work/source/build.py');s=p.read_text();key="replacements={\n";s=s.replace(key,key+''.join(' '+repr(a)+':'+repr(b)+',\n' for a,b in replacements.items()));p.write_text(s)
for p in [Path('work/site/assets/site-app.js'),*Path('work/site').rglob('*.html')]:
 s=p.read_text()
 for a,b in replacements.items():s=s.replace(a,b)
 p.write_text(s)
