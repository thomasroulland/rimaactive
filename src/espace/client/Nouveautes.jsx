import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { calculerNouveautes, etatInitial, marquerVu, toutVu } from '../donnees/nouveautes.js'
import { aujourdhuiIso } from '../donnees/calculs.js'
import { dateLongue } from '../donnees/seances.js'

const MAX = 3

// Ce qui est vu est gardé sur cet appareil ; navigation privée ou stockage bloqué : le bandeau marche quand même.
function lire(cle) {
  try { const v = JSON.parse(localStorage.getItem(cle)); return v && typeof v === 'object' ? v : null } catch { return null }
}
function ecrire(cle, v) {
  try { localStorage.setItem(cle, JSON.stringify(v)) } catch { /* rien */ }
}

// « Du nouveau de Marie » (14 novembre 2026) : nouveau programme, programme mis à jour, commentaire sur une séance faite.
export default function Nouveautes({ uid, programmes, seances }) {
  const cle = `rimaactive-nouveautes-${uid}`
  const [vu, setVu] = useState(() => lire(cle) ?? etatInitial({ programmes, seances }))
  useEffect(() => { if (!lire(cle)) ecrire(cle, vu) }, [cle]) // eslint-disable-line react-hooks/exhaustive-deps

  const liste = calculerNouveautes({ programmes, seances, vu })
  if (!liste.length) return null
  const changer = (v) => { ecrire(cle, v); setVu(v) }
  const visibles = liste.slice(0, MAX)
  const reste = liste.length - visibles.length

  // Carte à côté de « Ma semaine » (ordinateur) ou juste en dessous (téléphone) : la semaine reste visible dès l'ouverture.
  return (
    <section className="ec-nouveautes" aria-labelledby="titre-nouveautes">
      <div className="ec-nouveautes__tete">
        {/* « Notifications » (Marie, 22 novembre 2026) ; chaque ligne a sa coche ; « Tout lire » seulement s'il y en a plusieurs */}
        <h2 id="titre-nouveautes" className="ec-nouveautes__titre"><span className="ec-nouveautes__point" aria-hidden="true" />Notifications</h2>
        {liste.length > 1 && <button type="button" className="ec-lien ec-lien--petit" onClick={() => changer(toutVu({ programmes, seances }))}>Tout marquer comme lu</button>}
      </div>
      <ul className="ec-nouveautes__liste">
        {visibles.map((n) => <Ligne key={n.cle} n={n} programmes={programmes} vue={() => changer(marquerVu(vu, n))} />)}
      </ul>
      {reste > 0 && <p className="ec-texte ec-gris ec-nouveautes__reste">Et {reste} autre{reste > 1 ? 's' : ''} nouveauté{reste > 1 ? 's' : ''}.</p>}
    </section>
  )
}

function Ligne({ n, programmes, vue }) {
  if (n.genre === 'commentaire') {
    const s = n.seance
    const existe = (programmes ?? []).some((p) => p.id === s.programme)
    return (
      <li className="ec-nouveaute ec-nouveaute--coche">
        <div className="ec-nouveaute__corps">
          <p className="ec-nouveaute__quoi">Marie a commenté votre séance du {dateLongue(s.date)}</p>
          <p className="ec-nouveaute__mot">« {n.texte} »</p>
          {existe && <Link className="ec-lien ec-lien--petit" to={`/espace/seance/${s.programme}/${s.seance}`} onClick={vue}>Revoir la séance</Link>}
        </div>
        <Lu vue={vue} />
      </li>
    )
  }
  const p = n.programme
  const nb = p.semaines?.length ?? 0
  // plus de « Jetez un œil… » pour une mise à jour (Marie, 22 novembre 2026)
  const detail = n.genre === 'modif'
    ? ''
    : p.debut > aujourdhuiIso() ? `${nb} semaine${nb > 1 ? 's' : ''}, à partir du ${dateLongue(p.debut)}.` : `${nb} semaine${nb > 1 ? 's' : ''}, c’est parti !`
  return (
    <li className="ec-nouveaute ec-nouveaute--coche">
      <div className="ec-nouveaute__corps">
        <p className="ec-nouveaute__quoi">{n.genre === 'modif' ? `Marie a mis à jour « ${p.nom} »` : `Nouveau programme : « ${p.nom} »`}</p>
        {detail && <p className="ec-texte ec-gris">{detail}</p>}
        <Link className="ec-lien ec-lien--petit" to="/espace/programme" onClick={vue}>Voir mon programme</Link>
      </div>
      <Lu vue={vue} />
    </li>
  )
}

// Coche verte sur fond clair : la notification est lue et disparaît
function Lu({ vue }) {
  return (
    <button type="button" className="ec-lu" onClick={vue} aria-label="Marquer comme lu" title="Marquer comme lu">
      <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
    </button>
  )
}
