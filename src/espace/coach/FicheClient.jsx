import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ecouterProgrammes, ecouterSeancesClient, commenterSeance, supprimerClient, programmeEnCours,
} from '../depots.js'
import { aujourdhuiIso, meilleuresCharges, regularite } from '../donnees/calculs.js'
import { dateCourte, dateLongue, detailSeance, evolutionCharges, exercicesDe, fr, texteSerie } from '../donnees/seances.js'
import { messageErreur } from '../erreurs.js'
import { noterVisio } from '../depots.js'
import { dateSeance } from '../donnees/progression.js'
import { avancement } from '../donnees/progression.js'
import { effortMoyen, frNombre, meilleurProgres } from '../donnees/resume.js'
import EnteteCoache, { useCoache } from './EnteteCoache.jsx'
import { derniereVisite, noterVisite, nouvellesSeances } from './vus.js'

const NB_POINTS = 8 // dernières séances montrées par exercice
const STATUTS = { 'invité': 'Invité', actif: 'Actif', 'en pause': 'En pause' }
const Fleche = () => (
  <svg width="20" height="20" aria-hidden="true" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"><path d="M216 128H40M112 56l-72 72 72 72" /></svg>
)

// Fiche d'un coaché : programme en cours, séances faites, courbes de charges, suppression.
export default function FicheClient() {
  const { uid } = useParams()
  const navigate = useNavigate()
  const { client, majClient } = useCoache()
  const [programmes, setProgrammes] = useState(null)
  const [seances, setSeances] = useState(null)
  const [erreur, setErreur] = useState('')
  const [suppression, setSuppression] = useState(false)
  const [tout, setTout] = useState(false) // toutes les séances, pas seulement les 8 dernières

  useEffect(() => ecouterProgrammes(uid, setProgrammes, () => setErreur('Impossible de charger les programmes. Vérifiez votre connexion.')), [uid])
  useEffect(() => ecouterSeancesClient(uid, setSeances, () => setErreur('Impossible de charger les séances. Vérifiez votre connexion.')), [uid])

  // dernière visite : lue une fois à l'arrivée (repères « Nouveau »), puis remplacée par maintenant
  const [vuAvant] = useState(() => derniereVisite(uid))
  useEffect(() => { if (seances) noterVisite(uid) }, [uid, seances])

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

  const av = progEnCours ? avancement(progEnCours, faites) : null
  const effort = effortMoyen(terminees)
  const progres = meilleurProgres(programmes ?? [], seances ?? [])
  const nouvelles = new Set(nouvellesSeances(seances, vuAvant).map((s) => s.id))

  return (
    <section className="section">
      <div className="conteneur espace-coach fiche-client">
        <EnteteCoache client={client} uid={uid} nouveautes={nouvelles.size}
          actions={<Link to={`/espace/coach/clients/${uid}/programme`} className="bouton bouton--principal">{programmes?.length ? 'Modifier le programme' : 'Créer un programme'}</Link>} />
        <p className="espace-message espace-message--erreur" role="alert">{erreur}</p>

        <ul className="chiffres-coache" aria-label="Chiffres clés">
          <li className="espace-carte chiffre-coache">
            {enCours
              ? <><span className="chiffre-coache__val">{enCours.semaine === 0 ? '—' : enCours.semaine}<small>sur {enCours.nbSemaines}</small></span>
                <span className="chiffre-coache__lib">{enCours.semaine === 0 ? `Commence le ${dateLongue(enCours.debut)}` : 'Semaine en cours'} · {enCours.nom}</span>
                <span className="chiffre-coache__barre" aria-hidden="true"><span style={{ width: `${Math.round((Math.max(0, enCours.semaine) / Math.max(1, enCours.nbSemaines)) * 100)}%` }} /></span></>
              : <><span className="chiffre-coache__val chiffre-coache__val--vide">—</span><span className="chiffre-coache__lib">Pas de programme publié</span></>}
          </li>
          <li className="espace-carte chiffre-coache">
            <span className="chiffre-coache__val">{av ? av.faites : terminees.length}<small>{av ? `sur ${av.prevues}` : 'séances'}</small></span>
            <span className="chiffre-coache__lib">{av ? 'séances faites dans ce programme' : 'séances faites'}</span>
            {av && av.prevues > 0 && <span className="chiffre-coache__barre" aria-hidden="true"><span style={{ width: `${Math.round((av.faites / av.prevues) * 100)}%` }} /></span>}
          </li>
          <li className="espace-carte chiffre-coache">
            {effort !== null
              ? <><span className="chiffre-coache__val">{frNombre(effort)}<small>/ 10</small></span><span className="chiffre-coache__lib">effort moyen des 3 dernières séances</span></>
              : <><span className="chiffre-coache__val chiffre-coache__val--vide">—</span><span className="chiffre-coache__lib">effort moyen, dès les premières séances</span></>}
          </li>
          <li className="espace-carte chiffre-coache">
            {progres
              ? <><span className="chiffre-coache__val">{frNombre(progres.ecart, true)}<small>kg</small></span><span className="chiffre-coache__lib">au {progres.nom.toLowerCase()} depuis le début</span></>
              : <><span className="chiffre-coache__val chiffre-coache__val--vide">—</span><span className="chiffre-coache__lib">progrès de charge, dès deux séances notées</span></>}
          </li>
        </ul>

        <div className="suivi-colonnes">
          <section className="espace-carte suivi-seances" aria-labelledby="fiche-seances">
            <div className="suivi-titre">
              <h2 id="fiche-seances" className="espace-sous-titre">Dernières séances</h2>
              <span className="espace-aide">Les plus récentes en premier</span>
            </div>
            {seances === null ? <p className="espace-texte" role="status">Chargement…</p>
              : seances.length === 0 ? <p className="espace-texte">{client.prenom} n’a pas encore enregistré de séance.</p> : (
                <>
                <ul className="fiche-liste">
                  {seances.slice(0, tout ? seances.length : 8).map((s) => (
                    <SeanceFaite key={s.id} sf={s} seance={trouverSeance(programmes, s)} prenom={client.prenom} nouvelle={nouvelles.has(s.id)} />
                  ))}
                </ul>
                {seances.length > 8 && !tout && (
                  <button type="button" className="bouton bouton--secondaire bouton--compact suivi-plus" onClick={() => setTout(true)}>
                    Voir les {seances.length - 8} séances plus anciennes
                  </button>
                )}
                </>
              )}
          </section>

          <div className="suivi-cote">
            <Visio uid={uid} client={client} majClient={majClient} semaine={enCours?.semaine ?? 0} />
            {progEnCours && (
              <section className="espace-carte" aria-labelledby="fiche-reg">
                <h2 id="fiche-reg" className="espace-sous-titre">Régularité</h2>
                <Regularite semaines={regularite(progEnCours, faites)} />
              </section>
            )}
            {courbes.length > 0 && (
              <section aria-labelledby="fiche-charges" className="suivi-courbes">
                <h2 id="fiche-charges" className="sr-only">Charges (meilleure série)</h2>
                <ul className="fiche-liste fiche-courbes">
                  {courbes.map((c) => <Courbe key={c.exoId} nom={c.nom} points={c.points.slice(-NB_POINTS)} />)}
                </ul>
              </section>
            )}
            <section className="fiche-bloc fiche-danger" aria-labelledby="fiche-supp">
              <h2 id="fiche-supp" className="espace-sous-titre">Supprimer ce client</h2>
              <p className="espace-texte">Le compte, les programmes, les séances et les photos de {client.prenom} sont effacés définitivement.</p>
              <button type="button" className="bouton bouton--secondaire" onClick={() => setSuppression(true)}>Supprimer ce client et ses données</button>
            </section>
          </div>
        </div>
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

function SeanceFaite({ sf, seance, prenom, nouvelle }) {
  const [texte, setTexte] = useState(sf.commentaireCoach ?? '')
  const [message, setMessage] = useState('')
  const [erreur, setErreur] = useState('')
  const enregistre = sf.commentaireCoach ?? ''
  const modifie = texte.trim() !== enregistre.trim()
  const id = `com-${sf.id}`
  const douleur = sf.douleur?.oui ? sf.douleur : null
  const detail = detailSeance(seance, sf.series)
  // Notes écrites par le client sous chaque exercice pendant la séance (champ « notes », une par exercice)
  const nomsElements = new Map((seance?.blocs ?? []).flatMap((bl) => (bl.elements ?? []).map((e) => [e.id, e.nom])))
  const notesExos = Object.entries(sf.notes ?? {})
    .filter(([, t]) => String(t ?? '').trim())
    .map(([id, t]) => ({ id, nom: nomsElements.get(id) ?? 'Exercice retiré du programme', texte: String(t).trim() }))
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
        <h3 className="espace-element__titre">{seance ? seance.titre || 'Séance' : 'Séance retirée du programme'}{nouvelle && <span className="repere-nouveau">Nouveau</span>}</h3>
        <p className="fiche-seance__date">{dateLongue(sf.date)}{terminee && heure(sf.majLe) && ` · ${heure(sf.majLe)}`}</p>
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
      {sf.commentaire && (
        <p className="espace-verrou espace-verrou--fort fiche-douleur fiche-commentaire">
          Commentaire du client : {sf.commentaire}
        </p>
      )}
      {notesExos.length > 0 && (
        <div className="fiche-notes">
          <p className="fiche-notes__titre">Notes du client sur les exercices</p>
          <ul className="fiche-notes__liste">
            {notesExos.map((n) => <li key={n.id}><strong>{n.nom}</strong> : {n.texte}</li>)}
          </ul>
        </div>
      )}
      {terminee && sf.fc && <p className="fiche-seance__bilan"><span>Fréquence cardiaque : {sf.fc}</span></p>}
      {douleur && (
        <p className="espace-verrou espace-verrou--fort fiche-douleur">
          Douleur signalée{douleur.endroit ? ` : ${douleur.endroit}` : ''}.{douleur.note ? ` ${douleur.note}` : ''}
        </p>
      )}
      {detail.length > 0 && (
        <details className="fiche-detail">
          <summary>Détail des séries · {detail.length} exercice{detail.length > 1 ? 's' : ''}</summary>
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
        </details>
      )}
      <form className="fiche-commentaire" onSubmit={enregistrer}>
        <label htmlFor={id} className="sr-only">Votre réponse à {prenom}</label>
        <div className="fiche-repondre">
          <textarea id={id} className="champ" rows={1} placeholder={`Répondre à ${prenom}…`} value={texte}
            onChange={(e) => { setTexte(e.target.value); setMessage('') }} />
          <button type="submit" className="bouton bouton--principal bouton--compact" disabled={!modifie}>{enregistre ? 'Mettre à jour' : 'Envoyer'}</button>
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

// Heure de fin d'une séance (horodatage du serveur) : « 18 h 42 »
function heure(ts) {
  const d = ts?.toDate?.()
  if (!d) return ''
  return `${d.getHours()} h ${String(d.getMinutes()).padStart(2, '0')}`
}

// Dernière visio avec le coaché (maquette PDF) : notée par Marie, affichée sur « Mes coachés »
function Visio({ uid, client, majClient, semaine }) {
  const [date, setDate] = useState(aujourdhuiIso())
  const [message, setMessage] = useState('')
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const v = client.derniereVisio
  async function noter(e) {
    e.preventDefault()
    if (!date || date > aujourdhuiIso()) { setErreur('Choisissez une date passée ou aujourd’hui.'); return }
    setEnvoi(true); setErreur(''); setMessage('')
    const visio = { date, semaine: semaine || null }
    try {
      await noterVisio(uid, visio)
      majClient({ derniereVisio: visio })
      setMessage('Visio notée.')
    } catch (err) { setErreur(messageErreur(err.code)) }
    setEnvoi(false)
  }
  return (
    <section className="espace-carte visio" aria-labelledby="fiche-visio">
      <h2 id="fiche-visio" className="espace-sous-titre">Visio</h2>
      <p className="espace-texte">{v?.date ? `Dernière visio : ${v.semaine ? `S${v.semaine} · ` : ''}${dateSeance(v.date)}` : 'Aucune visio notée.'}</p>
      <form className="visio__form" onSubmit={noter}>
        <div className="champ-groupe">
          <label htmlFor="visio-date">Date de la visio</label>
          <input id="visio-date" type="date" className="champ" value={date} max={aujourdhuiIso()} onChange={(e) => setDate(e.target.value)} />
        </div>
        <button type="submit" className="bouton bouton--secondaire bouton--compact" disabled={envoi}>{envoi ? 'Enregistrement…' : 'Noter la visio'}</button>
      </form>
      <p className="espace-message" role="status">{message}</p>
      <p className="espace-message espace-message--erreur" role="alert">{erreur}</p>
    </section>
  )
}
