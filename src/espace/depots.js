// Lectures et écritures Firestore / API de l'espace. Parties utilisateurs (tâche 6).
import { collection, doc, onSnapshot, query, where, updateDoc, setDoc, getDoc, getDocs, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth, db, stockage } from './firebase.js'
import { semaineCourante, aujourdhuiIso } from './donnees/calculs.js'
import { reduireImage } from './donnees/photos.js'

// Appelle une route /api/... avec le jeton du coach. Renvoie { statut, donnees } ; ne lève que si le réseau échoue.
export async function appelerApi(chemin, corps) {
  const jeton = await auth.currentUser?.getIdToken()
  if (!jeton) { const e = new Error('non-connecte'); e.code = 'auth/requires-recent-login'; throw e }
  const reponse = await fetch(chemin, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${jeton}` },
    body: JSON.stringify(corps),
  })
  let donnees = null
  try { donnees = await reponse.json() } catch { /* 204 : pas de corps */ }
  return { statut: reponse.status, donnees }
}

// Programme « en cours » d'un client : le programme publié dont le début est le plus récent
function programmeEnCours(programmes, aujourdhui) {
  const publies = programmes.filter((p) => p.statut === 'publié')
  if (publies.length === 0) return null
  const passes = publies.filter((p) => p.debut <= aujourdhui).sort((a, b) => b.debut.localeCompare(a.debut))
  const p = passes[0] ?? publies.sort((a, b) => a.debut.localeCompare(b.debut))[0]
  const nb = p.semaines?.length ?? 0
  return { id: p.id, nom: p.nom, debut: p.debut, nbSemaines: nb, semaine: semaineCourante(p.debut, aujourdhui, nb) }
}

// Écoute en direct la liste des clients et leur programme en cours.
// rappel([{ uid, prenom, nom, email, statut, nbProgrammes, programme: null | { nom, semaine, nbSemaines, debut } }])
export function ecouterClients(rappel, erreur) {
  let clients = null
  let programmes = null
  const emettre = () => {
    if (!clients || !programmes) return
    const aujourdhui = aujourdhuiIso()
    rappel(
      clients
        .map((c) => {
          const siens = programmes.filter((p) => p.client === c.uid)
          return { ...c, nbProgrammes: siens.length, programme: programmeEnCours(siens, aujourdhui) }
        })
        .sort((a, b) => `${a.prenom} ${a.nom}`.localeCompare(`${b.prenom} ${b.nom}`, 'fr')),
    )
  }
  const arretClients = onSnapshot(
    query(collection(db, 'utilisateurs'), where('role', '==', 'client')),
    (s) => { clients = s.docs.map((d) => ({ uid: d.id, ...d.data() })); emettre() },
    erreur,
  )
  const arretProgrammes = onSnapshot(
    collection(db, 'programmes'),
    (s) => { programmes = s.docs.map((d) => ({ id: d.id, ...d.data() })); emettre() },
    erreur,
  )
  return () => { arretClients(); arretProgrammes() }
}

// Crée le compte puis envoie l'e-mail « choisissez votre mot de passe ».
// Renvoie { uid } ou, si l'adresse existe déjà, { dejaInvite: true, uid }.
export async function inviterClient({ prenom, nom, email }) {
  const { statut, donnees } = await appelerApi('/api/inviter', { prenom, nom, email })
  if (statut === 409) return { dejaInvite: true, uid: donnees?.uid }
  if (statut === 400) { const e = new Error('champs'); e.code = 'api/champs'; throw e }
  if (statut !== 201) { const e = new Error('api'); e.code = `api/${statut}`; throw e }
  await sendPasswordResetEmail(auth, email.trim().toLowerCase())
  return { uid: donnees.uid }
}

export async function renvoyerInvitation(email) {
  await sendPasswordResetEmail(auth, email.trim().toLowerCase())
}

// Le client accepte l'accord : les règles n'autorisent que ces deux champs, une seule fois.
export async function donnerAccord(uid) {
  await updateDoc(doc(db, 'utilisateurs', uid), { accordSante: serverTimestamp(), statut: 'actif' })
}

export async function supprimerClient(uid) {
  const { statut } = await appelerApi('/api/supprimer-client', { uid })
  if (statut !== 204) { const e = new Error('api'); e.code = `api/${statut}`; throw e }
}

// ---------- Banque d'exercices (tâche 7) ----------
const urls = new Map()

// Écoute en direct la banque : rappel([{ id, nom, consignes, muscles, photos, retire, majLe }]) triée par nom.
export function ecouterExercices(rappel, erreur) {
  return onSnapshot(
    collection(db, 'exercices'),
    (s) => rappel(
      s.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.nom || '').localeCompare(b.nom || '', 'fr')),
    ),
    erreur,
  )
}

// Identifiant d'une future fiche : à créer une seule fois par formulaire pour qu'un nouvel essai reprenne le même dossier.
export function nouvelIdExercice() {
  return doc(collection(db, 'exercices')).id
}

// Crée ou met à jour une fiche. `exercice.photos` = chemins Storage conservés (dans l'ordre) ;
// `nouvellesPhotos` = fichiers à réduire puis ajouter à la suite. Une photo qui n'est plus dans
// `photos` n'est PAS supprimée de Storage : les programmes en gardent une copie du chemin.
// Si l'envoi ou l'enregistrement échoue, les fichiers envoyés pendant cet essai sont supprimés.
// Renvoie l'identifiant (celui de `exercice.id`, ou un nouveau).
export async function enregistrerExercice(exercice, nouvellesPhotos = []) {
  const id = exercice.id ?? nouvelIdExercice()

  // réduire d'abord (refus « format » / « taille » avant tout envoi)
  const reduites = []
  for (const f of nouvellesPhotos) reduites.push(await reduireImage(f))

  const envoyees = []
  try {
    for (const blob of reduites) {
      const chemin = `exercices/${id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`
      await uploadBytes(ref(stockage, chemin), blob, { contentType: 'image/jpeg' })
      envoyees.push(chemin)
    }
    await setDoc(doc(db, 'exercices', id), {
      nom: exercice.nom.trim(),
      consignes: (exercice.consignes ?? '').trim(),
      muscles: exercice.muscles ?? [],
      photos: [...(exercice.photos ?? []), ...envoyees],
      retire: exercice.retire ?? false,
      majLe: serverTimestamp(),
    })
  } catch (e) {
    for (const chemin of envoyees) {
      try { await deleteObject(ref(stockage, chemin)) } catch { /* déjà absent */ }
    }
    if (e?.code === 'permission-denied') throw e
    const erreur = new Error('envoi')
    erreur.code = 'envoi'
    throw erreur
  }
  return id
}

// « Retirer » : l'exercice sort de la banque, ses fichiers restent (les programmes gardent leur copie des chemins).
export async function retirerExercice(id) {
  await updateDoc(doc(db, 'exercices', id), { retire: true, majLe: serverTimestamp() })
}

// Adresse affichable d'une photo (mise en mémoire le temps de la session)
export function urlPhoto(chemin) {
  if (!urls.has(chemin)) {
    urls.set(chemin, getDownloadURL(ref(stockage, chemin)).catch((e) => { urls.delete(chemin); throw e }))
  }
  return urls.get(chemin)
}

// ---------- Programmes (tâche 8) ----------

// Profil d'un utilisateur (null s'il n'existe pas)
export async function lireProfil(uid) {
  const d = await getDoc(doc(db, 'utilisateurs', uid))
  return d.exists() ? { uid: d.id, ...d.data() } : null
}

// Écoute les programmes d'un client, du plus récent au plus ancien (date de début, puis mise à jour).
export function ecouterProgrammes(clientUid, rappel, erreur) {
  return onSnapshot(
    query(collection(db, 'programmes'), where('client', '==', clientUid)),
    (s) => rappel(
      s.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.debut || '').localeCompare(a.debut || '')
          || (b.majLe?.toMillis?.() ?? 0) - (a.majLe?.toMillis?.() ?? 0)),
    ),
    erreur,
  )
}

// Identifiant d'un futur programme : créé une seule fois, pour qu'un nouvel essai écrive le même document.
export function nouvelIdProgramme() {
  return doc(collection(db, 'programmes')).id
}

// Enregistre tout le programme (`programme.id` obligatoire). Un nouveau programme est un brouillon ;
// un programme déjà publié le reste (le client voit la nouvelle version).
export async function enregistrerProgramme(programme) {
  const { id, majLe, ...donnees } = programme // majLe : remplacé par l’heure du serveur
  await setDoc(doc(db, 'programmes', id), { ...donnees, statut: donnees.statut ?? 'brouillon', majLe: serverTimestamp() })
}

export async function publierProgramme(id) {
  await updateDoc(doc(db, 'programmes', id), { statut: 'publié', majLe: serverTimestamp() })
}

// Séances déjà faites (séance faite « terminée ») : elles ne se modifient plus. Renvoie un Set d'identifiants de séance.
export async function seancesVerrouillees(programmeId) {
  const s = await getDocs(query(
    collection(db, 'seancesFaites'),
    where('programme', '==', programmeId),
    where('statut', '==', 'terminée'),
  ))
  return new Set(s.docs.map((d) => d.data().seance))
}
