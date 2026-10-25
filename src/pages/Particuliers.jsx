import PageService from '../components/PageService.jsx'
import useTitre from '../components/useTitre.js'

// Contenu de la page Individuel ; les textes entre crochets restent à rédiger
const PAGE = {
  titre: 'Individuel',
  surtitre: 'Pour vous',
  vecu: [
    ['Manque de temps', '[Texte à rédiger]'],
    ['Ne pas savoir par où commencer', '[Texte à rédiger]'],
    ['L’idée qu’il faut se priver', '[Texte à rédiger]'],
  ],
  photoSession: 'Séance avec un particulier',
  session: [['Lieu', null, 'map-pin'], ['Durée', 'De 30 à 60\u00a0min', 'timer'], ['Matériel apporté', null, 'kettlebell'], ['Déroulé', null, 'check-square']],
  formules: [
    {
      nom: 'Individuel',
      surtitre: 'En présentiel',
      texte: '[Description à rédiger]',
      prix: '[Prix]',
      points: ['[Point 1]', '[Point 2]', '[Point 3]'],
    },
    {
      nom: 'Small group',
      surtitre: 'En petit groupe',
      texte: '[Description à rédiger]',
      prix: '[Prix]',
      points: ['[Point 1]', '[Point 2]', '[Point 3]'],
      etiquette: '[Étiquette, ex. le plus choisi]',
    },
    {
      nom: 'À distance',
      surtitre: 'En complément',
      texte: '[Description à rédiger]',
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

export default function Particuliers() {
  useTitre('Individuel')
  return <PageService page={PAGE} />
}
