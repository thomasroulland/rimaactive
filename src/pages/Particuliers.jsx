import PageService from '../components/PageService.jsx'
import useTitre from '../components/useTitre.js'

// Contenu de la page Individuel
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
          'Déplacement compris dans un rayon de 20\u00a0km autour de Houdan.',
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
            details: [['Séances', '4 par mois (1 par semaine)']],
            inclus: ['Bilan initial', 'Programme personnalisé', 'Suivi par message'],
            prix: { montant: '220\u00a0€', apres: 'par mois' },
          },
          {
            nom: 'Active Plus',
            pourQui: 'Pour être accompagné de près, idéal pour débuter',
            details: [['Séances', '8 par mois (2 par semaine)']],
            inclus: ['Bilan initial', 'Bilan postural', 'Programme personnalisé', 'Suivi par message'],
            prix: { montant: '400\u00a0€', apres: 'par mois' },
          },
        ],
      },
      {
        nom: 'En salle',
        intro: 'Séances de 60\u00a0min en présentiel.',
        notes: [
          'Bilan postural + correctifs seul : 70\u00a0€.',
          'Déplacement compris dans un rayon de 20\u00a0km autour de Houdan.',
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
            details: [['Séances', '4 par mois (1 par semaine)']],
            inclus: ['Bilan initial', 'Programme personnalisé', 'Suivi par message'],
            prix: { montant: '180\u00a0€', apres: 'par mois' },
          },
          {
            nom: 'Active Plus',
            pourQui: 'Pour être accompagné de près, idéal pour débuter',
            details: [['Séances', '8 par mois (2 par semaine)']],
            inclus: ['Bilan initial', 'Bilan postural', 'Programme personnalisé', 'Suivi par message'],
            prix: { montant: '320\u00a0€', apres: 'par mois' },
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
            nom: 'Active Personal',
            details: [['Rythme', 'Adapté à vous'], ['Lieu', 'Maison ou salle']],
            inclus: ['Bilan initial', '2 visios', 'Messages du lundi au vendredi'],
            prix: { montant: '160\u00a0€', apres: 'ou 2 × 80\u00a0€' },
          },
        ],
      },
    ],
  },
}

export default function Particuliers() {
  useTitre('Individuel')
  return <PageService page={PAGE} />
}
