import PhotoCoache from './PhotoCoache.jsx'
import { createContext, useContext, useEffect, useLayoutEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Link, NavLink, Outlet, useLocation, useParams } from 'react-router-dom'
import { ecouterProgrammes, ecouterSeancesClient, lireProfil, programmeEnCours } from '../depots.js'
import { aujourdhuiIso } from '../donnees/calculs.js'
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
  const [programmes, setProgrammes] = useState(null)
  const [seances, setSeances] = useState(null)
  const [erreur, setErreur] = useState('')
  useEffect(() => ecouterProgrammes(uid, setProgrammes, () => setErreur('Impossible de charger les programmes. Vérifiez votre connexion.')), [uid])
  useEffect(() => ecouterSeancesClient(uid, setSeances, () => setErreur('Impossible de charger les séances. Vérifiez votre connexion.')), [uid])
  const enCours = programmes ? programmeEnCours(programmes, aujourdhuiIso()) : null
  const progEnCours = enCours ? programmes.find((p) => p.id === enCours.id) ?? null : null

  useLayoutEffect(() => {
    let actif = true
    setClient(undefined)
    lireProfil(uid).then((c) => { if (actif) setClient(c) }).catch(() => { if (actif) setClient(null) })
    return () => { actif = false }
  }, [uid])

  const onglet = ONGLETS.find(([id]) => id && new RegExp(`/${id}(/|$)`).test(pathname))?.[0] ?? ''

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
    <Contexte.Provider value={{ client, uid, setEntete, emplacement, programmes, seances, enCours, progEnCours, erreur, majClient: (maj) => setClient((c) => ({ ...c, ...maj })) }}>
      <section className="section">
        <div className="conteneur espace-coach">
          <Tete client={client} uid={uid} {...entete} onglet={onglet} enCours={enCours} emplacement={setEmplacement} />
          <div key={onglet} className="onglet-contenu">
            <Outlet />
          </div>
        </div>
      </section>
    </Contexte.Provider>
  )
}

// Onglets de la fiche (maquette coach) : [segment d'adresse, nom]
export const ONGLETS = [['', 'Vue d’ensemble'], ['programme', 'Programme'], ['historique', 'Historique'], ['bilans', 'Bilans'], ['stats', 'Statistiques'], ['photos', 'Photos'], ['notes', 'Notes privées']]

function Tete({ client, uid, onglet, enCours, emplacement }) {
  const nom = `${client.prenom ?? ''} ${client.nom ?? ''}`.trim()
  const base = `/espace/coach/clients/${uid}`
  const glisse = useGlissiere(onglet)
  return (
    <>
      <Link to="/espace/coach" className="espace-retour">
        <svg width="20" height="20" aria-hidden="true" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"><path d="M216 128H40M112 56l-72 72 72 72" /></svg>
        Mes coachés
      </Link>
      <header className="coache-tete">
        <PhotoCoache client={client} taille={72} classe="coache-tete__photo" />
        <div className="coache-tete__identite">
          <p className="surtitre">{enCours ? `${enCours.nom} · ${enCours.semaine === 0 ? 'commence bientôt' : `semaine ${enCours.semaine} sur ${enCours.nbSemaines}`}` : 'Pas de programme en cours'}</p>
          <h1 className="titre titre--section">{nom}</h1>
          <p className="coache-tete__objectif">{client.objectif || client.email}{client.statut !== 'actif' && <span className="espace-statut espace-statut--autre">{STATUTS[client.statut] ?? client.statut}</span>}</p>
        </div>
        <div className="coache-tete__actions" ref={emplacement} />
      </header>
      <nav className="onglets-coache ec-glisse" aria-label={`Fiche de ${nom}`} ref={glisse}>
        {ONGLETS.map(([id, libelle]) => <NavLink key={id || 'ensemble'} to={id ? `${base}/${id}` : base} end={!id}>{libelle}</NavLink>)}
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
