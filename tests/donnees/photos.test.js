import { describe, it, expect } from 'vitest'
import { reduireImage } from '../../src/espace/donnees/photos.js'

describe('reduireImage : refus', () => {
  it('refuse un format HEIC (photo d’iPhone)', async () => {
    const f = new File([new Uint8Array(10)], 'photo.heic', { type: 'image/heic' })
    await expect(reduireImage(f)).rejects.toThrow('format')
  })
  it('refuse un fichier sans type image', async () => {
    const f = new File(['x'], 'notes.pdf', { type: 'application/pdf' })
    await expect(reduireImage(f)).rejects.toThrow('format')
  })
  it('refuse une photo de plus de 20 Mo', async () => {
    const f = new File([new Uint8Array(21 * 1024 * 1024)], 'enorme.jpg', { type: 'image/jpeg' })
    await expect(reduireImage(f)).rejects.toThrow('taille')
  })
  it('le code d’erreur est porté par error.code', async () => {
    const f = new File([new Uint8Array(10)], 'photo.heic', { type: 'image/heic' })
    await expect(reduireImage(f)).rejects.toMatchObject({ code: 'format' })
  })
})
