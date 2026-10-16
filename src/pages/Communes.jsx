import { HerosPage, TitreSection, Tuile } from '../components/Blocs.jsx'
import useTitre from '../components/useTitre.js'

export default function Communes() {
  useTitre('Communes')
  return (
    <>
      <HerosPage fil="Communes" ligne="pour vos habitants" titre="communes">
        <p className="texte texte--grand provisoire">
          [Texte provisoire · message principal : une activité sportive encadrée pour vos habitants, près de chez
          eux.]
        </p>
      </HerosPage>

      <section className="section" aria-labelledby="apport-titre">
        <div className="conteneur entete-section entete-section--deux" style={{ marginBottom: 0 }}>
          <TitreSection id="apport-titre" titre="ce que ça apporte à la commune" />
          <p className="texte provisoire">[Texte provisoire à rédiger]</p>
        </div>
      </section>

      <section className="section" aria-labelledby="sessions-titre">
        <div className="conteneur">
          <div className="entete-section">
            <TitreSection id="sessions-titre" titre="comment se passent les sessions" />
          </div>
          <div className="tuiles">
            <Tuile titre="small group" />
            <Tuile titre="dehors ou dans une salle communale" />
            <Tuile titre="matériel apporté" />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="public-titre">
        <div className="conteneur entete-section entete-section--deux" style={{ marginBottom: 0 }}>
          <TitreSection id="public-titre" titre="qui peut y participer" />
          <p className="texte provisoire">[Texte provisoire à rédiger]</p>
        </div>
      </section>

      <section className="section" aria-labelledby="formules-titre">
        <div className="conteneur">
          <div className="entete-section">
            <TitreSection id="formules-titre" titre="deux formules" />
          </div>
          <div className="tuiles">
            <Tuile titre="[formule 1 · titre provisoire]">
              <p className="texte">La mairie paie Marie et ouvre les séances aux habitants.</p>
            </Tuile>
            <Tuile titre="[formule 2 · titre provisoire]">
              <p className="texte">
                Marie organise des séances ouvertes, la mairie prête le lieu et les habitants paient leur place.
              </p>
            </Tuile>
          </div>
          <p className="texte provisoire" style={{ marginTop: 24 }}>[Ligne « sur devis » à rédiger]</p>
        </div>
      </section>
    </>
  )
}
