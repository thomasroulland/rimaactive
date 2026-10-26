import PageService from '../components/PageService.jsx'
import useTitre from '../components/useTitre.js'

// Contenu de la page Entreprises ; les textes entre crochets restent à rédiger
const PAGE = {
  titre: 'Entreprises',
  surtitre: 'Pour vos équipes',
  vecu: [
    ['[Situation 1]', '[Texte à rédiger]'],
    ['[Situation 2]', '[Texte à rédiger]'],
    ['[Situation 3]', '[Texte à rédiger]'],
  ],
  photoSession: 'Séance en entreprise',
  session: [['Lieu', null, 'map-pin'], ['Espace', null, 'buildings'], ['Durée', '30 ou 60\u00a0min', 'timer'], ['Nombre de personnes', 'De 4 à 16', 'check-square']],
  tarifs: {
    cartes: [
      {
        nom: 'Active 30',
        details: [['Durée', '30\u00a0min'], ['Participants', '4 à 12'], ['Fréquence', 'Ponctuelle ou chaque semaine']],
        prix: { avant: 'À partir de ', montant: '80\u00a0€' },
      },
      {
        nom: 'Active 60',
        details: [['Durée', '60\u00a0min'], ['Participants', '4 à 12'], ['Fréquence', 'Chaque semaine, par trimestre']],
        prix: { avant: 'À partir de ', montant: '110\u00a0€' },
      },
      {
        nom: 'Active Day',
        details: [['Durée', '60\u00a0min'], ['Participants', 'Jusqu’à 16'], ['Fréquence', 'Ponctuelle']],
        prix: { avant: 'À partir de ', montant: '180\u00a0€' },
      },
    ],
    notes: [
      'Tarif selon le nombre de participants et la fréquence. Devis gratuit sous 48\u00a0h.',
      'TVA non applicable, art. 293\u00a0B du CGI.',
    ],
  },
  faq: [
    ['Pourquoi me faire confiance ?', '[Réponse à rédiger]'],
    ['[Question 2 à rédiger]', '[Réponse à rédiger]'],
    ['[Question 3 à rédiger]', '[Réponse à rédiger]'],
    ['[Question 4 à rédiger]', '[Réponse à rédiger]'],
  ],
}

export default function Entreprises() {
  useTitre('Entreprises')
  return <PageService page={PAGE} />
}
