import { HerosPage, Photo, TitreSection, Tuile } from '../components/Blocs.jsx'
import { RESEAUX } from '../components/liens.js'
import useTitre from '../components/useTitre.js'

const ETAPES = ["danse, gym, karaté jusqu'à la ceinture marron", "le sport imposé à l'école, détesté", 'six ans de salariat']

export default function APropos() {
  useTitre('À propos')
  const instagram = RESEAUX.find((r) => r.label === 'Instagram')
  return (
    <>
      <HerosPage fil="À propos" ligne="Marie, coach sportive" titre="à propos">
        <p className="texte texte--grand provisoire">
          [Texte provisoire · message principal : le sport qu'on choisit n'a rien à voir avec le sport qu'on subit.]
        </p>
      </HerosPage>

      <section className="section" aria-labelledby="histoire-titre">
        <div className="conteneur deux-colonnes">
          <Photo label="Portrait de Marie" />
          <div>
            <TitreSection id="histoire-titre" ligne="mon parcours" titre="[mon histoire · titre à rédiger]" />
            <p className="texte provisoire" style={{ marginTop: 32 }}>[Texte provisoire à rédiger, à partir de ces étapes :]</p>
            <ol className="liste">
              {ETAPES.map((etape, i) => (
                <li key={etape}>
                  <span className="mention" style={{ paddingTop: 5 }}>0{i + 1}</span>
                  {etape}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="valeurs-titre">
        <div className="conteneur">
          <div className="entete-section">
            <TitreSection id="valeurs-titre" ligne="mes valeurs" titre="[ce que je défends · titre à rédiger]" />
          </div>
          <div className="tuiles">
            <Tuile numero="01" titre="honnêteté" />
            <Tuile numero="02" titre="pas de promesse" />
            <Tuile numero="03" titre="autonomie" />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="entrainement-titre">
        <div className="conteneur deux-colonnes">
          <div>
            <TitreSection id="entrainement-titre" ligne="de mon côté" titre="[comment je m'entraîne · titre à rédiger]" />
            <p className="texte provisoire" style={{ marginTop: 32 }}>[Texte provisoire à rédiger]</p>
            <div className="actions">
              <a href={instagram.href} className="bouton bouton--secondaire">Mon journal sur Instagram</a>
            </div>
          </div>
          <Photo label="Photo de Marie à l'entraînement" />
        </div>
      </section>
    </>
  )
}
