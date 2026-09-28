import imageData from '../data/images.json'
import type { TestId } from '../types'

export interface ImageCredit {
  src: string
  kind: 'photo' | 'logo' | 'symbol'
  author: string
  license: string
  licenseUrl?: string
  sourceUrl: string
}

const images = imageData.images as unknown as Record<TestId, Record<string, ImageCredit>>

/** Las rutas del manifiesto son absolutas (/img/…); se resuelven contra la base del sitio. */
function withBase(image: ImageCredit): ImageCredit {
  return { ...image, src: import.meta.env.BASE_URL + image.src.replace(/^\//, '') }
}

export function imageFor(testId: TestId, profileId: string): ImageCredit | undefined {
  const image = images[testId]?.[profileId]
  return image && withBase(image)
}

export function allImages(testId: TestId): [string, ImageCredit][] {
  return Object.entries(images[testId] ?? {}).map(([id, image]) => [id, withBase(image)])
}
