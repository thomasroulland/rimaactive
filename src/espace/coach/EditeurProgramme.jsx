import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  ecouterProgrammes, ecouterExercices, enregistrerProgramme, publierProgramme, ecouterVerrous,
} from '../depots.js'
import {
  nouveauProgramme, dupliquerSemaine, semaineVide, nouvelleSemaine, nouvelleSeance, ajouterAuBloc, retirerElement,
  garderSeancesFaites,
} from '../donnees/programme.js'
import { dateLongue } from '../donnees/calculs.js'
import { lignesExercice } from '../donnees/seances.js'
import EnteteCoache, { useCoache } from './EnteteCoache.jsx'
import { messageErreur } from '../erreurs.js'
import CreationProgramme, { ChoixDebut } from './CreationProgramme.jsx'
import EditeurSeance from './EditeurSeance.jsx'
import Confirmation from './Confirmation.jsx'
import GestionProgramme from './GestionProgramme.jsx'
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

// Créer / modifier le programme d'un coaché (/espace/coach/clients/:uid/programme).
// Paramètres d'adresse : ?nouveau=1 (création), ?semaine=N, ?seance=<id> (éditeur de séance).
export default function EditeurProgramme() {
  const { uid } = useParams()
  const [params, setParams] = useSearchParams()
  const { client } = useCoache()
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
  const [gestion, setGestion] = useState(false) // fenêtre « Gérer le programme »
  const [aOuvrir, setAOuvrir] = useState(null) // copie créée : ouverte dès qu'elle arrive du serveur
  const supprime = useRef(null) // programme supprimé : ne pas le rouvrir avant que la liste se mette à jour
  const version = useRef(0)
  const panneau = useRef(null)
  // une séance qui s'ouvre : son panneau vient à l'écran (sur téléphone, il remplace la liste)
  const seanceOuverte = params.get('seance')
  useEffect(() => {
    if (!seanceOuverte) return
    const el = panneau.current
    if (!el) return
    const haut = el.getBoundingClientRect().top
    if (haut < 0 || haut > window.innerHeight * 0.6) el.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' })
  }, [seanceOuverte])

  const creation = params.get('nouveau') === '1'
  const nbSem = prog?.semaines.length ?? 0
  const semIdx = Math.min(Math.max((Number(params.get('semaine')) || 1) - 1, 0), Math.max(nbSem - 1, 0))
  const seanceId = params.get('seance')

  useEffect(() => ecouterProgrammes(uid, setProgrammes, () => setErreur('Impossible de charger les programmes. Vérifiez votre connexion.')), [uid])
  useEffect(() => ecouterExercices(setExercices, () => setExercices([])), [])

  // Ouvre le programme le plus récent au premier chargement
  useEffect(() => {
    const restants = (programmes ?? []).filter((p) => p.id !== supprime.current)
    if (!prog && !creation && restants.length) ouvrir(restants[0])
  }, [programmes, prog, creation])

  // Verrous en direct : une séance terminée pendant l'édition se verrouille aussitôt
  const progId = prog?.id
  useEffect(() => {
    if (!progId) return undefined
    setVerrous(null); setErreurVerrous('')
    return ecouterVerrous(progId, (v) => { setVerrous(v); setErreurVerrous('') },
      () => setErreurVerrous('Impossible de vérifier les séances déjà faites : la modification des séances est bloquée. Rechargez la page.'))
  }, [progId])

  // Copie créée depuis « Gérer le programme » : ouverte dès qu'elle arrive du serveur
  useEffect(() => {
    const p = aOuvrir && programmes?.find((x) => x.id === aOuvrir)
    if (p) { ouvrir(p); setAOuvrir(null); aller({ semaine: 1 }, true) }
  }, [aOuvrir, programmes]) // eslint-disable-line react-hooks/exhaustive-deps

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
          <EnteteCoache client={client} uid={uid} chemin={[{ label: 'Nouveau programme' }]} />
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
          {modifie
            ? <span className="espace-barre__modifie">Modifications non enregistrées</span>
            : <span>{publie ? 'Votre coaché voit ce programme.' : 'Votre coaché ne le voit pas encore.'}</span>}
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

  const majSeance = (cle, v) => muter((p) => { p.semaines[semIdx].seances[seIdx][cle] = v })
  const majBloc = (bi, cle, v) => muter((p) => { p.semaines[semIdx].seances[seIdx].blocs[bi][cle] = v })
  const majElement = (bi, ei, cle, v) => muter((p) => { p.semaines[semIdx].seances[seIdx].blocs[bi].elements[ei][cle] = v })
  const lienSeance = (id) => `?semaine=${semIdx + 1}${id ? `&seance=${id}` : ''}`
  const chemin = [
    { label: `Programme « ${prog.nom || 'sans nom'} »`, to: '?semaine=1' },
    { label: `Semaine ${semIdx + 1}`, to: seance ? lienSeance(null) : null },
    ...(seance ? [{ label: seance.titre || `Séance ${seIdx + 1}` }] : []),
  ]

  // ---------- Vue programme : la semaine en colonnes ; une séance ouverte s'affiche dans un panneau à droite ----------
  return (
    <>
      <section className="section espace-section--barre">
        <div className="conteneur espace-coach">
          <EnteteCoache client={client} uid={uid} chemin={chemin}
            infos={`${prog.nom || 'Programme sans nom'} · ${nbSem} semaine${nbSem > 1 ? 's' : ''} · début le ${dateLongue(prog.debut)}`}
            actions={(
              <>
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
                <button type="button" className="bouton bouton--secondaire" onClick={() => setGestion(true)}>Gérer le programme</button>
                <button type="button" className="bouton bouton--secondaire" onClick={() => {
                  const go = () => aller({ nouveau: true })
                  if (modifie) demander({ ...QUITTER, action: go })
                  else go()
                }}>Nouveau programme</button>
              </>
            )} />
          {messages}
          {alerteVerrous}

          <div className="espace-carte espace-params espace-params--programme">
            <div className="champ-groupe espace-param espace-param--large">
              <label htmlFor="prog-nom">Nom du programme</label>
              <input id="prog-nom" className="champ" autoComplete="off" value={prog.nom} onChange={(e) => { const v = e.target.value; muter((p) => { p.nom = v }) }} />
            </div>
            <ChoixDebut id="prog-debut" valeur={prog.debut} changer={(v) => muter((p) => { p.debut = v })}
              desactive={verrous === null || verrous.size > 0}
              aide={verrous?.size > 0 ? 'Des séances sont déjà faites : pour décaler les dates, utilisez « Gérer le programme ».' : ''} />
          </div>

          <div className="espace-semaines">
            <div role="group" aria-label="Semaines" className="espace-pastilles">
              {prog.semaines.map((w, i) => (
                <button key={w.id} type="button" className="espace-pastille" aria-pressed={i === semIdx}
                  onClick={() => aller({ semaine: i + 1 }, true)}>
                  S{i + 1}<span className="sr-only">, semaine {i + 1}</span>
                </button>
              ))}
              <button type="button" className="espace-pastille espace-pastille--plus" onClick={ajouterSemaine}>+ Semaine</button>
            </div>
            <div className="espace-actions">
              <button type="button" className="espace-lien" onClick={dupliquer}>Dupliquer la semaine</button>
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

          <div className={`editeur-semaine${seance ? ' editeur-semaine--ouverte' : ''}`}>
            <div className="editeur-semaine__seances">
              {semaine.seances.length === 0
                ? <p className="espace-texte">Aucune séance cette semaine. Ajoutez-en une ci-dessous.</p>
                : (
                  <ol className="colonnes-seances">
                    {semaine.seances.map((s, i) => {
                      const faite = verrous?.has(s.id)
                      const ouverte = seance?.id === s.id
                      return (
                        <li key={s.id} className={`colonne-seance${ouverte ? ' colonne-seance--ouverte' : ''}`}>
                          <div className="colonne-seance__tete">
                            <span className="colonne-seance__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                            <span className="colonne-seance__jour">{s.jour}</span>
                          </div>
                          <h2 className="colonne-seance__titre">
                            <Link to={lienSeance(s.id)} className="colonne-seance__lien" aria-current={ouverte ? 'true' : undefined}>
                              <span className="sr-only">Séance {i + 1} : </span>{s.titre || 'Séance sans titre'}
                            </Link>
                          </h2>
                          <p className={`colonne-seance__etat${faite ? ' colonne-seance__etat--faite' : ''}`}>{faite ? '✓ Faite : non modifiable' : 'À faire'}</p>
                          <ExercicesColonne seance={s} />
                          {!faite && verrous !== null && (
                            <button type="button" className="espace-lien colonne-seance__suppr" onClick={() => supprimerSeance(s, i + 1)}>
                              Supprimer<span className="sr-only"> la séance {i + 1}</span>
                            </button>
                          )}
                        </li>
                      )
                    })}
                  </ol>
                )}
              <div className="espace-actions">
                <button type="button" className="bouton bouton--secondaire" onClick={() => ajouterSeance('force')}>+ Séance de force</button>
                <button type="button" className="bouton bouton--secondaire" onClick={() => ajouterSeance('course')}>+ Course</button>
              </div>
            </div>

            {seance && (
              <aside className="panneau-seance" aria-labelledby="panneau-titre" ref={panneau}>
                <div className="panneau-seance__tete">
                  <div>
                    <p className="surtitre">Séance {String(seIdx + 1).padStart(2, '0')} · {seance.jour}</p>
                    <h2 id="panneau-titre" className="panneau-seance__titre">{seance.titre || `Séance ${seIdx + 1}`}</h2>
                  </div>
                  <Link to={lienSeance(null)} className="panneau-seance__fermer" aria-label="Fermer la séance">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
                  </Link>
                </div>
                <EditeurSeance seance={seance} numero={seIdx + 1} semaine={semIdx + 1} verrou={estVerrou(seance.id)} attente={verrous === null} exercices={exercices}
                  majSeance={majSeance} majBloc={majBloc} majElement={majElement}
                  retirer={(el) => { changer((p) => retirerElement(p, { s: semIdx, se: seIdx }, el.id)); setMessage(`« ${el.nom} » retiré de la séance.`) }}
                  ajouter={(lettre, exo) => { changer((p) => ajouterAuBloc(p, { s: semIdx, se: seIdx }, lettre, exo)); setMessage(`« ${exo.nom} » ajouté au bloc ${lettre}.`) }} />
              </aside>
            )}
          </div>
        </div>
      </section>
      {barre}
      {dialogue}
      {gestion && (
        <GestionProgramme prog={prog} prenom={client.prenom} aDesModifs={modifie} fermer={() => setGestion(false)}
          fait={(action, d) => {
            setGestion(false) // fermée ici : l'éditeur peut se redessiner avant que la fenêtre ait signalé sa fermeture
            if (action === 'decale') { ouvrir({ ...prog, debut: d.debut }); setMessage(`Dates décalées : le programme commence le ${dateLongue(d.debut)}.`) }
            if (action === 'depublie') { ouvrir({ ...prog, statut: 'brouillon' }); setMessage(`Programme repassé en brouillon : ${client.prenom} ne le voit plus.`) }
            if (action === 'duplique') { setAOuvrir(d.id); setMessage('Copie créée en brouillon.') }
            if (action === 'supprime') { supprime.current = prog.id; setProg(null); setModifie(false); setMessage('Programme supprimé.'); aller({ semaine: 1 }, true) }
          }} />
      )}
    </>
  )
}

// Exercices d'une séance, en abrégé dans sa colonne : code (A1, A2…), nom et ce qui est prévu
function ExercicesColonne({ seance }) {
  if (seance.type === 'course') {
    const infos = [seance.distance, seance.temps, seance.objectif].filter(Boolean).join(' · ')
    return <p className="colonne-seance__resume">Course{infos ? ` · ${infos}` : ''}</p>
  }
  const lignes = (seance.blocs ?? []).flatMap((b) => (b.elements ?? []).map((e, i) => ({ id: e.id, code: `${b.lettre}${i + 1}`, nom: e.nom, detail: lignesExercice(e, b.format === 'series').prescription })))
  if (!lignes.length) return <p className="colonne-seance__resume">Aucun exercice pour l’instant</p>
  return (
    <ul className="colonne-seance__exos">
      {lignes.map((l) => (
        <li key={l.id}><b>{l.code}</b><span>{l.nom}{l.detail && <small>{l.detail}</small>}</span></li>
      ))}
    </ul>
  )

}
