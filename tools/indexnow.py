"""Avvisa Bing (IndexNow) delle pagine del sito pubblicato.
Uso: python3 tools/indexnow.py  — da eseguire dopo la pubblicazione, quando la chiave è già online"""
import json, os, re, urllib.request
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
key = re.search(r"INDEXNOW_KEY = '([0-9a-f]+)'", open(os.path.join(ROOT, 'tools', 'build.py')).read()).group(1)
urls = re.findall(r'<loc>([^<]+)</loc>', open(os.path.join(ROOT, 'site', 'sitemap.xml')).read())
body = json.dumps({'host': 'ricavia.com', 'key': key, 'keyLocation': 'https://ricavia.com/%s.txt' % key, 'urlList': urls}).encode()
req = urllib.request.Request('https://api.indexnow.org/indexnow', data=body, headers={'Content-Type': 'application/json; charset=utf-8'})
with urllib.request.urlopen(req, timeout=30) as r:
    print(r.status, len(urls), 'indirizzi inviati')
