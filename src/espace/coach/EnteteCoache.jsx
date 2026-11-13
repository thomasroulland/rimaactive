import { Link, NavLink } from 'react-router-dom'

const STATUTS = { 'invité': 'Invité', actif: 'Actif', 'en pause': 'En pause' }

// En-tête commun aux pages d'un coaché (13 novembre 2026) : fil d'Ariane, initiales, nom, statut, actions,
// puis les onglets Suivi · Programme · Mesures et photos.
// `chemin` : morceaux du fil d'Ariane après le nom ([{ label, to? }]) ; `infos` : texte à côté du statut.
export default function EnteteCoache({ client, uid, chemin = [], infos, actions, nouveautes = 0 }) {
  const nom = `${client.prenom ?? ''} ${client.nom ?? ''}`.trim()
  const base = `/espace/coach/clients/${uid}`
  const fil = [{ label: 'Mes coachés', to: '/espace/coach' }, { label: nom, to: chemin.length ? base : null }, ...chemin]
  return (
    <>
      <nav className="ariane" aria-label="Fil d’Ariane">
        <ol>
          {fil.map((m, i) => (
            <li key={i}>
              {m.to && i < fil.length - 1 ? <Link to={m.to}>{m.label}</Link> : <span aria-current={i === fil.length - 1 ? 'page' : undefined}>{m.label}</span>}
            </li>
          ))}
        </ol>
      </nav>
      <header className="coache-tete">
        <span className="coache__initiales coache__initiales--grand" aria-hidden="true">{(client.prenom?.[0] ?? '') + (client.nom?.[0] ?? '')}</span>
        <div className="coache-tete__identite">
          <h1 className="titre titre--section">{nom}</h1>
          <p className="coache-tete__infos">
            <span className={`espace-statut espace-statut--${client.statut === 'actif' ? 'actif' : 'autre'}`}>{STATUTS[client.statut] ?? client.statut}</span>
            <span>{infos ?? client.email}</span>
          </p>
        </div>
        {actions && <div className="coache-tete__actions">{actions}</div>}
      </header>
      <nav className="onglets-coache" aria-label={`Pages de ${nom}`}>
        <NavLink to={base} end>Suivi{nouveautes > 0 && <span className="onglets-coache__nb">{nouveautes} {nouveautes > 1 ? 'nouveautés' : 'nouveauté'}</span>}</NavLink>
        <NavLink to={`${base}/programme`}>Programme</NavLink>
        <NavLink to={`${base}/mesures`}>Mesures et photos</NavLink>
      </nav>
    </>
  )
}
