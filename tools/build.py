"""Costruisce il sito multipagina in ./site partendo da index.html (sorgente unico).

Ogni pagina interna diventa un indirizzo vero (es. /consulenza/), con titolo,
descrizione e anteprima social propri. Nessuna dipendenza: solo Python 3.
Uso: python3 tools/build.py
"""
import subprocess
import html, json, os, re, shutil, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'site')
sys.path.insert(0, os.path.join(ROOT, 'tools'))
import journal
DOMAIN = 'https://ricavia.com'
JOURNAL = os.environ.get('RICAVIA_JOURNAL', os.path.join(ROOT, 'journal'))
with open(os.path.join(ROOT, 'tools', 'seo.json'), encoding='utf-8') as f:
    SEO = json.load(f)

# id nel sorgente, indirizzo, titolo della scheda
PAGES = [
    ('home', '', 'Revenue management e consulenza per hotel a Roma · Ricavia'),
    ('revenue-management', 'revenue-management', 'Revenue management per hotel a Roma · Ricavia'),
    ('consulenza', 'consulenza', 'Consulenza per hotel: margine, GOP e GOPPAR · Ricavia'),
    ('apertura', 'nuova-apertura', 'Nuova apertura di un hotel o di una struttura ricettiva · Ricavia'),
    ('pg-metodo', 'metodo', 'Il metodo Ricavia: dal dato all\'utile · Ricavia'),
    ('pg-chi-siamo', 'chi-siamo', 'Chi siamo: i fondatori di Ricavia, Roma · Ricavia'),
    ('pg-partner', 'partner', 'Partner tecnologici per hotel: PMS, channel manager · Ricavia'),
    ('contatti', 'contatti', 'Contatti: prenota una call conoscitiva · Ricavia'),
    ('pg-osservatorio', 'osservatorio', 'Osservatorio Roma: dati del mercato alberghiero · Ricavia'),
    ('pg-pagella', 'hotel-score', 'Hotel Score gratuito per la tua struttura ricettiva · Ricavia'),
    ('pg-indicatori', 'indicatori', 'ADR, RevPAR, GOP e GOPPAR spiegati · Ricavia'),
    ('pg-privacy', 'privacy', 'Informativa privacy · Ricavia'),
    ('pg-cookie', 'cookie', 'Cookie policy · Ricavia'),
    ('pg-termini', 'termini', 'Termini di servizio · Ricavia'),
]
PAGES = [(pid, slug, SEO['pages'].get(pid, {}).get('title', title)) for pid, slug, title in PAGES]
if set(SEO['pages']) != {pid for pid, _, _ in PAGES}:
    raise ValueError('Le pagine in tools/seo.json devono corrispondere a PAGES')
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
PHOTO = dict(re.findall(r'<img data-k="([^"]+)" alt="" (?:data-)?src="([^"]+)"', lib.group(1)))
chrome = chrome.replace(lib.group(0), '')

main_js = read('assets/js/01-main.js')
cat = re.search(r'CAT=(\{.*?\});', main_js, re.S)
CAT = json.loads(cat.group(1)) if cat else {}

scripts_at = body.find('<script src="assets/js/00-lenis')
scripts = body[scripts_at:]
home = body[body.find('<main id="top"'):scripts_at]

pages = {'home': home}
for pid, _, _ in PAGES[1:]:
    at = body.find('id="%s"' % pid)
    at = body.rfind('<div', 0, at)
    pages[pid] = element(body, at)


ARTS = re.findall(r'<template id="jr-t-(a\d+)">(.*?)</template>', pages['pg-osservatorio'], re.S)
# Gli indirizzi pubblicati non devono cambiare quando viene ritoccato un titolo.
ART_URL = {}
for aid, _ in ARTS:
    slug = SEO['articles'].get(aid, {}).get('slug', '')
    if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', slug):
        raise ValueError('Aggiungere uno slug stabile per %s in tools/seo.json' % aid)
    ART_URL[aid] = '/osservatorio/%s/' % slug
if len(set(ART_URL.values())) != len(ART_URL):
    raise ValueError('Gli slug degli articoli devono essere univoci')

# Articoli nuovi: una cartella journal/AAAA-MM-GG-<slug>/ ciascuno, chiave 'j-<slug>'
NUOVI = journal.carica(JOURNAL, {u.split('/')[2] for u in ART_URL.values()},
                       {text(re.search(r'<h2>(.*?)</h2>', x, re.S).group(1)) for _, x in ARTS})
RITIRATI = journal.ritirati(JOURNAL)
for _s in RITIRATI:
    if _s in {u.split('/')[2] for u in ART_URL.values()}:
        raise journal.ArticoloError('ritirati.json: "%s" è uno slug storico' % _s)
for _a in NUOVI:
    _k = 'j-' + _a['slug']
    SEO['articles'][_k] = journal.voce_seo(_a)
    ART_URL[_k] = '/osservatorio/%s/' % _a['slug']
    ARTS.append((_k, journal.template(_a)))
NUOVI_PER_CHIAVE = {'j-' + _a['slug']: _a for _a in NUOVI}
MESI_IT = journal.MESI
MESI_NUOVI = sorted({a['data'][:7] for a in NUOVI}, reverse=True)


def resolve_photos(h):
    def fix(m):
        tag, attr, k = m.group(0), m.group(1), m.group(2)
        if k not in PHOTO:
            return tag
        if ' src=' not in tag:
            tag = tag.replace('<img ', '<img src="%s" ' % PHOTO[k], 1)
        else:
            tag = re.sub(r' src="[^"]*470f22af41\.gif"', ' src="%s"' % PHOTO[k], tag)
        if CAT.get(k) and 'hero-bg' not in tag:
            tag = re.sub(r' alt="[^"]*"', '', tag).replace('<img ', '<img alt="%s" ' % html.escape(CAT[k], quote=True), 1)
        return tag
    return re.sub(r'<img\b[^>]*\bdata-(photo|ph)="([^"]+)"[^>]*>', fix, h)


def lazy(h):
    def fix(m):
        t = m.group(0)
        if 'loading=' in t:
            return t
        if 'hero-bg' in t or ('class="on"' in t and 'data-photo' in t):
            t = t.replace(' fetchpriority="high"', '')
            return t.replace('<img ', '<img fetchpriority="high" decoding="async" ', 1)
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
    desc = SEO['pages'][pid].get('description', '').strip()
    if not desc:
        raise ValueError('Aggiungere la descrizione di %s in tools/seo.json' % pid)
    return desc


def og_image(pid):
    seg = pages[pid]
    m = re.search(r'<img[^>]*class="hero-bg"[^>]*data-photo="([^"]+)"', seg) or re.search(r'data-photo="([^"]+)"', seg)
    return DOMAIN + '/assets/img/og-simbolo.jpg'


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


ORG = {
    "@type": ["Organization", "ProfessionalService"], "@id": DOMAIN + "/#org",
    "name": "Ricavia", "legalName": "Ricavia Group S.r.l.", "url": DOMAIN + "/",
    "logo": DOMAIN + "/assets/img/c3ed5d4eee.svg", "image": DOMAIN + "/assets/img/og-simbolo.jpg",
    "email": "info@ricavia.com", "vatID": "IT17726801008",
    "description": "Revenue management e consulenza per hotel e strutture ricettive indipendenti",
    # Sede legale già pubblicata nell'informativa privacy: nessun orario o recapito inventato.
    "address": {"@type": "PostalAddress", "streetAddress": "Via Francesco Gentile 135",
                "postalCode": "00173", "addressLocality": "Roma", "addressRegion": "RM", "addressCountry": "IT"},
    "areaServed": {"@type": "Country", "name": "Italia"},
    "knowsAbout": ["Revenue management alberghiero", "GOP", "GOPPAR", "USALI", "Distribuzione alberghiera"],
}

SERVICES = {
    'revenue-management': ('Revenue management per hotel', 'Revenue management alberghiero'),
    'consulenza': ('Consulenza alberghiera', 'Analisi di costi, distribuzione e margine operativo'),
    'apertura': ('Consulenza per nuove aperture', 'Studio di fattibilità e business plan per strutture ricettive'),
}


def web_page(pid, title, url, desc):
    kind = {'contatti': 'ContactPage', 'pg-chi-siamo': 'AboutPage', 'pg-osservatorio': 'CollectionPage'}.get(pid, 'WebPage')
    data = {'@type': kind, '@id': url + '#webpage', 'url': url, 'name': title,
            'description': desc, 'inLanguage': 'it-IT', 'isPartOf': {'@id': DOMAIN + '/#web'},
            'about': {'@id': DOMAIN + '/#org'}}
    if pid in SERVICES:
        data['mainEntity'] = {'@id': url + '#service'}
    return data


def jsonld(pid, title, url, content, crumbs=None):
    g = [web_page(pid, title, url, describe(pid))]
    if pid == 'home':
        g.append(ORG)
        g.append({"@type": "WebSite", "@id": DOMAIN + "/#web", "url": DOMAIN + "/", "name": "Ricavia", "inLanguage": "it-IT", "publisher": {"@id": DOMAIN + "/#org"}})
    else:
        items = [("Home", DOMAIN + "/")] + (crumbs or []) + [(title.split(' · ')[0], url)]
        g.append({"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": i + 1, "name": n, "item": u} for i, (n, u) in enumerate(items)]})
    if pid in SERVICES:
        name, service_type = SERVICES[pid]
        g.append({'@type': 'Service', '@id': url + '#service', 'name': name,
                  'serviceType': service_type, 'url': url, 'description': describe(pid),
                  'provider': {'@id': DOMAIN + '/#org'},
                  'areaServed': [{'@type': 'City', 'name': 'Roma'}, {'@type': 'AdministrativeArea', 'name': 'Lazio'}]})
    qa = []
    for m in re.finditer(r'<details\b[^>]*>\s*<summary>(.*?)</summary>(.*?)</details>', content, re.S):
        q, a = text(m.group(1)), text(m.group(2))
        if q and a:
            qa.append({"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}})
    if qa:
        g.append({"@type": "FAQPage", "mainEntity": qa})
    data = {"@context": "https://schema.org", "@graph": g}
    return '<script type="application/ld+json">%s</script>' % json.dumps(data, ensure_ascii=False).replace('</', '<\\/')


# blocco «Dall'Osservatorio»: tre articoli pertinenti prima delle domande frequenti
OS_BLOCKS = {k: v for k, v in SEO.get('osservatorio_blocks', {}).items() if not k.startswith('_')}
OS_CARDS = {}
for m in re.finditer(r'<article class="jr-(?:cd|ft) ar"[^>]*><button type="button" class="jr-hit" data-art="(a\d+)".*?</article>', pages['pg-osservatorio'], re.S):
    card = re.sub(r'^<article class="jr-ft ', '<article class="jr-cd ', m.group(0))
    card = re.sub(r'<button type="button" class="jr-hit" data-art="(a\d+)"([^>]*)></button>',
                  lambda x: '<a class="jr-hit" data-art="%s" href="%s"%s></a>' % (x.group(1), ART_URL[x.group(1)], x.group(2)), card)
    OS_CARDS[m.group(1)] = card.replace('Leggi l’articolo →', 'Leggi →')


def os_block(pid, content):
    cards = ''.join(OS_CARDS[a] for a in OS_BLOCKS[pid])
    sec = ('<section class="ap-sec ap-light ix rs-w rs os-rel"><div class="wrap"><div class="rs-th">'
           '<span class="ap-tag ar">Dall\'Osservatorio</span><h2 class="ar">Dati e analisi sul mercato di Roma</h2></div>'
           '<div class="os-rel-g">%s</div><p class="os-rel-all"><a class="z-btn" href="/osservatorio/">Tutti gli articoli <span class="arr">→</span></a></p></div></section>') % cards
    if pid == 'home':
        # in Home le animazioni di comparsa usano un altro sistema: il blocco resta visibile
        sec = re.sub(r'class="([^"]*?) ?\bar\b', lambda m: 'class="%s' % m.group(1), sec).replace(' class=""', '')
    i = content.find('class="ix-faq"')
    at = content.rfind('<section', 0, i) if i >= 0 else -1
    if at < 0:
        at = content.find('<footer class="ft')
    if at < 0:
        raise ValueError('Posizione del blocco Osservatorio non trovata in %s' % pid)
    return content[:at] + sec + content[at:]


def page(pid, slug, title):
    is_home = pid == 'home'
    content = pages[pid]
    cls = 'mp'
    if not is_home:
        cls += ' mp-in'
        content = content.replace(' aria-hidden="true"', ' aria-hidden="false"', 1)
        content = re.sub(r'class="(app pgv|ctp pgv)"', lambda m: 'class="%s on"' % m.group(1), content, count=1)
        content = content.replace(' data-lenis-prevent', '', 1)
    if pid == 'pg-osservatorio':
        content = re.sub(r'<button type="button" class="jr-hit" data-art="(a\d+)"([^>]*)></button>',
                         lambda m: '<a class="jr-hit" data-art="%s" href="%s"%s></a>' % (m.group(1), ART_URL.get(m.group(1), '#'), m.group(2)), content)
    if pid == 'pg-osservatorio' and NUOVI:
        lista = '<div class="jr-list">' + journal.scheda(NUOVI[0], True) + (
            '<div class="jr-grid">' + ''.join(journal.scheda(a) for a in NUOVI[1:12]) + '</div>' if NUOVI[1:] else '') + '</div>\n    '
        content = content.replace('<div class="jr-list"><article class="jr-ft ar" data-cat="zone">', lista + '<div class="jr-list"><article class="jr-ft ar" data-cat="zone">', 1)
        arch = '<nav class="jr-arch" aria-label="Archivio del Journal"><span>Archivio</span>' + ''.join(
            '<a href="/osservatorio/archivio/%s/">%s %s</a>' % (m, MESI_IT[int(m[5:]) - 1].capitalize(), m[:4]) for m in MESI_NUOVI) + '</nav>\n    '
        content = content.replace('<div class="jz ar" id="os-zone">', arch + '<div class="jz ar" id="os-zone">', 1)
    if pid in OS_BLOCKS:
        content = os_block(pid, content)
    parts = chrome + content + scripts
    parts = resolve_photos(parts)
    parts = lazy(parts)
    parts = links(parts, pid)
    parts = fix_assets(parts)
    if not is_home:
        first = fix_assets(scripts.split('\n')[0])
        assert first in parts, 'SHIM: primo script non trovato'
        parts = parts.replace(first, SHIM + '\n' + first, 1)
        parts += START
    url = DOMAIN + URL[pid]
    desc = describe(pid)
    meta = '''<title>{t}</title>
<meta name="description" content="{d}">
<meta name="robots" content="max-image-preview:large">
<link rel="canonical" href="{u}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Ricavia">
<meta property="og:locale" content="it_IT">
<meta property="og:title" content="{t}">
<meta property="og:description" content="{d}">
<meta property="og:url" content="{u}">
<meta property="og:image" content="{i}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
{ld}'''.format(t=html.escape(title), d=html.escape(desc, quote=True), u=url, i=og_image(pid), ld=jsonld(pid, title, url, content))
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


def art_page(aid, art):
    """Una pagina vera per ogni articolo del Journal (prima leggibile solo nella finestra)."""
    title = text(re.search(r'<h2>(.*?)</h2>', art, re.S).group(1))
    sub = re.search(r'<p class="jr-sub">(.*?)</p>', art, re.S)
    desc = text(sub.group(1)) if sub else title
    desc = desc if len(desc) <= 160 else desc[:157].rsplit(' ', 1)[0] + '…'
    desc = SEO['articles'][aid].get('description', desc)
    date = re.search(r'<small>(\d{1,2}) (\w+) (\d{4})', art)
    iso = '%s-%02d-%02d' % (date.group(3), MESI_IT.index(date.group(2)) + 1, int(date.group(1))) if date and date.group(2) in MESI_IT else None
    body_html = art.replace('<h2>', '<h1 class="jr-h1">', 1).replace('</h2>', '</h1>', 1)
    body_html = resolve_photos(body_html)
    # sottotitoli dell'articolo come H2 (stesso aspetto degli H3 di prima)
    body_html = re.sub(r'<h3>(.*?)</h3>', r'<h2 class="jr-sh">\1</h2>', body_html, flags=re.S)
    ART_DATE[ART_URL[aid]] = iso
    url = DOMAIN + ART_URL[aid]
    img = re.search(r'<img[^>]*src="([^"]+)"', body_html)
    related = SEO['articles'][aid].get('related', [])
    if related:
        anchors = ['<a href="%s">%s</a>' % (html.escape(x['url'], quote=True), html.escape(x['label'])) for x in related]
        body_html += '<div class="jr-body"><p data-related-services>%s: %s</p></div>' % (html.escape(SEO['articles'][aid]['related_intro']), ' · '.join(anchors))
    # anteprima per i social: JPG 1200x630 ricavato dalla foto dell'articolo (tools/og_articoli.py)
    og_jpg = '/assets/img/og/%s.jpg' % ART_URL[aid].strip('/').split('/')[-1]
    nuovo = NUOVI_PER_CHIAVE.get(aid)
    if nuovo and os.path.isfile(os.path.join(nuovo['percorso'], 'social.jpg')):
        image_url = url + 'social.jpg'
    elif nuovo and img:
        image_url = DOMAIN + img.group(1)
    elif os.path.exists(os.path.join(ROOT, og_jpg.lstrip('/'))):
        image_url = DOMAIN + og_jpg
    elif img:
        image_url = DOMAIN + img.group(1).replace('assets/', '/assets/', 1).replace('//assets', '/assets')
    else:
        image_url = og_image('pg-osservatorio')
    ldata = {"@context": "https://schema.org", "@graph": [
        {'@type': 'WebPage', '@id': url + '#webpage', 'url': url, 'name': title,
         'description': desc, 'inLanguage': 'it-IT', 'isPartOf': {'@id': DOMAIN + '/#web'},
         'mainEntity': {'@id': url + '#article'}},
        {"@type": "Article", "@id": url + '#article', "url": url, "headline": title, "description": desc, "inLanguage": "it-IT", "mainEntityOfPage": {'@id': url + '#webpage'},
         "author": {"@type": "Organization", "name": SEO['articles'][aid].get('author', 'Redazione Ricavia'), "url": DOMAIN + "/"},
         "publisher": {"@id": DOMAIN + "/#org", "@type": "Organization", "name": "Ricavia", "logo": {"@type": "ImageObject", "url": DOMAIN + "/assets/img/c3ed5d4eee.svg"}},
         **({"datePublished": iso} if iso else {}), "image": image_url},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": DOMAIN + "/"},
            {"@type": "ListItem", "position": 2, "name": "Osservatorio", "item": DOMAIN + "/osservatorio/"},
            {"@type": "ListItem", "position": 3, "name": title, "item": url}]}]}
    ft = re.search(r'<footer class="ft z-ft[^"]*".*?</footer>', pages['pg-osservatorio'], re.S)
    parts = chrome + '<main class="jr-pgm"><a class="jr-back" href="/osservatorio/">← Osservatorio · Il Journal</a><article class="jr-art">' + body_html + '</article>' + \
        '<div class="jr-cta"><p>Vuoi applicare questi dati al tuo hotel?</p><a class="z-btn" href="/contatti/">Prenota una call conoscitiva <span class="arr">→</span></a></div></main>' + \
        (ft.group(0) if ft else '') + scripts
    parts = lazy(links(fix_assets(resolve_photos(parts)), 'pg-osservatorio'))
    # ancore che negli articoli puntano a sezioni dell'Osservatorio
    parts = re.sub(r'href="#(osForm|os-zone|os-top10|os-journal)"', r'href="/osservatorio/#\1"', parts)
    t = SEO['articles'][aid].get('title', '%s · Ricavia' % title)
    meta = '''<title>{t}</title>
<meta name="description" content="{d}">
<meta name="robots" content="max-image-preview:large">
<link rel="canonical" href="{u}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Ricavia">
<meta property="og:locale" content="it_IT">
<meta property="og:title" content="{t}">
<meta property="og:description" content="{d}">
<meta property="og:url" content="{u}">
<meta property="og:image" content="{i}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<script type="application/ld+json">{ld}</script>'''.format(t=html.escape(t), d=html.escape(desc, quote=True), u=url, i=image_url, ld=json.dumps(ldata, ensure_ascii=False).replace('</', '<\\/'))
    doc = '<!doctype html>\n<html lang="it" class="mp mp-in mp-art">\n<head>\n%s\n%s\n<script>window.__MP=true</script>\n<link rel="stylesheet" href="/assets/css/mp.css">\n</head>\n<body>\n%s\n</body>\n</html>\n' % (fix_assets(head).strip(), meta, SHIM + parts)
    d = os.path.join(OUT, ART_URL[aid].strip('/'))
    os.makedirs(d, exist_ok=True)
    open(os.path.join(d, 'index.html'), 'w', encoding='utf-8').write(doc)
    if nuovo:
        for f in ('hero.webp', 'social.jpg'):
            if os.path.isfile(os.path.join(nuovo['percorso'], f)):
                shutil.copy(os.path.join(nuovo['percorso'], f), os.path.join(d, f))
    return url


def archive_page(mese, articoli):
    """Pagina d'archivio di un mese ('AAAA-MM'); restituisce l'URL assoluto."""
    nome = '%s %s' % (MESI_IT[int(mese[5:]) - 1], mese[:4])
    h1 = 'Il Journal di ' + nome
    title = 'Journal di %s · Ricavia' % nome
    desc = ('Gli articoli dell’Osservatorio Ricavia di %s: eventi, trasporti, mercato e prezzi '
            'letti in chiave revenue per chi gestisce un hotel') % nome
    path = '/osservatorio/archivio/%s/' % mese
    url = DOMAIN + path
    ART_DATE[path] = max(a['data'] for a in articoli)
    ldata = {"@context": "https://schema.org", "@graph": [
        {'@type': 'CollectionPage', '@id': url + '#webpage', 'url': url, 'name': h1, 'description': desc,
         'inLanguage': 'it-IT', 'isPartOf': {'@id': DOMAIN + '/#web'}},
        {"@type": "BreadcrumbList", "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "Home", "item": DOMAIN + "/"},
            {"@type": "ListItem", "position": 2, "name": "Osservatorio", "item": DOMAIN + "/osservatorio/"},
            {"@type": "ListItem", "position": 3, "name": h1, "item": url}]}]}
    ft = re.search(r'<footer class="ft z-ft[^"]*".*?</footer>', pages['pg-osservatorio'], re.S)
    parts = chrome + '<main class="jr-pgm">' + \
        '<div class="jr-arp"><a class="jr-back" href="/osservatorio/">← Osservatorio · Il Journal</a><h1 class="jr-h1">%s</h1><div class="jr-grid">%s</div></div></main>' % (
            html.escape(h1), ''.join(journal.scheda(a) for a in articoli)) + (ft.group(0) if ft else '') + scripts
    parts = lazy(links(fix_assets(resolve_photos(parts)), 'pg-osservatorio'))
    meta = '''<title>{t}</title>
<meta name="description" content="{d}">
<meta name="robots" content="max-image-preview:large">
<link rel="canonical" href="{u}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Ricavia">
<meta property="og:locale" content="it_IT">
<meta property="og:title" content="{t}">
<meta property="og:description" content="{d}">
<meta property="og:url" content="{u}">
<meta property="og:image" content="{i}">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/assets/img/favicon.svg" type="image/svg+xml">
<script type="application/ld+json">{ld}</script>'''.format(t=html.escape(title), d=html.escape(desc, quote=True), u=url, i=og_image('pg-osservatorio'), ld=json.dumps(ldata, ensure_ascii=False).replace('</', '<\\/'))
    doc = '<!doctype html>\n<html lang="it" class="mp mp-in mp-art">\n<head>\n%s\n%s\n<script>window.__MP=true</script>\n<link rel="stylesheet" href="/assets/css/mp.css">\n</head>\n<body>\n%s\n</body>\n</html>\n' % (fix_assets(head).strip(), meta, SHIM + parts)
    d = os.path.join(OUT, path.strip('/'))
    os.makedirs(d, exist_ok=True)
    open(os.path.join(d, 'index.html'), 'w', encoding='utf-8').write(doc)
    return url


ART_DATE = {}
urls += [art_page(a, x) for a, x in ARTS]
urls += [archive_page(m, [a for a in NUOVI if a['data'].startswith(m)]) for m in MESI_NUOVI]
# data dell'ultima modifica: per gli articoli la data di pubblicazione, per le pagine l'ultimo salvataggio del sito
try:
    LAST = subprocess.run(['git', 'log', '-1', '--format=%cs'], cwd=ROOT, capture_output=True, text=True).stdout.strip()
except Exception:
    LAST = ''
def lastmod(u):
    d = ART_DATE.get(u.replace(DOMAIN, '')) or LAST
    return '<lastmod>%s</lastmod>' % d if d else ''
open(os.path.join(OUT, 'sitemap.xml'), 'w').write(
    '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    ''.join('  <url><loc>%s</loc>%s</url>\n' % (u, lastmod(u)) for u in urls) + '</urlset>\n')
# indirizzi senza barra finale: reindirizzamento permanente (301) invece del 307 automatico
open(os.path.join(OUT, '_redirects'), 'w').write(''.join('%s %s 301\n' % (u.replace(DOMAIN, '').rstrip('/'), u.replace(DOMAIN, '')) for u in urls if u.replace(DOMAIN, '') != '/') +
    ''.join('/osservatorio/%s/ /osservatorio/ 301\n/osservatorio/%s /osservatorio/ 301\n' % (s, s) for s in RITIRATI))
open(os.path.join(OUT, 'robots.txt'), 'w').write('User-agent: *\nAllow: /\nSitemap: %s/sitemap.xml\n' % DOMAIN)
shutil.copy(os.path.join(ROOT, 'tools', 'headers'), os.path.join(OUT, '_headers'))
# pagina 404: intestazione e piè di pagina della Home, messaggio semplice
home_doc = open(os.path.join(OUT, 'index.html'), encoding='utf-8').read()
ft = re.search(r'<footer class="ft z-ft".*?</footer>', home_doc, re.S)
nf = home_doc.split('<main id="top"')[0] + """<main style="min-height:70vh;display:grid;place-items:center;text-align:center;padding:160px 24px 80px">
<div><p class="z-eyebrow-b">Errore 404</p><h1 style="font:600 clamp(40px,6vw,84px)/1 var(--zf);letter-spacing:-.05em;margin:18px 0 0">Pagina <em class="z-g">non trovata</em></h1>
<p style="color:var(--zmu);font-size:19px;margin:24px auto 0;max-width:30em">L'indirizzo che hai aperto non esiste o è stato spostato.</p>
<a class="z-btn" href="/" style="margin-top:36px">Torna alla home <span class="arr">→</span></a></div></main>
""" + (ft.group(0) if ft else '')
scripts_start = home_doc.find('<script src="/assets/js/00-lenis')
if scripts_start < 0:
    raise ValueError('Script della pagina 404 non trovati')
nf += home_doc[scripts_start:]
nf = nf.replace('<link rel="canonical" href="https://ricavia.com/">', '<meta name="robots" content="noindex">')
nf = nf.replace('<meta name="robots" content="max-image-preview:large">', '')
nf = re.sub(r'<title>.*?</title>', '<title>Pagina non trovata · Ricavia</title>', nf, count=1)
nf = re.sub(r'<script type="application/ld\+json">.*?</script>', '', nf, flags=re.S)
open(os.path.join(OUT, '404.html'), 'w', encoding='utf-8').write(nf)
# alleggerimento: CSS senza regole inutilizzate e compresso, HTML senza spazi superflui
if os.environ.get('RICAVIA_NO_MIN'):
    print('pagine', len(urls), '->', OUT, '(senza alleggerimento)'); sys.exit(0)
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
# versione nei link a CSS e JS: i file in /assets/ hanno cache di un anno, cosi ogni modifica arriva subito ai visitatori
import hashlib
def _ver(m):
    f = os.path.join(OUT, m.group(2).lstrip('/'))
    v = hashlib.md5(open(f, 'rb').read()).hexdigest()[:8] if os.path.exists(f) else ''
    return m.group(1) + m.group(2) + ('?v=' + v if v else '') + '"'
for x in htmls:
    h = open(x, encoding='utf-8').read().replace('<link rel="stylesheet" href="/assets/css/mp.css">\n', '')
    h = re.sub(r'((?:src|href)=")(/assets/(?:js|css)/[^"?]+)"', _ver, h)
    open(x, 'w', encoding='utf-8').write(minify.minify_html(h))
print('CSS', len(css0) // 1024, 'KB ->', len(css) // 1024, 'KB')
print('pagine', len(urls), '->', OUT)
