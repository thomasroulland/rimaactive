import { describe, it, expect } from 'vitest'
import {
  JOURS, ajoutJours, ecartJours, semaineCourante, listeSeances, etatAccueil,
  preRemplir, fusionnerNotes, meilleuresCharges, regularite,
} from '../../src/espace/donnees/calculs.js'

const el = (id, extra = {}) => ({ id, nom: id, series: '3', reps: '5', ...extra })
const seance = (id, jour, elements = []) => ({ id, titre: id, jour, blocs: [{ id: 'b' + id, elements }] })
const prog = (semaines, debut = '2026-11-16') => ({ id: 'p1', debut, semaines })

describe('dates', () => {
  it('JOURS', () => expect(JOURS).toHaveLength(7))
  it('ajoutJours traverse mois, années et changements d heure', () => {
    expect(ajoutJours('2026-11-16', 9)).toBe('2026-11-25')
    expect(ajoutJours('2026-12-30', 3)).toBe('2027-01-02')
    expect(ajoutJours('2026-03-29', 1)).toBe('2026-03-30')
    expect(ajoutJours('2026-10-25', -1)).toBe('2026-10-24')
  })
  it('ecartJours', () => {
    expect(ecartJours('2026-11-16', '2026-11-23')).toBe(7)
    expect(ecartJours('2026-11-23', '2026-11-16')).toBe(-7)
    expect(ecartJours('2026-03-28', '2026-03-30')).toBe(2)
  })
})

describe('semaineCourante', () => {
  it('valeurs du brief', () => {
    expect(semaineCourante('2026-11-16', '2026-11-15', 4)).toBe(0)
    expect(semaineCourante('2026-11-16', '2026-11-16', 4)).toBe(1)
    expect(semaineCourante('2026-11-16', '2026-11-23', 4)).toBe(2)
    expect(semaineCourante('2026-11-16', '2027-01-30', 4)).toBe(4)
  })
})

describe('listeSeances', () => {
  const p = prog([
    { id: 'w1', seances: [seance('a', 'Lundi')] },
    { id: 'w2', seances: [seance('b', 'Mercredi'), seance('c', 'Dimanche')] },
  ])
  it('date chaque séance du début de sa semaine (plus de jour), fin = dernier jour de la semaine', () => {
    const l = listeSeances(p)
    expect(l.map((x) => x.date)).toEqual(['2026-11-16', '2026-11-23', '2026-11-23'])
    expect(l.map((x) => x.fin)).toEqual(['2026-11-22', '2026-11-29', '2026-11-29'])
    expect(l.map((x) => x.semaine)).toEqual([1, 2, 2])
    expect(l[1].seance.id).toBe('b')
  })
})

describe('etatAccueil', () => {
  const p = prog([
    { id: 'w1', seances: [seance('a', 'Lundi'), seance('b', 'Jeudi')] },
  ])
  it('aucun', () => expect(etatAccueil(null, new Set(), '2026-11-20')).toEqual({ type: 'aucun' }))
  it('bientot', () => expect(etatAccueil(p, new Set(), '2026-11-15')).toEqual({ type: 'bientot', debut: '2026-11-16' }))
  it('prochaine', () => {
    const e = etatAccueil(p, new Set(['a']), '2026-11-17')
    expect(e).toMatchObject({ type: 'prochaine', semaine: 1, date: '2026-11-16' })
    expect(e.seance.id).toBe('b')
    expect(etatAccueil(p, new Set(), '2026-11-16').seance.id).toBe('a')
  })
  it('termine', () => expect(etatAccueil(p, new Set(['a', 'b']), '2026-12-01')).toEqual({ type: 'termine' }))
})

describe('preRemplir', () => {
  it('séries, charge, pourcentage', () => {
    expect(preRemplir({ series: '4', reps: '5', charge: '60' })).toEqual(Array(4).fill({ charge: '60', reps: '5', rpe: '' }))
    expect(preRemplir({ series: '', reps: '12' })).toEqual([{ charge: '', reps: '12', rpe: '' }])
    expect(preRemplir({ series: '3', reps: '5', pct: '75' })).toEqual(Array(3).fill({ charge: '', reps: '5', rpe: '' }))
  })
  it('lignes indépendantes', () => {
    const l = preRemplir({ series: '2', reps: '5' })
    l[0].charge = '10'
    expect(l[1].charge).toBe('')
  })
})

describe('fusionnerNotes', () => {
  const s = seance('a', 'Lundi', [el('e1'), el('e2')])
  it('éléments dans l ordre puis éléments retirés', () => {
    const notes = { e2: [{ charge: '50', reps: '5', rpe: '8' }], retire: [{ charge: '20', reps: '10', rpe: '' }] }
    const r = fusionnerNotes(s, notes)
    expect(r).toHaveLength(3)
    expect(r[0].element.id).toBe('e1')
    expect(r[0].lignes).toHaveLength(3)
    expect(r[1].lignes).toEqual(notes.e2)
    expect(r[2]).toEqual({ element: null, lignes: notes.retire })
  })
  it('sans notes', () => expect(fusionnerNotes(s, undefined)).toHaveLength(2))
})

describe('meilleuresCharges : case « Fait »', () => {
  const m = new Map([['e1', 'squat']])
  it('ignore les séries non cochées, compte celles sans le champ (anciennes notes)', () => {
    const f = [
      { date: '2026-11-20', statut: 'terminée', series: { e1: [{ charge: '80', reps: '5', fait: false }, { charge: '60', reps: '5', fait: true }] } },
      { date: '2026-11-22', statut: 'terminée', series: { e1: [{ charge: '90', reps: '3', fait: false }] } },
      { date: '2026-11-24', statut: 'terminée', series: { e1: [{ charge: '65', reps: '5' }] } },
    ]
    expect(meilleuresCharges(f, m, 'squat')).toEqual([
      { date: '2026-11-20', charge: '60', reps: '5' },
      { date: '2026-11-24', charge: '65', reps: '5' },
    ])
  })
})

describe('meilleuresCharges', () => {
  const m = new Map([['e1', 'squat'], ['e2', 'squat'], ['e3', 'pompes']])
  const f = [
    { date: '2026-11-20', statut: 'terminée', series: { e1: [{ charge: '60', reps: '5' }, { charge: '70', reps: '3' }], e3: [{ charge: '5', reps: '1' }] } },
    { date: '2026-11-18', statut: 'terminée', series: { e2: [{ charge: '55', reps: '5' }, { charge: '', reps: '8' }] } },
    { date: '2026-11-22', statut: 'en cours', series: { e1: [{ charge: '100', reps: '1' }] } },
    { date: '2026-11-24', statut: 'terminée', series: { e1: [{ charge: '', reps: '10' }] } },
  ]
  it('ignore en cours et vides, trie par date', () => {
    expect(meilleuresCharges(f, m, 'squat')).toEqual([
      { date: '2026-11-18', charge: '55', reps: '5' },
      { date: '2026-11-20', charge: '70', reps: '3' },
    ])
  })
})

describe('regularite', () => {
  it('prévues et faites par semaine', () => {
    const p = prog([
      { id: 'w1', seances: [seance('a', 'Lundi'), seance('b', 'Jeudi')] },
      { id: 'w2', seances: [seance('c', 'Lundi')] },
    ])
    expect(regularite(p, new Set(['a', 'c', 'zzz']))).toEqual([
      { semaine: 1, prevues: 2, faites: 1 },
      { semaine: 2, prevues: 1, faites: 1 },
    ])
  })
})
