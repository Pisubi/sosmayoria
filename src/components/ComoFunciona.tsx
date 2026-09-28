import { cartas, TEMAS, version } from '../data/cartas'
import { MARGEN, mayoria } from '../engine/juego'
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
        Cada carta tiene detrás una encuesta publicada, de alcance nacional: consultora o
        universidad, fecha, muestra y enlace. Cuando la encuesta ofrecía más de dos respuestas (o
        incluía "no sabe"), se compara solo entre quienes eligieron una de las dos opciones de la
        carta.
      </Bloque>

      <Bloque titulo="Mayoría, minoría o parejo">
        Al elegir, te decimos si coincidís con lo que eligió la mayoría en la encuesta. Si la
        diferencia entre las dos opciones es chica ({MARGEN} puntos o menos respecto de la mitad),
        la carta cuenta como pareja: las encuestas tienen márgenes de error de 2 a 4 puntos y no
        tendría sentido hablar de mayoría. Al final, el "X de Y" cuenta solo las cartas con una
        mayoría clara en las que elegiste.
      </Bloque>

      <Bloque titulo="Lo que se guarda">
        {collecting
          ? 'Cada ronda terminada se guarda de forma anónima: qué elegiste en cada carta, cuánto tardaste y, si decidís darlos, tu rango de edad, género y nivel educativo (se preguntan antes de cada resultado, con tus respuestas anteriores ya marcadas). No se guarda nombre, mail, IP ni nada que te identifique, y nunca las rondas de menores de 16 años. Lo que eligen quienes juegan no es una encuesta representativa: juega quien quiere.'
          : 'En esta versión no se guarda nada fuera de tu dispositivo.'}
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
                      {mayoria(c) === 'parejo' ? 'Parejo' : `Mayoría: ${c[mayoria(c) as 'a' | 'b'].texto}`} —{' '}
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
