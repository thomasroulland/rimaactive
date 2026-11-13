import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ecouterClients, inviterClient, renvoyerInvitation } from '../depots.js'
import { messageErreur } from '../erreurs.js'
import Picto from '../../components/Picto.jsx'

const STATUTS = { 'invité': 'Invité', actif: 'Actif', 'en pause': 'En pause' }
const VIDE = { prenom: '', nom: '', email: '' }

// Liste « Mes coachés » : un client par carte, bouton « Inviter un client »
export default function MesCoaches() {
  const [clients, setClients] = useState(null)
  const [erreur, setErreur] = useState('')
  const [dialogue, setDialogue] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => ecouterClients(setClients, () => setErreur('Impossible de charger vos coachés. Vérifiez votre connexion.')), [])

  const nb = clients?.length ?? 0
  const resume = clients === null ? ' ' : nb === 0 ? 'Aucun client pour l’instant.' : nb === 1 ? '1 client suivi.' : `${nb} clients suivis.`

  return (
    <section className="section">
      <div className="conteneur espace-coach">
        <header className="espace-coach__entete">
          <div>
            <p className="surtitre">Espace coach</p>
            <h1 className="titre titre--section">Mes coachés</h1>
            <p className="espace-texte">{resume}</p>
          </div>
          <button type="button" className="bouton bouton--principal espace-coach__action" onClick={() => { setMessage(''); setDialogue(true) }}>
            <Picto nom="users" taille={20} /> Inviter un client
          </button>
        </header>

        <p className="espace-message" role="status">{message}</p>
        <p className="espace-message espace-message--erreur" role="alert">{erreur}</p>

        {clients && nb > 0 && (
          <ul className="espace-grille coaches">
            {clients.map((c) => {
              const p = c.programme
              const avance = p && p.nbSemaines ? Math.min(1, Math.max(0, p.semaine / p.nbSemaines)) : 0
              return (
                <li key={c.uid} className="coache">
                  <div className="coache__tete">
                    <span className="coache__initiales" aria-hidden="true">{(c.prenom?.[0] ?? '') + (c.nom?.[0] ?? '')}</span>
                    <div className="coache__identite">
                      {/* toute la carte ouvre la fiche (lien étiré) */}
                      <h2 className="coache__nom"><Link to={`/espace/coach/clients/${c.uid}`} className="coache__lien">{c.prenom} {c.nom}</Link></h2>
                      <p className="coache__email">{c.email}</p>
                    </div>
                    <span className={`espace-statut espace-statut--${c.statut === 'actif' ? 'actif' : 'autre'}`}>{STATUTS[c.statut] ?? c.statut}</span>
                  </div>
                  <div className="coache__programme">
                    {p ? (
                      <>
                        <p className="coache__prog-ligne">
                          <span className="coache__prog-nom">{p.nom}</span>
                          <span>{p.semaine === 0 ? 'Commence bientôt' : `Semaine ${p.semaine} sur ${p.nbSemaines}`}</span>
                        </p>
                        <span className="coache__barre" aria-hidden="true"><span style={{ width: `${Math.round(avance * 100)}%` }} /></span>
                      </>
                    ) : <p className="coache__prog-ligne coache__prog-ligne--vide">Pas de programme en cours</p>}
                  </div>
                  <div className="coache__actions">
                    <span className="coache__voir" aria-hidden="true">Voir la fiche</span>
                    <Link to={`/espace/coach/clients/${c.uid}/programme`} className="coache__programme-lien">
                      {c.nbProgrammes > 0 ? 'Ouvrir le programme' : 'Créer un programme'}
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
