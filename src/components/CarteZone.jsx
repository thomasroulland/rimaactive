import carte from '../assets/carte-zone.jpg'

// Carte de la zone d'intervention : la carte choisie par Marie (fond OpenStreetMap), cadrée sur le cercle
// de 20 km autour de Houdan, avec le nom des villes. La mention des contributeurs est obligatoire.
export default function CarteZone() {
  return (
    <figure className="zone__carte">
      <img
        src={carte}
        width="846"
        height="844"
        loading="lazy"
        alt="Carte de la zone d’intervention : 20 km autour de Houdan, de Mantes-la-Jolie au nord à Dreux à l’ouest et Rambouillet au sud-est"
      />
      <figcaption>© OpenStreetMap contributors</figcaption>
    </figure>
  )
}
