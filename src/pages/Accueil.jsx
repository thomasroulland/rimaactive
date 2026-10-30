import BoiteOutils from '../components/BoiteOutils.jsx'
import photoHeros from '../assets/heros-squat-nb.jpg'
import portraitMarie from '../assets/portrait-marie.jpg'
import photoEntreprises from '../assets/service-entreprises.jpg'
import photoGroupes from '../assets/service-groupes.jpg'
import photoIndividuel from '../assets/service-individuel.jpg'
import { Link } from 'react-router-dom'
import { Photo } from '../components/Blocs.jsx'
import useTitre from '../components/useTitre.js'

const FORMATS = [
  {
    nom: 'Density Training',
    texte: 'Une séance dans un temps donné à densifier au fil des semaines pour progresser de façon mesurable.',
    objectifs: ['Prise de masse', 'Force'],
  },
  {
    nom: 'Circuit training',
    texte: 'Des enchaînements d’exercices qui sollicitent tout le corps pour améliorer votre endurance globale.',
    objectifs: ['Dépense énergétique', 'Condition physique'],
  },
  {
    nom: 'EMOM',
    texte: 'Un départ toutes les minutes pour densifier votre séance et apprendre à gérer l’effort face à la fatigue.',
    objectifs: ['Endurance de force', 'Mental'],
  },
  {
    nom: 'AMRAP',
    texte: 'Un maximum de tours sur un temps donné pour tester votre mental et apprendre à gérer votre rythme.',
    objectifs: ['Dépassement de soi', 'Cardio'],
  },
  {
    nom: 'Complex',
    texte: 'Des combinaisons d’exercices enchaînés avec le même outil pour renforcer votre coordination.',
    objectifs: ['Puissance', 'Coordination'],
  },
]

const SERVICES = [
  {
    to: '/entreprises',
    titre: 'Entreprises',
    lieux: 'Locaux · Extérieur',
    photo: 'Rangée de kettlebells sur le sol d’une salle',
    image: photoEntreprises,
    texte: 'J’accompagne vos équipes avec des séances de mobilité et de renforcement fonctionnel dans vos locaux ou en extérieur.',
  },
  {
    to: '/communes',
    titre: 'Duo et groupes',
    lieux: 'Domicile · Extérieur',
    photo: 'Kettlebells et barres sur un sol de salle',
    image: photoGroupes,
    texte: 'Retrouvez-moi en extérieur, près de chez vous, pour progresser ensemble dans un esprit d’entraide.',
  },
  {
    to: '/particuliers',
    titre: 'Individuel',
    lieux: 'Domicile · Salle · En ligne',
    photo: 'Barre olympique chargée et kettlebell posées sur un sol de salle',
    image: photoIndividuel,
    texte: 'Je vous accompagne en présentiel ou à distance avec des séances construites autour de vos objectifs et de votre niveau.',
  },
]


export default function Accueil() {
  useTitre('Accueil')
  return (
    <>
      {/* Haut de page : la photo de Marie en squat, en plein écran sous la barre de menu (transparente au-dessus) */}
      <section className="heros">
        <img className="heros__photo" src={photoHeros} alt="" />
        <div className="heros__texte">
          <p className="surtitre heros__surtitre">Coach sportive diplômée · Houdan (78)</p>
          <h1 className="titre heros__titre">Marie Sillas</h1>
          <p className="accroche heros__ligne">Un corps fort et mobile grâce à une pratique fonctionnelle</p>
          <div className="actions">
            <a href="#approche" className="bouton bouton--principal">Mon approche</a>
          </div>
        </div>
      </section>

      {/* Mon approche : le portrait entier (ni coupé ni rapproché) et l'encadré, de même hauteur, centrés ensemble.
          C'est la seule rubrique qui présente Marie (plus de page « À propos »). */}
      <section id="approche" className="section ecran-plein approche" aria-labelledby="approche-titre">
        <figure className="approche__photo">
          <img src={portraitMarie} alt="Marie Sillas, coach sportive" width="960" height="1200" />
        </figure>
        <div className="approche__panneau">
          <div className="approche__cadre">
            <h2 id="approche-titre" className="titre titre--section">Mon approche</h2>
            <p className="texte">
              Je vous propose des séances à domicile ou en salle, adaptées à votre niveau. Ensemble, on travaille à
              partir des mouvements fondamentaux pour gagner en mobilité, en force et en autonomie.
            </p>
            <p className="texte">Au fil des séances, vous prenez confiance et le plaisir de bouger s’installe.</p>
            <p className="approche__citation">— Un corps fort et mobile grâce à une pratique fonctionnelle.</p>
            <ol className="approche__points" aria-label="Ce que l’on travaille">
              {['Force', 'Endurance', 'Puissance', 'Mobilité'].map((point, i) => (
                <li key={point}>
                  <span className="approche__numero">{String(i + 1).padStart(2, '0')}</span>
                  {point}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section id="accompagnement" className="section services ecran-plein" aria-labelledby="services-titre">
        <div className="conteneur">
          <h2 id="services-titre" className="titre titre--section">Mon accompagnement</h2>
          {/* Toute la carte est un lien : la photo, le titre, les lieux, la phrase et « Découvrir les formules »,
              qui passe en jaune au survol */}
          <ul className="services__liste">
            {SERVICES.map((service) => (
              <li key={service.to}>
                <Link to={service.to} className="service">
                  <Photo label={service.photo} src={service.image} className={`service__photo service__photo--${service.to.slice(1)}`} />
                  <div className="service__corps">
                    <h3 className="titre titre--tuile">{service.titre}</h3>
                    <p className="surtitre service__lieux">{service.lieux}</p>
                    <p className="texte">{service.texte}</p>
                    <span className="service__bouton">Découvrir les formules <FlecheDiagonale /></span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <BoiteOutils formats={FORMATS} />
    </>
  )
}

function FlecheDiagonale() {
  return (
    <svg aria-hidden="true" viewBox="0 0 256 256" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="20" strokeLinecap="round" strokeLinejoin="round">
      <path d="M72 184 184 72M88 72h96v96" />
    </svg>
  )
}
