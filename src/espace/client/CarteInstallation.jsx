import { useEffect, useRef, useState } from 'react'
import { installee, installer, invitationPrete, suivreInvitation, surAndroid, surIphone } from '../../components/installation.js'

const CLE = 'rima-carte-installer'
const lire = () => { try { return localStorage.getItem(CLE) } catch { return null } }
const ecrire = (v) => { try { localStorage.setItem(CLE, v) } catch { /* rien */ } }

// « Installer l'application » (maquette validée par Marie, 22 novembre 2026) : une petite bulle, le titre souligné ;
// la toucher ouvre le navigateur d'installation (Android, ordinateur) ou un panneau avec les étapes (iPhone, ou Android
// quand le navigateur ne propose rien). La croix la ferme pour de bon. Cachée dans l'application installée.
export default function CarteInstallation() {
  const [, rafraichir] = useState(0)
  const [fermee, setFermee] = useState(() => lire() === 'fermee' || installee())
  const [tuto, setTuto] = useState(false)
  useEffect(() => suivreInvitation(() => rafraichir((n) => n + 1)), [])
  if (fermee) return null
  const iphone = surIphone()
  const bouton = invitationPrete()
  if (!iphone && !bouton && !surAndroid()) return null // ordinateur sans proposition du navigateur : rien à expliquer
  const fermer = () => { ecrire('fermee'); setFermee(true) }
  const ouvrir = async () => {
    if (bouton) { if (await installer()) fermer(); return }
    setTuto(true)
  }
  return (
    <>
      <section className="ec-installer2" aria-label="Installer l’application">
        <span className="ec-installer2__picto" aria-hidden="true">
          <svg viewBox="0 0 256 256" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round"><rect x="64" y="24" width="128" height="208" rx="20" /><path d="M128 72v72M100 116l28 28 28-28M108 196h40" /></svg>
        </span>
        <button type="button" className="ec-installer2__lien" onClick={ouvrir} aria-haspopup={bouton ? undefined : 'dialog'}>Installer l’application</button>
        <button type="button" className="ec-installer2__fermer" onClick={fermer} aria-label="Ne plus afficher">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </section>
      {tuto && <Tuto iphone={iphone} fermer={() => setTuto(false)} />}
    </>
  )
}

// Panneau du bas : les étapes, un onglet iPhone et un onglet Android
function Tuto({ iphone, fermer }) {
  const [onglet, setOnglet] = useState(iphone ? 'iphone' : 'android')
  const ref = useRef(null)
  useEffect(() => {
    const d = ref.current
    if (d && !d.open) d.showModal()
    return () => { if (d?.open) d.close() }
  }, [])
  const etapes = onglet === 'iphone'
    ? [
      <>Appuyez sur les <b>3 barres</b> <Ic>☰</Ic> en bas à gauche</>,
      <>Appuyez sur <b>Partager</b> <Ic><Partager /></Ic></>,
      <>Appuyez sur <b>En voir plus</b> <Ic>⌄</Ic></>,
      <>Choisissez <b>Sur l’écran d’accueil</b> <Ic>＋</Ic></>,
    ]
    : [
      <>Ouvrez le menu <b>⋮</b> du navigateur, en haut à droite</>,
      <>Choisissez <b>Installer l’application</b> ou <b>Ajouter à l’écran d’accueil</b></>,
      <>Appuyez sur <b>Installer</b></>,
    ]
  return (
    <dialog ref={ref} className="ec-tuto" aria-labelledby="tuto-titre" onClose={fermer} onClick={(e) => { if (e.target === e.currentTarget) fermer() }}>
      <div className="ec-tuto__corps">
        <span className="ec-tuto__poignee" aria-hidden="true" />
        <h2 id="tuto-titre" className="ec-tuto__titre">Installer l’application</h2>
        <div className="ec-tuto__onglets" role="group" aria-label="Votre téléphone">
          <button type="button" aria-pressed={onglet === 'iphone'} onClick={() => setOnglet('iphone')}>iPhone</button>
          <button type="button" aria-pressed={onglet === 'android'} onClick={() => setOnglet('android')}>Android</button>
        </div>
        <ol className="ec-tuto__etapes">
          {etapes.map((e, i) => <li key={`${onglet}-${i}`}><span className="ec-tuto__num">{i + 1}</span><span>{e}</span></li>)}
        </ol>
        <button type="button" className="ec-bouton ec-tuto__ok" onClick={fermer}>J’ai compris</button>
      </div>
    </dialog>
  )
}

const Ic = ({ children }) => <span className="ec-tuto__ic" aria-hidden="true">{children}</span>
function Partager() {
  return <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15V3M8 7l4-4 4 4" /><path d="M8 11H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-2" /></svg>
}
