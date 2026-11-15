// Discussion coach ↔ coaché (15 novembre 2026) : calculs sans Firebase (aperçus, non lus, pièces jointes, jours).
import { listeSeances } from './calculs.js'
import { dateLongue } from './seances.js'

const millis = (t) => (typeof t === 'number' ? t : t?.toMillis?.() ?? 0)

const NOMS_PIECES = { seance: 'Séance', exercice: 'Exercice', programme: 'Programme' }

// Texte court pour la liste des discussions et la pastille (200 caractères au plus, comme les règles l'exigent)
export function apercu({ texte, piece, photo }) {
  const t = (texte ?? '').trim().replace(/\s+/g, ' ')
  if (t) return t.length > 200 ? `${t.slice(0, 199)}…` : t
  if (photo) return 'Photo'
  if (piece) return `${NOMS_PIECES[piece.type] ?? 'Pièce jointe'} : ${piece.titre ?? ''}`.slice(0, 200)
  return ''
}

// Non lu pour `role` ('coach' ou 'client') : le dernier message vient de l'autre et date d'après sa dernière lecture
export function nonLu(conversation, role) {
  const d = conversation?.dernier
  if (!d || d.auteur === role) return false
  const lu = millis(role === 'coach' ? conversation.luCoach : conversation.luClient)
  return millis(d.le) > lu
}

// Nombre de messages de l'autre arrivés après la dernière lecture (messages déjà chargés)
export function nombreNonLus(messages, conversation, role) {
  const lu = millis(role === 'coach' ? conversation?.luCoach : conversation?.luClient)
  return (messages ?? []).filter((m) => m.auteur !== role && millis(m.envoyeLe) > lu).length
}

// Jour d'un message pour les séparateurs : « Aujourd’hui », « Hier » ou « lundi 9 novembre »
export function jourMessage(ms, maintenant = Date.now()) {
  const iso = (x) => {
    const d = new Date(x)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
  const j = iso(ms)
  if (j === iso(maintenant)) return 'Aujourd’hui'
  if (j === iso(maintenant - 86400000)) return 'Hier'
  return dateLongue(j)
}

export function heureMessage(ms) {
  const d = new Date(ms)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

// Ce qu'on peut joindre, d'après les programmes : séances (numérotées comme dans « Ma semaine »), exercices, programmes.
export function piecesPossibles(programmes) {
  const seances = []; const exercices = new Map(); const progs = []
  for (const p of programmes ?? []) {
    progs.push({ type: 'programme', programmeId: p.id, titre: p.nom || 'Programme' })
    listeSeances(p).forEach((x, i) => {
      seances.push({
        type: 'seance', programmeId: p.id, seanceId: x.seance.id,
        titre: x.seance.titre ? `Séance ${i + 1} · ${x.seance.titre}` : `Séance ${i + 1}`,
        sousTitre: `${p.nom || 'Programme'} · semaine ${x.semaine}`,
      })
      for (const b of x.seance.blocs ?? []) {
        for (const el of b.elements ?? []) {
          const cle = el.exoId || el.nom
          if (cle && !exercices.has(cle)) exercices.set(cle, { type: 'exercice', exoId: el.exoId ?? '', programmeId: p.id, elementId: el.id, titre: el.nom || 'Exercice' })
        }
      }
    })
  }
  return {
    seances,
    exercices: [...exercices.values()].sort((a, b) => a.titre.localeCompare(b.titre, 'fr')),
    programmes: progs,
  }
}
