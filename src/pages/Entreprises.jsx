import { BoutonLien, Faits, HerosPage, TitreSection, Tuile } from '../components/Blocs.jsx'
import useTitre from '../components/useTitre.js'

export default function Entreprises() {
  useTitre('Entreprises')
  return (
    <>
      <HerosPage fil="Entreprises" ligne="pour vos équipes" titre="entreprises">
        <p className="texte texte--grand provisoire">
          [Texte provisoire · message principal : des séances qui s'adaptent à vos locaux et à vos horaires, sans
          matériel à acheter.]
        </p>
      </HerosPage>

      <section className="section" aria-labelledby="formats-titre">
        <div className="conteneur">
          <div className="entete-section entete-section--deux">
            <TitreSection id="formats-titre" titre="ce que vous proposez à vos équipes" />
            <p className="texte provisoire">[Texte provisoire à rédiger]</p>
          </div>
          <div className="tuiles">
            <Tuile titre="séances régulières" />
            <Tuile titre="séminaire ponctuel" />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="orga-titre">
        <div className="conteneur">
          <div className="entete-section">
            <TitreSection id="orga-titre" titre="organisation" />
          </div>
          <Faits items={[['Lieu'], ['Espace'], ['Durée'], ['Nombre de personnes']]} />
          <p className="texte provisoire" style={{ marginTop: 24 }}>[Ligne « sur devis » à rédiger]</p>
        </div>
      </section>

      <section className="section" aria-labelledby="qui-titre">
        <div className="conteneur entete-section entete-section--deux" style={{ marginBottom: 0 }}>
          <TitreSection id="qui-titre" titre="qui je suis" />
          <div>
            <p className="texte provisoire">[Texte provisoire · qui je suis en deux phrases]</p>
            <div className="actions">
              <BoutonLien to="/a-propos" variante="secondaire">En savoir plus</BoutonLien>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
