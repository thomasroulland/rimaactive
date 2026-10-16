import { Link } from 'react-router-dom'
import Tuile from '../components/Tuile.jsx'
import Fiches from '../components/Fiches.jsx'
import Photo from '../components/Photo.jsx'
import useTitre from '../components/useTitre.js'

export default function Particuliers() {
  useTitre('Particuliers')
  return (
    <>
      <section className="section section--lin">
        <div className="conteneur pile" style={{ gap: 24 }}>
          <h1 className="titre-page">particuliers</h1>
          <p className="texte texte--moyen">
            [Texte provisoire · message principal : on part de ton emploi du temps et de là où tu en es, et le but est
            que tu deviennes autonome.]
          </p>
        </div>
      </section>

      <section className="section section--lin200">
        <div className="conteneur pile pile--etire" style={{ gap: 32 }}>
          <h2 className="titre-section">ce que tu vis peut-être</h2>
          <div className="tuiles">
            <Tuile titre="manque de temps" petit />
            <Tuile titre="ne pas savoir par où commencer" petit />
            <Tuile titre="l'idée qu'il faut se priver" petit />
          </div>
        </div>
      </section>

      <section className="section section--lin">
        <div className="conteneur rangee" style={{ gap: 48 }}>
          <Photo label="une séance avec un particulier" legende="Photo de Marie en séance avec un particulier" />
          <div className="pile pile--etire" style={{ flex: '1 1 440px', gap: 24 }}>
            <h2 className="titre-section">comment se passe une séance</h2>
            <Fiches items={['Durée', 'Lieu', 'Matériel apporté', 'Déroulé']} serre />
          </div>
        </div>
      </section>

      <section className="section section--lin200">
        <div className="conteneur pile pile--etire" style={{ gap: 32 }}>
          <h2 className="titre-section">[titre des formules à rédiger]</h2>
          <div className="tuiles">
            <Tuile titre="individuel" />
            <Tuile titre="small group" />
            <Tuile titre="à distance" surtitre="en complément" />
          </div>
          <p className="gras">[Ligne tarifs à rédiger · selon le lieu et la formule, on en parle]</p>
        </div>
      </section>

      <section className="section section--lin">
        <div className="conteneur conteneur--etroit pile" style={{ gap: 24 }}>
          <h2 className="titre-section">questions fréquentes</h2>
          <div className="faq">
            {[1, 2, 3, 4].map((n) => (
              <details key={n}>
                <summary>[Question {n} à rédiger]</summary>
                <p>[Réponse à rédiger]</p>
              </details>
            ))}
          </div>
          <Link to="/contact" className="bouton">Me contacter</Link>
        </div>
      </section>
    </>
  )
}
