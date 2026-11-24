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

import { completerReglages, formatsDuType, nomType } from '../../src/espace/donnees/reglages.js'
describe('réglages', () => {
  it('donne toujours la liste fixe des types de séance, et des listes par défaut', () => {
    const r = completerReglages({ types: [{ id: 'mob', nom: 'Mobilité' }] })
    const attendu = ['Échauffement', 'Renforcement', 'Circuit', 'LIIT (Zone 1-2)', 'LISS (Zone 2)', 'Tempo (Zone 3)', 'Seuil (Zone 4)', 'HIIT (Zone 5)', 'SIT (Effort maximal)']
    expect(r.types.map((t) => t.nom)).toEqual(attendu)
    expect(r.categories.length).toBeGreaterThan(0)
    expect(completerReglages(null).types.map((t) => t.nom)).toEqual(attendu)
    // les anciens types ne sont plus proposés mais gardent leur nom
    expect(r.types.some((t) => t.id === 'course')).toBe(false)
    expect(nomType('course', r.types)).toBe('Endurance fondamentale')
    expect(nomType('contraste', r.types)).toBe('Contraste')
  })
  it('propose les formats de bloc selon le type de séance', () => {
    expect(formatsDuType('force')).toEqual(['series', 'superset', 'emom'])
    expect(formatsDuType('circuit')).toEqual(['amrap', 'emom', 'tabata'])
    expect(formatsDuType('liss')).toEqual(['continu'])
    expect(formatsDuType('tempo')).toEqual(['continu'])
    expect(formatsDuType('echauffement')).toEqual(['series', 'superset'])
    expect(formatsDuType('hiit')).toEqual(['tabata', 'intervalles', 'emom'])
    expect(formatsDuType('sit')).toEqual(['tabata', 'intervalles', 'emom'])
    expect(formatsDuType('seuil')).toEqual(['intervalles'])
    expect(formatsDuType('liit')).toEqual(['intervalles'])
    expect(formatsDuType('contraste')).toContain('series')
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

import { chargeParMain } from '../../src/espace/donnees/banque.js'
describe('chargeParMain', () => {
  it('vaut pour les haltères seulement', () => {
    expect(chargeParMain('Haltère')).toBe(true)
    expect(chargeParMain('haltères')).toBe(true)
    expect(chargeParMain('Barre')).toBe(false)
    expect(chargeParMain('Kettlebell')).toBe(false)
    expect(chargeParMain('')).toBe(false)
  })
})
