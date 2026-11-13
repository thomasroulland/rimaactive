import { useEffect, useState } from 'react'
import { ecouterReglages } from '../depots.js'
import { completerReglages, REGLAGES_PAR_DEFAUT } from '../donnees/reglages.js'

// Listes réglables du coach (types de séance, catégories, matériels), à jour en direct
export default function useReglages() {
  const [reglages, setReglages] = useState(REGLAGES_PAR_DEFAUT)
  useEffect(() => ecouterReglages((d) => setReglages(completerReglages(d)), () => {}), [])
  return reglages
}
