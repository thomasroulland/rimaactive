// Menu : toutes les offres sur une seule page depuis le 10 novembre 2026
export const PAGES = [
  { to: '/', label: 'Accueil' },
  { to: '/offres', label: 'Mes offres' },
  { to: '/contact', label: 'Contact' },
]

// Menu du haut : les quatre pages en bulles ; le contact passe par le bouton « M'écrire »
export const PAGES_MENU = PAGES.filter((page) => page.to !== '/contact')

// Pas de numéro de téléphone sur le site, à la demande de Marie
export const CONTACT = {
  email: 'marie.sillas.coaching@outlook.com',
}

// Réseaux sociaux de Rimaactive (Instagram, Facebook et TikTok @rimaactive, demandés par Marie le 4 novembre 2026 ;
// LinkedIn retiré à sa demande). Adresses à confirmer par Marie : elles n'ont pas pu être ouvertes pour vérification.
export const RESEAUX = [
  { label: 'Instagram', href: 'https://www.instagram.com/rimaactive/' },
  { label: 'Facebook', href: 'https://www.facebook.com/rimaactive' },
  { label: 'TikTok', href: 'https://www.tiktok.com/@rimaactive' },
]
