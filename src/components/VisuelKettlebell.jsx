// La kettlebell tombe, se pose au sol et laisse voir la photo dans son corps
// (reprise de la « Piste 1 » du canvas Claude Design)
export default function VisuelKettlebell() {
  return (
    <div className="kb-scene">
      <div className="kb-choc">
        <div className="kb">
          <svg role="img" aria-label="Emplacement photo : Marie en séance, dans le corps d'une kettlebell" viewBox="0 0 240 256">
            <defs>
              <clipPath id="photo-kb">
                <path transform="translate(120 174) scale(.95) translate(-120 -174)" d="M120 96 C190 96 232 142 226 192 C223 218 210 238 196 248 L44 248 C30 238 17 218 14 192 C8 142 50 96 120 96 Z" />
              </clipPath>
            </defs>
            <path fillRule="evenodd" fill="#ff6447" d="M50 132 C40 78 42 26 84 14 L156 14 C198 26 200 78 190 132 L162 132 C166 98 166 56 146 46 L94 46 C74 56 74 98 78 132 Z" />
            <path d="M78 132 C74 98 74 56 94 46 L146 46 C166 56 166 98 162 132" fill="none" stroke="#d9452a" strokeWidth="4" />
            <path fill="#ff6447" d="M120 96 C190 96 232 142 226 192 C223 218 210 238 196 248 L44 248 C30 238 17 218 14 192 C8 142 50 96 120 96 Z" />
            <path fill="#d9452a" d="M184 112 C214 130 230 168 226 194 C223 218 212 236 198 248 L182 248 C204 210 206 160 178 120 Z" />
            <g clipPath="url(#photo-kb)">
              <rect x="0" y="90" width="240" height="170" fill="#2a2725" />
              <text x="120" y="182" textAnchor="middle" fontFamily="Hanken Grotesk, system-ui, sans-serif" fontSize="7.5" fontWeight="500" fill="rgba(255,255,255,.72)">Photo de Marie en séance</text>
            </g>
            <rect x="44" y="246" width="152" height="10" fill="#b3341c" />
          </svg>
        </div>
        <div className="kb-sol" aria-hidden="true" />
      </div>
    </div>
  )
}
