import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import imageData from '../src/data/images.json'
import { tests } from '../src/data/tests'

const images = imageData.images as Record<string, Record<string, { src: string; author: string; license: string; sourceUrl: string }>>

describe.each(Object.values(tests))('imágenes $name', (test) => {
  const entries = Object.entries(images[test.id] ?? {})

  it('cada imagen existe, corresponde a un perfil y tiene crédito', () => {
    for (const [id, img] of entries) {
      const profile = test.profiles.find((p) => p.id === id)
      expect(profile, id).toBeDefined()
      expect(existsSync(join('public', img.src)), img.src).toBe(true)
      expect(img.license, id).toBeTruthy()
      expect(img.sourceUrl, id).toMatch(/^https:\/\/commons\.wikimedia\.org\//)
    }
  })
})
