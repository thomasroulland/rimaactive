import { Link } from 'react-router-dom'
import { Fleche } from './Entete.jsx'

// Titre de section : ligne fine italique au-dessus, titre en minuscules dessous
export function TitreSection({ ligne, titre, id, as: Balise = 'h2', className = '' }) {
  return (
    <div>
      {ligne && <p className="ligne-fine">{ligne}</p>}
      <Balise id={id} className={`titre titre--section ${className}`}>{titre}</Balise>
    </div>
  )
}

// Haut de page commun aux pages intérieures
export function HerosPage({ fil, ligne, titre, children }) {
  return (
    <section className="heros-page">
      <div className="conteneur">
        <nav aria-label="Fil d'Ariane">
          <ol className="fil mention">
            <li><Link to="/">Accueil</Link></li>
            <li aria-current="page">{fil}</li>
          </ol>
        </nav>
        <div className="heros-page__grille">
          <div>
            {ligne && <p className="ligne-fine">{ligne}</p>}
            <h1 className="titre titre--page">{titre}</h1>
          </div>
          <div className="heros-page__intro">{children}</div>
        </div>
      </div>
    </section>
  )
}

// Tuile blanche, néon au survol, numérotée
export function Tuile({ numero, titre, surtitre, to, compacte = false, children }) {
  const contenu = (
    <>
      <p className="mention">{numero}{surtitre && ` · ${surtitre}`}</p>
      <div className="tuile__corps">
        <h3 className="titre titre--tuile">{titre}</h3>
        {children ?? <p className="texte provisoire">[Texte provisoire à rédiger]</p>}
        {to && (
          <span className="lien-fleche">Découvrir <Fleche taille={18} /></span>
        )}
      </div>
    </>
  )
  const classes = `tuile ${compacte ? 'tuile--compacte' : ''} ${to ? 'tuile--lien' : ''}`
  return to ? <Link to={to} className={classes}>{contenu}</Link> : <div className={classes}>{contenu}</div>
}

// Faits pratiques sous forme de liste de définitions
export function Faits({ items }) {
  return (
    <dl className="faits">
      {items.map(([terme, valeur]) => (
        <div key={terme}>
          <dt>{terme}</dt>
          <dd className={valeur ? '' : 'provisoire'}>{valeur ?? '[À compléter]'}</dd>
        </div>
      ))}
    </dl>
  )
}

// Emplacement photo, à remplacer par une vraie image (portrait 4:5)
export function Photo({ label, sombre = false, className = '' }) {
  return (
    <div role="img" aria-label={`Emplacement photo : ${label}`} className={`photo ${sombre ? 'photo--sombre' : ''} ${className}`}>
      <span className="photo__etiquette">
        <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <rect x="3" y="5" width="18" height="14" />
          <circle cx="12" cy="12" r="3.5" />
        </svg>
        {label}
      </span>
    </div>
  )
}

export function BoutonLien({ to, variante = 'principal', children }) {
  return <Link to={to} className={`bouton bouton--${variante}`}>{children}</Link>
}
