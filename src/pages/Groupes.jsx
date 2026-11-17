import photoGroupes from '../assets/service-groupes.jpg'
import PageService from '../components/PageService.jsx'
import useTitre from '../components/useTitre.js'

// Page Groupes (2 à 8 personnes) : prix donné par Marie (7 novembre 2026)
export const PAGE = {
  titre: 'Groupes',
  image: photoGroupes,
  cadrage: '50% 60%', // partie de la photo montrée dans le bandeau (les kettlebells)
  liste: ['Matériel fourni : tapis, kettlebells, slam balls, etc.', 'Déplacements compris jusqu’à 20\u00a0km autour de Houdan'],
  note: 'TVA non applicable, art. 293\u00a0B du CGI.',
  cartes: [
    {
      nom: 'Coaching en petit groupe',
      // « Pour qui ? » repris des informations du site (provisoire : à remplacer par le texte de Marie)
      pourQui: 'De 2 à 8 personnes, à domicile ou en extérieur, même avec des niveaux différents.',
      titre: 'Coaching en petit groupe',
      bouton: 'Organiser une séance',
      picto: 'users',
      puce: 'kettlebell',
      surtitre: '2 à 8 personnes',
      infos: '60\u00a0min • Sans engagement',
      // textes et prix de Marie (17 novembre 2026)
      tarifs: [{ avant: 'À partir de', montant: '15\u00a0€', apres: 'par personne', detail: '(selon la taille du groupe)' }],
      points: ['Entraînement collectif', 'Exercices adaptés aux participants', 'Matériel fourni'],
    },
  ],
}

export default function Groupes() {
  useTitre('Groupes')
  return <PageService page={PAGE} />
}
