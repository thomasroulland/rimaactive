import photoHeros from '../assets/portrait-contact.jpg'
import portraitMarie from '../assets/portrait-marie.jpg'
import photoEntreprises from '../assets/service-entreprises.jpg'
import photoGroupes from '../assets/service-groupes.jpg'
import photoIndividuel from '../assets/service-individuel.jpg'
import { Link } from 'react-router-dom'
import { Photo } from '../components/Blocs.jsx'
import Picto from '../components/Picto.jsx'
import useTitre from '../components/useTitre.js'

const SERVICES = [
  {
    to: '/entreprises',
    titre: 'Entreprises',
    lieux: 'Locaux · Extérieur',
    pourQui: '4 à 16 personnes',
    prix: 'À partir de 110\u00a0€ la séance',
    photo: 'Rangée de kettlebells sur le sol d’une salle',
    image: photoEntreprises,
    texte: 'J’accompagne vos équipes avec des séances de mobilité et de renforcement fonctionnel dans vos locaux ou en extérieur.',
  },
  {
    to: '/communes',
    titre: 'Duo et groupes',
    lieux: 'Domicile · Extérieur',
    pourQui: '2 à 10 personnes',
    prix: 'Dès 14\u00a0€ par personne',
    photo: 'Kettlebells et barres sur un sol de salle',
    image: photoGroupes,
    texte: 'Retrouvez-moi en extérieur, près de chez vous, pour progresser ensemble dans un esprit d’entraide.',
  },
  {
    to: '/particuliers',
    titre: 'Individuel',
    lieux: 'Domicile · Salle · En ligne',
    pourQui: 'Domicile · Salle · En ligne',
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
      {/* Haut de page : « Coach Marie » sur craie à gauche, la photo de Marie bras croisés à droite,
          avec trois repères en bulles blanches posés en bas de la photo (sous la photo sur téléphone) */}
      <section className="heros" aria-labelledby="heros-titre">
        <div className="heros__texte">
          <p className="surtitre heros__surtitre">Coach sportive diplômée · Houdan (78) &amp; alentours</p>
          <h1 id="heros-titre" className="titre heros__titre">Coach<br /><span className="mot-avant">Marie</span></h1>
          <p className="accroche heros__ligne">Un corps fort et mobile grâce à une pratique fonctionnelle.</p>
          <div className="actions">
            <a href="#approche" className="bouton bouton--secondaire">Qui suis-je</a>
            <Link to="/contact" className="bouton bouton--principal">M’écrire</Link>
          </div>
        </div>
        <div className="heros__cadre">
          <img className="heros__photo" src={photoHeros} alt="Marie Sillas, coach sportive, bras croisés" />
          <ul className="heros__bulles">
            <li><Picto nom="clock" taille={18} />Session de 60&nbsp;min</li>
            <li><Picto nom="kettlebell" taille={18} />Matériel fourni</li>
            <li><Picto nom="laptop" taille={18} />Présentiel &amp; en ligne</li>
          </ul>
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
            <p className="surtitre approche__surtitre">Qui suis-je</p>
            <h2 id="approche-titre" className="titre titre--section">Moi c’est <span className="mot-avant">Marie</span></h2>
            {/* sauts de ligne voulus par Marie (ordinateur seulement : sur téléphone, le texte coule librement) */}
            <p className="texte">
              Passionnée de sport et pratiquante de karaté, je vous aide à atteindre vos objectifs<br className="saut" />
              grâce à une pratique fonctionnelle adaptée à votre quotidien.
            </p>
            <p className="texte">
              Pendant mes six années de salariat, j’ai côtoyé des collègues fatigués qui ne trouvaient pas le temps de
              prendre soin d’eux. Certains voulaient bouger, sans savoir par où commencer. C’est ce qui m’a poussée à
              devenir coach.
            </p>
            <p className="texte">
              Avec moi, tout commence par un échange sur vos envies et vos contraintes. Ensemble,<br className="saut" />
              on construit des séances qui vous ressemblent et qui trouvent leur place dans votre quotidien.
              Mon objectif&nbsp;? Vous aider à gagner en force et en mobilité avec le plaisir de relever de nouveaux défis.
            </p>
            <a href="#accompagnement" className="bouton bouton--principal approche__bouton">Mes services</a>
          </div>
        </div>
      </section>

      <Methode />

      <section id="accompagnement" className="section services services--v2 ecran-plein" aria-labelledby="services-titre">
        <div className="conteneur">
          <div className="services__entete">
            <div>
              <p className="surtitre">Mes services</p>
              <h2 id="services-titre" className="titre titre--section">Trois façons de s’<span className="mot-avant">entraîner</span> avec moi</h2>
            </div>
          </div>
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
                    <p className="surtitre service__lieux">{service.pourQui}</p>
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

      <Questions />
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
  ['Le mouvement d’abord', 'Je décompose les mouvements et vous donne des repères simples pour bien les réaliser.'],
  ['Des séances qui ont du sens', 'Des séances d’une heure, à la maison, dehors ou en salle, adaptées à votre niveau.'],
  ['Des progrès mesurables', 'EMOM, AMRAP, density, complex, circuit\u00a0: du volume global, à l’opposé du «\u00a03\u00a0séries de 12\u00a0».'],
  ['La confiance qui s’installe', 'Au fil des séances, vous prenez confiance et découvrez le plaisir de progresser.'],
]

// Les objectifs que Marie accompagne (donnés par Marie, novembre 2026)
const OBJECTIFS = ['Transformation & Silhouette', 'Performance & Force', 'Condition physique & Endurance', 'Mental & Discipline']

// « Ma méthode » (novembre 2026) : titre centré, quatre principes, objectifs ; fond blanc, « marche » en vermillon
function Methode() {
  return (
    <section id="methode" className="section ecran-plein methode" aria-labelledby="methode-titre">
      <div className="conteneur">
        <div className="methode__entete">
          <p className="surtitre">Ma méthode</p>
          <h2 id="methode-titre" className="titre titre--section">Pourquoi ça <span className="mot-avant">marche</span>&nbsp;?</h2>
        </div>
        <ol className="methode__principes">
          {PRINCIPES.map(([titre, texte], i) => (
            <li key={titre}>
              <span className="methode__numero">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="methode__titre">{titre}</h3>
              <p className="methode__texte">{texte}</p>
            </li>
          ))}
        </ol>
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

// « Les questions qu'on me pose » : réponses tirées des formules et des infos du site (à relire par Marie)
const QUESTIONS = [
  ['Je débute complètement, est-ce pour moi\u00a0?', 'Oui. Les séances sont adaptées à votre niveau et partent des mouvements fondamentaux.'],
  ['Faut-il du matériel ou une salle\u00a0?', 'Non. Le matériel est fourni\u00a0: tapis, kettlebells, slam balls, etc. Les séances ont lieu à domicile, en extérieur, dans vos locaux ou en salle.'],
  ['Comment se déroule une séance\u00a0?', 'Mobilité & Activation\u00a0: 5 à 10\u00a0min. Corps de séance\u00a0: 30 à 45\u00a0min. Retour au calme\u00a0: 5\u00a0min.'],
  ['Où vous déplacez-vous\u00a0?', 'Je suis basée à Houdan (78). Le déplacement est inclus jusqu’à 20\u00a0km autour de Houdan.'],
  ['Et si je préfère un suivi à distance\u00a0?', 'Active Plus est un suivi en ligne de 12\u00a0semaines, avec un programme 100\u00a0% personnalisé et un suivi hebdomadaire sur WhatsApp.'],
  ['Comment réserver\u00a0?', 'Écrivez-moi avec le formulaire de contact ou par e-mail, et je vous réponds pour choisir la formule qui vous convient.'],
]

function Questions() {
  return (
    <section id="questions" className="section ecran-plein questions" aria-labelledby="questions-titre">
      <div className="conteneur conteneur--etroit">
        <div className="questions__entete">
          <p className="surtitre">Avant de vous lancer</p>
          <h2 id="questions-titre" className="titre titre--section questions__titre">Les <span className="mot-avant">questions</span> qu’on me pose</h2>
        </div>
        <div className="questions__liste">
          {QUESTIONS.map(([q, r]) => (
            <details key={q} className="question">
              <summary>{q}<span className="question__plus" aria-hidden="true" /></summary>
              <p>{r}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
