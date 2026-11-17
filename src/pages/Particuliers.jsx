// photo échangée avec celle d'En ligne (Marie, 10 novembre 2026)
import photoIndividuel from '../assets/service-en-ligne.jpg'
import PageService from '../components/PageService.jsx'
import useTitre from '../components/useTitre.js'

// Page Individuel : formules et prix donnés par Marie (mis à jour le 17 novembre 2026 : « Séance ponctuelle » et « Coaching régulier »)
export const PAGE = {
  titre: 'Individuel',
  image: photoIndividuel,
  cadrage: '50% 45%',
  liste: ['Matériel fourni : tapis, kettlebells, slam balls, etc.', 'Déplacements compris jusqu’à 20\u00a0km autour de Houdan'],
  // deux boutons pour choisir À domicile / En salle ; page.cartes garde toutes les formules (le formulaire de contact s'en sert)
  onglets: [
    { nom: 'À domicile', noms: ['Séance ponctuelle à domicile', 'Coaching régulier à domicile'] },
    // en salle : seulement « Déplacements compris… » sous les cartes (demande de Marie, 16 novembre 2026)
    { nom: 'En salle', noms: ['Séance ponctuelle en salle', 'Coaching régulier en salle'], liste: ['Déplacements compris jusqu’à 20\u00a0km autour de Houdan'] },
  ],
  note: 'TVA non applicable, art. 293\u00a0B du CGI.',
  // textes de Marie (17 novembre 2026) : « Séance ponctuelle » à la carte, « Coaching régulier » ; puces : kettlebell à domicile, barre en salle.
  // En salle, la fourchette mensuelle est calculée sur 45 € la séance (4 à 5 séances), comme 200 à 250 € l'est sur 50 € à domicile.
  cartes: [
    {
      nom: 'Séance ponctuelle à domicile',
      // « Pour qui ? » repris des informations du site (provisoire : à remplacer par le texte de Marie)
      pourQui: 'Une personne, chez vous, quel que soit votre niveau.',
      titre: 'Séance ponctuelle',
      bouton: 'Réserver une séance',
      picto: 'house',
      puce: 'kettlebell',
      surtitre: 'À la carte',
      couleurSurtitre: 'vermillon', // essai du 17 novembre 2026
      infos: '60\u00a0min • Sans engagement',
      tarifs: [{ montant: '65\u00a0€', apres: 'la séance' }],
      points: ['Séance personnalisée', 'Mobilité & renforcement musculaire', 'Accompagnement individuel'],
    },
    {
      nom: 'Coaching régulier à domicile',
      // « Pour qui ? » repris des informations du site (provisoire : à remplacer par le texte de Marie)
      pourQui: 'Une personne, chez vous, qui veut progresser durablement : une séance par semaine, deux mois au minimum.',
      titre: 'Coaching régulier',
      bouton: 'Commencer mon suivi',
      picto: 'kettlebell',
      puce: 'kettlebell',
      surtitre: 'Sur la durée',
      accent: true, // surtitre et ligne sous le prix en jaune (Marie, 17 novembre 2026)
      infos: 'Minimum 2\u00a0mois',
      tarifs: [{ montant: '50\u00a0€', apres: 'la séance', detail: '200 à 250\u00a0€ / mois pour 4 à 5\u00a0séances' }],
      points: ['1 séance individuelle par semaine', 'Programme d’entraînement sur mesure', 'Suivi sur votre espace personnel'],
      sombre: true,
    },
    {
      nom: 'Séance ponctuelle en salle',
      // « Pour qui ? » repris des informations du site (provisoire : à remplacer par le texte de Marie)
      pourQui: 'Une personne, en salle, quel que soit votre niveau.',
      titre: 'Séance ponctuelle',
      bouton: 'Réserver une séance',
      picto: 'barbell',
      puce: 'barbell',
      surtitre: 'À la carte',
      couleurSurtitre: 'vermillon', // essai du 17 novembre 2026
      infos: '60\u00a0min • Sans engagement',
      tarifs: [{ montant: '60\u00a0€', apres: 'la séance' }],
      points: ['Séance personnalisée', 'Mobilité & renforcement musculaire', 'Accompagnement individuel'],
    },
    {
      nom: 'Coaching régulier en salle',
      // « Pour qui ? » repris des informations du site (provisoire : à remplacer par le texte de Marie)
      pourQui: 'Une personne, en salle, qui veut progresser durablement : une séance par semaine, deux mois au minimum.',
      titre: 'Coaching régulier',
      bouton: 'Commencer mon suivi',
      picto: 'barbell',
      puce: 'barbell',
      surtitre: 'Sur la durée',
      accent: true, // surtitre et ligne sous le prix en jaune (Marie, 17 novembre 2026)
      infos: 'Minimum 2\u00a0mois',
      tarifs: [{ montant: '45\u00a0€', apres: 'la séance', detail: '180 à 225\u00a0€ / mois pour 4 à 5\u00a0séances' }],
      points: ['1 séance individuelle par semaine', 'Programme d’entraînement sur mesure', 'Suivi sur votre espace personnel'],
      sombre: true,
    },
  ],
}

export default function Particuliers() {
  useTitre('Individuel')
  return <PageService page={PAGE} />
}
