import PageService from '../components/PageService.jsx'
import useTitre from '../components/useTitre.js'

// Contenu de la page Entreprises (fiche « Formules et tarifs » du design system, octobre 2026)
const PAGE = {
  titre: 'Entreprises',
  surtitre: 'Pour vos équipes',
  intro: 'J’accompagne vos équipes avec des séances de mobilité et de renforcement fonctionnel dans vos locaux ou en extérieur.',
  liste: [
    'Dans vos locaux ou en extérieur',
    'Tout le matériel est apporté',
    'Déplacement compris dans un rayon de 20\u00a0km',
    'Devis gratuit sous 48\u00a0h',
  ],
  note: 'Tarifs valables jusqu’au 30 avril 2027. TVA non applicable, art. 293\u00a0B du CGI.',
  cartes: [
    {
      surtitre: 'Régulier ou ponctuel',
      nom: 'Active 60',
      prix: { montant: '110\u00a0€', unite: 'la séance, de 4 à 8 personnes' },
      texte: '60\u00a0min, de 4 à 12 personnes, ponctuellement ou chaque semaine.',
      petit: '150\u00a0€ la séance de 9 à 12 personnes',
    },
    {
      surtitre: 'Événement',
      nom: 'Active Day',
      pastille: 'Sur devis',
      prix: { avant: 'Dès ', montant: '180\u00a0€', unite: 'la séance' },
      texte: 'Une séance ponctuelle pour votre équipe, jusqu’à 16 personnes.',
      petit: 'Selon le nombre de participants',
      sombre: true,
    },
  ],
}

export default function Entreprises() {
  useTitre('Entreprises')
  return <PageService page={PAGE} />
}
