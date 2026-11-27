"""Alberghi vicino alla stazione Termini per la pagina /dormire-vicino-termini/.

Uso: python tools/viaggiatori.py [--dati CARTELLA] [--coordinate FILE] [--out FILE]
  --dati        cartella con schede.jsonl e pagine.jsonl del giro dell'Osservatorio (predefinita ~/.ricavia/osservatorio)
  --coordinate  risultato JSON di
                npx wrangler d1 execute ricavia-crm --remote --json --command "SELECT id_comune,lat,lon FROM strutture WHERE ..."
                (predefinito CARTELLA/coordinate-termini.json); senza coordinate l'elenco va in ordine di nome
  --out         predefinito assets/data/termini-hotel.json
Il repo è pubblico: nel JSON solo nome, stelle, indirizzo, distanza in linea d'aria e pagina Booking.com.
Niente prezzi, voti o altri dati letti da Booking.com (scelta legale).
"""
import argparse, datetime, json, math, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ZONE = {'Esquilino', 'Castro Pretorio'}
ESCLUSI = {'369774', '396389', '396441', '396241'}  # esclusi dalla ricerca per scelta di George
TERMINI = (41.9010, 12.5016)  # piazza dei Cinquecento
MINUSCOLE = {'a', 'ai', 'al', 'alla', 'alle', 'agli', 'da', 'dal', 'dalla', 'de', 'dei', 'del', 'della', 'delle', 'dello',
             'degli', 'di', 'e', 'ed', 'il', 'in', 'la', 'le', 'lo', 'gli', 'sul', 'sulla'}


def nome_leggibile(n):
    """'HOTEL GIGLIO DELL'OPERA' -> 'Hotel Giglio dell'Opera'; nei nomi misti corregge solo le parole tutte minuscole"""
    tutto_maiuscolo = n.isupper()
    out = []
    for i, w in enumerate(n.split()):
        if tutto_maiuscolo:
            w = w.lower()
        if not w.islower():
            out.append(w)
            continue
        pezzi = w.split("'")
        for j, p in enumerate(pezzi):
            elisione = j < len(pezzi) - 1 and pezzi[j + 1]  # dell'Opera: l'articolo resta minuscolo
            if p and (i == 0 and j == 0 or p not in MINUSCOLE and not elisione):
                pezzi[j] = p[0].upper() + p[1:]
        out.append("'".join(pezzi))
    return ' '.join(out)


def metri(a, b):
    la1, lo1, la2, lo2 = map(math.radians, (*a, *b))
    h = math.sin((la2 - la1) / 2) ** 2 + math.cos(la1) * math.cos(la2) * math.sin((lo2 - lo1) / 2) ** 2
    return 2 * 6371000 * math.asin(math.sqrt(h))


def righe(p):
    with open(p, encoding='utf-8') as f:
        return [json.loads(x) for x in f if x.strip()]


def elenco(schede, pagine, coordinate):
    url = {str(x['id_comune']): x['url'] for x in pagine if str(x.get('url', '')).startswith('https://www.booking.com/')}
    hotel = []
    for s in schede:
        i = str(s['id_comune'])
        if s.get('zona') not in ZONE or s.get('tipologia') != 'Alberghi' or i in ESCLUSI or i not in url:
            continue
        h = {'nome': nome_leggibile(s['nome'].strip()), 'stelle': s.get('stelle'), 'indirizzo': s['indirizzo'].strip(), 'url': url[i]}
        if i in coordinate:
            h['distanza'] = int(round(metri(TERMINI, coordinate[i]), -1))
        hotel.append(h)
    return sorted(hotel, key=lambda h: (h.get('distanza', 10 ** 9), h['nome'].lower()))


def main(argv=None):
    ap = argparse.ArgumentParser()
    ap.add_argument('--dati', default=os.path.join(os.path.expanduser('~'), '.ricavia', 'osservatorio'))
    ap.add_argument('--coordinate')
    ap.add_argument('--out', default=os.path.join(ROOT, 'assets', 'data', 'termini-hotel.json'))
    a = ap.parse_args(argv)
    cf = a.coordinate or os.path.join(a.dati, 'coordinate-termini.json')
    coordinate = {}
    if os.path.isfile(cf):
        with open(cf, encoding='utf-8') as f:
            res = json.load(f)
        for r in (res[0]['results'] if isinstance(res, list) else res):
            if r.get('lat') is not None and r.get('lon') is not None:
                coordinate[str(r['id_comune'])] = (r['lat'], r['lon'])
    hotel = elenco(righe(os.path.join(a.dati, 'schede.jsonl')), righe(os.path.join(a.dati, 'pagine.jsonl')), coordinate)
    with open(a.out, 'w', encoding='utf-8') as f:
        json.dump({'aggiornato': datetime.date.today().isoformat(), 'hotel': hotel}, f, ensure_ascii=False, separators=(',', ':'))
    print('alberghi', len(hotel), 'con distanza', sum('distanza' in h for h in hotel), '->', a.out)


if __name__ == '__main__':
    sys.exit(main())
