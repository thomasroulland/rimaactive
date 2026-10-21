import { Link } from 'react-router-dom'
import { BoutonLien, Photo } from './Blocs.jsx'
import { Fleche } from './Entete.jsx'
import './maquettes.css'

// Maquettes du haut de page (?heros=1 à 4), pour choisir une composition. Photos à venir : emplacements.
const FORMULES = [
  { to: '/entreprises', titre: 'entreprises', photo: 'Séance en entreprise' },
  { to: '/communes', titre: 'communes', photo: 'Petit groupe en extérieur' },
  { to: '/particuliers', titre: 'particuliers', photo: 'Séance à domicile' },
]

function Titre({ deuxTons = false }) {
  return (
    <h1 className="titre titre--accueil hv__titre">
      <span className="ligne">Marie Sillas,</span>{' '}
      <span className={`ligne ${deuxTons ? 'hv__accent' : ''}`}>coach sportive</span>
    </h1>
  )
}

const Ligne = () => <p className="ligne-fine ligne-fine--sous-titre hv__ligne">Un corps fort et mobile grâce à une pratique fonctionnelle</p>

function Actions({ sombre = false }) {
  return (
    <div className="actions">
      <BoutonLien to="/contact">M'écrire</BoutonLien>
      <a href="#formules" className={`bouton bouton--secondaire ${sombre ? 'hv__bouton-clair' : ''}`}>Mes formules</a>
    </div>
  )
}

function Reperes() {
  return (
    <ul className="reperes">
      <li>Houdan (78) &amp; alentours</li>
      <li>Sessions de 30 à 60 min</li>
      <li className="repere--neon">Matériel mis à disposition</li>
    </ul>
  )
}

export default function HerosMaquette({ n }) {
  // 1 : photo plein cadre, texte en clair, bandeau corail en bas avec les repères
  if (n === 1) {
    return (
      <section className="hv hv1">
        <Photo label="Photo plein cadre : Marie en séance" sombre className="hv1__fond" />
        <div className="hv1__voile" aria-hidden="true" />
        <div className="hv1__texte">
          <Titre />
          <Ligne />
          <Actions sombre />
        </div>
        <p className="hv1__bandeau">
          Houdan (78) &amp; alentours <span aria-hidden="true">·</span> Sessions de 30 à 60 min{' '}
          <span aria-hidden="true">·</span> Matériel mis à disposition
        </p>
      </section>
    )
  }
  // 2 : grande photo à gauche, à droite le nom en deux tons, un portrait rond et le texte
  if (n === 2) {
    return (
      <section className="hv hv2">
        <Photo label="Grande photo : séance en extérieur" className="hv2__photo" />
        <div className="hv2__texte">
          <Titre deuxTons />
          <Photo label="Portrait" className="hv2__portrait" />
          <Ligne />
          <Actions />
          <Reperes />
        </div>
      </section>
    )
  }
  // 3 : photo plein cadre avec le texte, colonne des formules à droite
  if (n === 3) {
    return (
      <section className="hv hv3">
        <div className="hv3__principal">
          <Photo label="Photo plein cadre : Marie en séance" sombre className="hv3__fond" />
          <div className="hv1__voile" aria-hidden="true" />
          <div className="hv3__texte">
            <Titre />
            <Ligne />
            <Actions sombre />
            <Reperes />
          </div>
        </div>
        <aside className="hv3__formules" aria-labelledby="hv3-formules">
          <h2 id="hv3-formules" className="titre titre--tuile">mes formules</h2>
          {FORMULES.map((f) => (
            <Link key={f.to} to={f.to} className="hv3__formule">
              <Photo label={f.photo} className="hv3__vignette" />
              <span className="hv3__nom">{f.titre}</span>
              <span className="lien-fleche">Découvrir <Fleche taille={16} /></span>
            </Link>
          ))}
        </aside>
      </section>
    )
  }
  // 4 : deux photos côte à côte, la ligne fine en grand au-dessus du nom
  return (
    <section className="hv hv4">
      <Photo label="Photo principale : Marie en mouvement" className="hv4__photo" />
      <Photo label="Deuxième photo" className="hv4__photo2" />
      <div className="hv4__texte">
        <p className="ligne-fine hv4__accroche">Un corps fort et mobile grâce à une pratique fonctionnelle</p>
        <Titre />
        <Actions />
        <Reperes />
      </div>
    </section>
  )
}
