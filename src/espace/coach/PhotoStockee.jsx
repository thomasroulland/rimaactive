import { useEffect, useState } from 'react'
import { urlPhoto } from '../depots.js'

// Photo d'un exercice (chemin Storage) ; `src` direct pour une photo pas encore envoyée
export default function PhotoStockee({ chemin, src, alt, classe, vide = '' }) {
  const [url, setUrl] = useState(src ?? null)
  useEffect(() => {
    if (src || !chemin) return undefined
    let actif = true
    urlPhoto(chemin).then((u) => { if (actif) setUrl(u) }).catch(() => {})
    return () => { actif = false }
  }, [chemin, src])
  if (!chemin && !src) return <span className={`${classe} espace-photo--vide`}>{vide}</span>
  if (!url && !src) return <span className={`${classe} espace-photo--vide`} aria-hidden="true" />
  return <img className={classe} src={src ?? url} alt={alt} loading="lazy" />
}
