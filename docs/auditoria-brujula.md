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

### 1. Sesgo de aquiescencia: las afirmaciones quedaron casi todas de un lado (atenuado)

Al sacar de la brújula las cartas de consenso (ayuda a los pobres, Estado dueño de áreas
estratégicas, obra pública, controles de precios, matrimonio igualitario, eutanasia…) se fueron
casi todas las afirmaciones cuyo "de acuerdo" empuja hacia el Estado o lo progresista. En esta
rama se sumaron 15 cartas nuevas, todas verificadas contra su fuente: 11 progresistas en valores
y 4 del lado del Estado en economía.

| Afirmaciones con eje | "De acuerdo" empuja a + | "De acuerdo" empuja a − (antes → ahora) |
|---|---|---|
| Economía | 31 (mercado) | 3 → **7** (Estado) |
| Valores | 17 (tradicional) | 7 → **18** (progresista) |
| Autoridad | 9 (orden) | 2 (garantías) |

`sortear` equilibra dentro de cada ronda, pero como prioriza las cartas no vistas, las del lado
escaso se agotan en las primeras rondas. Para quien contesta "de acuerdo" a casi todo (un sesgo
real y frecuente en encuestas), ronda larga, 10.000 secuencias:

| Todo de acuerdo | 1 ronda | 3 rondas | 5 rondas |
|---|---|---|---|
| Economía, antes → ahora | +0,12 → +0,20 | +0,41 → +0,32 | **+0,92 → +0,69** |
| Valores, antes → ahora | +0,02 → +0,03 | +0,48 → +0,43 | **+0,88 → +0,52** |
| Todo en desacuerdo, valores | +0,13 → +0,22 | −0,11 → +0,03 | −0,43 → **+0,01** |

En valores las cartas ya están equilibradas en cantidad, pero el sesgo sigue. La causa es que casi
todas las afirmaciones progresistas las acepta la mayoría (55–75%) y las tradicionales, una
minoría (20–46%). Decir "de acuerdo" con una afirmación minoritaria mueve mucho más que decirlo
con una mayoritaria. Para terminar de corregirlo hacen falta **afirmaciones progresistas que
acepte una minoría** (como "Hay que legalizar la marihuana", 37%) y **más afirmaciones del lado
del Estado**: quedan 31 contra 7. Otra salida es pasar a duelo (esto o aquello) algunas de las 31
afirmaciones de mercado.

Un efecto secundario: como las cartas progresistas nuevas las acepta la mayoría, quien elige
siempre lo mayoritario queda ahora más progresista que antes (ver el punto 3).

**Lo que no se encontró**: encuestas nacionales recientes, con números publicados, sobre aborto
(posteriores a la carta actual), ESI obligatoria, Ley Micaela, cupo y paridad, lenguaje
inclusivo, despenalización del autocultivo, retenciones, alquileres, control de precios de
alimentos, aranceles, CONICET o Banco Nación redactadas del lado del Estado. Se descartaron
también las de consenso (78% o más), las autoseleccionadas, las que solo encuestaban a jóvenes y
dos con números confirmados pero sin ficha técnica publicada: paritarias y universidad gratuita
(Alaska + Trespuntozero, 2025).

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

Quien elige siempre lo mayoritario no queda en 0: en valores caía en −0,15 a −0,18 (un tercio de
las veces "progresista"), y con las cartas nuevas cae en −0,31 a −0,40 (del 58% al 85% de las
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
- 15 cartas nuevas (`cartas-1.2.0`), al final del banco. Valores (de acuerdo = progresista): la
  desigualdad de género sigue siendo un problema; más mujeres en puestos de responsabilidad; que la
  mujer gane más no trae problemas; baños, documentos y cobertura de la transición para personas
  trans; el cambio climático por la actividad humana; no cerrarle las fronteras a los refugiados y
  su aporte; vecinos que estuvieron presos; el Estado no debería financiar religiones. Economía
  (de acuerdo = Estado): paralizar la obra pública es criminal; más obras contra desastres; un
  Estado con rol activo para reducir las diferencias económicas; aprobar el financiamiento
  universitario de 2025. Tras sumarlas, los perfiles marcados siguen en su lado en el 95–100% de
  los casos (10% de ruido, una ronda larga) y la calibración contra las encuestas no cambia.
