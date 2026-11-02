"""Verifica il sito generato senza dipendenze: python tools/check_seo.py.

Controlla metadati, canonical, collegamenti locali, dati strutturati, sitemap,
immagini social e pagina 404. Non misura posizionamento o indicizzazione Google.
"""
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import unquote, urljoin, urlsplit
import json
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / 'site'
DOMAIN = 'https://ricavia.com'
errors = []


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.nodes = []
        self.schemas = []
        self.json_text = None
        self.title = None
        self.titles = []
        self.h1_count = 0
        self.template_depth = 0

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        self.nodes.append((tag, a))
        if tag == 'template':
            self.template_depth += 1
        if tag == 'title':
            self.title = []
        if tag == 'h1' and not self.template_depth:
            self.h1_count += 1
        if tag == 'script' and a.get('type') == 'application/ld+json':
            self.json_text = []

    def handle_startendtag(self, tag, attrs):
        self.nodes.append((tag, dict(attrs)))

    def handle_data(self, data):
        if self.title is not None:
            self.title.append(data)
        if self.json_text is not None:
            self.json_text.append(data)

    def handle_endtag(self, tag):
        if tag == 'title' and self.title is not None:
            self.titles.append(''.join(self.title).strip())
            self.title = None
        if tag == 'template':
            self.template_depth -= 1
        if tag == 'script' and self.json_text is not None:
            self.schemas.append(json.loads(''.join(self.json_text)))
            self.json_text = None


def fail(path, message):
    errors.append('%s: %s' % (path, message))


def read_page(path):
    p = Page()
    try:
        p.feed(path.read_text(encoding='utf-8'))
    except (ValueError, UnicodeError) as e:
        fail(path.relative_to(SITE), str(e))
    return p


def local_file(url):
    path = unquote(urlsplit(url).path).lstrip('/')
    f = SITE / path
    if not f.suffix:
        f = f / 'index.html'
    return f


if not (SITE / 'sitemap.xml').is_file():
    sys.exit('Eseguire prima python tools/build.py')

sitemap = ET.parse(SITE / 'sitemap.xml')
urls = [n.text for n in sitemap.findall('.//{*}loc')]
if len(urls) != len(set(urls)):
    fail('sitemap.xml', 'URL duplicati')
parsed = {}
for url in urls:
    f = local_file(url)
    if not f.is_file():
        fail(url, 'file HTML assente')
        continue
    parsed[url] = read_page(f)

titles = Counter()
for url, p in parsed.items():
    path = urlsplit(url).path
    if len(p.titles) != 1 or not p.titles[0]:
        fail(path, 'serve un solo title non vuoto')
    else:
        titles[p.titles[0]] += 1
    if p.h1_count != 1:
        fail(path, 'serve un H1; trovati %s' % p.h1_count)
    metas = [a for t, a in p.nodes if t == 'meta' and a.get('name') == 'description']
    if len(metas) != 1 or not metas[0].get('content'):
        fail(path, 'descrizione assente o duplicata')
    elif metas[0]['content'].endswith('…'):
        fail(path, 'descrizione troncata automaticamente')
    canon = [a.get('href') for t, a in p.nodes if t == 'link' and a.get('rel') == 'canonical']
    if canon != [url]:
        fail(path, 'canonical diverso dall’URL della sitemap: %r' % canon)
    robots = [a.get('content', '') for t, a in p.nodes if t == 'meta' and a.get('name') == 'robots']
    if len(robots) != 1 or any('noindex' in x for x in robots):
        fail(path, 'direttiva robots assente, duplicata o noindex su una pagina in sitemap')
    graph = [g for schema in p.schemas for g in schema.get('@graph', [schema])]
    if not any(g.get('@id') == url + '#webpage' for g in graph):
        fail(path, 'WebPage senza identificatore canonico')
    articles = [g for g in graph if g.get('@type') == 'Article']
    for article in articles:
        if not article.get('datePublished') or not article.get('author'):
            fail(path, 'articolo senza data o autore')
        image = article.get('image')
        if not image or not local_file(image).is_file():
            fail(path, 'immagine Article assente')
    og = [a.get('content') for t, a in p.nodes if t == 'meta' and a.get('property') == 'og:image']
    if len(og) != 1 or not local_file(og[0]).is_file():
        fail(path, 'immagine Open Graph assente o duplicata')
    for tag, a in p.nodes:
        for attr in (['href'] if tag in ('a', 'link') else ['src'] if tag in ('script', 'img') else []):
            value = a.get(attr, '')
            if not value or value.startswith(('mailto:', 'tel:', 'data:', 'javascript:')):
                continue
            absolute = urljoin(url, value)
            if urlsplit(absolute).netloc != 'ricavia.com':
                continue
            target = local_file(absolute)
            if not target.is_file():
                fail(path, 'risorsa locale assente: %s' % value)
                continue
            fragment = urlsplit(absolute).fragment
            if tag == 'a' and fragment:
                target_url = absolute.split('#')[0].split('?')[0]
                target_page = parsed.get(target_url)
                if target_page and fragment not in {x.get('id') for _, x in target_page.nodes}:
                    fail(path, 'ancora assente: %s' % value)

for title, count in titles.items():
    if count > 1:
        fail('titoli', 'duplicato %r' % title)

config = json.loads((ROOT / 'tools/seo.json').read_text(encoding='utf-8'))
for aid, article in config['articles'].items():
    url = DOMAIN + '/osservatorio/' + article['slug'] + '/'
    if url not in parsed:
        fail(aid, 'URL stabile dell’articolo assente dalla sitemap')
    else:
        raw = local_file(url).read_text(encoding='utf-8')
        if 'data-related-services' not in raw:
            fail(aid, 'collegamenti contestuali ai servizi assenti')

not_found = read_page(SITE / '404.html')
if not not_found.titles or not not_found.titles[0].startswith('Pagina non trovata'):
    fail('404.html', 'titolo dedicato assente: %r' % not_found.titles)
nf_robots = [a.get('content') for t, a in not_found.nodes if t == 'meta' and a.get('name') == 'robots']
if nf_robots != ['noindex']:
    fail('404.html', 'serve una sola direttiva noindex')
if any(t == 'link' and a.get('rel') == 'canonical' for t, a in not_found.nodes):
    fail('404.html', 'canonical verso una pagina valida')
if not any(t == 'script' and a.get('src', '').startswith('/assets/js/') for t, a in not_found.nodes):
    fail('404.html', 'script di navigazione assenti')
for tag, a in not_found.nodes:
    if tag == 'script' and a.get('src', '').startswith('/assets/') and not local_file(a['src']).is_file():
        fail('404.html', 'script locale assente: %s' % a['src'])

if errors:
    print('\n'.join(errors))
    sys.exit(1)
print('SEO OK: %s pagine, canonical e titoli unici, link e immagini locali validi, JSON-LD e 404 verificati' % len(parsed))
