import { Routes, Route, Navigate } from 'react-router-dom'
import MesCoaches from './MesCoaches.jsx'
import Exercices from './Exercices.jsx'
import FicheExercice from './FicheExercice.jsx'
import FicheClient from './FicheClient.jsx'
import EditeurProgramme from './EditeurProgramme.jsx'

// Pages de l'espace coach : elles sont dans la barre de menu, comme partout (13 novembre 2026)
export const LIENS_COACH = [
  { to: '/espace/coach', label: 'Mes coachés', end: true },
  { to: '/espace/coach/exercices', label: 'Banque d’exercices' },
]

// Espace coach : l'écran choisi
export default function EspaceCoach() {
  return (
    <>
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
