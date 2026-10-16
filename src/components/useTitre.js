import { useEffect } from 'react'

export default function useTitre(titre) {
  useEffect(() => {
    document.title = `Rimaactive · ${titre}`
  }, [titre])
}
