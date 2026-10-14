# Auditoría de La Mayoría y de su brújula política (octubre 2026)

Revisión del código, del banco de cartas y del modelo de la brújula, con unos **4 millones de
partidas simuladas** sobre el motor real (`sortear` + `brujula`, con las 108 cartas activas).
El simulador está en `scripts/simular-brujula.ts` (`npm run simular -- 40000 1,3,5`).

## Cómo se simuló

Cada secuencia sortea rondas reales (con las vistas acumulándose, como en el teléfono) y las juega
con 33 jugadores sintéticos. Se corrieron 40.000 secuencias × 1, 3 y 5 rondas:

1. **Población del modelo**: una persona con posición real θ ~ N(0, 1) en cada escala que responde
   según el modelo logístico. Sirve para medir cuánto recupera la brújula la posición verdadera.
2. **Perfiles perfectamente coherentes (Guttman)**: θ fijo en −2, −1, 0, 1 y 2, siempre eligiendo
   el lado más probable.
3. **Siete arquetipos "conscientes"** (`tests/arquetipos.ts`), con respuestas decididas carta por
   carta según la postura típica, **sin usar el modelo**: libertario mileísta, kirchnerista,
   izquierda trotskista, centroderecha PRO, peronista conservador, radical progresista y liberal
   en lo económico y lo civil. Cada uno con 0%, 10% y 20% de respuestas al revés (distracción,
   matices) y 3% de "prefiero no decir".
4. **Estilos de respuesta**: siempre con la mayoría, siempre con la minoría, todo de acuerdo, todo
   en desacuerdo, al azar y siempre A.

## Resultado: ¿el perfil coincide con las respuestas?

**Sí, en lo grueso.** Los siete arquetipos quedan en el cuadrante esperado, sin cruzar nunca al
lado opuesto cuando responden con coherencia:

| Arquetipo (sin ruido, 1 ronda) | Economía | Valores | Autoridad |
|---|---|---|---|
| Libertario mileísta | +1,00 mercado (100%) | +0,74 tradicional (100%) | +0,87 orden (100%) |
| Kirchnerista | −0,94 Estado (100%) | −0,73 progresista (100%) | −0,75 garantías (99%) |
| Izquierda trotskista | −0,94 Estado (100%) | −0,61 progresista (99%) | −0,87 garantías (100%) |
| Centroderecha PRO | +0,52 mercado (94%) | −0,14 centro | +0,53 orden (97%) |
| Peronista conservador | −0,59 Estado (100%) | +0,96 tradicional (100%) | +0,39 orden (89%) |
| Radical progresista | +0,10 centro | −0,52 progresista (96%) | −0,87 garantías (100%) |
| Liberal económico y civil | +0,91 mercado (100%) | −0,86 progresista (100%) | −0,70 garantías (97%) |

- Con **10% de respuestas al revés**, los arquetipos marcados siguen bien ubicados en el 76–99% de
  los casos en una ronda y en el 86–100% a las tres rondas. Con 20% el acierto cae a 60–95%: es
  esperable, alguien que contesta una de cada cinco al revés no tiene una posición clara.
- **Población del modelo**: la media queda en 0 (±0,02) en las tres escalas y la calibración es
  muy buena: la proporción que elige A en la simulación coincide con la encuesta (la mayor
  diferencia es 1,4 puntos). La correlación entre posición real y estimada es 0,75–0,80 con una
  ronda, 0,87–0,90 con tres y 0,89–0,93 con cinco. La brújula se afina con las rondas, como dice.
- **Una sola respuesta mueve mucho**: con una ronda (5–7 cartas por escala), dar vuelta una carta
  mueve la escala entre 0,2 (cartas de peso ½) y 0,43. Por eso "precisión aproximada" en la
  primera ronda está bien puesto, y conviene insistir en jugar más rondas.

## Problemas encontrados

### 1. El "centro" era más angosto que la precisión de la medición (corregido)

Con `CENTRO = 0,15`, un centrista perfectamente coherente casi nunca quedaba "en el centro":

- El **PRO en valores** (centro esperado) salía "progresista" en el 38% de las rondas.
- El **radical en economía** (centro esperado) salía "más mercado" en el 40%.
- Quien **siempre elige lo de la mayoría** salía "más Estado" en el 68% de los casos a las tres
  rondas y en el 100% a las cinco. Es incoherente con el "Pensás como la mayoría en 25 de 25" que
  aparece arriba.

La escala de la brújula va de −1 a 1 y una sola carta la mueve 0,3: un umbral de 0,15 es menor que
el error de una respuesta. **Se subió a `CENTRO = 0,25`.** Con eso, en la misma simulación:

| | Con 0,15 | Con 0,25 |
|---|---|---|
| PRO en valores, en el centro (3 rondas, 10% de ruido) | 70% | 90% |
| Radical en economía, en el centro (3 rondas, sin ruido) | 54% | 86% |
| Siempre con la mayoría: valores en el centro (1 ronda) | 43% | 70% |
| Siempre con la mayoría: economía "más Estado" (3 rondas) | 67% | 24% |
| Kirchnerista, libertario, izquierda, peronista conservador: lado correcto (1 ronda, 10% de ruido) | 76–99% | 64–98% |
| Ídem, 3 rondas, 10% de ruido | 90–100% | 79–100% |
| Población: en el centro en cada escala | 22% | 36% |

El costo es que los perfiles marcados pero con ruido quedan más seguido "en el centro" en la
primera ronda (el peor caso es el peronista conservador en autoridad: de 76% a 64%); sin ruido
casi no cambian (el kirchnerista en autoridad pasa de 99% a 91% en una ronda y sigue en 100% a
las tres) y con más rondas se recuperan. A cambio, los centristas dejan de quedar mal
etiquetados, que era el error más visible. Las cifras de la sección anterior son con el umbral
viejo. El nuevo test
`tests/arquetipos.test.ts` fija este comportamiento: cada arquetipo tiene que caer en su lado en
al menos el 85% de 60 secuencias de tres rondas y no puede cruzar nunca al lado opuesto.

### 2. Elegir siempre lo de la mayoría no es lo mismo que ser el promedio

Aun con el centro más ancho, quien elige siempre lo mayoritario queda en economía −0,19 (tres
rondas) y −0,24 (cinco). No es un error del modelo: el argentino promedio, carta por carta, elige
a veces el lado minoritario (y en economía el lado minoritario suele ser el de mercado: AFJP,
privatizaciones, jornada de 12 horas). Quien nunca lo hace es algo más estatista que el promedio.
Pero choca con la intuición del juego. Hay dos salidas posibles; queda a decisión de ustedes:

- **Explicarlo** en "Cómo funciona": "el centro es el promedio del país, no la respuesta
  mayoritaria en cada carta".
- **Anclar el centro en el patrón mayoritario** (restar la posición que tendría quien elige siempre
  lo de la mayoría con esas mismas cartas). Así "25 de 25" da siempre "Cerca del promedio", pero
  la población deja de promediar 0 (se corre +0,2 hacia mercado).

### 3. Sesgo de aquiescencia en autoridad (contenido)

En autoridad, 7 afirmaciones empujan hacia "orden" al decir "de acuerdo" y solo 2 hacia
"garantías". Quien contesta "de acuerdo" a todo sale **"más orden" en el 88–98%** de los casos
(tres a cinco rondas). En economía (9 contra 8) y valores (7 contra 8) el balance es bueno, y por
eso ahí el efecto es chico. **Propuesta**: sumar 4 o 5 afirmaciones de autoridad del lado de las
garantías, con encuesta publicada (por ejemplo: "La policía no debería poder detener sin orden
judicial", "Hay que garantizar el derecho a la protesta aunque corte calles", "Los presos tienen
que tener derecho a estudiar", "Está mal que el Estado espíe a periodistas").

### 4. Quien responde al azar sale "más mercado y tradicional"

Al azar, el 70–78% sale "más mercado" y el 64–72% "valores tradicionales" (tres a cinco rondas).
Es la contracara del modelo: en la mayoría de las cartas el lado de mercado y el tradicional son
los minoritarios, y elegirlos "mueve mucho". No afecta a quien responde en serio, pero un jugador
apurado o en broma recibe un perfil de derecha con confianza. **Propuesta**: medir la coherencia de
la persona (un índice de ajuste tipo *person-fit*: cuántas respuestas son improbables dada su
propia posición) y, si es baja, decir "tus respuestas son mixtas" en lugar de un cuadrante.

### 5. La carta núcleo de inseguridad mezcla dos escalas

"Endurecer las penas / Reducir la desigualdad" pesa 1 en autoridad y ½ en economía, y sale en
todas las rondas. Elegir "reducir la desigualdad" corre economía −0,17 en una ronda. El efecto es
mixto: sin el peso en economía, el peronista conservador queda mejor ubicado (−0,80 en vez de
−0,59), pero quien elige siempre lo de la mayoría queda más estatista. **Propuesta** (opcional):
dejarla solo en autoridad y compensar con una carta núcleo económica más.

### 6. Otros detalles del contenido

- **Fechas viejas en cartas sin eje**: las de creencias son de CEIL-CONICET 2019 (6 cartas), la del
  mate es de 2017 (regional), Malvinas de 2021 y lectura y cine de 2022. Conviene renovarlas o
  aclarar el año en la carta.
- **Temas flacos**: historia tiene 3 cartas activas (una núcleo) y vida cotidiana 5. Si alguien
  filtra por "Historia", la ronda queda casi vacía. Sumar cartas de historia y vida cotidiana
  mejora la variedad, o se puede esconder el filtro cuando un tema tiene menos de 10.
- **Cartas con potencial ideológico sin eje**: portar armas (11%), préstamo del FMI, relación con
  EE.UU. y elección de jueces. Las de armas y FMI podrían sumar a autoridad y economía, con peso ½.
- La carta "«El cambio climático es un invento del socialismo» (frase de Milei)" mide más
  alineamiento con el gobierno que valores. Peso ½ está bien, pero conviene vigilarla.
- El "fallo judicial político" empuja a "orden" a un kirchnerista que lo apoye por lawfare: la
  simulación muestra que no lo saca de "garantías", así que está bien que se quede.

## Mejoras técnicas

- **Deshacer un toque**: la carta pasa sola a los 1,4 s y no hay forma de corregir un toque
  equivocado. Un "cambiar" mientras se muestra el resultado evitaría ruido en la brújula y en los
  datos de Supabase.
- **"Jugar otra ronda" olvida los temas elegidos**: `onOtraRonda={() => jugar([])}` arranca
  siempre con todos los temas.
- **Texto para compartir**: dice "en X de Y temas", pero cuenta cartas.
- **La precisión** solo mira economía y valores; con pocas respuestas de autoridad, la escala de
  autoridad se muestra igual. Convendría ocultarla o aclarar "aproximada" en esa escala.
- **El inicio no menciona la brújula**, que es lo que más se comparte. Sumarla a "Tu resultado"
  probablemente suba la retención.
- **Sin pruebas de interfaz**: los tests cubren el motor y el banco, no el flujo de pantallas.
  Un test con Playwright de una ronda completa atraparía regresiones del guardado y del retomar.

## Mejoras de jugabilidad

- **Adivinar antes de opinar**: un modo opcional "¿qué eligió la mayoría?" después de opinar
  (con el porcentaje real al revelar) duplica el juego con las mismas cartas y hace que el dato de
  la encuesta sea el protagonista.
- **Mostrar el porcentaje** al revelar (aunque sea redondeado a 5) haría más memorable cada carta
  que el "con la mayoría" a secas. Hoy no se muestra por decisión de diseño; vale la pena probarlo.
- **Brújula comparada**: mostrar dónde caen los votantes de cada espacio (con los datos que ya
  junta Supabase y la carta de aprobación) le daría contexto a "más Estado".
- **Rachas y desafíos**: "carta del día", racha de días jugados y compartir una sola carta difícil.

## Cambios hechos en este commit

- `CENTRO` de 0,15 a 0,25 (`src/engine/juego.ts`).
- `tests/arquetipos.ts` y `tests/arquetipos.test.ts`: los siete arquetipos y el test que exige que
  cada uno caiga donde se espera, que toda carta con eje tenga respuesta de cada arquetipo y que
  quien elige siempre con la mayoría no salga de derecha ni de "más orden".
- `scripts/simular-brujula.ts` y `npm run simular`: el simulador, para repetir esta auditoría al
  sumar cartas.
