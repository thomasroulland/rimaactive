import { admin, verifierCoach, repondreErreur } from './_admin.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ code: 'methode' })
  try {
    await verifierCoach(req)
    const uid = typeof req.body?.uid === 'string' ? req.body.uid.trim() : ''
    if (!uid) return res.status(400).json({ code: 'champs' })

    const a = admin()
    const db = a.db

    // Refuser de supprimer un coach (rôle dans le compte, ou dans le profil si le compte manque déjà).
    let compte = null
    try {
      compte = await a.auth.getUser(uid)
    } catch (e) {
      if (e.code !== 'auth/user-not-found') throw e
    }
    const profil = (await db.doc(`utilisateurs/${uid}`).get()).data()
    if (compte?.customClaims?.role === 'coach' || profil?.role === 'coach') {
      return res.status(403).json({ code: 'interdit' })
    }

    for (const collection of ['seancesFaites', 'programmes']) {
      const lot = await db.collection(collection).where('client', '==', uid).get()
      await Promise.all(lot.docs.map((d) => d.ref.delete()))
    }
    await db.doc(`utilisateurs/${uid}`).delete()
    await a.bucket.deleteFiles({ prefix: `clients/${uid}/`, force: true })
    if (compte) await a.auth.deleteUser(uid)
    return res.status(204).end()
  } catch (e) {
    return repondreErreur(res, e)
  }
}
