import { useState } from 'react'
import { cartas, TEMAS } from '../data/cartas'
import { brujula, cuadrante, enPalabras, perfil, temaDistinto, type Lectura, type Lugar, type Resumen } from '../engine/juego'
import { renderShareImage, type Tarjeta } from '../lib/compartir'
import { borrarHistorial, type Historial } from '../lib/guardado'
import { fecha } from '../lib/formato'
import { BrujulaPolitica } from './BrujulaPolitica'
import { Eyebrow } from './Eyebrow'
import { Footer } from './Footer'

interface ResultadoProps {
  resumen: Resumen
  /** Tus respuestas de todas las rondas, para la brújula. */
  historial: Historial
  onOtraRonda: () => void
  onMethodology: () => void
}

const CHIP: Record<Lugar, { texto: string; clase: string }> = {
  mayoria: { texto: 'Con la mayoría', clase: 'bg-ciruela text-papel' },
  minoria: { texto: 'En la minoría', clase: 'bg-naranja text-azul' },
  parejo: { texto: 'Parejo', clase: 'bg-arena text-azul' },
  nada: { texto: 'No elegiste', clase: 'bg-papel text-azul' },
}

const nombreTema = (id: string) => TEMAS.find((t) => t.id === id)?.nombre ?? id
const porId = new Map(cartas.map((c) => [c.id, c]))
const URL_PUBLICA = 'https://sosmayoria.pisubi.com'

export function Resultado({ resumen, historial, onOtraRonda, onMethodology }: ResultadoProps) {
  const { conLaMayoria, definidas, enLaMinoria, parejas, lecturas, porTema } = resumen
  const p = perfil(conLaMayoria, definidas)
  const minoria = lecturas.filter((l) => l.lugar === 'minoria')
  const [conHistorial, setConHistorial] = useState(true)
  const respuestas = Object.entries(historial.respuestas).flatMap(([id, eleccion]) => {
    const carta = porId.get(id)
    return carta ? [{ carta, eleccion }] : []
  })
  const b = conHistorial ? brujula(respuestas) : null
  const distinto = temaDistinto(porTema)
  const texto = `Pienso como la mayoría de los argentinos en ${conLaMayoria} de ${definidas} temas: ${p.titulo.toLowerCase()}. ¿Y vos?`

  return (
    <main>
      <section className="bg-naranja text-azul">
        <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-20">
          <Eyebrow oscuro>Fin de la ronda</Eyebrow>
          <p className="mt-6 text-lg font-bold">Pensás como la mayoría en</p>
          <p className="mt-1 text-7xl font-black tracking-[-0.03em] tabular-nums sm:text-9xl">
            {conLaMayoria} <span className="text-3xl font-black sm:text-4xl">de {definidas}</span>
          </p>
          <h1 className="caja mt-6 inline-block bg-azul px-4 py-3 text-3xl text-papel sm:text-4xl">{p.titulo}</h1>
          <p className="mt-2 max-w-xl leading-7 font-medium">{p.texto}</p>
          <p className="mt-4 text-sm font-bold">
            En la minoría en {enLaMinoria}
            {parejas > 0 && ` · ${parejas} ${parejas === 1 ? 'carta pareja' : 'cartas parejas'}, donde el país se parte al medio`}
            .
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onOtraRonda}
              className="caja bg-papel px-8 py-3.5 text-sm font-black tracking-wide uppercase hover:-translate-y-0.5"
            >
              Jugar otra ronda →
            </button>
            <Compartir
              texto={texto}
              tarjeta={{
                mayoria: conLaMayoria,
                definidas,
                titulo: p.titulo,
                texto: p.texto,
                temaDistinto: distinto ? nombreTema(distinto) : undefined,
              }}
            />
          </div>
        </div>
      </section>

      {b && (
        <section className="mx-auto max-w-3xl px-4 pt-14 sm:px-6">
          <Eyebrow>Tu brújula política</Eyebrow>
          <h2 className="mt-4 text-3xl">{cuadrante(b.vos)}</h2>
          <p className="mt-2 leading-7 font-medium">
            Comparado con el argentino promedio.{b.cartas.autoridad > 0 && ` En autoridad: ${enPalabras('autoridad', b.vos.autoridad)}.`}
          </p>
          <div className="mt-6">
            <BrujulaPolitica b={b} />
          </div>
          <p className="mx-auto mt-5 max-w-md text-xs leading-5 text-azul/80">
            Precisión {b.precision}: {b.cartas.economia} respuestas sobre economía, {b.cartas.valores} sobre valores
            {b.cartas.autoridad > 0 && ` y ${b.cartas.autoridad} sobre autoridad`}
            {historial.rondas > 1 ? `, sumando tus ${historial.rondas} rondas` : ''}. El centro es lo que respondió el
            país en las encuestas: elegir lo que eligió casi todo el mundo te mueve poco; elegir lo de pocos, mucho.
            {b.precision !== 'muy buena' && ' Cada ronda nueva la afina.'}{' '}
            <button
              type="button"
              onClick={() => {
                borrarHistorial()
                setConHistorial(false)
              }}
              className="underline"
            >
              Borrar mis respuestas guardadas
            </button>
          </p>
        </section>
      )}

      {minoria.length > 0 && (
        <section className="mx-auto max-w-3xl px-4 pt-14 sm:px-6">
          <Eyebrow>Donde sos minoría</Eyebrow>
          <ul className="mt-6 grid gap-3">
            {minoria.map((l) => (
              <li key={l.carta.id} className="caja-sm border-l-[12px] border-l-naranja bg-papel p-5">
                <p className="font-semibold">{l.carta.pregunta}</p>
                <p className="mt-1 text-sm text-azul/85">
                  Elegiste <span className="font-semibold text-azul">{eleccion(l)}</span>; la mayoría eligió{' '}
                  <span className="font-semibold text-azul">{otra(l)}</span>.
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}

      {porTema.length > 1 && (
        <section className="mx-auto max-w-3xl px-4 pt-14 sm:px-6">
          <Eyebrow>Por tema</Eyebrow>
          <ul className="mt-6 grid gap-4">
            {porTema.map((t) => (
              <li key={t.tema}>
                <div className="flex items-baseline justify-between gap-4 text-sm">
                  <span className="font-semibold">{nombreTema(t.tema)}</span>
                  <span className="font-bold tabular-nums">
                    con la mayoría en {t.mayoria} de {t.definidas}
                  </span>
                </div>
                <div className="mt-2 flex gap-[3px] border-[3px] border-azul bg-azul">
                  {Array.from({ length: t.definidas }, (_, i) => (
                    <span key={i} className={`h-4 flex-1 ${i < t.mayoria ? 'bg-ciruela' : 'bg-naranja'}`} />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <details className="group">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 caja-sm bg-papel px-5 py-4 font-bold">
            Ver carta por carta ({lecturas.length}), con sus fuentes
            <span className="text-2xl leading-none font-black transition-transform group-open:rotate-45">+</span>
          </summary>
        <ol className="mt-6 grid gap-3">
          {lecturas.map((l) => (
            <li key={l.carta.id} className="caja-sm bg-papel p-5">
              <div className="flex items-start justify-between gap-4">
                <p className="font-semibold">{l.carta.pregunta}</p>
                <span className={`shrink-0 px-2.5 py-1 text-xs font-bold tracking-wide uppercase ${CHIP[l.lugar].clase}`}>
                  {CHIP[l.lugar].texto}
                </span>
              </div>
              {l.jugada.eleccion !== 'nada' && <p className="mt-1 text-sm text-azul/85">Elegiste {eleccion(l)}.</p>}
              <p className="mt-2 text-xs text-azul/75">
                {l.carta.ref.encuestadora}, {fecha(l.carta.ref.fecha)}
                {!l.carta.ref.alcance.startsWith('nacional') && ` (${l.carta.ref.alcance})`} ·{' '}
                <a href={l.carta.ref.url} target="_blank" rel="noreferrer" className="underline">
                  fuente
                </a>
              </p>
            </li>
          ))}
        </ol>
        </details>
      </section>

      <Footer onMethodology={onMethodology} />
    </main>
  )
}

function eleccion(l: Lectura): string {
  return l.jugada.eleccion === 'nada' ? '' : `«${l.carta[l.jugada.eleccion].texto}»`
}

function otra(l: Lectura): string {
  return l.jugada.eleccion === 'a' ? `«${l.carta.b.texto}»` : `«${l.carta.a.texto}»`
}

function Compartir({ texto, tarjeta }: { texto: string; tarjeta: Omit<Tarjeta, 'url'> }) {
  const [estado, setEstado] = useState<'listo' | 'copiado' | 'generando'>('listo')
  async function compartir() {
    // Siempre la dirección pública, aunque se juegue desde el archivo suelto o una vista previa.
    const url = (import.meta.env.VITE_URL_PUBLICA as string | undefined) ?? URL_PUBLICA
    const mensaje = `${texto} ${url}`.trim()
    setEstado('generando')
    try {
      const blob = await renderShareImage({ ...tarjeta, url })
      const file = new File([blob], 'la-mayoria.png', { type: 'image/png' })
      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], text: mensaje })
          setEstado('listo')
          return
        } catch (e) {
          if ((e as Error).name === 'AbortError') {
            setEstado('listo')
            return
          }
        }
      }
      await navigator.clipboard.writeText(mensaje).catch(() => undefined)
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = file.name
      a.click()
      window.setTimeout(() => URL.revokeObjectURL(a.href), 5000)
      setEstado('copiado')
      window.setTimeout(() => setEstado('listo'), 3000)
    } catch {
      setEstado('listo')
    }
  }
  return (
    <button
      type="button"
      onClick={compartir}
      disabled={estado === 'generando'}
      className="caja bg-azul px-8 py-3.5 text-sm font-black tracking-wide text-papel uppercase hover:-translate-y-0.5 disabled:opacity-60"
    >
      {estado === 'generando' ? 'Generando…' : estado === 'copiado' ? 'Imagen descargada y texto copiado' : 'Compartir en historias'}
    </button>
  )
}
