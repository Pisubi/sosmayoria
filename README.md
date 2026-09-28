# Brújula — test político

Dos tests de posicionamiento político con ejes propios. Toman la idea general de
los tests de ejes múltiples, pero los ejes, las afirmaciones y el sistema de
comparación son propios.

## Los dos tests

| | Internacional | Argentina |
|---|---|---|
| Ejes | 12 universales: Estado y mercado, impuestos, comercio, seguridad, valores, religión, migración, nación y mundo, ambiente, poder, guerra y paz, cambio | 12 locales: Estado y mercado, gasto público, comercio, moneda, Nación y provincias, trabajo, seguridad, memoria, sociedad, campo y recursos, política exterior, peronismo |
| Afirmaciones | 96 (8 por eje) | 96 (8 por eje) |
| Figuras | 55 históricas y actuales de todo el mundo, incluidas argentinas (de Stalin, Mao o Churchill a Chávez, Perón, Trump o Milei) | 29 argentinas, de Yrigoyen y Perón a Milei y Bregman |
| Partidos | 23 actuales (7 argentinos y 16 del mundo) | 8 argentinos actuales |

Cada test tiene tres versiones: **rápida** (2 afirmaciones por eje), **completa**
(4) y **a fondo** (8). Las afirmaciones se intercalan entre ejes y el progreso se
guarda en el navegador para poder retomar.

El resultado muestra el mapa de ejes, la figura histórica y la actual más
cercanas, y el partido más cercano (en el internacional, uno argentino y uno del
resto del mundo), con rankings completos.

La afinidad se calcula por distancia media cuadrática entre tu posición y la
posición estimada de cada figura o partido. En figuras históricas se omiten los
ejes que no aplican a su época. Esas posiciones son estimaciones editoriales y
están en `src/data/internacional.ts` y `src/data/argentina.ts` para revisarlas y
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

- `src/data/internacional.ts` y `src/data/argentina.ts` — ejes, afirmaciones,
  figuras y partidos de cada test.
- `src/data/build.ts` — helpers para armar afirmaciones y referencias.
- `src/lib/modes.ts` — versiones y orden intercalado de las afirmaciones.
- `src/lib/scoring.ts` — respuestas → puntaje de −100 a +100 por eje.
- `src/lib/matching.ts` — afinidad con figuras y partidos.
- `src/lib/progress.ts` — guardado del progreso en el navegador.
- `src/components/` — pantallas de inicio, test y resultados.
