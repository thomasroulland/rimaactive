import { useState } from 'react'
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { auth } from './firebase.js'
import { messageErreur } from './erreurs.js'

// Page de connexion : e-mail, mot de passe, « Mot de passe oublié ? »
export default function Connexion() {
  const [email, setEmail] = useState('')
  const [motDePasse, setMotDePasse] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')
  const [info, setInfo] = useState('')

  async function seConnecter(event) {
    event.preventDefault()
    setErreur(''); setInfo(''); setEnvoi(true)
    try {
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
      await sendPasswordResetEmail(auth, email.trim())
    } catch (e) {
      // l'absence de compte n'est pas révélée : seules les erreurs de réseau ou d'adresse sont montrées
      if (e.code !== 'auth/user-not-found') { setErreur(messageErreur(e.code)); return }
    }
    setInfo('Si un compte existe pour cette adresse, un e-mail vient de partir.')
  }

  return (
    <section className="section espace-connexion">
      <div className="conteneur">
        <div className="espace-carte espace-connexion__carte">
          <h1 className="titre titre--tuile">Mon espace</h1>
          <p className="espace-texte">Connectez-vous pour retrouver votre programme.</p>
          <form className="espace-formulaire" onSubmit={seConnecter} noValidate>
            <div className="champ-groupe">
              <label htmlFor="espace-email">Adresse e-mail</label>
              <input id="espace-email" className="champ" type="email" autoComplete="username" inputMode="email"
                required aria-invalid={erreur ? true : undefined} aria-describedby="espace-erreur" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="champ-groupe">
              <label htmlFor="espace-mdp">Mot de passe</label>
              <input id="espace-mdp" className="champ" type="password" autoComplete="current-password"
                required aria-invalid={erreur ? true : undefined} aria-describedby="espace-erreur" value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)} />
            </div>
            <p id="espace-erreur" className="espace-message espace-message--erreur" role="alert">{erreur}</p>
            <p className="espace-message" role="status">{info}</p>
            <button type="submit" className="bouton bouton--principal" disabled={envoi}>
              {envoi ? 'Connexion…' : 'Se connecter'}
            </button>
            <button type="button" className="espace-lien" onClick={oublie}>Mot de passe oublié ?</button>
          </form>
        </div>
      </div>
    </section>
  )
}
