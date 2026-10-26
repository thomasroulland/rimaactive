import PageService from '../components/PageService.jsx'
import useTitre from '../components/useTitre.js'

// Contenu de la page Groupes ; les textes entre crochets restent à rédiger
const PAGE = {
  titre: 'Groupes',
  surtitre: 'Pour vos habitants',
  vecu: [
    ['[Situation 1]', '[Texte à rédiger]'],
    ['[Situation 2]', '[Texte à rédiger]'],
    ['[Situation 3]', '[Texte à rédiger]'],
  ],
  photoSession: 'Séance en groupe, en extérieur',
  session: [['Lieu', null, 'map-pin'], ['Durée', '60\u00a0min', 'timer'], ['Matériel apporté', null, 'kettlebell'], ['Déroulé', null, 'check-square']],
  tarifs: {
    cartes: [
      {
        nom: 'Active Duo',
        details: [['Durée', '60\u00a0min'], ['Participants', '2'], ['Lieu', 'À domicile ou en extérieur']],
        prix: { montant: '80\u00a0€', apres: 'la séance' },
        autresPrix: ['300\u00a0€ par mois (4 séances)', '540\u00a0€ par mois (8 séances)'],
        deplacement: '90\u00a0€ la séance, 320\u00a0€ ou 580\u00a0€ par mois',
      },
      {
        nom: 'Active Group',
        details: [['Durée', '60\u00a0min'], ['Participants', '4 à 10'], ['Lieu', 'En extérieur']],
        prix: { montant: '14\u00a0€', apres: 'par personne' },
        autresPrix: ['12\u00a0€ par personne dès 7 inscrits'],
      },
    ],
    notes: [
      'Déplacement offert jusqu’à 10\u00a0km autour de Houdan, et toujours offert pour Active Group.',
      'Séance Active Group maintenue à partir de 4 inscrits.',
    ],
  },
  faq: [
    ['Pourquoi me faire confiance ?', '[Réponse à rédiger]'],
    ['[Question 2 à rédiger]', '[Réponse à rédiger]'],
    ['[Question 3 à rédiger]', '[Réponse à rédiger]'],
    ['[Question 4 à rédiger]', '[Réponse à rédiger]'],
  ],
}

export default function Communes() {
  useTitre('Groupes')
  return <PageService page={PAGE} />
}
