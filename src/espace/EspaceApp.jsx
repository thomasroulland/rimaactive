import { Routes, Route, Navigate } from 'react-router-dom'
import { signOut } from 'firebase/auth'
import { auth } from './firebase.js'
import useSession from './useSession.js'
import useTitre from '../components/useTitre.js'
import Connexion from './Connexion.jsx'
import './espace.css'

// Racine de l'espace (chargée à la demande) : garde selon la session et le rôle.
// Les écrans marqués « provisoire » sont remplacés par les tâches suivantes (Accord : 6, coach : 6 et suivantes, client : 9).
export default function EspaceApp() {
  useTitre('Mon espace')
  const { utilisateur, profil, role, chargement } = useSession()

  if (chargement) return <p className="section espace-attente" role="status">Chargement…</p>
  if (!utilisateur) return <Connexion />

  if (role === 'coach') {
    return (
      <Routes>
        <Route path="coach/*" element={<CoachProvisoire />} />
        <Route path="*" element={<Navigate to="/espace/coach" replace />} />
      </Routes>
    )
  }
  if (role === 'client') {
    if (!profil?.accordSante) return <AccordProvisoire />
    return (
      <Routes>
        <Route index element={<ClientProvisoire />} />
        <Route path="*" element={<Navigate to="/espace" replace />} />
      </Routes>
    )
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
          <button type="button" className="bouton bouton--secondaire" onClick={() => signOut(auth)}>Se déconnecter</button>
        </div>
      </div>
    </section>
  )
}

// Provisoires : remplacés par les tâches 6 (Accord, coach) et 9 (client)
const AccordProvisoire = () => <Page titre="Accord de santé"><p className="espace-texte">À venir.</p></Page>
const CoachProvisoire = () => <Page titre="Espace coach" />
const ClientProvisoire = () => <Page titre="Espace client" />
