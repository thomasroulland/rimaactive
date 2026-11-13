// Lectures et écritures Firestore / API de l'espace. Parties utilisateurs (tâche 6).
import { addDoc, collection, deleteDoc, doc, onSnapshot, query, where, updateDoc, setDoc, getDoc, getDocs, serverTimestamp } from 'firebase/firestore'
import { ref, uploadBytes, deleteObject, getDownloadURL } from 'firebase/storage'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth, db, stockage } from './firebase.js'
import { semaineCourante, aujourdhuiIso } from './donnees/calculs.js'
import { reduireImage } from './donnees/photos.js'
import { contenuNotes, contenuFin } from './donnees/seances.js'

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
export function programmeEnCours(programmes, aujourdhui) {
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
  const { statut, donnees } = await appelerApi('/api/supprimer-client', { uid })
  if (statut !== 204) {
    const e = new Error('api')
    e.code = donnees?.code === 'configuration' ? 'api/configuration' : `api/${statut}`
    throw e
  }
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

// Crée (`creation: true`, en brouillon) ou met à jour un programme (`programme.id` obligatoire).
// Une mise à jour n'écrit jamais `statut` : seul publierProgramme le change, pour qu'un onglet resté
// ouvert sur un ancien brouillon ne dé-publie pas le programme.
export async function enregistrerProgramme(programme, { creation = false } = {}) {
  const { id, majLe, statut, ...donnees } = programme // majLe : remplacé par l’heure du serveur
  const ref = doc(db, 'programmes', id)
  if (creation) await setDoc(ref, { ...donnees, statut: statut ?? 'brouillon', majLe: serverTimestamp() })
  else await updateDoc(ref, { ...donnees, majLe: serverTimestamp() })
}

export async function publierProgramme(id) {
  await updateDoc(doc(db, 'programmes', id), { statut: 'publié', majLe: serverTimestamp() })
}

// Séances déjà faites (séance faite « terminée ») : elles ne se modifient plus. Renvoie un Set d'identifiants de séance.
const requeteVerrous = (programmeId) => query(
  collection(db, 'seancesFaites'),
  where('programme', '==', programmeId),
  where('statut', '==', 'terminée'),
)
export async function seancesVerrouillees(programmeId) {
  const s = await getDocs(requeteVerrous(programmeId))
  return new Set(s.docs.map((d) => d.data().seance))
}

// Même chose en direct : une séance terminée pendant que l'éditeur est ouvert se verrouille aussitôt.
export function ecouterVerrous(programmeId, rappel, erreur) {
  return onSnapshot(requeteVerrous(programmeId), (s) => rappel(new Set(s.docs.map((d) => d.data().seance))), erreur)
}

// ---------- Espace client (tâche 9) ----------

// Écoute tous les programmes publiés du client, du plus récent au plus ancien (date de début, puis mise à jour).
// La requête doit filtrer client ET statut, sinon les règles la refusent.
export function ecouterMesProgrammes(uid, rappel, erreur) {
  return onSnapshot(
    query(collection(db, 'programmes'), where('client', '==', uid), where('statut', '==', 'publié')),
    (s) => {
      const tous = s.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.debut || '').localeCompare(a.debut || '')
          || (b.majLe?.toMillis?.() ?? 0) - (a.majLe?.toMillis?.() ?? 0))
      rappel(tous)
    },
    erreur,
  )
}

// Écoute les séances faites du client, avec `enAttente: true` tant qu'une modification n'est pas arrivée au serveur
// (réseau coupé : elle est gardée sur le téléphone et part au retour du réseau).
export function ecouterMesSeances(uid, rappel, erreur) {
  return onSnapshot(
    query(collection(db, 'seancesFaites'), where('client', '==', uid)),
    { includeMetadataChanges: true },
    (s) => rappel(s.docs.map((d) => ({ id: d.id, ...d.data(), enAttente: d.metadata.hasPendingWrites }))),
    erreur,
  )
}

const refSeance = (programmeId, seanceId) => doc(db, 'seancesFaites', `${programmeId}_${seanceId}`)
const baseSeance = (programmeId, seanceId) => ({
  client: auth.currentUser?.uid, programme: programmeId, seance: seanceId, date: aujourdhuiIso(), majLe: serverTimestamp(),
})

// Note les séries pendant la séance (fusion). La promesse ne se résout qu'au retour du serveur :
// ne pas l'attendre pour mettre l'écran à jour (le cache hors ligne l'applique tout de suite).
export function noterSeance(programmeId, seanceId, donnees) {
  return setDoc(refSeance(programmeId, seanceId), contenuNotes(baseSeance(programmeId, seanceId), donnees), { merge: true })
}

// « Fin de séance » : { effort, ressenti, commentaire, distance, temps } (+ `series`, `notes`, `blocs` facultatifs,
// pour enregistrer d'un coup les séries pré-remplies jamais touchées). Refusée par les règles si la séance est déjà terminée.
export function terminerSeance(programmeId, seanceId, fin) {
  return setDoc(refSeance(programmeId, seanceId), contenuFin(baseSeance(programmeId, seanceId), fin), { merge: true })
}

// ---------- Fiche client côté coach (tâche 10) ----------

// Écoute toutes les séances faites d'un client, de la plus récente à la plus ancienne.
export function ecouterSeancesClient(uid, rappel, erreur) {
  return onSnapshot(
    query(collection(db, 'seancesFaites'), where('client', '==', uid)),
    (s) => rappel(
      s.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.date || '').localeCompare(a.date || '') || a.id.localeCompare(b.id)),
    ),
    erreur,
  )
}

// Le coach ne peut changer que `commentaireCoach` (et `majLe`) d'une séance faite : les règles le vérifient.
// `majLe` n'est pas touché (13 novembre 2026) : il garde l'heure à laquelle le client a fini sa séance, affichée au coach.
export function commenterSeance(id, texte) {
  return updateDoc(doc(db, 'seancesFaites', id), { commentaireCoach: String(texte ?? '').trim() })
}

// ---------- Photo de profil du coaché ----------

// Réduit la photo, l'envoie sous clients/{uid}/profil/, la rattache au profil puis supprime l'ancienne.
// Rejette Error('format') ou Error('taille') avant tout envoi ; Error('envoi') si l'envoi échoue.
export async function changerAvatar(uid, fichier) {
  const blob = await reduireImage(fichier)
  const chemin = `clients/${uid}/profil/avatar-${Date.now()}.jpg`
  const ancien = (await getDoc(doc(db, 'utilisateurs', uid))).data()?.avatar ?? null
  try {
    await uploadBytes(ref(stockage, chemin), blob, { contentType: 'image/jpeg' })
    await updateDoc(doc(db, 'utilisateurs', uid), { avatar: chemin })
  } catch (e) {
    try { await deleteObject(ref(stockage, chemin)) } catch { /* pas envoyée */ }
    if (e?.code === 'permission-denied' || e?.code === 'storage/unauthorized') throw Object.assign(new Error('permission-denied'), { code: 'permission-denied' })
    throw Object.assign(new Error('envoi'), { code: 'envoi' })
  }
  if (ancien && ancien !== chemin) {
    urls.delete(ancien)
    try { await deleteObject(ref(stockage, ancien)) } catch { /* déjà absent */ }
  }
}

export async function retirerAvatar(uid) {
  const ancien = (await getDoc(doc(db, 'utilisateurs', uid))).data()?.avatar ?? null
  await updateDoc(doc(db, 'utilisateurs', uid), { avatar: null })
  if (ancien) {
    urls.delete(ancien)
    try { await deleteObject(ref(stockage, ancien)) } catch { /* déjà absent */ }
  }
}

// ---------- Mesures et photos de progression du coaché ----------

// Écoute les mesures du client, de la plus récente à la plus ancienne.
export function ecouterMesMesures(uid, rappel, erreur) {
  return onSnapshot(
    collection(db, 'utilisateurs', uid, 'mesures'),
    (s) => rappel(
      s.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.date || '').localeCompare(a.date || '') || a.id.localeCompare(b.id)),
    ),
    erreur,
  )
}

// `mesure` : résultat de nettoyerMesures (date 'AAAA-MM-JJ', poids… nombres ou null). Pas de mise à jour possible : on ajoute ou on supprime.
export function ajouterMesure(uid, mesure) {
  return addDoc(collection(db, 'utilisateurs', uid, 'mesures'), { ...mesure, creeLe: serverTimestamp() })
}

export function supprimerMesure(uid, id) {
  return deleteDoc(doc(db, 'utilisateurs', uid, 'mesures', id))
}

export function ecouterMesPhotos(uid, rappel, erreur) {
  return onSnapshot(
    collection(db, 'utilisateurs', uid, 'photos'),
    (s) => rappel(
      s.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.date || '').localeCompare(b.date || '') || a.id.localeCompare(b.id)),
    ),
    erreur,
  )
}

// Réduit la photo, l'envoie sous clients/{uid}/progression/, puis crée le document.
// Rejette Error('format') ou Error('taille') avant tout envoi ; refuse tout de suite sans réseau ; Error('envoi') si l'envoi échoue.
// Le fichier n'est supprimé que s'il est parti et que le document est refusé (jamais en bloquant l'écran).
export async function ajouterPhoto(uid, fichier, date) {
  const blob = await reduireImage(fichier)
  if (typeof navigator !== 'undefined' && navigator.onLine === false) {
    throw Object.assign(new Error('auth/network-request-failed'), { code: 'auth/network-request-failed' })
  }
  const fichierRef = ref(stockage, `clients/${uid}/progression/${date}-${Date.now()}.jpg`)
  try {
    await uploadBytes(fichierRef, blob, { contentType: 'image/jpeg' })
  } catch (e) {
    if (e?.code === 'storage/unauthorized') throw Object.assign(new Error('permission-denied'), { code: 'permission-denied' })
    throw Object.assign(new Error('envoi'), { code: 'envoi' })
  }
  const nettoyer = () => { deleteObject(fichierRef).catch(() => {}) }
  const doc_ = addDoc(collection(db, 'utilisateurs', uid, 'photos'), { date, chemin: fichierRef.fullPath, creeLe: serverTimestamp() })
  doc_.catch(nettoyer) // refus tardif (réseau coupé entre-temps) : le fichier orphelin est retiré
  // On n'attend le serveur que quelques secondes : hors ligne, le document part au retour du réseau.
  const refus = await Promise.race([
    doc_.then(() => null, (e) => e),
    new Promise((r) => setTimeout(() => r(null), 5000)),
  ])
  if (refus) {
    if (refus.code === 'permission-denied') throw Object.assign(new Error('permission-denied'), { code: 'permission-denied' })
    throw Object.assign(new Error('envoi'), { code: 'envoi' })
  }
}

// Supprime le document puis le fichier (un fichier déjà absent n'est pas une erreur). Hors ligne, la promesse
// n'est tenue qu'au retour du réseau : ne pas l'attendre pour mettre l'écran à jour.
export async function supprimerPhoto(uid, photo) {
  await deleteDoc(doc(db, 'utilisateurs', uid, 'photos', photo.id))
  urls.delete(photo.chemin)
  try { await deleteObject(ref(stockage, photo.chemin)) } catch { /* déjà absent */ }
}

// ---------- Mes coachés : activité récente (13 novembre 2026) ----------

// Toutes les séances terminées de tous les coachés (lecture réservée au coach par les règles), les plus récentes d'abord.
export function ecouterSeancesTerminees(rappel, erreur) {
  return onSnapshot(
    query(collection(db, 'seancesFaites'), where('statut', '==', 'terminée')),
    (s) => rappel(
      s.docs
        .map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.majLe?.toMillis?.() ?? 0) - (a.majLe?.toMillis?.() ?? 0)),
    ),
    erreur,
  )
}

// Tous les programmes (coach) : titres des séances et dates de fin
export function ecouterTousProgrammes(rappel, erreur) {
  return onSnapshot(collection(db, 'programmes'), (s) => rappel(s.docs.map((d) => ({ id: d.id, ...d.data() }))), erreur)
}

// ---------- Gestion d'un programme par le coach (13 novembre 2026) ----------
export function decalerProgramme(id, debut) {
  return updateDoc(doc(db, 'programmes', id), { debut, majLe: serverTimestamp() })
}
// Le programme repasse en brouillon : le coaché ne le voit plus (les règles ne lui montrent que les programmes publiés)
export function depublierProgramme(id) {
  return updateDoc(doc(db, 'programmes', id), { statut: 'brouillon', majLe: serverTimestamp() })
}
// Les séances déjà faites restent (elles apparaissent comme « Séance retirée du programme » dans le suivi)
export function supprimerProgramme(id) {
  return deleteDoc(doc(db, 'programmes', id))
}

// Dernière visio avec un coaché, notée par le coach sur le profil du coaché ({ date, semaine })
export function noterVisio(uid, visio) {
  return updateDoc(doc(db, 'utilisateurs', uid), { derniereVisio: visio })
}
