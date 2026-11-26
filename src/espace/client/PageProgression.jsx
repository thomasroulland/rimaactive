import { useEffect, useState } from 'react'
import { ecouterMesMesures } from '../depots.js'
import { semaineDe } from '../donnees/progression.js'
import { aujourdhuiIso } from '../donnees/calculs.js'
import { chiffresChoisis } from '../donnees/chiffres.js'
import CarteChiffres from './CarteChiffres.jsx'
import MaProgression from './MaProgression.jsx'
import { records } from '../donnees/records.js'
import { exercicesDe } from '../donnees/seances.js'

// Page « Ma progression » : trois chiffres clés, puis les onglets Charges, Séances, Mesures, Photos (refaite le 25 novembre 2026).
export default function PageProgression({ uid, profil, programme, programmes, faites, seances }) {
  const [mesures, setMesures] = useState(null)
  useEffect(() => ecouterMesMesures(uid, setMesures, () => setMesures([])), [uid])
  const sem = programme?.debut && programme.debut <= aujourdhuiIso() ? semaineDe(programme, aujourdhuiIso()) : null
  const { exoIdParElement, noms } = exercicesDe(programmes ?? [])
  const recs = records(seances, exoIdParElement, noms)

  return (
    <div className="ec-page ec-progression ec-progression--v2">
      <header className="ec-progression__tete">
        <h1 className="ec-h1">Ma progression</h1>
      </header>
      <CarteChiffres cles={chiffresChoisis(profil)} ctx={{ programme, programmes, faites, seances, mesures }}
        etiquette={programme ? `Mon programme${sem ? ` · semaine ${sem} sur ${programme.semaines?.length ?? 0}` : ''}` : 'Mon programme'} />
      <MaProgression uid={uid} programme={programme} programmes={programmes} faites={faites} seances={seances} records={recs} />
    </div>
  )
}
