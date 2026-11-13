import { createContext, useContext, useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, Outlet, useLocation, useParams } from 'react-router-dom'
import { lireProfil } from '../depots.js'
import useGlissiere from '../coque/useGlissiere.js'

const STATUTS = { 'invité': 'Invité', actif: 'Actif', 'en pause': 'En pause' }
const Contexte = createContext(null)

// Le coaché affiché par la page commune (chargé une seule fois pour tous les onglets)
export function useCoache() {
  return useContext(Contexte)
}

// Page commune à un coaché (13 novembre 2026) : le coaché est chargé une fois ; le fil d'Ariane, l'en-tête et les onglets
// restent en place ; seul le contenu de l'onglet change (fondu), et le trait vermillon glisse d'un onglet à l'autre.
export function PageCoache() {
  const { uid } = useParams()
  const { pathname } = useLocation()
  const [client, setClient] = useState(undefined)
  const [entete, setEntete] = useState({ chemin: [], infos: null, nouveautes: 0 })
  const [emplacement, setEmplacement] = useState(null) // où les onglets placent leurs boutons

  useLayoutEffect(() => {
    let actif = true
    setClient(undefined)
    lireProfil(uid).then((c) => { if (actif) setClient(c) }).catch(() => { if (actif) setClient(null) })
    return () => { actif = false }
  }, [uid])

  const onglet = /\/programme(\/|$)/.test(pathname) ? 'programme' : /\/mesures(\/|$)/.test(pathname) ? 'mesures' : 'suivi'

  if (client === undefined) return <section className="section"><div className="conteneur espace-coach"><p className="espace-texte" role="status">Chargement…</p></div></section>
  if (client === null) {
    return (
      <section className="section"><div className="conteneur espace-coach">
        <Link to="/espace/coach" className="espace-retour">← Mes coachés</Link>
        <p className="espace-texte">Ce coaché n’existe pas, ou la connexion a échoué.</p>
      </div></section>
    )
  }
  return (
    <Contexte.Provider value={{ client, uid, setEntete, emplacement, majClient: (maj) => setClient((c) => ({ ...c, ...maj })) }}>
      <section className="section">
        <div className="conteneur espace-coach">
          <Tete client={client} uid={uid} {...entete} onglet={onglet} emplacement={setEmplacement} />
          <div key={onglet} className="onglet-contenu">
            <Outlet />
          </div>
        </div>
      </section>
    </Contexte.Provider>
  )
}

function Tete({ client, uid, chemin, infos, nouveautes, onglet, emplacement }) {
  const nom = `${client.prenom ?? ''} ${client.nom ?? ''}`.trim()
  const base = `/espace/coach/clients/${uid}`
  const fil = [{ label: 'Mes coachés', to: '/espace/coach' }, { label: nom, to: chemin.length ? base : null }, ...chemin]
  const glisse = useGlissiere(onglet)
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
        <div className="coache-tete__actions" ref={emplacement} />
      </header>
      <nav className="onglets-coache ec-glisse" aria-label={`Pages de ${nom}`} ref={glisse}>
        <NavLink to={base} end>Suivi{nouveautes > 0 && <span className="onglets-coache__nb">{nouveautes} {nouveautes > 1 ? 'nouveautés' : 'nouveauté'}</span>}</NavLink>
        <NavLink to={`${base}/programme`}>Programme</NavLink>
        <NavLink to={`${base}/mesures`}>Mesures et photos</NavLink>
      </nav>
    </>
  )
}

// Utilisé par chaque onglet : décrit ce que l'en-tête commun doit montrer (morceaux du fil d'Ariane, texte sous le nom,
// nombre de nouveautés) et y place ses boutons. N'affiche rien à sa propre place.
export default function EnteteCoache({ chemin = [], infos = null, actions = null, nouveautes = 0 }) {
  const ctx = useContext(Contexte)
  const cle = JSON.stringify([chemin, infos, nouveautes])
  useLayoutEffect(() => {
    ctx?.setEntete({ chemin, infos, nouveautes })
  }, [cle]) // eslint-disable-line react-hooks/exhaustive-deps
  if (!ctx?.emplacement || !actions) return null
  return createPortal(actions, ctx.emplacement)
}
