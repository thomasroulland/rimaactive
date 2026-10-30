import PageService from '../components/PageService.jsx'
import useTitre from '../components/useTitre.js'

// Contenu de la page Individuel (fiche « Formules et tarifs » du design system, octobre 2026)
const PRESENTIEL = [
  'Séances d’une heure',
  'À domicile ou en salle',
  'Matériel apporté',
  'Déplacement compris dans un rayon de 20\u00a0km',
]

const PAGE = {
  titre: 'Individuel',
  surtitre: 'Pour vous',
  intro: 'Je vous accompagne en présentiel ou à distance avec des séances construites autour de vos objectifs et de votre niveau.',
  liste: PRESENTIEL,
  note: 'Bilan postural + correctifs seul : 70\u00a0€. Tarifs valables jusqu’au 30 avril 2027.',
  onglets: [
    {
      nom: 'À domicile',
      cartes: [
        {
          surtitre: 'À la séance',
          nom: 'Active Solo',
          prix: { montant: '65\u00a0€', unite: 'la séance' },
          texte: 'Pour des conseils techniques ou une séance ponctuelle.',
          petit: '55\u00a0€ en salle',
        },
        {
          surtitre: 'Au mois',
          nom: 'Active Flex',
          pastille: 'Sans engagement',
          prix: { montant: '220\u00a0€', unite: 'par mois, 4 séances' },
          texte: 'Bilan initial, bilan postural et correctifs, programme personnalisé, suivi hebdomadaire par message et bilan mensuel.',
          petit: '180\u00a0€ en salle',
          sombre: true,
        },
      ],
    },
    {
      nom: 'En salle',
      cartes: [
        {
          surtitre: 'À la séance',
          nom: 'Active Solo',
          prix: { montant: '55\u00a0€', unite: 'la séance' },
          texte: 'Pour des conseils techniques ou une séance ponctuelle.',
          petit: '65\u00a0€ à domicile',
        },
        {
          surtitre: 'Au mois',
          nom: 'Active Flex',
          pastille: 'Sans engagement',
          prix: { montant: '180\u00a0€', unite: 'par mois, 4 séances' },
          texte: 'Bilan initial, bilan postural et correctifs, programme personnalisé, suivi hebdomadaire par message et bilan mensuel.',
          petit: '220\u00a0€ à domicile',
          sombre: true,
        },
      ],
    },
    {
      nom: 'En ligne',
      note: 'Tarifs valables jusqu’au 30 avril 2027.',
      liste: ['Programmes de 8 semaines', 'À la maison ou en salle', 'Vidéos et guide d’échauffement', 'Tableau de suivi'],
      cartes: [
        {
          surtitre: '2 séances par semaine',
          nom: 'Active Start',
          prix: { montant: '35\u00a0€', unite: '8 semaines' },
          texte: 'À la maison avec deux kettlebells ou en salle.',
        },
        {
          surtitre: '3 séances par semaine',
          nom: 'Active Progress',
          prix: { montant: '40\u00a0€', unite: '8 semaines' },
          texte: 'À la maison avec deux kettlebells ou en salle.',
        },
        {
          surtitre: 'Sur mesure',
          nom: 'Active Plus',
          pastille: '8 semaines',
          prix: { montant: '160\u00a0€', unite: 'ou 2 × 80\u00a0€' },
          texte: 'Programme personnalisé, suivi hebdomadaire, bilan initial et bilan à mi-parcours.',
          sombre: true,
        },
      ],
    },
  ],
}

export default function Particuliers() {
  useTitre('Individuel')
  return <PageService page={PAGE} />
}
