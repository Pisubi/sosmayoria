import { cartas, TEMAS, version } from '../data/cartas'
import { MIN_JUGADORES, real } from '../engine/juego'
import { todasLasFotos } from '../lib/fotos'
import { collecting } from '../lib/supabase'
import { Eyebrow } from './Eyebrow'
import { fecha } from '../lib/formato'

export function ComoFunciona({ onBack, backLabel = 'Volver' }: { onBack: () => void; backLabel?: string }) {
  const fotos = todasLasFotos().filter(([id]) => cartas.some((c) => c.a.foto === id || c.b.foto === id))
  return (
    <main className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <Eyebrow>Cómo funciona</Eyebrow>
      <h1 className="mt-6 text-4xl font-bold tracking-[-0.015em]">Un juego, no una encuesta</h1>

      <Bloque titulo="El dato real">
        Cada carta tiene una encuesta publicada detrás: consultora o universidad, fecha, muestra,
        alcance y enlace. Cuando la encuesta ofrecía más de dos respuestas (o incluía "no sabe"),
        el juego muestra cómo se reparten quienes eligieron una de las dos opciones de la carta, y
        lo aclara al revelar. Las encuestas tienen márgenes de error de unos 2 a 4 puntos: por eso
        errarle por 3 ya cuenta como "clavado".
      </Bloque>

      <Bloque titulo="Los puntos">
        Cien si acertás el porcentaje exacto, 2,5 menos por cada punto de diferencia y cero si le
        errás por 40 o más. Al final se muestra también cuánto habrías sacado diciendo 50% en
        todas, y, cuando hay suficientes partidas, en qué percentil quedás.
      </Bloque>

      <Bloque titulo="Tu sesgo">
        Casi todos creemos que hay más gente que piensa como nosotros de la que realmente hay (el
        efecto de falso consenso). El juego lo mide: en las cartas donde elegiste, compara el
        porcentaje que le diste a tu opción con el real.
      </Bloque>

      <Bloque titulo="Quienes jugaron">
        {collecting
          ? `Lo que elige cada persona se suma, carta por carta, y aparece como "quienes jugaron" cuando ya hay al menos ${MIN_JUGADORES}. Es una muestra autoseleccionada, no representativa: por eso el puntaje siempre se calcula contra la encuesta publicada, y la diferencia entre las dos cosas también es un dato.`
          : 'En esta versión no se guardan partidas: todo queda en tu dispositivo.'}
      </Bloque>

      <Bloque titulo="Privacidad">
        {collecting
          ? 'Cada ronda terminada se guarda de forma anónima: qué elegiste y qué porcentaje dijiste en cada carta, cuánto tardaste y, si decidís darlos, tu rango de edad, género y nivel educativo (se preguntan una sola vez por dispositivo). No se guarda nombre, mail, IP ni nada que te identifique, y nunca las rondas de menores de 16 años. La app solo lee totales por carta, nunca partidas individuales.'
          : 'No se guarda nada fuera de tu dispositivo.'}
      </Bloque>

      <Bloque titulo={`Las ${cartas.length} cartas y sus fuentes (${version})`}>
        {TEMAS.filter((t) => cartas.some((c) => c.tema === t.id)).map((t) => (
          <div key={t.id} className="mt-6">
            <p className="font-semibold text-azul">{t.nombre}</p>
            <ul className="mt-2 grid gap-2 text-sm">
              {cartas
                .filter((c) => c.tema === t.id)
                .map((c) => (
                  <li key={c.id} className="rounded-xl bg-papel px-4 py-3">
                    <p className="font-medium text-azul">{c.pregunta}</p>
                    <p className="mt-1 text-xs text-azul/60">
                      {c.a.texto} {Math.round(real(c))}% · {c.b.texto} {100 - Math.round(real(c))}% —{' '}
                      {c.ref.encuestadora}, {fecha(c.ref.fecha)}
                      {c.ref.alcance !== 'nacional' && ` (${c.ref.alcance})`} ·{' '}
                      <a href={c.ref.url} target="_blank" rel="noreferrer" className="underline">
                        fuente
                      </a>
                    </p>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </Bloque>

      {fotos.length > 0 && (
        <Bloque titulo="Créditos de las fotos">
          <ul className="mt-2 grid gap-1 text-xs text-azul/60">
            {fotos.map(([id, f]) => (
              <li key={id}>
                {id}: {f.author} · {f.license} ·{' '}
                <a href={f.sourceUrl} target="_blank" rel="noreferrer" className="underline">
                  Wikimedia Commons
                </a>
              </li>
            ))}
          </ul>
        </Bloque>
      )}

      <button
        type="button"
        onClick={onBack}
        className="mt-12 rounded-md bg-azul px-8 py-3.5 text-sm font-semibold text-marfil hover:bg-noche"
      >
        {backLabel}
      </button>
    </main>
  )
}

function Bloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-bold">{titulo}</h2>
      <div className="mt-3 leading-7 text-azul/75">{children}</div>
    </section>
  )
}
