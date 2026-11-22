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
<nav class="o2-nav" id="o2Nav" aria-label="Sezioni dell'Osservatorio"><div class="wrap"><a href="#o3-notte">Oggi</a><a href="#o2-prezzi">Prezzi</a><a href="#o2-classifiche">Classifiche</a><a href="#o2-flussi">Domanda</a><a href="#o2-zone">Zone</a><a href="#o2-hotel">Il tuo hotel</a><a href="#o2-vie">Vie</a><a href="#o2-metodo">Metodo</a></div></nav>'''


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


def prezzi(d):
    """Blocchi (b) quanto costa Roma e (c) chi alza il prezzo il sabato"""
    r, dt, zz = d["roma"], d["date"], d["zone"]
    gm, gs = data(dt["martedi"], True), data(dt["sabato"], True)
    mx = max([r["evento"]] + [max(z["mercato"].get("evento") or 0, z["mercato"].get("sabato") or 0) for z in zz])
    tiles = "".join(
        f'<div data-z="{E(z["nome"])}"><h3>{E(z["nome"])} <small>{z["mercato"]["alberghi"]} alberghi letti{", pochi per un confronto solido" if z["mercato"]["alberghi"] < POCHI else ""}</small></h3>'
        + riga("", "Martedì", z["mercato"].get("martedi"), mx) + riga("o3-sab", "Sabato", z["mercato"].get("sabato"), mx) + riga("o3-cap", "Capodanno", z["mercato"].get("evento"), mx) + "</div>"
        for z in sorted(zz, key=lambda z: -(z["mercato"].get("sabato") or 0)))
    b = blocco("o2-prezzi", "Quanto costa Roma", f"A Roma una camera d’albergo costa {eu(r['martedi'])} il martedì, {eu(r['sabato'])} il sabato e {eu(r['evento'])} a Capodanno",
               big(eu(r["sabato"]), f"il prezzo tipico di {gs}, 2 adulti") + TUS.format("prezzi")
               + f'<ul class="o3-leg"><li><i></i>Martedì {data(dt["martedi"])}</li><li class="s"><i></i>Sabato {data(dt["sabato"])}</li><li class="c"><i></i>Capodanno</li></ul>'
               + f'<div class="o3-zb" data-mx="{mx}">{tiles}</div>',
               f'Termine tecnico: tariffa mediana, 2 adulti; a Capodanno soggiorno di 2 notti, prezzo per notte · Fonte: Booking, {num(d["alberghi_letti"])} alberghi letti dal {data(d["letture_dal"])} al {data(d["aggiornato"])}')
    s = d["sabato100"]
    q = cento([s["alzano"], s["uguale"], s["abbassano"]])
    qq = "".join(f'<i class="{c}" style="--i:{i}"></i>' for i, c in enumerate("a" * q[0] + "b" * q[1] + "c" * q[2]))
    c = blocco("o3-sabato", "Chi alza il prezzo il sabato", f"Su 100 alberghi di Roma, {q[0]} alzano il prezzo il sabato",
               big(q[0], "alberghi su 100 chiedono di più il sabato rispetto al martedì") + TUS.format("sabato")
               + f'<div class="o3-cento"><div class="o3-q100" role="img" aria-label="Su 100 alberghi {q[0]} alzano il prezzo il sabato, {q[1]} chiedono lo stesso prezzo, {q[2]} lo abbassano">{qq}</div>'
               f'<ul><li><b class="o2-g">{q[0]}</b>alzano il prezzo il sabato</li><li><b>{q[1]}</b>chiedono lo stesso prezzo del martedì</li><li><b>{q[2]}</b>abbassano il prezzo il sabato</li></ul></div>'
               # George, 22/11: il rimprovero vale solo per chi tiene lo stesso prezzo; chi abbassa il sabato può avere clientela d'affari
               + f'<p class="o3-vende">Il sabato Roma costa {art(round(r["rincaro_sabato"] * 100))}{round(r["rincaro_sabato"] * 100)}% in più del martedì. {q[1]} alberghi su 100 chiedono lo stesso prezzo il martedì e il sabato: il revenue management decide il prezzo notte per notte</p>',
               f'Contati {num(s["contati"])} alberghi con il prezzo di {gm} e di {gs} · Fonte: Booking, lettura del {data(d["aggiornato"])}')
    return b + c


def classifiche(d):
    """Blocco (d): la Top 10 Hotel Score in barre"""
    hs = d.get("hs_tutti") or []
    if not hs:
        return ""
    rr = "".join(f'<div class="o3-r" data-id="{E(x[0])}"><span class="o3-n">{i}</span><span class="o3-rl">{E(x[1])}<small>{E(x[2] or "Roma")}{f" · {x[3]} stelle" if x[3] else ""}</small></span>'
                 f'<span class="o3-bar"><i style="--w:{x[4] * 10:.0f}%"></i></span><b class="o3-rv">{dec(x[4])}</b></div>' for i, x in enumerate(hs[:10], 1))
    return blocco("o2-classifiche", "Le classifiche", "I 10 alberghi di Roma con l’Hotel Score più alto",
                  big(dec(hs[0][4]), f"{E(hs[0][1])}, primo su {num(len(hs))} alberghi") + TUS.format("hs") + f'<div class="o3-cl">{rr}</div>' + TUS.format("hs2"),
                  f'Hotel Score: voto da 0 a 10 calcolato da Ricavia sui dati letti su Booking · {num(len(hs))} alberghi in classifica, lettura del {data(d["aggiornato"])}')


def milioni(x):
    return f"{x / 1e6:.1f}".replace(".", ",")


def flussi(d):
    """Blocco (e): una sola linea degli arrivi negli alberghi (ISTAT), quattro punti con etichetta e il livello del 2019"""
    ist = (d.get("flussi") or {}).get("istat")
    if not ist:
        return ""
    an = {y: v["arrivi_alberghi"] for y, v in ist["annui"].items() if v.get("arrivi_alberghi")}
    anni = sorted(an)
    if "2019" not in an or len(anni) < 3:
        return ""
    ult, v19 = anni[-1], an["2019"]
    df = an[ult] / v19 - 1
    mx = max(an.values()) * 1.02
    X = lambda y: anni.index(y) / (len(anni) - 1) * 100
    Y = lambda v: 100 - v / mx * 100
    top = lambda v: f"calc(34px + (100% - 64px)*{Y(v) / 100:.4f})"
    pts = " ".join(f"{X(y):.2f},{Y(an[y]):.2f}" for y in anni)
    basso = min(anni, key=lambda y: an[y])
    pos = {anni[0]: "o3-sx", "2019": "", basso: "o3-giu", ult: "o3-dx"}
    et = "".join(f'<span class="o3-pt" style="left:{X(y):.2f}%;top:{top(an[y])}"></span><span class="o3-et {c}" style="left:{X(y):.2f}%;top:{top(an[y])}">{milioni(an[y])} mln<small>{y}</small></span>'
                 for y, c in pos.items())
    return blocco("o2-flussi", "La domanda", f'Nel {ult} gli alberghi di Roma hanno registrato {milioni(an[ult])} milioni di arrivi: {f"{abs(df) * 100:.1f}".replace(".", ",")}% {"sotto" if df < 0 else "sopra"} il 2019',
                  big(milioni(an[ult]), f"milioni di arrivi negli alberghi di Roma nel {ult}") + TUS.format("domanda")
                  + f'<div class="o3-linea" role="img" aria-label="Arrivi negli alberghi di Roma dal {anni[0]} al {ult}"><div class="o3-rif" style="top:{top(v19)}"><span>il livello del 2019</span></div>'
                  f'<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="o3lg" x1="0" x2="1"><stop offset="0" stop-color="#3CCDFA"/><stop offset=".7" stop-color="#6f7bff"/><stop offset="1" stop-color="#9a7bff"/></linearGradient></defs>'
                  f'<polyline class="o3-trc" points="{pts}" fill="none" stroke="url(#o3lg)" stroke-width="3.5" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>{et}</div>',
                  f'Termine tecnico: arrivi negli esercizi alberghieri, {anni[0]}-{ult} · Fonte: {E(ist["fonte"])}')


def zone(d):
    """Blocco (f): nove schede, tre numeri sempre visibili e gli altri al tocco"""
    sch = []
    for i, z in sorted(enumerate(d["zone"]), key=lambda x: -x[1]["offerta"]["alberghi"]):
        m, f = z["mercato"], z["offerta"]
        sch.append(f'<button type="button" data-o3z="{i}" aria-expanded="false"><h3>{E(z["nome"])}</h3>'
                   f'<dl><div><dt>alberghi</dt><dd>{num(f["alberghi"])}</dd></div><div><dt>il sabato</dt><dd>{eu(m["sabato"]) if m.get("sabato") else "n.d."}</dd></div>'
                   f'<div><dt>voto su Booking</dt><dd>{dec(m["voto"]) if m.get("voto") else "n.d."}</dd></div></dl>'
                   f'<ul hidden><li>Martedì <b>{eu(m["martedi"]) if m.get("martedi") else "n.d."}</b> · Capodanno <b>{eu(m["evento"]) if m.get("evento") else "pochi alberghi letti"}</b></li>'
                   f'<li><b>{num(f["camere_alberghi"])}</b> camere d’albergo</li><li><b>{num(f["strutture"])}</b> strutture ricettive in totale</li>'
                   f'<li><b>{m["alberghi"]}</b> alberghi letti su Booking{": pochi per un confronto solido" if m["alberghi"] < POCHI else ""}</li></ul>'
                   f'<span class="o3-piu">Tocca per gli altri numeri</span></button>')
    return blocco("o2-zone", "Le zone", "Nove zone di Roma, tre numeri per ognuna",
                  TUS.format("zone") + '<div class="o3-zm"><canvas id="o2ZMap" role="img" aria-label="Mappa della zona scelta"></canvas></div>'
                  + f'<div class="o3-zs">{"".join(sch)}</div>',
                  f'Alberghi e camere: registro del Comune di Roma, {E(d["registro"]["file"])} · Prezzo del sabato: tariffa mediana di {data(d["date"]["sabato"], True)} · Voto: valore mediano su Booking, lettura del {data(d["aggiornato"])}')


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


def percorso(d, omi):
    """Il percorso a tappe di Nuova apertura (scelta 7 del 22/11, sostituisce il simulatore): dati delle zone negli attributi,
    calcoli e testi in assets/js/13-apertura.js. Senza JavaScript resta nascosto e si legge la tabella delle nove zone."""
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
    return (f'<div class="np" id="npPerc" data-z="{at(zz)}" data-occ="{occ:.4f}" data-anno="{anno}" data-stag="{at(stag)}" data-roma-sab="{d["roma"]["sabato"]}" hidden>'
            f'<div class="ix-sh"><span class="ap-tag">Il percorso a tappe</span><h2>Cinque tappe, <span class="np-g">poi il tuo report</span></h2>'
            f'<p class="ix-p">Le tappe seguono le cinque fasi del servizio. Puoi tornare indietro e cambiare ogni numero: il risultato si aggiorna subito</p></div>'
            f'<div class="np-box"><div class="np-prog" id="npProg"></div>'
            f'<div class="np-step" data-s="0"><div class="np-q"><h3>Dove vuoi aprire, e che cosa</h3>'
            f'<p>Lo studio di fattibilità parte dal mercato: scegli la zona e guarda quanto vale una camera il sabato e quanti alberghi hanno un voto sotto 8</p>'
            f'<span class="np-lbl">Zona di Roma</span><div class="np-pick" id="npZona"></div>'
            f'<span class="np-lbl">Tipo di struttura ricettiva</span><div class="np-pick" id="npTipo"></div>'
            f'<p class="np-note" id="npNTipo" hidden>Le tariffe lette su Booking sono degli alberghi: per una struttura ricettiva extralberghiera la stima è meno precisa, la tappa 4 ti lascia cambiare la tariffa</p></div>'
            f'<div class="np-res" id="npR0" aria-live="polite"></div></div>'
            f'<div class="np-step" data-s="1"><div class="np-q"><h3>Quanto investi e quante camere</h3>'
            f'<p>Il business plan parte dall’investimento. Muovi budget e camere e guarda quanto costa entrare nella zona scelta</p>'
            f'<span class="np-lbl">L’immobile</span><div class="np-pick" id="npModo"><button type="button" data-v="compra">Lo compro</button><button type="button" data-v="affitta">Lo prendo in affitto</button></div>'
            f'<p class="np-note" id="npNAnn" hidden></p>'
            + slider("npBud", "Budget", "", 300000, 15000000, 100000) + slider("npCam", "Camere", "", 4, 80, 1)
            + slider("npMq", "m² per camera", "ipotesi, spazi comuni compresi", 20, 60, 1)
            + slider("npLav", "Lavori e arredi per camera", "ipotesi, da sostituire con il tuo preventivo", 0, 80000, 1000)
            + f'</div><div class="np-res" id="npR1" aria-live="polite"></div></div>'
            f'<div class="np-step" data-s="2"><div class="np-q"><h3>Dove ti metti nel mercato</h3>'
            f'<p>Il posizionamento decide la tariffa. Scegli la fascia rispetto agli alberghi della zona: sotto, in linea o sopra</p>'
            f'<span class="np-lbl">La tua fascia di prezzo</span><div class="np-pick" id="npPos"><button type="button" data-v="0.9">Sotto la zona, −10%</button>'
            f'<button type="button" data-v="1">In linea con la zona</button><button type="button" data-v="1.15">Sopra la zona, +15%</button><button type="button" data-v="1.3">Fascia alta, +30%</button></div>'
            f'<p class="np-note">Stare sopra la zona richiede un prodotto e un servizio migliori dei vicini: lo studio di fattibilità verifica se il progetto lo permette</p></div>'
            f'<div class="np-res" id="npR2" aria-live="polite"></div></div>'
            f'<div class="np-step" data-s="3"><div class="np-q"><h3>Tariffa e occupazione</h3>'
            f'<p>I prezzi di lancio partono più bassi e salgono con le prime recensioni. Qui scegli i valori a regime, dal terzo anno</p>'
            + slider("npTar", "Tariffa media a notte", "", 60, 450, 1)
            + slider("npOcc", "Occupazione", "ipotesi", 40, 95, 1, f'<span class="np-ip">Partenza: {OCC_PARTENZA}%, ipotesi. Riferimento: {dec(occ * 100)}%, occupazione lorda dei letti negli alberghi di Roma nel {anno}</span>')
            + f'</div><div class="np-res" id="npR3" aria-live="polite"></div></div>'
            f'<div class="np-step" data-s="4"><div class="np-q"><h3>Canali, tecnologia e costi</h3>'
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
    return (f'<div class="ix-blk oz"><div class="ix-sh ar"><span class="ap-tag">Dall’Osservatorio · {data(d["aggiornato"])}</span>'
            f'<h2>Dove aprire a Roma: nove zone a confronto</h2>'
            f'<p class="ix-p">Quanto è affollata ogni zona, quanto costa una camera il sabato e quanti alberghi hanno un voto sotto 8 su Booking. '
            f'Più alta è quella quota, più spazio c’è per un albergo che lavora meglio dei vicini</p></div>'
            f'<p class="oz-hint" aria-hidden="true">Scorri la tabella di lato →</p><div class="oz-w ar"><table class="oz-t"><thead><tr><th>Zona</th><th>Strutture ricettive per km²</th><th>Alberghi</th><th>Camere d’albergo</th>'
            f'<th>Sabato, valore mediano</th><th>Voto mediano</th><th>Alberghi sotto 8</th><th>Casa al m²</th><th>Rendimento lordo da affitto</th></tr></thead><tbody>{"".join(righe)}</tbody></table></div>'
            f'<p class="oz-s">Fonte: registro delle strutture ricettive di Roma Capitale ({E(d["registro"]["file"])}) e Booking, prezzi letti dal {data(d["letture_dal"])} '
            f'al {data(d["aggiornato"])}, camera per 2 persone. Casa al m² e rendimento: quotazioni OMI dell’Agenzia delle Entrate, 1° semestre 2026, abitazioni civili in stato normale, valore mediano delle zone OMI della zona; il rendimento è l’affitto annuo diviso il prezzo, prima di tasse e spese</p>'
            f'{percorso(d, omi)}'
            f'<p class="oz-c"><a class="z-btn" href="#pg-osservatorio">Le zone nell’Osservatorio <span class="arr">→</span></a></p></div>')


def pagina(d):
    dati = {"zone": d["zone"], "date": d["date"], "letti": d["alberghi_letti"], "agg": d["aggiornato"], "dal": d["letture_dal"],
            "vie": d["vie"], "ra": d["registro"]["alberghi"], "ver": d.get("ver", ""), "hs": d.get("hs_tutti", []),
            "roma": d["roma"], "sabato100": d["sabato100"], "rioni": d["rioni"]}
    js = json.dumps(dati, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    # #o3Oggi: 12-osservatorio.js lo riscrive ogni sera con indicatori.json appena letto (la pagina non si rigenera ogni notte)
    return (hero(d) + f'<div id="o3Oggi">{stanotte(d)}{notti(d)}</div>' + prezzi(d) + classifiche(d) + flussi(d) + zone(d) + fine()
            + hotel() + vie(d) + metodo()
            + '<a href="#pg-pagella" id="o2Hs" hidden>Hotel Score</a><a href="#contatti" id="o2Ct" hidden>Contatti</a>'
            + f'<script type="application/json" id="o2Dati">{js}</script>')


def schede_dati(cartella):
    """Dalle schede degli alberghi letti: chi alza, tiene o abbassa il prezzo il sabato (blocco c)
    e la zona dell'Osservatorio di ogni rione (per dare una zona agli hotel non letti; vince la più frequente)"""
    n, rz = [0, 0, 0], collections.defaultdict(collections.Counter)
    for x in sorted(os.listdir(cartella)) if os.path.isdir(cartella) else []:
        with open(os.path.join(cartella, x), encoding="utf-8") as f:
            s = json.load(f)
        p = {q.get("etichetta"): q.get("prezzo") for q in s.get("prezzi") or []}
        a, b = p.get("martedi"), p.get("sabato")
        if a is not None and b is not None:
            n[0 if b > a else 1 if b == a else 2] += 1
        if s.get("zona") and s.get("zona_sito"):
            rz[s["zona"]][s["zona_sito"]] += 1
    return ({"alzano": n[0], "uguale": n[1], "abbassano": n[2], "contati": sum(n)},
            {r: c.most_common(1)[0][0] for r, c in sorted(rz.items())})


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
    d["sabato100"], d["rioni"] = schede_dati(os.path.join(DATI, "schede"))
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
