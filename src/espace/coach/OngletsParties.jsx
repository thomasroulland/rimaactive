// Onglets des parties de la banque (15 novembre 2026) : « Tout », puis « Échauffement », « Séance »…
export default function OngletsParties({ parties, valeur, changer, compte }) {
  return (
    <div className="onglets-parties" role="tablist" aria-label="Partie de la banque">
      {['Tout', ...parties].map((p) => (
        <button key={p} type="button" role="tab" className="onglets-parties__onglet" aria-selected={valeur === p} onClick={() => changer(p)}>
          {p}{compte && <span className="onglets-parties__nb">{compte(p)}</span>}
        </button>
      ))}
    </div>
  )
}
