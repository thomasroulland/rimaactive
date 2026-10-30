import PageService from '../components/PageService.jsx'
import useTitre from '../components/useTitre.js'

// Contenu de la page Groupes (fiche « Formules et tarifs » du design system, octobre 2026)
const PAGE = {
  titre: 'Groupes',
  surtitre: 'À plusieurs',
  tarifs: {
    cartes: [
      {
        nom: 'Active Duo',
        details: [['Durée', '60\u00a0min'], ['Participants', '2'], ['Lieu', 'À domicile ou en extérieur']],
        prix: { montant: '85\u00a0€', apres: 'la séance' },
        autresPrix: ['Soit 42,50\u00a0€ par personne'],
      },
      {
        nom: 'Active Group',
        details: [['Durée', '60\u00a0min'], ['Participants', '4 à 10'], ['Lieu', 'En extérieur']],
        prix: { montant: '14\u00a0€', apres: 'par personne' },
        autresPrix: ['Soit 56 à 140\u00a0€ la séance'],
      },
    ],
    notes: [
      'Séance Active Group maintenue à partir de 4 inscrits. Déplacement compris dans un rayon de 20\u00a0km autour de Houdan ; au-delà, sur devis.',
      'Tarifs valables jusqu’au 30 avril 2027.',
    ],
  },
}

export default function Communes() {
  useTitre('Groupes')
  return <PageService page={PAGE} />
}
