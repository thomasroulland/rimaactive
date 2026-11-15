import { describe, it, expect } from 'vitest'
import { nouveauProgramme, dupliquerSemaine, ajouterElement, ajouterAuBloc, nomBloc, renommerBloc, NOM_BLOC_MAX, nouvelId } from '../../src/espace/donnees/programme.js'

const sansIds = (o) => JSON.parse(JSON.stringify(o, (k, v) => (k === 'id' ? undefined : v)))

describe('nouvelId', () => {
  it('unique', () => {
    expect(nouvelId()).not.toBe(nouvelId())
    expect(typeof nouvelId()).toBe('string')
  })
})

describe('nouveauProgramme', () => {
  it('brouillon avec séances vides, sans jour', () => {
    const p = nouveauProgramme({ client: 'u1', nom: 'Reprise', debut: '2026-11-16', semaines: 4, parSemaine: 3 })
    expect(p).toMatchObject({ client: 'u1', nom: 'Reprise', debut: '2026-11-16', parSemaine: 3, statut: 'brouillon' })
    expect(p.semaines).toHaveLength(4)
    expect(p.semaines[0].seances).toHaveLength(3)
    expect(p.semaines[0].seances.every((s) => s.jour === undefined)).toBe(true)
    expect(p.semaines[0].seances[0].blocs).toEqual([])
    const ids = p.semaines.flatMap((w) => [w.id, ...w.seances.map((s) => s.id)])
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('une et deux séances par semaine', () => {
    const j = (n) => nouveauProgramme({ client: 'u', nom: 'n', debut: '2026-11-16', semaines: 1, parSemaine: n }).semaines[0].seances
    expect(j(1)).toHaveLength(1)
    expect(j(2)).toHaveLength(2)
    expect(j(7)).toHaveLength(7)
  })
})

describe('dupliquerSemaine', () => {
  const base = () => {
    const p = nouveauProgramme({ client: 'u', nom: 'n', debut: '2026-11-16', semaines: 2, parSemaine: 2 })
    p.semaines[0].mot = 'Bonne semaine'
    p.semaines[0].seances[0].blocs = [{ id: 'b1', lettre: 'A', elements: [{ id: 'e1', nom: 'Squat', series: '3' }] }]
    return p
  }
  it('copie dans la semaine suivante avec de nouveaux ids', () => {
    const p = base()
    const avant = JSON.stringify(p)
    const q = dupliquerSemaine(p, 0)
    expect(JSON.stringify(p)).toBe(avant)
    expect(q.semaines).toHaveLength(2)
    expect(sansIds(q.semaines[1])).toEqual(sansIds(p.semaines[0]))
    expect(q.semaines[1].id).not.toBe(p.semaines[0].id)
    expect(q.semaines[1].seances[0].blocs[0].id).not.toBe('b1')
    expect(q.semaines[1].seances[0].blocs[0].elements[0].id).not.toBe('e1')
    expect(q.semaines[0]).toEqual(p.semaines[0])
  })
  it('ajoute à la fin si dernière semaine', () => {
    const p = base()
    const q = dupliquerSemaine(p, 1)
    expect(q.semaines).toHaveLength(3)
    expect(sansIds(q.semaines[2])).toEqual(sansIds(p.semaines[1]))
    expect(p.semaines).toHaveLength(2)
  })
})

describe('ajouterElement', () => {
  it('copie l exercice sans lien avec la source', () => {
    const p = nouveauProgramme({ client: 'u', nom: 'n', debut: '2026-11-16', semaines: 1, parSemaine: 1 })
    p.semaines[0].seances[0].blocs = [{ id: 'b1', lettre: 'A', elements: [] }]
    const exo = { id: 'x1', nom: 'Squat', consignes: 'Dos droit', muscles: ['jambes'], photos: ['a.jpg'] }
    const q = ajouterElement(p, { s: 0, se: 0, b: 0 }, exo)
    expect(p.semaines[0].seances[0].blocs[0].elements).toHaveLength(0)
    const e = q.semaines[0].seances[0].blocs[0].elements[0]
    expect(e).toMatchObject({ exoId: 'x1', nom: 'Squat', consignes: 'Dos droit', muscles: ['jambes'], photos: ['a.jpg'] })
    expect(e.id).toBeTruthy()
    exo.nom = 'Autre'; exo.muscles.push('dos'); exo.photos.push('b.jpg')
    expect(e.nom).toBe('Squat'); expect(e.muscles).toEqual(['jambes']); expect(e.photos).toEqual(['a.jpg'])
  })
})

describe('dupliquerProgramme', () => {
  it('copie tout en brouillon, avec de nouveaux identifiants, le nom et le début choisis', async () => {
    const { nouveauProgramme, ajouterAuBloc, dupliquerProgramme } = await import('../../src/espace/donnees/programme.js')
    let p = nouveauProgramme({ client: 'A', nom: 'Force', debut: '2026-11-02', semaines: 2, parSemaine: 2 })
    p = ajouterAuBloc(p, { s: 0, se: 0 }, 'A', { id: 'squat', nom: 'Squat' })
    const original = { id: 'P1', majLe: 'x', statut: 'publié', ...p }
    const c = dupliquerProgramme({ ...original, statut: 'publié' }, { nom: 'Force (suite)', debut: '2026-11-30' })
    expect(c.id).toBeUndefined()
    expect(c.majLe).toBeUndefined()
    expect(c).toMatchObject({ nom: 'Force (suite)', debut: '2026-11-30', statut: 'brouillon', client: 'A' })
    expect(c.semaines).toHaveLength(2)
    expect(c.semaines[0].id).not.toBe(p.semaines[0].id)
    expect(c.semaines[0].seances[0].id).not.toBe(p.semaines[0].seances[0].id)
    expect(c.semaines[0].seances[0].blocs[0].elements[0].id).not.toBe(p.semaines[0].seances[0].blocs[0].elements[0].id)
    expect(c.semaines[0].seances[0].blocs[0].elements[0].exoId).toBe('squat')
  })
})

import { ordreProgrammes } from '../../src/espace/donnees/programme.js'
describe('ordreProgrammes', () => {
  const p = (id, debut, nb = 4, statut = 'publié') => ({ id, debut, statut, semaines: Array.from({ length: nb }, () => ({})) })
  it('en cours, puis prochains (plus proche d’abord), puis passés (plus récent d’abord)', () => {
    const liste = [p('passe1', '2026-09-01'), p('futur2', '2027-01-04'), p('encours', '2026-11-02'), p('futur1', '2026-12-07'), p('passe2', '2026-10-01')]
    expect(ordreProgrammes(liste, '2026-11-14').map((x) => x.id)).toEqual(['encours', 'futur1', 'futur2', 'passe2', 'passe1'])
  })
})

import { rafraichirExercices } from '../../src/espace/donnees/programme.js'
describe('rafraichirExercices', () => {
  const prog = { semaines: [{ seances: [{ blocs: [{ elements: [{ id: 'e1', exoId: 'X', nom: 'Squat', photos: [], consignes: '', muscles: [], musclesSecondaires: [], lateralites: [], lateralite: '', series: '3' }, { id: 'e2', exoId: 'Z', nom: 'Autre' }] }] }] }] }
  it('recopie la photo ajoutée plus tard dans la fiche, sans toucher au reste', () => {
    const r = rafraichirExercices(prog, [{ id: 'X', nom: 'Squat', photos: ['exercices/X/a.jpg'], consignes: 'Dos droit', muscles: ['Quadriceps'] }])
    const el = r.semaines[0].seances[0].blocs[0].elements
    expect(el[0]).toMatchObject({ photos: ['exercices/X/a.jpg'], consignes: 'Dos droit', muscles: ['Quadriceps'], series: '3' })
    expect(el[1]).toEqual({ id: 'e2', exoId: 'Z', nom: 'Autre' })
  })
  it('renvoie le même objet si tout est déjà à jour', () => {
    expect(rafraichirExercices(prog, [{ id: 'X', nom: 'Squat', photos: [], consignes: '', muscles: [] }])).toBe(prog)
  })
})

describe('rafraichirExercices et latéralité', () => {
  it('garde la façon choisie si elle est encore possible, sinon prend la première cochée', () => {
    const p = (lat) => ({ semaines: [{ seances: [{ blocs: [{ elements: [{ id: 'e', exoId: 'L', nom: 'Leg extension', lateralites: ['bilateral', 'unilateral'], lateralite: lat }] }] }] }] })
    const fiche = [{ id: 'L', nom: 'Leg extension', lateralites: ['bilateral', 'unilateral'] }]
    expect(rafraichirExercices(p('unilateral'), fiche).semaines[0].seances[0].blocs[0].elements[0].lateralite).toBe('unilateral')
    const r = rafraichirExercices(p('bstance'), fiche)
    expect(r.semaines[0].seances[0].blocs[0].elements[0].lateralite).toBe('bilateral')
  })
})

import { aUneSuite } from '../../src/espace/donnees/programme.js'

describe('aUneSuite', () => {
  const actuel = { id: 'a', client: 'u1', debut: '2026-11-02' }
  it('vrai si un autre programme du coaché commence après', () => {
    expect(aUneSuite(actuel, [actuel, { id: 'b', client: 'u1', debut: '2026-11-30', statut: 'brouillon' }])).toBe(true)
  })
  it('faux sinon (plus ancien, autre coaché, sans date)', () => {
    expect(aUneSuite(actuel, [actuel, { id: 'c', client: 'u1', debut: '2026-10-01' }, { id: 'd', client: 'u2', debut: '2026-12-01' }, { id: 'e', client: 'u1', debut: '' }])).toBe(false)
    expect(aUneSuite(null, [])).toBe(false)
  })
})

describe('nom des blocs', () => {
  const base = () => {
    let p = nouveauProgramme({ client: 'c', nom: 'P', debut: '2026-11-16', semaines: 1, parSemaine: 1 })
    p = ajouterAuBloc(p, { s: 0, se: 0 }, 'A', { id: 'e1', nom: 'Squat' })
    return ajouterAuBloc(p, { s: 0, se: 0 }, 'B', { id: 'e2', nom: 'Pompes' })
  }
  const blocs = (p) => p.semaines[0].seances[0].blocs
  it('sans nom, le bloc s\'appelle « Bloc A »', () => {
    expect(nomBloc({ lettre: 'A' })).toBe('Bloc A')
    expect(nomBloc({ lettre: 'B', nom: '   ' })).toBe('Bloc B')
    expect(nomBloc({ lettre: 'B', nom: ' Force haut du corps ' })).toBe('Force haut du corps')
  })
  it('renomme un seul bloc sans toucher aux lettres ni aux codes', () => {
    const p = renommerBloc(base(), { s: 0, se: 0 }, 'A', 'Échauffement')
    expect(blocs(p).map((b) => b.lettre)).toEqual(['A', 'B'])
    expect(blocs(p)[0].nom).toBe('Échauffement')
    expect(blocs(p)[1].nom).toBeUndefined()
    expect(blocs(p)[0].elements[0].exoId).toBe('e1')
  })
  it('nettoie les espaces, coupe à 30 caractères et efface avec un nom vide', () => {
    let p = renommerBloc(base(), { s: 0, se: 0 }, 'B', '  Force   haut   du corps  ')
    expect(blocs(p)[1].nom).toBe('Force haut du corps')
    p = renommerBloc(p, { s: 0, se: 0 }, 'B', 'x'.repeat(80))
    expect(blocs(p)[1].nom).toHaveLength(NOM_BLOC_MAX)
    p = renommerBloc(p, { s: 0, se: 0 }, 'B', '   ')
    expect('nom' in blocs(p)[1]).toBe(false)
  })
  it('ne modifie pas le programme d\'origine et ignore une lettre inconnue', () => {
    const p = base()
    const q = renommerBloc(p, { s: 0, se: 0 }, 'A', 'Cardio')
    expect(blocs(p)[0].nom).toBeUndefined()
    expect(blocs(renommerBloc(p, { s: 0, se: 0 }, 'Z', 'Rien'))).toEqual(blocs(p))
    expect(q).not.toBe(p)
  })
  it('la duplication d\'une semaine garde les noms de blocs', () => {
    const p = dupliquerSemaine({ ...renommerBloc(base(), { s: 0, se: 0 }, 'A', 'Échauffement'), semaines: renommerBloc(base(), { s: 0, se: 0 }, 'A', 'Échauffement').semaines }, 0)
    expect(p.semaines[1].seances[0].blocs[0].nom).toBe('Échauffement')
  })
})
