import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ajouterBilan, ajouterNoteCoach, ecouterBilans, ecouterMesMesures, ecouterMesPhotos, ecouterNotesCoach,
  majProfilSportif, supprimerBilan, supprimerNoteCoach, urlPdf,
} from '../depots.js'
import { aujourdhuiIso, grilleMois, listeSeances, regularite, tonnage, tonnages } from '../donnees/calculs.js'
import { dateComplete, dateSeance, evolutionMesures } from '../donnees/progression.js'
import { exercicesDe, detailSeance, texteSerie } from '../donnees/seances.js'
import { chiffresCoache, effortParSemaine, suiviCoache } from '../donnees/alertes.js'
import { frNombre } from '../donnees/resume.js'
import { RM_SUIVIS } from '../donnees/banque.js'
import { messageErreur } from '../erreurs.js'
import { useCoache } from './EnteteCoache.jsx'
import { Courbe, DialogueSuppression, SeanceFaite, trouverSeance } from './FicheClient.jsx'
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
  const [bilans, setBilans] = useState(null)
  const [suppression, setSuppression] = useState(false)
  useEffect(() => ecouterBilans(uid, setBilans, () => setBilans([])), [uid])
  const aujourdhui = aujourdhuiIso()
  const ch = chiffresCoache({ programme: progEnCours, seances, aujourdhui })
  const { alertes } = suiviCoache({ programme: progEnCours, seances, visio: client.derniereVisio ?? null, aujourdhui, actif: client.statut === 'actif' })
  const faites = new Set((seances ?? []).filter((s) => s.statut === 'terminée').map((s) => s.seance))
  const prochaine = progEnCours ? listeSeances(progEnCours).find((x) => !faites.has(x.seance.id)) : null
  const dernier = bilans?.[0]

  return (
    <div className="onglet-pile">
      <p className="espace-message espace-message--erreur" role="alert">{erreur}</p>
      <dl className="chiffres-fiche">
        <div className="espace-carte"><dt>Séances faites sur {ch.prevues}</dt><dd>{ch.faites}</dd></div>
        <div className="espace-carte"><dt>Régularité des semaines passées</dt><dd>{ch.regularite === null ? '–' : `${ch.regularite} %`}</dd></div>
        <div className="espace-carte"><dt>RPE moyen des séances</dt><dd>{ch.rpeMoyen === null ? '–' : frNombre(ch.rpeMoyen)}</dd></div>
        <div className="espace-carte"><dt>Bilans notés</dt><dd>{bilans ? bilans.length : '–'}</dd></div>
      </dl>
      <div className="fiche-grille">
        <Carte titre="Alertes" id="t-alertes">
          {alertes.length ? <ul className="alertes">{alertes.map((a) => <li key={a}>{a}</li>)}</ul> : <p className="espace-aide">Aucune alerte.</p>}
        </Carte>
        <Carte titre="Prochaine séance" id="t-prochaine">
          {prochaine
            ? <><p className="fiche-carte__fort">{prochaine.seance.titre || 'Séance sans titre'}</p><p className="espace-aide">Semaine {prochaine.semaine}</p></>
            : <p className="espace-aide">{progEnCours ? 'Toutes les séances sont faites.' : 'Pas de programme en cours.'}</p>}
          <ProfilSportif client={client} uid={uid} />
        </Carte>
        <Carte titre="Dernier bilan" id="t-visio">
          {dernier
            ? <><p className="espace-aide">{dernier.semaine ? `S${dernier.semaine} · ` : ''}{dateSeance(dernier.date)}</p><p className="fiche-carte__texte">{dernier.texte}{dernier.ajuster ? ` À ajuster : ${dernier.ajuster}` : ''}</p></>
            : <p className="espace-aide">{client.derniereVisio?.date ? `S${client.derniereVisio.semaine ?? '?'} · ${dateSeance(client.derniereVisio.date)}` : 'Aucun bilan noté.'}</p>}
        </Carte>
      </div>
      {programmes !== null && (
        <section className="fiche-bloc fiche-danger" aria-labelledby="fiche-supp">
          <h2 id="fiche-supp" className="espace-sous-titre">Supprimer ce client</h2>
          <p className="espace-texte">Le compte, les programmes, les séances, les photos, les bilans et les notes de {client.prenom} sont effacés définitivement.</p>
          <button type="button" className="bouton bouton--secondaire" onClick={() => setSuppression(true)}>Supprimer ce client et ses données</button>
        </section>
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

// ---------- Historique : calendrier du mois (14 novembre 2026) ----------
const MOIS_NOMS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
const JOURS_COURTS = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.']

export function Historique() {
  const { client, uid, programmes, seances } = useCoache()
  const [bilans, setBilans] = useState([])
  useEffect(() => ecouterBilans(uid, setBilans, () => setBilans([])), [uid])
  const terminees = (seances ?? []).filter((s) => s.statut === 'terminée')
  const aujourdhui = aujourdhuiIso()
  // mois affiché : celui de la dernière séance faite (sinon le mois en cours)
  const derniere = terminees.map((s) => s.date).filter(Boolean).sort().pop() ?? aujourdhui
  const [mois, setMois] = useState(null)
  const [choisi, setChoisi] = useState(null)
  const courant = mois ?? { a: Number(derniere.slice(0, 4)), m: Number(derniere.slice(5, 7)) }
  if (seances === null) return <p className="espace-texte" role="status">Chargement…</p>

  const parJour = new Map()
  const ajouter = (date, x) => { if (!date) return; if (!parJour.has(date)) parJour.set(date, []); parJour.get(date).push(x) }
  terminees.forEach((sf) => ajouter(sf.date, { genre: 'seance', sf }))
  ;(bilans ?? []).forEach((b) => ajouter(b.date, { genre: 'bilan', b }))
  const grille = grilleMois(courant.a, courant.m)
  const prefixe = `${courant.a}-${String(courant.m).padStart(2, '0')}`
  const duMois = terminees.filter((s) => s.date?.startsWith(prefixe))
  const tonnageMois = duMois.reduce((t, sf) => t + tonnage(sf), 0)
  const bilansMois = (bilans ?? []).filter((b) => b.date?.startsWith(prefixe)).length
  const jourChoisi = choisi && parJour.has(choisi) ? choisi : null
  const changerMois = (pas) => {
    const d = new Date(Date.UTC(courant.a, courant.m - 1 + pas, 1))
    setMois({ a: d.getUTCFullYear(), m: d.getUTCMonth() + 1 }); setChoisi(null)
  }
  const titreSeance = (sf) => trouverSeance(programmes, sf)?.titre || (trouverSeance(programmes, sf) ? 'Séance' : 'Séance retirée')

  return (
    <div className="onglet-pile historique-cal">
      <div className="espace-carte calendrier">
        <div className="calendrier__tete">
          <button type="button" className="calendrier__fleche" aria-label="Mois précédent" onClick={() => changerMois(-1)}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
          </button>
          <h2 className="calendrier__mois" aria-live="polite">{MOIS_NOMS[courant.m - 1]} {courant.a}</h2>
          <button type="button" className="calendrier__fleche" aria-label="Mois suivant" onClick={() => changerMois(1)}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
          </button>
          <button type="button" className="lien-souligne calendrier__auj" onClick={() => { setMois({ a: Number(aujourdhui.slice(0, 4)), m: Number(aujourdhui.slice(5, 7)) }); setChoisi(aujourdhui) }}>Aujourd’hui</button>
        </div>
        <p className="calendrier__resume">
          <span><strong>{duMois.length}</strong> séance{duMois.length > 1 ? 's' : ''} faite{duMois.length > 1 ? 's' : ''}</span>
          <span><strong>{bilansMois}</strong> bilan{bilansMois > 1 ? 's' : ''}</span>
          {tonnageMois > 0 && <span><strong>{frNombre(Math.round(tonnageMois))} kg</strong> soulevés</span>}
        </p>
        <table className="calendrier__grille">
          <caption className="sr-only">Séances faites et bilans de {client.prenom}, {MOIS_NOMS[courant.m - 1]} {courant.a}</caption>
          <thead><tr>{JOURS_COURTS.map((j) => <th key={j} scope="col">{j}</th>)}</tr></thead>
          <tbody key={prefixe}>
            {grille.map((sem) => (
              <tr key={sem[0].date}>
                {sem.map(({ date, dansLeMois }) => {
                  const evts = parJour.get(date) ?? []
                  const nbS = evts.filter((e) => e.genre === 'seance').length
                  const nbB = evts.length - nbS
                  const etiquette = `${Number(date.slice(8))} ${MOIS_NOMS[Number(date.slice(5, 7)) - 1]}${nbS ? `, ${nbS} séance${nbS > 1 ? 's' : ''}` : ''}${nbB ? `, ${nbB} bilan${nbB > 1 ? 's' : ''}` : ''}`
                  const contenu = (
                    <>
                      <span className="calendrier__num">{Number(date.slice(8))}</span>
                      <span className="calendrier__evts">
                        {evts.slice(0, 2).map((e, i) => (
                          <span key={i} className={`calendrier__pastille calendrier__pastille--${e.genre}`}>{e.genre === 'seance' ? titreSeance(e.sf) : (e.b.titre || 'Bilan')}</span>
                        ))}
                        {evts.length > 2 && <span className="calendrier__plus">+{evts.length - 2}</span>}
                      </span>
                    </>
                  )
                  const classes = `calendrier__jour${dansLeMois ? '' : ' calendrier__jour--hors'}${date === aujourdhui ? ' calendrier__jour--auj' : ''}${jourChoisi === date ? ' calendrier__jour--choisi' : ''}`
                  return (
                    <td key={date}>
                      {evts.length
                        ? <button type="button" className={classes} aria-label={etiquette} aria-pressed={jourChoisi === date} onClick={() => setChoisi(jourChoisi === date ? null : date)}>{contenu}</button>
                        : <span className={classes} aria-label={etiquette}>{contenu}</span>}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="calendrier__legende"><span className="calendrier__pastille calendrier__pastille--seance">Séance faite</span><span className="calendrier__pastille calendrier__pastille--bilan">Bilan</span></p>
      </div>

      {jourChoisi && (
        <JourCalendrier date={jourChoisi} evts={parJour.get(jourChoisi)} programmes={programmes} prenom={client.prenom}
          jours={[...parJour.keys()].sort()} aller={setChoisi} fermer={() => setChoisi(null)} />
      )}
      {!terminees.length && !(bilans ?? []).length && <p className="espace-texte">Aucune séance faite ni bilan pour l’instant.</p>}
    </div>
  )
}

// Fenêtre d'un jour du calendrier : séances faites et bilans de ce jour, flèches vers le jour précédent / suivant
function JourCalendrier({ date, evts, programmes, prenom, jours, aller, fermer }) {
  const ref = useRef(null)
  useEffect(() => { const d = ref.current; if (d && !d.open) d.showModal() }, [])
  const i = jours.indexOf(date)
  const precedent = i > 0 ? jours[i - 1] : null
  const suivant = i >= 0 && i < jours.length - 1 ? jours[i + 1] : null
  const nbS = evts.filter((e) => e.genre === 'seance').length
  const nbB = evts.length - nbS
  return (
    <dialog ref={ref} className="espace-dialogue jour-cal" aria-labelledby="jour-cal-titre" onClose={fermer}
      onClick={(e) => { if (e.target === ref.current) ref.current.close() }}>
      <header className="jour-cal__tete">
        <button type="button" className="calendrier__fleche" aria-label="Jour précédent avec une activité" disabled={!precedent} onClick={() => aller(precedent)}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
        </button>
        <div className="jour-cal__titres">
          <h2 id="jour-cal-titre" className="jour-cal__date">{dateComplete(date)}</h2>
          <p className="espace-aide">{[nbS ? `${nbS} séance${nbS > 1 ? 's' : ''} faite${nbS > 1 ? 's' : ''}` : '', nbB ? `${nbB} bilan${nbB > 1 ? 's' : ''}` : ''].filter(Boolean).join(' · ')}</p>
        </div>
        <button type="button" className="calendrier__fleche" aria-label="Jour suivant avec une activité" disabled={!suivant} onClick={() => aller(suivant)}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
        </button>
        <button type="button" className="panneau-seance__fermer jour-cal__fermer" aria-label="Fermer" onClick={() => ref.current.close()}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
        </button>
      </header>
      <div className="jour-cal__corps" key={date}>
        {evts.map((e, k) => e.genre === 'seance' ? (
          <article key={k} className="jour-cal__bloc"><SeanceDetail sf={e.sf} programmes={programmes} prenom={prenom} /></article>
        ) : (
          <article key={k} className="jour-cal__bloc">
            <p className="calendrier__pastille calendrier__pastille--bilan">Bilan</p>
            <h3 className="bilan__titre">{e.b.titre || 'Bilan'}</h3>
            {e.b.semaine ? <p className="espace-aide">Semaine {e.b.semaine}</p> : null}
            {e.b.texte && <p className="fiche-carte__texte">{e.b.texte}</p>}
            {e.b.ajuster && <p className="espace-verrou"><strong>À ajuster :</strong> {e.b.ajuster}</p>}
            {e.b.pdf?.chemin && <LienPdf pdf={e.b.pdf} />}
          </article>
        ))}
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
  const infos = [sem ? `Semaine ${sem}` : '', Number.isInteger(sf.effort) ? `effort ${sf.effort}/10` : '', sf.ressenti, t > 0 ? `${frNombre(Math.round(t))} kg soulevés` : ''].filter(Boolean).join(' · ')
  return (
    <>
      <p className="calendrier__pastille calendrier__pastille--seance">Séance faite</p>
      <h3 className="bilan__titre">{s ? s.titre || 'Séance' : 'Séance retirée du programme'}</h3>
      {infos && <p className="espace-aide">{infos}</p>}
      <ul className="historique__lignes">
        {detailSeance(s, sf.series).map((x) => (
          <li key={x.cle}><strong>{x.nom}</strong> · {x.lignes.map((l) => texteSerie(l)).join(' / ')}</li>
        ))}
      </ul>
      <ul className="fiche-liste historique__detail"><SeanceFaite sf={sf} seance={s} prenom={prenom} /></ul>
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
