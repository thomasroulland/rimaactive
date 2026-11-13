import { Routes, Route, Navigate } from 'react-router-dom'
import Coque from './coque/Coque.jsx'
import useSession from './useSession.js'
import useTitre from '../components/useTitre.js'
import Connexion from './Connexion.jsx'
import Accord from './Accord.jsx'
import EspaceCoach from './coach/EspaceCoach.jsx'
import EspaceClient from './client/EspaceClient.jsx'
import { useUrlAvatar } from './client/Avatar.jsx'
import Squelette from './client/Squelette.jsx'
import './espace.css'

// Racine de l'espace (chargée à la demande) : garde selon la session et le rôle.
export default function EspaceApp() {
  useTitre('Mon espace')
  const { utilisateur, profil, role, chargement } = useSession()

  if (chargement) return <Coque compte={false}><Squelette /></Coque>
  if (!utilisateur) return <Coque compte={false}><Connexion /></Coque>

  if (role === 'coach') {
    return (
      <Coque liens={[]}>
        <Routes>
          <Route path="coach/*" element={<EspaceCoach />} />
          <Route path="*" element={<Navigate to="/espace/coach" replace />} />
        </Routes>
      </Coque>
    )
  }
  if (role === 'client') {
    if (!profil?.accordSante) return <Coque liens={[]}><Accord uid={utilisateur.uid} prenom={profil?.prenom} /></Coque>
    return (
      <EspaceCoache uid={utilisateur.uid} profil={profil} />
    )
  }
  // connecté mais sans rôle : compte non rattaché
  return (
    <Coque liens={[]}>
      <Page titre="Compte non activé">
        <p className="espace-texte">Votre compte n’est pas encore activé. Contactez Marie pour qu’elle le finalise.</p>
      </Page>
    </Coque>
  )
}

function EspaceCoache({ uid, profil }) {
  const avatar = useUrlAvatar(profil?.avatar)
  return (
    <Coque liens={LIENS_CLIENT} avatar={avatar}>
      <EspaceClient uid={uid} profil={profil} />
    </Coque>
  )
}

const LIENS_CLIENT = [
  { to: '/espace', label: 'Tableau de bord' },
  { to: '/espace/programme', label: 'Mon programme' },
]

function Page({ titre, children }) {
  return (
    <section className="section">
      <div className="conteneur">
        <div className="espace-carte">
          <h1 className="titre titre--tuile">{titre}</h1>
          {children}
        </div>
      </div>
    </section>
  )
}

