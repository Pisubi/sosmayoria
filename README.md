# Compass — 10 ejes de la política argentina

Test de posicionamiento político inspirado en la idea de "test de ejes múltiples",
adaptado desde cero a la política argentina: ejes, preguntas y arquetipos propios
(no una copia de ningún test existente).

## Qué hace

- Un cuestionario de afirmaciones (escala de 1 a 5) organizado en **10 ejes**:
  Economía, Fiscal, Comercio exterior, Moneda, Estado y provincias, Trabajo,
  Seguridad, Campo y energía, Agenda social, y Peronismo/Antiperonismo.
- Dos modos: **Rápido** (20 preguntas) y **Completo** (40 preguntas).
- Un resultado con:
  - Un gráfico de radar con tu posición en cada eje.
  - El detalle eje por eje (hacia qué polo te inclinás y cuánto).
  - Tu **arquetipo político argentino** más cercano (Libertario,
    Liberal-conservador, Centrista/radical, Peronismo federal,
    Nacional-popular o Izquierda), calculado por similitud de vectores contra
    perfiles prototípicos, más el resto de las afinidades ordenadas.

## Stack

Vite + React + TypeScript + Tailwind CSS v4 + Recharts.

## Desarrollo

```bash
npm install
npm run dev      # servidor de desarrollo
npm run build    # build de producción (tsc -b && vite build)
npm run lint      # oxlint
npm run preview  # sirve el build de producción
```

## Estructura

- `src/data/axes.ts` — definición de los 10 ejes (nombre, descripción, polos).
- `src/data/questions.ts` — las 40 afirmaciones del test (4 por eje).
- `src/data/archetypes.ts` — los arquetipos políticos y el cálculo de afinidad.
- `src/lib/scoring.ts` — cómo se traducen las respuestas en un puntaje por eje.
- `src/lib/modes.ts` — la selección de preguntas para el modo rápido/completo.
- `src/components/` — pantallas de intro, quiz y resultados.
