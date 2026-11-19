import { useEffect, useState } from 'react'
import { installee, installer, invitationPrete, suivreInvitation, surAndroid, surIphone } from '../../components/installation.js'

const CLE = 'rima-carte-installer'
const lire = () => { try { return localStorage.getItem(CLE) } catch { return null } }
const ecrire = (v) => { try { localStorage.setItem(CLE, v) } catch { /* rien */ } }

// « Installer l'application » (demande de Thomas, 19 novembre 2026), dans le tableau de bord du coaché, tant que
// l'espace n'est pas ouvert depuis l'application installée. Android / ordinateur : un bouton qui ouvre la fenêtre
// d'installation du navigateur. iPhone : les trois étapes, avec les pictogrammes de Safari.
export default function CarteInstallation() {
  const [, rafraichir] = useState(0)
  const [fermee, setFermee] = useState(() => lire() === 'fermee' || installee())
  useEffect(() => suivreInvitation(() => rafraichir((n) => n + 1)), [])
  if (fermee) return null
  const iphone = surIphone()
  const bouton = invitationPrete()
  const android = surAndroid()
  if (!iphone && !bouton && !android) return null // ordinateur sans proposition du navigateur : rien à expliquer
  const fermer = () => { ecrire('fermee'); setFermee(true) }
  const lancer = async () => { if (await installer()) { ecrire('fermee'); setFermee(true) } }
  return (
    <section className="ec-notifs ec-installer" aria-labelledby="titre-installer">
      <span className="ec-notifs__picto" aria-hidden="true">
        <svg viewBox="0 0 256 256" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"><rect x="64" y="24" width="128" height="208" rx="20" /><path d="M128 72v72M100 116l28 28 28-28M108 196h40" /></svg>
      </span>
      <div className="ec-notifs__texte">
        <h2 id="titre-installer" className="ec-notifs__titre">Installer l’application</h2>
        <p className="ec-notifs__phrase">Votre programme à portée de main, même sans réseau à la salle, et les notifications de Marie.</p>
        {iphone && !bouton && (
          <ol className="ec-installer__etapes">
            <li><span className="ec-installer__num">1</span><span>Dans Safari, touchez <b>Partager</b> <Partager /> <small>(parfois dans le menu ⋯)</small></span></li>
            <li><span className="ec-installer__num">2</span><span>Choisissez <b>Sur l’écran d’accueil</b> <Ajouter /></span></li>
            <li><span className="ec-installer__num">3</span><span>Touchez <b>Ajouter</b>, puis ouvrez Rimaactive depuis l’écran d’accueil</span></li>
          </ol>
        )}
        {!iphone && !bouton && android && (
          <ol className="ec-installer__etapes">
            <li><span className="ec-installer__num">1</span><span>Ouvrez le menu <b>⋮</b> du navigateur</span></li>
            <li><span className="ec-installer__num">2</span><span>Choisissez <b>Installer l’application</b> ou <b>Ajouter à l’écran d’accueil</b></span></li>
          </ol>
        )}
      </div>
      {bouton && <button type="button" className="ec-bouton ec-notifs__activer" onClick={lancer}>Installer</button>}
      <button type="button" className="ec-notifs__fermer" onClick={fermer} aria-label="Fermer">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
      </button>
    </section>
  )
}

function Partager() {
  return <svg className="ec-installer__picto" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-label="(carré avec une flèche vers le haut)" role="img"><path d="M12 15V3M8 7l4-4 4 4" /><path d="M8 11H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-2" /></svg>
}
function Ajouter() {
  return <svg className="ec-installer__picto" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-label="(carré avec un plus)" role="img"><rect x="4" y="4" width="16" height="16" rx="4" /><path d="M12 8v8M8 12h8" /></svg>
}
