// photo échangée avec celle d'Individuel (Marie, 10 novembre 2026)
import photoEnLigne from '../assets/service-individuel.jpg'
import PageService from '../components/PageService.jsx'
import useTitre from '../components/useTitre.js'

// Page En ligne : Suivi mensuel en ligne, prix donné par Marie (12 novembre 2026) ; photo envoyée par Marie
export const PAGE = {
  titre: 'En ligne',
  image: photoEnLigne,
  cadrage: '50% 30%',
  note: 'TVA non applicable, art. 293\u00a0B du CGI.',
  cartes: [
    {
      nom: 'Suivi mensuel en ligne',
      // « Pour qui ? » repris des informations du site (provisoire : à remplacer par le texte de Marie)
      pourQui: 'Une personne qui veut s’entraîner à distance, avec un programme sur mesure et un bilan chaque semaine.',
      titre: 'Suivi mensuel',
      picto: 'laptop',
      puce: 'haltere',
      surtitre: 'À distance',
      infos: 'Minimum 2\u00a0mois',
      // prix et « Compris » de Marie (PDF du 16 novembre 2026)
      tarifs: [{ montant: '45\u00a0€', apres: 'par mois', detail: 'soit 90\u00a0€ les 2\u00a0mois' }],
      points: ['Programme sur mesure', 'Bilan et ajustements chaque semaine', 'Suivi sur votre espace en ligne'],
      sombre: true,
    },
  ],
}

export default function EnLigne() {
  useTitre('En ligne')
  return <PageService page={PAGE} />
}
