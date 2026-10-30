"""Confronta due cartelle di foto (prima/dopo). Uso: python3 tools/verifica/confronta.py prima dopo [diff]
Stampa le foto diverse con la percentuale di pixel cambiati e salva le differenze evidenziate in rosso."""
import sys,os
from PIL import Image,ImageChops
A,B=sys.argv[1],sys.argv[2];D=sys.argv[3] if len(sys.argv)>3 else None
if D: os.makedirs(D,exist_ok=True)
diff=0;tot=0
for f in sorted(os.listdir(A)):
    if not f.endswith('.png'):continue
    tot+=1;pb=os.path.join(B,f)
    if not os.path.exists(pb): print('MANCA',f);diff+=1;continue
    a=Image.open(os.path.join(A,f)).convert('RGB');b=Image.open(pb).convert('RGB')
    if a.size!=b.size: print('DIMENSIONE',f,a.size,'->',b.size);diff+=1;continue
    d=ImageChops.difference(a,b).convert('L').point(lambda v:255 if v>24 else 0)
    bb=d.getbbox()
    if bb:
        n=sum(1 for v in d.getdata() if v);pct=100*n/(a.size[0]*a.size[1])
        if n>40:
            diff+=1;print('DIVERSA %-55s %6d px (%.3f%%) zona %s'%(f,n,pct,bb))
            if D:
                o=b.copy();o.paste((255,0,0),mask=d);o.crop((0,max(0,bb[1]-200),a.size[0],min(a.size[1],bb[3]+200))).save(os.path.join(D,f))
print('foto %d, diverse %d'%(tot,diff))
