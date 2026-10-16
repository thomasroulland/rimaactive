// Emplacement photo grisé, à remplacer par une vraie image
export default function Photo({ label, legende, enBas = false, className = '' }) {
  return (
    <div
      role="img"
      aria-label={`Emplacement photo : ${label}`}
      className={`photo ${enBas ? 'photo--legende-bas' : ''} ${className}`}
    >
      {legende}
    </div>
  )
}
