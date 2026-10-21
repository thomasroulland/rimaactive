import VisuelFondu from '../components/VisuelFondu.jsx'
import HerosMaquette from '../components/HerosMaquette.jsx'
import BoiteOutils from '../components/BoiteOutils.jsx'
import CarteZone from '../components/CarteZone.jsx'
import { Link } from 'react-router-dom'
import { BoutonLien, Faits, Photo } from '../components/Blocs.jsx'
import { Fleche } from '../components/Entete.jsx'
import useTitre from '../components/useTitre.js'

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


export default function Accueil() {
  useTitre('Accueil')
  // Essai : ?heros=1 à 4 affiche une maquette du haut de page
  const maquette = Number(new URLSearchParams(window.location.search).get('heros')) || 0
  return (
    <>
      {maquette ? <HerosMaquette n={maquette} /> : (
      <section className="heros">
        <div className="conteneur heros__grille">
          <div>
            <h1 className="titre titre--accueil">
              <span className="ligne">Marie Sillas,</span> <span className="ligne">coach sportive</span>
            </h1>
            <p className="ligne-fine ligne-fine--sous-titre">Un corps fort et mobile grâce à une pratique fonctionnelle</p>
            <div className="actions">
              <BoutonLien to="/contact">M'écrire</BoutonLien>
              <a href="#formules" className="bouton bouton--secondaire">Mes formules</a>
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
      )}

      <section className="section ecran-plein" aria-labelledby="approche-titre">
        <div className="conteneur deux-colonnes">
          <Photo label="Photo de Marie" />
          <div>
            <h2 id="approche-titre" className="titre titre--accueil">une pratique progressive, accessible et concrète</h2>
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

      <section id="formules" className="section services ecran-plein" aria-labelledby="services-titre">
        <div className="conteneur">
          <h2 id="services-titre" className="titre titre--accueil">mes formules</h2>
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

      <BoiteOutils formats={FORMATS}>
        {/* Texte à venir : Marie l'envoie */}
        <p className="texte"><mark className="a-completer">[Texte à venir]</mark></p>
      </BoiteOutils>

      <section className="section ecran-plein" aria-labelledby="zone-titre">
        <div className="conteneur zone">
          <div className="zone__texte">
            <h2 id="zone-titre" className="titre titre--accueil">je viens à votre rencontre</h2>
            <p className="texte">
              J'interviens à Houdan et dans les communes voisines. Je me déplace avec mon matériel afin d'adapter les
              séances au lieu et au niveau des participants.
            </p>
            <Faits
              items={[
                ['Où', 'Houdan et les communes voisines, dans un rayon de 20\u00a0km'],
                ['Lieux', 'En entreprise, en commune, en extérieur ou à domicile'],
                ['Durée', 'De 30 minutes à 1 heure'],
                ['Tarifs', 'Selon le lieu et la formule, après un premier échange'],
              ]}
            />
          </div>
          <CarteZone />
        </div>
      </section>
    </>
  )
}
