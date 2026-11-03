"""Lettura e validazione degli articoli del Journal da cartelle journal/AAAA-MM-GG-<slug>/."""
import datetime
import html
import json
import os
import re

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
VIETATI = re.compile(
    r'<(?:script|iframe|h1|h2|object|embed|style|base|meta|form|link)\b|\bon\w+\s*=|\bsrcdoc\b'
    r'|javascript\s*:|vbscript\s*:|\b(?:href|src|action|formaction)\s*=\s*["\']?\s*data\s*:'
    # entità dentro href/src: nasconderebbero lo schema (&#106;avascript:)
    r'|\b(?:href|src)\s*=\s*(?:"[^"]*|\'[^\']*|[^\s>"\']*)&(?:#|[a-z]+;)', re.I)
# percorso interno: "/..." ma non "//" né "/\"
URL_INTERNO_RE = re.compile(r'/(?![/\\])')


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
            and isinstance(x.get('url'), str) and URL_INTERNO_RE.match(x['url']) for x in r):
        err('related deve essere una lista non vuota di {label, url} con url di un percorso interno ("/..." ma non "//" né "/\\")')
    if not os.path.isfile(os.path.join(base, 'hero.webp')):
        err('hero.webp mancante')
    m = VIETATI.search(corpo)
    if m:
        err('il corpo contiene "%s", non ammesso' % m.group(0))


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
