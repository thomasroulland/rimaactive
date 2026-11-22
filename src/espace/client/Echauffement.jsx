import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import PhotoStockee from '../coach/PhotoStockee.jsx'
import { echauffementDe } from '../donnees/calculs.js'
import { nomBloc } from '../donnees/programme.js'
import { estEnSeries, lignesExercice } from '../donnees/seances.js'
import Consignes from './Consignes.jsx'

// Échauffement du coaché (Marie, 22 novembre 2026) : une séance de type « Échauffement » dans le programme,
// à part des séances, toujours visible sur le tableau de bord et dans Mon programme. On la lit et on la fait seul :
// rien à noter, pas d'effort ; « J'ai terminé mon échauffement » ramène simplement en arrière.

export const Flamme = ({ taille = 22 }) => (
  <svg viewBox="0 0 256 256" width={taille} height={taille} fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M128 232c-42 0-70-28-70-66 0-46 42-66 44-122 26 14 44 40 46 70 10-8 16-20 18-30 22 20 32 50 32 82 0 38-28 66-70 66Z" />
    <path d="M128 232c-18 0-30-12-30-30 0-22 20-32 30-54 10 22 30 32 30 54 0 18-12 30-30 30Z" />
  </svg>
)

const exercicesDe = (seance) => (seance?.blocs ?? []).flatMap((b) => (b.elements ?? []).map((el) => ({ el, enSeries: estEnSeries(b.format) })))

// Carte « Mon échauffement » (tableau de bord, Mon programme)
export function CarteEchauffement({ programme }) {
  const seance = echauffementDe(programme)
  if (!seance) return null
  return (
    <Link className="ec-echauf" to="/espace/echauffement">
      <span className="ec-echauf__picto"><Flamme /></span>
      <span className="ec-echauf__txt"><b>Mon échauffement</b><span>À faire avant chaque séance</span></span>
      <svg className="ec-echauf__fleche" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
    </Link>
  )
}

export default function Echauffement({ programme }) {
  const naviguer = useNavigate()
  const [fiche, setFiche] = useState(null)
  const seance = echauffementDe(programme)
  const revenir = () => (window.history.length > 1 ? naviguer(-1) : naviguer('/espace'))
  if (!seance) {
    return (
      <section className="ec-page ec-echauf-page">
        <Link className="ec-retour" to="/espace">← Tableau de bord</Link>
        <h1 className="ec-h1">Mon échauffement</h1>
        <p className="ec-texte">Marie ne vous a pas encore préparé d’échauffement.</p>
      </section>
    )
  }
  const exos = exercicesDe(seance)
  return (
    <section className="ec-page ec-echauf-page" aria-labelledby="titre-echauf">
      <button type="button" className="ec-s2-retour ec-s2-quitter" onClick={revenir} aria-label="Fermer l’échauffement" title="Fermer">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
      <h1 id="titre-echauf" className="ec-echauf-page__titre">Mon échauffement</h1>
      <p className="ec-echauf-page__intro">À faire avant chaque séance</p>
      {exos.length === 0
        ? <p className="ec-texte">Marie n’a pas encore ajouté d’exercice.</p>
        : (seance.blocs ?? []).filter((b) => (b.elements ?? []).length > 0).map((b) => {
          // seulement le nom du bloc écrit par Marie ; séries et répétitions dans chaque exercice (« 2 × 6 ») (23 novembre 2026)
          const enSeries = estEnSeries(b.format)
          return (
            <section key={b.id} className="ec-echauf-bloc" aria-label={nomBloc(b)}>
              <p className="ec-echauf-bloc__tete"><span className="ec-st-code">{b.lettre}</span><b>{nomBloc(b)}</b></p>
              <ol className="ec-echauf-liste">
                {(b.elements ?? []).map((el, k) => {
                  const photo = (el.photos ?? []).filter(Boolean)[0]
                  const dose = lignesExercice(el, enSeries).prescription.replace(' · charge libre', '')
                  return (
                    <li key={el.id}>
                      <button type="button" className="ec-echauf-exo" onClick={() => setFiche(el)} aria-label={`${el.nom} : voir les photos et consignes`}>
                        <span className="ec-echauf-exo__photo">{photo ? <PhotoStockee chemin={photo} alt="" /> : <Flamme taille={20} />}</span>
                        <span className="ec-echauf-exo__txt"><b><span className="ec-echauf-exo__code">{b.lettre}{k + 1}</span>{el.nom}</b>{dose && <span>{dose}</span>}</span>
                      </button>
                    </li>
                  )
                })}
              </ol>
            </section>
          )
        })}
      <button type="button" className="ec-st__gros ec-echauf-page__fin" onClick={revenir}>J’ai terminé mon échauffement</button>
      <Consignes element={fiche} fermer={() => setFiche(null)} />
    </section>
  )
}
