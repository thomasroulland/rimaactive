import { admin, verifierCoach, repondreErreur } from './_admin.js'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ code: 'methode' })
  try {
    await verifierCoach(req)
    const corps = req.body && typeof req.body === 'object' ? req.body : {}
    const texte = (v) => (typeof v === 'string' ? v.trim() : '')
    const prenom = texte(corps.prenom)
    const nom = texte(corps.nom)
    const email = texte(corps.email).toLowerCase()
    if (!prenom || !nom || !EMAIL.test(email)) return res.status(400).json({ code: 'champs' })

    const a = admin()
    try {
      const existant = await a.auth.getUserByEmail(email)
      return res.status(409).json({ code: 'deja-invite', uid: existant.uid })
    } catch (e) {
      if (e.code !== 'auth/user-not-found') throw e
    }

    let u
    try {
      u = await a.auth.createUser({ email, displayName: `${prenom} ${nom}` })
    } catch (e) {
      // Deux invitations en même temps : l'autre a créé le compte entre la vérification et la création.
      if (e.code !== 'auth/email-already-exists') throw e
      const existant = await a.auth.getUserByEmail(email)
      return res.status(409).json({ code: 'deja-invite', uid: existant.uid })
    }
    try {
      await a.auth.setCustomUserClaims(u.uid, { role: 'client' })
      await a.db.doc(`utilisateurs/${u.uid}`).set({
        prenom, nom, email, role: 'client', statut: 'invité', accordSante: null,
        creeLe: a.horodatage(),
      })
    } catch (e) {
      // Pas de compte à moitié créé (sans rôle ni profil, invisible dans « Mes coachés ») : on l'efface.
      try {
        await a.auth.deleteUser(u.uid)
      } catch (annulation) {
        console.error('Compte à supprimer à la main :', u.uid, annulation)
      }
      // au cas où le profil a été écrit malgré l'erreur
      await Promise.resolve().then(() => a.db.doc(`utilisateurs/${u.uid}`).delete()).catch(() => {})
      throw e
    }
    return res.status(201).json({ uid: u.uid })
  } catch (e) {
    return repondreErreur(res, e)
  }
}
