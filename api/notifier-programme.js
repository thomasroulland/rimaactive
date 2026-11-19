import { admin, verifierCoach, repondreErreur } from './_admin.js'

// Notification « nouveau programme » (19 novembre 2026) : appelée par l'espace coach juste après la publication.
// Envoyée une seule fois par programme (champ `notifieLe`) : republier après un retour en brouillon ne renvoie rien.
// Les téléphones du coaché sont dans utilisateurs/{uid}/appareils/{jeton} ; un jeton périmé est effacé.
export function creerGestionnaire(envoyer = (a, message) => a.messaging().sendEachForMulticast(message)) {
  return async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ code: 'methode' })
    try {
      await verifierCoach(req)
      const id = typeof req.body?.programme === 'string' ? req.body.programme.trim() : ''
      if (!id || id.includes('/')) return res.status(400).json({ code: 'champs' })
      const a = admin()
      const ref = a.db.doc(`programmes/${id}`)
      const prog = await ref.get()
      if (!prog.exists) return res.status(404).json({ code: 'introuvable' })
      const p = prog.data()
      if (p.statut !== 'publié') return res.status(409).json({ code: 'pas-publie' })
      if (p.notifieLe) return res.status(200).json({ envoyees: 0, deja: true })
      await ref.update({ notifieLe: a.horodatage() })

      const appareils = await a.db.collection(`utilisateurs/${p.client}/appareils`).get()
      const jetons = appareils.docs.map((d) => d.data().jeton).filter((j) => typeof j === 'string' && j)
      if (!jetons.length) return res.status(200).json({ envoyees: 0 })
      const titre = 'Votre nouveau programme est prêt'
      const texte = `Marie a publié « ${p.nom || 'votre programme'} ». Ouvrez l'application pour le découvrir.`
      const r = await envoyer(a, {
        tokens: jetons,
        notification: { title: titre, body: texte },
        data: { lien: '/espace/programme' },
        webpush: { notification: { title: titre, body: texte, icon: '/icone-192.png', badge: '/icone-192.png', tag: `programme-${id}` }, fcmOptions: { link: '/espace/programme' } },
      })
      // jetons qui ne marchent plus (application désinstallée, notifications coupées) : on les oublie
      const perimes = (r?.responses ?? []).map((x, i) => (!x.success && /registration-token-not-registered|invalid-registration-token|invalid-argument/.test(x.error?.code ?? '') ? jetons[i] : null)).filter(Boolean)
      await Promise.all(appareils.docs.filter((d) => perimes.includes(d.data().jeton)).map((d) => d.ref.delete()))
      return res.status(200).json({ envoyees: r?.successCount ?? 0 })
    } catch (e) {
      return repondreErreur(res, e)
    }
  }
}

export default creerGestionnaire()
