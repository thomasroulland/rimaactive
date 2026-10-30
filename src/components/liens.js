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

// Réseaux sociaux (design system : Instagram @rimaactive)
export const RESEAUX = [
  { label: 'Instagram', href: 'https://www.instagram.com/rimaactive/' },
]
