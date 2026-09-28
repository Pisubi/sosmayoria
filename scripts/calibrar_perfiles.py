"""Calcula las posiciones de los perfiles a partir de sus respuestas al test.

Cada perfil (figura, partido o ideología) respondió todas las afirmaciones activas del banco
como lo haría, con evidencia (ver data/calibracion/<test>.json). Su posición por tema se
calcula con la misma fórmula que la de quien juega (scoreAxes, todas con peso 1), así perfiles
y jugadores quedan en la misma escala. La semilla editorial anterior queda guardada al lado,
para auditar las diferencias.

Uso: python3 scripts/calibrar_perfiles.py
"""
import json, os

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
MIN_COVERAGE = 0.5


def measure(questions, axes, answers):
    num = dict.fromkeys(axes, 0); den = dict.fromkeys(axes, 0); tot = dict.fromkeys(axes, 0)
    for q in questions:
        v = answers.get(q['id'])
        for axis, effect in q['effects'].items():
            if axis not in tot:
                continue
            e = round(effect * 10)
            tot[axis] += abs(e) * 2
            if v is not None:
                num[axis] += v * e  # v va de −2 a 2: ya es la respuesta ×2
                den[axis] += abs(e) * 2
    return {a: (round(100 * num[a] / den[a]) if den[a] and den[a] >= MIN_COVERAGE * tot[a] else None) for a in axes}


def main():
    for test in ('ar', 'intl'):
        path = f'{ROOT}/data/calibracion/{test}.json'
        if not os.path.exists(path):
            continue
        calib = json.load(open(path))
        axes = [a['id'] for a in json.load(open(f'{ROOT}/src/data/{test}/axes.json'))['axes']]
        questions = [q for q in json.load(open(f'{ROOT}/src/data/{test}/questions.json'))['questions'] if not q.get('retired')]
        pf = f'{ROOT}/src/data/{test}/profiles.json'
        data = json.load(open(pf))
        measured = {pid: measure(questions, axes, e['respuestas']) for pid, e in calib['perfiles'].items()}
        # Donde un perfil no se pudo medir (sobre todo figuras del siglo XIX, sin equivalente de
        # época para muchas afirmaciones) se usa su semilla editorial llevada a la escala medida:
        # por tema, el factor que mejor ajusta lo medido a la semilla en los perfiles que tienen ambos.
        factor = {}
        for a in axes:
            pairs = [(m[a], e['semilla'][a]) for pid, e in calib['perfiles'].items()
                     if (m := measured[pid])[a] is not None and e.get('semilla') and e['semilla'].get(a) is not None]
            ss = sum(x * x for _, x in pairs)
            factor[a] = sum(y * x for y, x in pairs) / ss if ss else 1
        done = fallback = 0
        for p in data['profiles']:
            entry = calib['perfiles'].get(p['id'])
            if not entry:
                continue
            coords = measured[p['id']]
            seed = entry.get('semilla') or {}
            for a in axes:
                if coords[a] is None and seed.get(a) is not None:
                    coords[a] = max(-100, min(100, round(seed[a] * factor[a])))
                    fallback += 1
            p['coords'] = coords
            p['method'] = 'respuestas'
            done += 1
        print(test, 'factor semilla→medido por tema:', {a: round(v, 2) for a, v in factor.items()}, '·', fallback, 'valores de semilla')
        with open(pf, 'w') as fh:
            json.dump(data, fh, ensure_ascii=False, indent=1); fh.write('\n')
        print(f'{test}: {done} de {len(data["profiles"])} perfiles calculados desde sus respuestas')


if __name__ == '__main__':
    main()
