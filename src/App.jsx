import { useEffect } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Accueil from './pages/Accueil.jsx'
import Entreprises from './pages/Entreprises.jsx'
import Communes from './pages/Communes.jsx'
import Particuliers from './pages/Particuliers.jsx'
import APropos from './pages/APropos.jsx'
import Contact from './pages/Contact.jsx'

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
          <Route path="a-propos" element={<APropos />} />
          <Route path="contact" element={<Contact />} />
          <Route path="*" element={<Accueil />} />
        </Route>
      </Routes>
    </>
  )
}
