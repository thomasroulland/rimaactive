import { useState } from 'react'
import { activerNotifications, etatNotifications } from '../notifications.js'

const CLE = 'rima-carte-notifs'
const lire = () => { try { return localStorage.getItem(CLE) } catch { return null } }
const ecrire = (v) => { try { localStorage.setItem(CLE, v) } catch { /* rien */ } }

// Carte du tableau de bord (choix de Thomas, 19 novembre 2026) : proposer les notifications « nouveau programme ».
// Elle disparaît une fois activée ou fermée. Sur iPhone, hors application installée, elle explique comment l'installer.
export default function CarteNotifications({ uid }) {
  const [etat, setEtat] = useState(() => (lire() ? 'cachee' : etatNotifications()))
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')
  if (etat !== 'possible' && etat !== 'installer' && etat !== 'activee') return null
  const fermer = () => { ecrire('fermee'); setEtat('cachee') }
  async function activer() {
    setEnvoi(true); setErreur('')
    try {
      const ok = await activerNotifications(uid)
      if (ok) { ecrire('activee'); setEtat('activee') } else { ecrire('refusee'); setEtat('cachee') }
    } catch {
      setErreur('Impossible d’activer les notifications pour l’instant. Réessayez plus tard.')
    } finally { setEnvoi(false) }
  }
  return (
    <section className="ec-notifs" aria-labelledby="titre-notifs" role={etat === 'activee' ? 'status' : undefined}>
      <span className="ec-notifs__picto" aria-hidden="true">
        <svg viewBox="0 0 256 256" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"><path d="M96 216h64M56 104a72 72 0 0 1 144 0c0 36 8 56 16 72H40c8-16 16-36 16-72Z" /></svg>
      </span>
      <div className="ec-notifs__texte">
        <h2 id="titre-notifs" className="ec-notifs__titre">{etat === 'activee' ? 'Notifications activées' : 'Être prévenu des nouveautés'}</h2>
        <p className="ec-notifs__phrase">
          {etat === 'activee' ? 'Vous serez prévenu quand Marie publiera votre prochain programme.'
            : etat === 'installer' ? 'Sur iPhone, ajoutez d’abord l’application à l’écran d’accueil : Partager, puis « Sur l’écran d’accueil ».'
              : 'Une notification quand Marie publie votre nouveau programme.'}
        </p>
        {erreur && <p className="ec-erreur" role="alert">{erreur}</p>}
      </div>
      {etat === 'possible' && <button type="button" className="ec-bouton ec-notifs__activer" onClick={activer} disabled={envoi}>{envoi ? 'Activation…' : 'Activer'}</button>}
      <button type="button" className="ec-notifs__fermer" onClick={fermer} aria-label="Fermer">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
    </section>
  )
}
