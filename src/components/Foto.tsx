import { fotoDe } from '../lib/fotos'

interface FotoProps {
  id?: string
  nombre: string
  size?: number
}

/** Foto de una figura o logo de un partido; si no hay, las iniciales. */
export function Foto({ id, nombre, size = 64 }: FotoProps) {
  const foto = fotoDe(id)
  const style = { width: size, height: size }
  if (!foto) {
    const iniciales = nombre
      .split(/\s+/)
      .filter((w) => /^[A-ZÁÉÍÓÚÑ]/.test(w))
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
    return (
      <span
        aria-hidden
        style={{ ...style, fontSize: size * 0.36 }}
        className="inline-flex shrink-0 items-center justify-center rounded-full bg-linea font-semibold text-azul/70"
      >
        {iniciales}
      </span>
    )
  }
  const photo = foto.kind === 'photo'
  return (
    <img
      src={foto.src}
      alt=""
      loading="lazy"
      title={`${foto.author} · ${foto.license} (Wikimedia Commons)`}
      style={style}
      className={`shrink-0 ${photo ? 'rounded-full object-cover' : 'rounded-md bg-marfil object-contain p-1'}`}
    />
  )
}
