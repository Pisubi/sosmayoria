# La Mayoría

¿Sabés qué piensa la Argentina? Un juego web sobre la opinión pública: en cada carta elegís
entre dos opciones (esto o aquello, de acuerdo o en desacuerdo), adivinás cómo se reparte el
país y ves el dato real de una encuesta publicada. Cuanto más cerca, más puntos.

No es una encuesta, pero junta opinión: lo que elige cada persona y lo que cree que piensan
los demás se guarda de forma anónima (si el despliegue tiene Supabase).

## Cómo se juega

- Rondas de 15 cartas sorteadas del banco (solo encuestas de alcance nacional en la
  Argentina), alternando temas (política, economía, sociedad, historia, cultura, vida
  cotidiana) y priorizando las que la persona todavía no vio.
- Cada carta: elegís A, B o "prefiero no decir"; después movés una barra hasta el porcentaje
  que creés que eligió cada opción.
- Puntos: `100 − 2,5 · |predicción − dato real|`, mínimo 0.
- Al final: puntaje promedio, cuánto habrías sacado diciendo 50% en todas, en qué cartas
  pensás como la mayoría o la minoría, tu mayor sorpresa y tu sesgo de "falso consenso"
  (cuánto sobreestimás a quienes eligen lo mismo que vos).

## El dato real

Cada carta de `src/data/cartas.json` cita una encuesta publicada: encuestadora, fecha,
muestra, alcance y enlace, con los porcentajes crudos de A, B y el resto. Si la encuesta tenía
más opciones o "no sabe", el juego muestra la proporción entre A y B y lo aclara al revelar.
El puntaje siempre se calcula contra la encuesta, nunca contra lo que eligen quienes juegan:
esa muestra es autoseleccionada (y cualquiera podría inflarla), así que se muestra aparte.

El orden de `cartas.json` solo admite agregar al final (las partidas guardadas lo usan); una
carta que se quiera sacar se marca `"retirada": true`.

## Datos de quienes juegan (Supabase)

Antes de cada resultado se piden edad, género y nivel educativo (opcionales; quedan marcadas
las respuestas anteriores del dispositivo). Si hay `VITE_SUPABASE_URL` y `VITE_SUPABASE_KEY`
(ver `.env.example`), cada ronda terminada se guarda en una fila anónima de unos 90 bytes:

- `supabase/schema.sql` crea `partidas` (solo inserción con la clave pública), `conteos` y
  `puntajes`, que un trigger actualiza con cada partida, y la función `estado()`, que devuelve
  solo esos agregados. La app nunca lee partidas individuales.
- Las jugadas van empaquetadas en 3 bytes por carta (ver `src/engine/codificacion.ts`).
- Menores de 16: juegan, pero no se guarda nada.
- `python3 scripts/exportar_partidas.py` baja todo con la clave secreta y arma `jugadas.csv`,
  una fila por carta jugada, para analizar (por ejemplo, ponderando por edad, género y
  educación según el censo: la muestra no es representativa).

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
