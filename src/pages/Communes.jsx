import PageService from '../components/PageService.jsx'
import useTitre from '../components/useTitre.js'

// Contenu de la page Groupes ; les textes entre crochets restent à rédiger
const PAGE = {
  titre: 'Groupes',
  surtitre: 'Pour vos habitants',
  vecu: [
    ['[Situation 1]', '[Texte à rédiger]'],
    ['[Situation 2]', '[Texte à rédiger]'],
    ['[Situation 3]', '[Texte à rédiger]'],
  ],
  photoSession: 'Séance en groupe, en extérieur',
  session: [['Lieu', null, 'map-pin'], ['Durée', 'De 30 à 60\u00a0min', 'timer'], ['Matériel apporté', null, 'kettlebell'], ['Déroulé', null, 'check-square']],
  formules: [
    {
      nom: '[Formule 1]',
      surtitre: 'La mairie finance les séances',
      texte: 'La mairie finance les séances et les ouvre aux habitants.',
      prix: '[Prix]',
      points: ['[Point 1]', '[Point 2]', '[Point 3]'],
    },
    {
      nom: '[Formule 2]',
      surtitre: 'Séances ouvertes',
      texte: 'J’organise des séances ouvertes, la mairie prête le lieu et les habitants paient leur place.',
      prix: '[Prix]',
      points: ['[Point 1]', '[Point 2]', '[Point 3]'],
    },
  ],
  faq: [
    ['Pourquoi me faire confiance ?', '[Réponse à rédiger]'],
    ['[Question 2 à rédiger]', '[Réponse à rédiger]'],
    ['[Question 3 à rédiger]', '[Réponse à rédiger]'],
    ['[Question 4 à rédiger]', '[Réponse à rédiger]'],
  ],
}

export default function Communes() {
  useTitre('Groupes')
  return <PageService page={PAGE} />
}
