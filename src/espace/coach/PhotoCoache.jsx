import { useUrlAvatar } from '../client/Avatar.jsx'
import { initiales } from '../donnees/progression.js'

// Photo de profil d'un coaché (vue coach) : sa photo si elle existe, sinon ses initiales. Décorative : le nom est écrit à côté.
export default function PhotoCoache({ client, taille = 40, classe = '' }) {
  const url = useUrlAvatar(client?.avatar)
  return (
    <span className={`photo-coache ${classe}`} aria-hidden="true" style={{ '--taille': `${taille}px` }}>
      {url
        ? <img src={url} alt="" className="photo-coache__img" loading="lazy" />
        : <span className="photo-coache__initiales">{initiales(client?.prenom, client?.nom)}</span>}
    </span>
  )
}
