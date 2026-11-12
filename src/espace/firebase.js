import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import {
  initializeFirestore, persistentLocalCache, persistentMultipleTabManager, connectFirestoreEmulator,
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
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
})
export const stockage = getStorage(app)

if (emulateurs) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true })
  connectFirestoreEmulator(db, '127.0.0.1', 8080)
  connectStorageEmulator(stockage, '127.0.0.1', 9199)
}
