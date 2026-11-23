import { admin, verifierCoach, repondreErreur } from './_admin.js'
import { envoyerInvitation, nouvelleInvitation } from './_invitation.js'

// POST { uid } (coach) : nouveau lien de 7 jours pour un client qui n'a pas encore activé son compte ; l'ancien lien ne marche plus.
// 200 { envoye, email } : `envoye` faux si l'e-mail du site n'est pas configuré ; le navigateur du coach envoie alors l'e-mail Firebase.
// 404 inconnu, 409 deja-actif (le client a déjà choisi son mot de passe et accepté l'accord).
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ code: 'methode' })
  try {
    await verifierCoach(req)
    const corps = req.body && typeof req.body === 'object' ? req.body : {}
    const uid = typeof corps.uid === 'string' ? corps.uid.trim() : ''
    if (!uid) return res.status(400).json({ code: 'champs' })
    const a = admin()
    const profil = (await a.db.doc(`utilisateurs/${uid}`).get()).data()
    if (!profil || profil.role !== 'client') return res.status(404).json({ code: 'inconnu' })
    if (profil.statut !== 'invité') return res.status(409).json({ code: 'deja-actif' })
    const lien = await nouvelleInvitation(a, { uid, email: profil.email })
    const envoye = await envoyerInvitation({ email: profil.email, prenom: profil.prenom, lien })
    return res.status(200).json({ envoye, email: profil.email })
  } catch (e) {
    return repondreErreur(res, e)
  }
}
