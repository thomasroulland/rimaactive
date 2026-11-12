import { describe, it, expect } from 'vitest'
import {
  avancement, blocsDuClient, semaineDe, seancesDeLaSemaine, bonjour, nettoyerMesures, initiales,
} from '../../src/espace/donnees/progression.js'

const JOURS3 = ['Lundi', 'Mercredi', 'Vendredi']
const prog = (debut, nb = 4, id = 'p') => ({
  id, debut, statut: 'publié',
  semaines: Array.from({ length: nb }, (_, i) => ({
    id: `${id}w${i + 1}`,
    seances: JOURS3.map((jour, k) => ({ id: `${id}s${i * 3 + k + 1}`, titre: `S${i * 3 + k + 1}`, jour })),
  })),
})

describe('avancement', () => {
  const p = prog('2026-11-16')
  it('une séance faite', () => {
    expect(avancement(p, new Set(['ps1']))).toEqual({ faites: 1, prevues: 12, numero: 2 })
  })
  it('rien de fait', () => expect(avancement(p, new Set())).toEqual({ faites: 0, prevues: 12, numero: 1 }))
  it('tout fait', () => {
    const tout = new Set(Array.from({ length: 12 }, (_, i) => `ps${i + 1}`))
    expect(avancement(p, tout)).toEqual({ faites: 12, prevues: 12, numero: 12 })
  })
  it('ignore les ids inconnus', () => {
    expect(avancement(p, new Set(['x'])).faites).toBe(0)
  })
})

describe('blocsDuClient', () => {
  const AUJ = '2026-11-12'
  it('passé puis en cours, triés par début', () => {
    const r = blocsDuClient([prog('2026-11-02', 4, 'b'), prog('2026-09-07', 4, 'a')], AUJ)
    expect(r.map((x) => x.etat)).toEqual(['passé', 'en cours'])
    expect(r[0].debut).toBe('2026-09-07')
    expect(r[0].fin).toBe('2026-10-04')
    expect(r[1].fin).toBe('2026-11-29')
    expect(r[1].semaine).toBe(2)
  })
  it('deux programmes commencés : seul le plus récent est en cours', () => {
    const r = blocsDuClient([prog('2026-10-26', 8, 'a'), prog('2026-11-02', 4, 'b')], AUJ)
    expect(r.map((x) => x.etat)).toEqual(['passé', 'en cours'])
  })
  it('programme futur : à venir', () => {
    const r = blocsDuClient([prog('2026-12-01')], AUJ)
    expect(r[0].etat).toBe('à venir')
    expect(r[0].semaine).toBe(1)
  })
  it('en cours + à venir', () => {
    const r = blocsDuClient([prog('2026-12-01', 4, 'b'), prog('2026-11-02', 4, 'a')], AUJ)
    expect(r.map((x) => x.etat)).toEqual(['en cours', 'à venir'])
  })
  it('le plus récent commencé est terminé : passé, pas d en cours', () => {
    const r = blocsDuClient([prog('2026-09-07', 4)], AUJ)
    expect(r.map((x) => x.etat)).toEqual(['passé'])
    expect(r[0].semaine).toBe(4)
  })
  it('le dernier jour est encore en cours', () => {
    expect(blocsDuClient([prog('2026-09-07', 4)], '2026-10-04')[0].etat).toBe('en cours')
  })
  it('liste vide', () => expect(blocsDuClient([], AUJ)).toEqual([]))
})

describe('semaineDe', () => {
  const p = prog('2026-11-16')
  it('avant le début : 1', () => expect(semaineDe(p, '2026-11-12')).toBe(1))
  it('semaine 2', () => expect(semaineDe(p, '2026-11-24')).toBe(2))
  it('après la fin : N', () => expect(semaineDe(p, '2027-03-01')).toBe(4))
})

describe('seancesDeLaSemaine', () => {
  const p = prog('2026-11-16')
  it('séances, numéros, dates, faites', () => {
    const r = seancesDeLaSemaine(p, 2, new Set(['ps4']))
    expect(r.map((x) => x.numero)).toEqual([4, 5, 6])
    expect(r.map((x) => x.date)).toEqual(['2026-11-23', '2026-11-25', '2026-11-27'])
    expect(r.map((x) => x.faite)).toEqual([true, false, false])
    expect(r[0].seance.id).toBe('ps4')
  })
  it('semaine inconnue : vide', () => expect(seancesDeLaSemaine(p, 9, new Set())).toEqual([]))
})

describe('bonjour', () => {
  it('jour et mois en minuscules', () => {
    expect(bonjour('Léa', new Date(2026, 10, 12))).toBe('Bonjour Léa, nous sommes jeudi 12 novembre.')
  })
  it('1er du mois', () => {
    expect(bonjour('Léa', new Date(2026, 11, 1))).toBe('Bonjour Léa, nous sommes mardi 1 décembre.')
  })
})

describe('nettoyerMesures', () => {
  it('virgule française', () => {
    const r = nettoyerMesures({ poids: '72,5' })
    expect(r.ok).toBe(true)
    expect(r.mesure.poids).toBe(72.5)
    expect(r.mesure.taille).toBeNull()
    expect(Object.keys(r.mesure)).toEqual(['poids', 'taille', 'hanches', 'poitrine', 'bras', 'cuisse'])
  })
  it('point, nombres et espaces', () => {
    const r = nettoyerMesures({ poids: ' 72.5 ', taille: 80, cuisse: '55' })
    expect(r.mesure).toMatchObject({ poids: 72.5, taille: 80, cuisse: 55, bras: null })
  })
  it('date conservée', () => {
    expect(nettoyerMesures({ date: '2026-11-12', poids: '70' }).mesure.date).toBe('2026-11-12')
  })
  it('tout vide refusé', () => {
    expect(nettoyerMesures({ poids: '', taille: '  ' })).toEqual({ ok: false, erreur: 'Indiquez au moins une mesure.' })
    expect(nettoyerMesures({})).toEqual({ ok: false, erreur: 'Indiquez au moins une mesure.' })
    expect(nettoyerMesures(undefined).ok).toBe(false)
  })
  it('texte non numérique refusé', () => {
    for (const v of ['abc', '72abc', '7,2,5']) {
      expect(nettoyerMesures({ poids: v })).toEqual({ ok: false, erreur: 'Indiquez des nombres, par exemple 72,5.' })
    }
  })
})

describe('initiales', () => {
  it('deux lettres majuscules', () => expect(initiales('léa', 'martin')).toBe('LM'))
  it('manquants', () => {
    expect(initiales('léa', '')).toBe('L')
    expect(initiales()).toBe('')
  })
})
