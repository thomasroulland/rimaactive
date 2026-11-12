// Aide privée (le « _ » l'exclut des routes Vercel) : firebase-admin et contrôle du rôle coach.
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

const PROJET = process.env.GCLOUD_PROJECT || 'demo-rimaactive'

// Initialise firebase-admin une seule fois et renvoie { auth, db, bucket, horodatage }.
export function admin() {
  if (!getApps().length) {
    const compte = process.env.FIREBASE_SERVICE_ACCOUNT
    const emulateur = process.env.FIRESTORE_EMULATOR_HOST || process.env.FIREBASE_AUTH_EMULATOR_HOST
    if (compte) {
      const cle = JSON.parse(compte)
      initializeApp({
        credential: cert(cle),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${cle.project_id}.appspot.com`,
      })
    } else if (emulateur) {
      initializeApp({
        projectId: PROJET,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${PROJET}.appspot.com`,
      })
    } else {
      throw new Error(
        'FIREBASE_SERVICE_ACCOUNT manquant : ajoutez la clé du compte de service dans les variables Vercel.',
      )
    }
  }
  const app = getApp()
  return {
    auth: getAuth(app),
    db: getFirestore(app),
    bucket: getStorage(app).bucket(),
    horodatage: () => FieldValue.serverTimestamp(),
  }
}

function erreurHttp(statut, code) {
  const e = new Error(code)
  e.statut = statut
  return e
}

// Renvoie l'uid du coach qui appelle, sinon lève une erreur 401 (pas de jeton valide) ou 403 (pas coach).
export async function verifierCoach(req) {
  const entete = req.headers?.authorization || req.headers?.Authorization || ''
  const m = /^Bearer\s+(.+)$/i.exec(entete)
  if (!m) throw erreurHttp(401, 'non-connecte')
  let decode
  try {
    decode = await admin().auth.verifyIdToken(m[1])
  } catch {
    throw erreurHttp(401, 'non-connecte')
  }
  if (decode.role !== 'coach') throw erreurHttp(403, 'interdit')
  return decode.uid
}

// Répond à une erreur levée par verifierCoach ; les autres erreurs deviennent un 500.
export function repondreErreur(res, e) {
  if (e?.statut) return res.status(e.statut).json({ code: e.message })
  console.error(e)
  return res.status(500).json({ code: 'serveur' })
}
