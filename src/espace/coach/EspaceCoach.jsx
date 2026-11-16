import { Routes, Route, Navigate } from 'react-router-dom'
import ProgrammesCoach from './ProgrammesCoach.jsx'
import MesCoaches from './MesCoaches.jsx'
import Exercices from './Exercices.jsx'
import FicheExercice from './FicheExercice.jsx'
import { Bilans, Ensemble, Messages, Notes, Photos, Stats } from './OngletsCoache.jsx'
import Messagerie, { useConversations } from './Messagerie.jsx'
import { nonLu } from '../donnees/messages.js'
import EditeurModeleSeance from './EditeurModeleSeance.jsx'
import EditeurProgramme from './EditeurProgramme.jsx'
import { PageCoache } from './EnteteCoache.jsx'

// Pages de l'espace coach : elles sont dans la barre de menu, comme partout (13 novembre 2026)
export const LIENS_COACH = [
  { to: '/espace/coach', label: 'Mes coachés', court: 'Coachés', end: true },
  { to: '/espace/coach/exercices', label: 'Banque d’exercices', court: 'Exercices' },
  { to: '/espace/coach/modeles', label: 'Modèles' },
  { to: '/espace/coach/messages', label: 'Messages' },
]

// Espace coach : l'écran choisi
export default function EspaceCoach({ profil }) {
  return (
    <>
      <Routes>
        <Route index element={<MesCoaches profil={profil} />} />
        <Route path="modeles" element={<ProgrammesCoach />} />
        <Route path="programmes" element={<Navigate to="/espace/coach/modeles" replace />} />
        <Route path="modeles/:modeleId" element={<EditeurModeleSeance />} />
        <Route path="messages" element={<Messagerie />} />
        <Route path="messages/:uid" element={<Messagerie />} />
        <Route path="exercices" element={<Exercices />} />
        <Route path="exercices/nouveau" element={<FicheExercice />} />
        <Route path="exercices/:id" element={<FicheExercice />} />
        {/* les pages d'un coaché partagent l'en-tête et les onglets (le coaché est chargé une fois) */}
        <Route path="clients/:uid" element={<PageCoache />}>
          <Route index element={<Ensemble />} />
          <Route path="programme" element={<EditeurProgramme />} />
          <Route path="historique" element={<Navigate to=".." replace />} />
          <Route path="bilans" element={<Bilans />} />
          <Route path="stats" element={<Stats />} />
          <Route path="photos" element={<Photos />} />
          <Route path="messages" element={<Messages />} />
          <Route path="notes" element={<Notes />} />
          <Route path="mesures" element={<Navigate to="../stats" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/espace/coach" replace />} />
      </Routes>
    </>
  )
}

// Pages du coach : « Messages » porte le nombre de coachés qui ont écrit sans réponse lue (15 novembre 2026)
export function useLiensCoach() {
  const conversations = useConversations()
  const n = [...(conversations?.values() ?? [])].filter((c) => nonLu(c, 'coach')).length
  return LIENS_COACH.map((l) => (l.to === '/espace/coach/messages' ? { ...l, badge: n } : l))
}
