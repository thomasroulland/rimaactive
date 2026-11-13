import { describe, it, expect } from 'vitest'
import { suiviCoache } from '../../src/espace/donnees/alertes.js'

// 2 semaines de 2 séances (lundi, jeudi), début lundi 2 novembre 2026
const sem = (rpe, a, b) => ({ rpe, seances: [{ id: a, jour: 'Lundi' }, { id: b, jour: 'Jeudi' }] })
const prog = { id: 'P', debut: '2026-11-02', semaines: [sem('6', 's1', 's2'), sem('', 's3', 's4')] }
const fait = (seance, date, effort) => ({ statut: 'terminée', programme: 'P', seance, date, effort })

describe('suiviCoache', () => {
  it('résume la semaine en cours, les séances faites et l’état des semaines', () => {
    const { resume } = suiviCoache({ programme: prog, seances: [fait('s1', '2026-11-02', 6), fait('s2', '2026-11-05', 6)], aujourdhui: '2026-11-10' })
    expect(resume).toEqual({ semaine: 2, nbSemaines: 2, faites: 2, prevues: 4, semaines: ['faite', 'passee'] })
  })
  it('signale un effort au-dessus du RPE visé de la semaine', () => {
    const { alertes } = suiviCoache({ programme: prog, seances: [fait('s1', '2026-11-02', 8), fait('s2', '2026-11-05', 7)], aujourdhui: '2026-11-06' })
    expect(alertes).toContain('Effort ressenti au-dessus du prévu en S1')
  })
  it('signale les séances prévues non faites et l’absence de séance', () => {
    const { alertes } = suiviCoache({ programme: prog, seances: [fait('s1', '2026-11-02', 6)], aujourdhui: '2026-11-13' })
    expect(alertes).toContain('Aucune séance depuis 11 jours')
    expect(alertes).toContain('3 séances prévues non faites') // s2 (jeu. 5), s3 (lun. 9) et s4 (jeu. 12)
  })
  it('signale une visio trop ancienne, pas avant le seuil', () => {
    expect(suiviCoache({ programme: prog, seances: [], visio: { date: '2026-10-20' }, aujourdhui: '2026-11-04' }).alertes).toContain('Dernière visio il y a 15 jours')
    expect(suiviCoache({ programme: prog, seances: [], visio: { date: '2026-10-25' }, aujourdhui: '2026-11-04' }).alertes).not.toContain('Dernière visio il y a 10 jours')
  })
  it('sans programme : pas de résumé ni d’alerte', () => {
    expect(suiviCoache({ programme: null, seances: [], aujourdhui: '2026-11-04' })).toEqual({ resume: null, alertes: [] })
  })
})

import { chiffresCoache, effortParSemaine } from '../../src/espace/donnees/alertes.js'
describe('chiffresCoache et effortParSemaine', () => {
  const s1 = { ...fait('s1', '2026-11-02', 7), series: { e: [{ rpe: '7', fait: true }, { rpe: '8' }, { rpe: '9', fait: false }] } }
  it('compte les séances, la régularité des séances passées et le RPE moyen des séries faites', () => {
    expect(chiffresCoache({ programme: prog, seances: [s1], aujourdhui: '2026-11-10' })).toEqual({ faites: 1, prevues: 4, regularite: 33, rpeMoyen: 7.5 })
  })
  it('compare le RPE visé à l’effort ressenti, semaine par semaine', () => {
    expect(effortParSemaine(prog, [s1, fait('s2', '2026-11-05', 6)])).toEqual([
      { semaine: 1, vise: 6, ressenti: 6.5, ecart: 0.5 },
      { semaine: 2, vise: null, ressenti: null, ecart: null },
    ])
  })
})
