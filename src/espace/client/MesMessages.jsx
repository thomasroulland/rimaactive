import Discussion from '../Discussion.jsx'

// Page « Messages » du coaché (15 novembre 2026) : la discussion avec Marie
export default function MesMessages({ uid, programmes }) {
  return (
    <div className="ec-page ec-messages">
      <header className="ec-messages__tete">
        <h1 className="ec-h1">Messages</h1>
        <p className="ec-texte ec-gris">Votre discussion avec Marie. Elle vous répond dès qu’elle peut.</p>
      </header>
      <Discussion uid={uid} role="client" autre="Marie" programmes={programmes} classe="disc--page" lienPiece={lienClient} />
    </div>
  )
}

function lienClient(piece) {
  if (piece.type === 'seance') return `/espace/seance/${piece.programmeId}/${piece.seanceId}`
  if (piece.type === 'programme') return '/espace/programme'
  return null
}
