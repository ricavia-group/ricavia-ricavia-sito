"""Dati per la bozza dell'Osservatorio: un prezzo per albergo, senza nome.

Uso: python docs/design/bozza-prezzi-alberghi.py
Legge assets/data/schede/<id>.json (una scheda per albergo letto su Booking) e scrive
assets/bozze/osservatorio/prezzi-alberghi.json: una riga per albergo con zona, stelle,
prezzo del martedì, del sabato e di Capodanno (None se non letto). Nessun nome, nessun indirizzo.
Serve solo alla bozza: sul sito vero la stessa lista deve arrivare dentro osservatorio.json
(vedi docs/design/2026-11-22-istruzioni-costruzione.md, parte A, dati nuovi).
"""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SCHEDE = os.path.join(ROOT, "assets", "data", "schede")
righe, letto = [], ""
for f in sorted(os.listdir(SCHEDE)):
    with open(os.path.join(SCHEDE, f), encoding="utf-8") as x:
        s = json.load(x)
    p = {q["etichetta"]: q for q in s.get("prezzi", [])}
    letto = max(letto, (s.get("letto_il") or "")[:10])
    righe.append([s.get("zona_sito") or s.get("zona") or "", s.get("stelle"),
                  p.get("martedi", {}).get("prezzo"), p.get("sabato", {}).get("prezzo"), p.get("evento", {}).get("prezzo"),
                  p.get("evento", {}).get("motivo")])
righe.sort(key=lambda r: (r[0], r[1] or 0, r[2] or 0))
out = os.path.join(ROOT, "assets", "bozze", "osservatorio", "prezzi-alberghi.json")
with open(out, "w", encoding="utf-8") as x:
    json.dump({"letto_il": letto, "colonne": ["zona", "stelle", "martedi", "sabato", "evento", "motivo_evento"], "alberghi": righe},
              x, ensure_ascii=False, separators=(",", ":"))
print(len(righe), "alberghi", letto)
