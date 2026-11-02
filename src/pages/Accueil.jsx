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
    prix: 'À partir de 110\u00a0€ la séance',
    photo: 'Rangée de kettlebells sur le sol d’une salle',
    image: photoEntreprises,
    texte: 'J’accompagne vos équipes avec des séances de mobilité et de renforcement fonctionnel dans vos locaux ou en extérieur.',
  },
  {
    to: '/communes',
    titre: 'Duo et groupes',
    lieux: 'Domicile · Extérieur',
    prix: 'Dès 14\u00a0€ par personne',
    photo: 'Kettlebells et barres sur un sol de salle',
    image: photoGroupes,
    texte: 'Retrouvez-moi en extérieur, près de chez vous, pour progresser ensemble dans un esprit d’entraide.',
  },
  {
    to: '/particuliers',
    titre: 'Individuel',
    lieux: 'Domicile · Salle · En ligne',
    prix: 'Dès 45\u00a0€ la séance',
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
            <a href="#approche" className="bouton bouton--clair">Qui je suis</a>
            <Link to="/contact" className="bouton bouton--principal">M’écrire</Link>
          </div>
        </div>
      </section>

      {/* « Moi c'est Marie » (ancre #approche) : le portrait entier et l'encadré, de même hauteur, centrés ensemble.
          C'est la seule rubrique qui présente Marie (plus de page « À propos »). Textes de Marie (novembre 2026). */}
      <section id="approche" className="section ecran-plein approche" aria-labelledby="approche-titre">
        <figure className="approche__photo">
          <img src={portraitMarie} alt="Marie Sillas, coach sportive" width="960" height="1200" />
        </figure>
        <div className="approche__panneau">
          <div className="approche__cadre">
            <p className="surtitre approche__surtitre">Qui je suis</p>
            <h2 id="approche-titre" className="titre titre--section">Moi c’est <span className="mot-avant">Marie</span></h2>
            <p className="texte">
              Passionnée de sport et pratiquante de karaté, je vous aide à atteindre vos objectifs grâce à une
              pratique fonctionnelle.
            </p>
            <p className="texte">
              Après six ans de salariat, j’ai vu autour de moi des collègues fatigués, avec des douleurs, qui ne
              trouvaient pas le temps de s’occuper d’eux. Certains voulaient bouger mais ne savaient pas par où
              commencer. C’est ce qui m’a poussée à devenir coach.
            </p>
            <p className="texte">
              Avec moi, on commence par discuter de vos envies, de vos attentes et de vos contraintes. Ensuite, on
              construit des séances qui vous ressemblent et qui trouvent leur place dans votre quotidien. On
              s’entraîne pour gagner en force et en mobilité grâce à des formats qui donnent envie de relever le défi.
            </p>
            <a href="#accompagnement" className="bouton bouton--principal approche__bouton">Mes services</a>
          </div>
        </div>
      </section>

      <Methode />

      <section id="accompagnement" className="section services ecran-plein" aria-labelledby="services-titre">
        <div className="conteneur">
          <h2 id="services-titre" className="titre titre--section">Mes services</h2>
          {/* Toute la carte est un lien : la photo, le titre, les lieux, la phrase, puis le prix « à partir de »
              (fiche tarifs) et une flèche ronde, qui passe en jaune au survol.
              Sur téléphone et tablette, les cartes sont compactes : petite photo à gauche, sans la phrase. */}
          <ul className="services__liste">
            {SERVICES.map((service) => (
              <li key={service.to}>
                <Link to={service.to} className="service" aria-label={`${service.titre} : voir les formules`}>
                  <Photo label={service.photo} src={service.image} className={`service__photo service__photo--${service.to.slice(1)}`} />
                  <div className="service__corps">
                    <h3 className="titre titre--tuile">{service.titre}</h3>
                    <p className="surtitre service__lieux">{service.lieux}</p>
                    <p className="texte">{service.texte}</p>
                    {/* le prix à gauche, la flèche ronde à droite (toute la carte est le lien) */}
                    <div className="service__bas">
                      <p className="service__prix">{service.prix}</p>
                      <span className="service__fleche" aria-hidden="true"><FlecheDiagonale /></span>
                    </div>
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

// Quatre principes repris de l'ancien texte « Mon approche » et du contexte de marque (validés par Marie)
const PRINCIPES = [
  ['Le mouvement d’abord', 'Des séances construites à partir des mouvements fondamentaux, pour gagner en mobilité, en force et en autonomie.'],
  ['Moins, mais mieux', 'Des séances d’une heure, à la maison, dehors ou en salle, adaptées à votre niveau.'],
  ['Le défi plutôt que la routine', 'EMOM, AMRAP, density, complex, circuit\u00a0: du volume global, à l’opposé du «\u00a03\u00a0séries de 12\u00a0».'],
  ['La confiance qui s’installe', 'Au fil des séances, vous prenez confiance et le plaisir de bouger s’installe.'],
]

const OBJECTIFS = [...new Set(FORMATS.flatMap((f) => f.objectifs))]

// « Ma méthode » (novembre 2026) : titre centré, quatre principes, objectifs ; fond blanc, « marche » en vermillon
function Methode() {
  return (
    <section id="methode" className="section ecran-plein methode" aria-labelledby="methode-titre">
      <div className="conteneur">
        <div className="methode__entete">
          <p className="surtitre">Ma méthode</p>
          <h2 id="methode-titre" className="titre titre--section">Pourquoi ça <span className="mot-avant">marche</span></h2>
        </div>
        <ol className="methode__principes">
          {PRINCIPES.map(([titre, texte], i) => (
            <li key={titre}>
              <span className="methode__numero">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="methode__titre">{titre}</h3>
              <p>{texte}</p>
            </li>
          ))}
        </ol>
        {/* Les objectifs que Marie accompagne (repris des formats de la boîte à outils) */}
        <div className="methode__objectifs">
          <p className="methode__objectifs-titre">Vos objectifs</p>
          <ul>
            {OBJECTIFS.map((o) => <li key={o}>{o}</li>)}
          </ul>
        </div>
      </div>
    </section>
  )
}
