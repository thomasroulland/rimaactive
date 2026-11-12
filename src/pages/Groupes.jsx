import photoGroupes from '../assets/service-groupes.jpg'
import PageService from '../components/PageService.jsx'
import useTitre from '../components/useTitre.js'

// Page Groupes (2 à 8 personnes) : prix donné par Marie (7 novembre 2026)
export const PAGE = {
  titre: 'Groupes',
  image: photoGroupes,
  cadrage: '50% 60%', // partie de la photo montrée dans le bandeau (les kettlebells)
  liste: ['Matériel fourni : tapis, kettlebells, slam balls, etc.', 'Déplacements compris jusqu’à 20\u00a0km autour de Houdan'],
  note: 'TVA non applicable, art. 293\u00a0B du CGI.',
  cartes: [
    {
      nom: 'Séance en groupe',
      // « Pour qui ? » repris des informations du site (provisoire : à remplacer par le texte de Marie)
      pourQui: 'De 2 à 8 personnes, à domicile ou en extérieur, même avec des niveaux différents.',
      picto: 'users',
      surtitre: '2 à 8 personnes',
      infos: '60\u00a0min',
      tarifs: [{ montant: '70\u00a0€', apres: 'la séance' }],
      titrePoints: 'Compris pour chaque séance',
      points: [
        // textes de Marie (10 novembre 2026) : intitulé en gras, puis la description
        ['Mobilité & activation', 'Un réveil articulaire et musculaire ciblé que nous faisons ensemble pour préparer le corps à l’effort en toute sécurité.'],
        ['Cœur de séance', 'L’apprentissage technique et le renforcement musculaire à travers des exercices fonctionnels que je sélectionne selon le thème du jour.'],
        ['Clôture de séance', 'Un bloc de fin sur mesure qui s’adapte à l’énergie du groupe (cardio, renforcement postural ou retour au calme).'],
      ],
    },
  ],
}

export default function Groupes() {
  useTitre('Groupes')
  return <PageService page={PAGE} />
}
