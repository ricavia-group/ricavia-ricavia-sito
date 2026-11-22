"""Controlla assets/data/annunci.json (annunci di strutture ricettive in vendita a Roma).

Uso: python tools/annunci.py [percorso]  → esce con 1 ed elenca gli errori se il file non è valido
"""
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FILE = os.path.join(ROOT, 'assets', 'data', 'annunci.json')

ZONE = {'Centro storico', 'Monti', 'Trastevere', 'Prati · Vaticano', 'Esquilino · Termini',
        'Testaccio · Ostiense', 'San Lorenzo · Pigneto', 'Flaminio · Parioli', 'Via Veneto'}
TIPI = {'albergo', 'extralberghiero', 'altro'}
VENDITE = {'immobile e attività', 'solo attività', 'solo immobile'}
DATA = re.compile(r'^\d{4}-\d{2}-\d{2}$')
# campo: (tipi ammessi, può essere null)
CAMPI = {
    'id': (str, False), 'fonte': (str, False), 'link': (str, False), 'titolo': (str, False),
    'zona_sito': (str, True), 'area': (str, False), 'tipo': (str, False), 'stelle': (int, True),
    'camere': (int, True), 'camere_stimate': (bool, False), 'mq': (int, True), 'prezzo': (int, False),
    'vendita': (str, False), 'letto_il': (str, False),
}


def errori(dati):
    """Restituisce l'elenco degli errori trovati (vuoto se il file è valido)."""
    if not isinstance(dati, dict) or set(dati) != {'aggiornato', 'annunci'}:
        return ['in cima servono esattamente le chiavi "aggiornato" e "annunci"']
    err = []
    if not (isinstance(dati['aggiornato'], str) and DATA.match(dati['aggiornato'])):
        err.append('aggiornato: serve una data AAAA-MM-GG')
    if not isinstance(dati['annunci'], list) or not dati['annunci']:
        return err + ['annunci: serve un elenco non vuoto']
    visti = set()
    for i, a in enumerate(dati['annunci']):
        nome = f"annuncio {i} ({a.get('id', '?') if isinstance(a, dict) else '?'})"
        if not isinstance(a, dict):
            err.append(f'{nome}: non è un oggetto')
            continue
        if set(a) != set(CAMPI):
            err.append(f'{nome}: campi mancanti {sorted(set(CAMPI) - set(a))}, in più {sorted(set(a) - set(CAMPI))}')
            continue
        for campo, (tipo, nullo) in CAMPI.items():
            v = a[campo]
            # bool è un sottotipo di int: va escluso a mano dai campi numerici
            if v is None and nullo:
                continue
            if not isinstance(v, tipo) or (tipo is int and isinstance(v, bool)):
                err.append(f'{nome}: {campo} ha tipo sbagliato ({v!r})')
            elif tipo is str and not v.strip():
                err.append(f'{nome}: {campo} è vuoto')
        if err and err[-1].startswith(nome):
            continue
        if a['id'] in visti:
            err.append(f'{nome}: id duplicato')
        visti.add(a['id'])
        if not a['link'].startswith('https://'):
            err.append(f'{nome}: il link deve iniziare con https://')
        if a['zona_sito'] is not None and a['zona_sito'] not in ZONE:
            err.append(f'{nome}: zona_sito non è una delle 9 zone')
        if a['tipo'] not in TIPI:
            err.append(f'{nome}: tipo non valido')
        if a['vendita'] not in VENDITE:
            err.append(f'{nome}: vendita non valida')
        if a['prezzo'] <= 0:
            err.append(f'{nome}: il prezzo deve essere maggiore di zero')
        if a['camere'] is None and a['mq'] is None:
            err.append(f'{nome}: servono camere o mq')
        if a['camere_stimate'] and a['camere'] is None:
            err.append(f'{nome}: camere_stimate senza camere')
        for campo in ('camere', 'mq'):
            if a[campo] is not None and a[campo] <= 0:
                err.append(f'{nome}: {campo} deve essere maggiore di zero')
        if a['stelle'] is not None and not 1 <= a['stelle'] <= 5:
            err.append(f'{nome}: stelle fuori da 1-5')
        if not DATA.match(a['letto_il']):
            err.append(f'{nome}: letto_il deve essere AAAA-MM-GG')
    return err


def main(percorso=FILE):
    with open(percorso, encoding='utf-8') as f:
        trovati = errori(json.load(f))
    for e in trovati:
        print(e)
    if not trovati:
        print('annunci.json valido')
    return 1 if trovati else 0


if __name__ == '__main__':
    sys.exit(main(*sys.argv[1:]))
