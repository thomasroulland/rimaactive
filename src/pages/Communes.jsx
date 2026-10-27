import PageService from '../components/PageService.jsx'
import useTitre from '../components/useTitre.js'

// Contenu de la page Groupes
const PAGE = {
  titre: 'Groupes',
  surtitre: 'À plusieurs',
  tarifs: {
    cartes: [
      {
        nom: 'Active Duo',
        details: [['Durée', '60\u00a0min'], ['Participants', '2'], ['Lieu', 'À domicile ou en extérieur']],
        prix: { montant: '85\u00a0€', apres: 'la séance' },
        autresPrix: ['300\u00a0€ par mois (4 séances)', '540\u00a0€ par mois (8 séances)'],
      },
      {
        nom: 'Active Group',
        details: [['Durée', '60\u00a0min'], ['Participants', '4 à 10'], ['Lieu', 'En extérieur']],
        prix: { montant: '14\u00a0€', apres: 'par personne' },
        autresPrix: ['12\u00a0€ par personne dès 7 inscrits'],
      },
    ],
    notes: [
      'Séance Active Group maintenue à partir de 4 inscrits.',
      'Déplacement compris dans un rayon de 20\u00a0km autour de Houdan.',
    ],
  },
}

export default function Communes() {
  useTitre('Groupes')
  return <PageService page={PAGE} />
}
