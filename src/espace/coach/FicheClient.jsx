import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  lireProfil, ecouterProgrammes, ecouterSeancesClient, commenterSeance, supprimerClient, programmeEnCours,
} from '../depots.js'
import { aujourdhuiIso, meilleuresCharges, regularite } from '../donnees/calculs.js'
import { dateCourte, dateLongue, detailSeance, evolutionCharges, exercicesDe, fr, texteSerie } from '../donnees/seances.js'
import { messageErreur } from '../erreurs.js'

const NB_POINTS = 8 // dernières séances montrées par exercice
const STATUTS = { 'invité': 'Invité', actif: 'Actif', 'en pause': 'En pause' }
const Fleche = () => (
  <svg width="20" height="20" aria-hidden="true" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"><path d="M216 128H40M112 56l-72 72 72 72" /></svg>
)

// Fiche d'un coaché : programme en cours, séances faites, courbes de charges, suppression.
export default function FicheClient() {
  const { uid } = useParams()
  const navigate = useNavigate()
  const [client, setClient] = useState(undefined)
  const [programmes, setProgrammes] = useState(null)
  const [seances, setSeances] = useState(null)
  const [erreur, setErreur] = useState('')
  const [suppression, setSuppression] = useState(false)

  useEffect(() => {
    lireProfil(uid).then(setClient).catch(() => { setClient(null); setErreur('Impossible de charger ce coaché. Vérifiez votre connexion.') })
  }, [uid])
  useEffect(() => ecouterProgrammes(uid, setProgrammes, () => setErreur('Impossible de charger les programmes. Vérifiez votre connexion.')), [uid])
  useEffect(() => ecouterSeancesClient(uid, setSeances, () => setErreur('Impossible de charger les séances. Vérifiez votre connexion.')), [uid])

  const retour = <Link to="/espace/coach" className="espace-retour"><Fleche /> Mes coachés</Link>

  if (client === undefined) {
    return <section className="section"><div className="conteneur espace-coach">{retour}<p className="espace-texte" role="status">Chargement…</p></div></section>
  }
  if (client === null) {
    return (
      <section className="section"><div className="conteneur espace-coach">
        {retour}
        <p className="espace-texte">Ce coaché n’existe pas.</p>
        <p className="espace-message espace-message--erreur" role="alert">{erreur}</p>
      </div></section>
    )
  }

  const enCours = programmes ? programmeEnCours(programmes, aujourdhuiIso()) : null
  const progEnCours = enCours ? programmes.find((p) => p.id === enCours.id) : null
  const terminees = (seances ?? []).filter((s) => s.statut === 'terminée')
  const faites = new Set(terminees.filter((s) => enCours && s.programme === enCours.id).map((s) => s.seance))
  const { exoIdParElement, noms } = exercicesDe(programmes ?? [])
  const courbes = [...noms.entries()]
    .map(([exoId, nom]) => ({ exoId, nom, points: meilleuresCharges(seances ?? [], exoIdParElement, exoId) }))
    .filter((c) => c.points.length > 0)
    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))

  return (
    <section className="section">
      <div className="conteneur espace-coach fiche-client">
        {retour}
        <header className="espace-coach__entete">
          <div>
            <p className="surtitre">Fiche client</p>
            <h1 className="titre titre--section">{client.prenom} {client.nom}</h1>
            <p className="espace-texte">
              <span className={`espace-statut espace-statut--${client.statut === 'actif' ? 'actif' : 'autre'}`}>{STATUTS[client.statut] ?? client.statut}</span>
              {' '}<span className="fiche-email">{client.email}</span>
            </p>
          </div>
        </header>
        <p className="espace-message espace-message--erreur" role="alert">{erreur}</p>

        <section className="fiche-bloc" aria-labelledby="fiche-prog">
          <h2 id="fiche-prog" className="espace-sous-titre">Programme en cours</h2>
          <div className="espace-carte">
            {programmes === null ? <p className="espace-texte" role="status">Chargement…</p> : enCours ? (
              <>
                <p className="fiche-prog__nom">{enCours.nom}</p>
                <p className="espace-texte">
                  {enCours.semaine === 0
                    ? `Commence le ${dateLongue(enCours.debut)}.`
                    : `Semaine ${enCours.semaine} sur ${enCours.nbSemaines}.`}
                </p>
                <Regularite semaines={regularite(progEnCours, faites)} />
              </>
            ) : (
              <p className="espace-texte">Pas de programme publié pour l’instant.</p>
            )}
            <Link to={`/espace/coach/clients/${uid}/programme`} className="bouton bouton--principal">
              {programmes && programmes.length > 0 ? 'Modifier le programme' : 'Créer un programme'}
            </Link>
          </div>
        </section>

        <section className="fiche-bloc" aria-labelledby="fiche-seances">
          <h2 id="fiche-seances" className="espace-sous-titre">Séances faites</h2>
          {seances === null ? <p className="espace-texte" role="status">Chargement…</p>
            : seances.length === 0 ? <p className="espace-texte">{client.prenom} n’a pas encore enregistré de séance.</p> : (
              <ul className="fiche-liste">
                {seances.map((s) => (
                  <SeanceFaite key={s.id} sf={s} seance={trouverSeance(programmes, s)} />
                ))}
              </ul>
            )}
        </section>

        <section className="fiche-bloc" aria-labelledby="fiche-charges">
          <h2 id="fiche-charges" className="espace-sous-titre">Charges (meilleure série)</h2>
          {courbes.length === 0 ? <p className="espace-texte">Pas encore de charges enregistrées.</p> : (
            <ul className="fiche-liste fiche-courbes">
              {courbes.map((c) => <Courbe key={c.exoId} nom={c.nom} points={c.points.slice(-NB_POINTS)} />)}
            </ul>
          )}
        </section>

        <section className="fiche-bloc fiche-danger" aria-labelledby="fiche-supp">
          <h2 id="fiche-supp" className="espace-sous-titre">Supprimer ce client</h2>
          <p className="espace-texte">Le compte, les programmes, les séances et les photos de {client.prenom} sont effacés définitivement.</p>
          <button type="button" className="bouton bouton--secondaire" onClick={() => setSuppression(true)}>Supprimer ce client et ses données</button>
        </section>
      </div>
      {suppression && (
        <DialogueSuppression client={client} uid={uid} fermer={() => setSuppression(false)} fini={() => navigate('/espace/coach', { replace: true })} />
      )}
    </section>
  )
}

function trouverSeance(programmes, sf) {
  const p = (programmes ?? []).find((x) => x.id === sf.programme)
  for (const sem of p?.semaines ?? []) {
    const s = (sem.seances ?? []).find((x) => x.id === sf.seance)
    if (s) return s
  }
  return null
}

function Regularite({ semaines }) {
  return (
    <ul className="fiche-reg" aria-label="Régularité">
      {semaines.map((s) => (
        <li key={s.semaine} className="fiche-reg__ligne">
          <span className="fiche-reg__sem">S{s.semaine}</span>
          <span className="fiche-reg__points" role="img" aria-label={`Semaine ${s.semaine} : ${s.faites} séance${s.faites > 1 ? 's' : ''} faite${s.faites > 1 ? 's' : ''} sur ${s.prevues}`}>
            {Array.from({ length: s.prevues }, (_, i) => <span key={i} className={`fiche-reg__point${i < s.faites ? ' fiche-reg__point--fait' : ''}`} />)}
          </span>
          <span className="fiche-reg__txt">{s.faites} sur {s.prevues}</span>
        </li>
      ))}
    </ul>
  )
}

function SeanceFaite({ sf, seance }) {
  const [texte, setTexte] = useState(sf.commentaireCoach ?? '')
  const [message, setMessage] = useState('')
  const [erreur, setErreur] = useState('')
  const enregistre = sf.commentaireCoach ?? ''
  const modifie = texte.trim() !== enregistre.trim()
  const id = `com-${sf.id}`
  const douleur = sf.douleur?.oui ? sf.douleur : null
  const detail = detailSeance(seance, sf.series)
  const terminee = sf.statut === 'terminée'

  // Optimiste, comme côté client : hors ligne la promesse ne se résout qu'au retour du réseau (le cache garde l'écriture).
  // On n'attend donc pas ; un vrai refus (permission, etc.) arrive par le catch.
  function enregistrer(e) {
    e.preventDefault()
    setErreur('')
    setMessage(navigator.onLine === false
      ? 'Commentaire enregistré sur cet appareil, envoyé au retour du réseau.'
      : 'Commentaire enregistré.')
    commenterSeance(sf.id, texte).catch((err) => { setMessage(''); setErreur(messageErreur(err.code)) })
  }

  return (
    <li className="espace-carte fiche-seance">
      <div className="fiche-seance__tete">
        <h3 className="espace-element__titre">{seance ? seance.titre || 'Séance' : 'Séance retirée du programme'}</h3>
        <p className="fiche-seance__date">{dateLongue(sf.date)}</p>
      </div>
      <p className="fiche-seance__bilan">
        {terminee ? (
          <>
            {Number.isInteger(sf.effort) && <span>Effort {sf.effort} sur 10</span>}
            {sf.ressenti && <span>Ressenti : {sf.ressenti}</span>}
            {sf.distance && <span>Distance : {sf.distance}</span>}
            {sf.temps && <span>Temps : {sf.temps}</span>}
          </>
        ) : <span>En cours, pas encore terminée</span>}
      </p>
      {douleur && (
        <p className="espace-verrou espace-verrou--fort fiche-douleur">
          Douleur signalée{douleur.endroit ? ` : ${douleur.endroit}` : ''}.{douleur.note ? ` ${douleur.note}` : ''}
        </p>
      )}
      {detail.length > 0 && (
        <ul className="fiche-exos">
          {detail.map((x) => (
            <li key={x.cle} className="fiche-exo">
              <p className={`fiche-exo__nom${x.retire ? ' fiche-exo__nom--retire' : ''}`}>{x.nom}</p>
              <ol className="fiche-series">
                {x.lignes.map((l, i) => (
                  <li key={i} className={l.fait === false ? 'fiche-serie fiche-serie--non' : 'fiche-serie'}>
                    <span className="fiche-serie__num">Série {i + 1}</span> {texteSerie(l)}
                  </li>
                ))}
              </ol>
            </li>
          ))}
        </ul>
      )}
      <form className="fiche-commentaire" onSubmit={enregistrer}>
        <div className="champ-groupe">
          <label htmlFor={id}>Votre commentaire</label>
          <textarea id={id} className="champ" rows={3} value={texte} onChange={(e) => { setTexte(e.target.value); setMessage('') }} />
        </div>
        <div className="espace-actions">
          <button type="submit" className="bouton bouton--secondaire bouton--compact" disabled={!modifie}>Enregistrer le commentaire</button>
        </div>
        <p className="espace-message" role="status">{message}</p>
        <p className="espace-message espace-message--erreur" role="alert">{erreur}</p>
      </form>
    </li>
  )
}

// Courbe de la meilleure charge de chaque séance : ligne encre, points vermillon, axes nommés. Pas de bibliothèque.
function Courbe({ nom, points }) {
  const L = 300; const H = 170; const g = 44; const d = 14; const h = 14; const b = 32
  const val = (p) => parseFloat(String(p.charge).replace(',', '.')) || 0
  const valeurs = points.map(val)
  const min = Math.min(...valeurs); const max = Math.max(...valeurs)
  const n = points.length
  const x = (i) => (n === 1 ? g + (L - g - d) / 2 : g + (i * (L - g - d)) / (n - 1))
  const y = (v) => (max === min ? h + (H - h - b) / 2 : h + (1 - (v - min) / (max - min)) * (H - h - b))
  const etiquettes = [...new Set(n <= 4 ? points.map((_, i) => i) : [0, Math.round((n - 1) / 3), Math.round((2 * (n - 1)) / 3), n - 1])]
  const dernier = points[n - 1]
  const description = points.map((p) => `${dateCourte(p.date)}, ${fr(p.charge)} kg${p.reps ? ` pour ${p.reps} répétitions` : ''}`).join(' ; ')
  return (
    <li className="espace-carte fiche-courbe">
      <div className="client-courbe__tete">
        <h3 className="espace-element__titre">{nom}</h3>
        <p className="client-courbe__derniere">{fr(dernier.charge)} kg{dernier.reps ? ` × ${dernier.reps}` : ''}</p>
      </div>
      <svg className="fiche-svg" viewBox={`0 0 ${L} ${H}`} role="img" aria-label={`${nom}, meilleure charge par séance : ${description}`}>
        <line className="fiche-svg__axe" x1={g} x2={L - d} y1={h} y2={h} />
        <line className="fiche-svg__axe" x1={g} x2={L - d} y1={H - b} y2={H - b} />
        <text className="fiche-svg__txt" x={g - 8} y={h + 4} textAnchor="end">{fr(max)} kg</text>
        {max !== min && <text className="fiche-svg__txt" x={g - 8} y={H - b + 4} textAnchor="end">{fr(min)} kg</text>}
        {n > 1 && <polyline className="fiche-svg__ligne" points={points.map((p, i) => `${x(i)},${y(val(p))}`).join(' ')} />}
        {points.map((p, i) => <circle key={i} className="fiche-svg__point" cx={x(i)} cy={y(val(p))} r="6" />)}
        {etiquettes.map((i) => (
          <text key={i} className="fiche-svg__txt" x={x(i)} y={H - 8} textAnchor={n === 1 ? 'middle' : i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'}>{dateCourte(points[i].date)}</text>
        ))}
      </svg>
      <p className="espace-aide">{evolutionCharges(points)}</p>
      <table className="sr-only">
        <caption>{nom} : meilleure charge de chaque séance</caption>
        <thead><tr><th scope="col">Date</th><th scope="col">Charge</th><th scope="col">Répétitions</th></tr></thead>
        <tbody>{points.map((p, i) => <tr key={i}><td>{dateCourte(p.date)}</td><td>{fr(p.charge)} kg</td><td>{p.reps}</td></tr>)}</tbody>
      </table>
    </li>
  )
}

// Suppression : le coach doit retaper le prénom du client.
function DialogueSuppression({ client, uid, fermer, fini }) {
  const ref = useRef(null)
  const [saisie, setSaisie] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [erreur, setErreur] = useState('')
  const norme = (t) => t.trim().normalize('NFC').toLocaleLowerCase('fr')
  const bon = norme(saisie) !== '' && norme(saisie) === norme(client.prenom ?? '')

  useEffect(() => { const d = ref.current; if (d && !d.open) d.showModal() }, [])

  async function supprimer(e) {
    e.preventDefault()
    if (!bon || envoi) return
    setEnvoi(true); setErreur('')
    try {
      await supprimerClient(uid)
      fini()
    } catch (err) {
      setErreur(messageErreur(err.code))
      setEnvoi(false)
    }
  }

  return (
    <dialog ref={ref} className="espace-dialogue" aria-labelledby="supp-titre" aria-describedby="supp-texte" onClose={fermer}
      onCancel={(e) => { if (envoi) e.preventDefault() }}
      onClick={(e) => { if (e.target === ref.current && !envoi) ref.current.close() }}>
      <form className="espace-formulaire" onSubmit={supprimer} noValidate>
        <h2 id="supp-titre" className="titre titre--tuile">Supprimer {client.prenom} {client.nom} ?</h2>
        <p id="supp-texte" className="espace-texte">
          Son compte, ses programmes, ses séances et ses photos seront effacés définitivement. Cette action ne peut pas être annulée.
        </p>
        <div className="champ-groupe">
          <label htmlFor="supp-prenom">Pour confirmer, tapez son prénom : {client.prenom}</label>
          <input id="supp-prenom" className="champ" autoComplete="off" autoFocus value={saisie}
            onChange={(e) => { setSaisie(e.target.value); setErreur('') }} />
        </div>
        <p className="espace-message espace-message--erreur" role="alert">{erreur}</p>
        <div className="espace-actions">
          <button type="submit" className="bouton bouton--principal" disabled={!bon || envoi}>{envoi ? 'Suppression…' : 'Supprimer définitivement'}</button>
          <button type="button" className="bouton bouton--secondaire" disabled={envoi} onClick={() => ref.current.close()}>Annuler</button>
        </div>
      </form>
    </dialog>
  )
}
