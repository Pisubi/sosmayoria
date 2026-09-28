import data from '../data/fotos.json'

export interface Foto {
  src: string
  kind: 'photo' | 'logo' | 'symbol'
  author: string
  license: string
  licenseUrl?: string
  sourceUrl: string
}

const fotos = data.fotos as unknown as Record<string, Foto>

/** Las rutas del manifiesto son absolutas (/img/…); se resuelven contra la base del sitio. */
export function fotoDe(id: string | undefined): Foto | undefined {
  const foto = id ? fotos[id] : undefined
  return foto && { ...foto, src: import.meta.env.BASE_URL + foto.src.replace(/^\//, '') }
}

export function todasLasFotos(): [string, Foto][] {
  return Object.keys(fotos).map((id) => [id, fotoDe(id)!])
}
