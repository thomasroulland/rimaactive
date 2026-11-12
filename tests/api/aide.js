import { initializeApp, getApps } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

export const PROJET = 'demo-rimaactive'
export const BUCKET = 'demo-rimaactive.appspot.com'

export function app() {
  if (!getApps().length) initializeApp({ projectId: PROJET, storageBucket: BUCKET })
  return { auth: () => getAuth(), firestore: () => getFirestore(), storage: () => getStorage() }
}

// Crée un compte (avec rôle) dans l'émulateur et renvoie { uid, jeton }.
export async function compteAvecJeton(email, role) {
  const a = app()
  const u = await a.auth().createUser({ email, password: 'motdepasse1', displayName: email })
  await a.auth().setCustomUserClaims(u.uid, { role })
  const r = await fetch(
    `http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=x`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password: 'motdepasse1', returnSecureToken: true }),
    },
  )
  const { idToken } = await r.json()
  return { uid: u.uid, jeton: idToken }
}

export async function toutEffacer() {
  const a = app()
  const { users } = await a.auth().listUsers()
  if (users.length) await a.auth().deleteUsers(users.map((u) => u.uid))
  const base = process.env.FIRESTORE_EMULATOR_HOST
  await fetch(`http://${base}/emulator/v1/projects/${PROJET}/databases/(default)/documents`, { method: 'DELETE' })
}

// Faux req / res pour appeler un gestionnaire directement.
export async function appeler(handler, { method = 'POST', jeton, body } = {}) {
  const req = { method, headers: jeton ? { authorization: `Bearer ${jeton}` } : {}, body }
  const res = {
    code: null, corps: undefined, entetes: {},
    status(c) { this.code = c; return this },
    json(o) { this.corps = o; return this },
    end() { return this },
    setHeader(k, v) { this.entetes[k] = v },
  }
  await handler(req, res)
  return res
}
