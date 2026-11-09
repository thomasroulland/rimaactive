import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Accueil from './pages/Accueil.jsx'
import Entreprises from './pages/Entreprises.jsx'
import Groupes from './pages/Groupes.jsx'
import EnLigne from './pages/EnLigne.jsx'
import Cgv from './pages/Cgv.jsx'
import Particuliers from './pages/Particuliers.jsx'
import Contact from './pages/Contact.jsx'
import InformationsLegales from './pages/InformationsLegales.jsx'

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
          <Route path="entreprises" element={<Entreprises />} />
          <Route path="groupes" element={<Groupes />} />
          <Route path="communes" element={<Navigate to="/groupes" replace />} />
          <Route path="en-ligne" element={<EnLigne />} />
          <Route path="particuliers" element={<Particuliers />} />
          <Route path="contact" element={<Contact />} />
          {/* mentions légales et confidentialité sur une page ; CGV à part (en cours de rédaction) */}
          <Route path="mentions-legales" element={<InformationsLegales />} />
          <Route path="cgv" element={<Cgv />} />
          <Route path="confidentialite" element={<Navigate to="/mentions-legales#confidentialite" replace />} />
          <Route path="espace" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Accueil />} />
        </Route>
      </Routes>
    </>
  )
}
