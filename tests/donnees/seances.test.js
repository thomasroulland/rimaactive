import { describe, it, expect } from 'vitest'
import {
  dateLongue, dateCourte, prescription, resumeFormat, contenuNotes, contenuFin, RESSENTIS, evolutionCharges, statutSeance,
  texteSerie, detailSeance, exercicesDe,
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
    expect(resumeFormat({ format: 'tabata', tours: '8', travail: '20', repos: '10' })).toBe('TABATA 8 × 20 s / 10 s')
    expect(resumeFormat({ format: 'hiit', tours: '6', travail: '40', repos: '20' })).toBe('HIIT 6 × 40 s / 20 s')
    expect(resumeFormat({ format: 'hiit', travail: '40' })).toBe('HIIT 40 s')
    expect(resumeFormat({ format: 'tabata' })).toBe('TABATA')
  })
})

describe('contenu écrit dans seancesFaites', () => {
  it('notes : statut en cours, seulement les champs permis, sans undefined', () => {
    const c = contenuNotes(base, { series: { e1: [{ charge: 40, reps: '8' }] } })
    expect(c).toEqual({ ...base, statut: 'en cours', series: { e1: [{ charge: '40', reps: '8', rpe: '', fait: true }] } })
    expect(contenuNotes(base, { series: { e1: [{ charge: '40', reps: '8', fait: false }] } }).series.e1[0].fait).toBe(false)
    expect(contenuNotes(base)).not.toHaveProperty('series')
  })
  it('notes et blocs : ajoutés seulement s’ils ne sont pas vides', () => {
    expect(contenuNotes(base, {})).not.toHaveProperty('notes')
    expect(contenuNotes(base, {})).not.toHaveProperty('blocs')
    expect(contenuNotes(base, { notes: { e1: 'Dur' } }).notes).toEqual({ e1: 'Dur' })
    expect(contenuNotes(base, { notes: {} })).not.toHaveProperty('notes')
    expect(contenuNotes(base, { blocs: {} })).not.toHaveProperty('blocs')
    expect(contenuNotes(base, { blocs: { b1: { resultat: '12', fait: true } } }).blocs).toEqual({ b1: { resultat: '12', rpe: '', fait: true, note: '' } })
    expect(contenuFin(base, { effort: 5, notes: {}, blocs: {} })).not.toHaveProperty('notes')
    expect(contenuFin(base, { effort: 5, notes: {}, blocs: {} })).not.toHaveProperty('blocs')
    expect(contenuFin(base, { effort: 5, notes: { e1: 'Dur' } }).notes).toEqual({ e1: 'Dur' })
  })
  it('fin : statut terminée, effort 5 à 10, ressenti de la liste, commentaire, plus de douleur', () => {
    const c = contenuFin(base, { effort: 7, ressenti: 'Bien', commentaire: '  Bonne séance ' })
    expect(c).toEqual({
      ...base, statut: 'terminée', effort: 7, ressenti: 'Bien', commentaire: 'Bonne séance', distance: '', temps: '',
    })
    expect(contenuFin(base, {}).effort).toBeNull()
    expect(contenuFin(base, { effort: 4 }).effort).toBeNull()
    expect(contenuFin(base, { effort: 8 }).effort).toBe(8)
    expect(contenuFin(base, { effort: 11 }).effort).toBeNull()
    expect(contenuFin(base, { ressenti: 'Moyen' }).ressenti).toBe('Moyen')
    expect(contenuFin(base, { ressenti: 'Facile' }).ressenti).toBe('')
    expect('douleur' in contenuFin(base, {})).toBe(false)
    expect(RESSENTIS).toEqual(['Très bien', 'Bien', 'Moyen', 'Difficile'])
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

describe('fiche client : texte d’une série', () => {
  it('charge, répétitions et RPE', () => {
    expect(texteSerie({ charge: '60', reps: '5', rpe: '8' })).toBe('60 kg × 5 @8')
    expect(texteSerie({ charge: '17.5', reps: '8', rpe: '' })).toBe('17,5 kg × 8')
  })
  it('valeurs manquantes', () => {
    expect(texteSerie({ charge: '', reps: '10', rpe: '7' })).toBe('10 rép. @7')
    expect(texteSerie({ charge: '20', reps: '' })).toBe('20 kg')
    expect(texteSerie({})).toBe('à compléter')
  })
  it('série non cochée : non faite', () => {
    expect(texteSerie({ charge: '60', reps: '5', fait: false })).toBe('non faite')
  })
})

describe('fiche client : détail d’une séance', () => {
  const seance = { blocs: [{ elements: [{ id: 'e1', nom: 'Squat' }, { id: 'e2', nom: 'Rowing' }] }] }
  it('ne garde que les exercices notés, avec leur nom', () => {
    const d = detailSeance(seance, { e1: [{ charge: '10', reps: '5' }] })
    expect(d.map((x) => x.nom)).toEqual(['Squat'])
    expect(d[0].retire).toBe(false)
  })
  it('exercice retiré du programme ou séance introuvable', () => {
    const d = detailSeance(seance, { e1: [{ charge: '10' }], e9: [{ charge: '5' }] })
    expect(d.map((x) => x.nom)).toEqual(['Squat', 'Exercice retiré du programme'])
    expect(d[1].retire).toBe(true)
    expect(detailSeance(null, { e1: [{}] })[0].nom).toBe('Exercice retiré du programme')
    expect(detailSeance(seance, undefined)).toEqual([])
  })
})

describe('exercices des programmes', () => {
  const prog = (nom) => ({ semaines: [{ seances: [{ blocs: [{ elements: [{ id: 'a', exoId: 'x', nom }, { id: 'b', nom: 'Sans exo' }] }] }] }] })
  it('associe éléments et exercices, garde le nom du programme le plus récent (premier)', () => {
    const { exoIdParElement, noms } = exercicesDe([prog('Squat récent'), prog('Squat ancien')])
    expect(exoIdParElement.get('a')).toBe('x')
    expect(exoIdParElement.has('b')).toBe(false)
    expect(noms.get('x')).toBe('Squat récent')
  })
  it('liste vide', () => {
    expect(exercicesDe([]).noms.size).toBe(0)
  })
})

describe('séries vides à la fin de séance', () => {
  it('n’envoie pas de séries vides (elles effaceraient les notes des exercices retirés)', () => {
    expect(contenuFin(base, { effort: 5, series: {} })).not.toHaveProperty('series')
    expect(contenuNotes(base, { series: {} })).not.toHaveProperty('series')
    expect(contenuFin(base, { effort: 5, series: { e1: [] } }).series).toEqual({ e1: [] })
  })
})
