// Aide privée (le « _ » l'exclut des routes Vercel) : lien d'invitation valable 7 jours et e-mail envoyé par le site.
// Le lien Firebase « Réinitialisation du mot de passe » ne dure qu'environ une heure et ce délai ne se règle pas :
// le site envoie donc son propre lien (rimaactive.fr/espace/invitation?t=…), qui ouvre une page du site où le client
// choisit son mot de passe puis arrive directement connecté dans son espace (voir api/activer-invitation.js).
// Seule l'empreinte du jeton est enregistrée (collection `invitations`, inaccessible aux navigateurs).
import { createHash, randomBytes } from 'node:crypto'
import { htmlInvitation, texteInvitation } from './_email-invitation.js'

export const DUREE_INVITATION = 7 * 24 * 60 * 60 * 1000 // 7 jours (demande de Marie : au moins 24 heures)

export const empreinte = (jeton) => createHash('sha256').update(String(jeton)).digest('hex')

export function adresseSite(env = process.env) {
  const brut = typeof env.SITE_URL === 'string' && env.SITE_URL.trim() ? env.SITE_URL.trim() : 'https://www.rimaactive.fr'
  return brut.replace(/\/+$/, '')
}

// Remplace les invitations encore ouvertes du client par une nouvelle ; renvoie le lien à mettre dans l'e-mail.
export async function nouvelleInvitation(a, { uid, email }, maintenant = Date.now()) {
  const anciennes = await a.db.collection('invitations').where('uid', '==', uid).get()
  const lot = a.db.batch()
  anciennes.docs.forEach((d) => lot.delete(d.ref))
  const jeton = randomBytes(32).toString('base64url')
  lot.set(a.db.doc(`invitations/${empreinte(jeton)}`), { uid, email, expire: maintenant + DUREE_INVITATION, creeLe: a.horodatage() })
  await lot.commit()
  return `${adresseSite()}/espace/invitation?t=${jeton}`
}

// Envoie l'e-mail par Resend. Renvoie true si l'e-mail est parti, false si l'envoi n'est pas configuré ou a échoué :
// le navigateur du coach envoie alors l'ancien e-mail Firebase (lien d'une heure), pour qu'un client ne reste jamais sans e-mail.
export async function envoyerInvitation({ email, prenom, lien }, env = process.env) {
  const cle = typeof env.RESEND_API_KEY === 'string' ? env.RESEND_API_KEY.trim() : ''
  if (!cle) return false
  const expediteur = (env.INVITATION_EXPEDITEUR || '').trim() || 'Marie Sillas · Rimaactive <invitation@rimaactive.fr>'
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${cle}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: expediteur,
        to: [email],
        reply_to: (env.INVITATION_REPONDRE_A || '').trim() || 'marie.sillas.coaching@outlook.com',
        subject: 'Créez votre mot de passe pour votre espace Rimaactive',
        html: htmlInvitation({ prenom, lien }),
        text: texteInvitation({ prenom, lien }),
      }),
    })
    if (!r.ok) { console.error(`Envoi de l'invitation refusé par Resend (${r.status})`); return false }
    return true
  } catch (e) {
    console.error("Envoi de l'invitation impossible :", e?.message)
    return false
  }
}
