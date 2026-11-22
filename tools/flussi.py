"""Dati del blocco "La domanda" dell'Osservatorio (assets/data/flussi.json) letti dalle fonti ufficiali.

Uso: python tools/flussi.py            (poi python tools/osservatorio.py)
- paesi: ISTAT, arrivi negli esercizi ricettivi per paese di residenza dei clienti, provincia di Roma
  (esploradati.istat.it, dataflow 122_54_DF_DCSC_TUR_9). ISTAT non pubblica i paesi per il solo Comune di Roma
- aeroporti: Aeroporti di Roma, dati di traffico mensili del sistema Fiumicino + Ciampino (nazionali, UE, extra UE)
  e progressivo annuo dei due scali (www.adr.it/bsn-dati-di-traffico)
Le chiavi istat.annui e istat.mesi (Comune di Roma) restano come sono nel file.
"""
import csv, datetime, io, json, os, re, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILE = os.path.join(ROOT, "assets", "data", "flussi.json")
UA = {"User-Agent": "Mozilla/5.0 (Ricavia Osservatorio)"}
# il codice paese va scritto per esteso: con il paese lasciato vuoto ISTAT risponde con un errore dopo 8 minuti
NOMI = {"AR": "Argentina", "AT": "Austria", "AU": "Australia", "BE": "Belgio", "BG": "Bulgaria", "BR": "Brasile", "CA": "Canada",
        "CH_LI": "Svizzera", "CN": "Cina", "CY": "Cipro", "CZ": "Repubblica Ceca", "DE": "Germania", "DK": "Danimarca",
        "EE": "Estonia", "EG": "Egitto", "ES": "Spagna", "FI": "Finlandia", "FR": "Francia", "GR": "Grecia", "HR": "Croazia",
        "HU": "Ungheria", "IE": "Irlanda", "IL": "Israele", "IN": "India", "IS": "Islanda", "JP": "Giappone", "KR": "Corea del Sud",
        "LT": "Lituania", "LU": "Lussemburgo", "LV": "Lettonia", "MT": "Malta", "MX": "Messico", "NL": "Paesi Bassi",
        "NO": "Norvegia", "NZ": "Nuova Zelanda", "PL": "Polonia", "PT": "Portogallo", "RO": "Romania", "RU": "Russia",
        "SE": "Svezia", "SI": "Slovenia", "SK": "Slovacchia", "TR": "Turchia", "UK": "Regno Unito", "US": "Stati Uniti",
        "VE": "Venezuela", "ZA": "Sudafrica", "IT": "Italia"}
ISTAT = ("https://esploradati.istat.it/SDMXWS/rest/data/IT1,122_54_DF_DCSC_TUR_9,1.0/"
         "A.ITE43.AR.N.ALL.551_553." + "+".join(list(NOMI) + ["WORLD"]) + ".ALL.ALL.ALL.TOT?startPeriod={}")
ADR = ("https://www.adr.it/bsn-dati-di-traffico?p_p_id=it_adr_trafficdata_web_portlet_TrafficDataWebPortlet&p_p_lifecycle=0"
       "&p_p_state=normal&p_p_mode=view&_it_adr_trafficdata_web_portlet_TrafficDataWebPortlet_dataRif={}"
       "&_it_adr_trafficdata_web_portlet_TrafficDataWebPortlet_tabs1={}")


def leggi(url, timeout=60, accept=None):
    r = urllib.request.Request(url, headers=dict(UA, **({"Accept": accept} if accept else {})))
    with urllib.request.urlopen(r, timeout=timeout) as f:
        return f.read().decode("utf-8")


def paesi_da_csv(testo):
    """Righe SDMX-CSV di ISTAT -> {anno: {codice: arrivi}}"""
    out = {}
    for r in csv.DictReader(io.StringIO(testo)):
        if r.get("OBS_VALUE"):
            out.setdefault(r["TIME_PERIOD"], {})[r["COUNTRY_RES_GUESTS"]] = int(float(r["OBS_VALUE"]))
    return out


def paesi(anni):
    """Primi 10 paesi esteri + Italia nell'ultimo anno, con la quota sul totale e la quota dell'anno prima.
    Il confronto è sulle quote: dal 2025 ISTAT conta anche gli alloggi privati in affitto e gli arrivi crescono per questo"""
    a = sorted(y for y in anni if anni[y].get("WORLD"))
    if len(a) < 2:
        return None
    ult, pr = a[-1], a[-2]
    u, p = anni[ult], anni[pr]
    q = lambda d, c: round(d[c] / d["WORLD"] * 100, 1) if d.get(c) else None
    riga = lambda c: {"cod": c.split("_")[0], "nome": NOMI[c], "arrivi": u[c], "quota": q(u, c), "quota_prima": q(p, c)}
    top = sorted((c for c in u if c in NOMI and c != "IT"), key=lambda c: -u[c])[:10]
    return {"anno": int(ult), "prima": int(pr), "totale": u["WORLD"], "totale_prima": p["WORLD"],
            "italia": riga("IT"), "esteri": [riga(c) for c in top],
            "fonte": "ISTAT, arrivi negli esercizi ricettivi per paese di residenza dei clienti, provincia di Roma"}


def n(t):
    t = t.strip().replace(".", "").replace(",", ".").replace("%", "")
    return float(t) if t else None


def tabella(testo, titolo):
    """Righe TOTALE, NAZIONALE, INTERN.LE, E.U., Extra E.U. della tabella ADR: passeggeri e variazione sull'anno prima"""
    i = testo.find(titolo)
    if i < 0:
        return None
    s = testo[i:testo.find("</table>", i)]
    out = {}
    for th, tds in re.findall(r"<th>\s*([^<]+?)\s*</th>(.*?)</tr>", s, re.S):
        td = re.findall(r"<td[^>]*>([^<]*)</td>", tds)
        k = {"TOTALE": "pax", "NAZIONALE": "naz", "INTERN.LE": "int", "- E.U.": "ue", "- Extra E.U.": "extra"}.get(th)
        if k and len(td) >= 6:
            out[k], out[k + "_var"] = int(n(td[4])), n(td[5])
    return out if "pax" in out else None


def aeroporti():
    home = leggi("https://www.adr.it/bsn-dati-di-traffico")
    rif = max(re.findall(r'<option[^>]*value="(\d{6})"', home))  # l'ultimo mese pubblicato
    anno, ultimo = int(rif[:4]), int(rif[4:])
    mesi = []
    for m in range(1, ultimo + 1):
        t = tabella(leggi(ADR.format(f"{anno}{m:02d}", "SIS")), "Report mensile")
        if t:
            for k in ("fco", "cia"):  # i due scali mese per mese: li legge anche il nastro (nastro() in tools/osservatorio.py)
                s = tabella(leggi(ADR.format(f"{anno}{m:02d}", k.upper())), "Report mensile") or {}
                t[k], t[k + "_var"] = s.get("pax"), s.get("pax_var")
            mesi.append(dict(mese=m, **t))
    sis = tabella(leggi(ADR.format(rif, "SIS")), "Progressivo annuo")
    scali = {k: tabella(leggi(ADR.format(rif, k.upper())), "Progressivo annuo") for k in ("fco", "cia")}
    return {"anno": anno, "mesi": mesi, "progressivo": dict(sis, **{k: v["pax"] for k, v in scali.items()},
                                                            **{k + "_var": v["pax_var"] for k, v in scali.items()}),
            "fonte": "Aeroporti di Roma, dati di traffico di Fiumicino e Ciampino"}


def main():
    with open(FILE, encoding="utf-8") as f:
        d = json.load(f)
    d["aeroporti"] = aeroporti()
    print("aeroporti", d["aeroporti"]["anno"], len(d["aeroporti"]["mesi"]), "mesi")
    y = datetime.date.today().year
    p = paesi(paesi_da_csv(leggi(ISTAT.format(y - 4), 300, "application/vnd.sdmx.data+csv;version=1.0.0")))
    if p:
        d["paesi"] = p
        print("paesi", p["anno"], [x["cod"] for x in p["esteri"]])
    with open(FILE, "w", encoding="utf-8", newline="") as f:
        json.dump(d, f, ensure_ascii=False, separators=(",", ":"))


if __name__ == "__main__":
    sys.exit(main())
