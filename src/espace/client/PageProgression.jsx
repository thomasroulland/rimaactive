import { useEffect, useState } from 'react'
import { ecouterMesMesures } from '../depots.js'
import { avancement } from '../donnees/progression.js'
import { ecartPoids, frNombre, meilleurProgres } from '../donnees/resume.js'
import MaProgression from './MaProgression.jsx'
import { records } from '../donnees/records.js'
import { exercicesDe } from '../donnees/seances.js'

// Page « Ma progression » : trois chiffres clés, puis les onglets Charges, Séances, Mesures, Photos (refaite le 25 novembre 2026).
export default function PageProgression({ uid, profil, programme, programmes, faites, seances }) {
  const [mesures, setMesures] = useState(null)
  useEffect(() => ecouterMesMesures(uid, setMesures, () => setMesures([])), [uid])
  const av = programme ? avancement(programme, faites) : null
  const progres = meilleurProgres(programmes, seances)
  const poids = ecartPoids(mesures)
  const { exoIdParElement, noms } = exercicesDe(programmes ?? [])
  const recs = records(seances, exoIdParElement, noms)

  return (
    <div className="ec-page ec-progression ec-progression--v2">
      <header className="ec-progression__tete">
        <h1 className="ec-h1">Ma progression</h1>
      </header>
      <ul className="ec-chiffres" aria-label="Chiffres clés">
        <li className="ec-chiffre">
          <span className="ec-chiffre__val">{av ? av.faites : 0}<small>/ {av ? av.prevues : 0}</small></span>
          <span className="ec-chiffre__lib">séances faites</span>
          {av && av.prevues > 0 && <span className="ec-chiffre__barre" aria-hidden="true"><span style={{ width: `${Math.round((av.faites / av.prevues) * 100)}%` }} /></span>}
        </li>
        <li className="ec-chiffre">
          {progres
            ? <><span className="ec-chiffre__val">{frNombre(progres.ecart, true)}<small>kg</small></span><span className="ec-chiffre__lib">au {progres.nom.toLowerCase()} depuis le début</span></>
            : <><span className="ec-chiffre__val ec-chiffre__val--vide">—</span><span className="ec-chiffre__lib">vos progrès de charge s’afficheront ici</span></>}
        </li>
        <li className="ec-chiffre">
          {poids !== null
            ? <><span className="ec-chiffre__val">{frNombre(poids, true)}<small>kg</small></span><span className="ec-chiffre__lib">de poids depuis la première mesure</span></>
            : <><span className="ec-chiffre__val ec-chiffre__val--vide">—</span><span className="ec-chiffre__lib">ajoutez deux pesées pour voir l’évolution</span></>}
        </li>
      </ul>
      <MaProgression uid={uid} programme={programme} programmes={programmes} faites={faites} seances={seances} records={recs} />
    </div>
  )
}
