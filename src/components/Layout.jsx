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

  // Les photos des rubriques glissent un peu pendant le défilement
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const photos = [...document.querySelectorAll('.deux-colonnes > .photo')]
    if (!photos.length) return
    let image = null
    const suivre = () => {
      image = null
      const h = window.innerHeight
      // Toutes les lectures d'abord, puis toutes les écritures : pas de mise en page forcée
      const positions = photos.map((photo) => {
        const { top, height } = photo.getBoundingClientRect()
        return Math.max(-1, Math.min(1, (top + height / 2 - h / 2) / h))
      })
      photos.forEach((photo, i) => {
        photo.style.setProperty('--glisse', `${(positions[i] * -40).toFixed(1)}px`)
      })
    }
    const auDefilement = () => { if (!image) image = requestAnimationFrame(suivre) }
    suivre()
    window.addEventListener('scroll', auDefilement, { passive: true })
    window.addEventListener('resize', auDefilement)
    return () => {
      window.removeEventListener('scroll', auDefilement)
      window.removeEventListener('resize', auDefilement)
      if (image) cancelAnimationFrame(image)
    }
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
