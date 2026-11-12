// Une série : répétitions, charge, RPE (champs de 48 px, clavier numérique sur téléphone) et case « Fait ».
// Modifier un champ coche la série ; une série pré-remplie jamais cochée est enregistrée « non faite ».
export default function LigneSerie({ id, numero, ligne, lecture, changer }) {
  const champ = (cle, libelle, mode) => (
    <input id={`${id}-${cle}`} className="champ client-serie__champ" type="text" inputMode={mode} autoComplete="off"
      aria-label={`Série ${numero}, ${libelle}`} value={ligne[cle] ?? ''} readOnly={lecture}
      onChange={(e) => changer(cle, e.target.value)} />
  )
  return (
    <div className="client-serie">
      <span className="client-serie__num" aria-hidden="true">{numero}</span>
      {champ('reps', 'répétitions', 'numeric')}
      {champ('charge', 'charge en kg', 'decimal')}
      {champ('rpe', 'RPE', 'decimal')}
      <label className="client-serie__fait">
        <input id={`${id}-fait`} type="checkbox" checked={!!ligne.fait} disabled={lecture}
          aria-label={`Série ${numero}, faite`} onChange={(e) => changer('fait', e.target.checked)} />
      </label>
    </div>
  )
}
