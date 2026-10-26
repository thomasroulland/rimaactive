import PageService from '../components/PageService.jsx'
import useTitre from '../components/useTitre.js'

// Contenu de la page Individuel ; les textes entre crochets restent à rédiger
const PAGE = {
  titre: 'Individuel',
  surtitre: 'Pour vous',
  vecu: [
    ['Manque de temps', '[Texte à rédiger]'],
    ['Ne pas savoir par où commencer', '[Texte à rédiger]'],
    ['L’idée qu’il faut se priver', '[Texte à rédiger]'],
  ],
  photoSession: 'Séance avec un particulier',
  session: [['Lieu', null, 'map-pin'], ['Durée', '60\u00a0min en présentiel', 'timer'], ['Matériel apporté', null, 'kettlebell'], ['Déroulé', null, 'check-square']],
  tarifs: {
    onglets: [
      {
        nom: 'À domicile',
        intro: 'En présentiel · séances de 60\u00a0min',
        cartes: [
          {
            nom: 'Active Solo',
            pourQui: 'Pour des conseils techniques ou une séance ponctuelle',
            details: [['Séances', '1']],
            prix: { montant: '60\u00a0€', apres: 'la séance' },
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
        intro: 'En présentiel · séances de 60\u00a0min',
        cartes: [
          {
            nom: 'Active Solo',
            pourQui: 'Pour des conseils techniques ou une séance ponctuelle',
            details: [['Séances', '1']],
            prix: { montant: '50\u00a0€', apres: 'la séance' },
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
        intro: 'Programmes de 8 semaines',
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
  faq: [
    ['Pourquoi me faire confiance ?', '[Réponse à rédiger]'],
    ['[Question 2 à rédiger]', '[Réponse à rédiger]'],
    ['[Question 3 à rédiger]', '[Réponse à rédiger]'],
    ['[Question 4 à rédiger]', '[Réponse à rédiger]'],
  ],
}

export default function Particuliers() {
  useTitre('Individuel')
  return <PageService page={PAGE} />
}
