import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator, signOut, onAuthStateChanged } from 'firebase/auth'
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager, connectFirestoreEmulator,
  terminate, clearIndexedDbPersistence, waitForPendingWrites,
} from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

const env = import.meta.env
const emulateurs = env.VITE_FIREBASE_EMULATEURS === '1'

const app = initializeApp({
  apiKey: env.VITE_FIREBASE_API_KEY || (emulateurs ? 'fake' : undefined),
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID || (emulateurs ? 'demo-rimaactive' : undefined),
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || (emulateurs ? 'demo-rimaactive.appspot.com' : undefined),
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
})

export const auth = getAuth(app)
// Cache hors ligne : la salle de sport n'a pas toujours de réseau
const nouvelleBase = () => {
  const base = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
  })
  if (emulateurs) connectFirestoreEmulator(base, '127.0.0.1', 8080)
  return base
}
// `let` : après une déconnexion, la base est recréée à neuf (les fichiers qui l'importent voient la nouvelle)
export let db = nouvelleBase()
export const stockage = getStorage(app)
// Réseau mauvais ou coupé : les envois échouent en 30 s au lieu de réessayer pendant des minutes.
stockage.maxUploadRetryTime = 30000
stockage.maxOperationRetryTime = 30000

if (emulateurs) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectStorageEmulator(stockage, '127.0.0.1', 9199)
}

// Déconnexion : la copie hors ligne (programme, séances, notes de douleur) gardée dans le navigateur est effacée,
// pour qu'elle ne reste pas sur un appareil partagé. Cela vaut aussi pour les autres onglets de l'espace :
// quand la session se ferme dans un onglet, chacun arrête Firestore, efface la copie et se recharge.
let connecteIci = false
let effacement = null
function effacerCopieEtRecharger() {
  effacement ??= (async () => {
    // laisse l'espace se refermer (il revient à la connexion) avant d'arrêter la base
    await new Promise((ok) => setTimeout(ok, 0))
    try {
      await terminate(db)
      await clearIndexedDbPersistence(db)
    } catch { /* un autre onglet utilise encore la copie : il l'effacera en se fermant à son tour */ }
    // Base arrêtée et copie effacée : une base neuve, sans recharger la page (13 novembre 2026)
    try {
      db = nouvelleBase()
    } catch {
      window.location.replace('/espace') // en dernier recours seulement
    }
    effacement = null
  })()
  return effacement
}
onAuthStateChanged(auth, (utilisateur) => {
  if (connecteIci && !utilisateur) effacerCopieEtRecharger()
  connecteIci = Boolean(utilisateur)
})

// Bouton « Se déconnecter » : les notes encore en attente ont quelques secondes pour partir.
export async function seDeconnecter() {
  try {
    await Promise.race([waitForPendingWrites(db), new Promise((ok) => setTimeout(ok, 3000))])
  } catch { /* on se déconnecte quand même */ }
  try {
    await signOut(auth)
  } finally {
    await effacerCopieEtRecharger()
  }
}
