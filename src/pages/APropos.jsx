import { Link } from 'react-router-dom'
import Tuile from '../components/Tuile.jsx'
import Photo from '../components/Photo.jsx'
import useTitre from '../components/useTitre.js'

export default function APropos() {
  useTitre('À propos')
  return (
    <>
      <section className="section section--lin">
        <div className="conteneur rangee" style={{ gap: 48 }}>
          <div className="pile" style={{ flex: '1 1 440px', gap: 24 }}>
            <h1 className="titre-page">à propos</h1>
            <p className="texte" style={{ maxWidth: 580 }}>
              [Texte provisoire · message principal : le sport qu'on choisit n'a rien à voir avec le sport qu'on
              subit.]
            </p>
          </div>
          <Photo label="portrait de Marie" legende="Portrait de Marie" />
        </div>
      </section>

      <section className="section section--lin200">
        <div className="conteneur conteneur--etroit pile pile--etire" style={{ gap: 24 }}>
          <h2 className="titre-section">[mon histoire · titre à rédiger]</h2>
          <p className="texte">[Texte provisoire à rédiger, à partir de ces étapes :]</p>
          <ul className="texte" style={{ paddingLeft: 24, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <li>danse, gym, karaté jusqu'à la ceinture marron</li>
            <li>le sport imposé à l'école, détesté</li>
            <li>six ans de salariat</li>
          </ul>
        </div>
      </section>

      <section className="section section--lin">
        <div className="conteneur pile pile--etire" style={{ gap: 32 }}>
          <h2 className="titre-section">[ce que je défends · titre à rédiger]</h2>
          <div className="tuiles">
            <Tuile titre="honnêteté" />
            <Tuile titre="pas de promesse" />
            <Tuile titre="autonomie" />
          </div>
        </div>
      </section>

      <section className="section section--lin200">
        <div className="conteneur rangee" style={{ gap: 48 }}>
          <Photo label="Marie à l'entraînement" legende="Photo de Marie à l'entraînement" />
          <div className="pile" style={{ flex: '1 1 440px', gap: 24 }}>
            <h2 className="titre-section">[comment je m'entraîne · titre à rédiger]</h2>
            <p className="texte" style={{ maxWidth: 580 }}>[Texte provisoire à rédiger]</p>
            <div className="rangee" style={{ gap: '16px 32px' }}>
              <Link to="/contact" className="bouton">Me contacter</Link>
              <a href="#" className="gras" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44 }}>
                Mon journal sur Instagram
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
