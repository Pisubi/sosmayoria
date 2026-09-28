"""Descarga las respuestas guardadas en Supabase y arma un CSV por test, legible.

Cada fila trae los datos demográficos con su etiqueta, el puntaje por eje
(recalculado igual que en la app) y la respuesta a cada afirmación.

Uso:
  SUPABASE_URL=https://xxxx.supabase.co SUPABASE_SECRET_KEY=sb_secret_xxxx \
    python3 scripts/export_respuestas.py
  python3 scripts/export_respuestas.py --csv respuestas_rows.csv   # CSV bajado del panel

Genera respuestas_intl.csv y respuestas_ar.csv en la carpeta actual. La clave secreta
lee todo: no la subas al repo ni la pongas en la app.
"""
import csv, json, math, os, sys, urllib.request

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
TESTS = {1: 'intl', 2: 'ar'}
VARIANTS = {1: 'corta', 2: 'completa', 3: 'a fondo'}
# Deben coincidir con src/lib/participant.ts.
AGE = {0: '', 1: '16-17', 2: '18-24', 3: '25-34', 4: '35-44', 5: '45-54', 6: '55-64', 7: '65+'}
GENDER = {0: '', 1: 'Mujer', 2: 'Varón', 3: 'No binario u otra'}
EDUCATION = {0: '', 1: 'Sin estudios o primario incompleto', 2: 'Primario completo',
             3: 'Secundario incompleto', 4: 'Secundario completo',
             5: 'Terciario o universitario incompleto', 6: 'Terciario o universitario completo',
             7: 'Posgrado'}
VALUES = [None, -1, -0.5, 0, 0.5, 1]  # bits 0-2: código 1..6; 0 = no preguntada
CORE_BIT = 8                         # bit 3: salió como núcleo en esa partida
CORE_WEIGHT = 3                      # igual que CORE_WEIGHT en src/engine/selection.ts
MIN_COVERAGE = 0.5


def load(test):
    axes = json.load(open(f'{ROOT}/src/data/{test}/axes.json'))['axes']
    questions = json.load(open(f'{ROOT}/src/data/{test}/questions.json'))['questions']
    return [a['id'] for a in axes], questions


def decode(hex_str, questions):
    """Devuelve {id: respuesta} de las afirmaciones preguntadas y el conjunto de las del núcleo."""
    raw = bytes.fromhex(hex_str.removeprefix('\\x'))
    asked, core = {}, set()
    for i, q in enumerate(questions):
        if i // 2 >= len(raw):
            break
        c = raw[i // 2] >> 4 if i % 2 == 0 else raw[i // 2] & 15
        if c & 7:
            asked[q['id']] = VALUES[(c & 7) - 1]
            if c & CORE_BIT:
                core.add(q['id'])
    return asked, core


def scores(axes, questions, asked, core):
    """Igual que scoreAxes en src/engine/scoring.ts: el núcleo pesa más solo en su eje principal."""
    num = dict.fromkeys(axes, 0.0); den = dict.fromkeys(axes, 0.0); tot = dict.fromkeys(axes, 0.0)
    for q in questions:
        if q['id'] not in asked:
            continue
        r = asked[q['id']]
        for axis, e in q['effects'].items():
            w = CORE_WEIGHT if q['id'] in core and axis == q['primaryAxis'] else 1
            tot[axis] += w * abs(e)
            if r is not None:
                num[axis] += w * r * e
                den[axis] += w * abs(e)
    # math.floor(x + 0.5) redondea como Math.round de JavaScript (round de Python va al par).
    return {a: math.floor(100 * num[a] / den[a] + 0.5) if den[a] and den[a] / tot[a] >= MIN_COVERAGE else ''
            for a in axes}


def fetch_rows():
    url, key = os.environ.get('SUPABASE_URL'), os.environ.get('SUPABASE_SECRET_KEY')
    if not url or not key:
        sys.exit('Faltan SUPABASE_URL y SUPABASE_SECRET_KEY (o usá --csv archivo).')
    headers = {'apikey': key}
    if key.startswith('eyJ'):
        headers['Authorization'] = f'Bearer {key}'
    last, rows = 0, []
    while True:
        req = urllib.request.Request(
            f"{url.rstrip('/')}/rest/v1/respuestas?id=gt.{last}&order=id&limit=1000", headers=headers)
        page = json.load(urllib.request.urlopen(req))
        if not page:
            return rows
        rows += page
        last = page[-1]['id']


def main():
    if '--csv' in sys.argv:
        rows = list(csv.DictReader(open(sys.argv[sys.argv.index('--csv') + 1], encoding='utf-8')))
    else:
        rows = fetch_rows()
    for code, test in TESTS.items():
        axes, questions = load(test)
        mine = [r for r in rows if int(r['test']) == code]
        out = f'respuestas_{test}.csv'
        with open(out, 'w', newline='', encoding='utf-8') as f:
            w = csv.writer(f)
            w.writerow(['id', 'fecha', 'variante', 'edad', 'genero', 'educacion', 'segundos',
                        *axes, *(q['id'] for q in questions)])
            for r in mine:
                asked, core = decode(r['respuestas'], questions)
                s = scores(axes, questions, asked, core)
                # Celda vacía = no le tocó; NS = "No sé"; un * marca las del núcleo.
                answers = ['' if q['id'] not in asked else
                           ('NS' if asked[q['id']] is None else str(asked[q['id']])) + ('*' if q['id'] in core else '')
                           for q in questions]
                w.writerow([r['id'], r['fecha'], VARIANTS[int(r['variante'])], AGE[int(r['edad'])],
                            GENDER[int(r['genero'])], EDUCATION[int(r['educacion'])], r['segundos'],
                            *(s[a] for a in axes), *answers])
        print(f'{out}: {len(mine)} filas')


if __name__ == '__main__':
    main()
