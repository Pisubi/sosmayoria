import { imageFor } from '../lib/images'
import type { Profile, TestId } from '../types'

interface AvatarProps {
  testId: TestId
  profile: Profile
  size?: number
  /** Sobre fondo oscuro. */
  dark?: boolean
}

export function Avatar({ testId, profile, size = 40, dark = false }: AvatarProps) {
  const image = profile.sensitive ? undefined : imageFor(testId, profile.id)
  const style = { width: size, height: size }

  if (!image) {
    const initials = profile.name
      .replace(/["“”(].*?["“”)]/g, '')
      .split(/\s+/)
      .filter((w) => /^[A-ZÁÉÍÓÚÑ]/.test(w))
      .slice(0, 2)
      .map((w) => w[0])
      .join('')
    return (
      <span
        aria-hidden
        style={{ ...style, fontSize: size * 0.36 }}
        className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ${
          dark ? 'bg-marfil/10 text-marfil/70' : 'bg-linea text-azul/70'
        }`}
      >
        {initials}
      </span>
    )
  }

  const photo = image.kind === 'photo'
  return (
    <img
      src={image.src}
      alt=""
      loading="lazy"
      title={`${image.author} · ${image.license} (Wikimedia Commons)`}
      style={style}
      className={`shrink-0 ${
        photo ? 'rounded-full object-cover' : 'rounded-md bg-marfil object-contain p-1'
      }`}
    />
  )
}
