import photoGroupes from '../assets/service-groupes.jpg'
import PageService from '../components/PageService.jsx'
import useTitre from '../components/useTitre.js'

// Page Groupes (2 à 8 personnes) : prix donné par Marie (7 novembre 2026)
export const PAGE = {
  titre: 'Groupes',
  image: photoGroupes,
  cadrage: '50% 60%', // partie de la photo montrée dans le bandeau (les kettlebells)
  liste: ['À domicile ou en extérieur', 'Matériel fourni : tapis, kettlebells, slam balls, etc.', 'Déplacements compris jusqu’à 20\u00a0km autour de Houdan, au-delà sur devis'],
  note: 'TVA non applicable, art. 293\u00a0B du CGI.',
  cartes: [
    {
      nom: 'Séance en groupe',
      picto: 'users',
      surtitre: '2 à 8 personnes',
      infos: '60\u00a0min',
      tarifs: [{ montant: '70\u00a0€', apres: 'la séance' }],
      titrePoints: 'Compris pour chaque séance',
      points: ['Mobilité & Activation : 7 à 10\u00a0min', 'Corps de séance : 40 à 50\u00a0min', 'Retour au calme : 3 à 5\u00a0min'],
    },
  ],
}

export default function Groupes() {
  useTitre('Groupes')
  return <PageService page={PAGE} />
}
