// Messages d'erreur en français pour les codes Firebase les plus courants
const MESSAGES = {
  'auth/invalid-credential': 'E-mail ou mot de passe incorrect.',
  'auth/wrong-password': 'E-mail ou mot de passe incorrect.',
  'auth/user-not-found': 'E-mail ou mot de passe incorrect.',
  'auth/invalid-email': 'Cette adresse e-mail n’est pas valide.',
  'auth/too-many-requests': 'Trop d’essais. Réessayez dans quelques minutes.',
  'auth/network-request-failed': 'Pas de connexion internet. Vérifiez votre réseau.',
  'auth/expired-action-code': 'Ce lien a expiré. Demandez à Marie de vous renvoyer l’invitation.',
}

export function messageErreur(code) {
  return MESSAGES[code] || 'Une erreur est survenue. Réessayez.'
}
