import PageService from '../components/PageService.jsx'
import useTitre from '../components/useTitre.js'

// Contenu de la page Entreprises
const PAGE = {
  titre: 'Entreprises',
  surtitre: 'Pour vos équipes',
  tarifs: {
    cartes: [
      {
        nom: 'Active 30',
        details: [['Durée', '30\u00a0min'], ['Participants', '4 à 12'], ['Fréquence', 'Ponctuelle ou chaque semaine']],
        prix: { avant: 'À partir de ', montant: '80\u00a0€' },
      },
      {
        nom: 'Active 60',
        details: [['Durée', '60\u00a0min'], ['Participants', '4 à 12'], ['Fréquence', 'Chaque semaine, par trimestre']],
        prix: { avant: 'À partir de ', montant: '110\u00a0€' },
      },
      {
        nom: 'Active Day',
        details: [['Durée', '60\u00a0min'], ['Participants', 'Jusqu’à 16'], ['Fréquence', 'Ponctuelle']],
        prix: { avant: 'À partir de ', montant: '180\u00a0€' },
      },
    ],
    notes: [
      'Tarif selon le nombre de participants et la fréquence. Déplacement compris dans un rayon de 20\u00a0km autour de Houdan. Devis gratuit sous 48\u00a0h.',
      'TVA non applicable, art. 293\u00a0B du CGI.',
    ],
  },
}

export default function Entreprises() {
  useTitre('Entreprises')
  return <PageService page={PAGE} />
}
