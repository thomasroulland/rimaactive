import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ecouterConversation, ecouterMessages, envoyerMessage, marquerLu } from './depots.js'
import { heureMessage, jourMessage, nonLu, piecesPossibles } from './donnees/messages.js'
import { messageErreur } from './erreurs.js'
import PhotoStockee from './coach/PhotoStockee.jsx'
import Consignes from './client/Consignes.jsx'

const FORMATS = 'image/jpeg,image/png,image/webp,image/heic,image/heif'

// Discussion en direct entre Marie et un coaché (15 novembre 2026), la même des deux côtés.
// uid : le coaché ; role : 'coach' ou 'client' ; autre : nom affiché de l'autre ; programmes : ceux qu'on peut joindre ;
// lienPiece(piece) : adresse d'une séance ou d'un programme joint (selon le côté).
export default function Discussion({ uid, role, autre, programmes, lienPiece, classe = '' }) {
  const [messages, setMessages] = useState(null)
  const [conversation, setConversation] = useState(undefined)
  const [erreur, setErreur] = useState('')
  const [fiche, setFiche] = useState(null)
  const fil = useRef(null)

  useEffect(() => {
    const echec = () => setErreur('Impossible de charger la discussion. Vérifiez votre connexion.')
    const a = ecouterMessages(uid, setMessages, echec)
    const b = ecouterConversation(uid, setConversation, echec)
    return () => { a(); b() }
  }, [uid])

  // Discussion ouverte : ce que l'autre a écrit est lu
  useEffect(() => {
    if (conversation && nonLu(conversation, role) && document.visibilityState === 'visible') marquerLu(uid, role)
  }, [conversation, role, uid])

  // Toujours en bas : le dernier message est visible
  const nb = messages?.length ?? 0
  useEffect(() => {
    const f = fil.current
    if (f) f.scrollTop = f.scrollHeight
  }, [nb])

  // une photo qui finit de charger agrandit le fil : on reste en bas
  const enBas = () => { const f = fil.current; if (f) f.scrollTop = f.scrollHeight }

  const elements = useMemo(() => {
    const m = new Map()
    for (const p of programmes ?? []) for (const sem of p.semaines ?? []) for (const s of sem.seances ?? []) for (const b of s.blocs ?? []) for (const el of b.elements ?? []) m.set(`${p.id}/${el.id}`, el)
    return m
  }, [programmes])
  const ouvrir = (piece) => setFiche(elements.get(`${piece.programmeId}/${piece.elementId}`) ?? null)

  return (
    <section className={`disc ${classe}`} aria-label={`Discussion avec ${autre}`}>
      <div className="disc__fil" ref={fil} role="log" aria-live="polite" aria-relevant="additions" onLoadCapture={enBas}>
        {messages === null && !erreur && <p className="disc__vide" role="status">Chargement…</p>}
        {erreur && <p className="disc__vide disc__vide--erreur" role="alert">{erreur}</p>}
        {messages?.length === 0 && (
          <div className="disc__vide">
            <p className="disc__vide-titre">Écrivez à {autre}</p>
            <p>{role === 'client'
              ? 'Une question sur une séance, un exercice ou votre programme ? Posez-la ici, vous pouvez joindre une séance, un exercice ou une photo.'
              : 'Un conseil, un encouragement, une précision sur une séance : joignez une séance, un exercice, un programme ou une photo.'}</p>
          </div>
        )}
        {(messages ?? []).map((m, i) => {
          const jour = jourMessage(m.envoyeLe)
          const nouveauJour = i === 0 || jourMessage(messages[i - 1].envoyeLe) !== jour
          const moi = m.auteur === role
          return (
            <div key={m.id} className="disc__groupe">
              {nouveauJour && <p className="disc__jour"><span>{jour}</span></p>}
              <div className={`disc__msg ${moi ? 'disc__msg--moi' : 'disc__msg--autre'}`}>
                <span className="sr-only">{moi ? 'Vous' : autre} :</span>
                {m.photo && <PhotoMessage chemin={m.photo} />}
                {m.piece && <Piece piece={m.piece} lien={lienPiece} ouvrir={ouvrir} />}
                {m.texte && <p className="disc__texte">{m.texte}</p>}
                <span className="disc__heure">{m.enAttente ? 'Envoi…' : heureMessage(m.envoyeLe)}</span>
              </div>
            </div>
          )
        })}
      </div>
      <Saisie uid={uid} role={role} programmes={programmes} />
      <Consignes element={fiche} fermer={() => setFiche(null)} />
    </section>
  )
}

function PhotoMessage({ chemin }) {
  return <PhotoStockee chemin={chemin} alt="Photo envoyée" classe="disc__photo" vide="Photo indisponible" />
}

const PICTOS = {
  seance: 'M4 7h16M4 12h16M4 17h10',
  exercice: 'M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12',
  programme: 'M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z',
}
const TYPES = { seance: 'Séance', exercice: 'Exercice', programme: 'Programme' }

function PictoPiece({ type }) {
  return (
    <span className="disc-piece__picto" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={PICTOS[type] ?? PICTOS.seance} /></svg>
    </span>
  )
}

function Piece({ piece, lien, ouvrir }) {
  const contenu = (
    <>
      <PictoPiece type={piece.type} />
      <span className="disc-piece__texte">
        <span className="disc-piece__type">{TYPES[piece.type] ?? 'Pièce jointe'}</span>
        <span className="disc-piece__titre">{piece.titre}</span>
        {piece.sousTitre && <span className="disc-piece__sous">{piece.sousTitre}</span>}
      </span>
    </>
  )
  if (piece.type === 'exercice') return <button type="button" className="disc-piece" onClick={() => ouvrir(piece)}>{contenu}</button>
  const to = lien?.(piece)
  return to ? <Link className="disc-piece" to={to}>{contenu}</Link> : <span className="disc-piece">{contenu}</span>
}

// Zone de saisie : texte, « + » pour joindre (photo, séance, exercice, programme), envoyer.
function Saisie({ uid, role, programmes }) {
  const [texte, setTexte] = useState('')
  const [piece, setPiece] = useState(null)
  const [fichier, setFichier] = useState(null)
  const [apercuPhoto, setApercuPhoto] = useState('')
  const [menu, setMenu] = useState(false)
  const [choix, setChoix] = useState(null) // 'seance' | 'exercice' | 'programme'
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')
  const champ = useRef(null)
  const fichierRef = useRef(null)
  const racineMenu = useRef(null)

  useEffect(() => {
    if (!fichier) { setApercuPhoto(''); return undefined }
    const u = URL.createObjectURL(fichier)
    setApercuPhoto(u)
    return () => URL.revokeObjectURL(u)
  }, [fichier])

  useEffect(() => {
    if (!menu) return undefined
    const dehors = (e) => { if (racineMenu.current && !racineMenu.current.contains(e.target)) setMenu(false) }
    const echap = (e) => { if (e.key === 'Escape') setMenu(false) }
    document.addEventListener('pointerdown', dehors); document.addEventListener('keydown', echap)
    return () => { document.removeEventListener('pointerdown', dehors); document.removeEventListener('keydown', echap) }
  }, [menu])

  // la zone de texte grandit avec le message (6 lignes au plus)
  useEffect(() => {
    const c = champ.current
    if (!c) return
    c.style.height = 'auto'
    c.style.height = `${Math.min(c.scrollHeight, 160)}px`
  }, [texte])

  const pret = (texte.trim() || piece || fichier) && !envoi
  async function envoyer(e) {
    e?.preventDefault()
    if (!pret) return
    setEnvoi(true); setErreur('')
    const garde = { texte, piece, fichier }
    setTexte(''); setPiece(null); setFichier(null)
    try {
      await envoyerMessage(uid, role, garde)
    } catch (err) {
      setTexte(garde.texte); setPiece(garde.piece); setFichier(garde.fichier)
      setErreur(err.message === 'format' ? 'Cette image n’est pas lisible : choisissez une photo JPEG, PNG ou WebP.'
        : err.message === 'taille' ? 'Cette photo est trop lourde.' : messageErreur(err.code))
    }
    setEnvoi(false)
    champ.current?.focus()
  }

  const toucher = (e) => {
    // Entrée envoie sur ordinateur ; Maj + Entrée va à la ligne ; sur téléphone, Entrée va à la ligne
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing && window.matchMedia('(hover: hover)').matches) envoyer(e)
  }

  return (
    <form className="disc__saisie" onSubmit={envoyer}>
      {erreur && <p className="disc__erreur" role="alert">{erreur}</p>}
      {(piece || fichier) && (
        <div className="disc__joint">
          {fichier && (
            <span className="disc__joint-photo">
              {apercuPhoto && <img src={apercuPhoto} alt="" />}
              <button type="button" className="disc__retirer" aria-label="Retirer la photo" onClick={() => setFichier(null)}>×</button>
            </span>
          )}
          {piece && (
            <span className="disc__joint-piece">
              <PictoPiece type={piece.type} />
              <span className="disc__joint-titre">{piece.titre}</span>
              <button type="button" className="disc__retirer" aria-label={`Retirer ${piece.titre}`} onClick={() => setPiece(null)}>×</button>
            </span>
          )}
        </div>
      )}
      <div className="disc__barre">
        <div className="disc__plus" ref={racineMenu}>
          <button type="button" className="disc__rond" aria-label="Joindre" aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          </button>
          {menu && (
            <div className="disc__menu" role="menu">
              <button type="button" role="menuitem" onClick={() => { setMenu(false); fichierRef.current?.click() }}><PictoPhoto />Photo</button>
              <button type="button" role="menuitem" onClick={() => { setMenu(false); setChoix('seance') }}><PictoPiece type="seance" />Séance</button>
              <button type="button" role="menuitem" onClick={() => { setMenu(false); setChoix('exercice') }}><PictoPiece type="exercice" />Exercice</button>
              <button type="button" role="menuitem" onClick={() => { setMenu(false); setChoix('programme') }}><PictoPiece type="programme" />Programme</button>
            </div>
          )}
          <input ref={fichierRef} type="file" accept={FORMATS} hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) setFichier(f); e.target.value = '' }} />
        </div>
        <label className="sr-only" htmlFor={`disc-champ-${uid}`}>Votre message</label>
        <textarea id={`disc-champ-${uid}`} ref={champ} className="disc__champ" rows={1} maxLength={2000} placeholder="Votre message"
          value={texte} onChange={(e) => setTexte(e.target.value)} onKeyDown={toucher} />
        <button type="submit" className="disc__envoyer" aria-label="Envoyer" disabled={!pret}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6" /></svg>
        </button>
      </div>
      {choix && <ChoixPiece type={choix} programmes={programmes} choisir={setPiece}
        fermer={() => { setChoix(null); setTimeout(() => champ.current?.focus(), 60) }} />}
    </form>
  )
}

function PictoPhoto() {
  return (
    <span className="disc-piece__picto" aria-hidden="true">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M21 16l-5-5-9 8" /></svg>
    </span>
  )
}

// Fenêtre de choix d'une séance, d'un exercice ou d'un programme, avec recherche
function ChoixPiece({ type, programmes, choisir, fermer }) {
  const ref = useRef(null)
  const [cherche, setCherche] = useState('')
  useEffect(() => { const d = ref.current; if (d && !d.open) d.showModal() }, [])
  const tout = useMemo(() => piecesPossibles(programmes), [programmes])
  const liste = (type === 'seance' ? tout.seances : type === 'exercice' ? tout.exercices : tout.programmes)
  const filtre = cherche.trim().toLocaleLowerCase('fr')
  const visibles = filtre ? liste.filter((p) => `${p.titre} ${p.sousTitre ?? ''}`.toLocaleLowerCase('fr').includes(filtre)) : liste
  const titre = type === 'seance' ? 'Joindre une séance' : type === 'exercice' ? 'Joindre un exercice' : 'Joindre un programme'
  return (
    <dialog ref={ref} className="espace-dialogue disc-choix" aria-labelledby="disc-choix-titre" onClose={fermer}
      onClick={(e) => { if (e.target === ref.current) ref.current.close() }}>
      <div className="disc-choix__tete">
        <h2 id="disc-choix-titre" className="disc-choix__titre">{titre}</h2>
        <button type="button" className="disc__retirer disc-choix__fermer" aria-label="Fermer" onClick={() => ref.current?.close()}>×</button>
      </div>
      {liste.length > 6 && (
        <>
          <label className="sr-only" htmlFor="disc-cherche">Rechercher</label>
          <input id="disc-cherche" className="disc-choix__cherche" type="search" placeholder="Rechercher…" value={cherche} onChange={(e) => setCherche(e.target.value)} />
        </>
      )}
      {liste.length === 0 ? <p className="disc-choix__vide">Rien à joindre pour l’instant : aucun programme publié.</p> : (
        <ul className="disc-choix__liste">
          {visibles.map((p) => (
            <li key={`${p.programmeId}/${p.seanceId ?? p.elementId ?? ''}`}>
              <button type="button" className="disc-piece disc-piece--choix" onClick={() => { choisir(p); ref.current?.close() }}>
                <PictoPiece type={p.type} />
                <span className="disc-piece__texte">
                  <span className="disc-piece__titre">{p.titre}</span>
                  {p.sousTitre && <span className="disc-piece__sous">{p.sousTitre}</span>}
                </span>
              </button>
            </li>
          ))}
          {visibles.length === 0 && <li className="disc-choix__vide">Aucun résultat.</li>}
        </ul>
      )}
    </dialog>
  )
}
