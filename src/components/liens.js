export const PAGES = [
  { to: '/', label: 'Accueil' },
  { to: '/entreprises', label: 'Entreprises' },
  { to: '/communes', label: 'Duo et groupes' },
  { to: '/particuliers', label: 'Individuel' },
  { to: '/contact', label: 'Contact' },
]

// Menu du haut : les quatre pages en bulles ; le contact passe par le bouton « M'écrire »
export const PAGES_MENU = PAGES.filter((page) => page.to !== '/contact')

// Pas de numéro de téléphone sur le site, à la demande de Marie
export const CONTACT = {
  email: 'marie.sillas.coaching@outlook.com',
}

// Réseaux sociaux (Instagram @rimaactive ; Facebook et LinkedIn demandés par Marie le 30 octobre 2026).
// Sans adresse (href: null), le nom s'affiche sans lien en attendant que Marie la donne.
export const RESEAUX = [
  { label: 'Instagram', href: 'https://www.instagram.com/rimaactive/' },
  { label: 'Facebook', href: null },
  { label: 'LinkedIn', href: null },
]
