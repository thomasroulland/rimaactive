import { describe, it, expect } from 'vitest'
import { nouveauProgramme, dupliquerSemaine, ajouterElement, nouvelId } from '../../src/espace/donnees/programme.js'

const sansIds = (o) => JSON.parse(JSON.stringify(o, (k, v) => (k === 'id' ? undefined : v)))

describe('nouvelId', () => {
  it('unique', () => {
    expect(nouvelId()).not.toBe(nouvelId())
    expect(typeof nouvelId()).toBe('string')
  })
})

describe('nouveauProgramme', () => {
  it('brouillon avec séances vides et jours par défaut', () => {
    const p = nouveauProgramme({ client: 'u1', nom: 'Reprise', debut: '2026-11-16', semaines: 4, parSemaine: 3 })
    expect(p).toMatchObject({ client: 'u1', nom: 'Reprise', debut: '2026-11-16', parSemaine: 3, statut: 'brouillon' })
    expect(p.semaines).toHaveLength(4)
    expect(p.semaines[0].seances.map((s) => s.jour)).toEqual(['Lundi', 'Mercredi', 'Vendredi'])
    expect(p.semaines[0].seances[0].blocs).toEqual([])
    const ids = p.semaines.flatMap((w) => [w.id, ...w.seances.map((s) => s.id)])
    expect(new Set(ids).size).toBe(ids.length)
  })
  it('une et deux séances par semaine', () => {
    const j = (n) => nouveauProgramme({ client: 'u', nom: 'n', debut: '2026-11-16', semaines: 1, parSemaine: n }).semaines[0].seances.map((s) => s.jour)
    expect(j(1)).toEqual(['Lundi'])
    expect(j(2)).toEqual(['Lundi', 'Jeudi'])
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
