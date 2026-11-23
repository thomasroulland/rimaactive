import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import photo from '../assets/connexion-squat-entier.jpg'
import symbole from '../assets/rimaactive-symbole-vermillon.svg'
import { messageErreur } from './erreurs.js'
import './espace.css'

const firebaseAuth = () => Promise.all([import('firebase/auth'), import('./firebase.js')])
const MIN = 8

async function appeler(corps) {
  const r = await fetch('/api/activer-invitation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corps) })
  let donnees = null
  try { donnees = await r.json() } catch { /* rien */ }
  return { statut: r.status, donnees }
}

// Lien de l'e-mail d'invitation (valable 7 jours, 23 novembre 2026) : le client choisit son mot de passe ici,
// puis il est connecté directement et arrive dans son espace (accord, puis tableau de bord). Même carte que la connexion.
export default function Invitation() {
  const [parametres] = useSearchParams()
  const jeton = parametres.get('t') ?? ''
  const naviguer = useNavigate()
  const [etat, setEtat] = useState('verification') // verification | pret | invalide | expire
  const [prenom, setPrenom] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [confirmation, setConfirmation] = useState('')
  const [voir, setVoir] = useState(false)
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    let actif = true
    if (!jeton) { setEtat('invalide'); return undefined }
    appeler({ t: jeton }).then(({ statut, donnees }) => {
      if (!actif) return
      if (statut === 200) { setPrenom(donnees?.prenom ?? ''); setEtat('pret') }
      else setEtat(statut === 410 ? 'expire' : 'invalide')
    }).catch(() => { if (actif) { setEtat('pret'); setErreur(messageErreur('auth/network-request-failed')) } })
    return () => { actif = false }
  }, [jeton])

  async function valider(event) {
    event.preventDefault()
    setErreur('')
    if (motDePasse.length < MIN) { setErreur(`Choisissez un mot de passe d’au moins ${MIN} caractères.`); return }
    if (motDePasse !== confirmation) { setErreur('Les deux mots de passe ne sont pas identiques.'); return }
    setEnvoi(true)
    try {
      const { statut, donnees } = await appeler({ t: jeton, motDePasse })
      if (statut === 410) { setEtat('expire'); setEnvoi(false); return }
      if (statut !== 200 || !donnees?.email) { setEtat('invalide'); setEnvoi(false); return }
      const [{ signInWithEmailAndPassword }, { auth }] = await firebaseAuth()
      await signInWithEmailAndPassword(auth, donnees.email, motDePasse)
      naviguer('/espace', { replace: true })
    } catch (e) {
      setErreur(messageErreur(e.code ?? 'auth/network-request-failed'))
      setEnvoi(false)
    }
  }

  return (
    <section className="section espace-connexion connexion">
      <div className="conteneur">
        <div className="espace-carte espace-connexion__carte connexion__carte">
          <div className="connexion__visuel" style={{ '--photo': `url(${photo})` }}>
            <img src={photo} alt="" className="connexion__photo" />
            <div className="connexion__legende">
              <img src={symbole} alt="" className="connexion__symbole" width="36" height="36" />
              <p className="connexion__phrase">Vos objectifs.<br className="connexion__saut" /> Votre progression.</p>
              <p className="connexion__signature">Marie Sillas, coach sportive diplômée</p>
            </div>
          </div>

          <div className="connexion__corps">
            <p className="surtitre connexion__surtitre">Espace coaching · Rimaactive</p>
            {etat === 'verification' && <p className="espace-texte" role="status">Un instant…</p>}

            {(etat === 'invalide' || etat === 'expire') && (
              <>
                <h1 className="titre titre--tuile connexion__titre">{etat === 'expire' ? 'Ce lien a expiré.' : 'Ce lien ne fonctionne plus.'}</h1>
                <p className="espace-texte connexion__intro">
                  {etat === 'expire'
                    ? 'Il était valable 7 jours. Marie peut vous en renvoyer un nouveau en un clic.'
                    : 'Il a peut-être déjà servi, ou Marie vous en a envoyé un plus récent. Si vous avez déjà choisi votre mot de passe, connectez-vous.'}
                </p>
                <Link to="/espace" className="bouton bouton--principal connexion__bouton">Aller à la connexion</Link>
                <p className="espace-texte connexion__aide">Besoin d’un nouveau lien ? <Link to="/contact" className="connexion__contact">Contacter Marie</Link></p>
              </>
            )}

            {etat === 'pret' && (
              <>
                <h1 className="titre titre--tuile connexion__titre">Bienvenue{prenom ? ` ${prenom}` : ''}.</h1>
                <p className="espace-texte connexion__intro">Choisissez votre mot de passe pour ouvrir votre espace.</p>
                <form className="espace-formulaire connexion__form" onSubmit={valider} noValidate>
                  <div className="champ-groupe">
                    <label htmlFor="inv-mdp">Mot de passe <span className="optionnel">({MIN} caractères minimum)</span></label>
                    <div className="connexion__mdp">
                      <input id="inv-mdp" className="champ" type={voir ? 'text' : 'password'} autoComplete="new-password" minLength={MIN}
                        required aria-invalid={erreur ? true : undefined} aria-describedby="inv-erreur" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} />
                      <button type="button" className="connexion__oeil" onClick={() => setVoir(!voir)} aria-pressed={voir}
                        aria-label={voir ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
                        {voir
                          ? <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A9.8 9.8 0 0 1 12 5c5 0 9 4.5 10 7a12 12 0 0 1-3 4.2M6.2 6.6A12.3 12.3 0 0 0 2 12c1 2.5 5 7 10 7a9.6 9.6 0 0 0 4.3-1" /></svg>
                          : <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12c1-2.5 5-7 10-7s9 4.5 10 7c-1 2.5-5 7-10 7S3 14.5 2 12z" /><circle cx="12" cy="12" r="3" /></svg>}
                      </button>
                    </div>
                  </div>
                  <div className="champ-groupe">
                    <label htmlFor="inv-mdp2">Confirmez le mot de passe</label>
                    <input id="inv-mdp2" className="champ" type={voir ? 'text' : 'password'} autoComplete="new-password"
                      required aria-invalid={erreur ? true : undefined} aria-describedby="inv-erreur" value={confirmation} onChange={(e) => setConfirmation(e.target.value)} />
                  </div>
                  <p id="inv-erreur" className="espace-message espace-message--erreur" role="alert">{erreur}</p>
                  <button type="submit" className="bouton bouton--principal connexion__bouton" disabled={envoi}>
                    {envoi ? 'Ouverture de votre espace…' : 'Créer mon mot de passe'}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
