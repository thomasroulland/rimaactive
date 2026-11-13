import { describe, it, expect } from 'vitest'
import { chargeIndicative } from '../../src/espace/donnees/banque.js'

describe('chargeIndicative', () => {
  const rm = { Squat: 100, 'Développé couché': 72.5 }
  it('calcule et arrondit à 2,5 kg', () => {
    expect(chargeIndicative('Squat', '70', rm)).toBe(70)
    expect(chargeIndicative('Développé couché barre', '75', rm)).toBe(55)
    expect(chargeIndicative('developpe couche', '80,5', rm)).toBe(57.5)
  })
  it('ne devine pas', () => {
    expect(chargeIndicative('Fente', '70', rm)).toBeNull()
    expect(chargeIndicative('Squat', '', rm)).toBeNull()
    expect(chargeIndicative('Soulevé de terre', '70', rm)).toBeNull()
    expect(chargeIndicative('Squat', '70', undefined)).toBeNull()
  })
})

import { completerReglages, nomType } from '../../src/espace/donnees/reglages.js'
describe('réglages', () => {
  it('garde toujours Force et Course, et des listes par défaut', () => {
    const r = completerReglages({ types: [{ id: 'mob', nom: 'Mobilité' }] })
    expect(r.types.map((t) => t.id)).toEqual(['mob', 'force', 'course'])
    expect(r.categories.length).toBeGreaterThan(0)
    expect(completerReglages(null).types.map((t) => t.id)).toEqual(['force', 'course'])
  })
  it('nomme un type, même supprimé', () => {
    expect(nomType('mob', [{ id: 'mob', nom: 'Mobilité' }])).toBe('Mobilité')
    expect(nomType('force', [{ id: 'force', nom: 'Renfo' }])).toBe('Renfo')
    expect(nomType('inconnu', [])).toBe('Séance')
  })
})
