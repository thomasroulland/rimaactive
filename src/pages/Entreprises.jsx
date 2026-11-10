import photoEntreprises from '../assets/service-entreprises.jpg'
import PageService from '../components/PageService.jsx'
import useTitre from '../components/useTitre.js'

// Page Entreprises (jusqu'à 16 personnes) : prix donné par Marie (7 novembre 2026)
export const PAGE = {
  titre: 'Entreprises',
  image: photoEntreprises,
  cadrage: '50% 70%', // partie de la photo montrée dans le bandeau (les kettlebells)
  liste: ['Dans vos locaux ou en extérieur', 'Matériel fourni : tapis, kettlebells, slam balls, etc.', 'Déplacements compris jusqu’à 20\u00a0km autour de Houdan, au-delà sur devis'],
  note: 'TVA non applicable, art. 293\u00a0B du CGI.',
  cartes: [
    {
      nom: 'Séance en entreprise',
      // « Pour qui ? » repris des informations du site (provisoire : à remplacer par le texte de Marie)
      pourQui: 'Vos équipes, jusqu’à 16 personnes, dans vos locaux ou en extérieur.',
      picto: 'buildings',
      surtitre: 'Jusqu’à 16 personnes',
      infos: '60\u00a0min · Devis gratuit sous 48\u00a0h',
      tarifs: [{ montant: 'Sur devis' }],
      titrePoints: 'Compris pour chaque séance',
      points: ['Mobilité & Activation : 7 à 10\u00a0min', 'Corps de séance : 40 à 50\u00a0min', 'Retour au calme : 3 à 5\u00a0min'],
      bouton: 'Demander un devis',
    },
  ],
}

export default function Entreprises() {
  useTitre('Entreprises')
  return <PageService page={PAGE} />
}
