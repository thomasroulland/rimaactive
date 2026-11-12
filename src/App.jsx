import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Accueil from './pages/Accueil.jsx'
import Cgv from './pages/Cgv.jsx'
import Offres from './pages/Offres.jsx'
import Contact from './pages/Contact.jsx'
import InformationsLegales from './pages/InformationsLegales.jsx'

// L'espace client et coach (et Firebase) ne se charge que sur /espace
const EspaceLazy = lazy(() => import('./espace/EspaceApp.jsx'))

function RemonterEnHaut() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <RemonterEnHaut />
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Accueil />} />
          {/* toutes les offres sur une seule page (10 novembre 2026) ; les anciennes adresses mènent à leur rubrique */}
          <Route path="offres" element={<Offres />} />
          <Route path="particuliers" element={<Navigate to="/offres#individuel" replace />} />
          <Route path="groupes" element={<Navigate to="/offres#groupes" replace />} />
          <Route path="communes" element={<Navigate to="/offres#groupes" replace />} />
          <Route path="entreprises" element={<Navigate to="/offres#entreprises" replace />} />
          <Route path="en-ligne" element={<Navigate to="/offres#en-ligne" replace />} />
          <Route path="contact" element={<Contact />} />
          {/* mentions légales et confidentialité sur une page ; CGV à part (en cours de rédaction) */}
          <Route path="mentions-legales" element={<InformationsLegales />} />
          <Route path="cgv" element={<Cgv />} />
          <Route path="confidentialite" element={<Navigate to="/mentions-legales#confidentialite" replace />} />
          <Route path="espace/*" element={<Suspense fallback={<p className="section" role="status">Chargement…</p>}><EspaceLazy /></Suspense>} />
          <Route path="*" element={<Accueil />} />
        </Route>
      </Routes>
    </>
  )
}
