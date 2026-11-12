import { describe, it, expect } from 'vitest'
import { messageErreur } from '../../src/espace/erreurs.js'

describe('messageErreur', () => {
  it.each([
    ['auth/invalid-credential', 'E-mail ou mot de passe incorrect.'],
    ['auth/too-many-requests', 'Trop d’essais. Réessayez dans quelques minutes.'],
    ['auth/network-request-failed', 'Pas de connexion internet. Vérifiez votre réseau.'],
    ['auth/expired-action-code', 'Ce lien a expiré. Demandez à Marie de vous renvoyer l’invitation.'],
    ['format', 'Format non pris en charge : envoyez une photo JPEG, PNG ou WebP.'],
    ['taille', 'Photo trop lourde (20 Mo maximum).'],
    ['code/inconnu', 'Une erreur est survenue. Réessayez.'],
    [undefined, 'Une erreur est survenue. Réessayez.'],
  ])('%s', (code, attendu) => {
    expect(messageErreur(code)).toBe(attendu)
  })
})
