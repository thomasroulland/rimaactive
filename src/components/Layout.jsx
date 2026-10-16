import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Entete from './Entete.jsx'
import AppelContact from './AppelContact.jsx'
import Pied from './Pied.jsx'

export default function Layout() {
  const { pathname } = useLocation()

  // Chaque rangée de tuiles attend hors de l'écran, puis ses tuiles se posent une à une
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const rangees = document.querySelectorAll('.tuiles')
    const observateur = new IntersectionObserver(
      (entrees) => {
        entrees.forEach(({ isIntersecting, target }) => {
          if (!isIntersecting) return
          target.classList.add('tuiles--posees')
          target.classList.remove('tuiles--attente')
          observateur.unobserve(target)
        })
      },
      { rootMargin: '0px 0px -15% 0px' },
    )
    rangees.forEach((rangee) => {
      if (rangee.getBoundingClientRect().top < window.innerHeight * 0.85) return
      rangee.classList.add('tuiles--attente')
      observateur.observe(rangee)
    })
    return () => observateur.disconnect()
  }, [pathname])

  return (
    <>
      <a className="lien-evitement" href="#contenu">Aller au contenu</a>
      <Entete />
      {/* La clé change à chaque page : le contenu est remonté et rejoue son fondu d'entrée */}
      <main id="contenu" key={pathname} className="page-entree">
        <Outlet />
        {pathname !== '/contact' && <AppelContact />}
      </main>
      <Pied />
    </>
  )
}
