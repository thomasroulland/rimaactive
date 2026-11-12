import { admin, verifierCoach, repondreErreur } from './_admin.js'

// Identifiant Firebase Auth : lettres et chiffres seulement.
const UID = /^[A-Za-z0-9]{1,128}$/

// Supprime un client : photos (Storage), puis séances et programmes (Firestore), puis le compte (Auth), et enfin
// le profil. Chaque étape peut être rejouée : après une panne au milieu, un nouvel essai termine la suppression.
// Le profil part en dernier parce que c'est lui qui affiche le client dans « Mes coachés » : tant que la
// suppression n'est pas complète, Marie voit encore le client et peut relancer.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ code: 'methode' })
  try {
    await verifierCoach(req)
    const uid = typeof req.body?.uid === 'string' ? req.body.uid.trim() : ''
    if (!UID.test(uid)) return res.status(400).json({ code: 'champs' })

    const a = admin()
    const db = a.db
    // Lève 500 « configuration » si le bucket n'est pas renseigné, avant d'effacer quoi que ce soit.
    const bucket = a.bucket()

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

    // 1. Photos d'abord : un bucket faux ou introuvable arrête tout ici, sans rien avoir effacé.
    await bucket.deleteFiles({ prefix: `clients/${uid}/`, force: true })
    // 2. Séances et programmes.
    for (const collection of ['seancesFaites', 'programmes']) {
      const lot = await db.collection(collection).where('client', '==', uid).get()
      await Promise.all(lot.docs.map((d) => d.ref.delete()))
    }
    // 3. Le compte de connexion.
    if (compte) await a.auth.deleteUser(uid)
    // 4. Le profil, en dernier.
    await db.doc(`utilisateurs/${uid}`).delete()
    return res.status(204).end()
  } catch (e) {
    return repondreErreur(res, e)
  }
}
