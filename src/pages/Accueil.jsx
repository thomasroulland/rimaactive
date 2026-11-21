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
import Picto from '../components/Picto.jsx'

// Ordre, surtitres et textes de Marie (16 novembre 2026) : Individuel, En ligne, Groupes, Entreprises
const SERVICES = [
  {
    to: '/offres#individuel',
    titre: 'Coaching individuel',
    pourQui: 'À domicile ou en salle',
    photo: 'Barre olympique chargée et kettlebell posées sur un sol de salle',
    image: photoEnLigne,
    texte: 'Des séances adaptées à votre niveau et vos objectifs chez vous ou en extérieur.',
  },
  // tuile ajoutée le 9 novembre 2026, photo envoyée par Marie
  {
    to: '/offres#en-ligne',
    titre: 'Coaching en ligne',
    pourQui: '100\u00a0% à distance',
    photo: 'Barre chargée et pieds d’une sportive sur un sol de salle',
    image: photoIndividuel,
    texte: 'Votre programme sur mesure et un bilan chaque semaine pour progresser où que vous soyez.',
  },
  {
    to: '/offres#groupes',
    titre: 'Coaching en groupe',
    pourQui: '2 à 8 personnes',
    photo: 'Kettlebells et barres sur un sol de salle',
    image: photoGroupes,
    texte: 'Entraînez-vous en petit comité près de chez vous pour progresser dans une bonne ambiance.',
  },
  {
    to: '/offres#entreprises',
    titre: 'Coaching en entreprise',
    pourQui: 'Jusqu’à 16 personnes',
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
              {/* textes de Marie du 21 novembre 2026 (PDF « Modifs à faire ») */}
              <p className="heros4__surtitre">Coach sportive diplômée d’État</p>
              <h1 id="heros-titre" className="heros4__titre">Marie Sillas</h1>
              <p className="heros4__ligne">Un corps fort et mobile grâce à une pratique fonctionnelle.</p>
              <div className="heros4__boutons">
                <a href="#accompagnement" className="heros__ecrire">Découvrir mes offres <FlecheDiagonale /></a>
                <a href="#approche" className="heros__second">Qui suis-je</a>
              </div>
              {/* sous les deux boutons (Marie, 21 novembre 2026) */}
              <p className="heros4__lieu"><Picto nom="map-pin" taille={18} />Houdan (78) &amp; alentours</p>
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
          {/* Cartes en hauteur (maquette de Thomas, 20 novembre 2026, textes inchangés) : la photo en haut, le surtitre, le titre,
              la phrase, puis un trait et « Découvrir » avec sa flèche. 4 par ligne sur ordinateur, 2 sur écran moyen, 1 sur téléphone.
              Toute la carte mène à l'offre (lien du titre étendu à la carte). */}
          <ul className="services4">
            {SERVICES.map((service) => (
              <li key={service.to}>
                <article className="services4__carte">
                  <Photo label={service.photo} src={service.image} className={`services4__photo service__photo--${service.to.split('#')[1]}`} />
                  <div className="services4__corps">
                    <p className="surtitre services4__surtitre">{service.pourQui}</p>
                    <h3 className="services4__titre">
                      <Link to={service.to} className="services4__lien" aria-label={`${service.titre} : voir les formules`}>{service.titre}</Link>
                    </h3>
                    <p className="services4__texte">{service.texte}</p>
                    <span className="services4__bas" aria-hidden="true">
                      <span>Découvrir la formule</span>
                      <svg viewBox="0 0 256 256" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="22" strokeLinecap="round" strokeLinejoin="round"><path d="M72 184 184 72M88 72h96v96" /></svg>
                    </span>
                  </div>
                </article>
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
            {/* « M'écrire » vers le formulaire de contact (Marie, 21 novembre 2026) */}
            <Link to="/contact" className="bouton bouton--principal approche__bouton">M’écrire</Link>
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
const OBJECTIFS = [['Transformation & Silhouette', 'courbe'], ['Performance & Force', 'haltere'], ['Condition physique & Endurance', 'coeur'], ['Mental & Discipline', 'cerveau']]

// Pictogrammes des objectifs, au trait fin comme Phosphor Light (grille 256, épaisseur 14), en vermillon
function PictoObjectif({ nom }) {
  const traits = {
    courbe: <><path d="M32 200h192" /><path d="M40 168l52-56 40 32 84-88" /><path d="M176 56h40v40" /></>,
    haltere: <><path d="M96 128h64" /><rect x="56" y="72" width="40" height="112" rx="10" /><rect x="160" y="72" width="40" height="112" rx="10" /><path d="M28 104v48M228 104v48" /></>,
    coeur: <><path d="M128 216S28 160 28 94a50 50 0 0 1 100-10 50 50 0 0 1 100 10c0 66-100 122-100 122Z" /><path d="M60 128h40l14-26 26 52 14-26h42" /></>,
    cerveau: <><path d="M128 48v160" /><path d="M128 72a36 36 0 0 0-68-12 32 32 0 0 0-20 52 34 34 0 0 0 16 56 36 36 0 0 0 72 4" /><path d="M128 72a36 36 0 0 1 68-12 32 32 0 0 1 20 52 34 34 0 0 1-16 56 36 36 0 0 1-72 4" /></>,
  }
  return <svg className="objectifs4__picto" viewBox="0 0 256 256" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{traits[nom]}</svg>
}

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
          <p className="methode__objectifs-titre">Une méthode, plusieurs objectifs</p>
          {/* bulles blanches avec un pictogramme vermillon, sur une ligne (Marie, 21 novembre 2026) */}
          <ul className="objectifs4">
            {OBJECTIFS.map(([o, picto]) => <li key={o}><PictoObjectif nom={picto} />{o}</li>)}
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
