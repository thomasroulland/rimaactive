import { useEffect, useLayoutEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import Entete from '../../components/Entete.jsx'
import Pied from '../../components/Pied.jsx'
import Connexion from '../Connexion.jsx'
import { lireIndice } from '../indiceSession.js'
import '../coache.css'

// Ce fichier est chargé avec le site (écran d'attente avant l'espace) : il ne doit importer ni Firebase ni le reste de l'espace.

// L'espace (hors coach) s'affiche à ses tailles naturelles : il le dit au script de mise à l'échelle de index.html
// dès son premier rendu et le retire quand il disparaît (voir window.__rimaZoom).
export function EspaceZoom() {
  const { pathname } = useLocation()
  const actif = !/^\/espace\/coach(\/|$)/.test(pathname)
  useLayoutEffect(() => {
    window.__rimaZoom?.(actif)
    return () => window.__rimaZoom?.(false)
  }, [actif])
  return null
}

// Premier écran de /espace, pendant le chargement du code de l'espace : la barre noire et le squelette.
export function SqChargementEspace() {
  // personne n'est connecté sur cet appareil : la connexion tout de suite, sans écran d'attente
  if (!lireIndice()) {
    return (
      <div className="ec-coque ec-coque--client">
        <Entete />
        <main id="contenu" className="ec-main"><Connexion /></main>
        <Pied />
      </div>
    )
  }
  return (
    <div className="ec-coque">
      <Entete liens={[]} ecrire={false} accueil="/espace" rangee compte={null} />
      <main className="ec-main"><Squelette /></main>
      <Pied />
    </div>
  )
}

// Squelettes qui se suivent (page d'attente, puis session, puis données) : le suivant s'affiche tout de suite et
// la brillance continue au même endroit (phase prise sur l'horloge), sans blanc ni redémarrage.
let enCours = 0
let dejaVu = false

// Squelettes de chargement du coaché : des formes grises, de la taille des vrais éléments, qui brillent doucement.
// La zone annonce « Chargement… » aux lecteurs d'écran ; les formes, elles, sont cachées (aria-hidden).

// Une forme grise. `l` : largeur (défaut : toute la largeur), `h` : hauteur (null : la hauteur vient du CSS), `r` : 'rond', 'pilule', 16 ou 24 (arrondi des cartes).
export function Forme({ l = '100%', h = 16, r, className = '' }) {
  const classe = ['ec-sq', r && `ec-sq--${r}`, className].filter(Boolean).join(' ')
  return <span className={classe} style={h === null ? { width: l } : { width: l, height: h }} />
}

// Zone annoncée : `classe` (ex. « ec-page ») pose la mise en page de la page, `interieur` celle du contenu.
function Zone({ classe = 'ec-page', interieur, children }) {
  const [direct] = useState(() => dejaVu) // un squelette est déjà passé juste avant : pas de délai
  const [decalage] = useState(() => `-${Math.round(performance.now() % 1600)}ms`)
  useEffect(() => {
    enCours += 1
    dejaVu = true
    return () => {
      enCours -= 1
      setTimeout(() => { if (enCours === 0) dejaVu = false }, 300)
    }
  }, [])
  return (
    <div className={`${classe} ec-sq-zone${direct ? ' ec-sq-zone--direct' : ''}`} style={{ '--sq-decalage': decalage }} role="status">
      <span className="ec-invisible">Chargement…</span>
      <div className={interieur} aria-hidden="true">{children}</div>
    </div>
  )
}

const Ligne = ({ l, h = 16 }) => <Forme l={l} h={h} />

function Tete() {
  return (
    <div className="ec-tdb__tete">
      <div className="ec-tdb__qui">
        <Forme l={64} h={64} r="rond" />
        <div className="ec-tdb__texte">
          <Ligne l={120} h={20} />
          <Forme l="min(320px, 70vw)" h={40} />
        </div>
      </div>
      <Forme l="min(560px, 100%)" h={8} r="pilule" />
    </div>
  )
}

function Onglets() {
  return (
    <div className="ec-sq-onglets">
      <Forme l={130} h={20} />
      <Forme l={140} h={20} />
    </div>
  )
}

function Semaine() {
  return (
    <div className="ec-sq-carte ec-sq-carte--24 ec-sq-semaine">
      <Forme l={140} h={24} />
      {[0, 1, 2].map((i) => (
        <div key={i} className="ec-sq-rang">
          <Forme l={24} h={24} r={6} />
          <div className="ec-sq-col"><Ligne l={80} h={18} /><Ligne l="min(260px, 70%)" h={16} /></div>
          <Forme l={56} h={16} />
        </div>
      ))}
    </div>
  )
}

function Rubriques() {
  return (
    <div className="ec-rubriques">
      {[220, 180, 150].map((l, i) => (
        <div key={i} className="ec-sq-rubrique">
          <div className="ec-sq-rubrique__tete"><Forme l={l} h={30} /><Forme l={32} h={32} r="rond" /></div>
          <div className="ec-sq-carte">
            <Ligne l="40%" h={18} />
            <Ligne h={14} />
            <Ligne l="75%" h={14} />
          </div>
        </div>
      ))}
    </div>
  )
}

function Tableau({ progression }) {
  return (
    <Zone interieur="ec-tdb">
      <Tete />
      <span className="ec-sq ec-sq--24 ec-sq-noire" />
      <Onglets />
      {progression ? <Rubriques /> : <Semaine />}
    </Zone>
  )
}

function CarteSeance() {
  return (
    <div className="ec-sq-carte ec-sq-carte--rang">
      <Forme l={40} h={34} />
      <div className="ec-sq-col"><Ligne l="70%" h={20} /><Ligne l={70} h={16} /><Ligne l="50%" h={16} /></div>
      <Forme l={56} h={16} />
    </div>
  )
}

function Programme() {
  return (
    <Zone interieur="ec-prog">
      <div className="ec-prog__tete">
        <Forme l={140} h={12} />
        <Forme l="min(280px, 70vw)" h={44} />
      </div>
      <div className="ec-prog__rubrique">
        <Forme l={160} h={28} />
        <div className="ec-sq-frise">
          <Forme h={null} /><Forme h={null} /><Forme h={null} />
        </div>
      </div>
      <div className="ec-prog__rubrique">
        <Forme l={180} h={28} />
        <div className="ec-sq-pastilles">
          {[0, 1, 2, 3].map((i) => <Forme key={i} l={52} h={44} r="pilule" />)}
        </div>
        <div className="ec-prog__seances">
          {[0, 1, 2].map((i) => <CarteSeance key={i} />)}
        </div>
      </div>
    </Zone>
  )
}

function Exercice() {
  return (
    <div className="ec-sq-carte" style={{ gap: 14 }}>
      <div className="ec-sq-rang" style={{ alignItems: 'flex-start' }}>
        <div className="ec-sq-col" style={{ gap: 10 }}><Ligne l={30} h={22} /><Ligne l="60%" h={20} /><Ligne l="40%" h={18} /></div>
        <Forme l={96} h={96} r={12} />
      </div>
      <div className="ec-sq-cases">{[0, 1, 2, 3, 4].map((i) => <Forme key={i} h={44} r={10} />)}</div>
    </div>
  )
}

function Seance() {
  return (
    <Zone interieur="ec-seance">
      <Forme l={130} h={20} />
      <div className="ec-seance__titres">
        <Forme l={170} h={12} />
        <Forme l="min(520px, 80vw)" h={44} />
      </div>
      <div className="ec-seance__infos">
        {[0, 1, 2].map((i) => (
          <div key={i} className="ec-sq-rang" style={{ padding: '12px 0', borderTop: '1px solid var(--ec-repli-filet)' }}>
            <Forme l={22} h={22} r="rond" />
            <div className="ec-sq-col" style={{ gap: 6 }}><Ligne l={50} h={14} /><Ligne l="70%" h={16} /></div>
          </div>
        ))}
      </div>
      <div className="ec-sq-seance-corps">
        <div className="ec-sq-seance-gauche">
          {[0, 1].map((b) => (
            <div key={b} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ paddingBottom: 8, borderBottom: '1px solid var(--ec-bloc-filet)' }}><Forme l={110} h={24} /></div>
              <Exercice />
              <Exercice />
            </div>
          ))}
        </div>
        <div className="ec-sq-seance-droite">
          <div className="ec-sq-carte ec-sq-carte--24" style={{ gap: 16 }}>
            <Forme l={160} h={24} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(0, 1fr))', gap: 6 }}>
              {[0, 1, 2, 3, 4, 5].map((i) => <Forme key={i} h={48} r={12} />)}
            </div>
            <Forme h={96} r={10} />
            <Forme h={48} r="pilule" />
          </div>
        </div>
      </div>
    </Zone>
  )
}

// Petits squelettes des rubriques « Mes photos » et « Mes mesures » (chargées à part)
export function SqGalerie() {
  return (
    <Zone classe="ec-sq-fond" interieur="ec-galerie">
      {[0, 1, 2].map((i) => (
        <div key={i} className="ec-sq-carte" style={{ padding: 10 }}>
          <Forme h={null} className="ec-sq--photo" />
          <Ligne l="60%" h={16} />
        </div>
      ))}
    </Zone>
  )
}

export function SqTableau() {
  return (
    <Zone classe="ec-sq-fond" interieur="ec-sq-carte">
      {[0, 1, 2].map((i) => <Ligne key={i} h={20} />)}
    </Zone>
  )
}

// Le bon squelette selon l'adresse : séance, programme, ou tableau de bord (partie « Ma progression » comprise).
export default function Squelette() {
  const { pathname, search } = useLocation()
  if (pathname.startsWith('/espace/seance/')) return <Seance />
  if (pathname.startsWith('/espace/programme')) return <Programme />
  return <Tableau progression={new URLSearchParams(search).get('onglet') === 'progression'} />
}
