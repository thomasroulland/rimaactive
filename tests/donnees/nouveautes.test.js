import { describe, it, expect } from 'vitest'
import { calculerNouveautes, toutVu, etatInitial, marquerVu } from '../../src/espace/donnees/nouveautes.js'

const J = 86400000
const maintenant = Date.parse('2026-11-14T12:00:00Z')
const prog = (id, il, debut = '2026-11-30') => ({ id, nom: id, debut, majLe: maintenant - il * J })
const sf = (id, date, commentaireCoach) => ({ id, date, commentaireCoach, statut: 'terminée' })

describe('calculerNouveautes', () => {
  it('première visite : seulement ce qui est récent', () => {
    const programmes = [prog('a', 2), prog('b', 30), prog('commence', 1, '2026-11-02')]; const seances = [sf('s1', '2026-11-12', 'Bravo'), sf('s2', '2026-10-01', 'Vieux'), sf('s3', '2026-11-13', '')]
    const l = calculerNouveautes({ programmes, seances, vu: etatInitial({ programmes, seances, maintenant }) })
    expect(l.map((n) => n.cle).sort()).toEqual(['c:s1', 'p:a'])
    expect(l.find((n) => n.cle === 'p:a').genre).toBe('programme')
  })
  it('après « tout vu » : rien, puis nouveau programme, modification et commentaire', () => {
    const programmes = [prog('a', 2)]; const seances = [sf('s1', '2026-11-12', 'Bravo')]
    const vu = toutVu({ programmes, seances })
    expect(calculerNouveautes({ programmes, seances, vu, maintenant })).toEqual([])
    const l = calculerNouveautes({
      programmes: [{ ...programmes[0], majLe: maintenant }, prog('b', 40)],
      seances: [sf('s1', '2026-11-12', 'Bravo, on monte'), sf('s4', '2026-09-01', 'Nouveau')],
      vu, maintenant,
    })
    const genres = Object.fromEntries(l.map((n) => [n.cle, n.genre]))
    expect(genres).toEqual({ 'p:a': 'modif', 'p:b': 'programme', 'c:s1': 'commentaire', 'c:s4': 'commentaire' })
  })
  it('accepte les horodatages Firestore', () => {
    const p = { id: 'a', majLe: { toMillis: () => maintenant } }
    expect(calculerNouveautes({ programmes: [p], seances: [], vu: etatInitial({ programmes: [p], seances: [], maintenant }) })).toHaveLength(1)
    expect(toutVu({ programmes: [p], seances: [] }).programmes.a).toBe(maintenant)
  })
})

describe('marquerVu', () => {
  it('retire une seule nouveauté', () => {
    const programmes = [prog('a', 1)]; const seances = [sf('s1', '2026-11-12', 'Bravo')]
    const vu = { programmes: {}, commentaires: {} }
    const [premiere] = calculerNouveautes({ programmes, seances, vu })
    expect(calculerNouveautes({ programmes, seances, vu: marquerVu(vu, premiere) })).toHaveLength(1)
  })
})
