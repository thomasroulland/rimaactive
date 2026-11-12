import { champResultat, fr } from '../donnees/seances.js'

// Valeurs du RPE (maquette) : – , 5 à 10 par demi-points
export const VALEURS_RPE = ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10']

// Liste « RPE » : une ancienne valeur hors liste (« 7,5 » ou « 4 ») reste affichée
export function ChoixRpe({ id, valeur, changer, lecture, libelle, classe = 'ec-champ ec-champ--serre' }) {
  const v = String(valeur ?? '').replace(',', '.').trim()
  const options = v && !VALEURS_RPE.includes(v) ? [v, ...VALEURS_RPE] : VALEURS_RPE
  return (
    <select id={id} className={classe} aria-label={libelle} value={v} disabled={lecture} onChange={(e) => changer(e.target.value)}>
      <option value="">–</option>
      {options.map((o) => <option key={o} value={o}>{fr(o)}</option>)}
    </select>
  )
}

// « Mon résultat » d'un bloc EMOM, AMRAP, TABATA ou HIIT (maquette) :
// minutes réussies ou tours faits, RPE du bloc, case « Bloc fait », note. Enregistré dans `blocs[bloc.id]`.
export default function BlocResultat({ bloc, resultat, lecture, changer }) {
  const champ = champResultat(bloc)
  const r = resultat ?? {}
  const id = `res-${bloc.id}`
  return (
    <div className="ec-resultat" role="group" aria-labelledby={`${id}-titre`}>
      <p id={`${id}-titre`} className="ec-resultat__titre">Mon résultat<span className="ec-invisible"> : bloc {bloc.lettre}</span></p>
      <div className="ec-resultat__ligne">
        {champ && (
          <div>
            <label className="ec-etiquette" htmlFor={`${id}-res`}>{champ.label}</label>
            <input id={`${id}-res`} className="ec-champ ec-champ--serre" type="text" inputMode="numeric" autoComplete="off"
              value={r.resultat ?? ''} placeholder={lecture ? '' : champ.aide} readOnly={lecture} onChange={(e) => changer('resultat', e.target.value)} />
          </div>
        )}
        <div>
          <label className="ec-etiquette" htmlFor={`${id}-rpe`}>RPE du bloc</label>
          <ChoixRpe id={`${id}-rpe`} valeur={r.rpe} lecture={lecture} changer={(v) => changer('rpe', v)} />
        </div>
        <div className="ec-resultat__fait">
          <input id={`${id}-fait`} type="checkbox" className="ec-case-fait" checked={!!r.fait} disabled={lecture}
            onChange={(e) => changer('fait', e.target.checked)} />
          <label htmlFor={`${id}-fait`}>Bloc fait</label>
        </div>
      </div>
      <div>
        <label className="ec-etiquette" htmlFor={`${id}-note`}>Note</label>
        <input id={`${id}-note`} className="ec-champ" type="text" autoComplete="off" value={r.note ?? ''} readOnly={lecture}
          onChange={(e) => changer('note', e.target.value)} />
      </div>
    </div>
  )
}
