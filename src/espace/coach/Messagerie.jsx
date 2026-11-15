import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ecouterConversations } from '../depots.js'
import { heureMessage, jourMessage, nonLu } from '../donnees/messages.js'
import { useDonneesCoach } from './donneesCoach.js'
import Discussion from '../Discussion.jsx'
import PhotoCoache from './PhotoCoache.jsx'

// Discussions de Marie avec ses coachés : non lues d'abord, puis la plus récente
export function useConversations() {
  const [conversations, setConversations] = useState(null)
  useEffect(() => ecouterConversations(setConversations, () => setConversations(new Map())), [])
  return conversations
}

const millis = (t) => t?.toMillis?.() ?? 0

// Page « Messages » du coach (15 novembre 2026) : la liste des coachés à gauche, la discussion à droite (une à la fois sur téléphone)
export default function Messagerie() {
  const { uid } = useParams()
  const { clients, programmes } = useDonneesCoach()
  const conversations = useConversations()
  const liste = (clients ?? [])
    .filter((c) => c.statut !== 'invité' || conversations?.has(c.uid))
    .map((c) => ({ ...c, conv: conversations?.get(c.uid) ?? null }))
    .sort((a, b) => (nonLu(b.conv, 'coach') - nonLu(a.conv, 'coach')) || (millis(b.conv?.dernier?.le) - millis(a.conv?.dernier?.le))
      || `${a.prenom} ${a.nom}`.localeCompare(`${b.prenom} ${b.nom}`, 'fr'))
  const choisi = uid ? (clients ?? []).find((c) => c.uid === uid) : null
  const siens = (programmes ?? []).filter((p) => p.client === uid && p.statut === 'publié')

  return (
    <section className="section section--coach">
      <div className="conteneur espace-coach">
        <div className={`messagerie${uid ? ' messagerie--ouverte' : ''}`}>
          <div className="messagerie__liste">
            <h1 className="espace-titre messagerie__titre">Messages</h1>
            {clients === null || conversations === null ? <p className="espace-aide" role="status">Chargement…</p>
              : liste.length === 0 ? <p className="espace-aide">Aucun coaché pour l’instant.</p> : (
                <ul className="messagerie__coaches">
                  {liste.map((c) => {
                    const d = c.conv?.dernier
                    const neuf = nonLu(c.conv, 'coach')
                    return (
                      <li key={c.uid}>
                        <Link to={`/espace/coach/messages/${c.uid}`} className={`messagerie__coache${c.uid === uid ? ' est-choisi' : ''}${neuf ? ' est-neuf' : ''}`} aria-current={c.uid === uid ? 'page' : undefined}>
                          <PhotoCoache client={c} taille={44} />
                          <span className="messagerie__qui">
                            <span className="messagerie__nom">{c.prenom} {c.nom}</span>
                            <span className="messagerie__apercu">{d ? `${d.auteur === 'coach' ? 'Vous : ' : ''}${d.texte}` : 'Pas encore de message'}</span>
                          </span>
                          <span className="messagerie__quand">
                            {d && <span>{quand(millis(d.le))}</span>}
                            {neuf && <span className="messagerie__point" aria-label="Non lu" />}
                          </span>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
          </div>
          <div className="messagerie__fil">
            {choisi ? (
              <>
                <div className="messagerie__entete">
                  <Link to="/espace/coach/messages" className="messagerie__retour" aria-label="Retour à la liste">←</Link>
                  <PhotoCoache client={choisi} taille={36} />
                  <span className="messagerie__entete-nom">{choisi.prenom} {choisi.nom}</span>
                  <Link to={`/espace/coach/clients/${choisi.uid}`} className="lien-souligne">Voir la fiche</Link>
                </div>
                <Discussion key={choisi.uid} uid={choisi.uid} role="coach" autre={choisi.prenom || 'votre coaché'} programmes={siens} lienPiece={lienCoach(choisi.uid)} classe="disc--coach" />
              </>
            ) : (
              <div className="messagerie__rien">
                <p>Choisissez un coaché pour lire ou écrire un message.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function quand(ms) {
  const j = jourMessage(ms)
  return j === 'Aujourd’hui' ? heureMessage(ms) : j === 'Hier' ? 'Hier' : j.split(' ').slice(1, 3).join(' ')
}

export function lienCoach(uid) {
  return (piece) => (piece.type === 'seance' || piece.type === 'programme' ? `/espace/coach/clients/${uid}/programme` : null)
}
