// photo échangée avec celle d'Individuel (Marie, 10 novembre 2026)
import photoEnLigne from '../assets/service-individuel.jpg'
import PageService from '../components/PageService.jsx'
import useTitre from '../components/useTitre.js'

// Page En ligne : Coaching en ligne (nom du 17 novembre 2026), prix donné par Marie ; photo envoyée par Marie
export const PAGE = {
  titre: 'En ligne',
  image: photoEnLigne,
  cadrage: '50% 30%',
  note: 'TVA non applicable, art. 293\u00a0B du CGI.',
  cartes: [
    {
      nom: 'Coaching en ligne',
      // « Pour qui ? » repris des informations du site (provisoire : à remplacer par le texte de Marie)
      pourQui: 'Une personne qui veut s’entraîner à distance, avec un programme sur mesure et un bilan chaque semaine.',
      titre: 'Coaching en ligne',
      bouton: 'Commencer mon suivi',
      picto: 'laptop',
      puce: 'haltere',
      surtitre: '100\u00a0% à distance',
      infos: 'Minimum 2\u00a0mois',
      // prix de Marie (PDF du 16 novembre 2026) ; textes de la carte du 17 novembre 2026
      tarifs: [{ montant: '45\u00a0€', apres: 'par mois' }],
      points: ['Programme personnalisé', 'Bilan et ajustements chaque semaine', 'Suivi sur votre espace personnel'],
      sombre: true,
    },
  ],
}

export default function EnLigne() {
  useTitre('En ligne')
  return <PageService page={PAGE} />
}
