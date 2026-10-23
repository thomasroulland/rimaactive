import { Link } from 'react-router-dom'

// Bloc encre en bas de chaque page : un seul appel à l'action, toujours au même endroit
export default function AppelContact() {
  return (
    <section className="appel sur-encre" aria-labelledby="appel-titre">
      <div className="conteneur appel__grille">
        <div>
          <p className="surtitre">On en parle ?</p>
          <h2 id="appel-titre" className="titre titre--section">Écrivez-moi</h2>
          <p className="texte">
            Les tarifs dépendent du lieu et de la formule : je vous fais une proposition après un premier échange.
          </p>
        </div>
        <Link to="/contact" className="bouton bouton--principal">Me contacter</Link>
      </div>
    </section>
  )
}
