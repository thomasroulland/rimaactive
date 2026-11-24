import { admin, repondreErreur } from './_admin.js'
import { empreinte } from './_invitation.js'

export const MOT_DE_PASSE_MIN = 8

// POST { t, motDePasse? } : lien d'invitation du site (sans connexion, le jeton fait foi).
// - sans mot de passe : vérifie seulement le lien → 200 { prenom } (la page affiche « Bonjour Léa »), 404 invalide, 410 expiré ;
// - avec mot de passe : le pose sur le compte, efface le lien (il ne sert qu'une fois) → 200 { email } ; la page connecte
//   ensuite le client directement, sans repasser par la page de connexion.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ code: 'methode' })
  try {
    const corps = req.body && typeof req.body === 'object' ? req.body : {}
    const jeton = typeof corps.t === 'string' ? corps.t.trim() : ''
    if (!jeton || jeton.length > 200) return res.status(404).json({ code: 'invalide' })
    const a = admin()
    const ref = a.db.doc(`invitations/${empreinte(jeton)}`)
    const inv = await ref.get()
    if (!inv.exists) return res.status(404).json({ code: 'invalide' })
    const { uid, expire } = inv.data()
    if (!(expire > Date.now())) return res.status(410).json({ code: 'expire' })
    let compte
    try { compte = await a.auth.getUser(uid) } catch { return res.status(404).json({ code: 'invalide' }) }

    if (corps.motDePasse === undefined) {
      const profil = (await a.db.doc(`utilisateurs/${uid}`).get()).data() ?? {}
      return res.status(200).json({ prenom: profil.prenom ?? '' })
    }
    const motDePasse = typeof corps.motDePasse === 'string' ? corps.motDePasse : ''
    if (motDePasse.length < MOT_DE_PASSE_MIN || motDePasse.length > 128) return res.status(400).json({ code: 'mot-de-passe' })
    await a.auth.updateUser(uid, { password: motDePasse, emailVerified: true })
    await ref.delete()
    return res.status(200).json({ email: compte.email })
  } catch (e) {
    return repondreErreur(res, e)
  }
}
