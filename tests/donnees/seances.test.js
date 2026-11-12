import { describe, it, expect } from 'vitest'
import {
  dateLongue, dateCourte, prescription, resumeFormat, contenuNotes, contenuFin, RESSENTIS, evolutionCharges, statutSeance,
  texteSerie, detailSeance, exercicesDe, lignesExercice, champResultat, avecChargeSeule, secondes, allureVitesse, saisirSerie,
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

describe('écran de la séance', () => {
  it('écrit la prescription comme la maquette', () => {
    expect(lignesExercice({ series: '4', reps: '5', charge: '90', repos: '2 min' })).toEqual({ prescription: '4 × 5 · 90 kg', details: 'Repos 2 min' })
    expect(lignesExercice({ series: '4', reps: '8', charge: '2.5', tempo: '3-1-1', rpe: '7' }).details).toBe('Tempo 3-1-1 · RPE 7')
    expect(lignesExercice({ series: '3', reps: '10', charge: '0' }).prescription).toBe('3 × 10 · poids du corps')
    expect(lignesExercice({ series: '3', reps: '10', charge: '' }).prescription).toBe('3 × 10 · charge libre')
    expect(lignesExercice({ series: '3', reps: '6', pct: '75' }).prescription).toBe('3 × 6 · 75 % de 1RM')
    expect(lignesExercice({}).prescription).toBe('')
    expect(lignesExercice({ reps: '12', charge: '20' }, false)).toEqual({ prescription: '12 reps · 20 kg', details: '' })
    expect(lignesExercice({ reps: '20 s', charge: '0', repos: '1 min' }, false)).toEqual({ prescription: '20 s · poids du corps', details: '' })
  })

  it('résultat de bloc : libellé et aide selon le format', () => {
    expect(champResultat({ format: 'emom', duree: '10' })).toEqual({ label: 'Minutes réussies', aide: 'sur 10' })
    expect(champResultat({ format: 'amrap', duree: '12' })).toEqual({ label: 'Tours faits', aide: '' })
    expect(champResultat({ format: 'tabata', tours: '8' })).toEqual({ label: 'Tours faits', aide: 'sur 8' })
    expect(champResultat({ format: 'hiit' })).toEqual({ label: 'Tours faits', aide: '' })
    expect(champResultat({ format: 'series' })).toBeNull()
  })

  it('charge seule : EMOM et AMRAP, sauf au poids du corps', () => {
    expect(avecChargeSeule({ format: 'emom' }, { charge: '20' })).toBe(true)
    expect(avecChargeSeule({ format: 'amrap' }, { charge: '' })).toBe(true)
    expect(avecChargeSeule({ format: 'emom' }, { charge: '0' })).toBe(false)
    expect(avecChargeSeule({ format: 'tabata' }, { charge: '20' })).toBe(false)
  })

  it('allure et vitesse d’une sortie', () => {
    expect(secondes('0:30:00')).toBe(1800)
    expect(secondes('30:00')).toBe(1800)
    expect(secondes('30')).toBeNull()
    expect(secondes('0:3a:00')).toBeNull()
    expect(allureVitesse('4,5', '0:30:10')).toEqual({ allure: '6:42 /km', vitesse: '9,0 km/h' })
    expect(allureVitesse('', '0:30:00')).toEqual({ allure: '–', vitesse: '–' })
  })

  it('saisir une série la coche et reprend le prévu dans les cases vides', () => {
    const el = { charge: '90', reps: '5' }
    const vide = { charge: '', reps: '', rpe: '', fait: false }
    expect(saisirSerie(vide, 'rpe', '7', el)).toEqual({ charge: '90', reps: '5', rpe: '7', fait: true })
    expect(saisirSerie(vide, 'charge', '', el)).toEqual({ charge: '', reps: '5', rpe: '', fait: true })
    expect(saisirSerie(vide, 'fait', true, el)).toEqual({ charge: '90', reps: '5', rpe: '', fait: true })
    expect(saisirSerie({ charge: '95', reps: '4', rpe: '', fait: true }, 'fait', false, el)).toEqual({ charge: '95', reps: '4', rpe: '', fait: false })
  })

  it('course : distance et temps gardés au fil de la saisie, seulement s’ils sont fournis', () => {
    expect(contenuNotes(base, { distance: ' 4,5 ', temps: '0:30:00' })).toMatchObject({ distance: '4,5', temps: '0:30:00' })
    expect(contenuNotes(base, { notes: { e1: 'x' } })).not.toHaveProperty('distance')
  })
})
