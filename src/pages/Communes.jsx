import PageService from '../components/PageService.jsx'
import useTitre from '../components/useTitre.js'

// Contenu de la page Groupes : fiche « Formules et tarifs » de Marie (octobre 2026), repris tel quel
const PAGE = {
  titre: 'Groupes',
  surtitre: 'Duo et groupes',
  intro: 'Active Duo et Active Group, de 2 à 10 personnes.',
  liste: ['Déplacement compris dans un rayon de 20\u00a0km autour de Houdan', 'Au-delà de 20\u00a0km : sur devis'],
  note: 'Tarifs valables jusqu’au 30 avril 2027. TVA non applicable, art. 293\u00a0B du CGI.',
  cartes: [
    {
      nom: 'Active Duo',
      surtitre: '2 personnes',
      infos: '60\u00a0min · à domicile ou en extérieur',
      tarifs: [{ libelle: 'Par séance', montant: '85\u00a0€', detail: '42,50\u00a0€ par personne' }],
    },
    {
      nom: 'Active Group',
      surtitre: '4 à 10 personnes',
      infos: '60\u00a0min · en extérieur',
      tarifs: [{ libelle: 'Par séance', montant: '56 à 140\u00a0€', detail: '14\u00a0€ par personne' }],
      sombre: true,
    },
  ],
}

export default function Communes() {
  useTitre('Groupes')
  return <PageService page={PAGE} />
}
