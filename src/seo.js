// Référencement du site vitrine (26 novembre 2026, audit « GEO ») : titre et description de chaque page publique,
// fiche d'identité pour les moteurs de recherche et les assistants IA. Utilisé à la fois par le navigateur (useTitre)
// et par scripts/prerendre.mjs, qui écrit au moment de la mise en ligne une page HTML déjà remplie pour chaque adresse.
// Textes écrits par Claude à partir de ceux du site : à valider par Marie.
import { CONTACT, RESEAUX } from './components/liens.js'

export const SITE = 'https://www.rimaactive.fr'

export const PAGES = {
  '/': {
    titre: 'Marie Sillas · Coach sportive à Houdan (78) | Rimaactive',
    description: 'Marie Sillas, coach sportive diplômée d’État basée à Houdan (78) : séances de renforcement et de mobilité pour les particuliers, les duos et groupes et les entreprises, dans les Yvelines, l’Eure-et-Loir et l’Eure.',
  },
  '/offres': {
    titre: 'Mes formules · Coaching individuel, en ligne, en groupe et en entreprise | Rimaactive',
    description: 'Coaching sportif à domicile ou en salle, en ligne, en duo ou en groupe et en entreprise, autour de Houdan (78) : renforcement et mobilité avec Marie Sillas, coach diplômée d’État.',
  },
  '/contact': {
    titre: 'Contact · Marie Sillas, coach sportive à Houdan (78) | Rimaactive',
    description: 'Écrivez à Marie Sillas pour votre coaching sportif : basée à Houdan, elle intervient dans les Yvelines (78), l’Eure-et-Loir (28) et l’Eure (27).',
  },
  '/mentions-legales': {
    titre: 'Mentions légales | Rimaactive',
    description: 'Mentions légales et politique de confidentialité du site Rimaactive, Marie Sillas, coach sportive à Houdan (78).',
  },
  '/cgv': {
    titre: 'Conditions générales de vente | Rimaactive',
    description: 'Conditions générales de vente de Rimaactive, Marie Sillas, coach sportive à Houdan (78).',
  },
}

// Page de connexion de l'espace (/espace) : titre et description vus dans Google, à la place de ceux de l'accueil
export const ESPACE = {
  titre: 'Connexion à mon espace | Rimaactive',
  description: 'Espace des coachés de Marie Sillas : connectez-vous pour retrouver votre programme, vos séances et votre progression.',
}

// Fiche d'identité (schema.org) : seulement ce qui est écrit sur le site, rien d'inventé
export const IDENTITE = {
  '@context': 'https://schema.org',
  '@type': 'SportsActivityLocation',
  '@id': `${SITE}/#rimaactive`,
  name: 'Rimaactive',
  description: PAGES['/'].description,
  url: `${SITE}/`,
  image: `${SITE}/apercu-partage.jpg`,
  logo: `${SITE}/icone-512.png`,
  email: CONTACT.email,
  address: { '@type': 'PostalAddress', addressLocality: 'Houdan', postalCode: '78550', addressRegion: 'Île-de-France', addressCountry: 'FR' },
  areaServed: ['Yvelines (78)', 'Eure-et-Loir (28)', 'Eure (27)'].map((name) => ({ '@type': 'AdministrativeArea', name })),
  founder: { '@type': 'Person', name: 'Marie Sillas', jobTitle: 'Coach sportive diplômée d’État' },
  knowsAbout: ['Renforcement musculaire', 'Mobilité', 'Coaching sportif à domicile', 'Coaching sportif en entreprise', 'Coaching en ligne'],
  sameAs: RESEAUX.map((r) => r.href),
}

export const pageSeo = (chemin) => PAGES[String(chemin ?? '/').replace(/\/+$/, '') || '/'] ?? null
