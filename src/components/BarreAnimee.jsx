import { Photo } from './Blocs.jsx'

// Un bout de la barre : manchon, butée et deux disques corail
function Bout() {
  return (
    <g className="barre__bout">
      <rect x="4" y="59" width="150" height="14" fill="#4b4641" />
      <rect x="140" y="48" width="14" height="36" fill="#161514" />
      <rect x="106" y="0" width="32" height="132" fill="#ff6447" />
      <rect x="110" y="4" width="24" height="124" fill="none" stroke="#d9452a" strokeWidth="3" />
      <rect x="76" y="14" width="28" height="104" fill="#ff6447" />
      <rect x="80" y="18" width="20" height="96" fill="none" stroke="#d9452a" strokeWidth="3" />
      <rect x="58" y="36" width="16" height="60" fill="#161514" />
      <rect x="40" y="50" width="16" height="32" fill="#4b4641" />
    </g>
  )
}

// Arrivée sur le site : la barre se soulève et dévoile la photo
export default function BarreAnimee() {
  return (
    <div className="barre-scene">
      <div className="barre-ombre" aria-hidden="true" />
      <Photo className="barre-photo" label="Photo de Marie en séance" sombre />
      <svg className="barre" aria-hidden="true" viewBox="0 0 640 132">
        <Bout />
        <rect x="154" y="61" width="332" height="10" fill="#161514" />
        <rect x="246" y="61" width="40" height="10" fill="#4b4641" />
        <rect x="354" y="61" width="40" height="10" fill="#4b4641" />
        <g transform="translate(640 0) scale(-1 1)">
          <Bout />
        </g>
      </svg>
    </div>
  )
}
