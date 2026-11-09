import { HerosPage } from '../components/Blocs.jsx'
import useTitre from '../components/useTitre.js'

// Conditions générales de vente : page vide pour l'instant, à rédiger par Marie (7 novembre 2026)
export default function Cgv() {
  useTitre('CGV')
  return (
    <HerosPage fil="CGV" titre="Conditions générales de vente">
      <p className="texte texte--grand">Page en cours de rédaction.</p>
    </HerosPage>
  )
}
