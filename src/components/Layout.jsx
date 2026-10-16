import { Outlet, useLocation } from 'react-router-dom'
import Entete from './Entete.jsx'
import Pied from './Pied.jsx'

export default function Layout() {
  const { pathname } = useLocation()
  return (
    <>
      <a className="lien-evitement" href="#contenu">Aller au contenu</a>
      <Entete />
      {/* La clé change à chaque page : le contenu est remonté et rejoue son animation d'entrée */}
      <main id="contenu" key={pathname} className="page-entree">
        <Outlet />
      </main>
      <Pied />
    </>
  )
}
