// Lectures et écritures Firestore / API de l'espace. Parties utilisateurs (tâche 6).
import { collection, doc, onSnapshot, query, where, updateDoc, serverTimestamp } from 'firebase/firestore'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth, db } from './firebase.js'
import { semaineCourante, aujourdhuiIso } from './donnees/calculs.js'

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
// rappel([{ uid, prenom, nom, email, statut, programme: null | { nom, semaine, nbSemaines, debut } }])
export function ecouterClients(rappel, erreur) {
  let clients = null
  let programmes = null
  const emettre = () => {
    if (!clients || !programmes) return
    const aujourdhui = aujourdhuiIso()
    rappel(
      clients
        .map((c) => ({ ...c, programme: programmeEnCours(programmes.filter((p) => p.client === c.uid), aujourdhui) }))
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
