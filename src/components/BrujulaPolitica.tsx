import type { Brujula } from '../engine/juego'
import type { Promedio } from '../lib/supabase'

/** Cuánto del cuadro usa el recorrido de -1 a 1 (en %), para que el punto no toque el borde. */
const ALCANCE = 40

/**
 * Economía × valores. El cruce de los ejes es el argentino promedio según las encuestas; si hay
 * datos, se marca también el promedio de quienes jugaron.
 */
export function BrujulaPolitica({ b, promedio }: { b: Brujula; promedio?: Promedio | null }) {
  const { economia, valores } = b.vos
  const x = 50 + economia * ALCANCE
  const y = 50 - valores * ALCANCE
  // El cartel "Vos" va abajo del punto si arriba taparía un rótulo: "Valores tradicionales" en el
  // borde de arriba, o "Más Estado" / "Más mercado", que van justo encima del eje horizontal (con el
  // punto apenas debajo del eje, el cartel de arriba caería sobre ellos).
  const abajo = y < 22 || (y >= 46 && y < 64 && (x < 38 || x > 62))
  return (
    <figure className="mx-auto w-full max-w-md">
      <div
        className="caja relative aspect-square overflow-hidden bg-papel text-[11px] font-extrabold tracking-wide text-azul uppercase sm:text-xs"
        role="img"
        aria-label={`Brújula política. Economía ${pct(economia)} (negativo, más Estado; positivo, más mercado). Valores ${pct(valores)} (negativo, progresistas; positivo, tradicionales). Cero es el promedio del país según las encuestas.${promedio ? ` Promedio de quienes jugaron: economía ${pct(promedio.economia)}, valores ${pct(promedio.valores)}.` : ''}`}
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

        {promedio && (
          <span
            className="absolute size-4 -translate-x-1/2 -translate-y-1/2 rotate-45 border-[3px] border-azul bg-ciruela"
            style={{ left: `${50 + promedio.economia * ALCANCE}%`, top: `${50 - promedio.valores * ALCANCE}%` }}
          />
        )}

        <span className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: `${x}%`, top: `${y}%` }}>
          <span className="block size-6 rounded-full border-[3px] border-azul bg-naranja" />
          <span
            className={`absolute bg-azul px-1.5 py-0.5 text-[11px] tracking-normal whitespace-nowrap text-papel normal-case ${
              abajo ? 'top-full mt-1.5' : 'bottom-full mb-1.5'
            } ${x < 15 ? 'left-0' : x > 85 ? 'right-0' : 'left-1/2 -translate-x-1/2'}`}
          >
            Vos
          </span>
        </span>
      </div>
      <figcaption className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs font-bold">
        {promedio && (
          <span className="flex items-center gap-1.5">
            <span className="size-3 rotate-45 border-[3px] border-azul bg-ciruela" /> Promedio de quienes jugaron (
            {miles(promedio.partidas)} {promedio.partidas === 1 ? 'partida' : 'partidas'})
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded-full border-[3px] border-azul bg-naranja" /> Vos
        </span>
      </figcaption>
    </figure>
  )
}

const pct = (v: number) => `${Math.round(v * 100)}`
const miles = (n: number) => n.toLocaleString('es-AR')
