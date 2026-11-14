// Nouveautés du coaché (14 novembre 2026) : ce que Marie a fait depuis sa dernière visite, calculé à partir des données
// déjà lues (programmes publiés, séances faites). Ce qui a été vu est gardé sur l'appareil (pas besoin de changer les règles
// Firebase) : { programmes: { id: majLe en ms }, commentaires: { idSéanceFaite: texte } }.
// Première visite sur un appareil (rien de gardé) : seulement ce qui date de moins de RECENT jours.
const RECENT = 7
const JOUR = 86400000

const millis = (t) => (typeof t === 'number' ? t : t?.toMillis?.() ?? 0)

export function calculerNouveautes({ programmes, seances, vu }) {
  const liste = []
  for (const p of programmes ?? []) {
    const quand = millis(p.majLe)
    const deja = vu?.programmes?.[p.id]
    if (!quand || (deja !== undefined && quand <= deja)) continue
    liste.push({ cle: `p:${p.id}`, genre: deja === undefined ? 'programme' : 'modif', programme: p, quand })
  }
  for (const s of seances ?? []) {
    const texte = (s.commentaireCoach ?? '').trim()
    if (!texte || vu?.commentaires?.[s.id] === texte) continue
    liste.push({ cle: `c:${s.id}`, genre: 'commentaire', seance: s, texte, quand: millis(s.majLe) || jourMs(s.date) })
  }
  return liste.sort((a, b) => b.quand - a.quand)
}

const jourMs = (iso) => Date.parse(`${iso}T12:00:00Z`) || 0

// État « tout vu » à partir des données actuelles.
export function toutVu({ programmes, seances }) {
  return {
    programmes: Object.fromEntries((programmes ?? []).map((p) => [p.id, millis(p.majLe)])),
    commentaires: Object.fromEntries((seances ?? []).filter((s) => (s.commentaireCoach ?? '').trim()).map((s) => [s.id, s.commentaireCoach.trim()])),
  }
}

// Première visite sur cet appareil : tout est « vu » sauf ce qui a moins de RECENT jours ; un programme déjà commencé
// est connu du coaché, il n'est donc pas annoncé comme nouveau.
export function etatInitial({ programmes, seances, maintenant = Date.now() }) {
  const limite = maintenant - RECENT * JOUR
  const aujourdhui = new Date(maintenant).toISOString().slice(0, 10)
  return toutVu({
    programmes: (programmes ?? []).filter((p) => millis(p.majLe) <= limite || (p.debut && p.debut <= aujourdhui)),
    seances: (seances ?? []).filter((s) => jourMs(s.date) <= limite),
  })
}

// Marque une nouveauté comme vue.
export function marquerVu(vu, n) {
  if (n.genre === 'commentaire') return { ...vu, commentaires: { ...vu.commentaires, [n.seance.id]: n.texte } }
  return { ...vu, programmes: { ...vu.programmes, [n.programme.id]: n.quand } }
}
