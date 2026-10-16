import { Link } from 'react-router-dom'
import Tuile from '../components/Tuile.jsx'
import useTitre from '../components/useTitre.js'

export default function Communes() {
  useTitre('Communes')
  return (
    <>
      <section className="section section--lin">
        <div className="conteneur pile" style={{ gap: 24 }}>
          <h1 className="titre-page">communes</h1>
          <p className="texte texte--moyen">
            [Texte provisoire · message principal : une activité sportive encadrée pour vos habitants, près de chez
            eux.]
          </p>
        </div>
      </section>

      <section className="section section--lin200">
        <div className="conteneur pile" style={{ gap: 16 }}>
          <h2 className="titre-section">ce que ça apporte à la commune</h2>
          <p className="texte texte--moyen">[Texte provisoire à rédiger]</p>
        </div>
      </section>

      <section className="section section--lin">
        <div className="conteneur pile pile--etire" style={{ gap: 32 }}>
          <h2 className="titre-section">comment se passent les sessions</h2>
          <div className="tuiles">
            <Tuile titre="small group" petit />
            <Tuile titre="dehors ou dans une salle communale" petit />
            <Tuile titre="matériel apporté" petit />
          </div>
        </div>
      </section>

      <section className="section section--lin200">
        <div className="conteneur pile" style={{ gap: 16 }}>
          <h2 className="titre-section">qui peut y participer</h2>
          <p className="texte texte--moyen">[Texte provisoire à rédiger]</p>
        </div>
      </section>

      <section className="section section--lin">
        <div className="conteneur pile" style={{ gap: 32 }}>
          <h2 className="titre-section">organisation pratique</h2>
          <div className="tuiles">
            <div className="fiche pile" style={{ flex: '1 1 340px', padding: 32, gap: 12, alignItems: 'stretch' }}>
              <p className="gras">[Formule 1 · texte provisoire]</p>
              <p className="texte">La mairie paie Marie et ouvre les séances aux habitants.</p>
            </div>
            <div className="fiche pile" style={{ flex: '1 1 340px', padding: 32, gap: 12, alignItems: 'stretch' }}>
              <p className="gras">[Formule 2 · texte provisoire]</p>
              <p className="texte">
                Marie organise des séances ouvertes, la mairie prête le lieu et les habitants paient leur place.
              </p>
            </div>
          </div>
          <p className="gras">[Ligne « sur devis » à rédiger]</p>
          <Link to="/contact" className="bouton">Me contacter</Link>
        </div>
      </section>
    </>
  )
}
