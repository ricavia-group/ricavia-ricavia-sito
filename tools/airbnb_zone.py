"""Case vacanze e affitti brevi di Roma per zona, dai dati pubblici di Inside Airbnb (insideairbnb.com, licenza CC BY 4.0).

Uso: python tools/airbnb_zone.py LISTINGS.csv.gz [--zone ZONE.geojson] [--data AAAA-MM-GG]
  LISTINGS  listings.csv.gz di Roma scaricato da insideairbnb.com
  --zone    GeoJSON dei rioni e quartieri (conoscenze/zone-roma.geojson del repo commerciale, OpenStreetMap ODbL):
            gli annunci vanno nella zona che contiene le loro coordinate, come le zone del Comune della tabella prezzi.
            Senza --zone si usa neighbourhood_cleansed di Inside Airbnb (i 15 municipi: il Centro Storico ha metà degli annunci)
  --data    data dei dati; senza, la data nel nome della cartella (rome-2026-09-17) o il primo last_scraped
Scrive assets/data/airbnb.json con soli numeri aggregati per zona: nessun nome, host, testo, foto, link o coordinata.
Conta solo gli annunci attivi (almeno una recensione negli ultimi 12 mesi) con un prezzo, senza le camere d'albergo.
Prezzo: mediana del prezzo a notte dell'annuncio intero (in euro per Roma). Notti libere: media di availability_30,
cioè notti libere sul calendario nei 30 giorni dopo la lettura (le notti bloccate dall'host contano come non libere).
Una zona con meno di MIN annunci non compare.
"""
import argparse, csv, gzip, json, os, re, statistics, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MIN = 30


def carica_zone(percorso):
    """[(nome, poligoni)] dalla più piccola: se due aree contengono il punto vince la più fine (come tools/zone.py del repo commerciale)"""
    with open(percorso, encoding="utf-8") as f:
        dati = json.load(f)
    area = lambda a: abs(sum(x1 * y2 - x2 * y1 for (x1, y1), (x2, y2) in zip(a, a[1:] + a[:1]))) / 2
    zone = []
    for ft in dati["features"]:
        g = ft["geometry"]
        pp = [g["coordinates"]] if g["type"] == "Polygon" else g["coordinates"]
        xs = [p[0] for pol in pp for p in pol[0]]
        ys = [p[1] for pol in pp for p in pol[0]]
        zone.append((ft["properties"]["name"], pp, (min(xs), min(ys), max(xs), max(ys)), sum(area(p[0]) for p in pp)))
    return sorted(zone, key=lambda z: z[3])


def dentro(x, y, anello):
    d = False
    for (x1, y1), (x2, y2) in zip(anello, anello[1:] + anello[:1]):
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            d = not d
    return d


def zona_di(lat, lon, zone):
    try:
        y, x = float(lat), float(lon)
    except (TypeError, ValueError):
        return None
    for nome, pp, (x0, y0, x1, y1), _ in zone:
        if x0 <= x <= x1 and y0 <= y <= y1 and any(dentro(x, y, p[0]) and not any(dentro(x, y, b) for b in p[1:]) for p in pp):
            return nome
    return None


def prezzo(t):
    try:
        v = float(re.sub(r"[^\d.]", "", t or ""))
    except ValueError:
        return None
    return v if v > 0 else None


def numeri(L):
    """Numeri di un gruppo di annunci: solo aggregati"""
    voti = [float(x["review_scores_rating"]) for x in L if x.get("review_scores_rating")]
    return {"annunci": len(L), "prezzo": round(statistics.median(x["_p"] for x in L)),
            "interi": round(sum(x["room_type"] == "Entire home/apt" for x in L) / len(L), 3),
            "libere": round(statistics.mean(int(x["availability_30"] or 0) for x in L), 1),
            "voto": round(statistics.mean(voti), 2) if voti else None}


def calcola(righe, zone=None):
    """righe: dizionari di listings.csv. Ritorna (roma, zone) solo con annunci attivi e prezzo"""
    attivi = []
    for x in righe:
        p = prezzo(x.get("price"))
        if p is None or x.get("room_type") == "Hotel room":
            continue
        if "number_of_reviews_ltm" in x and not int(x["number_of_reviews_ltm"] or 0):
            continue
        z = zona_di(x.get("latitude"), x.get("longitude"), zone) if zone else (x.get("neighbourhood_cleansed") or None)
        attivi.append(dict(x, _p=p, _z=z))
    if not attivi:
        raise SystemExit("nessun annuncio attivo con prezzo")
    per = {}
    for x in attivi:
        if x["_z"]:
            per.setdefault(x["_z"], []).append(x)
    zz = [dict(nome=n, **numeri(L)) for n, L in per.items() if len(L) >= MIN]
    return numeri(attivi), sorted(zz, key=lambda z: (-z["prezzo"], z["nome"]))


def main(argv=None):
    a = argparse.ArgumentParser()
    a.add_argument("listings")
    a.add_argument("--zone")
    a.add_argument("--data")
    a.add_argument("--out", default=os.path.join(ROOT, "assets", "data", "airbnb.json"))
    a = a.parse_args(argv)
    csv.field_size_limit(sys.maxsize if sys.maxsize < 2**31 else 2**31 - 1)
    with (gzip.open if a.listings.endswith(".gz") else open)(a.listings, "rt", encoding="utf-8", newline="") as f:
        righe = list(csv.DictReader(f))
    roma, zz = calcola(righe, carica_zone(a.zone) if a.zone else None)
    m = re.search(r"\d{4}-\d{2}-\d{2}", os.path.basename(os.path.dirname(os.path.abspath(a.listings))))
    data = a.data or (m.group(0) if m else min(x["last_scraped"] for x in righe if x.get("last_scraped")))
    out = {"fonte": "Inside Airbnb", "url": "https://insideairbnb.com", "licenza": "CC BY 4.0", "data": data,
           "zone_da": "rioni e quartieri (OpenStreetMap)" if a.zone else "municipi (Inside Airbnb)", "minimo": MIN,
           "roma": roma, "zone": zz}
    with open(a.out, "w", encoding="utf-8", newline="") as f:
        json.dump(out, f, ensure_ascii=False, indent=1)
    print("ok", data, roma["annunci"], "annunci attivi,", len(zz), "zone")


if __name__ == "__main__":
    main()
