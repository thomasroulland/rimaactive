import PageService from '../components/PageService.jsx'
import useTitre from '../components/useTitre.js'

// Contenu de la page Individuel (présentiel et en ligne) : fiche « Formules et tarifs » de Marie (octobre 2026), repris tel quel
const KETTLEBELLS = 'En salle ou à la maison avec des kettlebells'

const PAGE = {
  titre: 'Individuel',
  note: 'Tarifs valables jusqu’au 30 avril 2027. TVA non applicable, art. 293\u00a0B du CGI.',
  onglets: [
    {
      nom: 'Présentiel',
      liste: ['En salle ou à domicile', 'Déplacement inclus jusqu’à 20\u00a0km autour de Houdan (78)'],
      cartes: [
        {
          nom: 'Active Solo',
          picto: 'barbell',
          surtitre: '1 séance en présentiel',
          tarifs: [
            { libelle: 'À domicile', montant: '65\u00a0€', detail: 'la séance' },
            { libelle: 'En salle', montant: '55\u00a0€', detail: 'la séance' },
          ],
        },
        {
          nom: 'Active Flex',
          picto: 'kettlebell',
          surtitre: '4 séances par mois en présentiel',
          titrePoints: 'Compris',
          points: [
            'Bilan initial + bilan postural + correctifs',
            'Programme personnalisé',
            'Suivi hebdomadaire par message',
            'Bilan mensuel',
            'Engagement mois par mois',
          ],
          tarifs: [
            { libelle: 'À domicile', montant: '220\u00a0€', detail: '55\u00a0€ la séance' },
            { libelle: 'En salle', montant: '180\u00a0€', detail: '45\u00a0€ la séance' },
          ],
          sombre: true,
        },
      ],
    },
    {
      nom: 'En ligne',
      intro: 'Programmes en ligne sur 8 semaines.',
      liste: [],
      cartes: [
        {
          nom: 'Active Start',
          picto: 'timer',
          surtitre: 'Programme en ligne',
          points: ['2 séances par semaine', KETTLEBELLS],
          tarifs: [{ libelle: '8 semaines', montant: '35\u00a0€', detail: '4,40\u00a0€ par semaine' }],
        },
        {
          nom: 'Active Progress',
          picto: 'barbell',
          surtitre: 'Programme en ligne',
          points: ['3 séances par semaine', KETTLEBELLS],
          tarifs: [{ libelle: '8 semaines', montant: '40\u00a0€', detail: '5\u00a0€ par semaine' }],
        },
        {
          nom: 'Active Plus',
          picto: 'users',
          surtitre: 'Programme personnalisé',
          points: ['Suivi hebdomadaire', 'Bilan initial et bilan à mi-parcours'],
          tarifs: [{ libelle: '8 semaines', montant: '160\u00a0€', apres: 'ou 2 × 80\u00a0€', detail: '20\u00a0€ par semaine' }],
          sombre: true,
        },
      ],
    },
  ],
}

export default function Particuliers() {
  useTitre('Individuel')
  return <PageService page={PAGE} />
}
