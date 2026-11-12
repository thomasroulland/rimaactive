import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import PageJuridique from '../components/PageJuridique.jsx'
import useTitre from '../components/useTitre.js'
import { SECTIONS_MENTIONS } from './MentionsLegales.jsx'
import { SECTIONS_CONFIDENTIALITE } from './Confidentialite.jsx'

// Une partie de la page : ses sous-parties en titres de niveau 3
function Partie({ sections }) {
  return sections.map((s) => (
    <div key={s.id} id={s.id} className="juridique__sous-partie">
      <h3>{s.titre}</h3>
      {s.contenu}
    </div>
  ))
}

const PARTIES = [
  { id: 'mentions', titre: 'Mentions légales', contenu: <Partie sections={SECTIONS_MENTIONS} /> },
  { id: 'confidentialite', titre: 'Politique de confidentialité', contenu: <Partie sections={SECTIONS_CONFIDENTIALITE} /> },
]

// Mentions légales et politique de confidentialité, réunies sur une seule page (les CGV sont sur /cgv)
export default function InformationsLegales() {
  useTitre('Mentions légales')
  const { hash } = useLocation()
  // un lien vers une partie (#confidentialite, #cgv) y amène directement
  useEffect(() => {
    if (!hash) return
    const cible = document.getElementById(hash.slice(1))
    if (cible) cible.scrollIntoView()
  }, [hash])
  return (
    <PageJuridique
      fil="Mentions légales"
      titre="Mentions légales"
      miseAJour="12 novembre 2026"
      intro="Qui édite ce site, qui l’héberge, et ce que deviennent les informations que vous me confiez."
      sections={PARTIES}
    />
  )
}
