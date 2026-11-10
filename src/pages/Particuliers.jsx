import photoIndividuel from '../assets/service-individuel.jpg'
import PageService from '../components/PageService.jsx'
import useTitre from '../components/useTitre.js'

// Page Individuel : formules et prix donnés par Marie (7 novembre 2026)
export const PAGE = {
  titre: 'Individuel',
  image: photoIndividuel,
  cadrage: '50% 30%', // partie de la photo montrée dans le bandeau (la barre)
  liste: ['Matériel fourni : tapis, kettlebells, slam balls, etc.', 'Déplacements compris jusqu’à 20\u00a0km autour de Houdan, au-delà sur devis'],
  // deux boutons sur la photo pour choisir À domicile / En salle (Marie, 10 novembre 2026) ;
  // page.cartes garde toutes les formules (le formulaire de contact s'en sert)
  onglets: [
    { nom: 'À domicile', noms: ['Séance à l’unité', 'Suivi mensuel'] },
    { nom: 'En salle', noms: ['En salle'] },
  ],
  note: 'TVA non applicable, art. 293\u00a0B du CGI.',
  cartes: [
    {
      nom: 'Séance à l’unité',
      picto: 'house',
      surtitre: 'À domicile',
      infos: '60\u00a0min',
      tarifs: [{ montant: '70\u00a0€', apres: 'la séance' }],
      titrePoints: 'Compris pour chaque séance',
      points: [
        // textes de Marie (10 novembre 2026) : intitulé en gras, puis la description
        ['Mobilité & activation', 'Un réveil articulaire et musculaire ciblé que nous faisons ensemble pour préparer votre corps à l’effort en toute sécurité.'],
        ['Cœur de séance', 'L’apprentissage des mouvements fondamentaux et le renforcement musculaire à travers des exercices ciblés que je choisis selon vos objectifs.'],
        ['Clôture de séance', 'Un bloc de fin sur mesure selon votre énergie du jour et vos objectifs spécifiques (travail de l’endurance, renforcement postural ou retour au calme).'],
      ],
    },
    {
      nom: 'Suivi mensuel',
      picto: 'kettlebell',
      surtitre: 'À domicile',
      infos: '4 séances par mois',
      tarifs: [{ montant: '260\u00a0€', apres: 'par mois' }],
      titrePoints: 'Compris',
      points: ['4 séances à domicile', 'Programme personnalisé', 'Suivi inclus'],
      sombre: true,
    },
    {
      nom: 'En salle',
      picto: 'barbell',
      surtitre: 'Séance individuelle',
      infos: '60\u00a0min',
      tarifs: [{ montant: '60\u00a0€', apres: 'la séance' }],
      titrePoints: 'Compris pour chaque séance',
      points: ['Mobilité & Activation : 7 à 10\u00a0min', 'Corps de séance : 40 à 50\u00a0min', 'Retour au calme : 3 à 5\u00a0min'],
    },
  ],
}

export default function Particuliers() {
  useTitre('Individuel')
  return <PageService page={PAGE} />
}
