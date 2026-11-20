import photoHeros from '../assets/portrait-contact.jpg'
import portraitMarie from '../assets/portrait-marie.jpg'
import photoEntreprises from '../assets/service-entreprises.jpg'
import photoGroupes from '../assets/service-groupes.jpg'
import photoIndividuel from '../assets/service-individuel.jpg'
import photoEnLigne from '../assets/service-en-ligne.jpg'
import { Link } from 'react-router-dom'
import { Photo } from '../components/Blocs.jsx'
import useTitre from '../components/useTitre.js'
import { basculerDetails } from '../components/basculerDetails.js'
import { CONTACT } from '../components/liens.js'
import EcransEspace from '../components/EcransEspace.jsx'

// Ordre, surtitres et textes de Marie (16 novembre 2026) : Individuel, En ligne, Groupes, Entreprises
const SERVICES = [
  {
    to: '/offres#individuel',
    titre: 'Individuel',
    pourQui: '1:1 • À domicile ou en salle',
    photo: 'Barre olympique chargée et kettlebell posées sur un sol de salle',
    image: photoEnLigne,
    texte: 'Des séances adaptées à votre niveau et vos objectifs chez vous ou en extérieur.',
  },
  // tuile ajoutée le 9 novembre 2026, photo envoyée par Marie
  {
    to: '/offres#en-ligne',
    titre: 'En ligne',
    pourQui: 'Suivi mensuel • À distance',
    photo: 'Barre chargée et pieds d’une sportive sur un sol de salle',
    image: photoIndividuel,
    texte: 'Votre programme sur mesure et un bilan chaque semaine pour progresser où que vous soyez.',
  },
  {
    to: '/offres#groupes',
    titre: 'Groupes',
    pourQui: '2 à 8 personnes • En extérieur',
    photo: 'Kettlebells et barres sur un sol de salle',
    image: photoGroupes,
    texte: 'Entraînez-vous en petit comité près de chez vous pour progresser dans une bonne ambiance.',
  },
  {
    to: '/offres#entreprises',
    titre: 'Entreprises',
    pourQui: 'Jusqu’à 16 personnes • Sur site',
    photo: 'Rangée de kettlebells sur le sol d’une salle',
    image: photoEntreprises,
    texte: 'Des séances de mobilité et de renforcement pour vos équipes dans vos locaux ou en plein air.',
  },
]

export default function Accueil() {
  useTitre('Accueil')
  return (
    <>
      {/* Haut de page (maquette de Thomas, 20 novembre 2026 ; textes inchangés) : deux cartes arrondies côte à côte,
          la photo de Marie avec le texte posé en bas, et l'aperçu de l'espace client ; sur téléphone, l'une sous l'autre */}
      <section className="heros4" data-heros aria-labelledby="heros-titre">
        <div className="heros4__grille">
          <div className="heros4__photo">
            <img src={photoHeros} alt="Marie Sillas, coach sportive, bras croisés" />
            <div className="heros4__texte">
              <p className="heros4__surtitre">Coach sportive diplômée · Houdan (78) &amp; alentours</p>
              <h1 id="heros-titre" className="heros4__titre">Marie Sillas</h1>
              <p className="heros4__ligne">Un corps fort et mobile grâce à une pratique fonctionnelle.</p>
              <div className="heros4__boutons">
                <Link to="/contact" className="heros__ecrire">M’écrire <FlecheDiagonale /></Link>
                <a href="#approche" className="heros__second">Qui suis-je</a>
              </div>
            </div>
          </div>
          <EcransEspace />
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
                    « Voir les offres » mène aussi à la page de l'offre, en haut. Plus de prix sur l'accueil. */}
                <div className="service">
                  <Photo label={service.photo} src={service.image} className={`service__photo service__photo--${service.to.split('#')[1]}`} />
                  <div className="service__corps">
                    {/* surtitre vermillon au-dessus du titre (Marie, 16 novembre 2026) */}
                    <p className="surtitre service__lieux">{service.pourQui}</p>
                    <h3 className="titre titre--tuile">
                      <Link to={service.to} className="service__lien" aria-label={`${service.titre} : voir les formules`}>{service.titre}</Link>
                    </h3>
                    <p className="texte">{service.texte}</p>
                    <Link to={service.to} className="service__bas" aria-label={`${service.titre} : découvrir les offres`}>
                      <span className="service__contact">Découvrir</span>
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

      {/* « Moi c'est Marie » (ancre #approche), en dernier depuis le 9 novembre 2026 à la demande de Marie : le portrait entier et l'encadré, de même hauteur, centrés ensemble.
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
              Coach sportive diplômée d’État, je vous aide à atteindre vos objectifs grâce à une pratique adaptée à votre emploi du temps.
            </p>
            <p className="texte">
              Durant mes 6&nbsp;années de salariat, j’ai vu beaucoup de mes collègues manquer de temps pour prendre soin d’eux
              ou se sentir perdus face au sport. C’est ce déclic qui m’a poussée à me reconvertir.
            </p>
            <p className="texte">
              Je construis avec vous des séances efficaces et ciblées sur vos besoins. Mon objectif&nbsp;: vous faire gagner
              en force et en mobilité tout en retrouvant le plaisir de vous dépasser.
            </p>
            <a href="#accompagnement" className="bouton bouton--principal approche__bouton">Mes services</a>
          </div>
        </div>
      </section>
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
  ['Le mouvement d’abord', 'Je décompose les mouvements en vous donnant des repères simples pour que vous maîtrisiez la technique.'],
  ['Des séances structurées', 'Échauffement ciblé, renforcement fonctionnel et fin de séance adaptée à votre énergie\u00a0: chaque étape sert votre objectif.'],
  ['Des progrès concrets', 'Un suivi complet de vos séances et de vos statistiques pour savoir exactement où vous en êtes.'],
  ['Le plaisir de progresser', 'En maîtrisant les bases, vous gagnez en assurance et vous vous sentez mieux dans votre corps au quotidien.'],
]

// Les objectifs que Marie accompagne (donnés par Marie, novembre 2026)
const OBJECTIFS = ['Transformation & Silhouette', 'Performance & Force', 'Condition physique & Endurance', 'Mental & Discipline']

// « Ma méthode » (novembre 2026) : titre centré, quatre principes, objectifs ; fond blanc, « fonctionne » en vermillon
function Methode() {
  return (
    <section id="methode" className="section ecran-plein methode" aria-labelledby="methode-titre">
      <div className="conteneur">
        <div className="methode__entete">
          <p className="surtitre">Ma méthode</p>
          <h2 id="methode-titre" className="titre titre--section">Pourquoi ça <span className="mot-avant">fonctionne</span>&nbsp;?</h2>
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
  ['Je débute ou je reprends le sport après une longue pause, est-ce pour moi\u00a0?', 'Bien sûr. Chaque séance est adaptée à votre niveau et à vos objectifs. Que vous débutiez ou que vous repreniez après une pause, vous progressez à votre rythme.'],
  ['Comment se déroule une séance\u00a0?', 'Chaque séance démarre par un échauffement alliant mobilité et activation des muscles. Le cœur de séance dure ensuite 40 à 50\u00a0minutes, suivi d’une fin de séance adaptée à votre énergie du jour.'],
  ['Faut-il prévoir du matériel ou un espace particulier\u00a0?', 'À domicile, dans vos locaux ou en extérieur, il suffit d’un espace permettant de bouger en toute sécurité. J’apporte tout le matériel nécessaire\u00a0: tapis, kettlebells, slam balls, etc.'],
  ['Dans quel secteur vous déplacez-vous\u00a0?', 'Basée à Houdan (78), je me déplace dans les Yvelines (78), l’Eure-et-Loir (28) et l’Eure (27). Le déplacement est inclus jusqu’à 20\u00a0km autour de Houdan.'],
  ['Peut-on s’entraîner à deux ou en groupe avec des niveaux différents\u00a0?', 'Totalement. Les exercices sont adaptés au niveau de chaque personne. J’ajuste les charges et propose différentes variantes pour que chacun puisse progresser avec une difficulté adaptée.'],
  ['Comment fonctionne le coaching en ligne\u00a0?', 'Vous recevez votre programme sur mesure directement sur votre espace. On fait un bilan chaque semaine pour adapter le programme et corriger vos mouvements en vidéo.'],
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
              {/* la réponse s'ouvre et se ferme en glissant */}
              <summary onClick={(e) => basculerDetails(e, e.currentTarget.nextElementSibling)}>{q}<span className="question__plus" aria-hidden="true" /></summary>
              <p>{r}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
