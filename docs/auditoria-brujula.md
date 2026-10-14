# Auditoría de la brújula (octubre 2026, sobre `produccion`)

Revisión del motor y del banco de `produccion` (151 cartas activas, 101 con eje) con unos
**3 millones de partidas simuladas** sobre el motor real (`sortear` + `brujula`). El simulador es
`scripts/simular-brujula.ts`: `npm run simular -- 20000 1,3,5` repite todo.

## Cómo se simuló

Cada secuencia sortea rondas reales, con las cartas vistas acumulándose como en el teléfono, y las
juega con 33 jugadores sintéticos. Se corrieron 20.000 secuencias para 1, 3 y 5 rondas:

1. **Población del modelo**: posición real θ ~ N(0, 1) en cada escala, respuestas según el mismo
   modelo de la brújula (con lapso). Mide cuánto recupera la brújula la posición verdadera.
2. **Siete perfiles definidos solo por su lugar en las escalas** (`tests/arquetipos.ts`), no por
   partido. Por ejemplo "Estado, progresista, garantías" o "mercado, progresista, garantías".
   La respuesta de cada uno en cada carta se decidió a mano, **sin usar el modelo**. Se jugaron
   con 0%, 10% y 20% de respuestas al revés y 3% de "prefiero no decir".
3. **Estilos de respuesta**: siempre con la mayoría, siempre con la minoría, todo de acuerdo, todo
   en desacuerdo, al azar, siempre A, y el perfil perfectamente coherente en el promedio (θ = 0).

## Lo que funciona

- **Los perfiles marcados quedan donde corresponden**, sin cruzar nunca al lado opuesto en
  economía ni en valores. Sin errores, el 100% cae en su cuadrante desde la primera ronda. Con 10%
  de respuestas al revés, el 92–99% en una ronda y el 99–100% a las tres. Con 20%, el 79–93% en una
  ronda y el 90–99% a las tres.
- **Calibración**: una población que responde como el país promedia 0 en las tres escalas. La
  proporción que elige cada opción coincide con la encuesta (diferencia máxima: 2 puntos).
- **Se afina con las rondas**: la correlación entre posición real y estimada es 0,74 / 0,70 en
  economía / valores con una ronda, 0,87 / 0,84 con tres y 0,91 / 0,87 con cinco.
- El lapso y el nuevo sorteo resolvieron dos cosas de la auditoría anterior: el techo que ponía
  una sola respuesta "fuera de libreto" y el doble peso de la carta de inseguridad.

## Problemas

### 1. Sesgo de aquiescencia: las afirmaciones quedaron casi todas de un lado (grave)

Al sacar de la brújula las cartas de consenso (ayuda a los pobres, Estado dueño de áreas
estratégicas, obra pública, controles de precios, matrimonio igualitario, eutanasia…) se fueron
casi todas las afirmaciones cuyo "de acuerdo" empuja hacia el Estado o lo progresista:

| Afirmaciones con eje | "De acuerdo" empuja a + | "De acuerdo" empuja a − |
|---|---|---|
| Economía | 31 (mercado) | **3** (Estado) |
| Valores | 17 (tradicional) | 7 (progresista) |
| Autoridad | 9 (orden) | 2 (garantías) |

`sortear` equilibra dentro de cada ronda, pero como prioriza las cartas no vistas, las pocas del
lado del Estado se agotan en la primera ronda. Resultado, para quien contesta "de acuerdo" a casi
todo (un sesgo real y frecuente en encuestas):

| Todo de acuerdo | 1 ronda | 3 rondas | 5 rondas |
|---|---|---|---|
| Economía | +0,12 | +0,41 (72% "más mercado") | **+0,92 (100%)** |
| Valores | +0,02 | +0,48 (89% "tradicional") | **+0,88 (100%)** |

Con "todo en desacuerdo" pasa lo inverso: −0,79 en economía a las cinco rondas, el 100% "más
Estado". **Propuesta**: sumar 10 a 15 afirmaciones del lado del Estado y 6 a 8 del lado
progresista, que no sean de consenso (entre 30% y 70% de acuerdo). Por ejemplo: "El Estado debería
fijar el precio de los alimentos básicos", "Hay que volver a cobrar el impuesto a la riqueza",
"Las universidades públicas necesitan más presupuesto", "La ESI tiene que ser obligatoria en todas
las escuelas", "Hay que ampliar la ley de cupo laboral trans". También sirve pasar a duelo (esto o
aquello) algunas de las 31 afirmaciones de mercado. Mientras tanto, se puede hacer que `sortear`
repita una carta vista del lado escaso antes que romper el equilibrio.

### 2. El centro era muy angosto (corregido)

La posición es un percentil: con `CENTRO = 0,15`, solo el 15% del país (del percentil 42,5 al 57,5)
quedaba "en el centro", y una sola carta mueve la escala más que eso en la primera ronda. Se subió
a **0,25** (del percentil 37,5 al 62,5):

| | 0,15 | 0,25 |
|---|---|---|
| Población en el centro, por escala | 11–13% | 20–23% |
| Perfil "mercado moderado, centro en valores": valores en el centro (3 rondas) | 27% | 55% |
| Perfil "centro en economía": economía en el centro (3 rondas) | 7% | 25% |
| Siempre con la mayoría: valores en el centro (3 rondas) | 44% | 67% |
| Perfiles marcados en su lado (1 ronda, 10% de ruido) | 94–99% | 92–99% |

Los perfiles marcados pierden como mucho 2 puntos.

### 3. Elegir siempre lo de la mayoría no es el promedio

Quien elige siempre lo mayoritario no queda en 0: en valores cae en −0,15 a −0,18 (un tercio de las
veces "progresista"). En economía depende de las cartas que le toquen y llega hasta +0,66. Un
perfil perfectamente coherente en θ = 0 da −0,41 en valores. No es un error del modelo: el argentino
promedio a veces elige el lado minoritario, que en valores suele ser el tradicional extremo (pena
de muerte, derogar el matrimonio igualitario). Pero choca con el "con la mayoría en 25 de 25". Por
eso el test no exige que los perfiles "de centro" caigan en el centro. Hay dos salidas: explicarlo
en "Cómo funciona" ("el centro es el promedio del país, no la respuesta mayoritaria") o anclar el
centro en el patrón mayoritario de esas mismas cartas.

### 4. Autoridad se calcula con muy pocas cartas

Sin cupo, una ronda trae pocas cartas de autoridad. La correlación es 0,57 con una ronda, y el
perfil "Estado, tradicional, orden" cae del lado opuesto en algunas secuencias. No se muestra, así
que hoy no molesta; si vuelve a mostrarse, necesita su cupo.

### 5. Quien responde al azar

Con el banco nuevo queda bien centrado en economía (+0,01) y algo tradicional en valores (+0,12 a
+0,17, el 43–46% "tradicional"). **Propuesta**: medir qué tan coherente es cada persona con su
propia posición y, si es baja, decir "tus respuestas son mixtas" en vez de un cuadrante.

## Referencias de partidos en la brújula

Los perfiles del test son combinaciones de las escalas, no partidos. Si se quiere mostrar dónde
cae cada espacio político, lo más sólido es no inventarlo: con los datos de Supabase se puede
calcular la brújula promedio de quienes aprueban y de quienes desaprueban al gobierno, que es la
única carta partidaria. Así se dibujan dos puntos de referencia medidos, no supuestos.

## Otras mejoras

- **Jugabilidad**: permitir corregir un toque equivocado durante los 1,4 s del resultado. Un modo
  "¿qué eligió la mayoría?" con el porcentaje real al revelar. Una carta del día con racha.
- **"Jugar otra ronda" olvida los temas elegidos** (`jugar([])` en `App.tsx`).
- **Texto para compartir**: dice "en X de Y temas", pero cuenta cartas.
- **El inicio no menciona la brújula**, que es lo más compartible.
- **Contenido**: varias cartas sin eje son viejas: creencias de 2019, mate de 2017 (regional),
  Malvinas de 2021, lectura y cine de 2022. Historia sigue con muy pocas cartas.
- **Sin tests de interfaz**: un Playwright de una ronda completa cubriría guardar y retomar.

## Partida corta

Desde esta versión la partida por defecto es corta: 15 cartas, con el cupo de cada escala
proporcional al de la larga (5 de economía y 4 de valores, núcleo incluidas, más 6 que no cuentan
para la brújula). En 10.000 secuencias, con 10% de respuestas al revés, los perfiles marcados caen
en su lado en el 89–96% de los casos después de una ronda corta, contra 93–99% con una larga. A las
tres rondas cortas, el 97–100%. La correlación entre posición real y estimada en una ronda baja de
0,74 / 0,70 a 0,66 / 0,64 (economía / valores), y la brújula sale con precisión "aproximada":
alcanza para un primer resultado y se afina jugando más.

## Cambios

- `CENTRO` de 0,15 a 0,25 (`src/engine/juego.ts`).
- `tests/arquetipos.ts` y `tests/arquetipos.test.ts`: siete perfiles definidos por las tres escalas,
  con su respuesta en las 101 cartas con eje. El test exige que en economía y valores cada perfil
  marcado caiga en su lado en el 95% de 60 secuencias de tres rondas, y nunca en el opuesto. Además
  falla si se agrega una carta con eje sin la respuesta de cada perfil.
- `scripts/simular-brujula.ts` y `npm run simular` (el tercer argumento es el largo de la ronda).
- Partida corta (15 cartas) por defecto y larga (25) a elección, con cupo proporcional.
