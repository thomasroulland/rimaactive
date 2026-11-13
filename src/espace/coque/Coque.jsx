import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Entete from '../../components/Entete.jsx'
import Pied from '../../components/Pied.jsx'
import Snack from './Snack.jsx'
import { seDeconnecter } from '../firebase.js'
import '../coache.css'

// Coque de l'espace : la barre et le pied du site (un seul composant partout), le contenu entre les deux.
// `compte` : afficher le rond de compte et son menu (faux avant la connexion). `avatar` : adresse d'une photo de profil.
// `site` : menu du site (Accueil, Mes offres, M'écrire) à la place des liens de l'espace (connexion, accord).
// `client` : écrans du coaché (sélection, curseur et focus aux couleurs de la charte) ; les écrans du coach n'en ont pas.
export default function Coque({ liens = [], compte = true, avatar = null, site = false, client = false, libelleCompte = null, children }) {
  return (
    <div className={`ec-coque${client ? ' ec-coque--client' : ''}`}>
      <a className="lien-evitement" href="#contenu">Aller au contenu</a>
      {/* La même barre que le site (13 novembre 2026) : un seul composant partout */}
      <BarreEspace liens={liens} site={site} compte={compte} avatar={avatar} libelleCompte={libelleCompte} />
      <main id="contenu" className="ec-main">{children}</main>
      <Snack />
      <Pied />
    </div>
  )
}

function BarreEspace({ liens, site, compte, avatar, libelleCompte }) {
  const { pathname, state } = useLocation()
  // Sur une séance, l'onglet d'où l'on vient reste allumé (maquette) : « Mon programme » si la séance a été ouverte
  // depuis Mon programme, sinon « Tableau de bord »
  const surSeance = pathname.startsWith('/espace/seance/')
  const depuis = state?.depuis === 'programme' ? '/espace/programme' : '/espace'
  const pages = site ? undefined : liens.map((l) => (surSeance ? { ...l, courant: l.to === depuis } : l))
  return (
    <Entete
      liens={pages}
      ecrire={site}
      accueil={site ? '/' : '/espace'}
      rangee={!site}
      compte={compte ? <MenuCompte avatar={avatar} libelle={libelleCompte} /> : undefined}
    />
  )
}

function MenuCompte({ avatar, libelle }) {
  const [ouvert, setOuvert] = useState(false)
  const [encours, setEncours] = useState(false)
  const racine = useRef(null)
  const bouton = useRef(null)

  useEffect(() => {
    if (!ouvert) return undefined
    const dehors = (e) => { if (racine.current && !racine.current.contains(e.target)) setOuvert(false) }
    const touche = (e) => {
      if (e.key !== 'Escape') return
      setOuvert(false)
      bouton.current?.focus()
    }
    document.addEventListener('pointerdown', dehors)
    document.addEventListener('keydown', touche)
    return () => {
      document.removeEventListener('pointerdown', dehors)
      document.removeEventListener('keydown', touche)
    }
  }, [ouvert])

  const sortir = async () => {
    setEncours(true)
    try { await seDeconnecter() } finally { setEncours(false) }
  }

  return (
    <div className="ec-compte" ref={racine}>
      <button
        type="button"
        ref={bouton}
        className={`ec-rond${libelle ? ' ec-rond--libelle' : ''}`}
        aria-label={libelle ? `Mon compte (${libelle})` : 'Mon compte'}
        aria-expanded={ouvert}
        aria-haspopup="true"
        aria-controls="ec-menu-compte"
        onClick={() => setOuvert((o) => !o)}
      >
        {libelle ? <span className="ec-rond__libelle">{libelle}</span> : avatar
          ? <span className="ec-rond__img" style={{ backgroundImage: `url("${avatar}")` }} />
          : (
            <svg width="24" height="24" aria-hidden="true" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="128" cy="96" r="44" />
              <path d="M44 212c16-36 48-56 84-56s68 20 84 56" />
            </svg>
          )}
      </button>
      {ouvert && (
        <div className="ec-menu" id="ec-menu-compte">
          <button type="button" className="ec-menu__bouton" data-quitter onClick={sortir} disabled={encours}>Se déconnecter</button>
        </div>
      )}
    </div>
  )
}
