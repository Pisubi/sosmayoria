interface EyebrowProps {
  children: React.ReactNode
  /** Sobre fondo tinta la etiqueta va en naranja. */
  oscuro?: boolean
}

/** Etiqueta de sección: bloque relleno con el rótulo, según el manual de marca. */
export function Eyebrow({ children, oscuro }: EyebrowProps) {
  return (
    <p>
      <span className={`etiqueta ${oscuro ? '!bg-naranja !text-azul' : ''}`}>{children}</span>
    </p>
  )
}

/** Índice: cuadrado naranja con número, solo para pasos reales. */
export function Index({ n }: { n: number }) {
  return (
    <span className="inline-flex size-9 items-center justify-center border-[3px] border-azul bg-naranja font-black text-azul tabular-nums">
      {n}
    </span>
  )
}
