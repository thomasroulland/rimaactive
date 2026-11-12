// Une série : répétitions, charge, RPE (champs de 48 px, clavier numérique sur téléphone).
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
    </div>
  )
}
