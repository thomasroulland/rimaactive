import PhotoCoache from './PhotoCoache.jsx'
import RangeeDefilante from './RangeeDefilante.jsx'
import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ecouterAnciensModeles, ecouterModelesSeance, enregistrerModele, nouvelIdModele, supprimerModele } from '../depots.js'
import { ajoutJours, aujourdhuiIso } from '../donnees/calculs.js'
import { nomBloc } from '../donnees/programme.js'
import { nouveauModeleSeance, resumeModele, versModeleSeance } from '../donnees/modelesSeance.js'
import { nomType } from '../donnees/reglages.js'
import { messageErreur } from '../erreurs.js'
import useReglages from './useReglages.js'
import { IconeCopier, IconeCorbeille } from './Icones.jsx'
import { useDonneesCoach } from './donneesCoach.js'
import Confirmation from './Confirmation.jsx'
import { dateCourte } from '../donnees/seances.js'

// Page « Modèles » : les modèles de séance (depuis le 16 novembre 2026, à la place des modèles de programme), puis les programmes de chaque coaché.
export default function ProgrammesCoach() {
  return (
    <section className="section">
      <div className="conteneur espace-coach progs">
        <Modeles />
        <ProgrammesDesCoaches />
      </div>
    </section>
  )
}

const pluriel = (n, mot) => `${n} ${mot}${n > 1 ? 's' : ''}`
// Modèles de SÉANCE (16 novembre 2026, à la place des modèles de programme) : créer, modifier, dupliquer, supprimer.
// On les glisse ensuite dans les semaines d'un programme (panneau à gauche de la grille).
function Modeles() {
  const navigate = useNavigate()
  const { types } = useReglages()
  const [modeles, setModeles] = useState(null)
  const [anciens, setAnciens] = useState([])
  const [recherche, setRecherche] = useState('')
  const [filtre, setFiltre] = useState('tous')
  const [aSupprimer, setASupprimer] = useState(null)
  const [nettoyer, setNettoyer] = useState(false)
  const [message, setMessage] = useState('')
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)
  useEffect(() => ecouterModelesSeance(setModeles, () => setErreur('Impossible de charger les modèles. Vérifiez votre connexion.')), [])
  useEffect(() => ecouterAnciensModeles(setAnciens, () => setAnciens([])), [])
  const tenter = async (fn) => {
    setErreur(''); setMessage(''); setEnvoi(true)
    try { await fn() } catch (e) { setErreur(messageErreur(e.code)) } finally { setEnvoi(false) }
  }
  const creer = () => tenter(async () => {
    const id = nouvelIdModele()
    await enregistrerModele({ id, ...nouveauModeleSeance(types?.[0]?.id ?? 'force') }, { creation: true })
    navigate(`/espace/coach/modeles/${id}`)
  })
  const dupliquer = (m) => tenter(async () => {
    const copie = versModeleSeance({ ...m.seance, titre: `${m.nom || 'Modèle'} (copie)` })
    await enregistrerModele({ id: nouvelIdModele(), ...copie }, { creation: true })
    setMessage(`Modèle « ${m.nom} » dupliqué.`)
  })
  const simple = (t) => String(t ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')
  const typesPresents = [...new Set((modeles ?? []).map((m) => m.seance?.type).filter(Boolean))]
  const liste = (modeles ?? []).filter((m) => (filtre === 'tous' || m.seance?.type === filtre)
    && (!recherche.trim() || simple(`${m.nom} ${nomType(m.seance?.type, types)}`).includes(simple(recherche.trim()))))
  const modeleASupprimer = (modeles ?? []).find((m) => m.id === aSupprimer)

  return (
    <>
      <section aria-labelledby="t-modeles" className="progs__partie ms">
        <header className="ms-barre">
          <div className="ms-barre__titre">
            <h1 id="t-modeles" className="ms-h1">Modèles</h1>
            {modeles && <span className="progs__compte">{modeles.length}</span>}
          </div>
          <p className="ms-barre__aide">Vos séances types, à glisser dans les programmes.</p>
          {modeles?.length > 0 && (
            <>
              <label className="sr-only" htmlFor="ms-cherche">Chercher un modèle</label>
              <input id="ms-cherche" className="ms-cherche" type="search" autoComplete="off" placeholder="Chercher…" value={recherche} onChange={(e) => setRecherche(e.target.value)} />
            </>
          )}
        </header>
        <p className="espace-message" role="status">{message}</p>
        <p className="espace-message espace-message--erreur" role="alert">{erreur}</p>
        {anciens.length > 0 && (
          <p className="ms-anciens">
            {anciens.length} ancien{anciens.length > 1 ? 's' : ''} modèle{anciens.length > 1 ? 's' : ''} de programme ne {anciens.length > 1 ? 'sont' : 'est'} plus utilisé{anciens.length > 1 ? 's' : ''}.
            <button type="button" className="lien-souligne" onClick={() => setNettoyer(true)}>{anciens.length > 1 ? 'Les supprimer' : 'Le supprimer'}</button>
          </p>
        )}
        {typesPresents.length > 1 && (
          <RangeeDefilante className="filtres-coaches ms-filtres filtres-ligne" role="group" aria-label="Type de séance">
            {['tous', ...typesPresents].map((t) => (
              <button key={t} type="button" className="filtre-coaches" aria-pressed={filtre === t} onClick={() => setFiltre(t)}>{t === 'tous' ? 'Tous' : nomType(t, types)}</button>
            ))}
          </RangeeDefilante>
        )}
        {modeles === null && <p className="espace-aide" role="status">Chargement…</p>}
        {modeles?.length === 0 && (
          <p className="progs__vide">Astuce : dans un programme, une séance se transforme en modèle avec « Enregistrer comme modèle ».</p>
        )}
        <ul className="ms-grille">
          {modeles !== null && (
            <li className="ms-nouveau">
              <button type="button" disabled={envoi} onClick={creer}>
                <span className="ms-nouveau__plus" aria-hidden="true">＋</span>
                <span className="ms-nouveau__texte">Nouveau modèle</span>
              </button>
            </li>
          )}
          {liste.map((m, i) => {
            const { exos } = resumeModele(m)
            const blocs = (m.seance?.blocs ?? []).filter((b) => (b.elements ?? []).length > 0)
            return (
              <li key={m.id} className="espace-carte ms-carte" style={{ '--i': i }}>
                <div className="ms-carte__tete">
                  <span className="ms-carte__type">{nomType(m.seance?.type, types)}</span>
                  <span className="modele__icones">
                    <button type="button" className="modele__suppr" onClick={() => dupliquer(m)} disabled={envoi} aria-label={`Dupliquer le modèle ${m.nom || 'sans nom'}`} title="Dupliquer"><IconeCopier /></button>
                    <button type="button" className="modele__suppr modele__suppr--danger" onClick={() => setASupprimer(m.id)} aria-label={`Supprimer le modèle ${m.nom || 'sans nom'}`} title="Supprimer"><IconeCorbeille /></button>
                  </span>
                </div>
                <h3 className="ms-carte__nom"><Link to={`/espace/coach/modeles/${m.id}`}>{m.nom || 'Modèle sans nom'}</Link></h3>
                <p className="ms-carte__meta">{pluriel(exos, 'exercice')}{m.seance?.duree ? ` · ${m.seance.duree} min` : ''}{m.seance?.lieu ? ` · ${m.seance.lieu}` : ''}</p>
                {blocs.length > 0 && (
                  <ol className="ms-carte__blocs">
                    {blocs.map((b) => <li key={b.id}><span className="ms-carte__lettre">{b.lettre}</span>{nomBloc(b)}<span className="ms-carte__nb">{b.elements.length}</span></li>)}
                  </ol>
                )}
                <Link to={`/espace/coach/modeles/${m.id}`} className="bouton bouton--secondaire bouton--compact ms-carte__modifier">Modifier</Link>
              </li>
            )
          })}
        </ul>
        {modeles?.length > 0 && liste.length === 0 && <p className="progs__vide">Aucun modèle ne correspond.</p>}
      </section>
      {modeleASupprimer && (
        <Confirmation titre={`Supprimer « ${modeleASupprimer.nom || 'ce modèle'} » ?`}
          texte="Le modèle est effacé. Les séances déjà ajoutées dans des programmes ne changent pas."
          libelle="Supprimer le modèle" fermer={() => setASupprimer(null)}
          action={() => tenter(async () => { await supprimerModele(modeleASupprimer.id); setMessage('Modèle supprimé.') })} />
      )}
      {nettoyer && (
        <Confirmation titre={`Supprimer ${anciens.length > 1 ? `les ${anciens.length} anciens modèles` : 'l’ancien modèle'} de programme ?`}
          texte={`${anciens.map((m) => `« ${m.nom || 'sans nom'} »`).join(', ')}. Les programmes déjà affectés à vos coachés ne changent pas.`}
          libelle="Supprimer" fermer={() => setNettoyer(false)}
          action={() => tenter(async () => { for (const m of anciens) await supprimerModele(m.id); setMessage('Anciens modèles de programme supprimés.') })} />
      )}
    </>
  )
}

// Programmes de chaque coaché (copies affectées ou créés dans sa fiche)
function ProgrammesDesCoaches() {
  const { clients, programmes, erreur } = useDonneesCoach()
  const aujourdhui = aujourdhuiIso()
  const etat = (p) => {
    const fin = ajoutJours(p.debut, (p.semaines?.length ?? 0) * 7 - 1)
    if (p.statut !== 'publié') return ['Brouillon', 'autre']
    if (aujourdhui < p.debut) return ['À venir', 'autre']
    if (aujourdhui > fin) return ['Terminé', 'autre']
    return ['En cours', 'actif']
  }
  const groupes = (clients ?? [])
    .map((c) => ({ c, liste: (programmes ?? []).filter((p) => p.client === c.uid).sort((a, b) => (b.debut || '').localeCompare(a.debut || '')) }))
    .sort((a, b) => (b.liste.length > 0) - (a.liste.length > 0) || `${a.c.prenom} ${a.c.nom}`.localeCompare(`${b.c.prenom} ${b.c.nom}`, 'fr'))
  const total = (programmes ?? []).length

  return (
    <section aria-labelledby="t-progs-coaches" className="progs__partie">
      <div className="progs__partie-tete">
        <h2 id="t-progs-coaches" className="progs__h2">Programmes de vos coachés</h2>
        {programmes && <span className="progs__compte">{total}</span>}
      </div>
      <p className="espace-message espace-message--erreur" role="alert">{erreur}</p>
      {clients && programmes && groupes.length === 0 && <p className="progs__vide">Aucun coaché pour l’instant.</p>}
      {clients && programmes && (
        <ul className="progs__coaches">
          {groupes.map(({ c, liste }, i) => (
            <li key={c.uid} className="espace-carte progs__coache" style={{ '--i': i }}>
              <div className="progs__coache-tete">
                <PhotoCoache client={c} taille={36} />
                <h3 className="progs__coache-nom"><Link to={`/espace/coach/clients/${c.uid}`}>{c.prenom} {c.nom}</Link></h3>
                <Link to={`/espace/coach/clients/${c.uid}/programme?nouveau=1`} className="progs__plus" aria-label={`Nouveau programme pour ${c.prenom} ${c.nom}`} title="Nouveau programme">
                  <span aria-hidden="true" className="progs__plus-icone" />
                </Link>
              </div>
              {liste.length === 0 ? <p className="espace-aide progs__rien">Pas encore de programme.</p> : (
                <ul className="progs__liste">
                  {liste.map((p) => {
                    const [libelle, classe] = etat(p)
                    const nb = p.semaines?.length ?? 0
                    return (
                      <li key={p.id}>
                        <Link to={`/espace/coach/clients/${c.uid}/programme?programme=${p.id}`} className="progs__ligne">
                          <span className="progs__ligne-texte">
                            <span className="progs__ligne-nom">{p.nom || 'Programme sans nom'}</span>
                            <span className="progs__ligne-infos">{pluriel(nb, 'semaine')} · du {dateCourte(p.debut)} au {dateCourte(ajoutJours(p.debut, nb * 7 - 1))}</span>
                          </span>
                          <span className={`espace-statut espace-statut--${classe}`}>{libelle}</span>
                          <svg className="progs__fleche" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
