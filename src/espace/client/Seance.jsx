import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { listeSeances, fusionnerNotes, preRemplir } from '../donnees/calculs.js'
import { dateLongue, resumeFormat } from '../donnees/seances.js'
import { noterSeance, terminerSeance } from '../depots.js'
import Picto from '../../components/Picto.jsx'
import ExerciceSeance from './ExerciceSeance.jsx'
import FinDeSeance from './FinDeSeance.jsx'

const DELAI = 600 // ms entre la dernière frappe et l'enregistrement d'un exercice

function useEnLigne() {
  const [enLigne, setEnLigne] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine))
  useEffect(() => {
    const oui = () => setEnLigne(true)
    const non = () => setEnLigne(false)
    window.addEventListener('online', oui)
    window.addEventListener('offline', non)
    return () => { window.removeEventListener('online', oui); window.removeEventListener('offline', non) }
  }, [])
  return enLigne
}

// Où en est l'enregistrement (le cache hors ligne garde tout sur le téléphone tant que le réseau manque)
function etatEnvoi(fait, enLigne) {
  if (!fait) return ''
  const terminee = fait.statut === 'terminée'
  if (fait.enAttente && !enLigne) {
    return terminee
      ? 'Séance enregistrée sur votre téléphone. Elle partira dès le retour du réseau.'
      : 'Notes enregistrées sur votre téléphone. Elles partiront dès le retour du réseau.'
  }
  if (fait.enAttente) return 'Envoi en cours…'
  return terminee ? 'Séance enregistrée. Marie la retrouve dans son espace.' : 'Notes enregistrées.'
}

// Une séance : blocs et exercices (séries pré-remplies avec le prévu), ou sortie de course, puis « Fin de séance ».
// Une clé par séance : passer d'une séance à l'autre repart d'un écran neuf (notes en attente envoyées).
export default function Seance(props) {
  const { programmeId, seanceId } = useParams()
  return <EcranSeance key={`${programmeId}_${seanceId}`} programmeId={programmeId} seanceId={seanceId} {...props} />
}

function EcranSeance({ programmeId, seanceId, programmes, seances }) {
  const enLigne = useEnLigne()
  const [modifs, setModifs] = useState({})
  const [refus, setRefus] = useState('')
  const minuteries = useRef({})
  const enAttente = useRef({})

  const programme = programmes.find((p) => p.id === programmeId)
  const liste = listeSeances(programme)
  const item = liste.find((x) => x.seance.id === seanceId)
  const fait = seances.find((s) => s.id === `${programmeId}_${seanceId}`)
  const verrou = fait?.statut === 'terminée'

  const erreurEnvoi = (e) => {
    setRefus(e?.code === 'permission-denied'
      ? 'Séance déjà enregistrée.'
      : 'Vos notes n’ont pas pu être envoyées. Vérifiez votre connexion et réessayez.')
  }

  const envoyerExercice = (elementId) => {
    clearTimeout(minuteries.current[elementId])
    const lignes = enAttente.current[elementId]
    if (!lignes) return
    delete enAttente.current[elementId]
    noterSeance(programmeId, seanceId, { series: { [elementId]: lignes } }).catch(erreurEnvoi)
  }

  // en quittant l'écran, en verrouillant le téléphone ou en fermant l'onglet : envoyer tout de suite ce qui attend
  const toutEnvoyer = useRef(null)
  toutEnvoyer.current = () => Object.keys(enAttente.current).forEach(envoyerExercice)
  useEffect(() => {
    const vider = () => toutEnvoyer.current()
    const cache = () => { if (document.visibilityState === 'hidden') vider() }
    document.addEventListener('visibilitychange', cache)
    window.addEventListener('pagehide', vider)
    return () => {
      document.removeEventListener('visibilitychange', cache)
      window.removeEventListener('pagehide', vider)
      vider()
    }
  }, [])

  if (!item) {
    return (
      <section className="client-page">
        <Link className="espace-retour" to="/espace/programme"><Retour /> Mon programme</Link>
        <h1 className="client-titre">Séance introuvable</h1>
        <p className="espace-texte">Cette séance n’est plus dans votre programme. Marie l’a peut-être déplacée ou retirée.</p>
      </section>
    )
  }

  const { seance, semaine, date } = item
  const numero = liste.filter((x) => x.semaine === semaine).indexOf(item) + 1
  const course = seance.type === 'course'
  const notes = { ...(fait?.series ?? {}), ...modifs }
  const entrees = fusionnerNotes(seance, notes)
  // case « Fait » : lignes pré-remplies non cochées ; anciennes notes sans le champ comptées comme faites
  const avecFait = (lignes) => lignes.map((l) => ({ ...l, fait: l.fait !== false }))
  const parElement = new Map(entrees.filter((e) => e.element).map((e) => [
    e.element.id,
    notes[e.element.id] ? avecFait(notes[e.element.id]) : preRemplir(e.element).map((l) => ({ ...l, fait: false })),
  ]))
  const retires = entrees.filter((e) => !e.element).map((e) => ({ ...e, lignes: avecFait(e.lignes) }))

  const changer = (elementId, lignes) => {
    setRefus('')
    setModifs((m) => ({ ...m, [elementId]: lignes }))
    enAttente.current[elementId] = lignes
    clearTimeout(minuteries.current[elementId])
    minuteries.current[elementId] = setTimeout(() => envoyerExercice(elementId), DELAI)
  }

  const terminer = (fin) => {
    Object.values(minuteries.current).forEach(clearTimeout)
    enAttente.current = {}
    setRefus('')
    // toutes les séries affichées, y compris celles pré-remplies jamais touchées
    const series = course ? undefined : Object.fromEntries(parElement)
    terminerSeance(programmeId, seanceId, { ...fin, series }).catch(erreurEnvoi)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const infos = [
    { picto: 'clock', texte: `${dateLongue(date)}${seance.duree ? ` · ${seance.duree}` : ''}` },
    seance.lieu && { picto: 'map-pin', texte: seance.lieu },
    seance.objectif && { picto: 'check-square', texte: seance.objectif },
  ].filter(Boolean)
  const envoi = etatEnvoi(fait, enLigne)

  return (
    <section className="client-page client-seance">
      <Link className="espace-retour" to="/espace/programme"><Retour /> Mon programme</Link>
      <div className="client-pile client-pile--serre">
        <p className="surtitre">Semaine {semaine} · séance {numero}</p>
        <h1 className="client-titre">{seance.titre || `Séance ${numero}`}</h1>
      </div>
      <ul className="client-infos">
        {infos.map((i) => <li key={i.picto}><Picto nom={i.picto} taille={22} />{i.texte}</li>)}
      </ul>

      {(refus || envoi) && (
        <p className={`client-envoi${refus ? ' client-envoi--refus' : ''}`} role="status">{refus || envoi}</p>
      )}

      {course ? (
        <section className="client-pile" aria-labelledby="titre-sortie">
          <h2 id="titre-sortie" className="client-sous-titre">Ma sortie</h2>
          <div className="espace-carte">
            {(seance.distance || seance.temps) && (
              <p className="client-exo__prevu">{[seance.distance && `Distance visée : ${seance.distance}`, seance.temps && `Temps visé : ${seance.temps}`].filter(Boolean).join(' · ')}</p>
            )}
            {seance.consigne && <p className="espace-texte">{seance.consigne}</p>}
          </div>
        </section>
      ) : (
        <>
          {(seance.blocs ?? []).length === 0 && retires.length === 0 && (
            <p className="espace-texte">Marie n’a pas encore ajouté d’exercice à cette séance.</p>
          )}
          {(seance.blocs ?? []).map((b) => (
            <section key={b.id} className="client-pile" aria-labelledby={`bloc-${b.id}`}>
              <h2 id={`bloc-${b.id}`} className="client-bloc">
                Bloc {b.lettre} <span className="espace-bloc__format">{resumeFormat(b)}</span>
              </h2>
              <ol className="client-liste client-liste--exos">
                {(b.elements ?? []).map((el, ei) => (
                  <ExerciceSeance key={el.id} element={el} code={`${b.lettre}${ei + 1}`} enSeries={b.format === 'series'}
                    lignes={parElement.get(el.id)} verrou={verrou} changer={(l) => changer(el.id, l)} />
                ))}
              </ol>
            </section>
          ))}
          {retires.length > 0 && (
            <section className="client-pile" aria-label="Exercices retirés du programme">
              <ol className="client-liste client-liste--exos">
                {retires.map((r, i) => (
                  <ExerciceSeance key={i} element={null} code={`R${i + 1}`} enSeries lignes={r.lignes} verrou />
                ))}
              </ol>
            </section>
          )}
        </>
      )}

      <FinDeSeance key={fait?.statut} course={course} fait={fait} envoyer={terminer} />
    </section>
  )
}

const Retour = () => (
  <svg width="20" height="20" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M216 128H40M112 56l-72 72 72 72" />
  </svg>
)
