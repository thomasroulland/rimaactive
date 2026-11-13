import { useEffect, useState } from 'react'
import { urlPhoto } from '../depots.js'

// Photo d'un exercice (chemin Storage) ; `src` direct pour une photo pas encore envoyée.
// Pendant le chargement (adresse puis image), une forme grise qui brille doucement ; l'image arrive en fondu (14 novembre 2026).
export default function PhotoStockee({ chemin, src, alt, classe, vide = '' }) {
  const [url, setUrl] = useState(src ?? null)
  const [chargee, setChargee] = useState(false)
  const [echec, setEchec] = useState(false)
  useEffect(() => {
    setChargee(false); setEchec(false)
    if (src || !chemin) return undefined
    let actif = true
    setUrl(null)
    urlPhoto(chemin).then((u) => { if (actif) setUrl(u) }).catch(() => { if (actif) setEchec(true) })
    return () => { actif = false }
  }, [chemin, src])
  if ((!chemin && !src) || echec) return <span className={`${classe} espace-photo--vide`}>{vide}</span>
  if (!url && !src) return <span className={`${classe} photo-attente`} aria-hidden="true" />
  return (
    <img className={`${classe}${chargee ? ' photo-arrivee' : ' photo-attente'}`} src={src ?? url} alt={alt} loading="lazy"
      onLoad={() => setChargee(true)} onError={() => setEchec(true)} />
  )
}
