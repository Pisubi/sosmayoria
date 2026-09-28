# Brújula — test político multidimensional

Dos tests de posicionamiento político, uno argentino y otro internacional. El
resultado no encasilla: muestra a qué ideologías, tradiciones, figuras y partidos
se parece la persona, en qué coincide y en qué se diferencia, y su posición tema
por tema.

Implementa la especificación técnica "Political compass argentino e internacional":
ítems multi-eje balanceados, opción "No sé", cobertura por eje, catálogos
separados, identidad peronista reportada aparte, planos 2D, enlace para compartir y tests de recall.

## Los tests

| | Argentina | Internacional |
|---|---|---|
| Temas (ejes) | Economía (Estado, macroeconomía, trabajo y comercio), Valores, Instituciones, Estilo (pluralista/populista), Seguridad y memoria, Mundo, Territorio + Identidad (aparte) | Economía (incluye comercio), Libertades (incluye democracia), Valores (incluye religión), Nación, Guerra y paz, Migración, Ambiente, Estilo |
| Afirmaciones por partida | 25 corta · 50 completa · 100 a fondo | 25 corta · 50 completa · 100 a fondo |
| Banco del que se sortean | 182 (48 elegibles para el núcleo) | 176 (48 elegibles para el núcleo) |
| Catálogos | Tradiciones y espacios · Figuras históricas · Figuras actuales | Ideologías · Figuras históricas · Figuras actuales · Partidos |
| Perfiles | 111 | 157 |

## Cómo se calcula

- Cada partida sortea sus afirmaciones del banco y las muestra en orden aleatorio.
  Las 25 de la corta son el **núcleo** (3 o 4 por tema, entre las elegibles) y pesan
  el triple en su tema; la completa y la a fondo suman 25 y 75 de **detalle**.
  En la corta un sentido queda 2 a 1 por tema, alternado entre temas; en las otras
  el detalle compensa y cada tema queda equilibrado.
- Respuestas de −1 a +1 (±0,5 intermedios); "No sé" se excluye.
- `puntaje_eje = 100 · Σ(w·r·e) / Σ w·|e|` sobre ítems respondidos, con `w = 3` para
  el núcleo en su tema principal y 1 en el resto; con menos del 50% de
  cobertura el eje queda indeterminado.
- Cercanía: `100 · (1 − d/200)`, con `d` la distancia media cuadrática en los ejes
  con puntaje del usuario; donde el perfil no tiene dato se cuenta una diferencia de 40. Menos del 60% de ejes comparados = comparación parcial.
- Los catálogos se rankean por separado. Las figuras de dictaduras y
  totalitarismos se incluyen como cualquier otro perfil, con descripciones que
  mencionan sus crímenes documentados. Por decisión editorial quedan excluidos
  Adolf Hitler, el nazismo, Augusto Pinochet, Alfredo Stroessner, Slobodan
  Milošević y la cúpula de la última dictadura argentina.

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

## Datos de quienes juegan (Supabase)

Si el despliegue tiene configurado Supabase, entre la última afirmación y el
resultado la app pide edad, género y nivel educativo (opcionales) y guarda una
fila con esos datos y las respuestas, de forma anónima: sin nombre, mail ni
identificadores. De menores de 16 años no se guarda nada. Sin las variables de
entorno, la app no pide datos ni envía nada.

### Configuración

1. Crear un proyecto en [supabase.com](https://supabase.com) (plan Free).
2. En **SQL Editor**, pegar y correr [`supabase/schema.sql`](supabase/schema.sql).
   Crea la tabla `respuestas`, con permisos para que la clave pública solo pueda
   insertar: nadie puede leer, modificar ni borrar desde la app.
3. En **Project Settings → API Keys**, copiar la URL del proyecto y la clave
   *publishable* (`sb_publishable_…`; también sirve la `anon` heredada).
4. Cargarlas como variables de entorno, en `.env.local` para desarrollo (ver
   `.env.example`) o en el hosting (Vercel, Netlify):
   `VITE_SUPABASE_URL` y `VITE_SUPABASE_KEY`.
5. Para bajar los datos: `python3 scripts/export_respuestas.py`, con
   `SUPABASE_URL` y `SUPABASE_SECRET_KEY` (la clave `sb_secret_…`, que nunca va en
   la app). También acepta un CSV bajado del panel: `--csv archivo.csv`.
   Genera `respuestas_intl.csv` y `respuestas_ar.csv`, con etiquetas, puntaje por
   eje y la respuesta a cada afirmación.

### Cómo se ahorra espacio

El plan Free da 500 MB de base. Cada test terminado ocupa unos **180 bytes**
con el índice incluido (medido con 100.000 filas en PostgreSQL 16): alcanza para
unos **2,5 millones de tests**. La misma información guardada "a lo simple", con
JSON de respuestas y puntajes, textos y timestamp, ocupa unos 1.000 bytes por
fila, más de 5 veces.

- **Respuestas en medio byte cada una**: el valor de cada afirmación ocupa 4 bits
  en un `bytea`, en el orden del banco (`questions.json`): 91 bytes para 182. El
  cuarto bit marca las que salieron como núcleo, para recalcular el puntaje.
  Como las filas guardadas dependen de ese orden, a `questions.json` solo se le
  agregan afirmaciones al final; lo controla un test contra
  `tests/answer-layout.json`, que hay que actualizar al agregarlas.
- **Sin puntajes guardados**: se recalculan desde las respuestas, en el script
  de exportación o en la app.
- **Códigos `smallint`** en vez de textos, **`date`** en vez de timestamp (4 bytes
  y además menos identificable) y columnas ordenadas para no perder bytes por
  alineación.
- **Una sola fila por test terminado**, un solo envío al final: los tests
  abandonados no ocupan lugar.
- **Límites en la tabla**: `check` de rangos y máximo de 128 bytes de respuestas,
  para que nadie pueda llenarla con filas gigantes usando la clave pública.

Códigos (0 = prefiero no decir): `test` 1 internacional, 2 Argentina ·
`variante` 1 corta, 2 completa, 3 a fondo · `edad` 1 16–17, 2 18–24, 3 25–34,
4 35–44, 5 45–54, 6 55–64, 7 65+ · `genero` 1 mujer, 2 varón, 3 no binario u
otra · `educacion` 1 sin estudios o primario incompleto, 2 primario completo,
3 secundario incompleto, 4 secundario completo, 5 terciario/universitario
incompleto, 6 terciario/universitario completo, 7 posgrado. En el SQL Editor,
`respuesta(respuestas, i)` devuelve el valor de la afirmación `i` (desde 0).

Para controlar el uso: `select pg_size_pretty(pg_total_relation_size('public.respuestas'));`.
Un proyecto Free se pausa tras 7 días sin actividad: si pasa una semana sin
jugadores, hay que reactivarlo desde el panel (los datos no se pierden).

## Stack

Vite + React + TypeScript + Tailwind CSS v4. El único backend es opcional: una
tabla de Supabase para guardar respuestas (ver abajo). Estética según el
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
  planos 2D, rankings por catálogo, identidad).
- `src/lib/progress.ts` — progreso guardado en el navegador.
- `src/lib/participant.ts`, `src/lib/submit.ts` y `src/engine/encoding.ts` —
  datos demográficos, envío a Supabase y empaquetado de respuestas.
- `tests/` — tests de la especificación: neutral = 0, todo de acuerdo ≈ 0,
  balance de polos, rangos, IDs y recall ≥ 80% con ruido σ = 0,25.
