import { describe, it, expect } from 'vitest'
import { estModeleSeance, versModeleSeance, seanceDepuisModele, insererSeance, resumeModele, nouveauModeleSeance } from '../../src/espace/donnees/modelesSeance.js'

const seance = {
  id: 's1', titre: 'Bas du corps', type: 'force', lieu: 'Salle', duree: '60', objectif: 'Force', statut: 'x',
  blocs: [{ id: 'b1', lettre: 'A', format: 'series', elements: [{ id: 'e1', exoId: 'squat', nom: 'Squat', series: '4', reps: '8' }] }],
}
const prog = { semaines: [{ id: 'w1', seances: [{ id: 'a' }, { id: 'b' }] }, { id: 'w2', seances: [] }] }

describe('modèles de séance', () => {
  it('versModeleSeance copie la séance avec de nouveaux identifiants, sans champ étranger', () => {
    const m = versModeleSeance(seance)
    expect(m.genre).toBe('seance')
    expect(m.nom).toBe('Bas du corps')
    expect(m.seance.id).not.toBe('s1')
    expect(m.seance.blocs[0].id).not.toBe('b1')
    expect(m.seance.blocs[0].elements[0]).toMatchObject({ exoId: 'squat', series: '4', reps: '8' })
    expect(m.seance.statut).toBeUndefined()
    expect(seance.blocs[0].id).toBe('b1') // l'original n'est pas touché
    expect(estModeleSeance(m)).toBe(true)
    expect(estModeleSeance({ semaines: [] })).toBe(false)
  })
  it('sans titre, le modèle s’appelle « Séance sans titre »', () => {
    expect(versModeleSeance({ blocs: [] }).nom).toBe('Séance sans titre')
  })
  it('seanceDepuisModele donne une séance neuve à chaque fois', () => {
    const m = versModeleSeance(seance)
    const a = seanceDepuisModele(m), b = seanceDepuisModele(m)
    expect(a.id).not.toBe(b.id)
    expect(a.titre).toBe('Bas du corps')
    expect(a.blocs[0].elements[0].nom).toBe('Squat')
    expect(a.blocs[0].elements[0].id).not.toBe(m.seance.blocs[0].elements[0].id)
  })
  it('insererSeance place la séance au bon endroit sans toucher au programme d’origine', () => {
    const r = insererSeance(prog, 0, { id: 'n' }, 1)
    expect(r.semaines[0].seances.map((x) => x.id)).toEqual(['a', 'n', 'b'])
    expect(insererSeance(prog, 1, { id: 'n' }).semaines[1].seances.map((x) => x.id)).toEqual(['n'])
    expect(prog.semaines[0].seances).toHaveLength(2)
  })
  it('resumeModele compte blocs et exercices', () => {
    expect(resumeModele(versModeleSeance(seance))).toEqual({ blocs: 1, exos: 1, duree: '60' })
    expect(resumeModele(nouveauModeleSeance())).toEqual({ blocs: 0, exos: 0, duree: '' })
  })
})
