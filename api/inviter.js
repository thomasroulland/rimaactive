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

    const u = await a.auth.createUser({ email, displayName: `${prenom} ${nom}` })
    await a.auth.setCustomUserClaims(u.uid, { role: 'client' })
    await a.db.doc(`utilisateurs/${u.uid}`).set({
      prenom, nom, email, role: 'client', statut: 'invité', accordSante: null,
      creeLe: a.horodatage(),
    })
    return res.status(201).json({ uid: u.uid })
  } catch (e) {
    return repondreErreur(res, e)
  }
}
