import photoIndividuel from '../assets/service-individuel.jpg'
import PageService from '../components/PageService.jsx'
import useTitre from '../components/useTitre.js'

// Contenu de la page Individuel (présentiel et en ligne) : fiche « Formules et tarifs » de Marie (octobre 2026), repris tel quel
const PAGE = {
  titre: 'Individuel',
  lieux: 'Domicile · Salle · En ligne',
  image: photoIndividuel,
  cadrage: '50% 30%', // partie de la photo montrée dans le bandeau (les kettlebells)
  note: 'Tarifs valables jusqu’au 30 avril 2027. TVA non applicable, art. 293\u00a0B du CGI.',
  // Trois formules sur la même page ; le bouton Présentiel / En ligne grise celles de l'autre mode (Marie, 2 novembre 2026).
  // Active Start et Active Progress (présentiel) remplacent Active Solo et Active Flex ; les anciens programmes
  // en ligne Start (35 €) et Progress (40 €) sont retirés.
  onglets: [
    { nom: 'Présentiel', liste: ['En salle ou à domicile', 'Matériel fourni : tapis, kettlebells, slam balls, etc.', 'Déplacement inclus jusqu’à 20\u00a0km autour de Houdan (78)'] },
    { nom: 'En ligne', liste: [] },
  ],
  cartes: [
    {
      nom: 'Active Start',
      mode: 'Présentiel',
      picto: 'barbell',
      surtitre: 'Séance à l’unité',
      tarifs: [
        { libelle: 'À domicile', montant: '65\u00a0€' },
        { libelle: 'En salle', montant: '55\u00a0€' },
      ],
      titrePoints: 'Compris pour chaque session',
      points: ['Mobilité & Activation : 7 à 10\u00a0min', 'Corps de séance : 40 à 50\u00a0min', 'Retour au calme : 3 à 5\u00a0min'],
    },
    {
      nom: 'Active Progress',
      mode: 'Présentiel',
      picto: 'kettlebell',
      surtitre: 'Suivi mensuel',
      tarifs: [
        { libelle: 'À domicile', montant: '220\u00a0€' },
        { libelle: 'En salle', montant: '180\u00a0€' },
      ],
      titrePoints: 'Compris',
      points: [
        'Bilan initial & postural',
        'Programme 100\u00a0% personnalisé',
        '4 sessions de coaching privé',
        'Suivi hebdomadaire sur WhatsApp',
        'Bilan de progression mensuel',
      ],
      sombre: true,
    },
    {
      nom: 'Active Plus',
      mode: 'En ligne',
      picto: 'users',
      surtitre: 'Suivi trimestriel',
      tarifs: [{ libelle: '12 semaines', montant: '240\u00a0€', detail: '80\u00a0€ par mois pendant 3 mois' }],
      titrePoints: 'Compris',
      points: ['Bilan initial', 'Programme 100\u00a0% personnalisé', 'Suivi hebdomadaire sur WhatsApp', 'Bilan de progression mensuel'],
    },
  ],
}

export default function Particuliers() {
  useTitre('Individuel')
  return <PageService page={PAGE} />
}
