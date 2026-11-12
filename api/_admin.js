// Aide privée (le « _ » l'exclut des routes Vercel) : firebase-admin et contrôle du rôle coach.
import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

const PROJET = process.env.GCLOUD_PROJECT || 'demo-rimaactive'

const surEmulateurs = (env) =>
  Boolean(env.FIREBASE_STORAGE_EMULATOR_HOST || env.FIRESTORE_EMULATOR_HOST || env.FIREBASE_AUTH_EMULATOR_HOST)

// Nom du bucket Storage. En ligne, FIREBASE_STORAGE_BUCKET est obligatoire (aucun nom deviné : les projets
// récents finissent par .firebasestorage.app, les anciens par .appspot.com). Sur les émulateurs : le bucket de test.
export function nomBucket(env = process.env) {
  const nom = typeof env.FIREBASE_STORAGE_BUCKET === 'string' ? env.FIREBASE_STORAGE_BUCKET.trim() : ''
  if (nom) return nom.replace(/^gs:\/\//, '')
  if (surEmulateurs(env)) return `${env.GCLOUD_PROJECT || 'demo-rimaactive'}.appspot.com`
  throw erreurHttp(500, 'configuration')
}

// Initialise firebase-admin une seule fois et renvoie { auth, db, bucket(), horodatage }.
// bucket() lève une erreur 500 « configuration » si le nom du bucket manque (voir nomBucket).
export function admin() {
  if (!getApps().length) {
    const compte = process.env.FIREBASE_SERVICE_ACCOUNT
    if (compte) {
      initializeApp({ credential: cert(JSON.parse(compte)) })
    } else if (surEmulateurs(process.env)) {
      initializeApp({ projectId: PROJET })
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
    bucket: () => getStorage(app).bucket(nomBucket()),
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
  if (e?.statut) {
    if (e.statut >= 500) console.error(`Erreur ${e.statut} : ${e.message}`)
    return res.status(e.statut).json({ code: e.message })
  }
  console.error(e)
  return res.status(500).json({ code: 'serveur' })
}
