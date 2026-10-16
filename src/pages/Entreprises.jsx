import { Link } from 'react-router-dom'
import Tuile from '../components/Tuile.jsx'
import Fiches from '../components/Fiches.jsx'
import useTitre from '../components/useTitre.js'

export default function Entreprises() {
  useTitre('Entreprises')
  return (
    <>
      <section className="section section--lin">
        <div className="conteneur pile" style={{ gap: 24 }}>
          <h1 className="titre-page">entreprises</h1>
          <p className="texte texte--moyen">
            [Texte provisoire · message principal : des séances qui s'adaptent à vos locaux et à vos horaires, sans
            matériel à acheter.]
          </p>
        </div>
      </section>

      <section className="section section--lin200">
        <div className="conteneur pile pile--etire" style={{ gap: 32 }}>
          <div className="pile" style={{ gap: 16 }}>
            <h2 className="titre-section">ce que vous proposez à vos équipes</h2>
            <p className="texte texte--moyen">[Texte provisoire à rédiger]</p>
          </div>
          <div className="tuiles">
            <Tuile titre="séances régulières" large />
            <Tuile titre="séminaire ponctuel" large />
          </div>
        </div>
      </section>

      <section className="section section--lin">
        <div className="conteneur pile" style={{ gap: 32 }}>
          <h2 className="titre-section">organisation pratique</h2>
          <Fiches items={['Lieu', 'Espace', 'Durée', 'Nombre de personnes']} />
          <p className="gras">[Ligne « sur devis » à rédiger]</p>
        </div>
      </section>

      <section className="section section--lin200">
        <div className="conteneur pile" style={{ gap: 24 }}>
          <h2 className="titre-section">qui je suis</h2>
          <p className="texte texte--moyen">[Texte provisoire · qui je suis en deux phrases]</p>
          <Link to="/contact" className="bouton">Demander un devis</Link>
        </div>
      </section>
    </>
  )
}
