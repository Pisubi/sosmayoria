import type { Brujula, Punto } from '../engine/juego'

/** Cuánto del cuadro usa el recorrido de -1 a 1 (en %), para que los puntos no toquen el borde. */
const ALCANCE = 40

const lugar = (p: Punto) => ({ left: `${50 + p.economia * ALCANCE}%`, top: `${50 - p.sociedad * ALCANCE}%` })

/** Plano de dos ejes con tu lugar y el de la mayoría en las mismas cartas. */
export function BrujulaPolitica({ b }: { b: Brujula }) {
  const juntos =
    Math.hypot(b.vos.economia - b.mayoria.economia, b.vos.sociedad - b.mayoria.sociedad) * ALCANCE < 7
  return (
    <figure className="mx-auto w-full max-w-md">
      <div
        className="relative aspect-square overflow-hidden rounded-2xl border border-azul/15 bg-papel text-[11px] font-semibold tracking-wide text-azul/55 uppercase sm:text-xs"
        role="img"
        aria-label={`Brújula política: economía ${pct(b.vos.economia)}, valores ${pct(b.vos.sociedad)}`}
      >
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          <span className="bg-azul/[0.07]" />
          <span className="bg-arena/35" />
          <span className="bg-naranja/[0.08]" />
          <span className="bg-azul/[0.03]" />
        </div>
        <span className="absolute inset-x-0 top-1/2 h-px bg-azul/25" />
        <span className="absolute inset-y-0 left-1/2 w-px bg-azul/25" />

        <span className="absolute top-2 left-1/2 -translate-x-1/2 rounded bg-papel/80 px-1.5">Orden y tradición</span>
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded bg-papel/80 px-1.5">
          Libertades individuales
        </span>
        <span className="absolute top-1/2 left-2 -translate-y-[calc(100%+4px)]">Más Estado</span>
        <span className="absolute top-1/2 right-2 -translate-y-[calc(100%+4px)]">Más mercado</span>

        <Marca p={b.mayoria} clase="bg-azul" texto={juntos ? null : 'La mayoría'} />
        <Marca p={b.vos} clase="bg-naranja ring-4 ring-naranja/25" texto={juntos ? 'Vos y la mayoría' : 'Vos'} />
      </div>
    </figure>
  )
}

function Marca({ p, clase, texto }: { p: Punto; clase: string; texto: string | null }) {
  return (
    <span className="absolute -translate-x-1/2 -translate-y-1/2" style={lugar(p)}>
      <span className={`block size-4 rounded-full border-2 border-papel ${clase}`} />
      {texto && (
        <span className="absolute top-full left-1/2 mt-1 -translate-x-1/2 rounded bg-noche px-1.5 py-0.5 text-[11px] whitespace-nowrap text-marfil normal-case">
          {texto}
        </span>
      )}
    </span>
  )
}

const pct = (v: number) => `${Math.round(v * 100)}`
