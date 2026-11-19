import { insererSeance, seanceDepuisModele, versModeleSeance } from '../donnees/modelesSeance.js'
import { useEffect, useRef, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import {
  ecouterProgrammes, ecouterExercices, enregistrerProgramme, publierProgramme, notifierModification, ecouterVerrous,
  ecouterModele, ecouterModelesSeance, enregistrerModele, nouvelIdModele, nouvelIdProgramme, ecouterSeancesClient, commenterSeance,
} from '../depots.js'
import {
  nouveauProgramme, dupliquerSemaine, semaineVide, nouvelleSemaine, nouvelleSeance, ajouterAuBloc, ajouterBlocVide, deplacerBloc, supprimerBloc, sansBlocsVides, retirerElement,
  garderSeancesFaites, ordreProgrammes, rafraichirExercices, dupliquerSeance, deplacerSeance, reglerNbSemaines, semaineEnCours,
} from '../donnees/programme.js'
import { ajoutJours, aujourdhuiIso, dateLongue, lundiDe } from '../donnees/calculs.js'
import { nomType } from '../donnees/reglages.js'
import useReglages from './useReglages.js'
import EnteteCoache, { useCoache } from './EnteteCoache.jsx'
import { messageErreur } from '../erreurs.js'
import { ChoixDebut } from './CreationProgramme.jsx'
import GrilleProgramme from './GrilleProgramme.jsx'
import EditeurSeance from './EditeurSeance.jsx'
import SeanceFaiteCoach from './SeanceFaiteCoach.jsx'
import PhotoStockee from './PhotoStockee.jsx'
import Confirmation from './Confirmation.jsx'
import GestionProgramme, { lundisAutour } from './GestionProgramme.jsx'
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
  const { uid, modeleId } = useParams()
  const modele = Boolean(modeleId) // mode « modèle » : /espace/coach/modeles/:modeleId (maquette coach)
  const [params, setParams] = useSearchParams()
  const { client } = useCoache() ?? { client: { prenom: '', nom: '' } }
  const [programmes, setProgrammes] = useState(null)
  const [exercices, setExercices] = useState(null)
  const [prog, setProg] = useState(null)
  const [modifie, setModifie] = useState(false)
  const [verrous, setVerrous] = useState(null) // null : pas encore vérifié, tout reste verrouillé
  const [erreurVerrous, setErreurVerrous] = useState('')
  const [message, setMessage] = useState('')
  const [seancesFaites, setSeancesFaites] = useState([]) // ce que le coaché a fait : affiché sur une séance faite
  const [modeles, setModeles] = useState([]) // modèles de séance (panneau de la grille)
  const [annulable, setAnnulable] = useState(null) // dernier déplacement ou duplication de séance : { texte, avant }
  const [banqueMaj, setBanqueMaj] = useState(false) // photos et consignes repris de la banque : à enregistrer pour que le coaché les voie
  useEffect(() => { if (!modifie) setBanqueMaj(false) }, [modifie])
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [confirmation, setConfirmation] = useState(null)
  const [gestion, setGestion] = useState(false) // fenêtre « Gérer le programme »
  const [renommer, setRenommer] = useState(false) // nom du programme en cours de modification
  const reglages = useReglages()
  const [aOuvrir, setAOuvrir] = useState(null) // copie créée : ouverte dès qu'elle arrive du serveur
  const supprime = useRef(null) // programme supprimé : ne pas le rouvrir avant que la liste se mette à jour
  const version = useRef(0)
  const panneau = useRef(null)
  // une séance qui s'ouvre prend toute la page (maquette coach) : on remonte en haut de la séance
  const seanceOuverte = params.get('seance')
  useEffect(() => {
    const el = panneau.current
    if (!el) return
    const haut = el.getBoundingClientRect().top
    if (haut < 0 || haut > window.innerHeight * 0.5) el.scrollIntoView({ behavior: 'auto', block: 'start' })
  }, [seanceOuverte])

  const creation = params.get('nouveau') === '1'
  const nbSem = prog?.semaines.length ?? 0
  const semIdx = Math.min(Math.max((Number(params.get('semaine')) || 1) - 1, 0), Math.max(nbSem - 1, 0))
  const seanceId = params.get('seance')

  useEffect(() => (modele
    ? ecouterModele(modeleId, setProgrammes, () => setErreur('Impossible de charger le modèle. Vérifiez votre connexion.'))
    : ecouterProgrammes(uid, setProgrammes, () => setErreur('Impossible de charger les programmes. Vérifiez votre connexion.'))), [uid, modele, modeleId])
  useEffect(() => ecouterExercices(setExercices, () => setExercices([])), [])
  useEffect(() => (modele ? undefined : ecouterModelesSeance(setModeles, () => setModeles([]))), [modele])
  useEffect(() => (modele ? undefined : ecouterSeancesClient(uid, setSeancesFaites, () => setSeancesFaites([]))), [uid, modele])

  // Ouvre d'abord le programme en cours, sinon le prochain, sinon le plus récent (14 novembre 2026)
  useEffect(() => {
    const restants = ordreProgrammes((programmes ?? []).filter((p) => p.id !== supprime.current), aujourdhuiIso())
    const voulu = restants.find((p) => p.id === params.get('programme')) // venu de la page « Programmes »
    if (!prog && !creation && restants.length) ouvrir(voulu ?? restants[0])
  }, [programmes, prog, creation])

  // À l'ouverture : si la banque a des photos ou consignes plus récentes que la copie du programme, on les reprend
  // et on invite à enregistrer (sinon le coaché ne les voit pas)
  const dejaRafraichi = useRef(null)
  useEffect(() => {
    if (!prog || !exercices?.length || dejaRafraichi.current === prog.id) return
    dejaRafraichi.current = prog.id
    const r = rafraichirExercices(prog, exercices)
    if (r !== prog) {
      setProg(r); setModifie(true)
      setBanqueMaj(true) // pas de phrase en haut de page : une pastille dans la barre d'enregistrement (voir `barre`)
    }
  }, [prog, exercices])

  // Verrous en direct : une séance terminée pendant l'édition se verrouille aussitôt
  const progId = prog?.id
  useEffect(() => {
    if (!progId) return undefined
    if (modele) { setVerrous(new Set()); return undefined } // un modèle n'a pas de séances faites
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

  // Enregistrement automatique (15 novembre 2026) : seulement tant que le programme est un brouillon, que le coaché ne voit pas.
  // Un programme publié est vu en direct : il garde son bouton « Enregistrer les modifications ».
  useEffect(() => {
    if (!modifie || modele || !prog || prog.statut === 'publié' || envoi || erreur || verrous === null || !prog.nom.trim()) return undefined
    const t = setTimeout(() => enregistrer(false, true), 1500)
    return () => clearTimeout(t)
  }, [prog, modifie, envoi, erreur, verrous]) // eslint-disable-line react-hooks/exhaustive-deps

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
    setAnnulable(null)
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

  // « Nouveau programme » : plus de formulaire. Un brouillon (4 semaines de 3 séances, à partir du lundi suivant) s'ouvre aussitôt dans la grille ;
  // le nom, la durée et la date se changent là, sans repasser par un écran de réglages.
  const creationLancee = useRef(false)
  async function creerDirect() {
    try {
      await creer({ id: nouvelIdProgramme(), nom: 'Nouveau programme', semaines: 4, parSemaine: 3, debut: ajoutJours(lundiDe(aujourdhuiIso()), 7) })
    } catch (e) { setErreur(e.message) }
  }
  useEffect(() => {
    if (!creation || modele || !client || creationLancee.current) return
    creationLancee.current = true
    creerDirect()
  }, [creation, client]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!creation) creationLancee.current = false }, [creation])

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

  async function enregistrer(publier, silencieux = false) {
    if (!prog.nom.trim()) { setErreur('Donnez un nom au programme avant d’enregistrer.'); return }
    if (verrous === null) { setErreur('Vérification des séances déjà faites en cours : réessayez dans un instant.'); return }
    const v = version.current
    const etaitPublie = prog.statut === 'publié'
    setEnvoi(true); setErreur(''); if (!silencieux) setMessage('')
    try {
      if (modele) {
        await enregistrerModele(sansBlocsVides(rafraichirExercices(prog, exercices)))
        if (version.current === v) setModifie(false)
        setMessage('Modèle enregistré.')
        setEnvoi(false)
        return
      }
      const serveur = programmes?.find((p) => p.id === prog.id)
      // les séances faites gardent leur version du serveur, mais toutes reprennent les photos / consignes actuelles de la banque
      const aEcrire = rafraichirExercices(garderSeancesFaites(prog, serveur, verrous), exercices)
      await enregistrerProgramme(sansBlocsVides(aEcrire))
      if (aEcrire !== prog) setProg((p) => rafraichirExercices(garderSeancesFaites(p, serveur, verrous), exercices))
      if (publier) {
        await publierProgramme(prog.id)
        setProg((p) => ({ ...p, statut: 'publié' }))
      } else if (etaitPublie && !silencieux) {
        notifierModification(prog.id) // le coaché est prévenu (19 novembre 2026)
      }
      if (version.current === v) setModifie(false)
      if (!silencieux) setMessage(publier
        ? `Programme publié : ${client?.prenom ?? 'votre coaché'} le voit dans son espace.`
        : etaitPublie ? 'Modifications enregistrées : votre coaché voit la nouvelle version.' : 'Brouillon enregistré.')
    } catch (e) {
      setErreur(messageErreur(e.code))
    }
    setEnvoi(false)
  }

  // ---------- Semaines ----------
  function dupliquer(i = semIdx) {
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
    setMessage(`Semaine S${nbSem + 1} ajoutée.`)
  }

  function ajouterSeance(type, w = semIdx) {
    const s = nouvelleSeance(type)
    muter((p) => { p.semaines[w].seances.push(s) })
    aller({ semaine: w + 1, seance: s.id })
  }

  function supprimerSeance(s, numero, w = semIdx) {
    demander({
      titre: `Supprimer la séance ${numero} ?`,
      texte: `« ${s.titre || 'Séance sans titre'} » et ses exercices seront retirés de la semaine S${w + 1}.`,
      libelle: 'Supprimer la séance',
      action: () => {
        muter((p) => { p.semaines[w].seances = p.semaines[w].seances.filter((x) => x.id !== s.id) })
        setMessage('Séance supprimée.')
      },
    })
  }

  // Grille : déplacer ou dupliquer une séance (glisser-déposer, boutons ⧉ et menu ⋯), avec « Annuler » juste après
  function avecAnnulation(texte, fn) {
    const avant = prog
    changer(fn)
    setAnnulable({ texte, avant })
  }
  function annulerDernier() {
    if (!annulable) return
    version.current += 1
    setProg(annulable.avant); setModifie(true); setAnnulable(null)
  }
  function deplacerLaSeance(de, a) {
    if (verrous === null || verrous.has(prog.semaines[de.s]?.seances[de.se]?.id)) { setErreur('Une séance déjà faite ne se déplace pas.'); return }
    setErreur('')
    avecAnnulation(`Séance déplacée en semaine ${a.vers + 1}.`, (p) => deplacerSeance(p, de, a))
  }
  function dupliquerLaSeance(de, a) {
    setErreur('')
    avecAnnulation(`Séance copiée en semaine ${(a.vers ?? de.s) + 1}.`, (p) => dupliquerSeance(p, de, a))
  }
  // nombre de semaines avec − et ＋ ; modèles
  function changerNbSemaines(n) {
    if (n < 1 || n > MAX_SEMAINES) return
    if (n < nbSem && verrous === null) { setErreur('Vérification des séances déjà faites en cours : réessayez dans un instant.'); return }
    const apres = reglerNbSemaines(prog, n, verrous ?? new Set())
    if (apres.semaines.length !== n) { setErreur('Une semaine avec des séances déjà faites ne peut pas être retirée.'); return }
    const retirees = prog.semaines.slice(n).filter((w) => !semaineVide(w)).length
    const faire = () => { setErreur(''); muter((p) => { p.semaines = reglerNbSemaines(p, n, verrous ?? new Set()).semaines }) }
    if (n < nbSem && retirees > 0) demander({ titre: `Retirer ${nbSem - n} semaine${nbSem - n > 1 ? 's' : ''} ?`, texte: 'Les séances de ces dernières semaines seront supprimées.', libelle: 'Retirer', action: faire })
    else faire()
  }
  // Modèles de séance : un modèle glissé (ou ajouté) dans une semaine y devient une séance neuve ; une séance peut devenir un modèle
  function ajouterDepuisModele(vers, modeleId, index) {
    const m = modeles.find((x) => x.id === modeleId)
    if (!m) return
    setErreur('')
    avecAnnulation(`« ${m.nom || 'Modèle'} » ajouté en semaine ${vers + 1}.`, (p) => insererSeance(p, vers, seanceDepuisModele(m), index))
  }
  async function enregistrerSeanceCommeModele(x) {
    const m = versModeleSeance(x)
    try {
      await enregistrerModele({ id: nouvelIdModele(), ...m }, { creation: true })
      setMessage(`« ${m.nom} » enregistré comme modèle de séance.`)
    } catch (e) { setErreur(messageErreur(e.code)) }
  }
  const majSemaine = (i, cle, v) => muter((p) => { p.semaines[i][cle] = v })

  // Supprimer la semaine affichée : impossible s'il n'en reste qu'une ou si une de ses séances est faite.
  // Les semaines suivantes remontent d'un cran (S4 devient S3) et donc d'une semaine dans le calendrier.
  const semaineFaite = (i) => (prog?.semaines[i]?.seances ?? []).some((x) => verrous?.has(x.id))
  function supprimerSemaine(i = semIdx) {
    const semaine = prog.semaines[i]
    if (nbSem <= 1) { setErreur('Un programme garde au moins une semaine.'); return }
    if (verrous === null || semaineFaite(i)) { setErreur(`Des séances de la semaine S${i + 1} sont déjà faites : elle ne peut pas être supprimée.`); return }
    const n = i + 1
    demander({
      titre: `Supprimer la semaine S${n} ?`,
      texte: `Ses ${semaine.seances.length} séance${semaine.seances.length > 1 ? 's' : ''} seront retirée${semaine.seances.length > 1 ? 's' : ''}.${n < nbSem ? ` Les semaines suivantes avancent d’une semaine (S${n + 1} devient S${n}).` : ''}`,
      libelle: 'Supprimer la semaine',
      action: () => {
        muter((p) => { p.semaines.splice(i, 1) })
        aller({ semaine: Math.max(1, Math.min(n, nbSem - 1)) }, true)
        setErreur(''); setMessage(`Semaine S${n} supprimée.`)
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
          {creation
            ? <p className="espace-texte" role="status">Création du programme…</p>
            : (
              <div className="espace-carte prog-vide">
                <h2 className="espace-sous-titre">Pas encore de programme pour {client.prenom || 'ce coaché'}</h2>
                <p className="espace-texte">Un programme s’ouvre tout de suite dans la grille : 4 semaines de 3 séances, que vous changez comme vous voulez. Il reste en brouillon tant que vous ne le publiez pas.</p>
                <button type="button" className="bouton bouton--principal" disabled={envoi} onClick={() => aller({ nouveau: true })}>{envoi ? 'Création…' : 'Créer le programme'}</button>
              </div>
            )}
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
          <span className={`espace-statut espace-statut--${publie && !modele ? 'actif' : 'autre'}`}>{modele ? 'Modèle' : publie ? 'Publié' : 'Brouillon'}</span>
          {modifie
            ? <><span className="espace-barre__modifie">Modifications non enregistrées</span>{banqueMaj && <span className="espace-barre__banque">Banque mise à jour : photos et consignes à enregistrer</span>}</>
            : <span>{modele ? 'Aucun coaché ne le voit : affectez-le depuis Programmes.' : publie ? 'Votre coaché voit ce programme.' : 'Votre coaché ne le voit pas encore.'}</span>}
        </p>
        <div className="espace-actions">
          {modele ? (
            <button type="button" className="bouton bouton--principal" disabled={envoi || !modifie} onClick={() => enregistrer(false)}>
              {envoi ? 'Enregistrement…' : 'Enregistrer le modèle'}
            </button>
          ) : publie ? (
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
            infos={modele ? '' : `${prog.nom || 'Programme sans nom'} · ${nbSem} semaine${nbSem > 1 ? 's' : ''} · début le ${dateLongue(prog.debut)}`}
            />
          {modele && !seance && (
            <header className="modele-tete">
              <Link to="/espace/coach/modeles" className="espace-retour">
                <svg width="20" height="20" aria-hidden="true" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"><path d="M216 128H40M112 56l-72 72 72 72" /></svg>
                Modèles
              </Link>
              <p className="surtitre">Modèle de programme</p>
              {/* le nom se modifie directement dans le titre (plus de carte à part) */}
              <h1 className="modele-tete__titre">
                <label htmlFor="prog-nom" className="sr-only">Nom du modèle</label>
                <input id="prog-nom" className="modele-tete__champ" autoComplete="off" value={prog.nom} placeholder="Nom du modèle" size={Math.max((prog.nom ?? "").length, 12)}
                  onChange={(e) => { const v = e.target.value; muter((p) => { p.nom = v }) }} />
                <svg className="modele-tete__crayon" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4" /></svg>
              </h1>
            </header>
          )}
          {!modele && !seance && (
            <div className="prog-outils">
              {/* nom (liste ou champ à renommer) et début : une seule ligne, plus de carte à part (14 novembre 2026) */}
              <div className="prog-outils__gauche">
                {renommer ? (
                  <div className="champ-groupe prog-outils__choix">
                    <label htmlFor="prog-nom">Nom du programme</label>
                    <span className="prog-outils__renommer">
                      <input id="prog-nom" className="champ" autoComplete="off" autoFocus value={prog.nom}
                        onChange={(e) => { const v = e.target.value; muter((p) => { p.nom = v }) }}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') setRenommer(false) }} />
                      <button type="button" className="bouton bouton--secondaire bouton--compact" onClick={() => setRenommer(false)}>OK</button>
                    </span>
                  </div>
                ) : (
                  <div className="champ-groupe prog-outils__choix">
                    <label htmlFor="prog-choix">Programme</label>
                    <span className="prog-outils__renommer">
                      {programmes.length > 1 ? (
                        <select id="prog-choix" className="champ" value={prog.id} onChange={(e) => {
                          const cible = programmes.find((p) => p.id === e.target.value)
                          const go = () => { ouvrir(cible); aller({ semaine: 1 }, true) }
                          if (modifie) demander({ ...QUITTER, action: go })
                          else go()
                        }}>
                          {ordreProgrammes(programmes, aujourdhuiIso()).map((p) => <option key={p.id} value={p.id}>{(p.id === prog.id ? prog.nom : p.nom) || 'Programme sans nom'} · {etatProgramme(p)}</option>)}
                        </select>
                      ) : <span id="prog-choix" className="champ prog-outils__nom">{prog.nom || 'Programme sans nom'}</span>}
                      <button type="button" className="prog-outils__crayon" aria-label="Renommer le programme" title="Renommer" onClick={() => setRenommer(true)}>
                        <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16v4zM14 6l4 4" /></svg>
                      </button>
                    </span>
                  </div>
                )}
                <div className="prog-outils__debut">
                  <ChoixDebut id="prog-debut" valeur={prog.debut} changer={(v) => muter((p) => { p.debut = v })} lundis={lundisAutour(prog.debut)} />
                </div>
              </div>
              <div className="prog-outils__actions">
                <div className="prog-pas" role="group" aria-label="Nombre de semaines">
                  <button type="button" aria-label="Une semaine de moins" disabled={nbSem <= 1} onClick={() => changerNbSemaines(nbSem - 1)}>−</button>
                  <span>{nbSem} semaine{nbSem > 1 ? 's' : ''}</span>
                  <button type="button" aria-label="Une semaine de plus" disabled={nbSem >= MAX_SEMAINES} onClick={() => changerNbSemaines(nbSem + 1)}>＋</button>
                </div>
                <button type="button" className="bouton bouton--secondaire bouton--compact" onClick={() => setGestion(true)}>Gérer le programme</button>
                <button type="button" className="bouton bouton--secondaire bouton--compact" onClick={() => {
                  const go = () => aller({ nouveau: true })
                  if (modifie) demander({ ...QUITTER, action: go })
                  else go()
                }}>Nouveau programme</button>
              </div>
            </div>
          )}
          {messages}
          {alerteVerrous}

          {!seance && (
            <GrilleProgramme prog={prog} verrous={verrous} types={reglages.types} lien={(w, id) => `?semaine=${w + 1}&seance=${id}`}
              maxSemaines={MAX_SEMAINES} courante={modele ? -1 : semaineEnCours(prog, aujourdhuiIso())} annulable={annulable} annuler={annulerDernier}
              actions={{
                ajouterSeance: (w, type) => ajouterSeance(type, w),
                dupliquer: dupliquerLaSeance, deplacer: deplacerLaSeance,
                supprimer: (w, i, x) => supprimerSeance(x, i + 1, w),
                ajouterSemaine, dupliquerSemaine: (i) => dupliquer(i), supprimerSemaine: (i) => supprimerSemaine(i), majSemaine,
                ajouterModele: ajouterDepuisModele,
                versModele: (w, i) => enregistrerSeanceCommeModele(prog.semaines[w].seances[i]),
              }} modeles={modele ? null : modeles} />
          )}

          {seance && (
            <article className="page-seance" aria-labelledby="page-seance-titre" ref={panneau}>
              {/* haut de la séance resserré : fil (programme › semaine), flèches entre séances, titre + jour */}
              <div className="page-seance__nav">
                <nav className="page-seance__fil" aria-label="Où suis-je">
                  {modele && <><Link to="/espace/coach/modeles">Modèles</Link><span aria-hidden="true">›</span></>}
                  <Link to={lienSeance(null)} className="page-seance__retour">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
                    {prog.nom || (modele ? 'Modèle' : 'Programme')} · Semaine {semIdx + 1}
                  </Link>
                </nav>
                {!modele && (
                  <button type="button" className="page-seance__modele" onClick={() => enregistrerSeanceCommeModele(seance)}>
                    <svg viewBox="0 0 256 256" width="16" height="16" fill="currentColor" aria-hidden="true"><path d="M184,34H72A14,14,0,0,0,58,48V224a6,6,0,0,0,9.18,5.09L128,190.08l60.83,39a6,6,0,0,0,9.17-5.08V48A14,14,0,0,0,184,34Zm2,179L131.24,177.94a6,6,0,0,0-6.48,0L70,213V48a2,2,0,0,1,2-2H184a2,2,0,0,1,2,2Z" /></svg>
                    Enregistrer comme modèle
                  </button>
                )}
                <div className="page-seance__pager">
                  {seIdx > 0
                    ? <Link to={lienSeance(semaine.seances[seIdx - 1].id)} className="page-seance__fleche" aria-label="Séance précédente"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg></Link>
                    : <span className="page-seance__fleche" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg></span>}
                  <span className="page-seance__position">Séance {seIdx + 1} sur {semaine.seances.length}</span>
                  {seIdx < semaine.seances.length - 1
                    ? <Link to={lienSeance(semaine.seances[seIdx + 1].id)} className="page-seance__fleche" aria-label="Séance suivante"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg></Link>
                    : <span className="page-seance__fleche" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg></span>}
                </div>
              </div>
              <div className="page-seance__titre-ligne">
                <h2 id="page-seance-titre" className="page-seance__titre">{seance.titre || `Séance ${seIdx + 1}`}</h2>
                <span className="page-seance__jour">{nomType(seance.type, reglages.types)}</span>
              </div>
              {(() => {
                const sf = !modele && estVerrou(seance.id) ? seancesFaites.find((x) => x.programme === prog.id && x.seance === seance.id && x.statut === 'terminée') : null
                return sf
                  ? <SeanceFaiteCoach seance={seance} sf={sf} prenom={client?.prenom} banque={exercices} rpeVise={semaine?.rpe} semaine={semIdx + 1} numero={seIdx + 1}
                    commenter={(texte) => commenterSeance(sf.id, texte).then(() => setMessage('Commentaire envoyé.')).catch((e) => setErreur(messageErreur(e.code)))} />
                  : (
              <EditeurSeance seance={seance} numero={seIdx + 1} semaine={semIdx + 1} verrou={estVerrou(seance.id)} attente={verrous === null} exercices={exercices} rm={modele ? undefined : client?.rm}
                majSeance={majSeance} majBloc={majBloc} majElement={majElement}
                retirer={(el) => { changer((p) => retirerElement(p, { s: semIdx, se: seIdx }, el.id)); setMessage(`« ${el.nom} » retiré de la séance.`) }}
                supprimerBloc={(blocId, nom) => { changer((p) => supprimerBloc(p, { s: semIdx, se: seIdx }, blocId)); setMessage(`${nom} supprimé.`) }}
                ajouterBloc={() => changer((p) => ajouterBlocVide(p, { s: semIdx, se: seIdx }))}
                deplacerBloc={(de, vers) => changer((p) => deplacerBloc(p, { s: semIdx, se: seIdx }, de, vers))}
                ajouter={(lettre, exo) => { changer((p) => ajouterAuBloc(p, { s: semIdx, se: seIdx }, lettre, exo)); setMessage(`« ${exo.nom} » ajouté au bloc ${lettre}.`) }} />
                  )
              })()}
            </article>
          )}
        </div>
      </section>
      {!(seance && !modele && estVerrou(seance.id)) && barre}
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

// État d'un programme dans la liste « Programme affiché »
function etatProgramme(p) {
  if (p.statut !== 'publié') return 'brouillon'
  const auj = aujourdhuiIso()
  if (auj < p.debut) return 'à venir'
  if (auj > ajoutJours(p.debut, (p.semaines?.length ?? 0) * 7 - 1)) return 'terminé'
  return 'en cours'
}
