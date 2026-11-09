import photoHeros from '../assets/portrait-contact.jpg'
import portraitMarie from '../assets/portrait-marie.jpg'
import photoEntreprises from '../assets/service-entreprises.jpg'
import photoGroupes from '../assets/service-groupes.jpg'
import photoIndividuel from '../assets/service-individuel.jpg'
import photoEnLigne from '../assets/service-en-ligne.jpg'
import { Link } from 'react-router-dom'
import { Photo } from '../components/Blocs.jsx'
import useTitre from '../components/useTitre.js'
import { CONTACT } from '../components/liens.js'

const SERVICES = [
  {
    to: '/entreprises',
    titre: 'Entreprises',
    lieux: 'Locaux · Extérieur',
    pourQui: '4 à 16 personnes',
        photo: 'Rangée de kettlebells sur le sol d’une salle',
    image: photoEntreprises,
    texte: 'J’accompagne vos équipes avec des séances de mobilité et de renforcement fonctionnel dans vos locaux ou en extérieur.',
  },
  {
    to: '/groupes',
    titre: 'Groupes',
    lieux: 'Domicile · Extérieur',
    pourQui: '2 à 8 personnes',
        photo: 'Kettlebells et barres sur un sol de salle',
    image: photoGroupes,
    texte: 'Retrouvez-moi en extérieur, près de chez vous, pour progresser ensemble dans un esprit d’entraide.',
  },
  {
    to: '/particuliers',
    titre: 'Individuel',
    lieux: 'Domicile · Salle',
    pourQui: 'Domicile · Salle',
        photo: 'Barre olympique chargée et kettlebell posées sur un sol de salle',
    image: photoIndividuel,
    texte: 'Je vous accompagne en présentiel avec des séances construites autour de vos objectifs et de votre niveau.',
  },
  // tuile ajoutée le 9 novembre 2026, photo envoyée par Marie ; texte repris de la formule Active Plus
  {
    to: '/en-ligne',
    titre: 'En ligne',
    lieux: '12 semaines',
    pourQui: '12 semaines',
    photo: 'Barre chargée et pieds d’une sportive sur un sol de salle',
    image: photoEnLigne,
    texte: 'Je vous accompagne à distance avec un programme personnalisé, un suivi hebdomadaire et des bilans, sur 12 semaines.',
  },
]


// Captures de l'outil de suivi, dans l'ordre du défilement (à remplacer par les images de Marie)
const CAPTURES = ['Tableau de bord', 'Programme', 'Séance du jour', 'Suivi', 'Bilans']

export default function Accueil() {
  useTitre('Accueil')
  return (
    <>
      {/* Haut de page : « Coach Marie » sur craie à gauche, la photo de Marie bras croisés à droite,
          avec trois repères en bulles blanches posés en bas de la photo (sous la photo sur téléphone) */}
      <section className="heros heros--v3" aria-labelledby="heros-titre">
        <div className="heros__cadre">
          <img className="heros__photo" src={photoHeros} alt="Marie Sillas, coach sportive, bras croisés" />
          <div className="heros__texte">
            <p className="surtitre heros__surtitre">Coach sportive diplômée · Houdan (78) &amp; alentours</p>
            <h1 id="heros-titre" className="titre heros__titre">Coach{' '}<br className="heros__saut" /><span className="mot-avant">Marie</span></h1>
            {/* retour à la ligne voulu par Marie après « grâce à une », sur tous les écrans */}
            <p className="accroche heros__ligne">Un corps fort et mobile grâce à une<br />pratique fonctionnelle.</p>
            <div className="actions">
              <a href="#approche" className="bouton bouton--secondaire">Qui suis-je</a>
              <Link to="/contact" className="bouton bouton--principal">M’écrire</Link>
            </div>
          </div>
        </div>
        {/* Captures de l'outil de suivi de coaching : emplacements en attendant les images de Marie */}
        <div className="heros__outil" aria-label="Aperçu de l’outil de suivi">
          <div className="heros__piste">
            {[...CAPTURES, CAPTURES[0]].map((c, i) => (
              <div key={i} className="heros__capture" aria-hidden="true" title={c} />
            ))}
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
            {/* sur téléphone, le portrait est dans l'encadré, contre « Qui suis-je » (voir styles.css) */}
            <div className="approche__entete">
              <p className="surtitre approche__surtitre">Qui suis-je</p>
              <figure className="approche__photo--cadre" aria-hidden="true"><img src={portraitMarie} alt="" width="960" height="1200" /></figure>
            </div>
            <h2 id="approche-titre" className="titre titre--section">Moi c’est <span className="mot-avant">Marie</span></h2>
            <p className="texte">
              Passionnée de sport, je vous aide à atteindre vos objectifs grâce à une pratique adaptée à votre rythme de vie.
            </p>
            <p className="texte">
              Durant mes 6&nbsp;années de salariat, j’ai constaté que beaucoup de mes collègues manquaient de temps pour prendre
              soin d’eux ou se sentaient perdus face au sport. C’est ce qui m’a poussée à devenir coach.
            </p>
            <p className="texte">
              Ensemble, nous construisons un programme sur mesure qui trouve sa place dans votre emploi du temps.
              Mon objectif&nbsp;? Vous faire gagner en force et en mobilité, tout en retrouvant le plaisir de vous dépasser.
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
              <h2 id="services-titre" className="titre titre--section">Quatre façons de s’<span className="mot-avant">entraîner</span> avec moi</h2>
            </div>
          </div>
          {/* Toute la carte est un lien : la photo, le titre, les lieux, la phrase, puis le prix « à partir de »
              (fiche tarifs) et une flèche ronde, qui passe en jaune au survol.
              Sur téléphone et tablette, les cartes sont compactes : petite photo à gauche, sans la phrase. */}
          <ul className="services__liste">
            {SERVICES.map((service) => (
              <li key={service.to}>
                {/* Toute la carte mène à la page de l'offre (lien du titre étendu à la carte) ;
                    « Me contacter » (vermillon) mène au formulaire, l'offre déjà cochée. Plus de prix sur l'accueil. */}
                <div className="service">
                  <Photo label={service.photo} src={service.image} className={`service__photo service__photo--${service.to.slice(1)}`} />
                  <div className="service__corps">
                    <h3 className="titre titre--tuile">
                      <Link to={service.to} className="service__lien" aria-label={`${service.titre} : voir les formules`}>{service.titre}</Link>
                    </h3>
                    <p className="surtitre service__lieux">{service.pourQui}</p>
                    <p className="texte">{service.texte}</p>
                    <Link to={`/contact?offre=${encodeURIComponent(service.titre)}`} className="service__bas" aria-label={`Me contacter au sujet de l’offre ${service.titre}`}>
                      <span className="service__contact">Me contacter</span>
                      <span className="service__fleche" aria-hidden="true"><FlecheDiagonale /></span>
                    </Link>
                  </div>
                </div>
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
  ['Des séances qui ont du sens', 'Exercices, format, intensité\u00a0: chaque séance est construite pour atteindre votre objectif.'],
  ['Des progrès mesurables', 'On suit vos charges et votre exécution. Le vrai progrès, c’est de vous sentir mieux au quotidien.'],
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

// « Les questions qu'on me pose » : questions et réponses de Marie (5 novembre 2026), reprises telles quelles
const QUESTIONS = [
  ['Je débute ou je reprends le sport après une longue pause, est-ce pour moi\u00a0?', 'Bien sûr. Chaque séance est adaptée à votre niveau et à vos objectifs. Que vous débutiez ou repreniez après une pause, vous progressez à votre rythme.'],
  ['Comment se déroule une séance\u00a0?', 'Chaque séance commence par un échauffement associant mobilité dynamique et activation des muscles qui seront sollicités. Le corps de séance dure ensuite 40 à 50\u00a0minutes avant un retour au calme.'],
  ['Faut-il prévoir du matériel ou un espace particulier\u00a0?', 'À domicile, dans vos locaux ou en extérieur, il suffit d’un espace permettant de bouger en toute sécurité. J’apporte tout le matériel nécessaire\u00a0: tapis, kettlebells, slam balls, etc.'],
  ['Dans quel secteur vous déplacez-vous\u00a0?', 'Basée à Houdan (78), je me déplace dans les Yvelines (78), l’Eure-et-Loir (28) et l’Eure (27). Le déplacement est inclus jusqu’à 20\u00a0km autour de Houdan.'],
  ['Peut-on s’entraîner à deux ou en groupe avec des niveaux différents\u00a0?', 'Totalement. Les exercices sont adaptés au niveau de chaque personne. J’ajuste les charges et propose différentes variantes pour que chacun puisse progresser avec une difficulté adaptée.'],
  ['Comment réserver une séance ou obtenir un devis\u00a0?', (
    <>
      Vous pouvez me contacter via le <Link to="/contact">formulaire de contact</Link> ou par email à{' '}
      <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>. Nous échangerons sur vos besoins pour organiser une séance
      ou établir un devis.
    </>
  )],
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
