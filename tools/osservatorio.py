"""Pagina dell'Osservatorio (#pg-osservatorio di index.html) costruita con i numeri veri.

Uso: python tools/osservatorio.py [CARTELLA]
CARTELLA contiene osservatorio.json, vie.json e mappa.json prodotti da tools/oss_pubblico.py nel repo commerciale
(solo numeri aggregati e punti senza nome). Senza CARTELLA si usano i file già in assets/data/.
Riscrive la parte tra <!--oss:pagina--> e <!--/oss:pagina-->: si rilancia a ogni edizione, poi build e controlli.
Il percorso segue il giro delle pagine del 13/11 (fermate 1, 6, 7, 8, 9).
"""
import collections, datetime, hashlib, html, json, os, re, shutil, statistics, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATI = os.path.join(ROOT, "assets", "data")
MESI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto",
        "settembre", "ottobre", "novembre", "dicembre"]
GIORNI = ["lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato", "domenica"]
E = html.escape


def num(n):
    return f"{n:,}".replace(",", ".")


def dec(x):
    return f"{x:.1f}".replace(".", ",")


def pct(x, segno=True):
    return ("+" if segno and x > 0 else "") + f"{x * 100:.0f}%"


def data(iso, giorno=False):
    d = datetime.date.fromisoformat(iso)
    return (GIORNI[d.weekday()] + " " if giorno else "") + f"{d.day} {MESI[d.month - 1]}"


def g(t):
    return f'<span class="o2-g">{t}</span>'


# Terza versione dell'Osservatorio (scelta di George del 22/11): ogni blocco ha una frase, un numero grande e una figura semplice.
# Python scrive i numeri di Roma e delle zone; 12-osservatorio.js aggiunge le righe "Tu" negli spazi .o3-tus e rilegge ogni sera il blocco #o3Oggi
POCHI = 10  # sotto questo numero di alberghi letti il confronto di zona è poco solido


def eu(v):
    return f"{num(round(v))} €"


def art(n):
    """Articolo davanti a una percentuale: l'11%, l'8%, il 12%"""
    return "l'" if n in (1, 11) or str(n).startswith("8") else "il "


def riga(cls, lbl, v, mx, alt="pochi alberghi letti"):
    """Una barra con etichetta e numero scritto accanto (la stessa riga di 12-osservatorio.js)"""
    if v is None:
        return f'<div class="o3-r o3-nd {cls}"><span class="o3-rl">{lbl}</span><b class="o3-rv"><em>{E(alt)}</em></b></div>'
    return (f'<div class="o3-r {cls}"><span class="o3-rl">{lbl}</span><span class="o3-bar"><i style="--w:{min(100, max(2, v / mx * 100)):.1f}%"></i></span>'
            f'<b class="o3-rv">{eu(v)}</b></div>')


def blocco(id_, tag, h2, corpo, fonte):
    return (f'<section class="o2-sec ap-dark2 o2-dk o3-blk" id="{id_}"><div class="wrap"><div class="o3-card"><p class="o2-tag">{tag}</p>'
            f'<h2>{h2}</h2>{corpo}<p class="o2-src">{fonte}</p></div></div></section>')


def big(n, t):
    return f'<div class="o3-big"><b>{n}</b><span>{t}</span></div>'


TUS = '<div class="o3-tus" data-b="{}"></div>'


def hero(d):
    return f'''<section class="o2-hero ap-dark2" id="o2-top"><div class="wrap">
<button class="ap-back" type="button" data-ct-close>← Torna alla home</button>
<div class="o2-hl">
<span class="o2-tag">Osservatorio Ricavia · Roma</span>
<h1 id="po-h">Il mercato degli alberghi di Roma, {g("visto dal tuo hotel")}</h1>
<p class="o2-lead">Prezzi letti ogni notte su Booking. Ultima lettura: {data(d["aggiornato"])}</p>
<div class="o2-cerca">
<form class="o2-f" id="o2Cerca" role="search" novalidate><label class="o3-lab" for="o2Q">Cerca il tuo hotel</label><div class="o2-in"><input id="o2Q" name="q" type="search" autocomplete="off" enterkeyhint="search" placeholder="Nome dell'hotel o CIN" aria-controls="o2Sug"><div class="o2-sug" id="o2Sug" role="listbox" hidden></div></div><button type="submit">Cerca <span class="arr">→</span></button></form>
<small class="o3-sm">Un solo passaggio: ogni blocco della pagina aggiunge i numeri del tuo hotel accanto a quelli della tua zona e di Roma. Gratis, senza registrazione</small>
<div class="o2-nf" id="o2Nf" role="status" aria-live="polite" hidden></div>
</div>
<div class="o3-io" id="o2Io" hidden aria-live="polite"></div>
</div>
</div></section>
<div class="o3-me" id="o3Me" aria-hidden="true"><div class="wrap"><p>La pagina parla di <b></b></p><button type="button" data-o3="chat">Apri la chat</button></div></div>
<nav class="o2-nav" id="o2Nav" aria-label="Sezioni dell'Osservatorio"><div class="wrap"><a href="#o3-notte">Oggi</a><a href="#o2-prezzi">Prezzi</a><a href="#o2-classifiche">Classifiche</a><a href="#o2-flussi">Domanda</a><a href="#o2-hotel">Il tuo hotel</a><a href="#o2-vie">Vie</a><a href="#o2-metodo">Metodo</a></div></nav>'''


def stanotte(d, oggi=None):
    """Blocco (a), punto 4 di George del 22/11: in positivo e per tutti. Quota di alberghi con almeno una camera libera su Booking
    e prezzo medio per tipo (indicatori.json, riletto ogni sera dalla pagina). Niente "Stanotte" e niente numero di alberghi letti.
    per_tipo: una tessera per tipo solo se il prezzo c'è; senza per_tipo resta il prezzo degli alberghi"""
    I = d.get("indicatori") or {}
    u = I.get("ultimo")
    if not u or not I.get("alberghi_registro") or u.get("alberghi_prenotabili") is None:
        return ""
    p = round(u["alberghi_prenotabili"] / I["alberghi_registro"] * 100)
    righe = [r for r in I.get("per_tipo") or [] if isinstance(r, dict) and r.get("mediana") is not None and (r.get("etichetta") or r.get("tipo"))]
    if not righe and u.get("tariffa_alberghi") is not None:
        righe = [{"etichetta": "Alberghi", "mediana": u["tariffa_alberghi"], "letto_il": u.get("letto_il")}]
    letto = next((r["letto_il"] for r in righe if r.get("letto_il")), u.get("letto_il") or u["notte"])
    tessere = "".join(f'<div class="o3-tp"><span class="o3-tpl">{E(r.get("etichetta") or r["tipo"])}</span>'
                      f'<b class="o3-tpv" data-v="{round(r["mediana"])}">{eu(r["mediana"])}</b><small>a notte, 2 persone</small></div>' for r in righe)
    corpo = (f'<div class="o3-tps">{tessere}</div>' if righe else "") + TUS.format("notte")
    a = art(p)
    return blocco("o3-notte", "Roma, notte per notte",
                  f'{a[0].upper()}{a[1:]}{p}% degli alberghi di Roma ha ancora almeno una camera libera per la notte del {data(u["notte"])}', corpo,
                  f'Prezzo medio: il prezzo che sta nel mezzo, metà chiede meno e metà di più. Camera libera su Booking: è la disponibilità, non l’occupazione. Fonte: Booking, lettura del {data(letto[:10])}')


def notti(d, oggi=None):
    """Le prossime notti più care: solo se indicatori.json ha il campo calendario con almeno 3 notti future"""
    oggi = oggi or datetime.date.today().isoformat()
    cal = [c for c in (d.get("indicatori") or {}).get("calendario") or []
           if isinstance(c, dict) and c.get("mediana") is not None and str(c.get("data", ""))[:10] >= oggi]
    if len(cal) < 3:
        return ""
    pr = max(cal, key=lambda c: c["mediana"])
    top = sorted(sorted(cal, key=lambda c: -c["mediana"])[:7], key=lambda c: c["data"])
    mx = pr["mediana"]
    corpo = (big(eu(pr["mediana"]), f'{data(pr["data"][:10], True)}, 2 persone')
             + '<div class="o3-notti">' + "".join(riga("o3-sab" if c is pr else "", data(c["data"][:10], True), c["mediana"], mx) for c in top) + "</div>"
             + TUS.format("notti"))
    return blocco("o3-notti", "Le prossime notti più care", f'La notte più cara in arrivo è {data(pr["data"][:10], True)}: una camera d’albergo costa {eu(pr["mediana"])}', corpo,
                  "Prezzo medio degli alberghi con camere libere, 2 persone · Fonte: Booking, lettura del " + data(((d.get("indicatori") or {}).get("ultimo") or {}).get("letto_il", pr["data"])[:10]))


def cento(n):
    """100 quadratini con i resti più alti: la somma fa sempre 100 (come cento() della bozza)"""
    t = sum(n)
    e = [x / t * 100 for x in n]
    f = [int(x) for x in e]
    for i in sorted(range(3), key=lambda i: f[i] - e[i])[:100 - sum(f)]:
        f[i] += 1
    return f


ZONA_MIN = 5  # regola 03 del metodo: un valore mediano compare solo con almeno 5 alberghi letti
MENO = "−"
MEDIO = "Prezzo medio: il prezzo che sta nel mezzo, metà chiede meno e metà di più"


def rispetto(v, r):
    """Differenza dal prezzo di Roma: +12%, −5%, in linea (la stessa di rispetto() in 12-osservatorio.js)"""
    if v is None or not r:
        return "n.d."
    x = round((v / r - 1) * 100)
    return "in linea" if x == 0 else f"{'+' if x > 0 else MENO}{abs(x)}%"


def zp_schede(righe, sabato, letto):
    """Tabella dei prezzi per zona quando indicatori.json non ha ancora zone_date: una sola colonna, il sabato letto nelle schede,
    zone del Comune di Roma con almeno ZONA_MIN prezzi. Stesso formato di zone_date"""
    pz = collections.defaultdict(list)
    for r in righe:
        if r[8] is not None and r[2]:
            pz[r[2]].append(r[8])
    tutti = [p for v in pz.values() for p in v]
    if not tutti:
        return None
    d = datetime.date.fromisoformat(sabato)
    return {"date": [{"chiave": "sabato", "etichetta": f"Un sabato di {MESI[d.month - 1]}", "data": sabato}],
            "zone": [{"nome": z, "prezzi": {"sabato": {"mediana": round(statistics.median(v)), "hotel": len(v)}}}
                     for z, v in sorted(pz.items()) if len(v) >= ZONA_MIN],
            "roma": {"sabato": round(statistics.median(tutti))}, "letto_il": letto, "schede": True}


def zp_valido(z):
    """zone_date di indicatori.json, se ha almeno una data, una zona e Roma; scarta le righe rotte"""
    if not isinstance(z, dict) or not isinstance(z.get("roma"), dict):
        return None
    dd = [x for x in z.get("date") or [] if isinstance(x, dict) and x.get("chiave") and x.get("etichetta")]
    zz = [x for x in z.get("zone") or [] if isinstance(x, dict) and x.get("nome") and isinstance(x.get("prezzi"), dict)]
    return dict(z, date=dd, zone=zz) if dd and zz else None


def zp_prezzo(z, k):
    p = (z.get("prezzi") or {}).get(k)
    return p.get("mediana") if isinstance(p, dict) else None


def zp_righe(m, k):
    """Righe della tabella per la data k, dalla zona più cara (la stessa di zpRighe() in 12-osservatorio.js prima dei tocchi)"""
    roma = m["roma"].get(k)
    out = []
    for z in sorted(m["zone"], key=lambda z: (zp_prezzo(z, k) is None, -(zp_prezzo(z, k) or 0), z["nome"])):
        v = zp_prezzo(z, k)
        out.append(f'<tr><th scope="row">{E(z["nome"])}</th><td>{eu(v) if v is not None else "n.d."}</td><td>{rispetto(v, roma)}</td></tr>')
    return "".join(out)


def prezzi_zone(d):
    """Blocco (b), punto 5 di George del 22/11: tabella interattiva dei prezzi per zona. Con zone_date in indicatori.json tre date
    (questa settimana, questo weekend, prossimo weekend) e le zone di Booking; senza, una colonna dal sabato delle schede.
    12-osservatorio.js disegna date, ordinamento, ricerca e dettaglio dagli stessi dati (o2Dati.zp e indicatori.json)"""
    zd = zp_valido((d.get("indicatori") or {}).get("zone_date"))
    m = zd or d.get("zs")
    if not m:
        return ""
    k = m["date"][0]["chiave"]
    chips = "".join(f'<button type="button" data-k="{E(x["chiave"])}" aria-pressed="{"true" if i == 0 else "false"}">{E(x["etichetta"])}</button>'
                    for i, x in enumerate(m["date"]))
    nota = "" if zd else '<p class="o3-znota">Per ora la tabella ha una sola data. Tra pochi giorni le date si aggiornano ogni sera: questa settimana, questo weekend e il prossimo weekend</p>'
    letto = m.get("letto_il") or d["aggiornato"]
    fonte = (f'{MEDIO}. Camera per 2 persone, una notte · '
             + (f'Zone come le divide Booking · Fonte: Booking, lettura del {data(letto[:10])}' if zd else
                f'Zone del Comune di Roma con almeno {ZONA_MIN} alberghi letti · Fonte: Booking, prezzi letti dal {data(d["letture_dal"])} al {data(d["aggiornato"])}'))
    roma = m["roma"].get(k)
    return blocco("o2-prezzi", "Quanto costa Roma", "Quanto costa dormire nelle zone di Roma",
                  f'<div class="o3-zt" id="o3Zt"><div class="o3-zbar"><div class="o3-chips" role="group" aria-label="Scegli la data">{chips}</div>'
                  f'<input class="o3-zq" type="search" autocomplete="off" placeholder="Cerca la zona" aria-label="Cerca la zona" hidden></div>'
                  f'<p class="o3-zroma">Roma <b>{eu(roma) if roma else "n.d."}</b> <span>{data(m["date"][0]["data"][:10], True) if m["date"][0].get("data") else E(m["date"][0]["etichetta"])}</span></p>'
                  + TUS.format("prezzi")
                  + f'<div class="o3-tw"><table class="o3-t"><thead><tr><th scope="col">Zona</th><th scope="col">Prezzo medio</th><th scope="col">Rispetto a Roma</th></tr></thead>'
                  f'<tbody>{zp_righe(m, k)}</tbody></table></div><button type="button" class="o3-tutte" hidden></button>{nota}</div>',
                  fonte)


def dieci(n):
    """Quanti su 10 con i resti più alti: la somma fa sempre 10 (come cento())"""
    t = sum(n)
    e = [x / t * 10 for x in n]
    f = [int(x) for x in e]
    for i in sorted(range(3), key=lambda i: f[i] - e[i])[:10 - sum(f)]:
        f[i] += 1
    return f


def sabato(d):
    """Blocco (c), punto 6 di George del 22/11: una frase e una barra sola divisa in tre (alzano, uguale, abbassano)"""
    s, r = d["sabato100"], d["roma"]
    if not s["contati"]:
        return ""
    q, z = cento([s["alzano"], s["uguale"], s["abbassano"]]), dieci([s["alzano"], s["uguale"], s["abbassano"]])
    gm, gs = data(d["date"]["martedi"], True), data(d["date"]["sabato"], True)
    nomi = [("a", "alzano il prezzo"), ("b", "uguale al martedì"), ("c", "lo abbassano")]
    barra = (f'<div class="o3-sb" data-q="{q[0]},{q[1]},{q[2]}"><div class="o3-sbp" aria-hidden="true">'
             + "".join(f'<span style="--w:{q[i]}%">{q[i]}%</span>' for i in range(3))
             + f'</div><div class="o3-sbb" role="img" aria-label="Su 100 alberghi {q[0]} alzano il prezzo il sabato, {q[1]} chiedono lo stesso prezzo del martedì, {q[2]} lo abbassano">'
             + "".join(f'<i class="{c}" style="--w:{q[i]}%"></i>' for i, (c, _) in enumerate(nomi))
             + '</div><ul class="o3-sbl">' + "".join(f'<li class="{c}"><i></i>{t}</li>' for c, t in nomi) + "</ul></div>")
    rs = round(r["rincaro_sabato"] * 100)
    # George, 22/11: la frase finale vale solo per chi tiene lo stesso prezzo; chi abbassa il sabato può avere clientela d'affari
    return blocco("o3-sabato", "Chi alza il prezzo il sabato",
                  f"Il sabato {z[0]} alberghi su 10 a Roma alzano il prezzo. {z[1]} su 10 lo lasciano uguale al martedì",
                  TUS.format("sabato") + barra
                  + f'<p class="o3-vende">{q[1]} alberghi su 100 chiedono lo stesso prezzo il martedì e il sabato, mentre il sabato Roma costa {art(rs)}{rs}% in più: il revenue management decide il prezzo notte per notte</p>',
                  f'Contati {num(s["contati"])} alberghi con il prezzo di {gm} e di {gs} · Fonte: Booking, lettura del {data(d["aggiornato"])}')


# Le classifiche del modulo (punto 7 di George del 22/11). Le stesse regole di CLT in 12-osservatorio.js.
# Riga di classifiche.json: [id, nome, zona, stelle, hotel_score, voto, recensioni, martedi, sabato]
VOTO_REC = 100  # il voto degli ospiti conta da 100 recensioni in su
VOTO_QP = 8  # rapporto voto/prezzo: alberghi con voto da 8 in su, dal martedì più economico
CLASSIFICHE = [("hs", "Hotel Score"), ("voto", "Voto degli ospiti"), ("rec", "Più recensioni"),
               ("sab", "Sabato più caro"), ("qp", "Rapporto voto/prezzo")]  # nomi corti: sul telefono stanno in due righe


def top(righe, k):
    """Ordine di una classifica: solo le righe con il dato, a pari valore davanti chi ha più recensioni"""
    rec = lambda r: -(r[6] or 0)
    if k == "hs":
        return sorted((r for r in righe if r[4] is not None), key=lambda r: (-r[4], rec(r)))
    if k == "voto":
        return sorted((r for r in righe if r[5] is not None and (r[6] or 0) >= VOTO_REC), key=lambda r: (-r[5], rec(r)))
    if k == "rec":
        return sorted((r for r in righe if r[6]), key=rec)
    if k == "sab":
        return sorted((r for r in righe if r[8] is not None), key=lambda r: (-r[8], rec(r)))
    if k == "qp":
        return sorted((r for r in righe if r[5] is not None and r[5] >= VOTO_QP and r[7] is not None), key=lambda r: (r[7], -r[5], rec(r)))
    raise KeyError(k)


def valore(r, k):
    return {"hs": lambda: dec(r[4]), "voto": lambda: dec(r[5]), "rec": lambda: num(r[6]), "sab": lambda: eu(r[8]),
            "qp": lambda: f"{dec(r[5])} · {eu(r[7])}"}[k]()


def riga_cl(i, r, k):
    return (f'<li data-id="{E(r[0])}"><span class="o3-n">{i}</span><span class="o3-rl">{E(r[1])}<small>{E(r[2] or "Roma")}'
            f'{f" · {r[3]} stelle" if r[3] else ""}</small></span><b class="o3-rv">{valore(r, k)}</b></li>')


def classifiche(d):
    """Blocco (d): modulo con cinque classifiche, filtro per stelle e per zona; 12-osservatorio.js rifà la Top 10 da classifiche.json"""
    righe = d.get("righe") or []
    if not righe:
        return ""
    gm, gs = data(d["date"]["martedi"], True), data(d["date"]["sabato"], True)
    nz = collections.Counter(r[2] for r in righe if r[2])
    tabs = "".join(f'<button type="button" data-t="{k}" aria-pressed="{"true" if k == "hs" else "false"}">{t}</button>' for k, t in CLASSIFICHE)
    stelle = "".join(f'<button type="button" data-st="{k}" aria-pressed="{"true" if not k else "false"}">{t}</button>'
                     for k, t in [("", "Tutte"), ("12", "1-2 stelle"), ("3", "3 stelle"), ("4", "4 stelle"), ("5", "5 stelle")])
    zone = "".join(f'<option value="{E(z)}">{E(z)} ({n})</option>' for z, n in sorted(nz.items(), key=lambda x: (-x[1], x[0])))
    l = top(righe, "hs")
    spieg = {"hs": "Voto da 0 a 10 calcolato da Ricavia su prezzi, reputazione, foto e posizionamento",
             "voto": f"Voto degli ospiti su Booking, alberghi con almeno {VOTO_REC} recensioni",
             "rec": "Numero di recensioni su Booking", "sab": f"Prezzo di {gs}, camera per 2 persone",
             "qp": f"Alberghi con voto da {VOTO_QP} in su su Booking, dal prezzo più basso di {gm}"}
    at = html.escape(json.dumps(spieg, ensure_ascii=False), quote=True)
    return blocco("o2-classifiche", "Le classifiche", "I primi 10 alberghi di Roma, nella classifica che scegli tu",
                  f'<div class="o3-cm" id="o3Cm" data-sp="{at}"><div class="o3-chips o3-ct" role="group" aria-label="Scegli la classifica">{tabs}</div>'
                  f'<div class="o3-cf"><div class="o3-chips o3-cs" role="group" aria-label="Stelle">{stelle}</div>'
                  f'<select class="o3-cz" aria-label="Zona"><option value="">Tutte le zone di Roma</option>{zone}</select></div>'
                  f'<p class="o3-csp">{spieg["hs"]}</p><ol class="o3-cl2" aria-live="polite">{"".join(riga_cl(i, r, "hs") for i, r in enumerate(l[:10], 1))}</ol>'
                  f'<p class="o3-cn">{num(len(l))} alberghi in questa classifica</p></div>' + TUS.format("hs"),
                  f'Dati letti su Booking dal {data(d["letture_dal"])} al {data(d["aggiornato"])}, {num(len(righe))} alberghi di Roma · Zone del Comune di Roma')


def milioni(x):
    return f"{x / 1e6:.1f}".replace(".", ",")


def var(a, b):
    """Variazione percentuale con un decimale e il segno: +4,0%, −1,3%"""
    x = round((a / b - 1) * 100, 1)
    return ("+" if x > 0 else MENO if x < 0 else "") + f"{abs(x):.1f}".replace(".", ",") + "%"


def flussi(d):
    """Blocco (e), punto 8 di George del 22/11: tre numeri grandi con una frase e una linea piccola degli arrivi negli alberghi (ISTAT)"""
    fl = d.get("flussi") or {}
    ist = fl.get("istat")
    if not ist:
        return ""
    an = {y: v["arrivi_alberghi"] for y, v in ist["annui"].items() if v.get("arrivi_alberghi")}
    anni = sorted(an)
    if "2019" not in an or len(anni) < 3:
        return ""
    ult, pr = anni[-1], anni[-2]
    tre = [(f"{milioni(an[ult])} mln", f"arrivi negli alberghi di Roma nel {ult}, {var(an[ult], an[pr])} sul {pr}"),
           (var(an[ult], an["2019"]), f"gli arrivi negli alberghi nel {ult} rispetto al 2019, l’anno prima della pandemia")]
    ae = fl.get("aeroporti") or {}
    mm = [m for m in ae.get("mesi") or [] if m.get("fco") and m.get("cia") and m.get("fco_var") is not None and m.get("cia_var") is not None]
    fa = ""
    if mm:
        m = mm[-1]
        ora = m["fco"] + m["cia"]
        prima = m["fco"] / (1 + m["fco_var"] / 100) + m["cia"] / (1 + m["cia_var"] / 100)  # stesso mese dell'anno prima, dalle variazioni di Assaeroporti
        tre.append((f"{milioni(ora)} mln", f"passeggeri a Fiumicino e Ciampino a {MESI[m['mese'] - 1]} {ae['anno']}, {var(ora, prima)} sullo stesso mese del {ae['anno'] - 1}"))
        fa = f" · Aeroporti: {E(ae.get('fonte', 'Assaeroporti'))}"
    mx, mn = max(an.values()), min(an.values())
    X = lambda y: anni.index(y) / (len(anni) - 1) * 100
    Y = lambda v: 4 + (mx - v) / (mx - mn) * 32
    pts = " ".join(f"{X(y):.2f},{Y(an[y]):.2f}" for y in anni)
    df = an[ult] / an[pr] - 1
    return blocco("o2-flussi", "La domanda",
                  f"Nel {ult} gli alberghi di Roma hanno registrato {milioni(an[ult])} milioni di arrivi, {art(round(abs(df) * 100))}{round(abs(df) * 100)}% {'in più' if df >= 0 else 'in meno'} del {pr}",
                  '<div class="o3-n3">' + "".join(f'<div><b>{n}</b><span>{t}</span></div>' for n, t in tre) + "</div>"
                  + f'<div class="o3-spk"><span>Arrivi negli alberghi, {anni[0]}-{ult}</span><svg viewBox="0 0 100 40" preserveAspectRatio="none" role="img" aria-label="Arrivi negli alberghi di Roma dal {anni[0]} al {ult}: minimo nel {min(an, key=an.get)}, {milioni(mn)} milioni">'
                  f'<polyline class="o3-trc" points="{pts}" fill="none" stroke="url(#o3lg)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/>'
                  '<defs><linearGradient id="o3lg" x1="0" x2="1"><stop offset="0" stop-color="#3CCDFA"/><stop offset=".7" stop-color="#1F2DD0"/><stop offset="1" stop-color="#724AF8"/></linearGradient></defs></svg>'
                  f'<small>{anni[0]}</small><small>{ult}</small></div>' + TUS.format("domanda"),
                  f'Arrivi negli esercizi alberghieri · Fonte: {E(ist["fonte"])}{fa}')


def fine():
    return ('<section class="o2-sec ap-dark2 o2-dk o3-fine" id="o3Fine"><div class="wrap"><div class="o3-card"><h2>Questi sono i numeri di Roma. ' + g("E i tuoi?") + '</h2>'
            '<p>Cerca il tuo hotel: ogni blocco della pagina aggiunge i tuoi prezzi e la tua posizione accanto alla tua zona e a Roma</p>'
            '<button class="o3-btn" type="button" data-o3="cerca"><span>Cerca il tuo hotel</span></button></div></div></section>')



def vie(d):
    es = ["Via Nazionale", "Via Vittorio Veneto", "Via Cavour", "Viale di Trastevere"]
    return f'''<section class="o2-sec o2-lt" id="o2-vie"><div class="wrap"><div class="o2-vg">
<div class="o2-sh"><span class="o2-tag ar">Le vie</span><h2 class="ar">Quante strutture ricettive<br>ci sono {g("nella tua via")}</h2>
<p class="ar">Scrivi una via o una piazza di Roma: contiamo strutture ricettive, camere e tipologie dal registro di Roma Capitale, su {num(d["vie"])} vie</p>
<form class="o2-f o2-f2 ar" id="o2Via" novalidate><div class="o2-in"><input name="q" autocomplete="off" aria-label="Nome della via" placeholder="Per esempio Via Nazionale"></div><button type="submit">Cerca <span class="arr">→</span></button></form>
<div class="o2-ex ar">{"".join(f'<button type="button" data-v="{E(v)}">{E(v)}</button>' for v in es)}</div></div>
<div class="o2-vr ar" id="o2VRis" aria-live="polite"><div class="o2-vr0"><b>{num(d["vie"])}</b><span>vie di Roma con almeno una struttura ricettiva. Scegli la tua</span></div></div>
</div></div></section>'''


def hotel():
    passi = [("Scrivi il nome", "Lo troviamo nel registro di Roma Capitale"),
             ("Scegliamo i competitor", "Le strutture ricettive più vicine, simili per tipo e dimensione"),
             ("Leggiamo il mercato", "Voti, recensioni e prezzi su Booking, con fonte e data"),
             ("Ricevi il report", "Un voto per area: 4 aree oggi, Canali e Sito in arrivo")]
    return f'''<section class="o2-sec ap-dark2 o2-dk" id="o2-hotel"><div class="wrap"><div class="o2-hg2">
<div><div class="o2-sh"><span class="o2-tag ar">Hotel Score</span><h2 class="ar">E il tuo hotel,<br>{g("rispetto ai competitor?")}</h2>
<p class="ar">Scrivi il nome del tuo hotel: scegliamo le strutture ricettive più vicine e simili, leggiamo voti e prezzi e ti mandiamo l'Hotel Score con le cose da guardare. Gratis</p></div>
<ol class="o2-st">{"".join(f'<li class="ar" style="--d:{.1 + i * .08:.2f}s"><em>{i + 1:02d}</em><b>{a}</b><span>{b}</span></li>' for i, (a, b) in enumerate(passi))}</ol>
<a class="ap-btn solid ar" href="#o2-hotel">Calcola l'Hotel Score <span class="arr">→</span></a></div>
<div class="o2-chat" id="o2Chat" aria-label="Conversazione dell'Hotel Score" aria-live="polite"><small>Hotel Score · dati veri letti su Booking</small>
<p class="q show">Come si chiama il tuo hotel? Scrivi il nome o il CIN: ti mostro i tuoi competitor veri, con voti e prezzi</p>
<form class="o2-cf o2-cq" id="o2ChatQ" novalidate><div class="o2-cqi"><input type="search" name="q" autocomplete="off" aria-label="Nome del tuo hotel o CIN" placeholder="Nome del tuo hotel o CIN"><div class="o2-sug" hidden></div></div><button type="submit">Cerca →</button></form></div>
</div></div></section>'''


def metodo():
    regole = [("Le sei aree dell'Hotel Score", "Prezzi, Canali, Sito e vendita diretta, Reputazione, Foto e contenuti, Posizionamento. La media compare solo con almeno 4 voti su 6. Oggi calcoliamo Prezzi, Reputazione, Foto e Posizionamento: Canali e Sito sono in arrivo"),
              ("Ogni numero con fonte e data", "Accanto a ogni dato il giorno della lettura. Un dato che manca è dichiarato, mai stimato"),
              ("Valori mediani, mai medie", "Metà degli alberghi sta sopra, metà sotto. Un valore mediano compare solo con almeno 5 alberghi letti"),
              ("Il competitive set", "Le strutture ricettive più vicine, con stesso tipo, categoria vicina e dimensione simile"),
              ("Alberghi senza camere e prezzo del giorno", "Ogni sera contiamo su Booking gli hotel di Roma ancora prenotabili per 2 adulti la notte dopo e li confrontiamo con gli alberghi del registro. "
               "Un albergo senza camere in vendita su Booking non è per forza senza ospiti: è la disponibilità, non l’occupazione delle camere. Il prezzo del giorno è il prezzo mediano degli hotel ancora prenotabili"),
              ("I clienti Ricavia", "Compaiono nelle classifiche con una nota accanto al nome"),
              ("Le correzioni", "Puoi segnalare un dato sbagliato o chiedere di non comparire: una persona di Ricavia controlla ogni richiesta")]
    arr = [("Dicembre", "Canali e Sito nell’Hotel Score", "Le ultime due aree: su quali OTA vende l’hotel e cosa offre il suo sito"),
           ("Gennaio", "Gli hotel saliti di più", "La classifica di chi ha guadagnato più Hotel Score nel mese")]
    return f'''<section class="o2-sec o2-lt" id="o2-metodo"><div class="wrap"><div class="o2-mg">
<div><div class="o2-sh"><span class="o2-tag ar">Il metodo</span><h2 class="ar">Regole {g("uguali per tutti")}</h2></div>
<ol class="o2-rl">{"".join(f'<li class="ar"><em>{i + 1:02d}</em><b>{a}</b><span>{b}</span></li>' for i, (a, b) in enumerate(regole))}</ol>
<div class="o2-cor ar"><button type="button" data-o2-msg="Vorrei segnalare un dato sbagliato nell'Osservatorio: ">Segnala un dato sbagliato</button><button type="button" data-o2-msg="Vorrei chiedere di non far comparire la mia struttura ricettiva nell'Osservatorio: ">Chiedi di non comparire</button></div></div>
<div><div class="o2-sh"><span class="o2-tag ar">In arrivo</span><h2 class="ar">L'Osservatorio {g("cresce ogni mese")}</h2></div>
<ol class="o2-tl">{"".join(f'<li class="ar"><em>{q}</em><b>{a}</b><span>{b}</span></li>' for q, a, b in arr)}</ol></div>
</div></div></section>'''


def omi_zona(qq):
    """Valori mediani delle zone OMI di una zona del sito (abitazioni civili): prezzo €/m², affitto €/m² al mese,
    rendimento lordo da affitto (affitto annuo diviso prezzo). Lo stesso rendimento della tabella e del report del percorso."""
    aa = [q for q in qq if q.get("affitto_min")]
    v = statistics.median((q["vendita_min"] + q["vendita_max"]) / 2 for q in qq)
    a = statistics.median((q["affitto_min"] + q["affitto_max"]) / 2 for q in aa) if aa else None
    r = statistics.median((q["affitto_min"] + q["affitto_max"]) / 2 * 12 / ((q["vendita_min"] + q["vendita_max"]) / 2) for q in aa) if aa else None
    return v, a, r


def casa(qq):
    """Prezzo delle case (abitazioni civili, OMI) e rendimento lordo da affitto di una zona: valori mediani delle zone OMI."""
    if not qq:
        return "<td>n.d.</td><td>n.d.</td>"
    v, _, r = omi_zona(qq)
    return f'<td>{num(int(round(v, -2)))} €</td><td>{dec(r * 100) + "%" if r else "n.d."}</td>'


# shortcut: posti letto di alberghi, dipendenze alberghiere e residence nel registro di giugno 2025 (100.693 + 1.330 + 2.701);
# da ricalcolare con un registro nuovo
LETTI_ALBERGHI = 104724
OCC_PARTENZA = 70  # scelta 8 di George (22/11): occupazione di partenza del percorso, la stessa di assets/js/13-apertura.js
# George, 22/11 sera: le cinque fasi del servizio e le cinque tappe sono una cosa sola. Ogni tappa apre con la fase e cosa riceve il cliente
FASI = [("Studio di fattibilità", "Un’analisi di fattibilità con il potenziale del progetto: mercato, domanda, concorrenza e location"),
        ("Business plan", "Un business plan pluriennale, pronto per soci e banche: investimento, ricavi, costi e GOP anno per anno"),
        ("Posizionamento", "Target, concept ed esperienza dell’ospite: il posto giusto nel mercato, con un prezzo coerente"),
        ("Prezzi di lancio", "La strategia dei primi mesi: tariffe, calendario, canali e commissioni"),
        ("Tecnologia", "La mappa degli strumenti e l’affiancamento nella fase di lancio: PMS, channel manager, booking engine e strumenti di revenue")]


def percorso(d, omi):
    """Il percorso a tappe di Nuova apertura (scelta 7 del 22/11, sostituisce il simulatore): dati delle zone negli attributi,
    calcoli e testi in assets/js/13-apertura.js. Senza JavaScript resta nascosto e si legge la tabella delle nove zone.
    Le tappe sono le cinque fasi del servizio: la pagina non ha più le fasi in blocchi statici (George, 22/11 sera)"""
    fl = (d.get("flussi") or {}).get("istat") or {}
    a, mesi = fl.get("annui", {}), fl.get("mesi", {})
    anno = max((k for k in a if (a[k] or {}).get("presenze_alberghi")), default=None)
    am = max((k for k in mesi if sum((mesi[k] or {}).get("presenze") or [0])), default=None)
    if not anno or not am:
        return ""
    occ = a[anno]["presenze_alberghi"] / (LETTI_ALBERGHI * 365)
    pm = mesi[am]["presenze"]
    stag = [round(v / sum(pm), 4) for v in pm]
    zz = []
    for z in d["zone"]:
        m, o, qq = z["mercato"] or {}, z["offerta"], omi.get(z["nome"])
        if not (m.get("martedi") and m.get("sabato") and qq):
            continue
        v, af, r = omi_zona(qq)
        if not af:
            continue
        zz.append({"n": z["nome"], "mar": m["martedi"], "sab": m["sabato"], "voto": m.get("voto"), "s8": m.get("sotto_8"),
                   "letti": m.get("alberghi") or 0, "alb": o.get("alberghi", 0),
                   "dens": round(o["strutture"] / z["km2"]) if z.get("km2") else None,
                   "st": [o.get(f"stelle_{k}", 0) for k in range(1, 6)], "casa": round(v, 1), "aff": round(af, 2), "rend": round(r, 4)})
    if not zz:
        return ""
    at = lambda x: html.escape(json.dumps(x, ensure_ascii=False, separators=(",", ":")), quote=True)
    fonte = (f'Da dove vengono i numeri. Tariffe, voti e alberghi della zona: Booking, prezzi letti dal {data(d["letture_dal"])} al {data(d["aggiornato"])} 2026, '
             f'e registro delle strutture ricettive di Roma Capitale ({E(d["registro"]["file"])}). Prezzo, affitto e rendimento lordo da affitto degli immobili: '
             f'quotazioni OMI dell’Agenzia delle Entrate, 1° semestre 2026, abitazioni civili: non esistono quotazioni pubbliche degli alberghi. '
             f'Occupazione di partenza: {OCC_PARTENZA}%, un’ipotesi; come riferimento, l’occupazione lorda dei letti negli alberghi di Roma nel {anno} è {dec(occ * 100)}% '
             f'(notti in albergo ISTAT diviso i posti letto del registro). Stagionalità: notti a Roma per mese nel {am} (ISTAT). '
             f'Tutto il resto è un’ipotesi che puoi cambiare. È una stima, non una promessa')
    slider = lambda i, lab, nota, mn, mx, st, extra="": (
        f'<div class="np-sl"><label class="np-lbl" for="{i}">{lab}{f"<small>{nota}</small>" if nota else ""}</label><span></span>'
        f'<input type="range" id="{i}" min="{mn}" max="{mx}" step="{st}"><output for="{i}"></output>{extra}</div>')
    fase = lambda k: (f'<div class="np-fase"><span class="np-n">{k + 1}</span><div><h3>{FASI[k][0]}</h3>'
                      f'<p><small>Cosa ricevi da noi</small>{FASI[k][1]}</p></div></div>')
    return (f'<div class="np" id="npPerc" data-z="{at(zz)}" data-occ="{occ:.4f}" data-anno="{anno}" data-stag="{at(stag)}" data-roma-sab="{d["roma"]["sabato"]}" hidden>'
            f'<div class="ix-sh"><span class="ap-tag">Le cinque fasi, una tappa alla volta</span><h2>Cinque fasi, <span class="np-g">poi il tuo report</span></h2>'
            f'<p class="ix-p">Ogni tappa è una fase del servizio: in alto cosa ricevi da noi, sotto i numeri del tuo progetto. Puoi tornare indietro e cambiare ogni numero: il risultato si aggiorna subito</p></div>'
            f'<div class="np-box"><div class="np-prog" id="npProg"></div>'
            f'<div class="np-step" data-s="0">{fase(0)}<div class="np-q"><h4>Dove vuoi aprire, e che cosa</h4>'
            f'<p>Lo studio di fattibilità parte dal mercato: scegli la zona e guarda quanto vale una camera il sabato e quanti alberghi hanno un voto sotto 8</p>'
            f'<span class="np-lbl">Zona di Roma</span><div class="np-pick" id="npZona"></div>'
            f'<span class="np-lbl">Tipo di struttura ricettiva</span><div class="np-pick" id="npTipo"></div>'
            f'<p class="np-note" id="npNTipo" hidden>Le tariffe lette su Booking sono degli alberghi: per una struttura ricettiva extralberghiera la stima è meno precisa, la tappa 4 ti lascia cambiare la tariffa</p></div>'
            f'<div class="np-res" id="npR0" aria-live="polite"></div></div>'
            f'<div class="np-step" data-s="1">{fase(1)}<div class="np-q"><h4>Quanto investi e quante camere</h4>'
            f'<p>Il business plan parte dall’investimento. Muovi budget e camere e guarda quanto costa entrare nella zona scelta</p>'
            f'<span class="np-lbl">L’immobile</span><div class="np-pick" id="npModo"><button type="button" data-v="compra">Lo compro</button><button type="button" data-v="affitta">Lo prendo in affitto</button></div>'
            f'<p class="np-note" id="npNAnn" hidden></p>'
            + slider("npBud", "Budget", "", 300000, 15000000, 100000) + slider("npCam", "Camere", "", 4, 80, 1)
            + slider("npMq", "m² per camera", "ipotesi, spazi comuni compresi", 20, 60, 1)
            + slider("npLav", "Lavori e arredi per camera", "ipotesi, da sostituire con il tuo preventivo", 0, 80000, 1000)
            + f'</div><div class="np-res" id="npR1" aria-live="polite"></div></div>'
            f'<div class="np-step" data-s="2">{fase(2)}<div class="np-q"><h4>Dove ti metti nel mercato</h4>'
            f'<p>Il posizionamento decide la tariffa. Scegli la fascia rispetto agli alberghi della zona: sotto, in linea o sopra</p>'
            f'<span class="np-lbl">La tua fascia di prezzo</span><div class="np-pick" id="npPos"><button type="button" data-v="0.9">Sotto la zona, −10%</button>'
            f'<button type="button" data-v="1">In linea con la zona</button><button type="button" data-v="1.15">Sopra la zona, +15%</button><button type="button" data-v="1.3">Fascia alta, +30%</button></div>'
            f'<p class="np-note">Stare sopra la zona richiede un prodotto e un servizio migliori dei vicini: lo studio di fattibilità verifica se il progetto lo permette</p></div>'
            f'<div class="np-res" id="npR2" aria-live="polite"></div></div>'
            f'<div class="np-step" data-s="3">{fase(3)}<div class="np-q"><h4>Tariffa e occupazione</h4>'
            f'<p>I prezzi di lancio partono più bassi e salgono con le prime recensioni. Qui scegli i valori a regime, dal terzo anno</p>'
            + slider("npTar", "Tariffa media a notte", "", 60, 450, 1)
            + slider("npOcc", "Occupazione", "ipotesi", 40, 95, 1, f'<span class="np-ip">Partenza: {OCC_PARTENZA}%, ipotesi. Riferimento: {dec(occ * 100)}%, occupazione lorda dei letti negli alberghi di Roma nel {anno}</span>')
            + f'</div><div class="np-res" id="npR3" aria-live="polite"></div></div>'
            f'<div class="np-step" data-s="4">{fase(4)}<div class="np-q"><h4>Canali, tecnologia e costi</h4>'
            f'<p>La tecnologia serve a vendere di più sul sito e meno sulle OTA. Muovi la quota di vendita diretta e guarda le commissioni</p>'
            + slider("npDir", "Vendita diretta dal sito", "ipotesi", 0, 70, 1) + slider("npCom", "Commissione media delle OTA", "ipotesi", 10, 25, 1)
            + slider("npCop", "Costi operativi sui ricavi", "ipotesi", 30, 70, 1, '<span class="np-ip">Personale, pulizie, utenze, manutenzione, colazioni, tecnologia</span>')
            + f'</div><div class="np-res" id="npR4" aria-live="polite"></div></div>'
            f'<div class="np-rep" id="npRep"></div>'
            f'<div class="np-mail" id="npMail" hidden><div><h3>Ricevi il report completo</h3><p>Te lo mandiamo gratis, con i tuoi numeri e in più</p>'
            f'<ul><li>L’utile anno per anno fino al quinto, nei tre scenari</li><li>Le zone di Roma con un ritorno migliore per il tuo budget</li>'
            f'<li>Il calcolo riga per riga, da portare a soci e banche</li></ul></div>'
            f'<form id="npForm" novalidate><input type="text" name="nome" placeholder="Nome e cognome" autocomplete="name" aria-label="Nome e cognome">'
            f'<input type="email" name="email" placeholder="Email" autocomplete="email" aria-label="Email">'
            f'<label class="ctp-hp" aria-hidden="true">Sito<input type="text" name="sito" tabindex="-1" autocomplete="off"></label>'
            f'<label class="np-chk"><input type="checkbox" name="privacy"><span>Ho letto l’<a href="#pg-privacy">informativa privacy</a> e accetto di essere ricontattato</span></label>'
            f'<p class="np-fn">Insieme alla richiesta riceviamo le pagine viste e il tempo di navigazione di questa visita</p>'
            f'<button type="submit" class="np-btn w"><span>Mandami il report →</span></button><p class="np-ok" role="status" aria-live="polite"></p></form></div>'
            f'<div class="np-nav"><button type="button" class="np-btn o" id="npInd">← Indietro</button><button type="button" class="np-btn w" id="npAv"><span>Avanti →</span></button></div></div>'
            f'<p class="oz-s">{fonte}</p></div>')


def apertura(d):
    """Blocco della pagina Nuova apertura: le nove zone a confronto per chi apre o compra (fermata 10 del giro)."""
    righe, omi = [], collections.defaultdict(list)
    for q in d.get("omi") or []:
        if q.get("vendita_min") and q.get("vendita_max"):
            omi[q["zona_sito"]].append(q)
    for z in sorted(d["zone"], key=lambda z: -((z["mercato"] or {}).get("sotto_8") or 0)):
        o, m = z["offerta"], z["mercato"] or {}
        dens = num(round(o["strutture"] / z["km2"])) if z.get("km2") else "n.d."
        righe.append(f'<tr><th scope="row">{E(z["nome"])}</th><td>{dens}</td><td>{num(o.get("alberghi", 0))}</td><td>{num(o.get("camere_alberghi", 0))}</td>'
                     f'<td>{str(m["sabato"]) + " €" if m.get("sabato") else "n.d."}</td><td>{dec(m["voto"]) if m.get("voto") else "n.d."}</td>'
                     f'<td><b>{pct(m["sotto_8"], False) if m.get("sotto_8") is not None else "n.d."}</b></td>{casa(omi.get(z["nome"]))}</tr>')
    # prima il percorso a tappe, subito sotto «In 30 secondi», poi le nove zone a confronto
    return (f'{percorso(d, omi)}<div class="ix-blk oz"><div class="ix-sh ar"><span class="ap-tag">Dall’Osservatorio · {data(d["aggiornato"])}</span>'
            f'<h2>Dove aprire a Roma: nove zone a confronto</h2>'
            f'<p class="ix-p">Quanto è affollata ogni zona, quanto costa una camera il sabato e quanti alberghi hanno un voto sotto 8 su Booking. '
            f'Più alta è quella quota, più spazio c’è per un albergo che lavora meglio dei vicini</p></div>'
            f'<p class="oz-hint" aria-hidden="true">Scorri la tabella di lato →</p><div class="oz-w ar"><table class="oz-t"><thead><tr><th>Zona</th><th>Strutture ricettive per km²</th><th>Alberghi</th><th>Camere d’albergo</th>'
            f'<th>Sabato, valore mediano</th><th>Voto mediano</th><th>Alberghi sotto 8</th><th>Casa al m²</th><th>Rendimento lordo da affitto</th></tr></thead><tbody>{"".join(righe)}</tbody></table></div>'
            f'<p class="oz-s">Fonte: registro delle strutture ricettive di Roma Capitale ({E(d["registro"]["file"])}) e Booking, prezzi letti dal {data(d["letture_dal"])} '
            f'al {data(d["aggiornato"])}, camera per 2 persone. Casa al m² e rendimento: quotazioni OMI dell’Agenzia delle Entrate, 1° semestre 2026, abitazioni civili in stato normale, valore mediano delle zone OMI della zona; il rendimento è l’affitto annuo diviso il prezzo, prima di tasse e spese</p>'
            f'<p class="oz-c"><a class="z-btn" href="#pg-osservatorio">Le zone nell’Osservatorio <span class="arr">→</span></a></p></div>')


def pagina(d):
    dati = {"zone": d["zone"], "date": d["date"], "letti": d["alberghi_letti"], "agg": d["aggiornato"], "dal": d["letture_dal"],
            "vie": d["vie"], "ra": d["registro"]["alberghi"], "ver": d.get("ver", ""), "hs": d.get("hs_tutti", []),
            "roma": d["roma"], "sabato100": d["sabato100"], "rioni": d["rioni"], "zs": d.get("zs"),
            "zd": zp_valido((d.get("indicatori") or {}).get("zone_date"))}
    js = json.dumps(dati, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    # #o3Oggi: 12-osservatorio.js lo riscrive ogni sera con indicatori.json appena letto (la pagina non si rigenera ogni notte)
    return (hero(d) + f'<div id="o3Oggi">{stanotte(d)}{notti(d)}</div>' + prezzi_zone(d) + sabato(d) + classifiche(d) + flussi(d) + fine()
            + hotel() + vie(d) + metodo()
            + '<a href="#pg-pagella" id="o2Hs" hidden>Hotel Score</a><a href="#contatti" id="o2Ct" hidden>Contatti</a>'
            + f'<script type="application/json" id="o2Dati">{js}</script>')


def schede_dati(cartella):
    """Dalle schede degli alberghi letti: chi alza, tiene o abbassa il prezzo il sabato (blocco c),
    la zona dell'Osservatorio di ogni rione (per dare una zona agli hotel non letti; vince la più frequente)
    e le righe delle classifiche (classifiche.json, una riga per albergo: la pagina non scarica 616 schede)"""
    n, rz, righe = [0, 0, 0], collections.defaultdict(collections.Counter), []
    for x in sorted(os.listdir(cartella)) if os.path.isdir(cartella) else []:
        with open(os.path.join(cartella, x), encoding="utf-8") as f:
            s = json.load(f)
        p = {q.get("etichetta"): q.get("prezzo") for q in s.get("prezzi") or []}
        a, b = p.get("martedi"), p.get("sabato")
        if a is not None and b is not None:
            n[0 if b > a else 1 if b == a else 2] += 1
        if s.get("zona") and s.get("zona_sito"):
            rz[s["zona"]][s["zona_sito"]] += 1
        bk = s.get("booking") or {}
        righe.append([str(s["id_comune"]), s.get("nome") or "", s.get("zona") or "", s.get("stelle"), s.get("hotel_score"),
                      bk.get("voto"), bk.get("recensioni"), a, b])
    return ({"alzano": n[0], "uguale": n[1], "abbassano": n[2], "contati": sum(n)},
            {r: c.most_common(1)[0][0] for r, c in sorted(rz.items())}, righe)


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else DATI
    if os.path.abspath(src) != os.path.abspath(DATI):
        for f in ("osservatorio.json", "vie.json", "mappa.json", "hotel.json"):
            shutil.copy(os.path.join(src, f), os.path.join(DATI, f))
        if os.path.isdir(os.path.join(src, "schede")):  # una scheda per albergo letto: conversazione e report pubblici
            shutil.rmtree(os.path.join(DATI, "schede"), ignore_errors=True)
            shutil.copytree(os.path.join(src, "schede"), os.path.join(DATI, "schede"))
    with open(os.path.join(DATI, "osservatorio.json"), encoding="utf-8") as f:
        d = json.load(f)
    with open(os.path.join(DATI, "vie.json"), encoding="utf-8") as f:
        d["vie"] = len(json.load(f))
    with open(os.path.join(DATI, "mappa.json"), encoding="utf-8") as f:
        m = json.load(f)
        d["mappa_wh"] = f'{m["w"]}/{m["h"]}'
    # /assets/ resta in cache un anno: la pagina chiede i file dei dati con una versione che cambia quando cambia il contenuto
    h = hashlib.sha1()
    schede = sorted(os.path.join("schede", x) for x in os.listdir(os.path.join(DATI, "schede"))) if os.path.isdir(os.path.join(DATI, "schede")) else []
    for f in ["vie.json", "mappa.json", "hotel.json"] + schede:
        with open(os.path.join(DATI, f), "rb") as x:
            h.update(x.read())
    d["ver"] = h.hexdigest()[:10]
    om = os.path.join(DATI, "omi.json")
    if os.path.exists(om):
        with open(om, encoding="utf-8") as f:
            d["omi"] = json.load(f)
    fl = os.path.join(DATI, "flussi.json")
    if os.path.exists(fl):
        with open(fl, encoding="utf-8") as f:
            d["flussi"] = json.load(f)
    ind = os.path.join(DATI, "indicatori.json")
    if os.path.exists(ind):
        with open(ind, encoding="utf-8") as f:
            d["indicatori"] = json.load(f)
    d["sabato100"], d["rioni"], d["righe"] = schede_dati(os.path.join(DATI, "schede"))
    d["zs"] = zp_schede(d["righe"], d["date"]["sabato"], d["aggiornato"])
    with open(os.path.join(DATI, "classifiche.json"), "w", encoding="utf-8", newline="") as f:
        json.dump(d["righe"], f, ensure_ascii=False, separators=(",", ":"))
    p = os.path.join(ROOT, "index.html")
    with open(p, encoding="utf-8") as f:
        t = f.read()
    pat = re.compile(r"<!--oss:pagina-->.*?<!--/oss:pagina-->", re.S)
    assert pat.search(t), "segnaposto <!--oss:pagina--> mancante in index.html"
    t = pat.sub(lambda _: "<!--oss:pagina-->" + pagina(d) + "<!--/oss:pagina-->", t)
    pa = re.compile(r"<!--oss:apertura-->.*?<!--/oss:apertura-->", re.S)
    assert pa.search(t), "segnaposto <!--oss:apertura--> mancante in index.html"
    t = pa.sub(lambda _: "<!--oss:apertura-->" + apertura(d) + "<!--/oss:apertura-->", t)
    with open(p, "w", encoding="utf-8", newline="") as f:
        f.write(t)
    print("ok", d["aggiornato"], d["alberghi_letti"], "alberghi letti")


if __name__ == "__main__":
    main()
