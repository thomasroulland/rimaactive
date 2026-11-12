import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { seDeconnecter } from '../firebase.js'
import MesCoaches from './MesCoaches.jsx'
import Exercices from './Exercices.jsx'
import FicheExercice from './FicheExercice.jsx'
import FicheClient from './FicheClient.jsx'
import EditeurProgramme from './EditeurProgramme.jsx'

// Espace coach : barre d'onglets (charte « Tabs ») puis l'écran choisi
export default function EspaceCoach() {
  return (
    <>
      <nav className="espace-onglets" aria-label="Espace coach">
        <div className="conteneur espace-onglets__ligne">
          <NavLink to="/espace/coach" end className="espace-onglet">Mes coachés</NavLink>
          <NavLink to="/espace/coach/exercices" className="espace-onglet">Banque d’exercices</NavLink>
          <button type="button" className="espace-onglet espace-onglet--sortie" data-quitter onClick={seDeconnecter}>Se déconnecter</button>
        </div>
      </nav>
      <Routes>
        <Route index element={<MesCoaches />} />
        <Route path="exercices" element={<Exercices />} />
        <Route path="exercices/nouveau" element={<FicheExercice />} />
        <Route path="exercices/:id" element={<FicheExercice />} />
        <Route path="clients/:uid" element={<FicheClient />} />
        <Route path="clients/:uid/programme" element={<EditeurProgramme />} />
        <Route path="*" element={<Navigate to="/espace/coach" replace />} />
      </Routes>
    </>
  )
}
