import { Link } from 'react-router-dom'
import BarreAnimee from '../components/BarreAnimee.jsx'
import Photo from '../components/Photo.jsx'
import useTitre from '../components/useTitre.js'

const Fleche = () => (
  <svg className="offre__fleche" aria-hidden="true" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#161514" strokeWidth="2" strokeLinecap="square">
    <path d="M4 12h15M13 6l6 6-6 6" />
  </svg>
)

const Icone = ({ children }) => (
  <svg aria-hidden="true" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#161514" strokeWidth="1.6" strokeLinecap="square">
    {children}
  </svg>
)

const OFFRES = [
  {
    to: '/entreprises',
    titre: 'en entreprise',
    texte: "Préserver les capacités physiques de vos équipes face aux contraintes du travail. Chaque semaine ou le temps d'un séminaire, dans vos locaux ou en extérieur.",
    icone: <path d="M3 21h18M5 21V4h10v17M15 9h4v12M8 8h4M8 12h4M8 16h4" />,
  },
  {
    to: '/communes',
    titre: 'en commune',
    texte: 'Des séances en petit groupe pour vos habitants, en extérieur ou en salle communale, quel que soit leur niveau de départ.',
    icone: <path d="M3 21h18M4 10h16M12 3l8 7H4zM6 10v11M10 10v11M14 10v11M18 10v11" />,
  },
  {
    to: '/particuliers',
    titre: 'pour vous',
    texte: 'Construire un corps plus fort, seul ou en petit groupe, avec un accompagnement adapté à votre profil, à domicile, en extérieur ou en salle.',
    icone: (
      <>
        <circle cx="12" cy="7" r="4" />
        <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
      </>
    ),
  },
]

export default function Accueil() {
  useTitre('Accueil')
  return (
    <>
      <section className="hero">
        <div className="conteneur conteneur--accueil rangee hero__grille">
          <div className="pile hero__texte">
            <h1 className="hero__titre">un corps fort et mobile grâce à une pratique fonctionnelle</h1>
            <p className="hero__intro">
              J'accompagne les entreprises, les communes et les particuliers avec des séances de mobilité et de
              renforcement, pensées pour les gestes de tous les jours. S'entraîner moins, mais mieux.
            </p>
            <Link to="/contact" className="bouton bouton--grand">Me contacter</Link>
          </div>
          <div className="hero__visuel">
            <BarreAnimee />
          </div>
        </div>
      </section>

      <section className="section section--lin200" style={{ paddingBlock: 'clamp(56px, 8vw, 112px)' }}>
        <div className="conteneur conteneur--accueil pile pile--etire" style={{ gap: 40 }}>
          <h2 className="titre-section">mes offres</h2>
          <div className="offres">
            {OFFRES.map((offre) => (
              <Link key={offre.to} to={offre.to} className="offre">
                <Icone>{offre.icone}</Icone>
                <h3>{offre.titre}</h3>
                <p>{offre.texte}</p>
                <Fleche />
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--lin" style={{ paddingBlock: 'clamp(56px, 9vw, 128px)' }}>
        <div className="conteneur conteneur--accueil rangee" style={{ gap: 'clamp(40px, 6vw, 96px)' }}>
          <Photo label="Marie" legende="Photo de Marie" enBas />
          <div className="pile" style={{ flex: '1 1 460px', gap: 24 }}>
            <p className="surtitre">mon approche</p>
            <h2 className="titre-section" style={{ maxWidth: '14ch' }}>une pratique progressive, accessible et concrète</h2>
            <p className="texte texte--court" style={{ marginTop: 8 }}>
              Les séances développent les capacités dont nous avons réellement besoin au quotidien : s'accroupir,
              porter, pousser, tirer, se pencher ou se relever.
            </p>
            <p className="texte texte--court">
              Elles fonctionnent comme des challenges : un temps donné, un nombre de tours, un travail en duo. Chacun
              avance à son niveau et cherche à faire un peu mieux que la fois précédente.
            </p>
            <Link to="/a-propos" className="bouton bouton--grand" style={{ marginTop: 8 }}>Qui suis-je ?</Link>
          </div>
        </div>
      </section>

      <section className="section section--blanc" style={{ paddingBlock: 'clamp(56px, 8vw, 112px)' }}>
        <div className="conteneur conteneur--accueil rangee" style={{ alignItems: 'flex-start', gap: '24px clamp(40px, 6vw, 96px)' }}>
          <div className="pile" style={{ flex: '1 1 340px', gap: 24 }}>
            <p className="surtitre">ma zone d'intervention</p>
            <h2 className="titre-section" style={{ maxWidth: '12ch' }}>je viens à votre rencontre</h2>
          </div>
          <div className="pile" style={{ flex: '1 1 460px', gap: 20, paddingTop: 4 }}>
            <p className="texte texte--court">
              J'interviens à Houdan et dans les communes voisines, dans un rayon de 20 km, pour des séances en
              entreprise, en commune, en extérieur ou à domicile. Je me déplace avec mon matériel afin d'adapter les
              séances au lieu et au niveau des participants.
            </p>
            <p className="texte texte--court">
              Les séances durent de 30 minutes à 1 heure. Les tarifs dépendent du lieu et de la formule : je vous fais
              une proposition après un premier échange.
            </p>
            <Link to="/contact" className="bouton bouton--grand" style={{ marginTop: 12 }}>Me contacter</Link>
          </div>
        </div>
      </section>
    </>
  )
}
