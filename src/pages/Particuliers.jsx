// photo échangée avec celle d'En ligne (Marie, 10 novembre 2026)
import photoIndividuel from '../assets/service-en-ligne.jpg'
import PageService from '../components/PageService.jsx'
import useTitre from '../components/useTitre.js'

// Page Individuel : formules et prix donnés par Marie (mis à jour le 16 novembre 2026 : « Suivi hebdomadaire », nouveaux prix, bouton « À domicile » / « En salle »)
export const PAGE = {
  titre: 'Individuel',
  image: photoIndividuel,
  cadrage: '50% 45%',
  liste: ['Matériel fourni : tapis, kettlebells, slam balls, etc.', 'Déplacements compris jusqu’à 20\u00a0km autour de Houdan'],
  // deux boutons pour choisir À domicile / À la salle (remis par Marie le 14 novembre 2026) ;
  // page.cartes garde toutes les formules (le formulaire de contact s'en sert)
  onglets: [
    { nom: 'À domicile', noms: ['Séance à l’unité à domicile', 'Suivi hebdomadaire à domicile'] },
    // en salle, pas de déplacement : la ligne « Déplacements compris » ne s'affiche pas
    { nom: 'En salle', noms: ['Séance à l’unité en salle', 'Suivi hebdomadaire en salle'], liste: ['Matériel fourni : tapis, kettlebells, slam balls, etc.'] },
  ],
  note: 'TVA non applicable, art. 293\u00a0B du CGI.',
  // formules, prix et « Compris » de Marie (PDF du 16 novembre 2026) ; puces : kettlebell à domicile, barre en salle
  cartes: [
    {
      nom: 'Séance à l’unité à domicile',
      // « Pour qui ? » repris des informations du site (provisoire : à remplacer par le texte de Marie)
      pourQui: 'Une personne, chez vous, quel que soit votre niveau.',
      titre: 'Séance à l’unité',
      picto: 'house',
      puce: 'kettlebell',
      surtitre: 'À domicile',
      infos: '60\u00a0min • Sans engagement',
      tarifs: [{ montant: '65\u00a0€', apres: 'la séance' }],
      titrePoints: 'Compris',
      // intitulés courts de Marie (16 novembre 2026) sur la carte ; le détail garde ses explications
      points: [
        ['Mobilité & activation musculaire', 'Un réveil articulaire et musculaire ciblé que nous faisons ensemble pour préparer votre corps à l’effort en toute sécurité.'],
        ['Renforcement fonctionnel ciblé', 'L’apprentissage des mouvements fondamentaux et le renforcement musculaire à travers des exercices ciblés que je choisis selon vos objectifs.'],
        ['Fin de séance selon votre énergie', 'Un bloc de fin sur mesure selon votre énergie du jour et vos objectifs spécifiques (travail de l’endurance, renforcement postural ou retour au calme).'],
      ],
      pointsCourts: true,
    },
    {
      nom: 'Suivi hebdomadaire à domicile',
      // « Pour qui ? » repris des informations du site (provisoire : à remplacer par le texte de Marie)
      pourQui: 'Une personne, chez vous, qui veut un suivi régulier : une séance par semaine, deux mois au minimum.',
      titre: 'Suivi hebdomadaire',
      picto: 'kettlebell',
      puce: 'kettlebell',
      surtitre: 'À domicile',
      infos: '60\u00a0min / séance • Minimum 2\u00a0mois',
      tarifs: [{ montant: '50\u00a0€', apres: 'la séance', detail: '(facturation mensuelle)' }],
      titrePoints: 'Compris',
      points: ['1 séance / semaine en présentiel', 'Programme sur mesure', 'Suivi sur votre espace en ligne'],
      sombre: true,
    },
    {
      nom: 'Séance à l’unité en salle',
      // « Pour qui ? » repris des informations du site (provisoire : à remplacer par le texte de Marie)
      pourQui: 'Une personne, en salle, quel que soit votre niveau.',
      titre: 'Séance à l’unité',
      picto: 'barbell',
      puce: 'barbell',
      surtitre: 'En salle',
      infos: '60\u00a0min • Sans engagement',
      tarifs: [{ montant: '60\u00a0€', apres: 'la séance' }],
      titrePoints: 'Compris',
      // intitulés courts de Marie (16 novembre 2026) sur la carte ; le détail garde ses explications
      points: [
        ['Mobilité & activation musculaire', 'Un réveil articulaire et musculaire ciblé que nous faisons ensemble pour préparer votre corps à l’effort en toute sécurité.'],
        ['Renforcement fonctionnel ciblé', 'L’apprentissage des mouvements fondamentaux et le renforcement musculaire à travers des exercices ciblés que je choisis selon vos objectifs.'],
        ['Fin de séance selon votre énergie', 'Un bloc de fin sur mesure selon votre énergie du jour et vos objectifs spécifiques (travail de l’endurance, renforcement postural ou retour au calme).'],
      ],
      pointsCourts: true,
    },
    {
      nom: 'Suivi hebdomadaire en salle',
      // « Pour qui ? » repris des informations du site (provisoire : à remplacer par le texte de Marie)
      pourQui: 'Une personne, en salle, qui veut un suivi régulier : une séance par semaine, deux mois au minimum.',
      titre: 'Suivi hebdomadaire',
      picto: 'barbell',
      puce: 'barbell',
      surtitre: 'En salle',
      infos: '60\u00a0min / séance • Minimum 2\u00a0mois',
      tarifs: [{ montant: '45\u00a0€', apres: 'la séance', detail: '(facturation mensuelle)' }],
      titrePoints: 'Compris',
      points: ['1 séance / semaine en présentiel', 'Programme sur mesure', 'Suivi sur votre espace en ligne'],
      sombre: true,
    },
  ],
}

export default function Particuliers() {
  useTitre('Individuel')
  return <PageService page={PAGE} />
}
