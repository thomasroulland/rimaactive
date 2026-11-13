import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ajouterBilan, ajouterNoteCoach, ecouterBilans, ecouterMesMesures, ecouterMesPhotos, ecouterNotesCoach,
  majProfilSportif, supprimerBilan, supprimerNoteCoach,
} from '../depots.js'
import { aujourdhuiIso, listeSeances, meilleuresCharges, regularite } from '../donnees/calculs.js'
import { dateComplete, dateSeance, evolutionMesures } from '../donnees/progression.js'
import { exercicesDe, detailSeance, texteSerie } from '../donnees/seances.js'
import { chiffresCoache, effortParSemaine, suiviCoache } from '../donnees/alertes.js'
import { frNombre } from '../donnees/resume.js'
import { RM_SUIVIS } from '../donnees/banque.js'
import { messageErreur } from '../erreurs.js'
import { useCoache } from './EnteteCoache.jsx'
import { Courbe, DialogueSuppression, SeanceFaite, trouverSeance } from './FicheClient.jsx'
import PhotoStockee from './PhotoStockee.jsx'
import { basculerDetails } from '../../components/basculerDetails.js'

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
        <div className="espace-carte"><dt>RPE moyen des séries</dt><dd>{ch.rpeMoyen === null ? '–' : frNombre(ch.rpeMoyen)}</dd></div>
        <div className="espace-carte"><dt>Visios notées</dt><dd>{bilans ? bilans.length : '–'}</dd></div>
      </dl>
      <div className="fiche-grille">
        <Carte titre="Alertes" id="t-alertes">
          {alertes.length ? <ul className="alertes">{alertes.map((a) => <li key={a}>{a}</li>)}</ul> : <p className="espace-aide">Aucune alerte.</p>}
        </Carte>
        <Carte titre="Prochaine séance" id="t-prochaine">
          {prochaine
            ? <><p className="fiche-carte__fort">{prochaine.seance.titre || 'Séance sans titre'}</p><p className="espace-aide">S{prochaine.semaine} · {dateSeance(prochaine.date)}</p></>
            : <p className="espace-aide">{progEnCours ? 'Toutes les séances sont faites.' : 'Pas de programme en cours.'}</p>}
          <ProfilSportif client={client} uid={uid} />
        </Carte>
        <Carte titre="Dernière visio" id="t-visio">
          {dernier
            ? <><p className="espace-aide">{dernier.semaine ? `S${dernier.semaine} · ` : ''}{dateSeance(dernier.date)}</p><p className="fiche-carte__texte">{dernier.texte}{dernier.ajuster ? ` À ajuster : ${dernier.ajuster}` : ''}</p></>
            : <p className="espace-aide">{client.derniereVisio?.date ? `S${client.derniereVisio.semaine ?? '?'} · ${dateSeance(client.derniereVisio.date)}` : 'Aucune visio notée.'}</p>}
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

// ---------- Historique ----------
export function Historique() {
  const { client, programmes, seances } = useCoache()
  const terminees = (seances ?? []).filter((s) => s.statut === 'terminée')
  if (seances === null) return <p className="espace-texte" role="status">Chargement…</p>
  if (!terminees.length) return <p className="espace-texte">Aucune séance faite pour l’instant.</p>
  return (
    <ul className="historique">
      {terminees.map((sf) => {
        const s = trouverSeance(programmes, sf)
        const p = (programmes ?? []).find((x) => x.id === sf.programme)
        const sem = p ? (p.semaines ?? []).findIndex((w) => (w.seances ?? []).some((x) => x.id === sf.seance)) + 1 : 0
        const bilan = [Number.isInteger(sf.effort) ? `effort ${sf.effort}` : '', sf.ressenti].filter(Boolean).join(' · ')
        return (
          <li key={sf.id}>
            <details className="historique__seance espace-carte">
              <summary onClick={(e) => basculerDetails(e, e.currentTarget.nextElementSibling)}>
                <span className="historique__titre">{dateSeance(sf.date)} · {s ? s.titre || 'Séance' : 'Séance retirée du programme'}</span>
                <span className="espace-aide">{sem ? `S${sem}` : ''}{bilan ? ` · ${bilan}` : ''}</span>
              </summary>
              <div className="historique__detail">
                <ul className="historique__lignes">
                  {detailSeance(s, sf.series).map((x) => (
                    <li key={x.cle}><strong>{x.nom}</strong> · {x.lignes.map((l) => texteSerie(l)).join(' / ')}</li>
                  ))}
                </ul>
                <ul className="fiche-liste"><SeanceFaite sf={sf} seance={s} prenom={client.prenom} /></ul>
              </div>
            </details>
          </li>
        )
      })}
    </ul>
  )
}

// ---------- Bilans visio ----------
export function Bilans() {
  const { client, uid, enCours, progEnCours } = useCoache()
  const [bilans, setBilans] = useState(null)
  const [vi, setVi] = useState({ date: aujourdhuiIso(), semaine: String(enCours?.semaine || 1), texte: '', ajuster: '' })
  const [message, setMessage] = useState('')
  const [erreur, setErreur] = useState('')
  const [aSupprimer, setASupprimer] = useState(null)
  useEffect(() => ecouterBilans(uid, setBilans, () => setErreur('Impossible de charger les bilans. Vérifiez votre connexion.')), [uid])
  const nbSem = progEnCours?.semaines?.length ?? 0
  const plusRecent = (liste) => liste.reduce((m, b) => (!m || b.date > m.date ? b : m), null)

  async function enregistrer(e) {
    e.preventDefault()
    if (!vi.texte.trim()) { setErreur('Écrivez le compte rendu avant d’enregistrer.'); return }
    if (vi.date > aujourdhuiIso()) { setErreur('Choisissez une date passée ou aujourd’hui.'); return }
    setErreur(''); setMessage('')
    const bilan = { date: vi.date, semaine: nbSem ? Number(vi.semaine) : null, texte: vi.texte.trim(), ajuster: vi.ajuster.trim() }
    const derniere = plusRecent([...(bilans ?? []), bilan])
    try {
      await ajouterBilan(uid, bilan, { date: derniere.date, semaine: derniere.semaine ?? null })
      setVi({ ...vi, texte: '', ajuster: '' }); setMessage('Compte rendu enregistré.')
    } catch (err) { setErreur(messageErreur(err.code)) }
  }
  async function supprimer(b) {
    const restants = (bilans ?? []).filter((x) => x.id !== b.id)
    const d = plusRecent(restants)
    try { await supprimerBilan(uid, b.id, d ? { date: d.date, semaine: d.semaine ?? null } : null); setASupprimer(null); setMessage('Compte rendu supprimé.') } catch (err) { setErreur(messageErreur(err.code)) }
  }

  return (
    <div className="onglet-pile">
      <p className="espace-aide">Vos comptes rendus des bilans faits en visio avec {client.prenom}. Visibles uniquement par vous.</p>
      <form className="espace-carte fiche-carte" onSubmit={enregistrer} aria-labelledby="t-visio">
        <h2 id="t-visio" className="fiche-carte__titre">Nouveau compte rendu</h2>
        <div className="formulaire-grille">
          <div className="champ-groupe"><label htmlFor="vi-date">Date de la visio</label>
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
        </div>
        <p className="espace-message" role="status">{message}</p>
        <p className="espace-message espace-message--erreur" role="alert">{erreur}</p>
        <button type="submit" className="bouton bouton--principal">Enregistrer le compte rendu</button>
      </form>
      {bilans !== null && bilans.length === 0 && <p className="espace-texte">Aucun compte rendu pour l’instant.</p>}
      {(bilans ?? []).map((b) => (
        <article key={b.id} className="espace-carte fiche-carte">
          <div className="fiche-carte__tete">
            <p className="fiche-carte__fort">{b.semaine ? `S${b.semaine} · ` : ''}{dateComplete(b.date)}</p>
            {aSupprimer === b.id
              ? <span className="espace-actions"><button type="button" className="lien-souligne" onClick={() => supprimer(b)}>Confirmer la suppression</button><button type="button" className="espace-lien" onClick={() => setASupprimer(null)}>Annuler</button></span>
              : <button type="button" className="espace-lien" onClick={() => setASupprimer(b.id)}>Supprimer</button>}
          </div>
          <p className="fiche-carte__texte">{b.texte}</p>
          {b.ajuster && <p className="espace-verrou"><strong>À ajuster :</strong> {b.ajuster}</p>}
        </article>
      ))}
    </div>
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
  const courbes = [...noms.entries()]
    .map(([exoId, nom]) => ({ exoId, nom, points: meilleuresCharges(seances ?? [], exoIdParElement, exoId) }))
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
        <h2 id="t-ch" className="espace-sous-titre">Charges (meilleure série)</h2>
        {courbes.length === 0 ? <p className="espace-aide">Pas encore de charges enregistrées.</p> : (
          <ul className="fiche-liste fiche-courbes stats-courbes">{courbes.map((c) => <Courbe key={c.exoId} nom={c.nom} points={c.points.slice(-8)} />)}</ul>
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
