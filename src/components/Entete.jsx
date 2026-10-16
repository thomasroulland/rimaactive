import { Link, NavLink } from 'react-router-dom'
import logo from '../assets/logo.png'
import { PAGES } from './liens.js'

export default function Entete() {
  return (
    <header className="entete">
      <Link to="/" className="entete__logo" aria-label="Rimaactive, accueil">
        <img src={logo} alt="rimaactive" />
      </Link>
      <nav className="nav" aria-label="Menu principal">
        {PAGES.map((page) => (
          <NavLink key={page.to} to={page.to} end={page.to === '/'}>
            {page.label}
          </NavLink>
        ))}
      </nav>
      <Link to="/contact" className="bouton bouton--petit">Me contacter</Link>
    </header>
  )
}
