import { formatsDuType } from './reglages.js'
import { ajoutJours } from './calculs.js'
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
    materiel: exercice.materiel ?? '', // pour « À préparer » d'un superset côté coaché
    muscles: [...(exercice.muscles ?? [])],
    musclesSecondaires: [...(exercice.musclesSecondaires ?? [])],
    photos: [...(exercice.photos ?? [])],
    // façons possibles (fiche) et façon choisie pour cette séance : la première cochée par défaut
    lateralites: [...(exercice.lateralites ?? [])],
    lateralite: '',
    mesure: exercice.mesure === 'duree' ? 'duree' : '', // « Durée » (gainage…) ou répétitions
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

// Nom d'un bloc (15 novembre 2026) : facultatif, 30 caractères au plus ; sans nom, le bloc s'appelle « Bloc A », « Bloc B »…
export const NOM_BLOC_MAX = 30
export function nomBloc(bloc) {
  const nom = String(bloc?.nom ?? '').trim()
  return nom || `Bloc ${bloc?.lettre ?? ''}`.trim()
}
// Renomme le bloc de la lettre donnée dans une séance ; un nom vide remet le nom par défaut. Les lettres et les codes d'exercice (A1, B2…) ne changent pas.
export function renommerBloc(programme, { s, se }, lettre, nom) {
  const p = structuredClone(programme)
  const bloc = (p.semaines[s].seances[se].blocs ?? []).find((b) => b.lettre === lettre)
  if (!bloc) return p
  const propre = String(nom ?? '').replace(/\s+/g, ' ').trim().slice(0, NOM_BLOC_MAX)
  if (propre) bloc.nom = propre
  else delete bloc.nom
  return p
}

// Position (à partir de 0) de la semaine en cours dans le programme à la date `aujourdhui` ; -1 si le programme n'a pas commencé ou est fini
export function semaineEnCours(programme, aujourdhui) {
  const debut = programme?.debut
  if (!debut || !aujourdhui) return -1
  const n = programme.semaines?.length ?? 0
  for (let i = 0; i < n; i += 1) {
    if (aujourdhui >= ajoutJours(debut, i * 7) && aujourdhui < ajoutJours(debut, (i + 1) * 7)) return i
  }
  return -1
}

// « Partir d'un modèle » (grille, 16 novembre 2026) : les semaines du modèle (copiées avec de nouveaux identifiants) remplacent celles du programme ;
// le nom, la date de début, le coaché et le statut du programme ne changent pas
export function appliquerModele(programme, modele) {
  const m = structuredClone(modele)
  return { ...programme, parSemaine: m.parSemaine ?? programme.parSemaine, semaines: (m.semaines ?? []).map(copierSemaine) }
}

// « Enregistrer comme modèle » : le programme sans coaché, sans date et sans statut, avec de nouveaux identifiants
export function versModele(programme, nom) {
  const { id, majLe, client, statut, debut, ...reste } = structuredClone(programme) // eslint-disable-line no-unused-vars
  return { ...reste, genre: 'programme', nom, debut: '', semaines: (reste.semaines ?? []).map(copierSemaine) }
}

// Nouveau modèle de programme vide (23 novembre 2026) : 4 semaines de 3 séances, à remplir dans l'éditeur
export function nouveauModeleProgramme(nom = '') {
  const { client, debut, statut, ...reste } = nouveauProgramme({ client: '', nom, debut: '', semaines: 4, parSemaine: 3 }) // eslint-disable-line no-unused-vars
  return { ...reste, genre: 'programme', debut: '' }
}

// Nombre de semaines : en ajoute (vides, à la fin) ou en retire (les dernières) ; `faites` = séances déjà faites, jamais retirées
export function reglerNbSemaines(programme, n, faites = new Set()) {
  const p = structuredClone(programme)
  while (p.semaines.length < n) p.semaines.push(nouvelleSemaine(p.parSemaine))
  while (p.semaines.length > n && p.semaines.length > 1) {
    const derniere = p.semaines[p.semaines.length - 1]
    if (derniere.seances.some((x) => faites.has(x.id))) break
    p.semaines.pop()
  }
  return p
}

// ---------- Séances : copier, dupliquer, déplacer (grille du programme, 15 novembre 2026) ----------

// Copie d'une séance avec de nouveaux identifiants (séance, blocs, exercices) : la copie n'est jamais « faite »
export function copierSeance(seance) {
  const c = structuredClone(seance)
  c.id = nouvelId()
  for (const b of c.blocs ?? []) {
    b.id = nouvelId()
    for (const e of b.elements ?? []) e.id = nouvelId()
  }
  return c
}

// Duplique la séance { s, se } : juste après elle, ou dans la semaine `vers` à la position `index` (à la fin par défaut)
export function dupliquerSeance(programme, { s, se }, { vers = s, index } = {}) {
  const p = structuredClone(programme)
  const copie = copierSeance(p.semaines[s].seances[se])
  const cible = p.semaines[vers].seances
  const pos = index ?? (vers === s ? se + 1 : cible.length)
  cible.splice(Math.max(0, Math.min(pos, cible.length)), 0, copie)
  return p
}

// Déplace la séance { s, se } dans la semaine `vers` : `index` est la place voulue dans la liste telle qu'elle s'affiche avant le déplacement
export function deplacerSeance(programme, { s, se }, { vers, index = Infinity }) {
  const p = structuredClone(programme)
  const [x] = p.semaines[s].seances.splice(se, 1)
  const cible = p.semaines[vers].seances
  const pos = vers === s && index > se ? index - 1 : index
  cible.splice(Math.max(0, Math.min(pos, cible.length)), 0, x)
  return p
}

// Ajoute un exercice dans le bloc de la lettre donnée (créé à la suite s'il n'existe pas)
export function ajouterAuBloc(programme, { s, se }, lettre, exercice) {
  const p = structuredClone(programme)
  const seance = p.semaines[s].seances[se]
  seance.blocs = seance.blocs ?? []
  let b = seance.blocs.findIndex((x) => x.lettre === lettre)
  if (b < 0) {
    seance.blocs.push({ id: nouvelId(), lettre, format: formatsDuType(seance.type)[0], duree: '', repos: '', elements: [] })
    seance.blocs.sort((x, y) => x.lettre.localeCompare(y.lettre))
    b = seance.blocs.findIndex((x) => x.lettre === lettre)
  }
  return ajouterElement(p, { s, se, b }, exercice)
}

// Ajoute un bloc vide (le coach le remplira ensuite) ; renvoie le programme tel quel s'il n'y a plus de lettre libre
export function ajouterBlocVide(programme, { s, se }) {
  const p = structuredClone(programme)
  const seance = p.semaines[s].seances[se]
  seance.blocs = seance.blocs ?? []
  const lettre = LETTRES[seance.blocs.length]
  if (!lettre) return programme
  seance.blocs.push({ id: nouvelId(), lettre, format: formatsDuType(seance.type)[0], duree: '', repos: '', elements: [] })
  return p
}

// Supprime un bloc (avec ses exercices) ; les blocs restants sont renommés A, B, C…
export function supprimerBloc(programme, { s, se }, blocId) {
  const p = structuredClone(programme)
  const seance = p.semaines[s].seances[se]
  seance.blocs = (seance.blocs ?? []).filter((b) => b.id !== blocId).map((b, i) => ({ ...b, lettre: LETTRES[i] ?? b.lettre }))
  return p
}

// Déplace un bloc (glisser-déposer, 18 novembre 2026) : le bloc `de` prend la place `vers`, puis lettres A, B, C… recalculées
export function deplacerBloc(programme, { s, se }, de, vers) {
  const p = structuredClone(programme)
  const seance = p.semaines[s].seances[se]
  const blocs = [...(seance.blocs ?? [])]
  if (de === vers || de < 0 || vers < 0 || de >= blocs.length || vers >= blocs.length) return programme
  const [b] = blocs.splice(de, 1)
  blocs.splice(vers, 0, b)
  seance.blocs = blocs.map((x, i) => ({ ...x, lettre: LETTRES[i] ?? x.lettre }))
  return p
}

// Déplace un exercice dans son bloc (20 novembre 2026) : l'exercice `de` prend la place `vers` ; les codes A1, A2… suivent l'ordre
export function deplacerElement(programme, { s, se }, bi, de, vers) {
  const bloc = programme.semaines[s]?.seances[se]?.blocs?.[bi]
  const els = bloc?.elements ?? []
  if (de === vers || de < 0 || vers < 0 || de >= els.length || vers >= els.length) return programme
  const p = structuredClone(programme)
  const liste = p.semaines[s].seances[se].blocs[bi].elements
  const [e] = liste.splice(de, 1)
  liste.splice(vers, 0, e)
  return p
}

// Retire un élément ; le bloc qui devient vide à cause de ce retrait disparaît et les blocs restants sont renommés A, B, C…
// (un bloc créé vide par le coach, lui, reste en place)
export function retirerElement(programme, { s, se }, elementId) {
  const p = structuredClone(programme)
  const seance = p.semaines[s].seances[se]
  seance.blocs = (seance.blocs ?? [])
    .map((b) => ({ ...b, avait: (b.elements ?? []).some((e) => e.id === elementId), elements: (b.elements ?? []).filter((e) => e.id !== elementId) }))
    .filter((b) => !(b.avait && b.elements.length === 0))
    .map(({ avait, ...b }, i) => ({ ...b, lettre: LETTRES[i] ?? b.lettre }))
  return p
}

// Version à écrire : aucun bloc vide n'est enregistré (le coaché ne verrait qu'un bloc sans exercice), lettres A, B, C… recalculées
export function sansBlocsVides(programme) {
  let change = false
  const semaines = (programme.semaines ?? []).map((w) => ({
    ...w,
    seances: (w.seances ?? []).map((x) => {
      const blocs = x.blocs ?? []
      if (!blocs.some((b) => (b.elements ?? []).length === 0)) return x
      change = true
      return { ...x, blocs: blocs.filter((b) => (b.elements ?? []).length > 0).map((b, i) => ({ ...b, lettre: LETTRES[i] ?? b.lettre })) }
    }),
  }))
  return change ? { ...programme, semaines } : programme
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

// Recopie dans le programme les photos, consignes, muscles et nom actuels des fiches de la banque (14 novembre 2026) :
// la copie faite à l'ajout d'un exercice ne suivait pas une photo ajoutée plus tard. Renvoie le même objet si rien ne change.
export function rafraichirExercices(programme, banque) {
  if (!programme || !banque?.length) return programme
  const fiches = new Map(banque.map((e) => [e.id, e]))
  let change = false
  const semaines = (programme.semaines ?? []).map((w) => ({
    ...w,
    seances: (w.seances ?? []).map((s) => ({
      ...s,
      blocs: (s.blocs ?? []).map((b) => ({
        ...b,
        elements: (b.elements ?? []).map((el) => {
          const f = fiches.get(el.exoId)
          if (!f) return el
          const nouveau = {
            ...el,
            nom: f.nom || el.nom,
            photos: [...(f.photos ?? [])],
            consignes: f.consignes ?? el.consignes ?? '',
            muscles: [...(f.muscles ?? [])],
            musclesSecondaires: [...(f.musclesSecondaires ?? [])],
            lateralites: [...(f.lateralites ?? [])],
            // le matériel suit la fiche (haltères : charge « par main » chez le coaché)
            materiel: f.materiel ?? el.materiel ?? '',
            // la façon choisie reste, sauf si elle n'est plus possible sur la fiche
            lateralite: (f.lateralites ?? []).includes(el.lateralite) ? el.lateralite : (f.lateralites?.[0] ?? ''),
          }
          if (JSON.stringify(nouveau) !== JSON.stringify(el)) { change = true; return nouveau }
          return el
        }),
      })),
    })),
  }))
  return change ? { ...programme, semaines } : programme
}

// Un autre programme du même coaché commence après celui-ci (publié ou en préparation) : la suite est déjà prévue,
// donc pas d'alerte « prévoyez la suite » (14 novembre 2026).
export function aUneSuite(programme, programmes) {
  if (!programme?.debut) return false
  return (programmes ?? []).some((p) => p.id !== programme.id && p.client === programme.client && p.debut && p.debut > programme.debut)
}
