import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { listeSeances, fusionnerNotes, preRemplir, etatAccueil, aujourdhuiIso, pasCommence, jourCourt } from '../donnees/calculs.js'
import { avancement } from '../donnees/progression.js'
import { nomBloc } from '../donnees/programme.js'
import { allureVitesse, estEnSeries, exercicesDe, premierBlocAFaire, progressionBlocs, resumeFormat, saisirSerie, serieTerminee } from '../donnees/seances.js'
import { nouveauxRecords } from '../donnees/records.js'
import { corrigerSeance, effacerMaSeance, noterDuree, noterSeance, terminerSeance } from '../depots.js'
import Picto from '../../components/Picto.jsx'
import { Cadenas } from './Statut.jsx'
import BlocSeries, { TableauSeries } from './BlocSeries.jsx'
import Consignes from './Consignes.jsx'
import FinDeSeance from './FinDeSeance.jsx'
import { BandeauBloc, BlocOrdinateur, BoutonBloc, EnteteOrdi, useMobile } from './SeanceGuidee.jsx'
import BlocTelephone from './SeanceTelephone.jsx'

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
const lignesVides = (element) => preRemplir(element).map(() => (element.mesure === 'duree' || element.mesure === 'distance' ? { charge: '', duree: '', rpe: '', fait: false } : { charge: '', reps: '', rpe: '', fait: false }))
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
  const naviguer = useNavigate()
  const [modifs, setModifs] = useState({ ...carteVide(), course: {} })
  const [edition, setEdition] = useState(false) // séance déjà faite rouverte pour la corriger (16 novembre 2026)
  const [refus, setRefus] = useState('')
  const [fiche, setFiche] = useState(null)
  const minuterie = useRef(null)
  const enAttente = useRef(carteVide())
  const termine = useRef(false) // « Enregistrer ma séance » déjà envoyé depuis cet écran
  const dureeFinie = useRef(null) // durée de la séance, montrée sur « Séance enregistrée »
  // séance guidée (15 novembre 2026) : bloc ouvert (le dernier + 1 = fin de séance)
  const [etape, setEtape] = useState(() => {
    const p = programmes.find((x) => x.id === programmeId)
    const sc = listeSeances(p).find((x) => x.seance.id === seanceId)?.seance
    const f = seances.find((x) => x.id === `${programmeId}_${seanceId}`)
    if (!sc || sc.type === 'course') return 0
    const ls = (el) => (f?.series?.[el.id] ? avecFait(f.series[el.id]) : lignesVides(el))
    return premierBlocAFaire(progressionBlocs(sc.blocs, ls, f?.blocs))
  })
  const mobile = useMobile() // téléphone : un exercice à la fois ; ordinateur : le bloc en liste

  const programme = programmes.find((p) => p.id === programmeId)
  const liste = listeSeances(programme)
  const item = liste.find((x) => x.seance.id === seanceId)
  const fait = seances.find((s) => s.id === `${programmeId}_${seanceId}`)
  const dejaFaite = fait?.statut === 'terminée'
  // avant la date de début : séance visible, mais on ne peut pas la commencer (Marie, 22 novembre 2026)
  const avantDebut = pasCommence(programme, aujourdhuiIso()) && !fait
  const verrou = (dejaFaite && !edition) || avantDebut
  // Durée de la séance, vue par Marie dans le bilan (26 novembre 2026) : elle part à la première chose notée
  // (pas à l'ouverture : regarder une séance sans la commencer ne compte pas), et se garde sur l'appareil.
  // Plus de chronomètre affiché pendant la séance (Marie, 27 novembre 2026) ; le minuteur de repos reste.
  const cleDebut = `rima-debut-${programmeId}_${seanceId}`
  const lireDebut = () => { try { const v = Number(localStorage.getItem(cleDebut)); return v > 0 && Date.now() - v < 6 * 3600 * 1000 ? v : null } catch { return null } }
  const marquerDebut = () => { if (dejaFaite || lireDebut()) return; try { localStorage.setItem(cleDebut, String(Date.now())) } catch { /* rien */ } }
  const oublierDebut = () => { try { localStorage.removeItem(cleDebut) } catch { /* rien */ } }

  const erreurEnvoi = (e) => {
    // refus tardif d'une écriture partie avant ou pendant l'enregistrement : la séance est bien enregistrée
    if (e?.code === 'permission-denied' && termine.current) return
    setRefus(e?.code === 'permission-denied'
      ? (dejaFaite ? 'Votre correction n’a pas pu être enregistrée. Réessayez plus tard.' : 'Séance déjà enregistrée.')
      : 'Vos notes n’ont pas pu être envoyées. Vérifiez votre connexion et réessayez.')
  }

  // n'attend pas le serveur : le cache hors ligne applique l'écriture tout de suite
  const envoyer = () => {
    clearTimeout(minuterie.current)
    const a = enAttente.current
    enAttente.current = carteVide()
    const rien = ['series', 'notes', 'blocs'].every((k) => Object.keys(a[k]).length === 0) && CHAMPS_SORTIE.every((k) => a[k] == null)
    if (rien) return
    ;(dejaFaite ? corrigerSeance : noterSeance)(programmeId, seanceId, a).catch(erreurEnvoi)
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

  const lienRetour = depuisProgramme
    ? <Link className="ec-retour" to="/espace/programme"><Fleche />Mon programme</Link>
    : <Link className="ec-retour" to="/espace"><Fleche />Tableau de bord</Link>
  const finirCorrection = () => { envoyer(); setEdition(false) }
  // séance déjà faite : on peut la rouvrir pour corriger ce qui a été noté
  const barreCorrection = avantDebut
    ? <div className="ec-correction ec-avant-debut"><span className="ec-avant-debut__picto" aria-hidden="true"><Cadenas taille={18} /></span><span><b>Votre programme commence {jourCourt(programme.debut).replace(/\.$/, '')}.</b> Vous pourrez commencer cette séance ce jour-là.</span></div>
    : dejaFaite && (
    edition
      ? <div className="ec-correction est-active"><span><b>Vous corrigez cette séance.</b> Chaque changement est enregistré.</span><button type="button" className="ec-correction__bouton" onClick={finirCorrection}>J’ai fini</button></div>
      : <div className="ec-correction"><span><b>Séance terminée.</b> Des changements à noter ?</span><button type="button" className="ec-correction__bouton" onClick={() => { setEdition(true); setEtape(0) }} aria-label="Modifier ma séance">Modifier</button></div>
  )
  const retour = <>{lienRetour}{barreCorrection}</>

  // séance commencée par erreur : la remettre à zéro (Marie, 22 novembre 2026) ; jamais une séance déjà faite
  const enCours = fait?.statut === 'en cours'
  // puis on sort de la séance (Marie, 22 novembre 2026) ; sans réseau, on n'attend pas plus de 4 secondes
  const remettre = async () => {
    clearTimeout(minuterie.current)
    enAttente.current = carteVide()
    oublierDebut()
    setRefus('')
    const effacement = effacerMaSeance(programmeId, seanceId)
    effacement.catch(() => {})
    try {
      await Promise.race([effacement, new Promise((ok) => setTimeout(ok, 4000))])
      naviguer(depuisProgramme ? '/espace/programme' : '/espace')
    } catch (e) {
      setRefus(e?.code === 'permission-denied'
        ? 'La séance n’a pas pu être remise à zéro. Prévenez Marie.'
        : 'La séance n’a pas pu être remise à zéro. Vérifiez votre connexion et réessayez.')
    }
  }
  const recommencer = enCours && <Recommencer remettre={remettre} />

  // téléphone, un exercice à la fois : la croix en haut ; séance commencée, elle propose aussi de recommencer à zéro (22 novembre 2026)
  const retourPetit = <Quitter vers={depuisProgramme ? '/espace/programme' : '/espace'} enCours={enCours} remettre={remettre} />

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
    marquerDebut()
    clearTimeout(minuterie.current)
    minuterie.current = setTimeout(envoyer, DELAI)
  }
  const actions = verrou ? null : {
    serie: (el, i, cle, v) => noter('series', el.id, lignes(el).map((l, j) => (j === i ? saisirSerie(l, cle, v, el) : l))),
    // ordinateur : taper une valeur ne coche pas la série (on coche avec « Série faite » ou le rond)
    valeur: (el, i, cle, v) => noter('series', el.id, lignes(el).map((l, j) => (j === i ? { ...l, [cle]: v } : l))),
    // téléphone : « Série faite » prend d'un coup répétitions, charge et RPE saisis
    // téléphone (23 novembre 2026) : la série est cochée telle quelle (rien n'est rempli à la place du coaché) ;
    // ce qu'il a noté est proposé dans la série suivante si elle est encore vide
    terminerSerie: (el, i) => noter('series', el.id, lignes(el).map((l, j) => {
      if (j === i) return { ...l, fait: true }
      if (j === i + 1 && !l.fait) {
        const cur = lignes(el)[i] ?? {}
        const cle = el.mesure === 'duree' || el.mesure === 'distance' ? 'duree' : 'reps'
        return { ...l, [cle]: String(l[cle] ?? '').trim() ? l[cle] : (cur[cle] ?? ''), charge: String(l.charge ?? '').trim() ? l.charge : (cur.charge ?? '') }
      }
      return l
    })),
    decocherSerie: (el, i) => noter('series', el.id, lignes(el).map((l, j) => (j === i ? { ...l, fait: false } : l))),
    serieComplete: (el, i, valeurs) => noter('series', el.id, lignes(el).map((l, j) => (j === i ? serieTerminee(l, valeurs, el) : l))),
    note: (id, v) => noter('notes', id, v),
    chargeSeule: (id, v) => noter('series', id, [{ charge: v, reps: '', rpe: '', fait: v.trim() !== '' }]),
    bloc: (id, cle, v) => noter('blocs', id, { resultat: '', reps: '', rpe: '', fait: false, note: '', ...blocs[id], [cle]: v }),
    // effort d'un exercice, noté une fois à la fin de ses séries : recopié sur chaque série (téléphone, 22 novembre 2026)
    rpeExercice: (el, v) => noter('series', el.id, lignes(el).map((l) => ({ ...l, rpe: v }))),
    // plusieurs champs d'un coup (effort et note de la bulle du bas, téléphone)
    blocValeurs: (id, valeurs) => noter('blocs', id, { resultat: '', reps: '', rpe: '', fait: false, note: '', ...blocs[id], ...valeurs }),
  }
  const saisirSortie = (cle, v) => {
    setRefus('')
    setModifs((m) => ({ ...m, course: { ...m.course, [cle]: v } }))
    enAttente.current[cle] = v
    marquerDebut()
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
          else if (estEnSeries(b.format)) toutes[el.id] = preRemplir(el).map((l) => ({ ...l, fait: false }))
        }
      }
    }
    const debut = lireDebut()
    if (debut) { dureeFinie.current = Date.now() - debut; oublierDebut() }
    const duree = dureeFinie.current ? Math.max(1, Math.round(dureeFinie.current / 60000)) : null
    // la durée part dans un second envoi, après la séance : si la règle n'est pas encore en ligne, seule la durée est perdue
    terminerSeance(programmeId, seanceId, { ...fin, ...(course ? sortie : {}), series: toutes, notes, blocs }).then(() => { if (duree) noterDuree(programmeId, seanceId, duree).catch(() => {}) }).catch(erreurEnvoi)
  }

  const infos = [
    seance.lieu && { picto: 'map-pin', libelle: 'Lieu', texte: seance.lieu },
    seance.objectif && { picto: 'check-square', libelle: 'Objectif', texte: seance.objectif },
    !course && rpeVise && { picto: 'barbell', libelle: 'Effort visé', texte: `RPE ${rpeVise}` },
  ].filter(Boolean)
  const allure = allureVitesse(sortie.distance, sortie.temps)
  const prevuCourse = [seance.distance, seance.temps].filter(Boolean).join(' · ')

  if (!course) {
    const listeBlocs = seance.blocs ?? []
    const nb = listeBlocs.length
    const prog = progressionBlocs(listeBlocs, lignes, blocs)
    const surtitre = `Semaine ${semaine} · séance ${numero}`
    const titre = seance.titre || `Séance ${numero}`
    const ici = Math.min(etape, nb)
    const aller = (i) => setEtape(Math.max(0, Math.min(nb, i)))
    const bloc = listeBlocs[ici]
    const enSeries = bloc && estEnSeries(bloc.format)
    // téléphone : tous les blocs avec l'écran de la maquette B (22 novembre 2026)
    // ordinateur et tablette aussi (Marie, 23 novembre 2026) : le même écran que sur téléphone, plus large
    // séance faite relue (25 novembre 2026) : le même écran, en lecture seule
    const unExercice = Boolean(bloc) && !avantDebut
    const galerie = !mobile && !unExercice // ordinateur : en-tête de la maquette pour la fin et la séance terminée
    return (
      <section className={`ec-page ec-seance ec-seance--v2${!mobile ? ' ec-seance--large' : ''}`}>
        {/* juste après « Enregistrer ma séance » : l'écran « Séance enregistrée » seul, sans le bandeau de correction (25 novembre 2026) */}
        {unExercice ? barreCorrection : galerie ? null : (!bloc && termine.current ? lienRetour : retour)}
        {refus && <p className="ec-erreur" role="alert">{refus}</p>}
        <div className="ec-s2">
          {!galerie && <p className="ec-s2-surtitre">{surtitre} · {titre}</p>}
          {galerie && (
            <EnteteOrdi titre={titre} sousTitre={surtitre} lienRetour={depuisProgramme ? '/espace/programme' : '/espace'} bloc={bloc} blocs={listeBlocs} prog={prog} etape={ici}
              aller={aller} finir={() => aller(nb)} lecture={verrou} />
          )}
          {galerie && !(!bloc && termine.current) && barreCorrection}
          <div className="ec-s2-principal">
            {bloc ? (
              unExercice ? (
                <BlocTelephone key={bloc.id} bloc={bloc} etape={ici} blocs={listeBlocs} prog={prog} lignes={lignes} notes={notes} resultats={blocs} actions={actions}
                  voirConsignes={setFiche} aller={aller} finir={() => aller(nb)} retour={retourPetit} lecture={verrou} />
              ) : (
                <>
                  {!galerie && <BandeauBloc surtitre={titre} bloc={bloc} prog={prog} etape={ici} blocs={listeBlocs} aller={aller} finir={() => aller(nb)} verrou={verrou} />}
                  {enSeries
                    ? <BlocOrdinateur key={bloc.id} bloc={bloc} lignes={lignes} notes={notes} actions={actions} lecture={verrou} voirConsignes={setFiche} etape={ici} nb={nb} aller={aller} finir={() => aller(nb)} suivant={listeBlocs[ici + 1]} />
                    : <BlocSeries key={bloc.id} bloc={bloc} saisie={{ lignes, notes, blocs }} actions={actions} lecture={verrou} voirConsignes={setFiche} sansTete />}
                  {!verrou && !enSeries && <BoutonBloc etape={ici} nb={nb} aller={aller} finir={() => aller(nb)} suivant={listeBlocs[ici + 1]} />}
                </>
              )
            ) : (
              <>
                {nb === 0 && retires.length === 0 && <p className="ec-texte">Marie n’a pas encore ajouté d’exercice à cette séance.</p>}
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
                {/* clé stable pendant la saisie : la première écriture (statut « en cours ») ne doit pas effacer effort, ressenti, commentaire */}
                {avantDebut ? null : edition
                  ? <div className="ec-correction-fin"><h2 className="ec-h2">Correction terminée ?</h2><p className="ec-texte">Vos changements sont déjà enregistrés. Marie voit la séance corrigée.</p><button type="button" className="ec-s2-gros" onClick={finirCorrection}>J’ai fini ✓</button></div>
                  : <FinDeSeance key={verrou ? 'terminee' : 'saisie'} course={false} fait={fait} etat={etatEnvoi(fait, enLigne)} envoyer={terminer}
                      suite={suiteDe(programme, seances)} vientDeFinir={termine.current} duree={dureeFinie.current} records={recordsDe(fait, programmes, seances)} />}
                {nb > 0 && (
                  // retour au dernier bloc : un bouton pilule avec une flèche, comme « Plan » (Marie, 25 novembre 2026)
                  <button type="button" className="ec-retour-bloc" onClick={() => aller(nb - 1)} aria-label={`Revenir au bloc ${nomBloc(listeBlocs[nb - 1])}`}>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
                    {nomBloc(listeBlocs[nb - 1])}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        {!unExercice && recommencer}
        <Consignes element={fiche} fermer={() => setFiche(null)} />
      </section>
    )
  }

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
{avantDebut ? null : edition
          ? <div className="ec-correction-fin"><h2 className="ec-h2">Correction terminée ?</h2><p className="ec-texte">Vos changements sont déjà enregistrés. Marie voit la séance corrigée.</p><button type="button" className="ec-s2-gros" onClick={finirCorrection}>J’ai fini ✓</button></div>
          :         <FinDeSeance key={verrou ? 'terminee' : 'saisie'} course={course} fait={fait} etat={etatEnvoi(fait, enLigne)} envoyer={terminer}
          suite={suiteDe(programme, seances)} vientDeFinir={termine.current} duree={dureeFinie.current} records={recordsDe(fait, programmes, seances)} />}
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

// Records battus pendant cette séance (14 novembre 2026), affichés sur l'écran « Séance enregistrée »
function recordsDe(fait, programmes, seances) {
  if (fait?.statut !== 'terminée') return []
  const { exoIdParElement, noms } = exercicesDe(programmes ?? [])
  return nouveauxRecords(fait, seances, exoIdParElement, noms)
}

const Croix = () => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>

// La croix de la séance (téléphone). Séance commencée : « Quitter la séance ? » avec « Remettre à zéro » en dessous,
// qui demande une seconde confirmation dans la même bulle (Marie, 22 novembre 2026).
function Quitter({ vers, enCours, remettre }) {
  const ref = useRef(null)
  const naviguer = useNavigate()
  const [etape, setEtape] = useState('quitter')
  if (!enCours) {
    return <Link className="ec-s2-retour ec-s2-quitter" to={vers} aria-label="Quitter la séance" title="Quitter la séance"><Croix /></Link>
  }
  const ouvrir = () => { setEtape('quitter'); ref.current?.showModal() }
  const fermer = () => ref.current?.close()
  return (
    <>
      <button type="button" className="ec-s2-retour ec-s2-quitter" onClick={ouvrir} aria-haspopup="dialog" aria-label="Quitter la séance" title="Quitter la séance"><Croix /></button>
      <dialog ref={ref} className="ec-tuto" aria-labelledby="quitter-titre" onClick={(e) => { if (e.target === e.currentTarget) fermer() }}>
        {etape === 'quitter' ? (
          <div className="ec-tuto__corps">
            <span className="ec-tuto__poignee" aria-hidden="true" />
            <h2 id="quitter-titre" className="ec-tuto__titre">Quitter la séance&nbsp;?</h2>
            <p className="ec-tuto__phrase">Ce que vous avez noté est sauvegardé.</p>
            <button type="button" className="ec-bouton ec-tuto__ok" onClick={() => { fermer(); naviguer(vers) }}>Quitter la séance</button>
            <button type="button" className="ec-tuto__garder ec-tuto__rouge" onClick={() => setEtape('zero')}>Remettre à zéro</button>
            <button type="button" className="ec-tuto__simple" onClick={fermer}>Continuer ma séance</button>
          </div>
        ) : (
          <div className="ec-tuto__corps">
            <span className="ec-tuto__poignee" aria-hidden="true" />
            <h2 id="quitter-titre" className="ec-tuto__titre">Remettre la séance à zéro&nbsp;?</h2>
            <p className="ec-tuto__phrase">Ce que vous avez noté sur cette séance sera effacé.</p>
            <button type="button" className="ec-bouton ec-tuto__ok ec-bouton--danger" onClick={() => { fermer(); remettre() }}>Remettre à zéro</button>
            <button type="button" className="ec-tuto__garder" onClick={() => setEtape('quitter')}>Annuler</button>
          </div>
        )}
      </dialog>
    </>
  )
}

// « Remettre à zéro » en bas de la séance, avec une confirmation
function Recommencer({ remettre }) {
  const ref = useRef(null)
  return (
    <>
      <button type="button" className="ec-recommencer" onClick={() => ref.current?.showModal()}>Remettre à zéro</button>
      <dialog ref={ref} className="ec-tuto" aria-labelledby="rz-titre" onClick={(e) => { if (e.target === e.currentTarget) ref.current.close() }}>
        <div className="ec-tuto__corps">
          <span className="ec-tuto__poignee" aria-hidden="true" />
          <h2 id="rz-titre" className="ec-tuto__titre">Remettre la séance à zéro&nbsp;?</h2>
          <p className="ec-tuto__phrase">Ce que vous avez noté sur cette séance sera effacé.</p>
          <button type="button" className="ec-bouton ec-tuto__ok ec-bouton--danger" onClick={() => { ref.current.close(); remettre() }}>Remettre à zéro</button>
          <button type="button" className="ec-tuto__garder" onClick={() => ref.current.close()}>Garder ma séance</button>
        </div>
      </dialog>
    </>
  )
}
