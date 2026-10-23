import BoiteOutils from '../components/BoiteOutils.jsx'
import CarteZone from '../components/CarteZone.jsx'
import photoHeros from '../assets/heros-squat-nb.jpg'
import portraitMarie from '../assets/portrait-marie.jpg'
import { Link } from 'react-router-dom'
import { BoutonLien, Faits, Photo } from '../components/Blocs.jsx'
import { Fleche } from '../components/Entete.jsx'
import Picto from '../components/Picto.jsx'
import useTitre from '../components/useTitre.js'

// Textes à compléter par Marie pour les formats suivants
const A_COMPLETER = { texte: '[Phrase d’explication à rédiger]', objectifs: ['[Objectif 1]', '[Objectif 2]'] }
const FORMATS = [
  {
    nom: 'Density Training',
    texte: 'Une séance à effectuer dans un temps donné en réduisant la durée ou en augmentant le volume au fil des semaines.',
    objectifs: ['Prise de masse', 'Force fonctionnelle'],
  },
  { nom: 'Circuit Training', ...A_COMPLETER },
  { nom: 'EMOM', ...A_COMPLETER },
  { nom: 'AMRAP', ...A_COMPLETER },
  { nom: 'Complex', ...A_COMPLETER },
  { nom: 'Balistique', ...A_COMPLETER },
]

const SERVICES = [
  {
    to: '/entreprises',
    titre: 'Entreprises',
    photo: 'Séance en groupe dans des locaux ou en extérieur',
    texte: 'J’accompagne vos équipes avec des séances de mobilité et de renforcement fonctionnel dans vos locaux ou en extérieur.',
  },
  {
    to: '/communes',
    titre: 'Groupes',
    photo: 'Petit groupe en extérieur',
    texte: 'Retrouvez-moi en extérieur, près de chez vous, pour bouger dans un esprit d’entraide et progresser ensemble.',
  },
  {
    to: '/particuliers',
    titre: 'Individuel',
    photo: 'Séance à domicile ou dans un jardin',
    texte: 'Je vous accompagne en présentiel ou à distance avec des séances construites autour de vos objectifs et de votre niveau.',
  },
]


export default function Accueil() {
  useTitre('Accueil')
  return (
    <>
      <section className="heros">
        {/* Photo de Marie en squat, en noir et blanc, calée à droite sans être coupée, fondue vers la gauche */}
        <img className="heros__photo" src={photoHeros} alt="" />
        <div className="heros__texte">
          <h1 className="titre titre--accueil">
            <span className="ligne">Marie Sillas</span> <span className="ligne">Coach sportive</span>
          </h1>
          <p className="accroche heros__ligne">Un corps fort et mobile grâce à une pratique fonctionnelle</p>
          <div className="actions">
            <a href="#accompagnement" className="bouton bouton--clair">Mon accompagnement</a>
            <BoutonLien to="/contact">M'écrire</BoutonLien>
          </div>
        </div>
        <ul className="heros__bandeau">
          <li><Picto nom="map-pin" taille={20} />Jusqu’à 20&nbsp;km autour de Houdan (78)</li>
          <li><Picto nom="timer" taille={20} />Sessions de 30 à 60 min</li>
          <li><Picto nom="kettlebell" taille={20} />Matériel mis à disposition</li>
        </ul>
      </section>

      <section className="section ecran-plein" aria-labelledby="approche-titre">
        <div className="conteneur deux-colonnes">
          <Photo label="Marie Sillas, coach sportive" src={portraitMarie} />
          <div>
            <h2 id="approche-titre" className="titre titre--section">Une pratique progressive, accessible et concrète</h2>
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

      <section id="accompagnement" className="section services ecran-plein" aria-labelledby="services-titre">
        <div className="conteneur">
          <h2 id="services-titre" className="titre titre--section">Mon accompagnement</h2>
          {/* Toute la carte est un lien ; elle passe au néon au survol */}
          <ul className="services__liste">
            {SERVICES.map((service) => (
              <li key={service.to}>
                <Link to={service.to} className="service">
                  <Photo label={service.photo} sansEtiquette className="service__photo" />
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
              J’interviens avec mon matériel afin d’adapter chaque session au lieu, à votre niveau et à vos objectifs.
            </p>
            <Faits
              items={[
                ['Où', 'Houdan et les communes voisines, dans un rayon de 20\u00a0km', 'map-pin'],
                ['Lieux', 'Dans vos locaux, en extérieur ou à domicile', 'buildings'],
                ['Durée', 'De 30 minutes à 1 heure', 'clock'],
                ['Tarifs', 'Définis à l’issue d’un premier échange, selon le lieu et la formule choisie', 'check-square'],
              ]}
            />
          </div>
          <CarteZone />
        </div>
      </section>
    </>
  )
}
