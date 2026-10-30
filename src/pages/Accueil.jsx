import BoiteOutils from '../components/BoiteOutils.jsx'
import CarteZone from '../components/CarteZone.jsx'
import photoHeros from '../assets/heros-squat-nb.jpg'
import portraitMarie from '../assets/portrait-marie.jpg'
import photoEntreprises from '../assets/service-entreprises.jpg'
import photoGroupes from '../assets/service-groupes.jpg'
import photoIndividuel from '../assets/service-individuel.jpg'
import { Link } from 'react-router-dom'
import { BoutonLien, Faits, Photo } from '../components/Blocs.jsx'
import { Fleche } from '../components/Entete.jsx'
import Picto from '../components/Picto.jsx'
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
  {
    nom: 'Balistique',
    texte: 'Des mouvements explosifs pour développer votre vitesse et votre réactivité.',
    objectifs: ['Performance', 'Vitesse'],
  },
]

const SERVICES = [
  {
    to: '/entreprises',
    titre: 'Entreprises',
    photo: 'Rangée de kettlebells sur le sol d’une salle',
    image: photoEntreprises,
    texte: 'J’accompagne vos équipes avec des séances de mobilité et de renforcement fonctionnel dans vos locaux ou en extérieur.',
  },
  {
    to: '/communes',
    titre: 'Groupes',
    photo: 'Kettlebells et barres sur un sol de salle',
    image: photoGroupes,
    texte: 'Retrouvez-moi en extérieur, près de chez vous, pour progresser ensemble dans un esprit d’entraide.',
  },
  {
    to: '/particuliers',
    titre: 'Individuel',
    photo: 'Barre olympique chargée et kettlebell posées sur un sol de salle',
    image: photoIndividuel,
    texte: 'Je vous accompagne en présentiel ou à distance avec des séances construites autour de vos objectifs et de votre niveau.',
  },
]


export default function Accueil() {
  useTitre('Accueil')
  const versionHeros = Number(new URLSearchParams(window.location.search).get('heros')) || 1
  return (
    <>
      {/* Haut de page : la photo de Marie en squat, en plein écran sous la barre de menu.
          Essai : ?heros=1 ou 2 pour comparer les deux versions demandées par Marie */}
      {versionHeros === 2 ? (
        <section className="heros heros--v2">
          <img className="heros__photo" src={photoHeros} alt="" />
          <div className="heros__texte">
            <p className="surtitre heros__surtitre">Coach sportive diplômée</p>
            <h1 className="titre heros__titre">Marie Sillas</h1>
            <p className="accroche heros__ligne">Un corps fort et mobile grâce à une pratique fonctionnelle</p>
            <div className="actions">
              <a href="#approche" className="bouton bouton--principal">Mon approche</a>
              <BoutonLien to="/contact" variante="clair">M’écrire</BoutonLien>
            </div>
          </div>
        </section>
      ) : (
        <section className="heros heros--v1">
          <img className="heros__photo" src={photoHeros} alt="" />
          <div className="heros__texte">
            <h1 className="titre heros__titre">
              <span className="ligne">Marie Sillas</span> <span className="ligne heros__jaune">Coach sportive</span>
            </h1>
            <p className="accroche heros__ligne">Un corps fort et mobile grâce à une pratique fonctionnelle</p>
            <div className="actions">
              <a href="#approche" className="bouton bouton--principal">Mon approche</a>
            </div>
          </div>
          <ul className="heros__bandeau" aria-label="Ce que l’on travaille">
            {['Force', 'Endurance', 'Puissance', 'Mobilité'].map((mot) => <li key={mot}>{mot}</li>)}
          </ul>
        </section>
      )}

      {/* Mon approche : « Mon approche » au-dessus du portrait entier (ni coupé ni rapproché), l'encadré à droite.
          C'est la seule rubrique qui présente Marie (plus de page « À propos »). */}
      <section id="approche" className="section ecran-plein approche" aria-labelledby="approche-titre">
        <div className="approche__gauche">
          <h2 id="approche-titre" className="titre titre--section approche__titre">Mon approche</h2>
          <figure className="approche__photo">
            <img src={portraitMarie} alt="Marie Sillas, coach sportive" width="960" height="1200" />
          </figure>
        </div>
        <div className="approche__panneau">
          <div className="approche__cadre">
            <p className="surtitre">Mon approche</p>
            <h3 className="titre titre--section">S’entraîner moins, mais mieux</h3>
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
          {/* Toute la carte est un lien ; elle passe au néon au survol */}
          <ul className="services__liste">
            {SERVICES.map((service) => (
              <li key={service.to}>
                <Link to={service.to} className="service">
                  <Photo label={service.photo} src={service.image} className={`service__photo service__photo--${service.titre.toLowerCase()}`} />
                  <div className="service__corps">
                    <h3 className="titre titre--tuile">{service.titre}</h3>
                    <p className="texte">{service.texte}</p>
                    <span className="lien-fleche service__lien">En savoir plus <Fleche /></span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <BoiteOutils formats={FORMATS} />

      <section className="section ecran-plein" aria-labelledby="zone-titre">
        <div className="conteneur zone">
          <div className="zone__texte">
            <h2 id="zone-titre" className="titre titre--section">Ma zone d’intervention</h2>
            <p className="texte">
              <span className="ligne">J’interviens avec mon matériel pour adapter chaque séance au lieu,</span>{' '}
              <span className="ligne">à votre niveau et à vos objectifs.</span>
            </p>
            <Faits
              items={[
                ['Où', 'Dans un rayon de 20\u00a0km autour de Houdan (78)', 'map-pin'],
                ['Déplacement', 'Compris dans toute la zone', 'car-simple'],
                ['Lieux', 'Dans vos locaux, en extérieur ou à domicile', 'buildings'],
                ['Durée', 'De 30 à 60\u00a0min', 'clock'],
              ]}
            />
          </div>
          <CarteZone />
        </div>
      </section>
    </>
  )
}
