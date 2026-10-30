import PageService from '../components/PageService.jsx'
import useTitre from '../components/useTitre.js'

// Contenu de la page Entreprises : fiche « Formules et tarifs » de Marie (octobre 2026), repris tel quel
const PAGE = {
  titre: 'Entreprises',
  liste: [
    'Dans vos locaux ou en extérieur',
    'J’apporte tout le matériel',
    'Déplacement inclus jusqu’à 20\u00a0km autour de Houdan (78)',
  ],
  note: 'Tarifs valables jusqu’au 30 avril 2027. TVA non applicable, art. 293\u00a0B du CGI.',
  cartes: [
    {
      nom: 'Active 60',
      picto: 'buildings',
      surtitre: '4 à 12 personnes',
      infos: '60\u00a0min · ponctuel ou hebdomadaire',
      tarifs: [
        { libelle: '4 à 8 personnes · par séance', montant: '110\u00a0€', detail: '27,50\u00a0€ à 13,75\u00a0€ par personne' },
        { libelle: '9 à 12 personnes · par séance', montant: '150\u00a0€', detail: '16,70\u00a0€ à 12,50\u00a0€ par personne' },
      ],
    },
    {
      nom: 'Active Day',
      picto: 'clock',
      surtitre: 'Jusqu’à 16 personnes',
      infos: 'Sur devis · ponctuel',
      tarifs: [{ libelle: 'Par séance', avant: 'À partir de', montant: '180\u00a0€', detail: 'Selon le devis et le nombre de personnes' }],
      sombre: true,
    },
  ],
}

export default function Entreprises() {
  useTitre('Entreprises')
  return <PageService page={PAGE} />
}
