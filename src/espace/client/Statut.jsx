// Petite pilule d'état d'une séance (« Faite » avec une coche, « En cours », « À faire ») et flèche des lignes cliquables.
const CLASSES = { Faite: 'faite', 'En cours': 'encours', 'À faire': 'afaire' }

export function Statut({ statut }) {
  return (
    <span className={`ec-statut ec-statut--${CLASSES[statut] ?? 'afaire'}`}>
      {statut === 'Faite' && (
        <svg width="12" height="12" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="24" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M40 144l56 56L216 80" />
        </svg>
      )}
      {statut}
    </span>
  )
}

// Phosphor « CaretRight » (Light)
export function Chevron() {
  return (
    <svg className="ec-chevron" width="18" height="18" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M96 48l80 80-80 80" />
    </svg>
  )
}
