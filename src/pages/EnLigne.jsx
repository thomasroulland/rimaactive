import photoEnLigne from '../assets/service-en-ligne.jpg'
import PageService from '../components/PageService.jsx'
import useTitre from '../components/useTitre.js'

// Page En ligne : Suivi mensuel en ligne, prix donné par Marie (10 novembre 2026) ; photo envoyée par Marie
export const PAGE = {
  titre: 'En ligne',
  image: photoEnLigne,
  cadrage: '50% 45%', // partie de la photo montrée dans le bandeau (la barre et le disque)
  note: 'TVA non applicable, art. 293\u00a0B du CGI.',
  cartes: [
    {
      nom: 'Suivi mensuel en ligne',
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
