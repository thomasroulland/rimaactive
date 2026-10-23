import { Link } from 'react-router-dom'

// Bloc encre en bas de chaque page : un seul appel à l'action, toujours au même endroit
export default function AppelContact() {
  return (
    <section className={`appel sur-encre appel--${new URLSearchParams(window.location.search).get('pied') || '0'}`} aria-labelledby="appel-titre">
      <div className="conteneur appel__grille">
        <p className="surtitre">Besoin d’un accompagnement ?</p>
        {/* Le bouton est sur la même ligne que le titre, centré sur sa hauteur */}
        <div className="appel__ligne">
          <h2 id="appel-titre" className="titre titre--section">Contactez-moi</h2>
          <Link to="/contact" className="bouton bouton--principal">Me contacter</Link>
        </div>
      </div>
    </section>
  )
}
