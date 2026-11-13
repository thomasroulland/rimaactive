import { Routes, Route, Navigate } from 'react-router-dom'
import ProgrammesCoach from './ProgrammesCoach.jsx'
import MesCoaches from './MesCoaches.jsx'
import Exercices from './Exercices.jsx'
import FicheExercice from './FicheExercice.jsx'
import { Bilans, Ensemble, Historique, Notes, Photos, Stats } from './OngletsCoache.jsx'
import EditeurProgramme from './EditeurProgramme.jsx'
import { PageCoache } from './EnteteCoache.jsx'

// Pages de l'espace coach : elles sont dans la barre de menu, comme partout (13 novembre 2026)
export const LIENS_COACH = [
  { to: '/espace/coach', label: 'Mes coachés', end: true },
  { to: '/espace/coach/exercices', label: 'Banque d’exercices' },
  { to: '/espace/coach/programmes', label: 'Programmes' },
]

// Espace coach : l'écran choisi
export default function EspaceCoach({ profil }) {
  return (
    <>
      <Routes>
        <Route index element={<MesCoaches profil={profil} />} />
        <Route path="programmes" element={<ProgrammesCoach />} />
        <Route path="modeles/:modeleId" element={<EditeurProgramme />} />
        <Route path="exercices" element={<Exercices />} />
        <Route path="exercices/nouveau" element={<FicheExercice />} />
        <Route path="exercices/:id" element={<FicheExercice />} />
        {/* les pages d'un coaché partagent l'en-tête et les onglets (le coaché est chargé une fois) */}
        <Route path="clients/:uid" element={<PageCoache />}>
          <Route index element={<Ensemble />} />
          <Route path="programme" element={<EditeurProgramme />} />
          <Route path="historique" element={<Historique />} />
          <Route path="bilans" element={<Bilans />} />
          <Route path="stats" element={<Stats />} />
          <Route path="photos" element={<Photos />} />
          <Route path="notes" element={<Notes />} />
          <Route path="mesures" element={<Navigate to="../stats" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/espace/coach" replace />} />
      </Routes>
    </>
  )
}

// Pages du coach (maquette PDF : pas de pastille de nombre dans la barre ; les points à regarder sont sur « Mes coachés »)
export function useLiensCoach() {
  return LIENS_COACH
}
