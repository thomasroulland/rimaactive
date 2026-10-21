import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'

// Houdan et le rayon d'intervention
const CENTRE = [48.7894, 1.6006]
const RAYON = 20000 // en mètres

// Carte interactive de la zone d'intervention (fond OpenStreetMap).
// On peut zoomer avec les boutons ou en pinçant ; la molette ne zoome pas, pour ne pas gêner le défilement de la page.
// Leaflet n'est chargé qu'une fois la carte affichée, pour ne pas alourdir le reste du site.
export default function CarteZone() {
  const carteRef = useRef(null)

  useEffect(() => {
    let carte = null
    let annule = false
    import('leaflet').then(({ default: L }) => {
      if (annule || !carteRef.current) return
      carte = L.map(carteRef.current, {
        scrollWheelZoom: false,
        // Au doigt, un seul doigt fait défiler la page ; on zoome et déplace la carte en pinçant
        dragging: !L.Browser.mobile,
        zoomSnap: 0.25,
      })
      // Cadrage sur le cercle (calculé sans la carte : elle n'a pas encore de vue)
      carte.fitBounds(L.latLng(CENTRE).toBounds(2 * RAYON), { padding: [8, 8] })
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(carte)
      L.circle(CENTRE, {
        radius: RAYON,
        color: '#ff6447',
        weight: 2,
        fillColor: '#ff6447',
        fillOpacity: 0.12,
      }).addTo(carte)
      L.circleMarker(CENTRE, { radius: 6, color: '#161514', weight: 3, fillColor: '#ff6447', fillOpacity: 1 }).addTo(carte)
    })
    return () => {
      annule = true
      carte?.remove()
    }
  }, [])

  return (
    <div
      ref={carteRef}
      className="zone__carte"
      role="region"
      aria-label="Carte de la zone d'intervention : 20 km autour de Houdan, de Mantes-la-Jolie au nord à Dreux à l'ouest et Rambouillet au sud-est"
    />
  )
}
