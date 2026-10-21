import VisuelFondu from '../components/VisuelFondu.jsx'
import RoueGestes from '../components/RoueGestes.jsx'
import Methode from '../components/Methode.jsx'
import { Link } from 'react-router-dom'
import { BoutonLien, Faits, Photo, TitreSection } from '../components/Blocs.jsx'
import { Fleche } from '../components/Entete.jsx'
import useTitre from '../components/useTitre.js'

const PHRASES = [
  'développer une force utile dans votre vie quotidienne et professionnelle',
  'retrouver une totale liberté dans vos mouvements',
  'comprendre les mouvements pour continuer de bouger durablement',
]

const FORMATS = ['Density Training', 'Circuit Training', 'EMOM', 'AMRAP', 'Complex', 'Balistique']

const SERVICES = [
  {
    to: '/entreprises',
    titre: 'entreprises',
    photo: 'Séance en groupe dans des locaux ou en extérieur',
    texte: "Des séances de mobilité et de renforcement pour remettre en mouvement des équipes aux métiers et aux niveaux variés. Dans vos locaux ou en extérieur, chaque semaine ou le temps d'un séminaire.",
    lien: 'Les séances en entreprise',
  },
  {
    to: '/communes',
    titre: 'communes',
    photo: 'Petit groupe en extérieur',
    texte: 'Des séances conviviales en small group, en extérieur ou en salle communale, ouvertes aux habitants quel que soit leur niveau de départ.',
    lien: 'Les séances en commune',
  },
  {
    to: '/particuliers',
    titre: 'particuliers',
    photo: 'Séance à domicile ou dans un jardin',
    texte: 'Un coaching individuel ou en petit groupe, à domicile, en extérieur ou en salle, pour reprendre le sport à votre rythme.',
    lien: 'Le coaching particulier',
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
            <h1 className="titre titre--accueil">
              <span className="guillemet guillemet--ouvrant">“</span>un corps fort et mobile grâce à une pratique
              fonctionnelle<span className="guillemet guillemet--fermant">”</span>
            </h1>
            <p className="ligne-fine ligne-fine--sous-titre">
              {/* Coupures choisies : une ligne par span sur grand écran, texte continu sur téléphone */}
              <span className="ligne">Je vous accompagne avec des séances adaptées à votre niveau </span>
              <span className="ligne">et à vos objectifs. Dans vos locaux, en extérieur </span>
              <span className="ligne">ou à domicile, je me déplace selon vos besoins.</span>
            </p>
            <div className="actions">
              <BoutonLien to="/contact">M'écrire</BoutonLien>
              <a href="#methode" className="bouton bouton--secondaire">Mes formules</a>
            </div>
            <ul className="reperes">
              <li>Houdan (78) &amp; alentours</li>
              <li>Sessions de 30 à 60 min</li>
              <li className="repere--neon">Matériel mis à disposition</li>
            </ul>
          </div>
          <div className="heros__visuel">
            <VisuelFondu />
          </div>
        </div>
      </section>

      <Methode phrases={PHRASES} formats={FORMATS} />

      <section className="section services" aria-labelledby="services-titre">
        <div className="conteneur">
          <h2 id="services-titre" className="titre titre--accueil">avec qui je travaille</h2>
          {/* Toute la carte est un lien ; elle passe au néon au survol */}
          <ul className="services__liste">
            {SERVICES.map((service) => (
              <li key={service.to}>
                <Link to={service.to} className="service">
                  <Photo label={service.photo} className="service__photo" />
                  <div className="service__corps">
                    <h3 className="titre titre--tuile">{service.titre}</h3>
                    <p className="texte">{service.texte}</p>
                    <span className="lien-fleche service__lien">{service.lien} <Fleche /></span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

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
