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
  session: [['Lieu', null, 'map-pin'], ['Espace', null, 'buildings'], ['Durée', 'De 30 à 60\u00a0min', 'timer'], ['Nombre de personnes', null, 'check-square']],
  formules: [
    {
      nom: 'Séances régulières',
      surtitre: 'Chaque semaine',
      texte: '[Description à rédiger]',
      prix: '[Prix]',
      points: ['[Point 1]', '[Point 2]', '[Point 3]'],
    },
    {
      nom: 'Séminaire ponctuel',
      surtitre: 'Le temps d’un événement',
      texte: '[Description à rédiger]',
      prix: '[Prix]',
      points: ['[Point 1]', '[Point 2]', '[Point 3]'],
      etiquette: '[Étiquette, ex. le plus choisi]',
    },
  ],
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
