import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { inviterClient, renvoyerInvitation } from '../depots.js'
import { aujourdhuiIso } from '../donnees/calculs.js'
import { dateSeance } from '../donnees/progression.js'
import { suiviCoache } from '../donnees/alertes.js'
import { useDonneesCoach } from './donneesCoach.js'
import { messageErreur } from '../erreurs.js'
import Picto from '../../components/Picto.jsx'

const STATUTS = { 'invité': 'Invité', actif: 'Actif', 'en pause': 'En pause' }
const VIDE = { prenom: '', nom: '', email: '' }

// « Mes coachés », d'après la maquette PDF de Marie (13 novembre 2026) : en-tête, encadré « À regarder » (les points
// d'attention de chaque coaché), puis une carte par coaché : semaine, programme, avancement, semaines, dernière visio, alertes.
export default function MesCoaches() {
  const { clients, programmes, seances, erreur: erreurDonnees } = useDonneesCoach()
  const [dialogue, setDialogue] = useState(false)
  const [message, setMessage] = useState('')
  const aujourdhui = aujourdhuiIso()

  const fiches = (clients ?? []).map((c) => {
    const programme = c.programme ? (programmes ?? []).find((p) => p.id === c.programme.id) ?? null : null
    const siennes = (seances ?? []).filter((s) => s.client === c.uid)
    const { resume, alertes } = suiviCoache({ programme, seances: siennes, visio: c.derniereVisio ?? null, aujourdhui })
    return { ...c, programmeComplet: programme, resume, alertes }
  })
  // ordre : d'abord ceux qui ont des points à regarder, puis ceux qui ont un programme, puis par nom
  fiches.sort((a, b) => (b.alertes.length > 0) - (a.alertes.length > 0) || !!b.programmeComplet - !!a.programmeComplet
    || `${a.prenom} ${a.nom}`.localeCompare(`${b.prenom} ${b.nom}`, 'fr'))
  const aRegarder = fiches.filter((f) => f.alertes.length > 0)
  const points = aRegarder.reduce((t, f) => t + f.alertes.length, 0)
  const nb = fiches.length
  const resumeTete = clients === null ? ' '
    : `${nb} coaché${nb > 1 ? 's' : ''} · ${points === 0 ? 'rien à regarder' : `${points} point${points > 1 ? 's' : ''} à regarder`}`

  return (
    <section className="section">
      <div className="conteneur espace-coach mes-coaches">
        <header className="espace-coach__entete mes-coaches__tete">
          <div>
            <p className="surtitre">Espace coach · {dateSeance(aujourdhui)}</p>
            <h1 className="titre titre--section">Mes coachés</h1>
            <p className="espace-texte">{resumeTete}</p>
          </div>
          <button type="button" className="bouton bouton--secondaire bouton--compact espace-coach__action" onClick={() => { setMessage(''); setDialogue(true) }}>
            <Picto nom="users" taille={18} /> Inviter un client
          </button>
        </header>

        <p className="espace-message" role="status">{message}</p>
        <p className="espace-message espace-message--erreur" role="alert">{erreurDonnees}</p>

        {aRegarder.length > 0 && (
          <section className="a-regarder" aria-labelledby="a-regarder-titre">
            <h2 id="a-regarder-titre" className="a-regarder__titre">À regarder</h2>
            <ul className="a-regarder__liste">
              {aRegarder.map((c) => (
                <li key={c.uid} className="a-regarder__ligne">
                  <div>
                    <p className="a-regarder__nom">{c.prenom} {c.nom}</p>
                    <ul className="alertes">{c.alertes.map((a) => <li key={a}>{a}</li>)}</ul>
                  </div>
                  <Link to={`/espace/coach/clients/${c.uid}`} className="lien-souligne">Ouvrir la fiche<span className="sr-only"> de {c.prenom} {c.nom}</span></Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {clients && nb === 0 && <p className="espace-texte">Aucun coaché pour l’instant. Invitez votre premier client.</p>}
        {clients && nb > 0 && (
          <ul className="cartes-coaches">
            {fiches.map((c) => {
              const r = c.resume
              const p = c.programmeComplet
              const visio = c.derniereVisio?.date
              return (
                <li key={c.uid} className="carte-coache">
                  <div className="carte-coache__tete">
                    <h2 className="carte-coache__nom"><Link to={`/espace/coach/clients/${c.uid}`} className="carte-coache__lien">{c.prenom} {c.nom}</Link></h2>
                    {r ? <span className="carte-coache__semaine">{r.semaine === 0 ? 'Commence bientôt' : `Semaine ${r.semaine} sur ${r.nbSemaines}`}</span>
                      : <span className={`espace-statut espace-statut--${c.statut === 'actif' ? 'actif' : 'autre'}`}>{STATUTS[c.statut] ?? c.statut}</span>}
                  </div>
                  <p className="carte-coache__programme">{p ? `${p.nom || 'Programme sans nom'} · ${r.nbSemaines} semaine${r.nbSemaines > 1 ? 's' : ''}` : 'Pas de programme en cours'}</p>
                  {r && (
                    <>
                      <span className="carte-coache__barre" aria-hidden="true"><span style={{ width: `${r.prevues ? Math.round((r.faites / r.prevues) * 100) : 0}%` }} /></span>
                      <div className="carte-coache__ligne">
                        <span className="carte-coache__faites">{r.faites} séance{r.faites > 1 ? 's' : ''} faite{r.faites > 1 ? 's' : ''} sur {r.prevues}</span>
                        <span className="carte-coache__semaines" role="img" aria-label={r.semaines.map((e, i) => `semaine ${i + 1} ${e === 'faite' ? 'faite' : e === 'passee' ? 'en cours ou incomplète' : 'à venir'}`).join(', ')}>
                          {r.semaines.map((e, i) => <span key={i} className={`case-semaine case-semaine--${e}`} />)}
                        </span>
                      </div>
                    </>
                  )}
                  <p className="carte-coache__visio">{visio ? `Dernière visio : ${c.derniereVisio.semaine ? `S${c.derniereVisio.semaine} · ` : ''}${dateSeance(visio)}` : 'Aucune visio notée'}</p>
                  {c.alertes.length
                    ? <ul className="alertes">{c.alertes.map((a) => <li key={a}>{a}</li>)}</ul>
                    : <p className="carte-coache__calme">{p ? 'Aucune alerte' : c.statut === 'invité' ? `${c.prenom} n’a pas encore activé son compte.` : 'Pensez à lui créer un programme.'}</p>}
                  {!p && <Link to={`/espace/coach/clients/${c.uid}/programme`} className="lien-souligne carte-coache__action">Créer un programme<span className="sr-only"> pour {c.prenom} {c.nom}</span></Link>}
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
