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
      puce: 'kettlebell',
      surtitre: '2 à 8 personnes',
      infos: '60\u00a0min • Sans engagement',
      // prix de Marie (PDF du 16 novembre 2026)
      tarifs: [{ montant: '15\u00a0€ à 30\u00a0€', apres: 'par personne', detail: '(selon la taille du groupe)' }],
      // intitulés courts de Marie sur la carte ; le détail garde ses explications
      points: [
        ['Mobilité & activation musculaire', 'Un réveil articulaire et musculaire ciblé que nous faisons ensemble pour préparer le corps à l’effort en toute sécurité.'],
        ['Renforcement fonctionnel ciblé', 'L’apprentissage technique et le renforcement musculaire à travers des exercices fonctionnels que je sélectionne selon le thème du jour.'],
        ['Fin de séance selon votre énergie', 'Un bloc de fin sur mesure qui s’adapte à l’énergie du groupe (cardio, renforcement postural ou retour au calme).'],
      ],
      pointsCourts: true,
    },
  ],
}

export default function Groupes() {
  useTitre('Groupes')
  return <PageService page={PAGE} />
}
