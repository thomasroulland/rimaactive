import { BoutonLien, Photo } from './Blocs.jsx'
import photoBarre from '../assets/maquette-barre.jpg'
import './maquettes.css'

// Maquettes du haut de page (?heros=1, 2 et 4), pour choisir une composition. Photos à venir : emplacements.
function Titre() {
  return (
    <h1 className="titre titre--accueil hv__titre">
      <span className="ligne">Marie Sillas,</span>{' '}
      <span className="ligne">coach sportive</span>
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
        <img className="hv1__photo" src={photoBarre} alt="" />
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
  // 2 : grande photo à gauche, à droite le nom et le texte, centrés
  if (n === 2) {
    return (
      <section className="hv hv2">
        <Photo label="Grande photo : séance en extérieur" className="hv2__photo" />
        <div className="hv2__texte">
          <Titre />
          <Ligne />
          <Actions />
          <Reperes />
        </div>
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
