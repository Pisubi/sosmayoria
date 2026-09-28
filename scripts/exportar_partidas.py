"""Descarga las partidas guardadas en Supabase y arma un CSV largo: una fila por carta jugada.

Uso:
  SUPABASE_URL=https://xxxx.supabase.co SUPABASE_SECRET_KEY=sb_secret_xxxx python3 scripts/exportar_partidas.py
  python3 scripts/exportar_partidas.py --csv partidas_rows.csv   # CSV bajado del panel

Genera jugadas.csv en la carpeta actual. La clave secreta lee todo: no la subas al repo ni la
pongas en la app. Las filas con bytes inválidos (cualquiera con la clave pública puede insertar)
se omiten y se informan.
"""
import csv, json, os, sys, urllib.request

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
# Deben coincidir con src/lib/participant.ts.
AGE = {0: '', 1: '16-17', 2: '18-24', 3: '25-34', 4: '35-44', 5: '45-54', 6: '55-64', 7: '65+'}
GENDER = {0: '', 1: 'Mujer', 2: 'Varón', 3: 'No binario u otra'}
EDUCATION = {0: '', 1: 'Sin estudios o primario incompleto', 2: 'Primario completo',
             3: 'Secundario incompleto', 4: 'Secundario completo',
             5: 'Terciario o universitario incompleto', 6: 'Terciario o universitario completo',
             7: 'Posgrado'}
ELECCION = {1: 'A', 2: 'B', 3: 'no dice'}


def decodificar(hex_str, cartas):
    """Lista de (carta, elección, predicción), o None si la fila no es válida (ver src/engine/codificacion.ts)."""
    try:
        raw = bytes.fromhex(hex_str.removeprefix('\\x'))
    except ValueError:
        return None
    if not raw or len(raw) % 3:
        return None
    out = []
    for k in range(0, len(raw), 3):
        e, idx, p = raw[k] >> 6, ((raw[k] & 63) << 8) | raw[k + 1], raw[k + 2]
        if e == 0 or idx >= len(cartas) or p > 100:
            return None
        out.append((cartas[idx], ELECCION[e], p))
    return out


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
            f"{url.rstrip('/')}/rest/v1/partidas?id=gt.{last}&order=id&limit=1000", headers=headers)
        page = json.load(urllib.request.urlopen(req))
        if not page:
            return rows
        rows += page
        last = page[-1]['id']


def main():
    cartas = json.load(open(f'{ROOT}/src/data/cartas.json'))['cartas']
    if '--csv' in sys.argv:
        rows = list(csv.DictReader(open(sys.argv[sys.argv.index('--csv') + 1], encoding='utf-8')))
    else:
        rows = fetch_rows()
    invalid = n = 0
    with open('jugadas.csv', 'w', newline='', encoding='utf-8') as f:
        w = csv.writer(f)
        w.writerow(['partida', 'fecha', 'edad', 'genero', 'educacion', 'segundos', 'promedio',
                    'carta', 'pregunta', 'opcion_a', 'opcion_b', 'eleccion', 'prediccion_pct_a', 'real_pct_a'])
        for r in rows:
            jugadas = decodificar(r['jugadas'], cartas)
            if jugadas is None:
                invalid += 1
                continue
            for c, e, p in jugadas:
                ref = c['ref']
                w.writerow([r['id'], r['fecha'], AGE.get(int(r['edad']), ''), GENDER.get(int(r['genero']), ''),
                            EDUCATION.get(int(r['educacion']), ''), r['segundos'], r['promedio'],
                            c['id'], c['pregunta'], c['a']['texto'], c['b']['texto'],
                            c['a']['texto'] if e == 'A' else c['b']['texto'] if e == 'B' else '',
                            p, round(100 * ref['a'] / (ref['a'] + ref['b']), 1)])
                n += 1
    print(f'jugadas.csv: {n} jugadas de {len(rows) - invalid} partidas' + (f' ({invalid} inválidas omitidas)' if invalid else ''))


if __name__ == '__main__':
    main()
