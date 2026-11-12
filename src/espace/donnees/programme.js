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
