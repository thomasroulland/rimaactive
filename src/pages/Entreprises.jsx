import photoEntreprises from '../assets/service-entreprises.jpg'
import PageService from '../components/PageService.jsx'
import useTitre from '../components/useTitre.js'

// Page Entreprises (jusqu'à 16 personnes) : prix donné par Marie (7 novembre 2026)
export const PAGE = {
  titre: 'Entreprises',
  image: photoEntreprises,
  cadrage: '50% 70%', // partie de la photo montrée dans le bandeau (les kettlebells)
  liste: ['Matériel fourni : tapis, kettlebells, slam balls, etc.', 'Déplacements compris jusqu’à 20\u00a0km autour de Houdan'],
  note: 'TVA non applicable, art. 293\u00a0B du CGI.',
  cartes: [
    {
      nom: 'Coaching en entreprise',
      // « Pour qui ? » repris des informations du site (provisoire : à remplacer par le texte de Marie)
      pourQui: 'Vos équipes, jusqu’à 16 personnes, dans vos locaux ou en extérieur.',
      titre: 'Coaching en entreprise',
      picto: 'buildings',
      puce: 'kettlebell',
      surtitre: 'Jusqu’à 16 personnes',
      infos: '60\u00a0min • Ponctuel ou régulier',
      tarifs: [{ montant: 'Sur devis' }],
      // « Compris » de Marie (PDF du 16 novembre 2026) ; carte sur fond noir
      points: ['Réveil musculaire & mobilité', 'Renforcement adapté à tous les niveaux', 'Challenge & cohésion d’équipe'],
      sombre: true,
      bouton: 'Demander un devis',
    },
  ],
}

export default function Entreprises() {
  useTitre('Entreprises')
  return <PageService page={PAGE} />
}
