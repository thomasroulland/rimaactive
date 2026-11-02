import photoEntreprises from '../assets/service-entreprises.jpg'
import PageService from '../components/PageService.jsx'
import useTitre from '../components/useTitre.js'

// Contenu de la page Entreprises (« Compris pour chaque session » : textes donnés par Marie le 2 novembre 2026) : fiche « Formules et tarifs » de Marie (octobre 2026), repris tel quel
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
      infos: '60\u00a0min · Ponctuel ou hebdomadaire',
      tarifs: [{ avant: 'À partir de', montant: '110\u00a0€', apres: 'par session', detail: 'Selon le nombre de personnes' }],
      titrePoints: 'Compris pour chaque session',
      points: ['Échauffement et mobilité : 5 à 10\u00a0min', 'Corps de séance : 30 à 45\u00a0min', 'Retour au calme : 5\u00a0min'],
    },
    {
      nom: 'Active Day',
      picto: 'map-pin',
      surtitre: 'Jusqu’à 16 personnes',
      infos: 'Sur devis · Ponctuel',
      tarifs: [{ avant: 'À partir de', montant: '180\u00a0€', apres: 'par session', detail: 'Selon le nombre de personnes' }],
      titrePoints: 'Compris pour chaque session',
      points: ['Échauffement et mobilité : 5 à 10\u00a0min', 'Corps de séance : 30 à 45\u00a0min', 'Retour au calme : 5\u00a0min'],
      sombre: true,
    },
  ],
}

export default function Entreprises() {
  useTitre('Entreprises')
  return <PageService page={PAGE} />
}
