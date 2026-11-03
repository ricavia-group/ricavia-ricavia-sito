"""Lettura e validazione degli articoli del Journal da cartelle journal/AAAA-MM-GG-<slug>/."""
import datetime
import html
import json
import os
import re
from html.parser import HTMLParser

CATEGORIE = {
    'zone': 'Zone di Roma', 'mercato': 'Mercato', 'prezzi': 'Prezzi', 'regole': 'Regole',
    'dati': 'Dati', 'eventi': 'Eventi', 'trasporti': 'Trasporti', 'macro': 'Macro',
}
AUTORE = 'Tito · Redazione Ricavia'
MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto',
        'settembre', 'ottobre', 'novembre', 'dicembre']
OBBLIGATORI = ['slug', 'data', 'categoria', 'titolo', 'sottotitolo', 'title_seo', 'description',
               'related_intro', 'related', 'alt']
SLUG_RE = re.compile(r'[a-z0-9]+(?:-[a-z0-9]+)*')
DATA_RE = re.compile(r'\d{4}-\d{2}-\d{2}')
# percorso interno: "/..." ma non "//" né "/\", senza spazi né caratteri di controllo
URL_INTERNO_RE = re.compile(r'/(?![/\\])[^\x00-\x20]*')
HREF_RE = re.compile(r'(?:/(?![/\\])|#|https://)[^\x00-\x20]*')
SLUG_RISERVATI = {'archivio'}
TAG_AMMESSI = {'a', 'b', 'blockquote', 'div', 'h3', 'li', 'ol', 'p', 'small', 'ul', 'strong', 'em', 'i', 'br',
               'span', 'figure', 'figcaption', 'img'}
TAG_VUOTI = {'br', 'img'}
# attributo -> tag su cui è ammesso (None = tutti i tag ammessi); data-jr-go (senza valore) è usato dagli
# articoli storici per lo scorrimento verso un'ancora interna (assets/js/02-jr-js.js)
ATTR_AMMESSI = {'class': None, 'alt': None, 'href': 'a', 'src': 'img', 'data-jr-go': 'a'}


class _Corpo(HTMLParser):
    """Allowlist del corpo: solleva ValueError al primo elemento non ammesso."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.pila, self.testo = [], ''

    def handle_starttag(self, tag, attrs):
        self.testo = ''
        if tag not in TAG_AMMESSI:
            raise ValueError('tag <%s> non ammesso' % tag)
        for k, v in attrs:
            if k not in ATTR_AMMESSI or ATTR_AMMESSI[k] not in (None, tag):
                raise ValueError('attributo "%s" non ammesso su <%s>' % (k, tag))
            if k == 'data-jr-go' and v:
                raise ValueError('data-jr-go non accetta valori')
            if k in ('href', 'src'):
                # HTMLParser restituisce i valori già decodificati; unescape di nuovo non allarga nulla
                u = html.unescape(v or '')
                if not (HREF_RE if k == 'href' else URL_INTERNO_RE).fullmatch(u):
                    raise ValueError('%s "%s" non ammesso' % (k, v))
        if tag not in TAG_VUOTI:
            self.pila.append(tag)

    handle_startendtag = handle_starttag  # <p/> apre comunque un <p> nel browser

    def handle_endtag(self, tag):
        self.testo = ''
        if not self.pila or self.pila.pop() != tag:
            raise ValueError('chiusura </%s> senza apertura corrispondente' % tag)

    def handle_data(self, data):
        # Python 3.12 restituisce come testo, anche spezzati in più pezzi, i "<!--" o "<tag" rimasti aperti
        self.testo += data
        m = re.search(r'<[!/?a-zA-Z]', self.testo)
        if m:
            raise ValueError('markup non chiuso "%s"' % self.testo[m.start():m.start() + 30])

    def handle_comment(self, data):
        raise ValueError('commenti non ammessi')

    def handle_decl(self, decl):
        raise ValueError('dichiarazioni non ammesse')

    handle_pi = unknown_decl = handle_decl

    def close(self):
        # markup incompleto a fine corpo: nella pagina inghiottirebbe il </div> che segue
        if re.search(r'<[!/?a-zA-Z]', self.rawdata):
            raise ValueError('markup non chiuso "%s"' % self.rawdata[:30])
        super().close()
        if self.pila:
            raise ValueError('tag <%s> non chiuso' % self.pila[-1])


def verifica_corpo(corpo):
    """Solleva ValueError se il corpo esce dall'allowlist di tag e attributi."""
    p = _Corpo()
    p.feed(corpo)
    p.close()


class ArticoloError(ValueError):
    """Articolo non valido; il messaggio inizia col nome della cartella."""


def data_italiana(iso):
    a, m, g = iso.split('-')
    return '%d %s %s' % (int(g), MESI[int(m) - 1], a)


def _valida(nome, base, meta, corpo, slug_visti, titoli_visti):
    def err(msg):
        raise ArticoloError('%s: %s' % (nome, msg))
    for k in OBBLIGATORI:
        if k not in meta:
            err('campo mancante "%s"' % k)
        if k != 'related' and (not isinstance(meta[k], str) or not meta[k].strip()):
            err('campo "%s" vuoto o non testuale' % k)
    try:
        if not DATA_RE.fullmatch(meta['data']):
            raise ValueError
        datetime.date.fromisoformat(meta['data'])
    except ValueError:
        err('data non valida (AAAA-MM-GG)')
    if 'autore' in meta and (not isinstance(meta['autore'], str) or not meta['autore'].strip()):
        err('autore deve essere un testo non vuoto')
    if nome != meta['data'] + '-' + meta['slug']:
        err('il nome della cartella deve essere data-slug')
    if not SLUG_RE.fullmatch(meta['slug']):
        err('slug non valido')
    if meta['slug'] in SLUG_RISERVATI:
        err('slug "%s" riservato' % meta['slug'])
    if meta['slug'] in slug_visti:
        err('slug già in uso')
    if meta['titolo'] in titoli_visti:
        err('titolo già in uso')
    if meta['categoria'] not in CATEGORIE:
        err('categoria sconosciuta "%s"' % meta['categoria'])
    t = meta['title_seo']
    if not t.endswith(' · Ricavia') or len(t) > 60:
        err('title_seo deve finire con " · Ricavia" e avere al massimo 60 caratteri (ora %d)' % len(t))
    d = meta['description']
    if not 140 <= len(d) <= 160 or '…' in d or d.endswith('.'):
        err('description di 140-160 caratteri, senza "…" e senza punto finale (ora %d)' % len(d))
    r = meta['related']
    if not isinstance(r, list) or not r or not all(
            isinstance(x, dict) and isinstance(x.get('label'), str) and x['label'].strip()
            and isinstance(x.get('url'), str) and URL_INTERNO_RE.fullmatch(x['url']) for x in r):
        err('related deve essere una lista non vuota di {label, url} con url di un percorso interno ("/..." ma non "//" né "/\\")')
    if not os.path.isfile(os.path.join(base, 'hero.webp')):
        err('hero.webp mancante')
    try:
        verifica_corpo(corpo)
    except ValueError as e:
        err('corpo: %s' % e)


def carica(cartella, slug_esistenti, titoli_esistenti):
    if not os.path.isdir(cartella):
        return []
    slug_visti, titoli_visti, voci = set(slug_esistenti), set(titoli_esistenti), []
    for nome in sorted(os.listdir(cartella)):
        base = os.path.join(cartella, nome)
        mp, ap = os.path.join(base, 'meta.json'), os.path.join(base, 'articolo.html')
        if nome[0] in '_.' or not os.path.isdir(base):
            continue
        if os.path.isfile(mp) != os.path.isfile(ap):
            raise ArticoloError('%s: serve sia meta.json sia articolo.html' % nome)
        if not os.path.isfile(mp):
            continue
        try:
            with open(mp, encoding='utf-8') as f:
                meta = json.load(f)
        except ValueError as e:
            raise ArticoloError('%s: meta.json non è JSON valido (%s)' % (nome, e))
        if not isinstance(meta, dict):
            raise ArticoloError('%s: meta.json deve essere un oggetto' % nome)
        with open(ap, encoding='utf-8') as f:
            corpo = f.read()
        _valida(nome, base, meta, corpo, slug_visti, titoli_visti)
        slug_visti.add(meta['slug'])
        titoli_visti.add(meta['titolo'])
        parole = len(re.sub(r'<[^>]+>', ' ', corpo).split())
        voci.append(dict(meta, corpo=corpo, percorso=os.path.abspath(base), minuti=max(1, round(parole / 200))))
    voci.sort(key=lambda a: a['slug'])
    voci.sort(key=lambda a: a['data'], reverse=True)
    return voci


def ritirati(cartella):
    """Slug degli articoli ritirati da ritirati.json (file assente = nessuno)."""
    path = os.path.join(cartella, 'ritirati.json')
    if not os.path.isfile(path):
        return []
    try:
        with open(path, encoding='utf-8') as f:
            slugs = json.load(f)
    except ValueError as e:
        raise ArticoloError('ritirati.json: non è JSON valido (%s)' % e)
    if not isinstance(slugs, list) or not all(isinstance(s, str) and SLUG_RE.fullmatch(s) for s in slugs):
        raise ArticoloError('ritirati.json: deve essere una lista di slug (minuscole, numeri, trattini)')
    for s in SLUG_RISERVATI.intersection(slugs):
        raise ArticoloError('ritirati.json: "%s" è uno slug riservato' % s)
    for nome in os.listdir(cartella):
        if os.path.isdir(os.path.join(cartella, nome)) and DATA_RE.fullmatch(nome[:10]) and nome[11:] in slugs:
            raise ArticoloError('ritirati.json: "%s" ha ancora la cartella %s' % (nome[11:], nome))
    return slugs


def _e(x):
    return html.escape(x, quote=True)


def _hero(a):
    return '/osservatorio/%s/hero.webp' % a['slug']


def template(a):
    """Contenuto dell'articolo, uguale a quello dei <template id="jr-t-aN"> storici (senza il tag template)."""
    return (
        '<header class="jr-ah"><span class="jr-k">%s</span><h2>%s</h2><p class="jr-sub">%s</p>'
        '<div class="jr-by"><span class="jr-av"></span><div><b>%s</b><small>%s · %d min di lettura</small></div></div></header>'
        '<figure class="jr-hero"><img src="%s" alt="%s"></figure><div class="jr-body">\n%s\n</div>'
    ) % (_e(CATEGORIE[a['categoria']]), _e(a['titolo']), _e(a['sottotitolo']), _e(a.get('autore', AUTORE)),
         data_italiana(a['data']), a['minuti'], _hero(a), _e(a['alt']), a['corpo'])


def scheda(a, in_evidenza=False):
    return (
        '<article class="%s ar" data-cat="%s"><a class="jr-hit" href="/osservatorio/%s/" aria-label="Leggi: %s"></a>'
        '<figure class="jr-im"><img src="%s" alt="" loading="lazy"></figure>'
        '<div class="jr-tx"><span class="jr-k">%s</span><h3>%s</h3><p>%s</p>'
        '<div class="jr-m"><span>%s</span><span>%d min di lettura</span><b>Leggi %s</b></div></div></article>'
    ) % ('jr-ft' if in_evidenza else 'jr-cd', a['categoria'], a['slug'], _e(a['titolo']), _hero(a),
         _e(CATEGORIE[a['categoria']]), _e(a['titolo']), _e(a['sottotitolo']), data_italiana(a['data']),
         a['minuti'], 'l’articolo →' if in_evidenza else '→')


def voce_seo(a):
    return {'slug': a['slug'], 'title': a['title_seo'], 'description': a['description'],
            'related_intro': a['related_intro'], 'related': a['related'], 'author': a.get('autore', AUTORE)}
