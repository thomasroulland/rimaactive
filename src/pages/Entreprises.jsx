import PageService from '../components/PageService.jsx'
import useTitre from '../components/useTitre.js'

// Contenu de la page Entreprises (fiche « Formules et tarifs » du design system, octobre 2026)
const PAGE = {
  titre: 'Entreprises',
  surtitre: 'Pour vos équipes',
  tarifs: {
    cartes: [
      {
        nom: 'Active 60',
        details: [['Durée', '60\u00a0min'], ['Participants', '4 à 12'], ['Fréquence', 'Ponctuelle ou chaque semaine']],
        prix: { montant: '110\u00a0€', apres: 'la séance' },
        autresPrix: ['De 4 à 8 personnes', '150\u00a0€ la séance de 9 à 12 personnes'],
      },
      {
        nom: 'Active Day',
        details: [['Participants', 'Jusqu’à 16'], ['Fréquence', 'Ponctuelle'], ['Tarif', 'Sur devis']],
        prix: { avant: 'À partir de ', montant: '180\u00a0€', apres: 'la séance' },
      },
    ],
    notes: [
      'Dans vos locaux ou en extérieur, tout le matériel est apporté. Déplacement compris dans un rayon de 20\u00a0km autour de Houdan ; au-delà, sur devis. Devis gratuit sous 48\u00a0h.',
      'Tarifs valables jusqu’au 30 avril 2027. TVA non applicable, art. 293\u00a0B du CGI.',
    ],
  },
}

export default function Entreprises() {
  useTitre('Entreprises')
  return <PageService page={PAGE} />
}
