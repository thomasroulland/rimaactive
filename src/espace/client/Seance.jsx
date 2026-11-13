import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import { listeSeances, fusionnerNotes, preRemplir, etatAccueil, aujourdhuiIso } from '../donnees/calculs.js'
import { avancement } from '../donnees/progression.js'
import { allureVitesse, saisirSerie } from '../donnees/seances.js'
import { noterSeance, terminerSeance } from '../depots.js'
import Picto from '../../components/Picto.jsx'
import BlocSeries, { TableauSeries } from './BlocSeries.jsx'
import Consignes from './Consignes.jsx'
import FinDeSeance from './FinDeSeance.jsx'

const DELAI = 600 // ms entre la dernière frappe et l'enregistrement

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
  return terminee ? 'Séance enregistrée.' : ''
}

// Lignes de séries : anciennes notes sans le champ « fait » comptées comme faites
const avecFait = (lignes) => (lignes ?? []).map((l) => ({ ...l, fait: l.fait !== false }))
const lignesVides = (element) => preRemplir(element).map(() => ({ charge: '', reps: '', rpe: '', fait: false }))
const carteVide = () => ({ series: {}, notes: {}, blocs: {} })
const CHAMPS_SORTIE = ['distance', 'temps', 'fc', 'zones']
const ZONES = ['Z1', 'Z2', 'Z3', 'Z4', 'Z5']

// Une séance (maquette) : blocs et exercices, ou sortie de course, puis « Fin de séance ».
// Une clé par séance : passer d'une séance à l'autre repart d'un écran neuf (notes en attente envoyées).
export default function Seance(props) {
  const { programmeId, seanceId } = useParams()
  return <EcranSeance key={`${programmeId}_${seanceId}`} programmeId={programmeId} seanceId={seanceId} {...props} />
}

function EcranSeance({ programmeId, seanceId, programmes, seances }) {
  const enLigne = useEnLigne()
  const depuisProgramme = useLocation().state?.depuis === 'programme'
  const [modifs, setModifs] = useState({ ...carteVide(), course: {} })
  const [refus, setRefus] = useState('')
  const [fiche, setFiche] = useState(null)
  const minuterie = useRef(null)
  const enAttente = useRef(carteVide())
  const termine = useRef(false) // « Enregistrer ma séance » déjà envoyé depuis cet écran

  const programme = programmes.find((p) => p.id === programmeId)
  const liste = listeSeances(programme)
  const item = liste.find((x) => x.seance.id === seanceId)
  const fait = seances.find((s) => s.id === `${programmeId}_${seanceId}`)
  const verrou = fait?.statut === 'terminée'

  const erreurEnvoi = (e) => {
    // refus tardif d'une écriture partie avant ou pendant l'enregistrement : la séance est bien enregistrée
    if (e?.code === 'permission-denied' && termine.current) return
    setRefus(e?.code === 'permission-denied'
      ? 'Séance déjà enregistrée.'
      : 'Vos notes n’ont pas pu être envoyées. Vérifiez votre connexion et réessayez.')
  }

  // n'attend pas le serveur : le cache hors ligne applique l'écriture tout de suite
  const envoyer = () => {
    clearTimeout(minuterie.current)
    const a = enAttente.current
    enAttente.current = carteVide()
    const rien = ['series', 'notes', 'blocs'].every((k) => Object.keys(a[k]).length === 0) && CHAMPS_SORTIE.every((k) => a[k] == null)
    if (rien) return
    noterSeance(programmeId, seanceId, a).catch(erreurEnvoi)
  }

  // en quittant l'écran, en verrouillant le téléphone ou en fermant l'onglet : envoyer tout de suite ce qui attend
  const toutEnvoyer = useRef(null)
  toutEnvoyer.current = envoyer
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

  const retour = depuisProgramme
    ? <Link className="ec-retour" to="/espace/programme"><Fleche />Mon programme</Link>
    : <Link className="ec-retour" to="/espace"><Fleche />Tableau de bord</Link>

  if (!item) {
    return (
      <section className="ec-page ec-seance">
        {retour}
        <h1 className="ec-h1">Séance introuvable</h1>
        <p className="ec-texte">Cette séance n’est plus dans votre programme. Marie l’a peut-être déplacée ou retirée.</p>
      </section>
    )
  }

  const { seance, semaine } = item
  const numero = liste.filter((x) => x.semaine === semaine).indexOf(item) + 1
  const course = seance.type === 'course'
  const rpeVise = programme.semaines?.[semaine - 1]?.rpe

  // ce qui est enregistré, recouvert par ce qui vient d'être saisi
  const series = { ...(fait?.series ?? {}), ...modifs.series }
  const notes = { ...(fait?.notes ?? {}), ...modifs.notes }
  const blocs = { ...(fait?.blocs ?? {}), ...modifs.blocs }
  const sortie = {
    distance: modifs.course.distance ?? fait?.distance ?? '',
    temps: modifs.course.temps ?? fait?.temps ?? '',
    fc: modifs.course.fc ?? fait?.fc ?? '',
    zones: modifs.course.zones ?? ZONES.map((_, i) => fait?.zones?.[i] ?? ''),
  }
  const lignes = (el) => (series[el.id] ? avecFait(series[el.id]) : lignesVides(el))
  const retires = fusionnerNotes(seance, series).filter((e) => !e.element)

  const noter = (cle, id, valeur) => {
    setRefus('')
    setModifs((m) => ({ ...m, [cle]: { ...m[cle], [id]: valeur } }))
    enAttente.current[cle][id] = valeur
    clearTimeout(minuterie.current)
    minuterie.current = setTimeout(envoyer, DELAI)
  }
  const actions = verrou ? null : {
    serie: (el, i, cle, v) => noter('series', el.id, lignes(el).map((l, j) => (j === i ? saisirSerie(l, cle, v, el) : l))),
    note: (id, v) => noter('notes', id, v),
    chargeSeule: (id, v) => noter('series', id, [{ charge: v, reps: '', rpe: '', fait: v.trim() !== '' }]),
    bloc: (id, cle, v) => noter('blocs', id, { resultat: '', reps: '', rpe: '', fait: false, note: '', ...blocs[id], [cle]: v }),
  }
  const saisirSortie = (cle, v) => {
    setRefus('')
    setModifs((m) => ({ ...m, course: { ...m.course, [cle]: v } }))
    enAttente.current[cle] = v
    clearTimeout(minuterie.current)
    minuterie.current = setTimeout(envoyer, DELAI)
  }

  const terminer = (fin) => {
    if (termine.current) return
    termine.current = true
    clearTimeout(minuterie.current)
    enAttente.current = carteVide()
    setRefus('')
    const toutes = {}
    if (!course) {
      for (const b of seance.blocs ?? []) {
        for (const el of b.elements ?? []) {
          if (series[el.id]) toutes[el.id] = series[el.id]
          // séries jamais touchées : enregistrées avec le prévu, non faites
          else if ((b.format ?? 'series') === 'series') toutes[el.id] = preRemplir(el).map((l) => ({ ...l, fait: false }))
        }
      }
    }
    terminerSeance(programmeId, seanceId, { ...fin, ...(course ? sortie : {}), series: toutes, notes, blocs }).catch(erreurEnvoi)
  }

  const infos = [
    seance.lieu && { picto: 'map-pin', libelle: 'Lieu', texte: seance.lieu },
    seance.objectif && { picto: 'check-square', libelle: 'Objectif', texte: seance.objectif },
    !course && rpeVise && { picto: 'barbell', libelle: 'Effort visé', texte: `RPE ${rpeVise}` },
  ].filter(Boolean)
  const allure = allureVitesse(sortie.distance, sortie.temps)
  const prevuCourse = [seance.distance, seance.temps].filter(Boolean).join(' · ')

  return (
    <section className="ec-page ec-seance">
      {retour}
      <div className="ec-seance__titres">
        <p className="ec-surtitre">Semaine {semaine} · séance {numero}</p>
        <h1 className="ec-h1">{seance.titre || `Séance ${numero}`}</h1>
      </div>
      {infos.length > 0 && (
        <ul className="ec-seance__infos">
          {infos.map((i) => (
            <li key={i.picto}><Picto nom={i.picto} taille={22} /><span><span className="ec-seance__libelle">{i.libelle}</span>{i.texte}</span></li>
          ))}
        </ul>
      )}
      {refus && <p className="ec-erreur" role="alert">{refus}</p>}

      <div className="ec-seance__corps">
        <div className="ec-seance__gauche">
          {course ? (
            <section className="ec-sbloc" aria-labelledby="titre-sortie">
              <div className="ec-sbloc__tete"><h2 id="titre-sortie" className="ec-h3 ec-sbloc__titre">Ma sortie</h2></div>
              {(prevuCourse || seance.consigne) && (
                <div className="ec-carte ec-sortie__prevu">
                  {prevuCourse && <p className="ec-sexo__nom">{prevuCourse}</p>}
                  {seance.consigne && <p className="ec-petit ec-sortie__consigne">{seance.consigne}</p>}
                </div>
              )}
              <div className="ec-carte ec-sortie">
                <div className="ec-sortie__champs">
                  <div>
                    <label className="ec-etiquette" htmlFor="sortie-distance">Distance (km)</label>
                    <input id="sortie-distance" className="ec-champ" type="text" inputMode="decimal" autoComplete="off" placeholder={verrou ? '' : '4,0'}
                      value={sortie.distance} readOnly={verrou} onChange={(e) => saisirSortie('distance', e.target.value)} />
                  </div>
                  <div>
                    <label className="ec-etiquette" htmlFor="sortie-temps">Temps (h:mm:ss)</label>
                    <input id="sortie-temps" className="ec-champ" type="text" inputMode="numeric" autoComplete="off" placeholder={verrou ? '' : '0:30:00'}
                      value={sortie.temps} readOnly={verrou} onChange={(e) => saisirSortie('temps', e.target.value)} />
                  </div>
                  <div>
                    <label className="ec-etiquette" htmlFor="sortie-fc">FC moyenne (bpm)</label>
                    <input id="sortie-fc" className="ec-champ" type="text" inputMode="numeric" autoComplete="off" placeholder={verrou ? '' : '140'}
                      value={sortie.fc} readOnly={verrou} onChange={(e) => saisirSortie('fc', e.target.value)} />
                  </div>
                </div>
                <div className="ec-sortie__allure" aria-live="polite">
                  <p className="ec-texte">Allure <strong>{allure.allure}</strong></p>
                  <p className="ec-texte">Vitesse <strong>{allure.vitesse}</strong></p>
                </div>
                <fieldset className="ec-zones">
                  <legend className="ec-fin__legende ec-zones__legende">Temps passé par zone (%)</legend>
                  <div className="ec-zones__champs">
                    {ZONES.map((z, i) => (
                      <div key={z}>
                        <label className="ec-etiquette ec-zones__nom" htmlFor={`sortie-${z}`}>{z}</label>
                        <input id={`sortie-${z}`} className="ec-champ ec-champ--serre" type="text" inputMode="numeric" autoComplete="off"
                          value={sortie.zones[i]} readOnly={verrou}
                          onChange={(e) => saisirSortie('zones', sortie.zones.map((v, j) => (j === i ? e.target.value : v)))} />
                      </div>
                    ))}
                  </div>
                </fieldset>
              </div>
            </section>
          ) : (
            <>
              {(seance.blocs ?? []).length === 0 && retires.length === 0 && (
                <p className="ec-texte">Marie n’a pas encore ajouté d’exercice à cette séance.</p>
              )}
              {(seance.blocs ?? []).map((b) => (
                <BlocSeries key={b.id} bloc={b} saisie={{ lignes, notes, blocs }} actions={actions} lecture={verrou} voirConsignes={setFiche} />
              ))}
              {retires.length > 0 && (
                <section className="ec-sbloc" aria-label="Exercices retirés du programme">
                  <ol className="ec-sexos">
                    {retires.map((r, i) => (
                      <li key={i} className="ec-sexo">
                        <div className="ec-sexo__texte">
                          <h3 className="ec-sexo__nom">Exercice retiré du programme</h3>
                          <p className="ec-petit">Marie a retiré cet exercice de la séance. Les séries que vous aviez notées restent enregistrées.</p>
                        </div>
                        <TableauSeries base={`retire-${i}`} nom="Exercice retiré" lignes={avecFait(r.lignes)} lecture changer={() => {}} />
                      </li>
                    ))}
                  </ol>
                </section>
              )}
            </>
          )}
        </div>

        {/* clé stable pendant la saisie : la première écriture (statut « en cours ») ne doit pas effacer effort, ressenti, commentaire */}
        <FinDeSeance key={verrou ? 'terminee' : 'saisie'} course={course} fait={fait} etat={etatEnvoi(fait, enLigne)} envoyer={terminer}
          suite={suiteDe(programme, seances)} vientDeFinir={termine.current} />
      </div>

      <Consignes element={fiche} fermer={() => setFiche(null)} />
    </section>
  )
}

const Fleche = () => (
  <svg width="20" height="20" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M216 128H40M112 56l-72 72 72 72" />
  </svg>
)

// Pour l'écran de fin : rang de la séance et prochaine séance du programme
function suiteDe(programme, seances) {
  if (!programme) return null
  const faites = new Set(seances.filter((s) => s.statut === 'terminée' && s.programme === programme.id).map((s) => s.seance))
  const av = avancement(programme, faites)
  const etat = etatAccueil(programme, faites, aujourdhuiIso())
  return { faites: av.faites, prevues: av.prevues, programmeId: programme.id, prochaine: etat.type === 'prochaine' ? etat : null }
}
