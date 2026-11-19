// Installation de l'application (19 novembre 2026). Chrome et Edge (Android, ordinateur) proposent une fenêtre
// d'installation : on la garde pour l'ouvrir avec notre bouton « Installer ». L'événement arrive tôt, d'où ce fichier
// chargé dès le démarrage (main.jsx). iPhone : pas de fenêtre, on explique les étapes (Partager › Sur l'écran d'accueil).
let invitation = null
const abonnes = new Set()
const prevenir = () => abonnes.forEach((f) => f())

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); invitation = e; prevenir() })
  window.addEventListener('appinstalled', () => { invitation = null; prevenir() })
}

export const installee = () => typeof window !== 'undefined'
  && (window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true)
export const surIphone = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
export const surAndroid = () => /android/i.test(navigator.userAgent)
export const invitationPrete = () => Boolean(invitation)
export function suivreInvitation(f) { abonnes.add(f); return () => abonnes.delete(f) }

// Ouvre la fenêtre d'installation du navigateur ; renvoie true si la personne a accepté
export async function installer() {
  if (!invitation) return false
  const e = invitation
  invitation = null
  e.prompt()
  const { outcome } = await e.userChoice
  prevenir()
  return outcome === 'accepted'
}
