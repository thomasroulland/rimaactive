// Le mot de Marie pour la semaine et le RPE visé (Marie, 23 novembre 2026 : ils ne se voyaient nulle part côté coaché).
// Affiché dans « Ma semaine » (tableau de bord), dans Mon programme et au début de la séance.
export default function MotSemaine({ semaine, classe = '' }) {
  const mot = (semaine?.mot ?? '').trim()
  const rpe = String(semaine?.rpe ?? '').trim()
  if (!mot && !rpe) return null
  return (
    <div className={`ec-motsem ${classe}`.trim()}>
      {mot && <p className="ec-motsem__mot"><span className="ec-motsem__qui">Le mot de Marie</span>{mot}</p>}
      {rpe && <p className="ec-motsem__rpe">Effort visé cette semaine <b>RPE {rpe.replace('.', ',')}</b></p>}
    </div>
  )
}
