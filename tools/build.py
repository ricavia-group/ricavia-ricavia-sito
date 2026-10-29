"""Costruisce il sito multipagina in ./site partendo da index.html (sorgente unico).

Ogni pagina interna diventa un indirizzo vero (es. /consulenza/), con titolo,
descrizione e anteprima social propri. Nessuna dipendenza: solo Python 3.
Uso: python3 tools/build.py
"""
import html, json, os, re, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'site')
DOMAIN = 'https://ricavia.com'

# id nel sorgente, indirizzo, titolo della scheda
PAGES = [
    ('home', '', 'Ricavia · Revenue management e consulenza per hotel e strutture ricettive'),
    ('revenue-management', 'revenue-management', 'Revenue management per hotel e strutture ricettive · Ricavia'),
    ('consulenza', 'consulenza', 'Consulenza per hotel e strutture ricettive · Ricavia'),
    ('apertura', 'nuova-apertura', 'Nuova apertura di un hotel o di una struttura ricettiva · Ricavia'),
    ('pg-metodo', 'metodo', 'Il metodo Ricavia: dal dato all\'utile · Ricavia'),
    ('pg-chi-siamo', 'chi-siamo', 'Chi siamo · Ricavia'),
    ('pg-partner', 'partner', 'Partner tecnologici · Ricavia'),
    ('contatti', 'contatti', 'Contatti · Ricavia'),
    ('pg-osservatorio', 'osservatorio', 'Osservatorio Roma: classifiche e dati del mercato alberghiero · Ricavia'),
    ('pg-pagella', 'hotel-score', 'Hotel Score gratuito della tua struttura ricettiva · Ricavia'),
    ('pg-indicatori', 'indicatori', 'ADR, RevPAR, GOP e GOPPAR spiegati · Ricavia'),
    ('pg-privacy', 'privacy', 'Informativa privacy · Ricavia'),
    ('pg-cookie', 'cookie', 'Cookie policy · Ricavia'),
]
URL = {pid: '/' + (slug + '/' if slug else '') for pid, slug, _ in PAGES}
URL['chi-siamo'] = URL['pg-chi-siamo']  # vecchio link
OPEN_CLASS = {'contatti': 'ct-open', 'apertura': 'ap-open', 'revenue-management': 'rm-open', 'consulenza': 'cs-open'}


def read(p):
    return open(os.path.join(ROOT, p), encoding='utf-8').read()


def element(src, start):
    """Restituisce l'elemento <div ...> completo che inizia in `start` (div bilanciati)."""
    depth, i = 0, start
    tag = re.compile(r'<(/?)div\b[^>]*>', re.I)
    for m in tag.finditer(src, start):
        depth += -1 if m.group(1) else 1
        if depth == 0:
            return src[start:m.end()]
    raise ValueError('div non chiuso')


def text(x):
    x = re.sub(r'<br\s*/?>', ' ', x)
    x = re.sub(r'<[^>]+>', '', x)
    return re.sub(r'\s+', ' ', html.unescape(x)).strip()


src = read('index.html')
head = src[src.find('<head>') + 6:src.find('</head>')]
head = re.sub(r'\s*<title>.*?</title>', '', head, flags=re.S)
head = re.sub(r'\s*<meta name="description"[^>]*>', '', head)
body = src[src.find('<body>') + 6:src.rfind('</body>')]

first_pg = body.find('<div class="app pgv"')
chrome = body[:first_pg]  # header, menu, toast, libreria foto
lib = re.search(r'<div[^>]*id="photoLib"[^>]*>(.*?)</div>', chrome, re.S)
PHOTO = dict(re.findall(r'<img data-k="([^"]+)" alt="" src="([^"]+)"', lib.group(1)))
chrome = chrome.replace(lib.group(0), '')

main_js = read('assets/js/01-main.js')
cat = re.search(r'CAT=(\{.*?\});', main_js, re.S)
CAT = json.loads(cat.group(1)) if cat else {}

scripts_at = body.find('<script src="https://cdn.jsdelivr.net/npm/lenis')
scripts = body[scripts_at:]
home = body[body.find('<main id="top"'):scripts_at]

pages = {'home': home}
for pid, _, _ in PAGES[1:]:
    at = body.find('id="%s"' % pid)
    at = body.rfind('<div', 0, at)
    pages[pid] = element(body, at)


def resolve_photos(h):
    def fix(m):
        tag, attr, k = m.group(0), m.group(1), m.group(2)
        if k not in PHOTO:
            return tag
        if ' src=' not in tag:
            tag = tag.replace('<img ', '<img src="%s" ' % PHOTO[k], 1)
        if CAT.get(k) and 'hero-bg' not in tag:
            tag = re.sub(r' alt="[^"]*"', '', tag).replace('<img ', '<img alt="%s" ' % html.escape(CAT[k], quote=True), 1)
        return tag
    return re.sub(r'<img\b[^>]*\bdata-(photo|ph)="([^"]+)"[^>]*>', fix, h)


def lazy(h):
    def fix(m):
        t = m.group(0)
        if 'loading=' in t:
            return t
        return t.replace('<img ', '<img loading="lazy" decoding="async" ', 1)
    return re.sub(r'<img\b[^>]*>', fix, h)


def links(h, pid):
    ids = set(re.findall(r'\bid="([^"]+)"', pages[pid]))
    home_ids = set(re.findall(r'\bid="([^"]+)"', home))

    def fix(m):
        x = m.group(1)
        if x in URL:
            return 'href="%s"' % URL[x]
        if x == 'top':
            return 'href="#top"' if pid == 'home' else 'href="/"'
        if x in ids or not x:
            return m.group(0)
        if x in home_ids:
            return 'href="/#%s"' % x
        return m.group(0)
    return re.sub(r'href="#([^"]*)"', fix, h)


def fix_assets(h):
    h = re.sub(r'(src|href)="assets/', r'\1="/assets/', h)
    return re.sub(r'url\((["\']?|&quot;)assets/', r'url(\1/assets/', h)


def describe(pid):
    seg = pages[pid]
    p = re.search(r'<p class="(?:ap-lead|ctp-sub|lead|z-lead)[^"]*"[^>]*>(.*?)</p>', seg, re.S)
    if pid == 'home':
        return "Revenue management e consulenza per hotel e strutture ricettive indipendenti. Tariffe, distribuzione e performance: una strategia costruita attorno alla tua struttura ricettiva. Roma."
    d = text(p.group(1)) if p else ''
    return d if len(d) <= 160 else d[:157].rsplit(' ', 1)[0] + '…'


def og_image(pid):
    seg = pages[pid]
    m = re.search(r'<img[^>]*class="hero-bg"[^>]*data-photo="([^"]+)"', seg) or re.search(r'data-photo="([^"]+)"', seg)
    return DOMAIN + '/assets/img/og.jpg'


PRE = '''<script>window.__MP=true;window.__DBG=/[?&]debug/.test(location.search);(function(){var h=location.hash.slice(1),U=%s;if(U[h]&&location.pathname==='/')location.replace(U[h]);})();</script>''' % json.dumps({k: v for k, v in URL.items() if v != '/'})
SHIM = '''<script>
(function(){
  /* pagina interna: "Torna alla home" e ancore nella pagina */
  document.addEventListener('click',function(e){
    var c=e.target.closest('[data-ct-close]');if(c){e.preventDefault();e.stopImmediatePropagation();location.href='/';return}
    var a=e.target.closest('a[href^="#"]');if(!a)return;var h=a.getAttribute('href').slice(1),t=h&&document.getElementById(h);
    if(t){e.preventDefault();e.stopImmediatePropagation();var y=t.getBoundingClientRect().top+scrollY-80;if(window.__lenis)window.__lenis.scrollTo(y);else scrollTo({top:y,behavior:'smooth'})}
  },true);
})();
</script>'''
START = '''<script>(function(){function go(){setTimeout(function(){var pg=document.querySelector('.pgv.on');if(pg)pg.dispatchEvent(new CustomEvent('pgopen'))},0)}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',go);else go();})();</script>'''


def page(pid, slug, title):
    is_home = pid == 'home'
    content = pages[pid]
    cls = 'mp'
    if not is_home:
        cls += ' mp-in'
        content = content.replace(' aria-hidden="true"', ' aria-hidden="false"', 1)
        content = re.sub(r'class="(app pgv|ctp pgv)"', lambda m: 'class="%s on"' % m.group(1), content, count=1)
        content = content.replace(' data-lenis-prevent', '', 1)
    parts = chrome + content + scripts
    parts = resolve_photos(parts)
    parts = lazy(parts)
    parts = links(parts, pid)
    parts = fix_assets(parts)
    if not is_home:
        parts = parts.replace(scripts.split('\n')[0], SHIM + '\n' + scripts.split('\n')[0], 1)
        parts += START
    url = DOMAIN + URL[pid]
    desc = describe(pid)
    meta = '''<title>{t}</title>
<meta name="description" content="{d}">
<link rel="canonical" href="{u}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Ricavia">
<meta property="og:locale" content="it_IT">
<meta property="og:title" content="{t}">
<meta property="og:description" content="{d}">
<meta property="og:url" content="{u}">
<meta property="og:image" content="{i}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">'''.format(t=html.escape(title), d=html.escape(desc, quote=True), u=url, i=og_image(pid))
    h = fix_assets(head)
    doc = '<!doctype html>\n<html lang="it" class="%s">\n<head>\n%s\n%s\n%s\n<link rel="stylesheet" href="/assets/css/mp.css">\n</head>\n<body>\n%s\n</body>\n</html>\n' % (cls, h.strip(), meta, PRE if is_home else '<script>window.__MP=true;window.__DBG=/[?&]debug/.test(location.search)</script>', parts)
    d = os.path.join(OUT, slug)
    os.makedirs(d, exist_ok=True)
    open(os.path.join(d, 'index.html'), 'w', encoding='utf-8').write(doc)
    return url


if os.path.exists(OUT):
    shutil.rmtree(OUT)
os.makedirs(OUT)
shutil.copytree(os.path.join(ROOT, 'assets'), os.path.join(OUT, 'assets'))
# link alle pagine dentro gli script (risposte della chat in Home)
for f in os.listdir(os.path.join(OUT, 'assets', 'js')):
    p = os.path.join(OUT, 'assets', 'js', f)
    s = open(p, encoding='utf-8').read()
    s = re.sub(r'href=\\"#([a-z-]+)', lambda m: 'href=\\"%s' % URL[m.group(1)] if m.group(1) in URL else m.group(0), s)
    s = s.replace('src="assets/', 'src="/assets/').replace("'assets/img/", "'/assets/img/")
    s = re.sub(r'url\((["\']?)assets/', r'url(\1/assets/', s)
    open(p, 'w', encoding='utf-8').write(s)
urls = [page(*p) for p in PAGES]
open(os.path.join(OUT, 'sitemap.xml'), 'w').write(
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    ''.join('  <url><loc>%s</loc></url>\n' % u for u in urls) + '</urlset>\n')
open(os.path.join(OUT, 'robots.txt'), 'w').write('User-agent: *\nAllow: /\nSitemap: %s/sitemap.xml\n' % DOMAIN)
shutil.copy(os.path.join(ROOT, 'tools', 'headers'), os.path.join(OUT, '_headers'))
# pagina 404: intestazione e piè di pagina della Home, messaggio semplice
home_doc = open(os.path.join(OUT, 'index.html'), encoding='utf-8').read()
ft = re.search(r'<footer class="ft z-ft".*?</footer>', home_doc, re.S)
nf = home_doc.split('<main id="top"')[0] + """<main style="min-height:70vh;display:grid;place-items:center;text-align:center;padding:160px 24px 80px">
<div><p class="z-eyebrow-b">Errore 404</p><h1 style="font:600 clamp(40px,6vw,84px)/1 var(--zf);letter-spacing:-.05em;margin:18px 0 0">Pagina <em class="z-g">non trovata</em></h1>
<p style="color:var(--zmu);font-size:19px;margin:24px auto 0;max-width:30em">L'indirizzo che hai aperto non esiste o è stato spostato.</p>
<a class="z-btn" href="/" style="margin-top:36px">Torna alla home <span class="arr">→</span></a></div></main>
""" + (ft.group(0) if ft else '') + home_doc[home_doc.find('<script src="https://cdn.jsdelivr.net/npm/lenis'):]
nf = nf.replace('<link rel="canonical" href="https://ricavia.com/">', '<meta name="robots" content="noindex">')
open(os.path.join(OUT, '404.html'), 'w', encoding='utf-8').write(nf)
# alleggerimento: CSS senza regole inutilizzate e compresso, HTML senza spazi superflui
import sys
if os.environ.get('RICAVIA_NO_MIN'):
    print('pagine', len(urls), '->', OUT, '(senza alleggerimento)'); sys.exit(0)
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import minify
htmls = []
for d, _, fs in os.walk(OUT):
    for f in fs:
        if f.endswith('.html'):
            htmls.append(os.path.join(d, f))
corpus = ''.join(open(x, encoding='utf-8').read() for x in htmls)
corpus += ''.join(open(os.path.join(OUT, 'assets', 'js', f), encoding='utf-8').read() for f in os.listdir(os.path.join(OUT, 'assets', 'js')))
css_p = os.path.join(OUT, 'assets', 'css', 'site.css')
css0 = open(css_p, encoding='utf-8').read() + '\n' + open(os.path.join(OUT, 'assets', 'css', 'mp.css'), encoding='utf-8').read()
css = minify.minify_css(minify.purge_css(css0, corpus))
open(css_p, 'w', encoding='utf-8').write(css)
os.remove(os.path.join(OUT, 'assets', 'css', 'mp.css'))
for x in htmls:
    h = open(x, encoding='utf-8').read().replace('<link rel="stylesheet" href="/assets/css/mp.css">\n', '')
    open(x, 'w', encoding='utf-8').write(minify.minify_html(h))
print('CSS', len(css0) // 1024, 'KB ->', len(css) // 1024, 'KB')
print('pagine', len(urls), '->', OUT)
