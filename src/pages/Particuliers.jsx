import { Faits, HerosPage, Photo, TitreSection, Tuile } from '../components/Blocs.jsx'
import useTitre from '../components/useTitre.js'

export default function Particuliers() {
  useTitre('Particuliers')
  return (
    <>
      <HerosPage fil="Particuliers" ligne="pour vous" titre="particuliers">
        <p className="texte texte--grand provisoire">
          [Texte provisoire · message principal : on part de ton emploi du temps et de là où tu en es, et le but est
          que tu deviennes autonome.]
        </p>
      </HerosPage>

      <section className="section" aria-labelledby="vecu-titre">
        <div className="conteneur">
          <div className="entete-section">
            <TitreSection id="vecu-titre" ligne="tu te reconnais ?" titre="ce que tu vis peut-être" />
          </div>
          <div className="tuiles">
            <Tuile numero="01" titre="manque de temps" compacte />
            <Tuile numero="02" titre="ne pas savoir par où commencer" compacte />
            <Tuile numero="03" titre="l'idée qu'il faut se priver" compacte />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="seance-titre">
        <div className="conteneur deux-colonnes">
          <Photo label="Photo de Marie en séance avec un particulier" />
          <div>
            <TitreSection id="seance-titre" ligne="concrètement" titre="comment se passe une séance" />
            <div style={{ marginTop: 32 }}>
              <Faits items={[['Durée'], ['Lieu'], ['Matériel apporté'], ['Déroulé']]} />
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="formules-titre">
        <div className="conteneur">
          <div className="entete-section">
            <TitreSection id="formules-titre" ligne="les formules" titre="[titre des formules à rédiger]" />
          </div>
          <div className="tuiles">
            <Tuile numero="01" titre="individuel" />
            <Tuile numero="02" titre="small group" />
            <Tuile numero="03" surtitre="en complément" titre="à distance" />
          </div>
          <p className="texte provisoire" style={{ marginTop: 24 }}>
            [Ligne tarifs à rédiger · selon le lieu et la formule, on en parle]
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="faq-titre">
        <div className="conteneur deux-colonnes" style={{ alignItems: 'start' }}>
          <TitreSection id="faq-titre" ligne="vos questions" titre="questions fréquentes" />
          <div className="faq">
            {[1, 2, 3, 4].map((n) => (
              <details key={n}>
                <summary>[Question {n} à rédiger]</summary>
                <p>[Réponse à rédiger]</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
