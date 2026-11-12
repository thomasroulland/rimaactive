// Donne le rôle « coach » au compte de Marie (à lancer une seule fois).
// Usage : node scripts/definir-coach.mjs marie@exemple.fr
// En vrai : définir FIREBASE_SERVICE_ACCOUNT (JSON). En test : les variables des émulateurs suffisent.
import { admin } from '../api/_admin.js'

const email = (process.argv[2] || '').trim().toLowerCase()
if (!email) {
  console.error("Indiquez l'adresse e-mail : node scripts/definir-coach.mjs marie@exemple.fr")
  process.exit(1)
}

try {
  const a = admin()
  const u = await a.auth.getUserByEmail(email)
  await a.auth.setCustomUserClaims(u.uid, { role: 'coach' })
  const nom = (u.displayName || '').trim().split(/\s+/)
  await a.db.doc(`utilisateurs/${u.uid}`).set({
    prenom: nom[0] || '', nom: nom.slice(1).join(' '), email, role: 'coach',
    statut: 'actif', accordSante: null, creeLe: a.horodatage(),
  }, { merge: true })
  console.log(`Le compte ${email} est maintenant coach. Déconnectez-vous puis reconnectez-vous pour que cela prenne effet.`)
} catch (e) {
  console.error(`Impossible de définir le coach : ${e.message}`)
  process.exit(1)
}
