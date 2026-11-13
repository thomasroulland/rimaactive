// Modifications pures d'un programme : chaque fonction renvoie un nouvel objet.

export function nouvelId() {
  return crypto.randomUUID()
}

// Plus de jour (14 novembre 2026) : une séance appartient seulement à sa semaine, dans l'ordre.
function seanceVide() {
  return {
    id: nouvelId(), titre: '', lieu: '', duree: '', objectif: '', type: 'force',
    consigne: '', distance: '', temps: '', blocs: [],
  }
}

export function nouveauProgramme({ client, nom, debut, semaines, parSemaine }) {
  const nb = Math.min(Math.max(Number(parSemaine) || 1, 1), 7)
  return {
    client, nom, debut, parSemaine, statut: 'brouillon',
    semaines: Array.from({ length: semaines }, () => ({
      id: nouvelId(), mot: '', rpe: '', seances: Array.from({ length: nb }, seanceVide),
    })),
  }
}

function copierSemaine(semaine) {
  const c = structuredClone(semaine)
  c.id = nouvelId()
  for (const s of c.seances ?? []) {
    s.id = nouvelId()
    for (const b of s.blocs ?? []) {
      b.id = nouvelId()
      for (const e of b.elements ?? []) e.id = nouvelId()
    }
  }
  return c
}

export function dupliquerSemaine(programme, i) {
  const copie = copierSemaine(programme.semaines[i])
  const p = structuredClone(programme)
  if (i + 1 < p.semaines.length) p.semaines[i + 1] = copie
  else p.semaines.push(copie)
  return p
}

export function ajouterElement(programme, { s, se, b }, exercice) {
  const p = structuredClone(programme)
  p.semaines[s].seances[se].blocs[b].elements.push({
    id: nouvelId(),
    exoId: exercice.id,
    nom: exercice.nom,
    consignes: exercice.consignes ?? '',
    muscles: [...(exercice.muscles ?? [])],
    photos: [...(exercice.photos ?? [])],
    series: '', reps: '', charge: '', pct: '', rpe: '', repos: '', tempo: '', commentaire: '',
  })
  return p
}

// ---------- Éditeur de programme (tâche 8) ----------

export const LETTRES = ['A', 'B', 'C', 'D', 'E', 'F']

export function nouvelleSemaine(parSemaine) {
  return nouveauProgramme({ client: '', nom: '', debut: '', semaines: 1, parSemaine }).semaines[0]
}

export function nouvelleSeance(type = 'force') {
  return { ...seanceVide(), type }
}

const CHAMPS_SEANCE = ['titre', 'lieu', 'duree', 'objectif', 'consigne', 'distance', 'temps']

// Vraie si rien n'a été écrit dans la semaine (séances créées par défaut, sans titre ni exercice)
export function semaineVide(semaine) {
  if (!semaine) return true
  if (String(semaine.mot ?? '').trim() || String(semaine.rpe ?? '').trim()) return false
  return (semaine.seances ?? []).every((s) =>
    CHAMPS_SEANCE.every((c) => !String(s[c] ?? '').trim()) && (s.blocs ?? []).length === 0)
}

// Ajoute un exercice dans le bloc de la lettre donnée (créé à la suite s'il n'existe pas)
export function ajouterAuBloc(programme, { s, se }, lettre, exercice) {
  const p = structuredClone(programme)
  const seance = p.semaines[s].seances[se]
  seance.blocs = seance.blocs ?? []
  let b = seance.blocs.findIndex((x) => x.lettre === lettre)
  if (b < 0) {
    seance.blocs.push({ id: nouvelId(), lettre, format: 'series', duree: '', repos: '', elements: [] })
    seance.blocs.sort((x, y) => x.lettre.localeCompare(y.lettre))
    b = seance.blocs.findIndex((x) => x.lettre === lettre)
  }
  return ajouterElement(p, { s, se, b }, exercice)
}

// Retire un élément ; un bloc devenu vide disparaît et les blocs restants sont renommés A, B, C…
export function retirerElement(programme, { s, se }, elementId) {
  const p = structuredClone(programme)
  const seance = p.semaines[s].seances[se]
  seance.blocs = (seance.blocs ?? [])
    .map((b) => ({ ...b, elements: (b.elements ?? []).filter((e) => e.id !== elementId) }))
    .filter((b) => b.elements.length > 0)
    .map((b, i) => ({ ...b, lettre: LETTRES[i] ?? b.lettre }))
  return p
}

// Avant d'enregistrer : chaque séance déjà faite reprend la version du serveur (rien de ce qui a été
// changé localement sur une séance devenue « faite » pendant l'édition n'est écrit).
export function garderSeancesFaites(local, serveur, faites) {
  if (!serveur || !faites?.size) return local
  const versions = new Map()
  for (const w of serveur.semaines ?? []) for (const s of w.seances ?? []) versions.set(s.id, s)
  const p = structuredClone(local)
  for (const w of p.semaines) {
    w.seances = w.seances.map((s) => (faites.has(s.id) && versions.has(s.id) ? structuredClone(versions.get(s.id)) : s))
  }
  return p
}

// Copie complète d'un programme, en brouillon, avec de nouveaux identifiants partout (13 novembre 2026)
export function dupliquerProgramme(programme, { nom, debut }) {
  const { id, majLe, ...reste } = structuredClone(programme) // eslint-disable-line no-unused-vars
  return { ...reste, nom, debut, statut: 'brouillon', semaines: (reste.semaines ?? []).map(copierSemaine) }
}

// Ordre des programmes d'un coaché dans l'éditeur (14 novembre 2026) : celui en cours d'abord, puis les prochains
// (du plus proche au plus lointain), puis les passés (du plus récent au plus ancien). Dates 'AAAA-MM-JJ'.
export function ordreProgrammes(programmes, aujourdhui) {
  const fin = (p) => {
    const d = new Date(`${p.debut || '1970-01-01'}T12:00:00Z`)
    d.setUTCDate(d.getUTCDate() + (p.semaines?.length ?? 0) * 7 - 1)
    return d.toISOString().slice(0, 10)
  }
  const rang = (p) => (!p.debut ? 2 : p.debut <= aujourdhui && aujourdhui <= fin(p) ? 0 : p.debut > aujourdhui ? 1 : 2)
  return [...(programmes ?? [])].sort((a, b) => {
    const r = rang(a) - rang(b)
    if (r) return r
    if (rang(a) === 1) return (a.debut || '').localeCompare(b.debut || '')
    if (rang(a) === 0) return (a.statut === 'publié' ? 0 : 1) - (b.statut === 'publié' ? 0 : 1)
    return (b.debut || '').localeCompare(a.debut || '')
  })
}
