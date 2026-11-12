// Messages d'erreur en français pour les codes Firebase les plus courants
const MESSAGES = {
  'auth/invalid-credential': 'E-mail ou mot de passe incorrect.',
  'auth/wrong-password': 'E-mail ou mot de passe incorrect.',
  'auth/user-not-found': 'E-mail ou mot de passe incorrect.',
  'auth/invalid-email': 'Cette adresse e-mail n’est pas valide.',
  'auth/too-many-requests': 'Trop d’essais. Réessayez dans quelques minutes.',
  'auth/network-request-failed': 'Pas de connexion internet. Vérifiez votre réseau.',
  'auth/expired-action-code': 'Ce lien a expiré. Demandez à Marie de vous renvoyer l’invitation.',
  'api/champs': 'Vérifiez le prénom, le nom et l’adresse e-mail.',
  'api/401': 'Votre session a expiré. Reconnectez-vous.',
  'api/403': 'Seul le compte de Marie peut faire cela.',
  'api/configuration': 'Réglage manquant sur le serveur (nom du stockage des photos). Rien n’a été supprimé : prévenez Claude.',
  format: 'Format non pris en charge : envoyez une photo JPEG, PNG ou WebP.',
  envoi: 'Les photos n’ont pas pu être envoyées. Vérifiez votre connexion et réessayez.',
  taille: 'Photo trop lourde (20 Mo maximum).',
  'permission-denied': 'Vous n’avez pas le droit de faire cela.',
}

export function messageErreur(code) {
  return MESSAGES[code] || 'Une erreur est survenue. Réessayez.'
}
