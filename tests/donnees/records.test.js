import { describe, it, expect } from 'vitest'
import { records, nouveauxRecords } from '../../src/espace/donnees/records.js'

const exo = new Map([['e1', 'squat'], ['e2', 'squat'], ['e3', 'pompes']])
const noms = new Map([['squat', 'Squat'], ['pompes', 'Pompes']])
const sf = (id, date, series, statut = 'terminée') => ({ id, date, statut, series })

const s1 = sf('a', '2026-11-02', { e1: [{ charge: '60', reps: '5' }, { charge: '70', reps: '3' }], e3: [{ charge: '', reps: '20' }] })
const s2 = sf('b', '2026-11-05', { e2: [{ charge: '72,5', reps: '3' }, { charge: '80', reps: '2', fait: false }] })
const s3 = sf('c', '2026-11-09', { e1: [{ charge: '72.5', reps: '5' }] })

describe('records', () => {
  it('meilleure charge par exercice, à charge égale le plus de répétitions ; ignore séries non faites et sans charge', () => {
    expect(records([s1, s2, s3], exo, noms)).toEqual([{ exoId: 'squat', nom: 'Squat', charge: 72.5, reps: 5, date: '2026-11-09' }])
  })
  it('ignore les séances non terminées', () => {
    expect(records([sf('x', '2026-11-01', { e1: [{ charge: '100', reps: '1' }] }, 'en cours')], exo, noms)).toEqual([])
  })
})

describe('nouveauxRecords', () => {
  it('record battu par rapport aux séances précédentes', () => {
    expect(nouveauxRecords(s2, [s1, s2, s3], exo, noms)).toEqual([{ exoId: 'squat', nom: 'Squat', charge: 72.5, reps: 3, ancien: { charge: 70, reps: 3 } }])
  })
  it('pas de record la première fois, ni à charge égale', () => {
    expect(nouveauxRecords(s1, [s1, s2, s3], exo, noms)).toEqual([])
    expect(nouveauxRecords(s3, [s1, s2, s3], exo, noms)).toEqual([])
  })
})
