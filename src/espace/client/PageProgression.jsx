import { useEffect, useState } from 'react'
import { ecouterMesMesures } from '../depots.js'
import { avancement, semaineDe } from '../donnees/progression.js'
import { aujourdhuiIso } from '../donnees/calculs.js'
import { ecartPoids, frNombre, meilleurProgres } from '../donnees/resume.js'
import MaProgression from './MaProgression.jsx'
import { records } from '../donnees/records.js'
import { exercicesDe } from '../donnees/seances.js'

// Page « Ma progression » : trois chiffres clés, puis les onglets Charges, Séances, Mesures, Photos (refaite le 25 novembre 2026).
export default function PageProgression({ uid, profil, programme, programmes, faites, seances }) {
  const [mesures, setMesures] = useState(null)
  useEffect(() => ecouterMesMesures(uid, setMesures, () => setMesures([])), [uid])
  const av = programme ? avancement(programme, faites) : null
  const sem = programme?.debut && programme.debut <= aujourdhuiIso() ? semaineDe(programme, aujourdhuiIso()) : null
  const progres = meilleurProgres(programmes, seances)
  const poids = ecartPoids(mesures)
  const { exoIdParElement, noms } = exercicesDe(programmes ?? [])
  const recs = records(seances, exoIdParElement, noms)

  return (
    <div className="ec-page ec-progression ec-progression--v2">
      <header className="ec-progression__tete">
        <h1 className="ec-h1">Ma progression</h1>
      </header>
      {/* proposition A (Marie, 25 novembre 2026) : une carte noire, les séances en grand, deux chiffres en dessous */}
      <section className="ec-prog-noire" aria-label="Chiffres clés">
        <p className="ec-prog-noire__lab">{programme ? `Mon programme${sem ? ` · semaine ${sem} sur ${programme.semaines?.length ?? 0}` : ''}` : 'Mon programme'}</p>
        <p className="ec-prog-noire__grand">{av ? av.faites : 0}<small>/ {av ? av.prevues : 0} séance{(av?.prevues ?? 0) > 1 ? 's' : ''}</small></p>
        {av && av.prevues > 0 && <span className="ec-prog-noire__barre" aria-hidden="true"><span style={{ width: `${Math.round((av.faites / av.prevues) * 100)}%` }} /></span>}
        <div className="ec-prog-noire__duo">
          <p>{progres ? <><b>{frNombre(progres.ecart, true)} kg</b><span>au {progres.nom.toLowerCase()}</span></> : <><b>—</b><span>vos progrès de charge</span></>}</p>
          <p>{poids !== null ? <><b>{frNombre(poids, true)} kg</b><span>de poids</span></> : <><b>—</b><span>ajoutez deux pesées</span></>}</p>
        </div>
      </section>
      <MaProgression uid={uid} programme={programme} programmes={programmes} faites={faites} seances={seances} records={recs} />
    </div>
  )
}
