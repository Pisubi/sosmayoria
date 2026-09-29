# La Mayoría

¿Pensás como la mayoría de los argentinos? Un juego web sobre la opinión pública: en cada
carta elegís entre dos opciones (esto o aquello, de acuerdo o en desacuerdo) y al toque ves
si estás con la mayoría, según una encuesta publicada.

No es una encuesta, pero junta opinión: lo que elige cada persona se guarda de forma anónima
(si el despliegue tiene Supabase).

## Cómo se juega

- Rondas de 25 cartas sorteadas del banco (encuestas nacionales de la Argentina, o regionales
  amplias —AMBA, grandes ciudades, varias regiones— con al menos 500 casos), alternando temas (política, economía, sociedad, historia, cultura, vida
  cotidiana) y priorizando las que la persona todavía no vio.
- Cada carta: elegís A, B o "prefiero no decir" y aparece "Estás con la mayoría", "Estás en la
  minoría" o "Está parejo"; después pasa sola a la siguiente. No se muestran porcentajes.
- Una carta es pareja si la opción más elegida no supera el 50% por más de 3 puntos (entre
  quienes eligieron A o B): las encuestas tienen márgenes de error de 2 a 4 puntos.
- Al final: en cuántas cartas (con mayoría clara) pensás como la mayoría, un perfil (de "Sos la
  mayoría" a "Minoría intensa"), dónde sos minoría y cómo te va en cada tema.

## Cartas núcleo

Cinco cartas (`"nucleo": true`) salen en todas las rondas, en lugares al azar repartidos entre
las demás: Estado o mercado en el empleo, aborto legal, penas o desigualdad frente a la
inseguridad, juicios por la dictadura y aprobación del gobierno. Dan un perfil político de
cada partida para cruzar con el resto de las cartas (la exportación las trae como columnas).
La de aprobación es `"volatil": true`: hay que actualizar su dato con la última medición.

## Brújula política

Las cartas con `eje` ubican a quien juega en tres escalas: `economia` (`-` más Estado, `+` más
mercado), `valores` (`-` más progresistas, `+` más tradicionales) y `autoridad` (`-` más
garantías y libertades civiles, `+` más orden). El valor dice cuánto y hacia dónde empuja elegir
A (B empuja al revés): `±1` si la carta mide bien la escala, `±0.5` si es un indicador débil o
atado a un gobierno. La aprobación del gobierno no tiene eje: mide alineamiento, no ideología.

- **Relativa al país.** `brujula()` (en `src/engine/juego.ts`) usa un modelo de respuesta al
  ítem: la posición θ de cada escala sale de la media de la posterior, con una previa N(0, 1,5²),
  y la dificultad de cada carta se fija para que, con el país en θ ~ N(0, 1), la proporción que
  elige cada lado coincida con la encuesta. Elegir lo que eligió el 80% casi no mueve; elegir lo
  del 20% mueve mucho; rechazar una afirmación extrema dice poco. El centro es el argentino
  promedio.
- **Afirmaciones extremas** (menos del 25% de acuerdo, `esExtrema()`): como mucho una por escala
  en cada ronda, para que varias juntas no arrastren al centro a quien tiene posiciones firmes.
- **Cupo por ronda.** Cada ronda trae al menos `CUPO` cartas de cada escala (núcleo incluidas);
  el resto son cartas sin eje (fútbol, mate, creencias…), que no cuentan.
- **Se afina con cada ronda.** Las respuestas de todas las rondas quedan en el navegador
  (`mayoria:respuestas:v1`) y la brújula usa todas. No se envían ni van en la imagen para
  historias.
- **Cartas sobre medidas de un gobierno:** de 2025 en adelante y nombrándolo; las de 2024 se
  retiraron.

## Cartas parecidas

Las cartas de un mismo tema fino comparten `"grupos"` (religión, "¿Creés en…?", jubilaciones,
privatizaciones, reforma electoral, grieta, etc.): en una ronda sale como mucho una por grupo,
y las núcleo reservan el suyo. Una carta puede estar en más de un grupo. Las que eran casi
iguales a una núcleo se retiraron (`motivo_retiro`). Al agregar cartas, asignales grupo si se
parecen a otra; los tests verifican que ninguna ronda repita grupo.

## El dato real

Cada carta de `src/data/cartas.json` cita una encuesta publicada: encuestadora, fecha,
muestra, alcance y enlace, con los porcentajes crudos de A, B y el resto. Si la encuesta tenía
más opciones o "no sabe", la mayoría se define entre quienes eligieron A o B. Todas las cartas
se verificaron una por una contra su fuente.

El orden de `cartas.json` solo admite agregar al final (las partidas guardadas lo usan); una
carta que se quiera sacar se marca `"retirada": true`.

## Datos de quienes juegan (Supabase)

Antes de cada resultado se piden edad, género y nivel educativo (opcionales; quedan marcadas
las respuestas anteriores del dispositivo). Si hay `VITE_SUPABASE_URL` y `VITE_SUPABASE_KEY`
(ver `.env.example`), cada ronda terminada se guarda en una fila anónima de unos 90 bytes:

- `supabase/schema.sql` crea `partidas`, en la que la clave pública solo puede insertar. La app
  no lee nada de la base.
- Las jugadas van empaquetadas en 2 bytes por carta (ver `src/engine/codificacion.ts`); el
  esquema trae una consulta de ejemplo para contar elecciones por carta en el SQL Editor.
- Menores de 16: juegan, pero no se guarda nada.
- `python3 scripts/exportar_partidas.py` baja todo con la clave secreta y arma `jugadas.csv`,
  una fila por carta jugada, con la mayoría de la encuesta y si la persona coincidió, para
  analizar (por ejemplo, ponderando por edad, género y educación según el censo: la muestra no
  es representativa).

## Publicar en sosmayoria.pisubi.com (Cloudflare Pages)

El DNS de pisubi.com está en Cloudflare, así que el subdominio se configura solo.

1. Cloudflare → Workers & Pages → Create → Pages → Connect to Git → `auparrino/Compass`.
2. Rama de producción: la que se quiera publicar. Framework preset: Vite. Build command:
   `npm run build`. Output: `dist`. Node sale de `.node-version` (22).
3. Variables de entorno (Production): `VITE_SUPABASE_URL` y `VITE_SUPABASE_KEY` (la clave
   publicable, nunca la secreta). Vite las mete en el build: si se cambian, hay que redesplegar.
4. Custom domains → `sosmayoria.pisubi.com`. Cloudflare crea el CNAME y el certificado.

Cada push a la rama de producción redespliega; las otras ramas generan vistas previas.

## Desarrollo

```
npm install
npm run dev
npm test        # vitest
npm run lint    # oxlint
npm run build
```

Vite, React, TypeScript y Tailwind. Las fotos de figuras (`public/img`, `src/data/fotos.json`)
son de Wikimedia Commons, con autor y licencia.
