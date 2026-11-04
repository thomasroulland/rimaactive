import { Link } from 'react-router-dom'
import { HerosPage } from '../components/Blocs.jsx'
import useTitre from '../components/useTitre.js'

// « Mon espace » : emplacement réservé au futur espace de coaching (tableau de bord, programme…).
// Pas encore de connexion : la page l'annonce et renvoie vers « M'écrire ». Texte proposé par Claude, à valider par Marie.
export default function Espace() {
  useTitre('Mon espace')
  return (
    <HerosPage fil="Mon espace" ligne="Bientôt disponible" titre="Mon espace">
      <p className="texte texte--grand">
        Votre espace de coaching arrive bientôt : votre tableau de bord, votre programme et le suivi de vos séances,
        au même endroit. En attendant, écrivez-moi pour toute question sur votre accompagnement.
      </p>
      <Link to="/contact" className="bouton bouton--principal espace__bouton">M’écrire</Link>
    </HerosPage>
  )
}
