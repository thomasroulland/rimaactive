import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Coque from './coque/Coque.jsx'
import useSession from './useSession.js'
import useTitre from '../components/useTitre.js'
import Connexion from './Connexion.jsx'
import Accord from './Accord.jsx'
import Invitation from './Invitation.jsx'
import EspaceCoach, { useLiensCoach } from './coach/EspaceCoach.jsx'
import EspaceClient from './client/EspaceClient.jsx'
import Squelette from './client/Squelette.jsx'
import './espace.css'
import { lireIndice } from './indiceSession.js'

// Racine de l'espace (chargée à la demande) : garde selon la session et le rôle.
export default function EspaceApp() {
  const { utilisateur, profil, role, chargement } = useSession()
  useTitre(utilisateur ? 'Mon espace' : 'Connexion')
  const { pathname } = useLocation()

  // lien de l'e-mail d'invitation : la page de création du mot de passe, quelle que soit la session sur cet appareil
  if (pathname.replace(/\/+$/, '') === '/espace/invitation') return <Coque compte={false} site client><Invitation /></Coque>

  if (chargement && !utilisateur && !lireIndice()) return <Coque compte={false} site client><Connexion /></Coque>
  if (chargement) return <Coque compte={false}><Squelette /></Coque>
  if (!utilisateur) return <Coque compte={false} site client><Connexion /></Coque>

  if (role === 'coach') return <EspaceDuCoach profil={profil} />
  if (role === 'client') {
    if (!profil?.accordSante) return <Coque site client><Accord uid={utilisateur.uid} prenom={profil?.prenom} /></Coque>
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
  // dans la barre : le pictogramme « compte », pas la photo de profil (choix de Thomas, 14 novembre 2026)
  return (
    <Coque liens={LIENS_CLIENT} client>
      <EspaceClient uid={uid} profil={profil} />
    </Coque>
  )
}

const LIENS_CLIENT = [
  { to: '/espace', label: 'Tableau de bord', court: 'Accueil' },
  { to: '/espace/programme', label: 'Mon programme', court: 'Programme' },
  { to: '/espace/progression', label: 'Ma progression', court: 'Progression' },
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


// Espace du coach : la barre affiche le nombre de coachés qui ont du nouveau
function EspaceDuCoach({ profil }) {
  const liens = useLiensCoach()
  return (
    <Coque liens={liens}>
      <Routes>
        <Route path="coach/*" element={<EspaceCoach profil={profil} />} />
        <Route path="*" element={<Navigate to="/espace/coach" replace />} />
      </Routes>
    </Coque>
  )
}
