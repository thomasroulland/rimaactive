import { useEffect, useState } from 'react'
import { Photo } from './Blocs.jsx'

// Les trois décors de la charte, en fondu toutes les 4 secondes
const DECORS = [
  { label: 'Salle · barre, landmine', ton: 'sombre' },
  { label: 'Maison · kettlebell, mobilité', ton: 'clair' },
  { label: 'Quotidien · lifestyle', ton: 'moyen' },
]

export default function VisuelFondu() {
  const [actif, setActif] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const minuteur = setInterval(() => setActif((i) => (i + 1) % DECORS.length), 4000)
    return () => clearInterval(minuteur)
  }, [])

  return (
    <div className="fondu-scene">
      {DECORS.map((decor, i) => (
        <Photo
          key={decor.label}
          label={decor.label}
          sombre={decor.ton === 'sombre'}
          sansEtiquette
          className={`fondu-photo fondu-photo--${decor.ton} ${i === actif ? 'fondu-photo--active' : ''}`}
        />
      ))}
      <div className="fondu-points" aria-hidden="true">
        {DECORS.map((decor, i) => (
          <span key={decor.label} className={i === actif ? 'actif' : ''} />
        ))}
      </div>
    </div>
  )
}
