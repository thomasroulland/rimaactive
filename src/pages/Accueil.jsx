import VisuelFondu from '../components/VisuelFondu.jsx'
import RoueGestes from '../components/RoueGestes.jsx'
import RoueOffres from '../components/RoueOffres.jsx'
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
            <h1 className="titre titre--accueil">un corps fort et mobile grâce à une pratique fonctionnelle</h1>
            <p className="ligne-fine ligne-fine--sous-titre">
              Je vous accompagne à travers des séances de mobilité et de renforcement fonctionnel, en extérieur, dans vos
              locaux ou à domicile.
            </p>
            <div className="actions">
              <BoutonLien to="/contact">M'écrire</BoutonLien>
              <a href="#offres" className="bouton bouton--secondaire">Mes formules</a>
            </div>
            <ul className="reperes">
              <li>Houdan (78) &amp; alentours</li>
              <li>Sessions de 30 min à 1h</li>
              <li className="repere--neon">Matériel mis à disposition</li>
              <li>Tous niveaux</li>
            </ul>
          </div>
          <div className="heros__visuel">
            <VisuelFondu />
          </div>
        </div>
      </section>

      <RoueOffres offres={OFFRES} />

      <section className="section" aria-labelledby="approche-titre">
        <div className="conteneur deux-colonnes">
          <Photo label="Photo de Marie" />
          <div>
            <TitreSection id="approche-titre" titre="une pratique progressive, accessible et concrète" />
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

      <RoueGestes gestes={GESTES} />

      <section className="section" aria-labelledby="zone-titre">
        <div className="conteneur">
          <div className="entete-section entete-section--deux">
            <TitreSection id="zone-titre" titre="je viens à votre rencontre" />
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
