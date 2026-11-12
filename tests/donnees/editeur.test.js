import { describe, it, expect } from 'vitest'
import { nouveauProgramme, semaineVide, ajouterAuBloc, retirerElement, nouvelleSemaine, nouvelleSeance } from '../../src/espace/donnees/programme.js'
import { lundiDe, dateLongue } from '../../src/espace/donnees/calculs.js'

const prog = () => nouveauProgramme({ client: 'u', nom: 'n', debut: '2026-11-16', semaines: 2, parSemaine: 2 })
const exo = (id, nom) => ({ id, nom, consignes: '', muscles: [], photos: [] })

describe('semaineVide', () => {
  it('vraie pour une semaine créée par défaut', () => {
    expect(semaineVide(prog().semaines[0])).toBe(true)
    expect(semaineVide(nouvelleSemaine(3))).toBe(true)
  })
  it('fausse dès qu’un mot, un titre ou un exercice est présent', () => {
    const p = prog()
    expect(semaineVide({ ...p.semaines[0], mot: 'Courage' })).toBe(false)
    const q = prog(); q.semaines[0].seances[1].titre = 'Haut du corps'
    expect(semaineVide(q.semaines[0])).toBe(false)
    expect(semaineVide(ajouterAuBloc(prog(), { s: 0, se: 0 }, 'A', exo('x', 'Squat')).semaines[0])).toBe(false)
  })
})

describe('ajouterAuBloc / retirerElement', () => {
  it('crée les blocs dans l’ordre des lettres et copie l’exercice', () => {
    let p = ajouterAuBloc(prog(), { s: 0, se: 0 }, 'B', exo('b', 'Pompes'))
    p = ajouterAuBloc(p, { s: 0, se: 0 }, 'A', exo('a', 'Squat'))
    p = ajouterAuBloc(p, { s: 0, se: 0 }, 'A', exo('c', 'Fentes'))
    const blocs = p.semaines[0].seances[0].blocs
    expect(blocs.map((b) => b.lettre)).toEqual(['A', 'B'])
    expect(blocs[0].format).toBe('series')
    expect(blocs[0].elements.map((e) => e.nom)).toEqual(['Squat', 'Fentes'])
  })
  it('un bloc vidé disparaît et les lettres se suivent', () => {
    let p = ajouterAuBloc(prog(), { s: 0, se: 0 }, 'A', exo('a', 'Squat'))
    p = ajouterAuBloc(p, { s: 0, se: 0 }, 'B', exo('b', 'Pompes'))
    const id = p.semaines[0].seances[0].blocs[0].elements[0].id
    const avant = JSON.stringify(p)
    const r = retirerElement(p, { s: 0, se: 0 }, id)
    expect(JSON.stringify(p)).toBe(avant)
    expect(r.semaines[0].seances[0].blocs.map((b) => [b.lettre, b.elements[0].nom])).toEqual([['A', 'Pompes']])
  })
  it('nouvelle séance du type demandé', () => {
    expect(nouvelleSeance('course', 'Mercredi')).toMatchObject({ type: 'course', jour: 'Mercredi', blocs: [] })
  })
})

describe('lundiDe / dateLongue', () => {
  it('ramène au lundi de la semaine', () => {
    expect(lundiDe('2026-11-12')).toBe('2026-11-09')
    expect(lundiDe('2026-11-16')).toBe('2026-11-16')
    expect(lundiDe('2026-11-22')).toBe('2026-11-16')
    expect(lundiDe('2027-01-01')).toBe('2026-12-28')
  })
  it('écrit la date en français', () => {
    expect(dateLongue('2026-11-16')).toBe('lundi 16 novembre 2026')
  })
})
