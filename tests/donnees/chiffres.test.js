import { describe, it, expect } from 'vitest'
import { chiffresChoisis, valeurChiffre, CHIFFRES_PAR_DEFAUT } from '../../src/espace/donnees/chiffres.js'

const programme = { id: 'P', debut: '2026-11-02', semaines: [
  { seances: [{ id: 's1', blocs: [{ elements: [{ id: 'e1', exoId: 'squat', nom: 'Squat' }] }] }, { id: 's2', blocs: [] }] },
  { seances: [{ id: 's3', blocs: [] }] },
] }
const sf = (date, extra = {}) => ({ statut: 'terminée', date, ...extra })
const seances = [
  sf('2026-11-02', { series: { e1: [{ charge: '40', reps: '8' }] }, duree: 50, effort: 7 }),
  sf('2026-11-09', { series: { e1: [{ charge: '47,5', reps: '8' }] }, duree: 75, effort: 8, distance: '5,2' }),
  sf('2026-11-10', { distance: '3', temps: '0:20:00' }),
]
const ctx = { programme, programmes: [programme], faites: new Set(['s1', 's2']), seances, mesures: [
  { date: '2026-11-01', poids: 70, taille: 80 }, { date: '2026-11-20', poids: 68.5, taille: 77 },
] }

describe('chiffres de « Ma progression »', () => {
  it('par défaut : séances, progrès, poids ; une valeur abîmée revient au défaut', () => {
    expect(chiffresChoisis({})).toEqual(CHIFFRES_PAR_DEFAUT)
    expect(chiffresChoisis({ chiffresProgression: ['poids', 'inconnu', 'effort'] })).toEqual(CHIFFRES_PAR_DEFAUT)
    expect(chiffresChoisis({ chiffresProgression: ['poids', 'progres:squat', 'effort'] })).toEqual(['poids', 'progres:squat', 'effort'])
  })
  it('calcule chaque chiffre', () => {
    expect(valeurChiffre('seances', ctx)).toMatchObject({ valeur: '2', unite: '/ 3', barre: 2 / 3 })
    expect(valeurChiffre('progres:squat', ctx)).toMatchObject({ valeur: '+7,5', unite: 'kg', libelle: 'au squat' })
    expect(valeurChiffre('poids', ctx)).toMatchObject({ valeur: '−1,5', unite: 'kg' })
    expect(valeurChiffre('taille', ctx)).toMatchObject({ valeur: '−3', unite: 'cm', libelle: 'de tour de taille' })
    expect(valeurChiffre('semaines', ctx)).toMatchObject({ valeur: '1', unite: '/ 2' })
    expect(valeurChiffre('distance', ctx)).toMatchObject({ valeur: '8,2', unite: 'km' })
    expect(valeurChiffre('temps', ctx)).toMatchObject({ valeur: '2 h 25' })
    expect(valeurChiffre('effort', ctx)).toMatchObject({ valeur: '7,5', unite: '/ 10' })
  })
  it('sans données : un tiret et une phrase d’attente', () => {
    const rien = { programme: null, programmes: [], faites: new Set(), seances: [], mesures: [] }
    for (const c of ['progres', 'poids', 'taille', 'distance', 'temps', 'effort', 'semaines']) expect(valeurChiffre(c, rien).valeur).toBe('—')
  })
})
