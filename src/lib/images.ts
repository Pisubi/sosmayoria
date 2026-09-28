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

export function imageFor(testId: TestId, profileId: string): ImageCredit | undefined {
  return images[testId]?.[profileId]
}

export function allImages(testId: TestId): [string, ImageCredit][] {
  return Object.entries(images[testId] ?? {})
}
