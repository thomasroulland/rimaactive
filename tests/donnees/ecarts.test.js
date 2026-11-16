import { describe, it, expect } from 'vitest'
import { comparerSeance, casesExercice, detailSeries, bilanSeance } from '../../src/espace/donnees/ecarts.js'

const seance = { id: 's', blocs: [
  { id: 'b1', format: 'series', elements: [
    { id: 'e1', nom: 'Back squat', series: '4', reps: '8', charge: '100' },
    { id: 'e2', nom: 'Développé couché', series: '4', reps: '6', charge: '70' },
    { id: 'e3', nom: 'Extension triceps', series: '3', reps: '12', charge: '30' },
    { id: 'e4', nom: 'Gainage', series: '3', reps: '45 s' },
  ] },
  { id: 'b2', format: 'emom', duree: '10', elements: [{ id: 'e5', nom: 'Burpees' }] },
] }
const l = (charge, reps, fait = true) => ({ charge, reps, rpe: '', fait })
const sf = (series, blocs = {}, statut = 'terminée') => ({ statut, series, blocs })
const tout = {
  e1: [l('100', '8'), l('100', '8'), l('105', '8'), l('105', '8')],
  e2: [l('70', '6'), l('70', '6'), l('70', '4'), l('70', '6', false)],
  e3: [l('30', '12'), l('30', '12'), l('30', '12')],
  e4: [l('', '', false), l('', '', false), l('', '', false)],
}

describe('comparerSeance', () => {
  it('compare chaque exercice au prévu', () => {
    const r = comparerSeance(seance, sf(tout, { b2: { resultat: '8', fait: true } }))
    expect(r.lignes.map((x) => [x.nom, x.statut, x.ecart])).toEqual([
      ['Back squat', 'plus', '5 kg de plus'],
      ['Développé couché', 'moins', '3 séries sur 4, 2 répétitions en moins'],
      ['Extension triceps', 'prevu', 'Comme prévu'],
      ['Gainage', 'pas-fait', 'Pas fait'],
      ['EMOM 10 min', 'moins', '8 minutes sur 10'],
    ])
    expect(r.lignes[1].prevu).toBe('4 × 6 · 70 kg')
    expect(r.lignes[1].fait).toBe('70 × 6, 70 × 6, 70 × 4')
    expect(r.aRegarder).toBe(3)
    expect(r.verdict).toBe('3 exercices à regarder')
  })
  it('tout fait : comme prévu, ou mieux', () => {
    const s = { blocs: [{ id: 'b', elements: seance.blocs[0].elements.slice(0, 3) }] }
    const ok = { ...tout, e1: tout.e3.map(() => l('100', '8')).concat(l('100', '9')), e2: [l('70', '6'), l('70', '6'), l('70', '6'), l('70', '7')] }
    expect(comparerSeance(s, sf(ok)).verdict).toBe('Tout fait comme prévu')
    expect(comparerSeance(s, sf({ ...ok, e1: tout.e1 })).verdict).toBe('Tout fait, 5 kg de plus au back squat')
  })
  it('charge en dessous, fourchette de répétitions, charge à virgule', () => {
    const s = { blocs: [{ id: 'b', elements: [{ id: 'e', nom: 'Rowing', series: '2', reps: '8-10', charge: '42,5' }] }] }
    expect(comparerSeance(s, sf({ e: [l('40', '8'), l('42.5', '9')] })).lignes[0].ecart).toBe('2,5 kg de moins')
    expect(comparerSeance(s, sf({ e: [l('42,5', '8'), l('42,5', '10')] })).lignes[0].statut).toBe('prevu')
  })
  it('séance en cours, séance retirée, exercice retiré, rien de noté', () => {
    expect(comparerSeance(seance, sf(tout, {}, 'en cours')).verdict).toBe('En cours')
    const retiree = comparerSeance(null, sf({ x: [l('50', '5')] }))
    expect(retiree.lignes).toEqual([{ cle: 'x', nom: 'Exercice retiré du programme', prevu: '', fait: '50 × 5', statut: 'retire', ecart: '' }])
    expect(retiree.verdict).toBe('')
    expect(comparerSeance(seance, { statut: 'terminée' }).aRegarder).toBe(5)
  })
})

describe('séance faite : cases, détail et bilan', () => {
  const squat = { id: 'e', series: '4', reps: '10', charge: '16', repos: '90' }
  const l = (reps, charge, extra = {}) => ({ reps, charge, rpe: '', fait: true, ...extra })
  it('comme prévu : tout « ok »', () => {
    const c = casesExercice(squat, [l('10', '16'), l('10', '16'), l('10', '16'), l('10', '16')])
    expect(c.map((x) => x.etat)).toEqual(['ok', 'ok', 'ok', 'vide'])
    expect(c[0].fait).toBe('4')
  })
  it('plus lourd et moins de séries', () => {
    const c = casesExercice(squat, [l('10', '20'), l('10', '20'), l('10', '20')])
    expect(c.find((x) => x.cle === 'charge')).toMatchObject({ fait: '20', prevu: '16', etat: 'plus' })
    expect(c.find((x) => x.cle === 'series')).toMatchObject({ fait: '3', prevu: '4', etat: 'moins' })
  })
  it('plusieurs valeurs : min–max ; séries non cochées ignorées', () => {
    const c = casesExercice(squat, [l('10', '16'), l('8', '16'), l('6', '16', { fait: false })])
    expect(c.find((x) => x.cle === 'mesure')).toMatchObject({ fait: '8–10', etat: 'moins' })
    expect(c.find((x) => x.cle === 'series').fait).toBe('2')
  })
  it('rien noté : cases vides', () => {
    expect(casesExercice(squat, []).every((x) => x.etat === 'vide')).toBe(true)
  })
  it('exercice en durée : lit « duree », pas « reps »', () => {
    const g = { id: 'g', series: '3', reps: '45', charge: '', mesure: 'duree' }
    const c = casesExercice(g, [{ duree: '50', charge: '', fait: true }])
    expect(c.find((x) => x.cle === 'mesure')).toMatchObject({ libelle: 'Durée', prevu: '45 s', fait: '50', etat: 'plus' })
  })
  it('détail série par série', () => {
    const d = detailSeries(squat, [l('8', '35'), l('6', '16'), { ...l('', ''), fait: false }])
    expect(d).toHaveLength(4)
    expect(d[0]).toMatchObject({ n: 1, fait: '8 × 35 kg', etat: 'moins' })
    expect(d[1].etat).toBe('moins')
    expect(d[2]).toMatchObject({ etat: 'non-faite', fait: '' })
    expect(d[3].etat).toBe('non-faite')
    expect(d[0].prevu).toBe('10 × 16 kg')
  })
  it('bilan : séries cochées, séries prévues et RPE moyen', () => {
    const s = { blocs: [{ format: 'series', elements: [squat] }, { format: 'emom', elements: [{ id: 'x', series: '9' }] }] }
    const sf = { series: { e: [l('10', '16', { rpe: '7' }), l('10', '16', { rpe: '8' }), l('10', '16', { fait: false })] } }
    expect(bilanSeance(s, sf)).toEqual({ faites: 2, total: 4, rpeMoyen: 7.5 })
    expect(bilanSeance(s, {})).toEqual({ faites: 0, total: 4, rpeMoyen: null })
  })
})
