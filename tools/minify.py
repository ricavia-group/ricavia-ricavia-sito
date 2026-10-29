"""Alleggerimento del sito pubblicato (usato da tools/build.py).

- CSS: toglie le regole che non servono a nessuna pagina (classi e id mai usati
  nell'HTML o negli script) e comprime il file su poche righe.
- HTML: toglie commenti e spazi inutili tra i tag.
Il sorgente resta leggibile: si alleggerisce solo la copia in site/.
"""
import re

_TOKEN = re.compile(r'([.#])(-?[_a-zA-Z][\w-]*)')


def _strip_comments(css):
    return re.sub(r'/\*.*?\*/', '', css, flags=re.S)


def _split_blocks(css):
    """Divide il CSS in blocchi di primo livello: (prelude, body) o ('', istruzione)."""
    out, i, n = [], 0, len(css)
    while i < n:
        j = css.find('{', i)
        k = css.find(';', i)
        if j == -1:
            rest = css[i:].strip()
            if rest:
                out.append((None, rest))
            break
        if k != -1 and k < j:  # @import / @charset
            out.append((None, css[i:k + 1].strip()))
            i = k + 1
            continue
        depth, m = 0, j
        while m < n:
            c = css[m]
            if c == '{':
                depth += 1
            elif c == '}':
                depth -= 1
                if depth == 0:
                    break
            elif c in '"\'':
                m = css.find(c, m + 1)
            m += 1
        out.append((css[i:j].strip(), css[j + 1:m]))
        i = m + 1
    return out


def _needed(selector, used):
    s = re.sub(r':(not|is|where|matches)\((?:[^()]|\([^()]*\))*\)', '', selector)
    s = re.sub(r'\[[^\]]*\]', '', s)
    s = re.sub(r'::?[a-zA-Z-]+(\([^)]*\))?', '', s)
    return all(name in used for _, name in _TOKEN.findall(s))


def purge_css(css, corpus):
    used = set(re.findall(r'[-_a-zA-Z][\w-]*', corpus))
    css = _strip_comments(css)

    def walk(text):
        parts = []
        for prelude, body in _split_blocks(text):
            if prelude is None:
                parts.append(body)
                continue
            p = prelude.lower()
            if p.startswith(('@media', '@supports', '@container', '@layer')):
                inner = walk(body)
                if inner.strip():
                    parts.append('%s{%s}' % (prelude, inner))
            elif p.startswith('@'):
                parts.append('%s{%s}' % (prelude, body))
            else:
                sels = [x.strip() for x in re.split(r',(?![^()]*\))', prelude) if x.strip()]
                keep = [x for x in sels if _needed(x, used)]
                if keep and body.strip():
                    parts.append('%s{%s}' % (','.join(keep), body))
        return '\n'.join(parts)
    return walk(css)


def minify_css(css):
    css = _strip_comments(css)
    css = re.sub(r'\s+', ' ', css)
    css = re.sub(r'\s*([{};,>])\s*', r'\1', css)
    css = re.sub(r':\s+', ':', css)
    css = css.replace(';}', '}')
    return css.strip()


def minify_html(h):
    keep = []

    def stash(m):
        keep.append(m.group(0))
        return '\x00%d\x00' % (len(keep) - 1)
    h = re.sub(r'<(script|style|pre|textarea)\b.*?</\1>', stash, h, flags=re.S | re.I)
    h = re.sub(r'<!--(?!\[if).*?-->', '', h, flags=re.S)
    h = re.sub(r'>\s+<', '> <', h)
    h = re.sub(r'\n\s*', '\n', h)
    h = re.sub(r'[ \t]{2,}', ' ', h)
    return re.sub(r'\x00(\d+)\x00', lambda m: keep[int(m.group(1))], h)
