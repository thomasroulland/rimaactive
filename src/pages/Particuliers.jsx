import PageService from '../components/PageService.jsx'
import useTitre from '../components/useTitre.js'

// Contenu de la page Individuel (fiche « Formules et tarifs » du design system, octobre 2026)
const PAGE = {
  titre: 'Individuel',
  surtitre: 'Pour vous',
  tarifs: {
    onglets: [
      {
        nom: 'À domicile',
        intro: 'Séances de 60\u00a0min en présentiel.',
        notes: [
          'Bilan postural + correctifs seul : 70\u00a0€.',
          'Déplacement compris dans un rayon de 20\u00a0km autour de Houdan ; au-delà, sur devis.',
        ],
        cartes: [
          {
            nom: 'Active Solo',
            pourQui: 'Pour des conseils techniques ou une séance ponctuelle',
            details: [['Séances', '1']],
            prix: { montant: '65\u00a0€', apres: 'la séance' },
          },
          {
            nom: 'Active Flex',
            pourQui: 'Pour devenir autonome avec un cadre',
            details: [['Séances', '4 par mois (1 par semaine)'], ['Engagement', 'Sans engagement, mois par mois']],
            inclus: ['Bilan initial', 'Bilan postural et correctifs', 'Programme personnalisé', 'Suivi hebdomadaire par message', 'Bilan mensuel'],
            prix: { montant: '220\u00a0€', apres: 'par mois' },
          },
        ],
      },
      {
        nom: 'En salle',
        intro: 'Séances de 60\u00a0min en présentiel.',
        notes: [
          'Bilan postural + correctifs seul : 70\u00a0€.',
          'Déplacement compris dans un rayon de 20\u00a0km autour de Houdan ; au-delà, sur devis.',
        ],
        cartes: [
          {
            nom: 'Active Solo',
            pourQui: 'Pour des conseils techniques ou une séance ponctuelle',
            details: [['Séances', '1']],
            prix: { montant: '55\u00a0€', apres: 'la séance' },
          },
          {
            nom: 'Active Flex',
            pourQui: 'Pour devenir autonome avec un cadre',
            details: [['Séances', '4 par mois (1 par semaine)'], ['Engagement', 'Sans engagement, mois par mois']],
            inclus: ['Bilan initial', 'Bilan postural et correctifs', 'Programme personnalisé', 'Suivi hebdomadaire par message', 'Bilan mensuel'],
            prix: { montant: '180\u00a0€', apres: 'par mois' },
          },
        ],
      },
      {
        nom: 'En ligne',
        intro: 'Programmes de 8 semaines.',
        cartes: [
          {
            nom: 'Active Start',
            details: [['Rythme', '2 séances par semaine'], ['Lieu', 'Maison (2 kettlebells) ou salle']],
            inclus: ['Vidéos', 'Guide d’échauffement', 'Tableau de suivi'],
            prix: { montant: '35\u00a0€' },
          },
          {
            nom: 'Active Progress',
            details: [['Rythme', '3 séances par semaine'], ['Lieu', 'Maison (2 kettlebells) ou salle']],
            inclus: ['Vidéos', 'Guide d’échauffement', 'Tableau de suivi'],
            prix: { montant: '40\u00a0€' },
          },
          {
            nom: 'Active Plus',
            details: [['Rythme', 'Adapté à vous'], ['Lieu', 'Maison ou salle']],
            inclus: ['Programme personnalisé', 'Suivi hebdomadaire', 'Bilan initial', 'Bilan à mi-parcours'],
            prix: { montant: '160\u00a0€', apres: 'ou 2 × 80\u00a0€' },
          },
        ],
      },
    ],
    notes: ['Tarifs valables jusqu’au 30 avril 2027.'],
  },
}

export default function Particuliers() {
  useTitre('Individuel')
  return <PageService page={PAGE} />
}
