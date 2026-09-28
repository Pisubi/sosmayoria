# Brújula — test político multidimensional

Dos tests de posicionamiento político, uno argentino y otro internacional, con 12
ejes cada uno. El resultado no encasilla: muestra la posición en cada eje y en qué
coincide y en qué se diferencia la persona de ideologías, tradiciones, figuras y
partidos.

Implementa la especificación técnica "Political compass argentino e internacional":
ítems multi-eje balanceados, opción "No sé", cobertura por eje, catálogos
separados, identidad peronista reportada aparte, planos 2D, enlace para compartir y tests de recall.

## Los tests

| | Argentina | Internacional |
|---|---|---|
| Ejes | Economía, Comercio, Macroeconomía, Trabajo, Valores, Instituciones, Estilo (pluralista/populista), Seguridad, Memoria, Mundo, Territorio + Identidad (aparte) | Economía, Comercio, Libertades, Democracia, Valores, Religión, Nación, Guerra y paz, Migración, Ambiente, Estilo, Tecnología |
| Afirmaciones | 182 (72 corta · 116 completa · 182 a fondo) | 192 (72 corta · 120 completa · 192 a fondo) |
| Catálogos | Tradiciones y espacios · Figuras históricas · Figuras actuales | Ideologías · Figuras históricas · Figuras actuales · Partidos |
| Perfiles | 149 | 347 |

## Cómo se calcula

- Respuestas de −1 a +1 (±0,5 intermedios); "No sé" se excluye.
- `puntaje_eje = 100 · Σ(r·e) / Σ|e|` sobre ítems respondidos; con menos del 50% de
  cobertura el eje queda indeterminado.
- Cercanía: `100 · (1 − d/200)`, con `d` la distancia media cuadrática en los ejes
  con dato en ambos. Menos del 60% de ejes comparados = comparación parcial.
- Los catálogos se rankean por separado. Las figuras de dictaduras y
  totalitarismos se incluyen como cualquier otro perfil, con descripciones que
  mencionan sus crímenes documentados. Por decisión editorial quedan excluidos
  Adolf Hitler, el nazismo y la cúpula de la última dictadura argentina.

Las coordenadas de los perfiles son **semillas editoriales**, con nivel de
confianza y fundamento, basadas en la especificación, el "Atlas multidimensional",
el informe "Brújula política histórica y contemporánea" y una ronda de
investigación asistida. Deben calibrarse con codificadores (ver la página de
metodología). El test no está validado psicométricamente.

## Datos

JSON versionados en `src/data/{ar,intl}/{axes,questions,profiles}.json`:

- `questions.json`: `effects` es un peso firmado por eje (principal ±1,
  secundarios ±0,2–0,4); `variants` indica si el ítem va en la versión corta.
- `profiles.json`: `coords` de −100 a +100 o `null`, `confidence`, `basis` y
  `contextNote`.
- `images.json`: fotos, logos y símbolos de Wikimedia Commons con autor y
  licencia. Se generan con `python3 scripts/fetch_images.py` (requiere acceso de
  red a los dominios de Wikimedia).

## Stack

Vite + React + TypeScript + Tailwind CSS v4, sin backend. Estética según el
manual de marca de Pisubí (tokens en `src/index.css`).

```bash
npm install
npm run dev      # servidor de desarrollo
npm test         # Vitest: integridad, balance, puntaje y recall
npm run build    # build de producción
npm run lint     # oxlint
```

## Estructura

- `src/engine/` — `scoring`, `matching`, `selection` (versiones y orden aleatorio
  con semilla) y `share` (resultado en la URL).
- `src/components/` — inicio, test, metodología y `results/` (barras por eje,
  planos 2D, rankings por catálogo, identidad, referencias sensibles).
- `src/lib/progress.ts` — progreso guardado solo en el navegador.
- `tests/` — tests de la especificación: neutral = 0, todo de acuerdo ≈ 0,
  balance de polos, rangos, IDs y recall ≥ 80% con ruido σ = 0,25.
