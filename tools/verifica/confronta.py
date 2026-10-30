"""Confronta le foto dopo una modifica con le foto di riferimento.
Uso: python3 tools/verifica/confronta.py dopo rif1 [rif2 ...] [--diff cartella]
Le foto di riferimento sono fatte due volte sulla stessa versione: una foto "dopo" va bene se coincide
con almeno una delle due (così le piccole variazioni di tempo tra un giro e l'altro non danno falsi allarmi)."""
import sys,os
from PIL import Image,ImageChops
args=sys.argv[1:];D=None
if '--diff' in args: i=args.index('--diff');D=args[i+1];args=args[:i]+args[i+2:]
B,REFS=args[0],args[1:]
if D: os.makedirs(D,exist_ok=True)
def px(a,b):
    if a.size!=b.size: return None,None
    d=ImageChops.difference(a,b).convert('L').point(lambda v:255 if v>24 else 0)
    bb=d.getbbox()
    return (0,None) if not bb else (sum(d.histogram()[255:]),(d,bb))
bad=0;tot=0
for f in sorted(os.listdir(REFS[0])):
    if not f.endswith('.png'):continue
    tot+=1;pb=os.path.join(B,f)
    if not os.path.exists(pb): print('MANCA',f);bad+=1;continue
    b=Image.open(pb).convert('RGB');best=None
    for R in REFS:
        a=Image.open(os.path.join(R,f)).convert('RGB');n,info=px(a,b)
        if n is None: best=best or ('DIMENSIONE %s -> %s'%(a.size,b.size),None);continue
        if n<=40: best=('ok',None);break
        if best is None or best[0]!='ok': best=('%d px'%n,info)
    if best[0]!='ok':
        bad+=1;print('DIVERSA %-50s %s'%(f,best[0]))
        if D and best[1]:
            d,bb=best[1];o=b.copy();o.paste((255,0,0),mask=d);o.crop((0,max(0,bb[1]-200),b.size[0],min(b.size[1],bb[3]+200))).save(os.path.join(D,f))
print('foto %d, diverse %d'%(tot,bad))
