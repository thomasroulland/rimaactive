import { useState } from 'react'
import { Link } from 'react-router-dom'
import photo from '../assets/heros-squat-nb.jpg'
import symbole from '../assets/rimaactive-symbole-vermillon.svg'
import { messageErreur } from './erreurs.js'
import './espace.css'

// Firebase n'est chargé qu'au moment d'envoyer : ce formulaire peut s'afficher avant le reste de l'espace
const firebaseAuth = () => Promise.all([import('firebase/auth'), import('./firebase.js')])

// Page de connexion : e-mail, mot de passe, « Mot de passe oublié ? »
export default function Connexion() {
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')
  const [info, setInfo] = useState('')
  const [voir, setVoir] = useState(false)

  async function seConnecter(event) {
    event.preventDefault()
    setErreur(''); setInfo(''); setEnvoi(true)
    try {
      const [{ signInWithEmailAndPassword }, { auth }] = await firebaseAuth()
      await signInWithEmailAndPassword(auth, email.trim(), motDePasse)
    } catch (e) {
      setErreur(messageErreur(e.code))
      setEnvoi(false)
    }
  }

  async function oublie() {
    setErreur(''); setInfo('')
    if (!email.trim()) { setErreur('Saisissez d’abord votre adresse e-mail.'); return }
    try {
      const [{ sendPasswordResetEmail }, { auth }] = await firebaseAuth()
      await sendPasswordResetEmail(auth, email.trim())
    } catch (e) {
      // l'absence de compte n'est pas révélée : seules les erreurs de réseau ou d'adresse sont montrées
      if (e.code !== 'auth/user-not-found') { setErreur(messageErreur(e.code)); return }
    }
    setInfo('Si un compte existe pour cette adresse, un e-mail vient de partir.')
  }

  // Mise en page (14 novembre 2026) : une grande carte en deux parties, la photo noir et blanc du site à gauche
  // (bandeau en haut sur téléphone), le formulaire à droite ; la page remplit la hauteur de l'écran.
  return (
    <section className="section espace-connexion connexion">
      <div className="conteneur">
        <div className="espace-carte espace-connexion__carte connexion__carte">
          <div className="connexion__visuel">
            <img src={photo} alt="" className="connexion__photo" />
            <div className="connexion__legende">
              <img src={symbole} alt="" className="connexion__symbole" width="36" height="36" />
              <p className="connexion__phrase">Votre programme, vos séances et vos progrès, au même endroit.</p>
              <p className="connexion__signature">Marie Sillas, coach sportive à Houdan</p>
            </div>
          </div>

          <div className="connexion__corps">
            <h1 className="titre titre--tuile connexion__titre">Mon espace</h1>
            <p className="espace-texte connexion__intro">Connectez-vous pour retrouver votre programme.</p>
            <form className="espace-formulaire connexion__form" onSubmit={seConnecter} noValidate>
              <div className="champ-groupe">
                <label htmlFor="espace-email">Adresse e-mail</label>
                <input id="espace-email" className="champ" type="email" autoComplete="username" inputMode="email"
                  required aria-invalid={erreur ? true : undefined} aria-describedby="espace-erreur" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="champ-groupe">
                <div className="connexion__ligne-label">
                  <label htmlFor="espace-mdp">Mot de passe</label>
                  <button type="button" className="connexion__oublie" onClick={oublie}>Mot de passe oublié ?</button>
                </div>
                <div className="connexion__mdp">
                  <input id="espace-mdp" className="champ" type={voir ? 'text' : 'password'} autoComplete="current-password"
                    required aria-invalid={erreur ? true : undefined} aria-describedby="espace-erreur" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} />
                  <button type="button" className="connexion__oeil" onClick={() => setVoir(!voir)} aria-pressed={voir}
                    aria-label={voir ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}>
                    {voir
                      ? <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 3l18 18M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 5.2A9.8 9.8 0 0 1 12 5c5 0 9 4.5 10 7a12 12 0 0 1-3 4.2M6.2 6.6A12.3 12.3 0 0 0 2 12c1 2.5 5 7 10 7a9.6 9.6 0 0 0 4.3-1" /></svg>
                      : <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 12c1-2.5 5-7 10-7s9 4.5 10 7c-1 2.5-5 7-10 7S3 14.5 2 12z" /><circle cx="12" cy="12" r="3" /></svg>}
                  </button>
                </div>
              </div>
              <p id="espace-erreur" className="espace-message espace-message--erreur" role="alert">{erreur}</p>
              <p className="espace-message" role="status">{info}</p>
              <button type="submit" className="bouton bouton--principal connexion__bouton" disabled={envoi}>
                {envoi ? 'Connexion…' : 'Se connecter'}
              </button>
            </form>
            <p className="connexion__aide">
              Pas encore de compte ? Marie ouvre votre espace quand vous commencez un accompagnement.{' '}
              <Link to="/contact" className="connexion__contact">Lui écrire</Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
