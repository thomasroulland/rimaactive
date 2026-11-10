// photo échangée avec celle d'Individuel (Marie, 10 novembre 2026)
import photoEnLigne from '../assets/service-individuel.jpg'
import PageService from '../components/PageService.jsx'
import useTitre from '../components/useTitre.js'

// Page En ligne : Suivi mensuel en ligne, prix donné par Marie (10 novembre 2026) ; photo envoyée par Marie
export const PAGE = {
  titre: 'En ligne',
  image: photoEnLigne,
  cadrage: '50% 30%',
  note: 'TVA non applicable, art. 293\u00a0B du CGI.',
  cartes: [
    {
      nom: 'Suivi mensuel en ligne',
      // « Pour qui ? » repris des informations du site (provisoire : à remplacer par le texte de Marie)
      pourQui: 'Une personne qui veut s’entraîner à distance, avec un programme personnalisé et un suivi hebdomadaire.',
      titre: 'Suivi mensuel',
      picto: 'laptop',
      surtitre: 'En ligne',
      infos: '3 mois',
      tarifs: [{ montant: '150\u00a0€', apres: 'les 3 mois', detail: 'ou 3 × 50\u00a0€' }],
      titrePoints: 'Compris',
      points: ['Programme personnalisé', 'Suivi hebdomadaire', 'Bilans'],
      sombre: true,
    },
  ],
}

export default function EnLigne() {
  useTitre('En ligne')
  return <PageService page={PAGE} />
}
