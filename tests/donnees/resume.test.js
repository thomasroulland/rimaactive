import { describe, it, expect } from 'vitest'
import { meilleurProgres, ecartPoids, effortMoyen, frNombre } from '../../src/espace/donnees/resume.js'

const programme = { semaines: [{ seances: [{ blocs: [{ elements: [
  { id: 'e1', exoId: 'squat', nom: 'Squat' }, { id: 'e2', exoId: 'pompes', nom: 'Pompes' },
] }] }] }] }
const sf = (date, series, extra = {}) => ({ statut: 'terminée', date, series, ...extra })

describe('meilleurProgres', () => {
  it('garde l’exercice qui a le plus progressé', () => {
    const seances = [
      sf('2026-11-02', { e1: [{ charge: '16', reps: '10' }], e2: [{ charge: '0', reps: '10' }] }),
      sf('2026-11-09', { e1: [{ charge: '20', reps: '10' }], e2: [{ charge: '2', reps: '10' }] }),
    ]
    expect(meilleurProgres([programme], seances)).toEqual({ nom: 'Squat', ecart: 4, derniere: 20 })
  })
  it('renvoie null sans progression', () => {
    expect(meilleurProgres([programme], [sf('2026-11-02', { e1: [{ charge: '16' }] })])).toBeNull()
  })
})

describe('ecartPoids', () => {
  it('compare la première et la dernière mesure, dans l’ordre des dates', () => {
    expect(ecartPoids([{ date: '2026-11-10', poids: 77 }, { date: '2026-11-01', poids: 78.5 }, { date: '2026-11-05' }])).toBe(-1.5)
  })
  it('renvoie null avec moins de deux poids', () => { expect(ecartPoids([{ date: '2026-11-01', poids: 78 }])).toBeNull() })
})

describe('effortMoyen', () => {
  it('moyenne des 3 dernières séances terminées avec un effort', () => {
    const s = [sf('2026-11-01', {}, { effort: 5 }), sf('2026-11-03', {}, { effort: 6 }), sf('2026-11-05', {}, { effort: 7 }), sf('2026-11-07', {}, { effort: 8 }), { statut: 'en cours', date: '2026-11-09', effort: 10 }]
    expect(effortMoyen(s)).toBe(7)
  })
  it('renvoie null sans effort', () => { expect(effortMoyen([sf('2026-11-01', {})])).toBeNull() })
})

describe('frNombre', () => {
  it('écrit à la française avec ou sans signe', () => {
    expect(frNombre(72.5)).toBe('72,5')
    expect(frNombre(-1.5, true)).toBe('−1,5')
    expect(frNombre(4, true)).toBe('+4')
  })
})
