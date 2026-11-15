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

import { genreMateriel } from '../../src/espace/donnees/banque.js'
describe('genreMateriel', () => {
  it('reconnaît le matériel, même écrit autrement', () => {
    expect(genreMateriel('Haltère')).toBe('haltere')
    expect(genreMateriel('KB')).toBe('kettlebell')
    expect(genreMateriel('Barre olympique')).toBe('barre')
    expect(genreMateriel('Poids du corps')).toBe('corps')
    expect(genreMateriel('Poulie')).toBe('poulie')
    expect(genreMateriel('Câble')).toBe('poulie')
    expect(genreMateriel('Machine guidée')).toBe('machine')
    expect(genreMateriel('Landmine')).toBe('landmine')
    expect(genreMateriel('Élastique')).toBe('elastique')
    expect(genreMateriel('Médecine-ball')).toBe('autre')
    expect(genreMateriel('À préciser')).toBe(null)
  })
})

import { completerReglages, partieDe, ranger, renommerRangement } from '../../src/espace/donnees/reglages.js'
describe('parties de la banque', () => {
  const r = completerReglages({})
  it('par défaut : Mobilité, Activation, Plyométrie en Échauffement, le reste en Séance', () => {
    expect(r.parties).toEqual(['Échauffement', 'Séance'])
    expect(['Mobilité', 'Activation', 'Plyométrie'].map((c) => partieDe(c, r))).toEqual(['Échauffement', 'Échauffement', 'Échauffement'])
    expect(partieDe('Gainage', r)).toBe('Séance')
    expect(partieDe('', r)).toBe('Séance')
  })
  it('le choix de la coach l’emporte ; une partie disparue revient au défaut', () => {
    const r2 = { ...r, rangement: ranger(r.rangement, 'Gainage', 'Échauffement') }
    expect(partieDe('Gainage', r2)).toBe('Échauffement')
    expect(partieDe('Gainage', { ...r2, rangement: ranger(r2.rangement, 'Gainage', 'Inconnue') })).toBe('Séance')
    expect(partieDe('Cardio', { ...r, parties: ['Échauffement', 'Corps'] })).toBe('Corps')
  })
  it('renommer une catégorie ou une partie garde le rangement', () => {
    const rg = [{ categorie: 'Gainage', partie: 'Échauffement' }]
    expect(renommerRangement(rg, 'categorie', 'Gainage', 'Core')).toEqual([{ categorie: 'Core', partie: 'Échauffement' }])
    expect(renommerRangement(rg, 'partie', 'Échauffement', 'Activation')).toEqual([{ categorie: 'Gainage', partie: 'Activation' }])
  })
})
