import BarreAnimee from '../components/BarreAnimee.jsx'
import { BoutonLien, Faits, Photo, TitreSection, Tuile } from '../components/Blocs.jsx'
import useTitre from '../components/useTitre.js'

const OFFRES = [
  {
    to: '/entreprises',
    titre: 'en entreprise',
    texte: "Préserver les capacités physiques de vos équipes face aux contraintes du travail. Chaque semaine ou le temps d'un séminaire, dans vos locaux ou en extérieur.",
  },
  {
    to: '/communes',
    titre: 'en commune',
    texte: 'Des séances en petit groupe pour vos habitants, en extérieur ou en salle communale, quel que soit leur niveau de départ.',
  },
  {
    to: '/particuliers',
    titre: 'pour vous',
    texte: 'Construire un corps plus fort, seul ou en petit groupe, avec un accompagnement adapté à votre profil, à domicile, en extérieur ou en salle.',
  },
]

const GESTES = ["s'accroupir", 'porter', 'pousser', 'tirer', 'se pencher', 'se relever']

export default function Accueil() {
  useTitre('Accueil')
  return (
    <>
      <section className="heros">
        <div className="conteneur heros__grille">
          <div>
            <p className="ligne-fine">Marie, coach sportive</p>
            <h1 className="titre titre--xl">fort au quotidien</h1>
            <p className="texte texte--grand" style={{ marginTop: 32 }}>
              Un corps fort et mobile grâce à une pratique fonctionnelle. J'accompagne les entreprises, les communes et
              les particuliers avec des séances de mobilité et de renforcement, pensées pour les gestes de tous les
              jours. S'entraîner moins, mais mieux.
            </p>
            <div className="actions">
              <BoutonLien to="/contact">Me contacter</BoutonLien>
              <a href="#offres" className="bouton bouton--secondaire">Voir les offres</a>
            </div>
          </div>
          <div className="heros__visuel">
            <BarreAnimee />
          </div>
        </div>
        <div className="conteneur" style={{ marginTop: 'clamp(48px, 6vw, 88px)' }}>
          <ul className="reperes">
            <li><span className="mention">zone</span><strong>Houdan + 20 km</strong></li>
            <li><span className="mention">durée</span><strong>30 min à 1 h</strong></li>
            <li><span className="mention">matériel</span><strong>fourni</strong></li>
            <li><span className="mention">pour</span><strong>tous les niveaux</strong></li>
          </ul>
        </div>
      </section>

      <section id="offres" className="section section--filet" aria-labelledby="offres-titre">
        <div className="conteneur">
          <div className="entete-section entete-section--deux">
            <TitreSection id="offres-titre" ligne="trois façons de s'entraîner" titre="mes offres" />
            <p className="texte">Choisissez votre cas : chaque page détaille le format, le lieu et l'organisation.</p>
          </div>
          <div className="tuiles">
            {OFFRES.map((offre, i) => (
              <Tuile key={offre.to} numero={`0${i + 1}`} titre={offre.titre} to={offre.to}>
                <p className="texte">{offre.texte}</p>
              </Tuile>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="approche-titre">
        <div className="conteneur deux-colonnes">
          <Photo label="Photo de Marie" />
          <div>
            <TitreSection id="approche-titre" ligne="mon approche" titre="une pratique progressive, accessible et concrète" />
            <p className="texte" style={{ marginTop: 32 }}>
              Les séances développent les capacités dont nous avons réellement besoin au quotidien :
            </p>
            <ol className="gestes">
              {GESTES.map((geste, i) => (
                <li key={geste}>
                  <span className="mention">0{i + 1}</span>
                  <strong>{geste}</strong>
                </li>
              ))}
            </ol>
            <p className="texte" style={{ marginTop: 32 }}>
              Elles fonctionnent comme des challenges : un temps donné, un nombre de tours, un travail en duo. Chacun
              avance à son niveau et cherche à faire un peu mieux que la fois précédente.
            </p>
            <div className="actions">
              <BoutonLien to="/a-propos" variante="secondaire">Qui suis-je ?</BoutonLien>
            </div>
          </div>
        </div>
      </section>

      <section className="section section--filet" aria-labelledby="zone-titre">
        <div className="conteneur">
          <div className="entete-section entete-section--deux">
            <TitreSection id="zone-titre" ligne="ma zone d'intervention" titre="je viens à votre rencontre" />
            <p className="texte">
              J'interviens à Houdan et dans les communes voisines. Je me déplace avec mon matériel afin d'adapter les
              séances au lieu et au niveau des participants.
            </p>
          </div>
          <Faits
            items={[
              ['Où', 'Houdan et les communes voisines, dans un rayon de 20 km'],
              ['Lieux', 'En entreprise, en commune, en extérieur ou à domicile'],
              ['Durée', 'De 30 minutes à 1 heure'],
              ['Tarifs', 'Selon le lieu et la formule, après un premier échange'],
            ]}
          />
        </div>
      </section>
    </>
  )
}
