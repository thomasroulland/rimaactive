// Modifications pures d'un programme : chaque fonction renvoie un nouvel objet.

export function nouvelId() {
  return crypto.randomUUID()
}

const JOURS_PAR_DEFAUT = {
  1: ['Lundi'],
  2: ['Lundi', 'Jeudi'],
  3: ['Lundi', 'Mercredi', 'Vendredi'],
  4: ['Lundi', 'Mardi', 'Jeudi', 'Samedi'],
  5: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'],
  6: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'],
  7: ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'],
}

function seanceVide(jour) {
  return {
    id: nouvelId(), titre: '', jour, lieu: '', duree: '', objectif: '', type: 'force',
    consigne: '', distance: '', temps: '', blocs: [],
  }
}

export function nouveauProgramme({ client, nom, debut, semaines, parSemaine }) {
  const jours = JOURS_PAR_DEFAUT[Math.min(Math.max(parSemaine, 1), 7)]
  return {
    client, nom, debut, parSemaine, statut: 'brouillon',
    semaines: Array.from({ length: semaines }, () => ({
      id: nouvelId(), mot: '', rpe: '', seances: jours.map(seanceVide),
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

export function nouvelleSeance(type = 'force', jour = 'Lundi') {
  return { ...seanceVide(jour), type }
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
