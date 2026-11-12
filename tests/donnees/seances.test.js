import { describe, it, expect } from 'vitest'
import {
  dateLongue, dateCourte, prescription, resumeFormat, contenuNotes, contenuFin, evolutionCharges, statutSeance,
} from '../../src/espace/donnees/seances.js'

const base = { client: 'A', programme: 'P1', seance: 'S1', date: '2026-11-16', majLe: 'T' }

describe('textes de dates', () => {
  it('écrit les jours en français sans passer par le fuseau', () => {
    expect(dateLongue('2026-11-16')).toBe('lundi 16 novembre')
    expect(dateLongue('2027-01-03')).toBe('dimanche 3 janvier')
    expect(dateCourte('2026-02-01')).toBe('1 févr.')
    expect(dateLongue('')).toBe('')
  })
})

describe('prescription', () => {
  it('résume ce que Marie a prévu', () => {
    expect(prescription({ series: '3', reps: '8', charge: '42.5', rpe: '7', repos: '90 s' }))
      .toBe('3 × 8 · 42,5 kg · RPE 7 · repos 90 s')
    expect(prescription({ series: '3', reps: '10', rpe: '7' }, false)).toBe('10')
    expect(prescription({})).toBe('')
  })
  it('résume le format du bloc', () => {
    expect(resumeFormat({ format: 'series' })).toBe('Séries classiques')
    expect(resumeFormat({ format: 'emom', duree: '12' })).toBe('EMOM 12 min')
  })
})

describe('contenu écrit dans seancesFaites', () => {
  it('notes : statut en cours, seulement les champs permis, sans undefined', () => {
    const c = contenuNotes(base, { series: { e1: [{ charge: 40, reps: '8' }] } })
    expect(c).toEqual({ ...base, statut: 'en cours', series: { e1: [{ charge: '40', reps: '8', rpe: '', fait: true }] } })
    expect(contenuNotes(base, { series: { e1: [{ charge: '40', reps: '8', fait: false }] } }).series.e1[0].fait).toBe(false)
    expect(contenuNotes(base)).not.toHaveProperty('series')
  })
  it('fin : statut terminée, douleur vidée quand la réponse est non', () => {
    const c = contenuFin(base, { effort: 7, ressenti: 'Bien', douleur: { oui: false, endroit: 'genou' } })
    expect(c).toEqual({
      ...base, statut: 'terminée', effort: 7, ressenti: 'Bien', douleur: { oui: false, endroit: '', note: '' }, distance: '', temps: '',
    })
    expect(contenuFin(base, { douleur: { oui: true, endroit: ' genou ', note: 'x' } }).douleur).toEqual({ oui: true, endroit: 'genou', note: 'x' })
    expect(contenuFin(base, {}).effort).toBeNull()
  })
})

describe('affichage', () => {
  it('évolution des charges', () => {
    expect(evolutionCharges([{ charge: '40' }])).toBe('Une seule séance notée sur la période')
    expect(evolutionCharges([{ charge: '40' }, { charge: '42,5' }])).toBe('+2,5 kg sur la période')
    expect(evolutionCharges([{ charge: '40' }, { charge: '40' }])).toBe('Charge stable sur la période')
  })
  it('statut d’une séance', () => {
    const sf = [{ programme: 'P1', seance: 'S1', statut: 'en cours' }, { programme: 'P1', seance: 'S2', statut: 'terminée' }]
    expect(statutSeance(sf, 'P1', 'S1')).toBe('En cours')
    expect(statutSeance(sf, 'P1', 'S2')).toBe('Faite')
    expect(statutSeance(sf, 'P2', 'S1')).toBe('À faire')
  })
})
