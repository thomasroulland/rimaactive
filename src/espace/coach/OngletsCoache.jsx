import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ajouterBilan, ajouterNoteCoach, ecouterBilans, ecouterMesMesures, ecouterMesPhotos, ecouterNotesCoach,
  majProfilSportif, supprimerBilan, supprimerNoteCoach, urlPdf, ecouterExercices, commenterSeance,
} from '../depots.js'
import SeanceFaiteCoach from './SeanceFaiteCoach.jsx'
import { ajoutJours, aujourdhuiIso, listeSeances, lundiDe, regularite, tonnage, tonnages } from '../donnees/calculs.js'
import { dateComplete, dateSeance, evolutionMesures } from '../donnees/progression.js'
import { exercicesDe } from '../donnees/seances.js'
import { chiffresCoache, effortParSemaine, suiviCoache } from '../donnees/alertes.js'
import { frNombre } from '../donnees/resume.js'
import { records } from '../donnees/records.js'
import { RM_SUIVIS } from '../donnees/banque.js'
import { messageErreur } from '../erreurs.js'
import { useCoache } from './EnteteCoache.jsx'
import { Courbe, DialogueSuppression, Ecarts, SeanceFaite, trouverSeance } from './FicheClient.jsx'
import { comparerSeance } from '../donnees/ecarts.js'
import PhotoStockee from './PhotoStockee.jsx'

// Onglets de la fiche d'un coaché, d'après la maquette coach de Marie (13 novembre 2026).
// Les données communes (coaché, programmes, séances) viennent de la page commune (useCoache).

const RM = RM_SUIVIS
const Carte = ({ titre, id, children, classe = '' }) => (
  <section className={`espace-carte fiche-carte ${classe}`} aria-labelledby={id}>
    <h2 id={id} className="fiche-carte__titre">{titre}</h2>
    {children}
  </section>
)

// ---------- Vue d'ensemble ----------
export function Ensemble() {
  const { client, uid, programmes, seances, progEnCours, erreur } = useCoache()
  const navigate = useNavigate()
  const [suppression, setSuppression] = useState(false)
  const aujourdhui = aujourdhuiIso()
  const ch = chiffresCoache({ programme: progEnCours, seances, aujourdhui })
  const { alertes } = suiviCoache({ programme: progEnCours, seances, visio: client.derniereVisio ?? null, aujourdhui, actif: client.statut === 'actif' })
  const faites = new Set((seances ?? []).filter((s) => s.statut === 'terminée').map((s) => s.seance))
  const prochaine = progEnCours ? listeSeances(progEnCours).find((x) => !faites.has(x.seance.id)) : null
  const part = ch.prevues > 0 ? Math.min(100, Math.round((ch.faites / ch.prevues) * 100)) : 0
  const details = [
    ch.regularite === null ? null : `Régularité ${ch.regularite} %`,
    ch.rpeMoyen === null ? null : `Effort moyen ${frNombre(ch.rpeMoyen)} sur 10`,
  ].filter(Boolean).join(' · ')

  return (
    <div className="onglet-pile ens">
      <p className="espace-message espace-message--erreur" role="alert">{erreur}</p>

      <section className={`ens-etat ${alertes.length ? 'a-surveiller' : 'tout-va-bien'}`} aria-labelledby="t-etat">
        <h2 id="t-etat" className="ens-etat__titre">{alertes.length ? 'À surveiller' : 'Tout va bien'}</h2>
        {alertes.length
          ? <ul className="ens-etat__liste">{alertes.map((a) => <li key={a}>{a}</li>)}</ul>
          : <p className="ens-etat__texte">{client.prenom} suit son programme, rien à signaler.</p>}
      </section>

      <div className="ens-cols">
      <Calendrier3Semaines />
      <aside className="ens-cote" aria-label="Résumé">
        <Carte titre="Progression" id="t-prog">
          <p className="ens-gros"><b>{ch.faites}</b> séance{ch.faites > 1 ? 's' : ''} sur {ch.prevues}</p>
          <div className="ens-barre" role="img" aria-label={`${part} % du programme fait`}><span style={{ width: `${part}%` }} /></div>
          {details && <p className="espace-aide">{details}</p>}
        </Carte>
        <Carte titre="Prochaine séance" id="t-prochaine">
          {prochaine
            ? <><p className="ens-gros ens-gros--texte">{prochaine.seance.titre || 'Séance sans titre'}</p><p className="espace-aide">Semaine {prochaine.semaine}</p></>
            : <p className="espace-aide">{progEnCours ? 'Toutes les séances sont faites.' : 'Pas de programme en cours.'}</p>}
        </Carte>
        <Carte titre="Objectif et 1RM" id="t-profil">
          <ProfilSportif client={client} uid={uid} />
        </Carte>
      </aside>
      </div>

      {programmes !== null && (
        <p className="ens-supprimer"><button type="button" className="lien-souligne" onClick={() => setSuppression(true)}>Supprimer ce client et ses données</button></p>
      )}
      {suppression && <DialogueSuppression client={client} uid={uid} fermer={() => setSuppression(false)} fini={() => navigate('/espace/coach', { replace: true })} />}
    </div>
  )
}

// Objectif et 1RM : affichés, modifiables sur place
function ProfilSportif({ client, uid }) {
  const { majClient } = useCoache()
  const [edition, setEdition] = useState(false)
  const [champs, setChamps] = useState({ objectif: client.objectif ?? '', rm: { ...(client.rm ?? {}) } })
  const [erreur, setErreur] = useState('')
  const rmTxt = RM.filter((k) => client.rm?.[k]).map((k) => `${k} ${frNombre(client.rm[k])} kg`).join(' · ') || 'Non renseignés'
  async function enregistrer(e) {
    e.preventDefault()
    const rm = {}
    for (const k of RM) {
      const v = parseFloat(String(champs.rm[k] ?? '').replace(',', '.'))
      if (!Number.isNaN(v) && v > 0) rm[k] = v
    }
    const maj = { objectif: champs.objectif.trim(), rm }
    try { await majProfilSportif(uid, maj); majClient(maj); setEdition(false) } catch (err) { setErreur(messageErreur(err.code)) }
  }
  if (!edition) {
    return (
      <>
        <h3 className="fiche-carte__sous">Objectif</h3>
        <p className="espace-aide">{client.objectif || 'Pas encore renseigné'}</p>
        <h3 className="fiche-carte__sous">1RM</h3>
        <p className="espace-aide">{rmTxt}</p>
        <button type="button" className="lien-souligne fiche-carte__modifier" onClick={() => setEdition(true)}>Modifier l’objectif et les 1RM</button>
      </>
    )
  }
  return (
    <form className="profil-sportif" onSubmit={enregistrer}>
      <div className="champ-groupe"><label htmlFor="ps-obj">Objectif</label>
        <input id="ps-obj" className="champ" value={champs.objectif} onChange={(e) => setChamps({ ...champs, objectif: e.target.value })} placeholder="Ex. Reprendre la course sans douleur" /></div>
      <div className="profil-sportif__rm">
        {RM.map((k) => (
          <div key={k} className="champ-groupe"><label htmlFor={`ps-${k}`}>{k} (kg)</label>
            <input id={`ps-${k}`} className="champ" inputMode="decimal" value={champs.rm[k] ?? ''} onChange={(e) => setChamps({ ...champs, rm: { ...champs.rm, [k]: e.target.value } })} /></div>
        ))}
      </div>
      <p className="espace-message espace-message--erreur" role="alert">{erreur}</p>
      <div className="espace-actions">
        <button type="submit" className="bouton bouton--principal bouton--compact">Enregistrer</button>
        <button type="button" className="bouton bouton--secondaire bouton--compact" onClick={() => setEdition(false)}>Annuler</button>
      </div>
    </form>
  )
}

// ---------- Calendrier de la Vue d'ensemble (16 novembre 2026, remplace l'onglet Historique) ----------
// Trois semaines (la dernière, celle en cours, la prochaine) : pour chaque semaine, les séances prévues au programme
// (faites, à faire, pas faites) et, jour par jour, les séances faites et les bilans. Les flèches font glisser les trois
// semaines d'une semaine ; un jour avec une activité se touche pour en voir le détail.
const MOIS_COURTS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
const JOURS_COURTS = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.']
const jourMois = (iso) => `${Number(iso.slice(8))} ${MOIS_COURTS[Number(iso.slice(5, 7)) - 1]}`
const Fleche = ({ vers }) => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d={vers === 'gauche' ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6'} />
  </svg>
)

function Calendrier3Semaines() {
  const { client, uid, programmes, seances, progEnCours } = useCoache()
  const [bilans, setBilans] = useState([])
  useEffect(() => ecouterBilans(uid, setBilans, () => setBilans([])), [uid])
  const [decalage, setDecalage] = useState(0) // en semaines, par rapport à la semaine en cours
  const [choisi, setChoisi] = useState(null)
  if (seances === null) return <p className="espace-texte" role="status">Chargement…</p>

  const aujourdhui = aujourdhuiIso()
  const lundiCourant = lundiDe(aujourdhui)
  const faites = seances.filter((x) => x.statut === 'terminée')
  const commencees = seances.filter((x) => x.statut !== 'terminée' && x.date)
  const parJour = new Map()
  const ajouter = (date, x) => { if (!date) return; if (!parJour.has(date)) parJour.set(date, []); parJour.get(date).push(x) }
  faites.forEach((sf) => ajouter(sf.date, { genre: 'seance', sf }))
  ;(bilans ?? []).forEach((b) => ajouter(b.date, { genre: 'bilan', b }))
  const titreSeance = (sf) => trouverSeance(programmes, sf)?.titre || (trouverSeance(programmes, sf) ? 'Séance' : 'Séance retirée')

  const semaines = [-1, 0, 1].map((k) => {
    const rel = k + decalage
    const lundi = ajoutJours(lundiCourant, rel * 7)
    const jours = Array.from({ length: 7 }, (_, i) => ajoutJours(lundi, i))
    // une semaine du programme va dans la semaine du calendrier qui contient son milieu (si le programme ne commence pas un lundi)
    return { rel, lundi, jours }
  })
  const jourChoisi = choisi && parJour.has(choisi) ? choisi : null

  return (
    <section className="cal3" aria-labelledby="t-cal3">
      <div className="cal3__tete">
        <h2 id="t-cal3" className="espace-sous-titre">Calendrier</h2>
        <div className="cal3__nav">
          <button type="button" className="calendrier__fleche" aria-label="Une semaine plus tôt" onClick={() => setDecalage((d) => d - 1)}><Fleche vers="gauche" /></button>
          <button type="button" className="cal3__auj" disabled={decalage === 0} onClick={() => setDecalage(0)}>Aujourd’hui</button>
          <button type="button" className="calendrier__fleche" aria-label="Une semaine plus tard" onClick={() => setDecalage((d) => d + 1)}><Fleche vers="droite" /></button>
        </div>
      </div>

      {/* les 3 semaines regroupées en une seule grille : une ligne par semaine, seul aujourd'hui est en rouge (17 novembre 2026) */}
      <div className="cal3__grille" role="grid" aria-label={`Du ${jourMois(semaines[0].lundi)} au ${jourMois(semaines[2].jours[6])}`}>
        <div className="cal3__noms" role="row">
          {JOURS_COURTS.map((j) => <span key={j} role="columnheader" className="cal3__nom-jour">{j}</span>)}
        </div>
        {semaines.map((w) => (
          <ol key={w.lundi} className="cal3__jours" role="row">
            {w.jours.map((d, i) => {
              const evts = parJour.get(d) ?? []
              const enCours = commencees.filter((x) => x.date === d)
              const premierDuMois = d.endsWith('-01')
              const elements = [
                ...evts.map((e, k) => ({ el: <span key={`e${k}`} className={`cal3__evt cal3__evt--${e.genre}`}>{e.genre === 'seance' ? titreSeance(e.sf) : (e.b.titre || 'Bilan')}</span> })),
                ...enCours.map((x) => ({ el: <span key={x.id} className="cal3__evt cal3__evt--encours">En cours</span> })),
              ]
              const contenu = (
                <>
                  <span className="cal3__jour-tete"><span className="cal3__jour-num">{Number(d.slice(8))}</span>{(premierDuMois || d === semaines[0].lundi) && <span className="cal3__mois">{MOIS_COURTS[Number(d.slice(5, 7)) - 1]}</span>}</span>
                  {/* deux lignes au plus : au-delà, la première activité puis « +N » (18 novembre 2026), la case garde sa hauteur */}
                  <span className="cal3__evts">
                    {elements.map((x, k) => (elements.length > 2 && k > 0 ? <span key={`t${k}`} className="cal3__en-trop">{x.el}</span> : x.el))}
                    {elements.length > 2 && <span className="cal3__plus">+{elements.length - 1}</span>}
                  </span>
                </>
              )
              const classes = `cal3__jour${d === aujourdhui ? ' est-aujourdhui' : ''}${d < aujourdhui ? ' est-passe' : ''}${jourChoisi === d ? ' est-choisi' : ''}${evts.length ? ' a-des-evts' : ''}`
              const etiquette = `${JOURS_COURTS[i]} ${jourMois(d)}${evts.length ? `, ${evts.length} activité${evts.length > 1 ? 's' : ''}` : ''}`
              return (
                <li key={d} role="gridcell">
                  {evts.length
                    ? <button type="button" className={classes} aria-label={etiquette} aria-pressed={jourChoisi === d} onClick={() => setChoisi(d)}>{contenu}</button>
                    : <span className={classes} aria-label={etiquette}>{contenu}</span>}
                </li>
              )
            })}
          </ol>
        ))}
      </div>
      <p className="cal3__legende" aria-hidden="true">
        <span className="cal3__evt cal3__evt--seance">Séance faite</span>
        <span className="cal3__evt cal3__evt--bilan">Bilan</span>
        <span className="cal3__legende-auj">Aujourd’hui</span>
      </p>

      {jourChoisi && (
        <JourCalendrier date={jourChoisi} evts={parJour.get(jourChoisi)} programmes={programmes} prenom={client.prenom}
          jours={[...parJour.keys()].sort()} aller={setChoisi} fermer={() => setChoisi(null)} />
      )}
    </section>
  )
}

// Détail d'un jour du calendrier (refait le 16 novembre 2026) : grande fenêtre ; à gauche la liste des activités du jour
// (séances faites, bilans), à droite l'activité choisie, avec la même vue « séance faite » que dans le programme
// (bilan, prévu / fait / comparer, réponse au coaché). Flèches : jour précédent / suivant avec une activité.
function JourCalendrier({ date, evts, programmes, prenom, jours, aller, fermer }) {
  const ref = useRef(null)
  const [banque, setBanque] = useState(null)
  const [actif, setActif] = useState(0)
  useEffect(() => { const d = ref.current; if (d && !d.open) d.showModal() }, [])
  useEffect(() => ecouterExercices(setBanque, () => setBanque([])), [])
  useEffect(() => { setActif(0) }, [date])
  const i = jours.indexOf(date)
  const precedent = i > 0 ? jours[i - 1] : null
  const suivant = i >= 0 && i < jours.length - 1 ? jours[i + 1] : null
  const nbS = evts.filter((e) => e.genre === 'seance').length
  const nbB = evts.length - nbS
  const choisi = evts[Math.min(actif, evts.length - 1)]
  const infosSeance = (sf) => {
    const p = (programmes ?? []).find((x) => x.id === sf.programme)
    const w = p ? (p.semaines ?? []).findIndex((x) => (x.seances ?? []).some((y) => y.id === sf.seance)) : -1
    const se = w >= 0 ? p.semaines[w].seances.findIndex((y) => y.id === sf.seance) : -1
    return { p, w, se, seance: trouverSeance(programmes, sf) }
  }
  const heure = (sf) => { const d = sf.finLe?.toDate?.() ?? sf.majLe?.toDate?.(); return d ? d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '' }

  return (
    <dialog ref={ref} className="espace-dialogue jour-cal jour2" aria-labelledby="jour-cal-titre" onClose={fermer}
      onClick={(e) => { if (e.target === ref.current) ref.current.close() }}>
      <header className="jour2__tete">
        <button type="button" className="calendrier__fleche" aria-label="Jour précédent avec une activité" disabled={!precedent} onClick={() => aller(precedent)}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <div className="jour2__titres">
          <h2 id="jour-cal-titre" className="jour2__date">{dateComplete(date)}</h2>
          <p className="jour2__resume">{[nbS ? `${nbS} séance${nbS > 1 ? 's' : ''} faite${nbS > 1 ? 's' : ''}` : '', nbB ? `${nbB} bilan${nbB > 1 ? 's' : ''}` : ''].filter(Boolean).join(' · ')}</p>
        </div>
        <button type="button" className="calendrier__fleche" aria-label="Jour suivant avec une activité" disabled={!suivant} onClick={() => aller(suivant)}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </button>
        <button type="button" className="jour2__fermer" aria-label="Fermer" onClick={() => ref.current.close()}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </header>
      <div className={`jour2__corps${evts.length > 1 ? ' a-une-liste' : ''}`}>
        {evts.length > 1 && (
          <nav className="jour2__liste" aria-label="Activités du jour">
            {evts.map((e, k) => {
              const s = e.genre === 'seance' ? infosSeance(e.sf).seance : null
              return (
                <button key={k} type="button" className={`jour2__item${k === actif ? ' est-actif' : ''}`} aria-current={k === actif ? 'true' : undefined} onClick={() => setActif(k)}>
                  <span className={`jour2__pastille jour2__pastille--${e.genre}`}>{e.genre === 'seance' ? 'Séance' : 'Bilan'}</span>
                  <span className="jour2__item-nom">{e.genre === 'seance' ? (s ? s.titre || 'Séance' : 'Séance retirée') : (e.b.titre || 'Bilan')}</span>
                  {e.genre === 'seance' && <span className="jour2__item-infos">{[heure(e.sf), Number.isInteger(e.sf.effort) ? `effort ${e.sf.effort}/10` : ''].filter(Boolean).join(' · ')}</span>}
                </button>
              )
            })}
          </nav>
        )}
        <div className="jour2__detail" key={`${date}-${actif}`}>
          {choisi?.genre === 'seance' && (() => {
            const { p, w, se, seance } = infosSeance(choisi.sf)
            if (!seance) {
              return (
                <article className="jour2__retiree">
                  <p className="jour2__note">Cette séance a été retirée du programme : il ne reste que ce que {prenom} a noté.</p>
                  <SeanceDetail sf={choisi.sf} programmes={programmes} prenom={prenom} />
                </article>
              )
            }
            return (
              <>
                <div className="jour2__titre-seance">
                  <p className="jour2__surtitre">{p?.nom || 'Programme'} · Semaine {w + 1} · Séance {se + 1}</p>
                  <h3>{seance.titre || 'Séance'}</h3>
                </div>
                <SeanceFaiteCoach seance={seance} sf={choisi.sf} prenom={prenom} banque={banque} rpeVise={p?.semaines?.[w]?.rpe} semaine={w + 1} numero={se + 1}
                  commenter={(texte) => commenterSeance(choisi.sf.id, texte)} />
              </>
            )
          })()}
          {choisi?.genre === 'bilan' && (
            <article className="jour2__bilan">
              <p className="jour2__pastille jour2__pastille--bilan">Bilan</p>
              <h3 className="bilan__titre">{choisi.b.titre || 'Bilan'}</h3>
              {choisi.b.semaine ? <p className="espace-aide">Semaine {choisi.b.semaine}</p> : null}
              {choisi.b.texte && <p className="fiche-carte__texte">{choisi.b.texte}</p>}
              {choisi.b.ajuster && <p className="espace-verrou"><strong>À ajuster :</strong> {choisi.b.ajuster}</p>}
              {choisi.b.pdf?.chemin && <LienPdf pdf={choisi.b.pdf} />}
            </article>
          )}
        </div>
      </div>
    </dialog>
  )
}

// Détail d'une séance faite (calendrier) : titre, semaine, effort, séries, commentaires
function SeanceDetail({ sf, programmes, prenom }) {
  const s = trouverSeance(programmes, sf)
  const p = (programmes ?? []).find((x) => x.id === sf.programme)
  const sem = p ? (p.semaines ?? []).findIndex((w) => (w.seances ?? []).some((x) => x.id === sf.seance)) + 1 : 0
  const t = tonnage(sf)
  const cmp = comparerSeance(s, sf)
  const infos = [sem ? `Semaine ${sem}` : '', Number.isInteger(sf.effort) ? `effort ${sf.effort}/10` : '', sf.ressenti, t > 0 ? `${frNombre(Math.round(t))} kg soulevés` : ''].filter(Boolean).join(' · ')
  return (
    <>
      <p className="calendrier__pastille calendrier__pastille--seance">Séance faite</p>
      <h3 className="bilan__titre">{s ? s.titre || 'Séance' : 'Séance retirée du programme'}</h3>
      {infos && <p className="espace-aide">{infos}</p>}
      {cmp.verdict && <p className={`seance-verdict${cmp.aRegarder ? ' seance-verdict--voir' : ''}`}>{cmp.verdict}</p>}
      <Ecarts cmp={cmp} />
      <ul className="fiche-liste historique__detail"><SeanceFaite sf={sf} seance={s} prenom={prenom} nu /></ul>
    </>
  )
}

// ---------- Bilans (en visio ou en présentiel) ----------
export function Bilans() {
  const { client, uid, enCours, progEnCours } = useCoache()
  const [bilans, setBilans] = useState(null)
  const [vi, setVi] = useState({ titre: '', date: aujourdhuiIso(), semaine: String(enCours?.semaine || 1), texte: '', ajuster: '' })
  const [pdf, setPdf] = useState(null)
  const [envoi, setEnvoi] = useState(false)
  const champPdf = useRef(null)
  const [message, setMessage] = useState('')
  const [erreur, setErreur] = useState('')
  const [aSupprimer, setASupprimer] = useState(null)
  useEffect(() => ecouterBilans(uid, setBilans, () => setErreur('Impossible de charger les bilans. Vérifiez votre connexion.')), [uid])
  const nbSem = progEnCours?.semaines?.length ?? 0
  const plusRecent = (liste) => liste.reduce((m, b) => (!m || b.date > m.date ? b : m), null)

  async function enregistrer(e) {
    e.preventDefault()
    if (!vi.titre.trim()) { setErreur('Donnez un titre au bilan.'); return }
    if (!vi.texte.trim() && !pdf) { setErreur('Écrivez le compte rendu ou joignez un PDF avant d’enregistrer.'); return }
    if (vi.date > aujourdhuiIso()) { setErreur('Choisissez une date passée ou aujourd’hui.'); return }
    setErreur(''); setMessage('')
    const bilan = { titre: vi.titre.trim(), date: vi.date, semaine: nbSem ? Number(vi.semaine) : null, texte: vi.texte.trim(), ajuster: vi.ajuster.trim() }
    const derniere = plusRecent([...(bilans ?? []), bilan])
    setEnvoi(true)
    try {
      await ajouterBilan(uid, bilan, { date: derniere.date, semaine: derniere.semaine ?? null }, pdf)
      setVi({ ...vi, titre: '', texte: '', ajuster: '' }); setPdf(null); if (champPdf.current) champPdf.current.value = ''
      setMessage('Bilan enregistré.')
    } catch (err) { setErreur(messageErreur(err.code)) } finally { setEnvoi(false) }
  }
  async function supprimer(b) {
    const restants = (bilans ?? []).filter((x) => x.id !== b.id)
    const d = plusRecent(restants)
    try { await supprimerBilan(uid, b.id, d ? { date: d.date, semaine: d.semaine ?? null } : null, b.pdf); setASupprimer(null); setMessage('Bilan supprimé.') } catch (err) { setErreur(messageErreur(err.code)) }
  }

  return (
    <div className="onglet-pile">
      <p className="espace-aide">Vos comptes rendus des bilans faits avec {client.prenom}. Visibles uniquement par vous.</p>
      <form className="espace-carte fiche-carte" onSubmit={enregistrer} aria-labelledby="t-visio">
        <h2 id="t-visio" className="fiche-carte__titre">Nouveau bilan</h2>
        <div className="formulaire-grille">
          <div className="champ-groupe formulaire-grille__large"><label htmlFor="vi-titre">Titre</label>
            <input id="vi-titre" className="champ" autoComplete="off" value={vi.titre} placeholder="Ex. Bilan de fin de mois, bilan postural…" onChange={(e) => setVi({ ...vi, titre: e.target.value })} /></div>
          <div className="champ-groupe"><label htmlFor="vi-date">Date du bilan</label>
            <input id="vi-date" type="date" className="champ" value={vi.date} max={aujourdhuiIso()} onChange={(e) => setVi({ ...vi, date: e.target.value })} /></div>
          {nbSem > 0 && (
            <div className="champ-groupe"><label htmlFor="vi-sem">Semaine du programme</label>
              <select id="vi-sem" className="champ" value={vi.semaine} onChange={(e) => setVi({ ...vi, semaine: e.target.value })}>
                {Array.from({ length: nbSem }, (_, i) => <option key={i} value={i + 1}>Semaine {i + 1}</option>)}
              </select></div>
          )}
          <div className="champ-groupe formulaire-grille__large"><label htmlFor="vi-texte">Compte rendu</label>
            <textarea id="vi-texte" className="champ" rows={5} value={vi.texte} placeholder="Forme, sommeil, motivation, douleurs, ressenti sur les séances…" onChange={(e) => setVi({ ...vi, texte: e.target.value })} /></div>
          <div className="champ-groupe formulaire-grille__large"><label htmlFor="vi-ajuster">À ajuster dans le programme (facultatif)</label>
            <textarea id="vi-ajuster" className="champ" rows={2} value={vi.ajuster} onChange={(e) => setVi({ ...vi, ajuster: e.target.value })} /></div>
          <div className="champ-groupe formulaire-grille__large">
            <span className="bilan-pdf__lib" id="vi-pdf-lib">PDF joint (facultatif)</span>
            <div className="bilan-pdf">
              <input ref={champPdf} id="vi-pdf" className="sr-only" type="file" accept="application/pdf" aria-labelledby="vi-pdf-lib"
                onChange={(e) => { setPdf(e.target.files?.[0] ?? null); setErreur('') }} />
              <label htmlFor="vi-pdf" className="lien-souligne bilan-pdf__choisir">{pdf ? 'Changer de PDF' : 'Joindre un PDF'}</label>
              {pdf && <span className="bilan-pdf__nom">{pdf.name}<button type="button" className="bilan-pdf__retirer" aria-label="Retirer le PDF" onClick={() => { setPdf(null); champPdf.current.value = '' }}>×</button></span>}
              <span className="espace-aide">10 Mo maximum. Visible par vous seule.</span>
            </div>
          </div>
        </div>
        <p className="espace-message" role="status">{message}</p>
        <p className="espace-message espace-message--erreur" role="alert">{erreur}</p>
        <button type="submit" className="bouton bouton--principal" disabled={envoi}>{envoi ? 'Enregistrement…' : 'Enregistrer le bilan'}</button>
      </form>
      {bilans !== null && bilans.length === 0 && <p className="espace-texte">Aucun bilan pour l’instant.</p>}
      {(bilans ?? []).map((b) => (
        <article key={b.id} className="espace-carte fiche-carte">
          <div className="fiche-carte__tete">
            <div>
              <h3 className="bilan__titre">{b.titre || 'Bilan'}</h3>
              <p className="espace-aide">{b.semaine ? `Semaine ${b.semaine} · ` : ''}{dateComplete(b.date)}</p>
            </div>
            {aSupprimer === b.id
              ? <span className="espace-actions"><button type="button" className="lien-souligne" onClick={() => supprimer(b)}>Confirmer la suppression</button><button type="button" className="espace-lien" onClick={() => setASupprimer(null)}>Annuler</button></span>
              : <button type="button" className="espace-lien" onClick={() => setASupprimer(b.id)}>Supprimer</button>}
          </div>
          {b.texte && <p className="fiche-carte__texte">{b.texte}</p>}
          {b.ajuster && <p className="espace-verrou"><strong>À ajuster :</strong> {b.ajuster}</p>}
          {b.pdf?.chemin && <LienPdf pdf={b.pdf} />}
        </article>
      ))}
    </div>
  )
}

// Lien vers le PDF d'un bilan (adresse demandée au moment du clic)
function LienPdf({ pdf }) {
  const [erreur, setErreur] = useState('')
  async function ouvrir() {
    setErreur('')
    const fenetre = window.open('', '_blank')
    try { const url = await urlPdf(pdf.chemin); if (fenetre) fenetre.location = url; else window.location.href = url } catch { fenetre?.close(); setErreur('Impossible d’ouvrir le PDF. Réessayez.') }
  }
  return (
    <p className="bilan-pdf__lien">
      <button type="button" className="lien-souligne" onClick={ouvrir}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></svg>
        {pdf.nom || 'PDF du bilan'}
      </button>
      {erreur && <span className="espace-message espace-message--erreur" role="alert">{erreur}</span>}
    </p>
  )
}

// ---------- Statistiques ----------
export function Stats() {
  const { uid, programmes, seances, progEnCours } = useCoache()
  const [mesures, setMesures] = useState(null)
  useEffect(() => ecouterMesMesures(uid, setMesures, () => setMesures([])), [uid])
  const terminees = (seances ?? []).filter((s) => s.statut === 'terminée')
  const faites = new Set(terminees.filter((s) => progEnCours && s.programme === progEnCours.id).map((s) => s.seance))
  const reg = progEnCours ? regularite(progEnCours, faites) : []
  const efforts = effortParSemaine(progEnCours, seances)
  const { exoIdParElement, noms } = exercicesDe(programmes ?? [])
  // tonnage (charge × répétitions des séries faites) : par séance, puis exercice par exercice
  const parSeance = tonnages(seances ?? [])
  const total = parSeance.reduce((t, p) => t + p.charge, 0)
  const courbes = [...noms.entries()]
    .map(([exoId, nom]) => ({ exoId, nom, points: tonnages(seances ?? [], exoIdParElement, exoId) }))
    .filter((c) => c.points.length > 0).sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
  const recs = records(seances ?? [], exoIdParElement, noms)
  const COL = [['poids', 'Poids', 'kg'], ['taille', 'Taille', 'cm'], ['hanches', 'Hanches', 'cm'], ['poitrine', 'Poitrine', 'cm'], ['bras', 'Bras', 'cm'], ['cuisse', 'Cuisse', 'cm']]

  return (
    <div className="onglet-pile">
      <div className="fiche-grille">
        <Carte titre="Régularité" id="t-reg">
          {reg.length ? (
            <ul className="stats-liste">
              {reg.map((g) => (
                <li key={g.semaine}><span className="stats-liste__sem">S{g.semaine}</span>
                  <span className="carte-coache__semaines" role="img" aria-label={`Semaine ${g.semaine} : ${g.faites} sur ${g.prevues}`}>
                    {Array.from({ length: g.prevues }, (_, i) => <span key={i} className={`case-semaine ${i < g.faites ? 'case-semaine--faite' : ''}`} />)}
                  </span>
                  <span className="espace-aide">{g.faites} sur {g.prevues}</span></li>
              ))}
            </ul>
          ) : <p className="espace-aide">Pas de programme en cours.</p>}
        </Carte>
        <Carte titre="RPE visé et ressenti" id="t-eff">
          {efforts.length ? (
            <ul className="stats-liste">
              {efforts.map((f) => (
                <li key={f.semaine}><span className="stats-liste__sem">S{f.semaine}</span>
                  <span>Visé <strong>{f.vise ?? '–'}</strong> · ressenti <strong>{f.ressenti === null ? '–' : frNombre(f.ressenti)}</strong></span>
                  <span className={`espace-aide${f.ecart > 0 ? ' stats-liste__haut' : ''}`}>{f.ecart === null ? '' : f.ecart > 0 ? 'au-dessus du prévu' : f.ecart < 0 ? 'en dessous' : 'conforme'}</span></li>
              ))}
            </ul>
          ) : <p className="espace-aide">Pas de programme en cours.</p>}
        </Carte>
      </div>
      <section aria-labelledby="t-ch" className="onglet-pile">
        <div className="suivi-titre">
          <h2 id="t-ch" className="espace-sous-titre">Tonnage</h2>
          <span className="espace-aide">charge × répétitions des séries faites</span>
        </div>
        {parSeance.length === 0 ? <p className="espace-aide">Pas encore de séries avec charge et répétitions.</p> : (
          <>
            <dl className="tonnage-chiffres">
              <div className="espace-carte"><dt>Tonnage total</dt><dd>{frNombre(Math.round(total))} kg</dd></div>
              <div className="espace-carte"><dt>Moyenne par séance</dt><dd>{frNombre(Math.round(total / parSeance.length))} kg</dd></div>
              <div className="espace-carte"><dt>Dernière séance</dt><dd>{frNombre(Math.round(parSeance[parSeance.length - 1].charge))} kg</dd></div>
            </dl>
            <ul className="fiche-liste fiche-courbes stats-courbes">
              <Courbe nom="Toutes les séances" points={parSeance.slice(-10)} libelle="tonnage par séance" />
              {courbes.map((c) => <Courbe key={c.exoId} nom={c.nom} points={c.points.slice(-8)} libelle="tonnage par séance" />)}
            </ul>
          </>
        )}
      </section>
      <section aria-labelledby="t-rec" className="onglet-pile">
        <div className="suivi-titre">
          <h2 id="t-rec" className="espace-sous-titre">Records personnels</h2>
          <span className="espace-aide">meilleure charge par exercice</span>
        </div>
        {recs.length === 0 ? <p className="espace-aide">Pas encore de série avec une charge.</p> : (
          <ul className="records-coache">
            {recs.map((r) => (
              <li key={r.exoId} className="espace-carte">
                <span className="records-coache__nom">{r.nom}</span>
                <strong className="records-coache__val">{frNombre(r.charge)} kg <small>× {frNombre(r.reps)}</small></strong>
                <span className="espace-aide">le {dateComplete(r.date)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <Carte titre="Poids et mensurations" id="t-mes" classe="mesures-coache">
        {mesures === null ? <p className="espace-aide" role="status">Chargement…</p> : mesures.length === 0 ? <p className="espace-aide">Pas encore de mesure saisie.</p> : (
          <>
            <div className="mesures-coache__defile"><table className="mesures-coache__table">
              <thead><tr><th scope="col">Date</th>{COL.map(([c, l, u]) => <th key={c} scope="col">{l} <small>({u})</small></th>)}</tr></thead>
              <tbody>{mesures.map((m) => <tr key={m.id}><td>{dateComplete(m.date)}</td>{COL.map(([c]) => <td key={c}>{typeof m[c] === 'number' ? frNombre(m[c]) : '–'}</td>)}</tr>)}</tbody>
            </table></div>
            <p className="espace-aide">{evolutionMesures(mesures)}</p>
          </>
        )}
      </Carte>
    </div>
  )
}

// ---------- Photos ----------
export function Photos() {
  const { client, uid } = useCoache()
  const [photos, setPhotos] = useState(null)
  const [avant, setAvant] = useState('')
  const [apres, setApres] = useState('')
  useEffect(() => ecouterMesPhotos(uid, setPhotos, () => setPhotos([])), [uid])
  if (photos === null) return <p className="espace-texte" role="status">Chargement…</p>
  const parId = (id) => photos.find((p) => p.id === id)
  const pAvant = parId(avant) ?? photos[0]
  const pApres = parId(apres) ?? photos[photos.length - 1]
  return (
    <div className="onglet-pile">
      <p className="espace-aide">Photos importées par {client.prenom} depuis son espace. Privées : visibles uniquement par {client.prenom} et vous.</p>
      <Carte titre="Avant / après" id="t-cmp">
        {photos.length < 2 && (
          <p className="espace-aide">
            {photos.length === 0
              ? `Aucune photo pour l’instant. Dès que ${client.prenom} en importe depuis son espace, vous pourrez comparer deux dates ici.`
              : `Une seule photo pour l’instant : la comparaison sera possible dès la deuxième.`}
          </p>
        )}
        <div className="comparaison">
          {[['Avant', pAvant, setAvant], ['Après', photos.length >= 2 ? pApres : null, setApres]].map(([lib, p, choisir]) => (
            <div key={lib} className="comparaison__cote">
              <div className="champ-groupe"><label htmlFor={`cmp-${lib}`}>{lib}</label>
                <select id={`cmp-${lib}`} className="champ" value={p?.id ?? ''} disabled={!p} onChange={(e) => choisir(e.target.value)}>
                  {!p && <option value="">Pas encore de photo</option>}
                  {p && photos.map((x) => <option key={x.id} value={x.id}>{dateComplete(x.date)}</option>)}
                </select></div>
              {p
                ? <PhotoStockee chemin={p.chemin} alt={`${lib} : photo du ${dateComplete(p.date)}`} classe="comparaison__img" />
                : <div className="comparaison__img comparaison__vide" aria-hidden="true"><span>{lib === 'Avant' ? 'Première photo' : 'Photo la plus récente'}</span></div>}
            </div>
          ))}
        </div>
      </Carte>
      {photos.length > 0 && (
        <ul className="photos-coache">
          {[...photos].reverse().map((ph) => (
            <li key={ph.id}><PhotoStockee chemin={ph.chemin} alt={`Photo de progression du ${dateComplete(ph.date)}`} classe="photos-coache__img" /><span>{dateComplete(ph.date)}</span></li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ---------- Notes privées ----------
export function Notes() {
  const { client, uid } = useCoache()
  const [notes, setNotes] = useState(null)
  const [texte, setTexte] = useState('')
  const [erreur, setErreur] = useState('')
  const [message, setMessage] = useState('')
  useEffect(() => ecouterNotesCoach(uid, setNotes, () => setErreur('Impossible de charger les notes. Vérifiez votre connexion.')), [uid])
  async function ajouter(e) {
    e.preventDefault()
    if (!texte.trim()) return
    setErreur(''); setMessage('')
    try { await ajouterNoteCoach(uid, texte.trim(), aujourdhuiIso()); setTexte(''); setMessage('Note ajoutée.') } catch (err) { setErreur(messageErreur(err.code)) }
  }
  return (
    <div className="onglet-pile">
      <p className="espace-aide">Visibles uniquement par vous. {client.prenom} ne les voit pas.</p>
      <form className="espace-carte fiche-carte" onSubmit={ajouter}>
        <label htmlFor="note-privee" className="fiche-carte__titre">Nouvelle note</label>
        <textarea id="note-privee" className="champ" rows={3} value={texte} onChange={(e) => setTexte(e.target.value)} />
        <p className="espace-message" role="status">{message}</p>
        <p className="espace-message espace-message--erreur" role="alert">{erreur}</p>
        <button type="submit" className="bouton bouton--principal" disabled={!texte.trim()}>Ajouter la note</button>
      </form>
      {(notes ?? []).map((n) => (
        <article key={n.id} className="espace-carte fiche-carte">
          <div className="fiche-carte__tete"><p className="espace-aide">{dateComplete(n.date)}</p>
            <button type="button" className="espace-lien" onClick={() => supprimerNoteCoach(uid, n.id).catch((err) => setErreur(messageErreur(err.code)))}>Supprimer</button></div>
          <p className="fiche-carte__texte">{n.texte}</p>
        </article>
      ))}
    </div>
  )
}

