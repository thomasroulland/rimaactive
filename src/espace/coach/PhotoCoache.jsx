import { useUrlAvatar } from '../client/Avatar.jsx'
import { initiales } from '../donnees/progression.js'

// Photo de profil d'un coaché (vue coach) : sa photo si elle existe, sinon ses initiales. Décorative : le nom est écrit à côté.
// teinte des initiales, toujours la même pour un coaché (couleurs douces de la charte)
const TEINTES = ['jaune', 'vermillon']
const teinte = (c) => TEINTES[[...`${c?.prenom ?? ''}${c?.nom ?? ''}`].reduce((t, ch) => t + ch.charCodeAt(0), 0) % TEINTES.length]

export default function PhotoCoache({ client, taille = 40, classe = '' }) {
  const url = useUrlAvatar(client?.avatar)
  return (
    <span className={`photo-coache photo-coache--${teinte(client)} ${classe}`} aria-hidden="true" style={{ '--taille': `${taille}px` }}>
      {url
        ? <img src={url} alt="" className="photo-coache__img" loading="lazy" />
        : <span className="photo-coache__initiales">{initiales(client?.prenom, client?.nom)}</span>}
    </span>
  )
}
