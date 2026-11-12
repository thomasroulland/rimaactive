// photo échangée avec celle d'En ligne (Marie, 10 novembre 2026)
import photoIndividuel from '../assets/service-en-ligne.jpg'
import PageService from '../components/PageService.jsx'
import useTitre from '../components/useTitre.js'

// Page Individuel : formules et prix donnés par Marie (mis à jour le 12 novembre 2026 : crédit d'impôt affiché, « En salle » retiré pour l'instant)
export const PAGE = {
  titre: 'Individuel',
  image: photoIndividuel,
  cadrage: '50% 45%',
  liste: ['Matériel fourni : tapis, kettlebells, slam balls, etc.', 'Déplacements compris jusqu’à 20\u00a0km autour de Houdan'],
  note: 'TVA non applicable, art. 293\u00a0B du CGI.',
  cartes: [
    {
      nom: 'Séance à l’unité à domicile',
      // « Pour qui ? » repris des informations du site (provisoire : à remplacer par le texte de Marie)
      pourQui: 'Une personne, chez vous, quel que soit votre niveau.',
      titre: 'Séance à l’unité',
      picto: 'house',
      surtitre: 'À domicile',
      infos: '60\u00a0min',
      tarifs: [{ montant: '70\u00a0€', apres: 'la séance', detail: 'soit 35\u00a0€ après crédit d’impôt' }],
      titrePoints: 'Compris pour chaque séance',
      points: [
        // textes de Marie (10 novembre 2026) : intitulé en gras, puis la description
        ['Mobilité & activation', 'Un réveil articulaire et musculaire ciblé que nous faisons ensemble pour préparer votre corps à l’effort en toute sécurité.'],
        ['Cœur de séance', 'L’apprentissage des mouvements fondamentaux et le renforcement musculaire à travers des exercices ciblés que je choisis selon vos objectifs.'],
        ['Clôture de séance', 'Un bloc de fin sur mesure selon votre énergie du jour et vos objectifs spécifiques (travail de l’endurance, renforcement postural ou retour au calme).'],
      ],
    },
    {
      nom: 'Suivi mensuel à domicile',
      // « Pour qui ? » repris des informations du site (provisoire : à remplacer par le texte de Marie)
      pourQui: 'Une personne, chez vous, qui veut un suivi régulier : 4 séances par mois.',
      titre: 'Suivi mensuel',
      picto: 'kettlebell',
      surtitre: 'À domicile',
      infos: '4 séances par mois',
      tarifs: [{ montant: '60\u00a0€\u00a0×\u00a04', apres: 'séances', detail: 'soit 30\u00a0€ la séance après crédit d’impôt' }],
      titrePoints: 'Compris',
      points: ['4 séances à domicile', 'Programme personnalisé', 'Suivi inclus'],
      sombre: true,
    },
  ],
}

export default function Particuliers() {
  useTitre('Individuel')
  return <PageService page={PAGE} />
}
