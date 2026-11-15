import { describe, it, expect } from 'vitest'
import { apercu, nonLu, nombreNonLus, jourMessage, piecesPossibles } from '../../src/espace/donnees/messages.js'

describe('apercu', () => {
  it('texte, photo, pièce jointe', () => {
    expect(apercu({ texte: '  Salut\n Marie ' })).toBe('Salut Marie')
    expect(apercu({ texte: '', photo: 'x' })).toBe('Photo')
    expect(apercu({ texte: '', piece: { type: 'seance', titre: 'Séance 2' } })).toBe('Séance : Séance 2')
    expect(apercu({ texte: 'x'.repeat(300) })).toHaveLength(200)
  })
})

describe('non lus', () => {
  const conv = { dernier: { auteur: 'client', le: 2000 }, luCoach: 1000, luClient: 2000 }
  it('le dernier message de l’autre, après la lecture', () => {
    expect(nonLu(conv, 'coach')).toBe(true)
    expect(nonLu(conv, 'client')).toBe(false)
    expect(nonLu({ ...conv, luCoach: 3000 }, 'coach')).toBe(false)
    expect(nonLu({ dernier: { auteur: 'coach', le: 5 } }, 'client')).toBe(true)
    expect(nonLu(null, 'coach')).toBe(false)
  })
  it('compte les messages de l’autre après la lecture', () => {
    const m = [{ auteur: 'client', envoyeLe: 500 }, { auteur: 'client', envoyeLe: 1500 }, { auteur: 'coach', envoyeLe: 1600 }, { auteur: 'client', envoyeLe: 1700 }]
    expect(nombreNonLus(m, conv, 'coach')).toBe(2)
  })
})

describe('jourMessage', () => {
  it('aujourd’hui, hier, date', () => {
    const now = new Date(2026, 10, 15, 10).getTime()
    expect(jourMessage(new Date(2026, 10, 15, 8).getTime(), now)).toBe('Aujourd’hui')
    expect(jourMessage(new Date(2026, 10, 14, 23).getTime(), now)).toBe('Hier')
    expect(jourMessage(new Date(2026, 10, 9, 12).getTime(), now)).toBe('lundi 9 novembre')
  })
})

describe('piecesPossibles', () => {
  it('séances numérotées, exercices sans doublon, programmes', () => {
    const p = { id: 'P', nom: 'Force', debut: '2026-11-02', semaines: [
      { seances: [{ id: 's1', titre: 'Haut', blocs: [{ elements: [{ id: 'e1', exoId: 'squat', nom: 'Squat' }, { id: 'e2', exoId: 'pompes', nom: 'Pompes' }] }] }] },
      { seances: [{ id: 's2', titre: '', blocs: [{ elements: [{ id: 'e3', exoId: 'squat', nom: 'Squat' }] }] }] },
    ] }
    const r = piecesPossibles([p])
    expect(r.seances.map((s) => s.titre)).toEqual(['Séance 1 · Haut', 'Séance 2'])
    expect(r.seances[1].sousTitre).toBe('Force · semaine 2')
    expect(r.exercices.map((e) => e.titre)).toEqual(['Pompes', 'Squat'])
    expect(r.programmes).toEqual([{ type: 'programme', programmeId: 'P', titre: 'Force' }])
  })
})
