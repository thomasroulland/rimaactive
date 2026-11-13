import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { inviterClient, renvoyerInvitation } from '../depots.js'
import { ajoutJours, aujourdhuiIso } from '../donnees/calculs.js'
import { dateCourte } from '../donnees/seances.js'
import { nouveautesParClient, useDonneesCoach, useVisites } from './donneesCoach.js'
import { messageErreur } from '../erreurs.js'
import Picto from '../../components/Picto.jsx'

const STATUTS = { 'invité': 'Invité', actif: 'Actif', 'en pause': 'En pause' }
const VIDE = { prenom: '', nom: '', email: '' }

// « Mes coachés » (13 novembre 2026) : bonjour, filtres, une carte par coaché avec son activité récente,
// les nouveautés depuis la dernière visite de son suivi, et un rappel quand le programme touche à sa fin.
const FILTRES = [
  ['tous', 'Tous'],
  ['regarder', 'À regarder'],
  ['programme', 'Programme à faire'],
  ['pause', 'En pause'],
]
const JOUR = 24 * 3600 * 1000

function quand(sf) {
  const jours = Math.round((new Date(`${aujourdhuiIso()}T12:00:00`) - new Date(`${sf.date}T12:00:00`)) / JOUR)
  if (jours <= 0) return 'aujourd’hui'
  if (jours === 1) return 'hier'
  if (jours < 7) return `il y a ${jours} jours`
  return `le ${dateCourte(sf.date)}`
}

function titreSeance(programmes, sf) {
  const p = (programmes ?? []).find((x) => x.id === sf.programme)
  for (const sem of p?.semaines ?? []) {
    const s = (sem.seances ?? []).find((x) => x.id === sf.seance)
    if (s) return s.titre || 'Séance'
  }
  return 'Séance'
}

export default function MesCoaches({ profil }) {
  const { clients, programmes, seances, erreur: erreurDonnees } = useDonneesCoach()
  useVisites()
  const erreur = ''
  const [dialogue, setDialogue] = useState(false)
  const [message, setMessage] = useState('')
  const [filtre, setFiltre] = useState('tous')

  const nouv = nouveautesParClient(seances)
  const aujourdhui = aujourdhuiIso()
  const fiches = (clients ?? []).map((c) => {
    const siennes = (seances ?? []).filter((s) => s.client === c.uid)
    const nouvelles = nouv.get(c.uid) ?? []
    const p = c.programme
    const fin = p?.debut ? ajoutJours(p.debut, p.nbSemaines * 7 - 1) : null
    const resteJours = fin ? Math.round((new Date(`${fin}T12:00:00`) - new Date(`${aujourdhui}T12:00:00`)) / JOUR) : null
    const aFaire = !p || (resteJours !== null && resteJours < 0)
    return { ...c, siennes, nouvelles, resteJours, aFaire }
  })
  const compte = {
    tous: fiches.length,
    regarder: fiches.filter((f) => f.nouvelles.length > 0).length,
    programme: fiches.filter((f) => f.aFaire && f.statut !== 'en pause').length,
    pause: fiches.filter((f) => f.statut === 'en pause').length,
  }
  const garde = {
    tous: () => true,
    regarder: (f) => f.nouvelles.length > 0,
    programme: (f) => f.aFaire && f.statut !== 'en pause',
    pause: (f) => f.statut === 'en pause',
  }[filtre]
  // les coachés à regarder d'abord, puis par nom
  const visibles = fiches.filter(garde).sort((a, b) => (b.nouvelles.length > 0) - (a.nouvelles.length > 0)
    || `${a.prenom} ${a.nom}`.localeCompare(`${b.prenom} ${b.nom}`, 'fr'))
  const nb = fiches.length
  const resume = clients === null ? ' '
    : compte.regarder > 0 ? `${compte.regarder} ${compte.regarder > 1 ? 'coachés ont' : 'coaché a'} du nouveau depuis votre dernière visite.`
      : nb === 0 ? 'Aucun client pour l’instant. Invitez votre premier coaché.' : nb === 1 ? '1 client suivi, rien de nouveau.' : `${nb} clients suivis, rien de nouveau.`

  return (
    <section className="section">
      <div className="conteneur espace-coach">
        <header className="espace-coach__entete">
          <div>
            <p className="surtitre">Espace coach</p>
            <h1 className="titre titre--section">{profil?.prenom ? `Bonjour ${profil.prenom}` : 'Mes coachés'}</h1>
            <p className="espace-texte">{resume}</p>
          </div>
          <button type="button" className="bouton bouton--principal espace-coach__action" onClick={() => { setMessage(''); setDialogue(true) }}>
            <Picto nom="users" taille={20} /> Inviter un client
          </button>
        </header>

        <p className="espace-message" role="status">{message}</p>
        <p className="espace-message espace-message--erreur" role="alert">{erreur || erreurDonnees}</p>

        {nb > 0 && (
          <div className="filtres-coaches" role="group" aria-label="Afficher">
            {FILTRES.map(([id, nom]) => (
              <button key={id} type="button" className="filtre-coaches" aria-pressed={filtre === id} onClick={() => setFiltre(id)}>
                {nom} · {compte[id]}
              </button>
            ))}
          </div>
        )}

        {clients && visibles.length === 0 && nb > 0 && <p className="espace-texte">Aucun coaché dans cette catégorie.</p>}
        {clients && visibles.length > 0 && (
          <ul className="espace-grille coaches">
            {visibles.map((c) => {
              const p = c.programme
              const avance = p && p.nbSemaines ? Math.min(1, Math.max(0, p.semaine / p.nbSemaines)) : 0
              const nouvellesIds = new Set(c.nouvelles.map((s) => s.id))
              const activite = c.siennes.slice(0, 2)
              const dernierCommentaire = c.siennes.find((s) => String(s.commentaire ?? '').trim())
              return (
                <li key={c.uid} className={`coache${c.nouvelles.length ? ' coache--a-voir' : ''}`}>
                  <div className="coache__tete">
                    <span className="coache__initiales" aria-hidden="true">{(c.prenom?.[0] ?? '') + (c.nom?.[0] ?? '')}</span>
                    <div className="coache__identite">
                      <h2 className="coache__nom"><Link to={`/espace/coach/clients/${c.uid}`} className="coache__lien">{c.prenom} {c.nom}</Link></h2>
                      <p className="coache__email">{p ? `${p.nom} · ${p.semaine === 0 ? 'commence bientôt' : `S${p.semaine} sur ${p.nbSemaines}`}` : c.email}</p>
                    </div>
                    {c.nouvelles.length > 0
                      ? <span className="coache__nb" aria-label={`${c.nouvelles.length} nouveauté${c.nouvelles.length > 1 ? 's' : ''}`}>{c.nouvelles.length}</span>
                      : <span className={`espace-statut espace-statut--${c.statut === 'actif' ? 'actif' : 'autre'}`}>{STATUTS[c.statut] ?? c.statut}</span>}
                  </div>

                  {activite.length > 0 && (
                    <ul className="coache__activite">
                      {activite.map((s) => (
                        <li key={s.id} className={nouvellesIds.has(s.id) ? 'nouveau' : undefined}>
                          <span><b>Séance faite</b> · {titreSeance(programmes, s)} · {quand(s)}</span>
                        </li>
                      ))}
                      {dernierCommentaire && (
                        <li className={nouvellesIds.has(dernierCommentaire.id) ? 'nouveau' : undefined}>
                          <span><b>Commentaire</b> : « {String(dernierCommentaire.commentaire).trim().slice(0, 60)}{String(dernierCommentaire.commentaire).trim().length > 60 ? '…' : ''} »</span>
                        </li>
                      )}
                    </ul>
                  )}

                  {p && c.resteJours !== null && c.resteJours >= 0 && c.resteJours <= 10 && (
                    <p className="coache__rappel"><b>Le programme se termine {c.resteJours === 0 ? 'aujourd’hui' : `dans ${c.resteJours} jour${c.resteJours > 1 ? 's' : ''}`}.</b> Pensez à préparer la suite.</p>
                  )}
                  {!p && (
                    <p className="coache__rappel"><b>Pas de programme en cours.</b>{c.statut === 'invité' ? ` ${c.prenom} n’a pas encore activé son compte.` : ''}</p>
                  )}
                  {p && <span className="coache__barre" aria-hidden="true"><span style={{ width: `${Math.round(avance * 100)}%` }} /></span>}

                  <div className="coache__actions">
                    <span className="coache__voir" aria-hidden="true">Ouvrir le suivi</span>
                    <Link to={`/espace/coach/clients/${c.uid}/programme`} className={`coache__programme-lien${c.aFaire ? ' coache__programme-lien--faire' : ''}`}>
                      {c.nbProgrammes > 0 ? (c.aFaire ? 'Nouveau programme' : 'Programme') : 'Créer le programme'}
                      <span className="sr-only"> de {c.prenom} {c.nom}</span>
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
      {dialogue && (
        <DialogueInvitation
          fermer={() => setDialogue(false)}
          invite={(m) => { setDialogue(false); setMessage(m) }}
        />
      )}
    </section>
  )
}

function DialogueInvitation({ fermer, invite }) {
  const ref = useRef(null)
  const [champs, setChamps] = useState(VIDE)
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')
  const [dejaInvite, setDejaInvite] = useState(false)

  useEffect(() => {
    const d = ref.current
    if (d && !d.open) d.showModal()
  }, [])

  const maj = (cle) => (e) => { setChamps({ ...champs, [cle]: e.target.value }); setDejaInvite(false); setErreur('') }

  async function envoyer(event) {
    event.preventDefault()
    if (!champs.prenom.trim() || !champs.nom.trim() || !champs.email.trim()) { setErreur('Renseignez le prénom, le nom et l’adresse e-mail.'); return }
    setEnvoi(true); setErreur(''); setDejaInvite(false)
    try {
      const r = await inviterClient(champs)
      if (r.dejaInvite) { setDejaInvite(true); setErreur('Ce client est déjà invité.') }
      else invite(`Invitation envoyée à ${champs.prenom.trim()} ${champs.nom.trim()}.`)
    } catch (e) {
      setErreur(messageErreur(e.code))
    }
    setEnvoi(false)
  }

  async function renvoyer() {
    setEnvoi(true); setErreur('')
    try {
      await renvoyerInvitation(champs.email)
      invite(`Invitation renvoyée à ${champs.email.trim()}.`)
    } catch (e) {
      setErreur(messageErreur(e.code))
    }
    setEnvoi(false)
  }

  return (
    <dialog ref={ref} className="espace-dialogue" aria-labelledby="espace-inviter-titre" onClose={fermer}
      onClick={(e) => { if (e.target === ref.current) ref.current.close() }}>
      <form className="espace-formulaire" onSubmit={envoyer} noValidate>
        <h2 id="espace-inviter-titre" className="titre titre--tuile">Inviter un client</h2>
        <p className="espace-texte">Votre client reçoit un e-mail pour choisir son mot de passe.</p>
        <div className="champ-groupe">
          <label htmlFor="inv-prenom">Prénom</label>
          <input id="inv-prenom" className="champ" autoComplete="off" required value={champs.prenom} onChange={maj('prenom')} />
        </div>
        <div className="champ-groupe">
          <label htmlFor="inv-nom">Nom</label>
          <input id="inv-nom" className="champ" autoComplete="off" required value={champs.nom} onChange={maj('nom')} />
        </div>
        <div className="champ-groupe">
          <label htmlFor="inv-email">Adresse e-mail</label>
          <input id="inv-email" className="champ" type="email" inputMode="email" autoComplete="off" required
            aria-describedby="inv-erreur" aria-invalid={erreur ? true : undefined} value={champs.email} onChange={maj('email')} />
        </div>
        <p id="inv-erreur" className="espace-message espace-message--erreur" role="alert">{erreur}</p>
        <div className="espace-actions">
          {dejaInvite
            ? <button type="button" className="bouton bouton--principal" onClick={renvoyer} disabled={envoi}>Renvoyer l’invitation</button>
            : <button type="submit" className="bouton bouton--principal" disabled={envoi}>{envoi ? 'Envoi…' : 'Envoyer l’invitation'}</button>}
          <button type="button" className="bouton bouton--secondaire" onClick={() => ref.current.close()}>Annuler</button>
        </div>
      </form>
    </dialog>
  )
}
