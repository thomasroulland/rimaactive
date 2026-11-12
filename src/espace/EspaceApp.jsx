import { Routes, Route, Navigate } from 'react-router-dom'
import { seDeconnecter } from './firebase.js'
import useSession from './useSession.js'
import useTitre from '../components/useTitre.js'
import Connexion from './Connexion.jsx'
import Accord from './Accord.jsx'
import EspaceCoach from './coach/EspaceCoach.jsx'
import EspaceClient from './client/EspaceClient.jsx'
import './espace.css'

// Racine de l'espace (chargée à la demande) : garde selon la session et le rôle.
export default function EspaceApp() {
  useTitre('Mon espace')
  const { utilisateur, profil, role, chargement } = useSession()

  if (chargement) return <p className="section espace-attente" role="status">Chargement…</p>
  if (!utilisateur) return <Connexion />

  if (role === 'coach') {
    return (
      <Routes>
        <Route path="coach/*" element={<EspaceCoach />} />
        <Route path="*" element={<Navigate to="/espace/coach" replace />} />
      </Routes>
    )
  }
  if (role === 'client') {
    if (!profil?.accordSante) return <Accord uid={utilisateur.uid} prenom={profil?.prenom} />
    return <EspaceClient uid={utilisateur.uid} prenom={profil?.prenom} />
  }
  // connecté mais sans rôle : compte non rattaché
  return (
    <Page titre="Compte non activé">
      <p className="espace-texte">Votre compte n’est pas encore activé. Contactez Marie pour qu’elle le finalise.</p>
    </Page>
  )
}

function Page({ titre, children }) {
  return (
    <section className="section">
      <div className="conteneur">
        <div className="espace-carte">
          <h1 className="titre titre--tuile">{titre}</h1>
          {children}
          <button type="button" className="bouton bouton--secondaire" onClick={seDeconnecter}>Se déconnecter</button>
        </div>
      </div>
    </section>
  )
}

