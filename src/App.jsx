import { useEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Accueil from './pages/Accueil.jsx'
import Entreprises from './pages/Entreprises.jsx'
import Communes from './pages/Communes.jsx'
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
          <Route path="communes" element={<Communes />} />
          <Route path="particuliers" element={<Particuliers />} />
          <Route path="contact" element={<Contact />} />
          {/* mentions légales, confidentialité et CGV : une seule page ; les anciennes adresses y mènent */}
          <Route path="mentions-legales" element={<InformationsLegales />} />
          <Route path="confidentialite" element={<Navigate to="/mentions-legales#confidentialite" replace />} />
          <Route path="espace" element={<Navigate to="/" replace />} />
          <Route path="*" element={<Accueil />} />
        </Route>
      </Routes>
    </>
  )
}
