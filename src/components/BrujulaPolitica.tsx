import type { Brujula } from '../engine/juego'

/** Cuánto del cuadro usa el recorrido de -1 a 1 (en %), para que el punto no toque el borde. */
const ALCANCE = 42

/**
 * Economía × valores, con el argentino promedio en el centro.
 */
export function BrujulaPolitica({ b }: { b: Brujula }) {
  const { economia, valores } = b.vos
  return (
    <figure className="mx-auto w-full max-w-md">
      <div
        className="caja relative aspect-square overflow-hidden bg-papel text-[11px] font-extrabold tracking-wide text-azul uppercase sm:text-xs"
        role="img"
        aria-label={`Brújula política. Economía ${pct(economia)} (negativo, más Estado; positivo, más mercado). Valores ${pct(valores)} (negativo, progresistas; positivo, tradicionales). Cero es el promedio del país.`}
      >
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
          <span className="bg-lavanda/50" />
          <span className="bg-arena" />
          <span className="bg-naranjaclaro/60" />
          <span className="bg-papel" />
        </div>
        <span className="absolute inset-x-0 top-1/2 h-[3px] bg-azul" />
        <span className="absolute inset-y-0 left-1/2 w-[3px] bg-azul" />

        <span className="absolute top-2 left-1/2 -translate-x-1/2 bg-papel px-1.5">Valores tradicionales</span>
        <span className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-papel px-1.5">
          Valores progresistas
        </span>
        <span className="absolute top-1/2 left-2 -translate-y-[calc(100%+4px)]">Más Estado</span>
        <span className="absolute top-1/2 right-2 -translate-y-[calc(100%+4px)]">Más mercado</span>

        <span className="absolute top-1/2 left-1/2 size-4 -translate-x-1/2 -translate-y-1/2 border-[3px] border-azul bg-papel" />

        <span
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${50 + economia * ALCANCE}%`, top: `${50 - valores * ALCANCE}%` }}
        >
          <span className="block size-6 rounded-full border-[3px] border-azul bg-naranja" />
          <span className="absolute bottom-full left-1/2 mb-1.5 -translate-x-1/2 bg-azul px-1.5 py-0.5 text-[11px] tracking-normal whitespace-nowrap text-papel normal-case">
            Vos
          </span>
        </span>
      </div>
      <figcaption className="mt-3 flex justify-center gap-4 text-xs font-bold">
        <span className="flex items-center gap-1.5">
          <span className="size-3 border-[3px] border-azul bg-papel" /> Promedio del país
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-full border-[3px] border-azul bg-naranja" /> Vos
        </span>
      </figcaption>

    </figure>
  )
}

const pct = (v: number) => `${Math.round(v * 100)}`
