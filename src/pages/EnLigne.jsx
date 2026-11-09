import photoEnLigne from '../assets/service-en-ligne.jpg'
import PageService from '../components/PageService.jsx'
import useTitre from '../components/useTitre.js'

// Page En ligne : Active Plus, prix donné par Marie (7 novembre 2026) ; photo envoyée par Marie
export const PAGE = {
  titre: 'En ligne',
  image: photoEnLigne,
  cadrage: '50% 45%', // partie de la photo montrée dans le bandeau (la barre et le disque)
  note: 'TVA non applicable, art. 293\u00a0B du CGI.',
  cartes: [
    {
      nom: 'Active Plus',
      picto: 'laptop',
      surtitre: 'Suivi en ligne',
      infos: '12 semaines',
      tarifs: [{ montant: '240\u00a0€', apres: 'les 12 semaines', detail: 'ou 3 × 80\u00a0€' }],
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
