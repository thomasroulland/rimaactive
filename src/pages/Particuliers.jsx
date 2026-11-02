import photoIndividuel from '../assets/service-individuel.jpg'
import PageService from '../components/PageService.jsx'
import useTitre from '../components/useTitre.js'

// Contenu de la page Individuel (présentiel et en ligne) : fiche « Formules et tarifs » de Marie (octobre 2026), repris tel quel
const PAGE = {
  titre: 'Individuel',
  lieux: 'Domicile · Salle · En ligne',
  image: photoIndividuel,
  note: 'Tarifs valables jusqu’au 30 avril 2027. TVA non applicable, art. 293\u00a0B du CGI.',
  // Trois formules sur la même page ; le bouton Présentiel / En ligne grise celles de l'autre mode (Marie, 2 novembre 2026).
  // Active Start et Active Progress (présentiel) remplacent Active Solo et Active Flex ; les anciens programmes
  // en ligne Start (35 €) et Progress (40 €) sont retirés.
  onglets: [
    { nom: 'Présentiel', liste: ['En salle ou à domicile', 'Matériel fourni : tapis, kettlebells, slam balls, etc.', 'Déplacement inclus jusqu’à 20\u00a0km autour de Houdan (78)'] },
    { nom: 'En ligne', liste: ['Programme en ligne sur 8 semaines'] },
  ],
  cartes: [
    {
      nom: 'Active Start',
      mode: 'Présentiel',
      picto: 'barbell',
      surtitre: '1 séance en présentiel',
      tarifs: [
        { libelle: 'À domicile', montant: '65\u00a0€', detail: 'la séance' },
        { libelle: 'En salle', montant: '55\u00a0€', detail: 'la séance' },
      ],
      titrePoints: 'Compris pour chaque session',
      points: ['Mobilité & Activation : 5 à 10\u00a0min', 'Corps de séance : 30 à 45\u00a0min', 'Retour au calme : 5\u00a0min'],
    },
    {
      nom: 'Active Progress',
      mode: 'Présentiel',
      picto: 'kettlebell',
      surtitre: '4 séances par mois en présentiel',
      tarifs: [
        { libelle: 'À domicile', montant: '220\u00a0€', detail: '55\u00a0€ la séance' },
        { libelle: 'En salle', montant: '180\u00a0€', detail: '45\u00a0€ la séance' },
      ],
      titrePoints: 'Compris',
      points: [
        'Bilan initial + bilan postural + correctifs',
        'Programme personnalisé',
        'Suivi hebdomadaire par message',
        'Bilan mensuel',
        'Engagement mois par mois',
      ],
      sombre: true,
    },
    {
      nom: 'Active Plus',
      mode: 'En ligne',
      picto: 'users',
      surtitre: 'Programme personnalisé en ligne',
      tarifs: [{ libelle: '8 semaines', montant: '160\u00a0€', detail: 'ou 2 × 80\u00a0€ · 20\u00a0€ par semaine' }],
      titrePoints: 'Compris',
      points: ['Suivi hebdomadaire', 'Bilan initial et bilan à mi-parcours'],
    },
  ],
}

export default function Particuliers() {
  useTitre('Individuel')
  return <PageService page={PAGE} />
}
