"""Pagina dell'Osservatorio (#pg-osservatorio di index.html) costruita con i numeri veri.

Uso: python tools/osservatorio.py [CARTELLA]
CARTELLA contiene osservatorio.json, vie.json e mappa.json prodotti da tools/oss_pubblico.py nel repo commerciale
(solo numeri aggregati e punti senza nome). Senza CARTELLA si usano i file già in assets/data/.
Riscrive la parte tra <!--oss:pagina--> e <!--/oss:pagina-->: si rilancia a ogni edizione, poi build e controlli.
Il percorso segue il giro delle pagine del 13/11 (fermate 1, 6, 7, 8, 9).
"""
import datetime, html, json, os, re, shutil, sys

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


# Le classifiche: chiave, titolo, gruppo (registro o Booking), unità, formato del valore
CLASSIFICHE = [
    ("vie_strutture", "Vie con più strutture ricettive", "reg", "strutture ricettive", num),
    ("vie_camere", "Vie con più camere", "reg", "camere", num),
    ("aree_alberghi", "Rioni e quartieri con più alberghi", "reg", "alberghi", num),
    ("aree_extra", "Rioni con più B&B, case vacanze e affittacamere", "reg", "strutture ricettive", num),
    ("aree_sabato", "Dove costa di più il sabato", "bk", "€ a notte, valore mediano", lambda v: f"{v} €"),
    ("aree_rincaro", "Dove il sabato rincara di più", "bk", "sul martedì", pct),
    ("aree_evento", "Dove costa di più Capodanno", "bk", "€ a notte, valore mediano", lambda v: f"{v} €"),
    ("aree_esauriti", "Dove non c'è più posto a Capodanno", "bk", "alberghi senza camere per 2", lambda v: pct(v, False)),
    ("aree_voto", "Dove gli ospiti danno il voto più alto", "bk", "voto mediano su Booking", dec),
]


def fonti(d):
    lett = (f'Booking, prezzi letti dal {data(d["letture_dal"])} al {data(d["aggiornato"])} 2026 su {num(d["alberghi_letti"])} alberghi, '
            f'camera per 2 persone. Valori mediani, solo rioni e quartieri con almeno 5 alberghi letti')
    return {"reg": f'Registro delle strutture ricettive di Roma Capitale, file di {d["registro"]["file"]} (CC BY 4.0)',
            "bk": lett,
            "aree_esauriti": lett + f'. Quota di alberghi senza camere per 2 persone in vendita per la notte del {data(d["date"]["evento"])}: '
                                    'è la disponibilità su Booking, non l\'occupazione'}


def hero(d):
    r = d["roma"]
    cont = [(d["registro"]["strutture"], "strutture ricettive nel registro di Roma Capitale"),
            (d["registro"]["alberghi"], "alberghi"),
            (d["alberghi_letti"], "alberghi letti su Booking"),
            (d["vie"], "vie con almeno una struttura ricettiva")]
    return f'''<section class="o2-hero ap-dark2" id="o2-top"><div class="wrap">
<button class="ap-back" type="button" data-ct-close>← Torna alla home</button>
<div class="o2-hg">
<div class="o2-hl">
<span class="o2-tag ar" style="--d:.05s">Osservatorio Ricavia · Roma</span>
<h1 id="po-h" class="ar" style="--d:.12s">Il mercato alberghiero di Roma,<br>{g("letto ogni notte")}</h1>
<p class="o2-lead ar" style="--d:.2s">Ogni notte leggiamo su Booking le tariffe degli alberghi di Roma. Ogni mese pubblichiamo le classifiche. Cerca il tuo hotel, una zona o una via e guarda il mercato intorno a te</p>
<div class="o2-cerca ar" style="--d:.3s">
<div class="o2-seg" role="group" aria-label="Cosa vuoi cercare"><button type="button" class="on" data-m="h" aria-pressed="true">Il tuo hotel</button><button type="button" data-m="z" aria-pressed="false">Una zona o una via</button></div>
<form class="o2-f" id="o2Cerca" novalidate><div class="o2-in"><input name="q" autocomplete="off" aria-label="Cerca un hotel, una zona o una via" placeholder="Nome del tuo hotel"><div class="o2-sug" id="o2Sug" hidden></div></div><button type="submit">Cerca <span class="arr">→</span></button></form>
<div class="o2-nf" id="o2Nf" role="status" aria-live="polite" hidden></div>
</div>
<p class="o2-live ar" style="--d:.38s"><i></i>Ultima lettura: {data(d["aggiornato"])} · {num(d["alberghi_letti"])} alberghi letti su Booking</p>
</div>
<figure class="o2-map ar" style="--d:.2s"><div class="o2-cv" style="aspect-ratio:{d["mappa_wh"]}"><canvas id="o2Map" role="img" aria-label="Mappa di Roma: un punto per ogni struttura ricettiva del registro di Roma Capitale, gli alberghi in evidenza. Tocca una zona per aprirla"></canvas><div class="o2-tip" id="o2Tip" hidden></div></div>
<figcaption><span><i class="o2-ek"></i>Alberghi</span><span><i class="o2-eg"></i>Guest house, affittacamere e B&amp;B</span><span><i class="o2-el"></i>Case vacanze e alloggi turistici</span><em>Un punto per ogni struttura ricettiva del registro. Tocca una zona</em></figcaption></figure>
</div>
<div class="o2-cnt">{"".join(f'<div class="ar" style="--d:{.1 + i * .08:.2f}s"><b data-n="{n}">{num(n)}</b><span>{E(t)}</span></div>' for i, (n, t) in enumerate(cont))}</div>
</div></section>
<nav class="o2-nav" id="o2Nav" aria-label="Sezioni dell'Osservatorio"><div class="wrap"><a href="#o2-prezzi">Prezzi</a><a href="#o2-classifiche">Classifiche</a><a href="#o2-zone">Zone</a><a href="#o2-vie">Vie</a><a href="#o2-hotel">Il tuo hotel</a><a href="#o2-metodo">Metodo</a></div></nav>'''


def prezzi(d):
    r, dt = d["roma"], d["date"]
    col = [("Martedì", data(dt["martedi"]), r["martedi"], "un giorno feriale"),
           ("Sabato", data(dt["sabato"]), r["sabato"], pct(r["rincaro_sabato"]) + " sul martedì"),
           ("Capodanno", data(dt["evento"], True), r["evento"], pct(r["rincaro_evento"]) + " sul martedì")]
    top = max(c[2] for c in col)
    cols = "".join(f'<div class="o2-th ar" style="--d:{.1 + i * .12:.2f}s;--h:{v / top * 100:.0f}%"><div class="o2-th-b"><i></i></div>'
                   f'<b>{v} €</b><strong>{k}</strong><span>{s}</span><small>{n}</small></div>' for i, (k, s, v, n) in enumerate(col))
    ins = [(pct(r["esauriti_evento"], False), "degli alberghi letti non ha più camere per 2 persone su Booking per la notte di Capodanno"),
           (pct(r["tariffa_ferma"], False), "chiede lo stesso prezzo il martedì e il sabato: la tariffa non segue la domanda"),
           (dec(r["voto"]), "il voto mediano degli alberghi di Roma su Booking")]
    return f'''<section class="o2-sec o2-lt" id="o2-prezzi"><div class="wrap">
<div class="o2-sh"><span class="o2-tag ar">Quanto costa Roma</span><h2 class="ar">A Capodanno Roma costa<br>{g(pct(r["rincaro_evento"]))} rispetto a un martedì</h2>
<p class="ar">Prezzo mediano a notte di una camera per 2 persone negli alberghi di Roma, nelle tre date che leggiamo ogni notte. Metà degli alberghi chiede di meno, metà di più</p></div>
<div class="o2-pz"><div class="o2-ths">{cols}</div>
<div class="o2-ins">{"".join(f'<div class="ar" style="--d:{.2 + i * .1:.2f}s"><b>{a}</b><span>{b}</span></div>' for i, (a, b) in enumerate(ins))}</div></div>
<p class="o2-src ar">Fonte: {E(fonti(d)["bk"])}</p>
</div></section>'''


def classifiche(d):
    f = fonti(d)
    tabs, panes = {"reg": [], "bk": []}, []
    for i, (k, titolo, gr, unita, fmt) in enumerate(CLASSIFICHE):
        voci = d["classifiche"].get(k) or []
        if not voci:
            continue
        top = max(x["valore"] for x in voci) or 1
        rows = "".join(f'<li style="--w:{x["valore"] / top * 100:.0f}%;--i:{j}"><em>{j:02d}</em><b>{E(x["nome"])}'
                       + (f'<small>{x["alberghi"]} alberghi letti</small>' if "alberghi" in x else "")
                       + f'</b><i><u></u></i><span>{fmt(x["valore"])}</span></li>' for j, x in enumerate(voci, 1))
        on = " on" if i == 0 else ""
        tabs[gr].append(f'<button type="button" class="o2-t{on}" data-i="{k}" aria-pressed="{"true" if on else "false"}">{E(titolo)}</button>')
        panes.append(f'<div class="o2-p{on}" data-i="{k}" data-t="{E(titolo)}" data-u="{E(unita)}"><div class="o2-ph"><b>{E(titolo)}</b><small>{E(unita)}</small></div>'
                     f'<ol class="o2-l">{rows}</ol><p class="o2-src">Fonte: {E(f.get(k, f[gr]))}</p></div>')
    panes.append('<div class="o2-p" data-i="hs"><div class="o2-ph"><b>Top 10 Hotel Score</b><small>da dicembre</small></div><div class="o2-soon">'
                 '<div class="o2-seal"><span>Top 10<b>Centro storico</b>Osservatorio Ricavia</span></div>'
                 '<p>La classifica degli alberghi per zona e categoria esce quando ogni albergo ha almeno 4 voti su 6 dell\'Hotel Score. '
                 'Gli hotel in Top 10 ricevono il sigillo per il proprio sito e l\'invito a una puntata di Turismo da Bar</p></div></div>')
    return f'''<section class="o2-sec o2-lt2" id="o2-classifiche"><div class="wrap">
<div class="o2-sh"><span class="o2-tag ar">Le classifiche</span><h2 class="ar">Le classifiche,<br>{g("una sola Roma")}</h2>
<p class="ar">Dove si trovano le strutture ricettive, dove costano di più, dove a Capodanno non c'è più posto. Ogni classifica con fonte, data e metodo, ogni mese una nuova edizione</p></div>
<div class="o2-cl ar">
<div class="o2-tabs"><div><span>Dove sono</span>{"".join(tabs["reg"])}</div><div><span>Quanto costano</span>{"".join(tabs["bk"])}</div>
<div><span>Gli alberghi</span><button type="button" class="o2-t" data-i="hs" aria-pressed="false">Top 10 Hotel Score</button></div></div>
<div class="o2-pn">{"".join(panes)}</div>
<aside class="o2-soc"><div class="o2-card" id="o2Card" aria-label="Scheda della classifica da condividere"></div>
<div class="o2-sb"><button type="button" id="o2Png">Scarica l'immagine</button><button type="button" id="o2Share">Condividi</button></div>
<p>La scheda per Instagram e LinkedIn, nello stile Ricavia</p></aside>
</div>
</div></section>'''


def zone(d):
    chips = "".join(f'<button type="button" data-z="{i}"{" class=on" if i == 0 else ""}>{E(z["nome"])}</button>' for i, z in enumerate(d["zone"]))
    return f'''<section class="o2-sec ap-dark2 o2-dk" id="o2-zone"><div class="wrap">
<div class="o2-sh"><span class="o2-tag ar">Le zone</span><h2 class="ar">Nove zone,<br>{g("nove mercati")}</h2>
<p class="ar">Scegli una zona: l'offerta dal registro di Roma Capitale e il mercato letto su Booking. Solo numeri d'insieme, nessun hotel nominato</p></div>
<div class="o2-zc ar" role="group" aria-label="Scegli la zona">{chips}</div>
<div class="o2-zg ar"><div class="o2-zm"><canvas id="o2ZMap" role="img" aria-label="Mappa della zona scelta"></canvas></div><div class="o2-zp" id="o2Zona" aria-live="polite"></div></div>
<p class="o2-soon2 ar">Da gennaio, per ogni zona: arrivi, presenze e passeggeri di Fiumicino e Ciampino, con fonte e data</p>
</div></section>'''


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
             ("Ricevi il report", "Sei aree, un voto per ognuna e tre priorità")]
    tab = [("Competitor A", "9,1", "205 €"), ("Competitor B", "8,9", "198 €"), ("Hotel Esempio", "8,8", "138 €"), ("Competitor C", "8,6", "184 €")]
    righe = "".join(f'<div{" class=you" if n == "Hotel Esempio" else ""}><span>{n}</span><span>{v}</span><span>{p}</span></div>' for n, v, p in tab)
    return f'''<section class="o2-sec ap-dark2 o2-dk" id="o2-hotel"><div class="wrap"><div class="o2-hg2">
<div><div class="o2-sh"><span class="o2-tag ar">Hotel Score</span><h2 class="ar">E il tuo hotel,<br>{g("rispetto ai competitor?")}</h2>
<p class="ar">Scrivi il nome del tuo hotel: scegliamo le strutture ricettive più vicine e simili, leggiamo voti e prezzi e ti mandiamo l'Hotel Score con tre priorità. Gratis</p></div>
<ol class="o2-st">{"".join(f'<li class="ar" style="--d:{.1 + i * .08:.2f}s"><em>{i + 1:02d}</em><b>{a}</b><span>{b}</span></li>' for i, (a, b) in enumerate(passi))}</ol>
<a class="ap-btn solid ar" href="#pg-pagella">Calcola l'Hotel Score <span class="arr">→</span></a></div>
<div class="o2-chat" id="o2Chat" aria-label="Anteprima della conversazione dell'Hotel Score, con valori illustrativi"><small>Anteprima · valori illustrativi</small>
<p class="q">Come si chiama il tuo hotel?</p><p class="a">Hotel Esempio</p>
<p class="q">Ho trovato Hotel Esempio, a Monti: 24 camere, tre stelle. Ho letto 10 strutture ricettive simili, tra le più vicine</p>
<div class="q o2-ct"><div><span>Struttura ricettiva</span><span>Voto</span><span>Sabato</span></div>{righe}</div>
<p class="q">Il sabato hai il prezzo più basso del gruppo, con recensioni tra le migliori. Ti mando il report con le tre priorità?</p></div>
</div></div></section>'''


def metodo():
    regole = [("Le sei aree dell'Hotel Score", "Prezzi, Canali, Sito e vendita diretta, Reputazione, Foto e contenuti, Posizionamento. La media compare solo con almeno 4 voti su 6"),
              ("Ogni numero con fonte e data", "Accanto a ogni dato il giorno della lettura. Un dato che manca è dichiarato, mai stimato"),
              ("Valori mediani, mai medie", "Metà degli alberghi sta sopra, metà sotto. Un valore mediano compare solo con almeno 5 alberghi letti"),
              ("Il competitive set", "Le strutture ricettive più vicine, con stesso tipo, categoria vicina e dimensione simile"),
              ("I clienti Ricavia", "Compaiono nelle classifiche con una nota accanto al nome"),
              ("Le correzioni", "Puoi segnalare un dato sbagliato o chiedere di non comparire: una persona di Ricavia controlla ogni richiesta")]
    arr = [("Dicembre", "Top 10 Hotel Score", "Per zona e categoria, con il sigillo e l'invito a Turismo da Bar"),
           ("Dicembre", "Le prime tre di ogni via", "Per tariffa letta e per Hotel Score"),
           ("Dicembre", "Investitori", "Affollamento, rendimento e costo d'ingresso delle zone, sulla pagina Nuova apertura"),
           ("Gennaio", "Domanda e flussi", "Arrivi, presenze, passeggeri di Fiumicino e Ciampino, eventi e giornate di picco")]
    return f'''<section class="o2-sec o2-lt" id="o2-metodo"><div class="wrap"><div class="o2-mg">
<div><div class="o2-sh"><span class="o2-tag ar">Il metodo</span><h2 class="ar">Regole {g("uguali per tutti")}</h2></div>
<ol class="o2-rl">{"".join(f'<li class="ar"><em>{i + 1:02d}</em><b>{a}</b><span>{b}</span></li>' for i, (a, b) in enumerate(regole))}</ol>
<div class="o2-cor ar"><button type="button" data-o2-msg="Vorrei segnalare un dato sbagliato nell'Osservatorio: ">Segnala un dato sbagliato</button><button type="button" data-o2-msg="Vorrei chiedere di non far comparire la mia struttura ricettiva nell'Osservatorio: ">Chiedi di non comparire</button></div></div>
<div><div class="o2-sh"><span class="o2-tag ar">In arrivo</span><h2 class="ar">L'Osservatorio {g("cresce ogni mese")}</h2></div>
<ol class="o2-tl">{"".join(f'<li class="ar"><em>{q}</em><b>{a}</b><span>{b}</span></li>' for q, a, b in arr)}</ol></div>
</div></div></section>'''


def pagina(d):
    dati = {"zone": d["zone"], "date": d["date"], "letti": d["alberghi_letti"], "agg": d["aggiornato"], "dal": d["letture_dal"],
            "vie": d["vie"], "fonte": fonti(d)}
    js = json.dumps(dati, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
    return (hero(d) + prezzi(d) + classifiche(d) + zone(d) + vie(d) + hotel() + metodo()
            + '<a href="#pg-pagella" id="o2Hs" hidden>Hotel Score</a><a href="#contatti" id="o2Ct" hidden>Contatti</a>'
            + f'<script type="application/json" id="o2Dati">{js}</script>')


def main():
    src = sys.argv[1] if len(sys.argv) > 1 else DATI
    if os.path.abspath(src) != os.path.abspath(DATI):
        for f in ("osservatorio.json", "vie.json", "mappa.json"):
            shutil.copy(os.path.join(src, f), os.path.join(DATI, f))
    with open(os.path.join(DATI, "osservatorio.json"), encoding="utf-8") as f:
        d = json.load(f)
    with open(os.path.join(DATI, "vie.json"), encoding="utf-8") as f:
        d["vie"] = len(json.load(f))
    with open(os.path.join(DATI, "mappa.json"), encoding="utf-8") as f:
        m = json.load(f)
        d["mappa_wh"] = f'{m["w"]}/{m["h"]}'  
    p = os.path.join(ROOT, "index.html")
    with open(p, encoding="utf-8") as f:
        t = f.read()
    pat = re.compile(r"<!--oss:pagina-->.*?<!--/oss:pagina-->", re.S)
    assert pat.search(t), "segnaposto <!--oss:pagina--> mancante in index.html"
    t = pat.sub(lambda _: "<!--oss:pagina-->" + pagina(d) + "<!--/oss:pagina-->", t)
    with open(p, "w", encoding="utf-8", newline="") as f:
        f.write(t)
    print("ok", d["aggiornato"], d["alberghi_letti"], "alberghi letti")


if __name__ == "__main__":
    main()
