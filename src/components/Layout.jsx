import { Outlet } from 'react-router-dom'
import Entete from './Entete.jsx'
import Pied from './Pied.jsx'

export default function Layout() {
  return (
    <>
      <a className="lien-evitement" href="#contenu">Aller au contenu</a>
      <Entete />
      <main id="contenu">
        <Outlet />
      </main>
      <Pied />
    </>
  )
}
