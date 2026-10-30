import PageService from '../components/PageService.jsx'
import useTitre from '../components/useTitre.js'

// Contenu de la page Groupes (fiche « Formules et tarifs » du design system, octobre 2026)
const PAGE = {
  titre: 'Groupes',
  surtitre: 'À plusieurs',
  intro: 'Retrouvez-moi en extérieur, près de chez vous, pour progresser ensemble dans un esprit d’entraide.',
  liste: [
    'Séances d’une heure',
    'À domicile ou en extérieur',
    'Matériel apporté',
    'Déplacement compris dans un rayon de 20\u00a0km',
  ],
  note: 'Séance Active Group maintenue à partir de 4 inscrits. Tarifs valables jusqu’au 30 avril 2027.',
  cartes: [
    {
      surtitre: 'À deux',
      nom: 'Active Duo',
      prix: { montant: '85\u00a0€', unite: 'la séance' },
      texte: '60\u00a0min à deux, à domicile ou en extérieur.',
      petit: 'Soit 42,50\u00a0€ par personne',
    },
    {
      surtitre: 'En petit groupe',
      nom: 'Active Group',
      pastille: '4 à 10 personnes',
      prix: { montant: '14\u00a0€', unite: 'par personne' },
      texte: '60\u00a0min en extérieur, près de chez vous.',
      petit: 'Soit 56 à 140\u00a0€ la séance',
      sombre: true,
    },
  ],
}

export default function Communes() {
  useTitre('Groupes')
  return <PageService page={PAGE} />
}
