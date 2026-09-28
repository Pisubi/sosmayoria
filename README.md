# Brújula — test político de Argentina y el mundo

Test de posicionamiento político con ejes propios de alcance internacional.
Toma la idea general de los tests de ejes múltiples, pero los ejes, las
afirmaciones y el sistema de comparación son propios.

## Qué hace

- Un cuestionario de afirmaciones (escala de 1 a 5) organizado en **11 ejes**:
  Estado y mercado, Impuestos y gasto, Comercio exterior, Trabajo, Seguridad,
  Valores, Religión y Estado, Migración, País y mundo, Ambiente y Poder.
- Dos versiones: **Rápida** (22 afirmaciones) y **Completa** (44 afirmaciones).
- Un resultado con:
  - Un gráfico de radar y el detalle eje por eje.
  - La **figura política** más cercana (21 figuras de Argentina, EE.UU., Brasil,
    Chile, México, España, Italia, Francia y El Salvador).
  - El **partido argentino** y el **partido del resto del mundo** más cercanos
    (21 partidos y espacios). Alguien puede parecerse más al Partido Demócrata o
    al Republicano que a cualquier partido local.

La afinidad se calcula por distancia media cuadrática entre tu posición y la
posición estimada de cada partido o figura en cada eje. Esas posiciones son
estimaciones editoriales y están en `src/data/references.ts` para revisarlas y
calibrarlas.

## Stack

Vite + React + TypeScript + Tailwind CSS v4 + Recharts.

## Estética

Sigue el manual de marca de Pisubí: Montserrat, paleta azul Pisubí `#1E3A47`,
naranja señal `#C8602A` (solo para líneas, índices, cifras y un énfasis),
arena `#CAC4B0`, marfil `#F0ECE3`, azul noche `#0F2230` y azul dato `#3D6B84`
para series. Los tokens están en `src/index.css`.

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # build de producción (tsc -b && vite build)
npm run lint     # oxlint
npm run preview  # sirve el build de producción
```

## Estructura

- `src/data/axes.ts` — los 11 ejes y sus polos.
- `src/data/questions.ts` — las 44 afirmaciones (4 por eje, 2 hacia cada polo).
- `src/data/references.ts` — partidos y figuras con su posición estimada por eje.
- `src/lib/scoring.ts` — respuestas → puntaje de −100 a +100 por eje.
- `src/lib/matching.ts` — cálculo de afinidad con partidos y figuras.
- `src/lib/modes.ts` — selección de afirmaciones para la versión rápida o completa.
- `src/components/` — pantallas de inicio, test y resultados.
