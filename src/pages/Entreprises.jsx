import photoEntreprises from '../assets/service-entreprises.jpg'
import PageService from '../components/PageService.jsx'
import useTitre from '../components/useTitre.js'

// Contenu de la page Entreprises : fiche « Formules et tarifs » de Marie (octobre 2026), repris tel quel
const PAGE = {
  titre: 'Entreprises',
  lieux: 'Locaux · Extérieur',
  image: photoEntreprises,
  liste: [
    'Dans vos locaux ou en extérieur',
    'Matériel fourni : tapis, kettlebells, slam balls, etc.',
    'Déplacement inclus jusqu’à 20\u00a0km autour de Houdan (78)',
  ],
  note: 'Tarifs valables jusqu’au 30 avril 2027. TVA non applicable, art. 293\u00a0B du CGI.',
  cartes: [
    {
      nom: 'Active 60',
      picto: 'buildings',
      surtitre: '4 à 12 personnes',
      infos: '60\u00a0min · ponctuel ou hebdomadaire',
      tarifs: [{ libelle: 'Par séance', avant: 'À partir de', montant: '110\u00a0€', detail: 'Selon le devis et le nombre de personnes' }],
    },
    {
      nom: 'Active Day',
      picto: 'map-pin',
      surtitre: 'Jusqu’à 16 personnes',
      infos: 'Sur devis · ponctuel',
      tarifs: [{ libelle: 'Par séance', avant: 'À partir de', montant: '180\u00a0€', detail: 'Selon le devis et le nombre de personnes' }],
      sombre: true,
    },
  ],
}

export default function Entreprises() {
  useTitre('Entreprises')
  return <PageService page={PAGE} />
}
