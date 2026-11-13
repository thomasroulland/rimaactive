import { useEffect, useState, useSyncExternalStore } from 'react'
import { ecouterClients, ecouterSeancesTerminees, ecouterTousProgrammes } from '../depots.js'
import { derniereVisite, nouvellesSeances } from './vus.js'

// Données partagées de l'espace coach (liste des coachés, programmes, séances terminées) : un seul jeu d'écoutes
// pour « Mes coachés » et la pastille de la barre du haut, ouvert tant qu'un écran s'en sert.
let etat = { clients: null, programmes: null, seances: null, erreur: '' }
const abonnes = new Set()
let arret = null
const publier = (maj) => { etat = { ...etat, ...maj }; abonnes.forEach((f) => f()) }

function abonner(f) {
  abonnes.add(f)
  if (!arret) {
    const erreur = () => publier({ erreur: 'Impossible de charger vos coachés. Vérifiez votre connexion.' })
    const a = ecouterClients((clients) => publier({ clients }), erreur)
    const b = ecouterTousProgrammes((programmes) => publier({ programmes }), erreur)
    const c = ecouterSeancesTerminees((seances) => publier({ seances }), erreur)
    arret = () => { a(); b(); c() }
  }
  return () => {
    abonnes.delete(f)
    if (!abonnes.size && arret) { arret(); arret = null; etat = { clients: null, programmes: null, seances: null, erreur: '' } }
  }
}

export function useDonneesCoach() {
  return useSyncExternalStore(abonner, () => etat)
}

// Redessine quand Marie ouvre un suivi (la dernière visite change sur cet appareil)
export function useVisites() {
  const [, setN] = useState(0)
  useEffect(() => {
    const f = () => setN((n) => n + 1)
    window.addEventListener('rima-vu', f)
    window.addEventListener('storage', f)
    return () => { window.removeEventListener('rima-vu', f); window.removeEventListener('storage', f) }
  }, [])
}

// Nouveautés par coaché : séances terminées depuis la dernière visite de son suivi
export function nouveautesParClient(seances) {
  const parClient = new Map()
  for (const s of seances ?? []) {
    if (!parClient.has(s.client)) parClient.set(s.client, [])
    parClient.get(s.client).push(s)
  }
  const out = new Map()
  for (const [uid, liste] of parClient) out.set(uid, nouvellesSeances(liste, derniereVisite(uid)))
  return out
}
