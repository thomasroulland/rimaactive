import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  lireProfil, ecouterProgrammes, ecouterExercices, enregistrerProgramme, publierProgramme, ecouterVerrous,
} from '../depots.js'
import {
  nouveauProgramme, dupliquerSemaine, semaineVide, nouvelleSemaine, nouvelleSeance, ajouterAuBloc, retirerElement,
  garderSeancesFaites,
} from '../donnees/programme.js'
import { dateLongue } from '../donnees/calculs.js'
import { messageErreur } from '../erreurs.js'
import CreationProgramme, { ChoixDebut } from './CreationProgramme.jsx'
import EditeurSeance from './EditeurSeance.jsx'
import Confirmation from './Confirmation.jsx'
import useGardeSortie from './useGardeSortie.js'

const MAX_SEMAINES = 12
const Fleche = () => (
  <svg width="20" height="20" aria-hidden="true" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"><path d="M216 128H40M112 56l-72 72 72 72" /></svg>
)

// Copie locale modifiable d'un programme Firestore (sans l'horodatage du serveur)
function copieLocale(p) {
  const copie = structuredClone({ ...p })
  delete copie.majLe // réécrit par le serveur à chaque enregistrement
  return copie
}

function resumeSeance(s) {
  if (s.type === 'course') return ['Course', s.distance, s.temps].filter(Boolean).join(' · ')
  const noms = (s.blocs ?? []).flatMap((b) => b.elements ?? []).map((e) => e.nom)
  if (noms.length === 0) return 'Aucun exercice'
  return `${noms.length} exercice${noms.length > 1 ? 's' : ''} · ${noms.slice(0, 3).join(', ')}${noms.length > 3 ? '…' : ''}`
}

// Créer / modifier le programme d'un coaché (/espace/coach/clients/:uid/programme).
// Paramètres d'adresse : ?nouveau=1 (création), ?semaine=N, ?seance=<id> (éditeur de séance).
export default function EditeurProgramme() {
  const { uid } = useParams()
  const [params, setParams] = useSearchParams()
  const [client, setClient] = useState(undefined)
  const [programmes, setProgrammes] = useState(null)
  const [exercices, setExercices] = useState(null)
  const [prog, setProg] = useState(null)
  const [modifie, setModifie] = useState(false)
  const [verrous, setVerrous] = useState(null) // null : pas encore vérifié, tout reste verrouillé
  const [erreurVerrous, setErreurVerrous] = useState('')
  const [message, setMessage] = useState('')
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [confirmation, setConfirmation] = useState(null)
  const version = useRef(0)

  const creation = params.get('nouveau') === '1'
  const nbSem = prog?.semaines.length ?? 0
  const semIdx = Math.min(Math.max((Number(params.get('semaine')) || 1) - 1, 0), Math.max(nbSem - 1, 0))
  const seanceId = params.get('seance')

  useEffect(() => {
    lireProfil(uid).then(setClient).catch(() => setErreur('Impossible de charger ce coaché. Vérifiez votre connexion.'))
  }, [uid])
  useEffect(() => ecouterProgrammes(uid, setProgrammes, () => setErreur('Impossible de charger les programmes. Vérifiez votre connexion.')), [uid])
  useEffect(() => ecouterExercices(setExercices, () => setExercices([])), [])

  // Ouvre le programme le plus récent au premier chargement
  useEffect(() => {
    if (!prog && !creation && programmes?.length) ouvrir(programmes[0])
  }, [programmes, prog, creation])

  // Verrous en direct : une séance terminée pendant l'édition se verrouille aussitôt
  const progId = prog?.id
  useEffect(() => {
    if (!progId) return undefined
    setVerrous(null); setErreurVerrous('')
    return ecouterVerrous(progId, (v) => { setVerrous(v); setErreurVerrous('') },
      () => setErreurVerrous('Impossible de vérifier les séances déjà faites : la modification des séances est bloquée. Rechargez la page.'))
  }, [progId])

  // Statut venu du serveur (publication depuis un autre onglet) : jamais réécrit par l'éditeur
  useEffect(() => {
    const serveur = programmes?.find((p) => p.id === progId)
    if (serveur) setProg((p) => (p && p.id === serveur.id && p.statut !== serveur.statut ? { ...p, statut: serveur.statut } : p))
  }, [programmes, progId])

  // Avertit avant de quitter la page avec des modifications non enregistrées
  useEffect(() => {
    if (!modifie) return undefined
    const avertir = (e) => { e.preventDefault(); e.returnValue = '' }
    window.addEventListener('beforeunload', avertir)
    return () => window.removeEventListener('beforeunload', avertir)
  }, [modifie])

  // Revient en haut (et efface l'erreur de l'écran précédent) quand on ouvre ou ferme une séance
  useEffect(() => { window.scrollTo(0, 0); setErreur('') }, [seanceId])

  function ouvrir(p) {
    setProg(copieLocale(p))
    setModifie(false)
  }

  // Applique une modification (fonction pure programme -> programme)
  function changer(fn) {
    version.current += 1
    setProg((p) => fn(p))
    setModifie(true)
    setMessage('')
  }
  const muter = (fn) => changer((p) => { const c = structuredClone(p); fn(c); return c })

  const aller = (suite, remplacer = false) => {
    const n = new URLSearchParams()
    if (suite.semaine) n.set('semaine', String(suite.semaine))
    if (suite.seance) n.set('seance', suite.seance)
    if (suite.nouveau) n.set('nouveau', '1')
    setParams(n, { replace: remplacer })
  }

  function demander(c) { setConfirmation(c) }
  const QUITTER = { titre: 'Quitter sans enregistrer ?', texte: 'Vos modifications non enregistrées seront perdues.', libelle: 'Quitter sans enregistrer' }
  useGardeSortie(modifie, (continuer) => demander({ ...QUITTER, action: continuer }))
  const estVerrou = (id) => verrous === null || verrous.has(id)

  async function creer({ id, nom, semaines, parSemaine, debut }) {
    setEnvoi(true); setErreur('')
    const p = { id, ...nouveauProgramme({ client: uid, nom, debut, semaines, parSemaine }) }
    try {
      await enregistrerProgramme(p, { creation: true })
    } catch (e) {
      setEnvoi(false)
      throw new Error(messageErreur(e.code))
    }
    setEnvoi(false)
    setProg(p); setModifie(false)
    aller({ semaine: 1 })
    setMessage('Programme créé en brouillon : remplissez les séances, puis publiez-le.')
  }

  async function enregistrer(publier) {
    if (!prog.nom.trim()) { setErreur('Donnez un nom au programme avant d’enregistrer.'); return }
    if (verrous === null) { setErreur('Vérification des séances déjà faites en cours : réessayez dans un instant.'); return }
    const v = version.current
    const etaitPublie = prog.statut === 'publié'
    setEnvoi(true); setErreur(''); setMessage('')
    try {
      const serveur = programmes?.find((p) => p.id === prog.id)
      const aEcrire = garderSeancesFaites(prog, serveur, verrous)
      await enregistrerProgramme(aEcrire)
      if (aEcrire !== prog) setProg((p) => garderSeancesFaites(p, serveur, verrous))
      if (publier) {
        await publierProgramme(prog.id)
        setProg((p) => ({ ...p, statut: 'publié' }))
      }
      if (version.current === v) setModifie(false)
      setMessage(publier
        ? `Programme publié : ${client?.prenom ?? 'votre coaché'} le voit dans son espace.`
        : etaitPublie ? 'Modifications enregistrées : votre coaché voit la nouvelle version.' : 'Brouillon enregistré.')
    } catch (e) {
      setErreur(messageErreur(e.code))
    }
    setEnvoi(false)
  }

  // ---------- Semaines ----------
  function dupliquer() {
    const i = semIdx
    const suivante = prog.semaines[i + 1]
    if (!suivante && nbSem >= MAX_SEMAINES) { setErreur(`Un programme compte ${MAX_SEMAINES} semaines au plus.`); return }
    if (verrous === null) { setErreur('Vérification des séances déjà faites en cours : réessayez dans un instant.'); return }
    if (suivante?.seances.some((s) => verrous.has(s.id))) {
      setErreur(`La semaine S${i + 2} contient des séances déjà faites : elle ne peut pas être remplacée.`)
      return
    }
    const faire = () => {
      changer((p) => dupliquerSemaine(p, i))
      aller({ semaine: i + 2 }, true)
      setMessage(`Semaine S${i + 1} copiée dans la semaine S${i + 2}.`)
    }
    setErreur('')
    if (suivante && !semaineVide(suivante)) {
      demander({
        titre: `Remplacer la semaine S${i + 2} ?`,
        texte: `La semaine S${i + 2} contient déjà des séances. Elle sera remplacée par une copie de la semaine S${i + 1}.`,
        libelle: `Remplacer la semaine S${i + 2}`,
        action: faire,
      })
    } else faire()
  }

  function ajouterSemaine() {
    if (nbSem >= MAX_SEMAINES) { setErreur(`Un programme compte ${MAX_SEMAINES} semaines au plus.`); return }
    setErreur('')
    muter((p) => { p.semaines.push(nouvelleSemaine(p.parSemaine)) })
    aller({ semaine: nbSem + 1 }, true)
    setMessage(`Semaine S${nbSem + 1} ajoutée.`)
  }

  function ajouterSeance(type) {
    const s = nouvelleSeance(type, type === 'course' ? 'Mercredi' : 'Lundi')
    muter((p) => { p.semaines[semIdx].seances.push(s) })
    aller({ semaine: semIdx + 1, seance: s.id })
  }

  function supprimerSeance(s, numero) {
    demander({
      titre: `Supprimer la séance ${numero} ?`,
      texte: `« ${s.titre || 'Séance sans titre'} » et ses exercices seront retirés de la semaine S${semIdx + 1}.`,
      libelle: 'Supprimer la séance',
      action: () => {
        muter((p) => { p.semaines[semIdx].seances = p.semaines[semIdx].seances.filter((x) => x.id !== s.id) })
        setMessage('Séance supprimée.')
      },
    })
  }

  // ---------- Affichage ----------
  const nomClient = client ? `${client.prenom} ${client.nom}` : ''
  const dialogue = confirmation && <Confirmation {...confirmation} fermer={() => setConfirmation(null)} />
  const alerteVerrous = erreurVerrous && <p className="espace-message espace-message--erreur">{erreurVerrous}</p>
  const retourCoaches = <Link to="/espace/coach" className="espace-retour"><Fleche /> Mes coachés</Link>

  if (client === null) {
    return (
      <section className="section"><div className="conteneur espace-coach">
        {retourCoaches}
        <p className="espace-texte">Ce coaché n’existe pas.</p>
      </div></section>
    )
  }
  if (programmes === null || client === undefined || (!creation && programmes.length > 0 && !prog)) {
    return <p className="section espace-attente" role="status">{erreur || 'Chargement…'}</p>
  }

  const messages = (
    <>
      <p className="espace-message" role="status">{message}</p>
      <p className="espace-message espace-message--erreur" role="alert">{erreur}</p>
    </>
  )

  if (creation || !prog) {
    return (
      <section className="section">
        <div className="conteneur espace-coach">
          {retourCoaches}
          <header>
            <p className="surtitre">Programme de {nomClient}</p>
            <h1 className="titre titre--section">Nouveau programme</h1>
          </header>
          {messages}
          <CreationProgramme prenom={client.prenom} creer={creer} envoi={envoi}
            annuler={prog ? () => aller({ semaine: semIdx + 1 }) : null} />
        </div>
        {dialogue}
      </section>
    )
  }

  const semaine = prog.semaines[semIdx]
  const seIdx = seanceId ? semaine.seances.findIndex((s) => s.id === seanceId) : -1
  const seance = seIdx >= 0 ? semaine.seances[seIdx] : null
  const publie = prog.statut === 'publié'

  const barre = (
    <div className="espace-barre" role="region" aria-label="Enregistrement">
      <div className="conteneur espace-barre__ligne">
        <p className="espace-barre__etat">
          <span className={`espace-statut espace-statut--${publie ? 'actif' : 'autre'}`}>{publie ? 'Publié' : 'Brouillon'}</span>
          <span>{modifie ? 'Modifications non enregistrées.' : publie ? 'Votre coaché voit ce programme.' : 'Votre coaché ne le voit pas encore.'}</span>
        </p>
        <div className="espace-actions">
          {publie ? (
            <button type="button" className="bouton bouton--principal" disabled={envoi || !modifie} onClick={() => enregistrer(false)}>
              {envoi ? 'Enregistrement…' : 'Enregistrer les modifications'}
            </button>
          ) : (
            <>
              <button type="button" className="bouton bouton--secondaire" disabled={envoi} onClick={() => enregistrer(false)}>
                {envoi ? 'Enregistrement…' : 'Enregistrer le brouillon'}
              </button>
              <button type="button" className="bouton bouton--principal" disabled={envoi} onClick={() => enregistrer(true)}>Publier</button>
            </>
          )}
        </div>
      </div>
    </div>
  )

  // ---------- Vue séance ----------
  if (seance) {
    const majSeance = (cle, v) => muter((p) => { p.semaines[semIdx].seances[seIdx][cle] = v })
    const majBloc = (bi, cle, v) => muter((p) => { p.semaines[semIdx].seances[seIdx].blocs[bi][cle] = v })
    const majElement = (bi, ei, cle, v) => muter((p) => { p.semaines[semIdx].seances[seIdx].blocs[bi].elements[ei][cle] = v })
    return (
      <>
        <section className="section espace-section--barre">
          <div className="conteneur espace-coach">
            <Link to={`?semaine=${semIdx + 1}`} className="espace-retour"><Fleche /> Semaine S{semIdx + 1}</Link>
            <header>
              <p className="surtitre">{nomClient} · {prog.nom} · S{semIdx + 1}</p>
              <h1 className="titre titre--section">{seance.titre || `Séance ${seIdx + 1}`}</h1>
            </header>
            {messages}
            {alerteVerrous}
            <EditeurSeance seance={seance} numero={seIdx + 1} semaine={semIdx + 1} verrou={estVerrou(seance.id)} attente={verrous === null} exercices={exercices}
              majSeance={majSeance} majBloc={majBloc} majElement={majElement}
              retirer={(el) => { changer((p) => retirerElement(p, { s: semIdx, se: seIdx }, el.id)); setMessage(`« ${el.nom} » retiré de la séance.`) }}
              ajouter={(lettre, exo) => { changer((p) => ajouterAuBloc(p, { s: semIdx, se: seIdx }, lettre, exo)); setMessage(`« ${exo.nom} » ajouté au bloc ${lettre}.`) }} />
          </div>
        </section>
        {barre}
        {dialogue}
      </>
    )
  }

  // ---------- Vue programme / semaine ----------
  return (
    <>
      <section className="section espace-section--barre">
        <div className="conteneur espace-coach">
          {retourCoaches}
          <header className="espace-coach__entete">
            <div>
              <p className="surtitre">Programme de {nomClient}</p>
              <h1 className="titre titre--section">{prog.nom || 'Programme sans nom'}</h1>
              <p className="espace-texte">{nbSem} semaines · début le {dateLongue(prog.debut)}</p>
            </div>
            <div className="espace-actions">
              {programmes.length > 1 && (
                <div className="champ-groupe espace-autres">
                  <label htmlFor="prog-choix">Programme affiché</label>
                  <select id="prog-choix" className="champ" value={prog.id} onChange={(e) => {
                    const cible = programmes.find((p) => p.id === e.target.value)
                    const go = () => { ouvrir(cible); aller({ semaine: 1 }, true) }
                    if (modifie) demander({ ...QUITTER, action: go })
                    else go()
                  }}>
                    {programmes.map((p) => <option key={p.id} value={p.id}>{p.nom} ({p.statut === 'publié' ? 'publié' : 'brouillon'}, {p.debut})</option>)}
                  </select>
                </div>
              )}
              <button type="button" className="bouton bouton--secondaire" onClick={() => {
                const go = () => aller({ nouveau: true })
                if (modifie) demander({ ...QUITTER, action: go })
                else go()
              }}>Créer un nouveau programme</button>
            </div>
          </header>
          {messages}
          {alerteVerrous}

          <div className="espace-carte espace-params espace-params--programme">
            <div className="champ-groupe espace-param espace-param--large">
              <label htmlFor="prog-nom">Nom du programme</label>
              <input id="prog-nom" className="champ" autoComplete="off" value={prog.nom} onChange={(e) => { const v = e.target.value; muter((p) => { p.nom = v }) }} />
            </div>
            <ChoixDebut id="prog-debut" valeur={prog.debut} changer={(v) => muter((p) => { p.debut = v })}
              desactive={verrous === null || verrous.size > 0}
              aide={verrous?.size > 0 ? 'Des séances sont déjà faites : la date de début ne change plus.' : ''} />
          </div>

          <div className="espace-semaines">
            <div role="group" aria-label="Semaines" className="espace-pastilles">
              {prog.semaines.map((w, i) => (
                <button key={w.id} type="button" className="espace-pastille" aria-pressed={i === semIdx}
                  onClick={() => aller({ semaine: i + 1 }, true)}>
                  S{i + 1}<span className="sr-only">, semaine {i + 1}</span>
                </button>
              ))}
            </div>
            <div className="espace-actions">
              <button type="button" className="espace-lien" onClick={dupliquer}>Dupliquer la semaine</button>
              <button type="button" className="espace-lien" onClick={ajouterSemaine}>Ajouter une semaine</button>
            </div>
          </div>

          <div className="espace-carte espace-params espace-params--semaine">
            <div className="champ-groupe espace-param">
              <label htmlFor="sem-rpe">RPE visé S{semIdx + 1}</label>
              <input id="sem-rpe" className="champ" inputMode="decimal" autoComplete="off" value={semaine.rpe ?? ''}
                onChange={(e) => { const v = e.target.value; muter((p) => { p.semaines[semIdx].rpe = v }) }} />
            </div>
            <div className="champ-groupe espace-param espace-param--large">
              <label htmlFor="sem-mot">Le mot de la semaine (vu par le coaché)</label>
              <input id="sem-mot" className="champ" autoComplete="off" value={semaine.mot ?? ''}
                onChange={(e) => { const v = e.target.value; muter((p) => { p.semaines[semIdx].mot = v }) }} />
            </div>
          </div>

          {semaine.seances.length === 0
            ? <p className="espace-texte">Aucune séance cette semaine. Ajoutez-en une ci-dessous.</p>
            : (
              <ol className="espace-grille espace-seances">
                {semaine.seances.map((s, i) => {
                  const faite = verrous?.has(s.id)
                  return (
                    <li key={s.id} className="espace-carte espace-seance-carte">
                      <div className="espace-seance-carte__tete">
                        <span className="espace-seance-carte__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                        <span className="espace-seance-carte__jour">{s.jour}</span>
                      </div>
                      <h2 className="espace-seance-carte__titre">
                        <span className="sr-only">Séance {i + 1} : </span>{s.titre || 'Séance sans titre'}
                      </h2>
                      <p className="espace-seance-carte__resume">{resumeSeance(s)}</p>
                      {faite && <p className="espace-verrou espace-verrou--fort">Séance faite : non modifiable</p>}
                      <div className="espace-actions">
                        <Link to={`?semaine=${semIdx + 1}&seance=${s.id}`} className="bouton bouton--secondaire bouton--compact"
                          aria-label={`${faite ? 'Voir la séance' : 'Modifier la séance'} ${i + 1}`}>
                          {faite ? 'Voir la séance' : 'Modifier'}
                        </Link>
                        {!faite && verrous !== null && (
                          <button type="button" className="espace-lien" onClick={() => supprimerSeance(s, i + 1)}>
                            Supprimer<span className="sr-only"> la séance {i + 1}</span>
                          </button>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ol>
            )}
          <div className="espace-actions">
            <button type="button" className="bouton bouton--secondaire" onClick={() => ajouterSeance('force')}>Ajouter une séance de force</button>
            <button type="button" className="bouton bouton--secondaire" onClick={() => ajouterSeance('course')}>Ajouter une course</button>
          </div>
        </div>
      </section>
      {barre}
      {dialogue}
    </>
  )
}
