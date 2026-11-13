import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ecouterModeles, enregistrerModele, enregistrerProgramme, nouvelIdModele, nouvelIdProgramme, supprimerModele } from '../depots.js'
import { ajoutJours, aujourdhuiIso, dateLongue, lundiDe } from '../donnees/calculs.js'
import { dupliquerProgramme, nouveauProgramme } from '../donnees/programme.js'
import { messageErreur } from '../erreurs.js'
import { NB_SEMAINES } from './CreationProgramme.jsx'
import { useDonneesCoach } from './donneesCoach.js'
import Confirmation from './Confirmation.jsx'
import { dateCourte } from '../donnees/seances.js'

// Page « Programmes » (maquette coach, 13 novembre 2026 ; mise en page revue le 14) : les modèles réutilisables (créer, modifier, dupliquer,
// affecter à un coaché qui en reçoit sa propre copie), puis les programmes de chaque coaché.
export default function ProgrammesCoach() {
  return (
    <section className="section">
      <div className="conteneur espace-coach progs">
        <header className="progs__tete">
          <p className="surtitre">Espace coach</p>
          <h1 className="titre titre--section">Programmes</h1>
          <p className="espace-texte">Vos modèles réutilisables. Affectez-en un à un coaché : il reçoit sa propre copie, que vous pouvez ensuite ajuster dans sa fiche.</p>
        </header>
        <Modeles />
        <ProgrammesDesCoaches />
      </div>
    </section>
  )
}

const pluriel = (n, mot) => `${n} ${mot}${n > 1 ? 's' : ''}`
const exercicesDe = (seance) => (seance.blocs ?? []).reduce((t, b) => t + (b.elements?.length ?? 0), 0) + (seance.type === 'course' ? 1 : 0)

// Aperçu d'un programme : une colonne par semaine, un point par séance (plein si la séance a du contenu)
function Apercu({ programme }) {
  const semaines = programme.semaines ?? []
  const pleines = semaines.flatMap((w) => w.seances ?? []).filter((x) => exercicesDe(x) > 0).length
  const total = semaines.flatMap((w) => w.seances ?? []).length
  return (
    <div className="apercu" role="img" aria-label={`${pluriel(pleines, 'séance')} remplie${pleines > 1 ? 's' : ''} sur ${total}`}>
      {semaines.map((w, i) => (
        <span key={w.id ?? i} className="apercu__sem">
          <span className="apercu__points">
            {(w.seances ?? []).map((x) => <span key={x.id} className={`apercu__point${exercicesDe(x) > 0 ? ' apercu__point--plein' : ''}`} />)}
          </span>
          <span className="apercu__num">S{i + 1}</span>
        </span>
      ))}
    </div>
  )
}

function Modeles() {
  const navigate = useNavigate()
  const { clients } = useDonneesCoach()
  const [modeles, setModeles] = useState(null)
  const [np, setNp] = useState({ nom: '', semaines: 4, parSemaine: 3 })
  const [affecter, setAffecter] = useState(null) // { id, client, debut }
  const [aSupprimer, setASupprimer] = useState(null)
  const [message, setMessage] = useState('')
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)
  useEffect(() => ecouterModeles(setModeles, () => setErreur('Impossible de charger les modèles. Vérifiez votre connexion.')), [])
  const lundis = Array.from({ length: 12 }, (_, i) => ajoutJours(lundiDe(aujourdhuiIso()), (i + 1) * 7))
  const tenter = async (fn) => {
    setErreur(''); setMessage(''); setEnvoi(true)
    try { await fn() } catch (e) { setErreur(messageErreur(e.code)) } finally { setEnvoi(false) }
  }

  const creer = (e) => {
    e.preventDefault()
    if (!np.nom.trim()) { setErreur('Donnez un nom au modèle.'); return }
    tenter(async () => {
      const id = nouvelIdModele()
      const { client, statut, ...base } = nouveauProgramme({ client: '', nom: np.nom.trim(), debut: '', semaines: Number(np.semaines), parSemaine: Number(np.parSemaine) }) // eslint-disable-line no-unused-vars
      await enregistrerModele({ id, ...base, debut: '' }, { creation: true })
      navigate(`/espace/coach/modeles/${id}`)
    })
  }
  const dupliquer = (m) => tenter(async () => {
    const { client, statut, ...copie } = dupliquerProgramme(m, { nom: `${m.nom} (copie)`, debut: '' }) // eslint-disable-line no-unused-vars
    await enregistrerModele({ id: nouvelIdModele(), ...copie }, { creation: true })
    setMessage(`Modèle « ${m.nom} » dupliqué.`)
  })
  const affecterModele = (m) => tenter(async () => {
    const c = (clients ?? []).find((x) => x.uid === affecter.client)
    if (!c) { setErreur('Choisissez un coaché.'); return }
    const id = nouvelIdProgramme()
    await enregistrerProgramme({ id, ...dupliquerProgramme(m, { nom: m.nom, debut: affecter.debut }), client: c.uid }, { creation: true })
    setAffecter(null)
    setMessage(`« ${m.nom} » affecté à ${c.prenom} ${c.nom}, en brouillon : ajustez-le puis publiez-le depuis sa fiche.`)
  })
  const modeleASupprimer = (modeles ?? []).find((m) => m.id === aSupprimer)

  return (
    <>
      <form className="espace-carte progs__creer" onSubmit={creer} aria-labelledby="t-nouveau-prog">
        <div className="progs__creer-texte">
          <h2 id="t-nouveau-prog" className="progs__h2">Créer un modèle</h2>
          <p className="espace-aide">Une structure vide, à remplir ensuite séance par séance.</p>
        </div>
        <div className="progs__champs">
          <div className="champ-groupe progs__nom"><label htmlFor="np-nom">Nom</label>
            <input id="np-nom" className="champ" autoComplete="off" value={np.nom} placeholder="Ex. Remise en forme · 6 semaines" onChange={(e) => { setNp({ ...np, nom: e.target.value }); setErreur('') }} /></div>
          <div className="champ-groupe"><label htmlFor="np-sem">Semaines</label>
            <select id="np-sem" className="champ" value={np.semaines} onChange={(e) => setNp({ ...np, semaines: e.target.value })}>{NB_SEMAINES.map((n) => <option key={n}>{n}</option>)}</select></div>
          <div className="champ-groupe"><label htmlFor="np-sps">Séances par semaine</label>
            <select id="np-sps" className="champ" value={np.parSemaine} onChange={(e) => setNp({ ...np, parSemaine: e.target.value })}>{[1, 2, 3, 4, 5, 6].map((n) => <option key={n}>{n}</option>)}</select></div>
          <button type="submit" className="bouton bouton--principal progs__creer-bouton" disabled={envoi}>Créer</button>
        </div>
      </form>
      <p className="espace-message" role="status">{message}</p>
      <p className="espace-message espace-message--erreur" role="alert">{erreur}</p>

      <section aria-labelledby="t-modeles" className="progs__partie">
        <div className="progs__partie-tete">
          <h2 id="t-modeles" className="progs__h2">Vos modèles</h2>
          {modeles && <span className="progs__compte">{modeles.length}</span>}
        </div>
        {modeles === null && <p className="espace-aide" role="status">Chargement…</p>}
        {modeles?.length === 0 && (
          <p className="progs__vide">Pas encore de modèle. Créez-en un ci-dessus : vous pourrez l’affecter à autant de coachés que vous voulez.</p>
        )}
        <ul className="progs__grille">
          {(modeles ?? []).map((m, i) => {
            const nb = m.semaines?.length ?? 0
            const exos = (m.semaines ?? []).flatMap((w) => w.seances ?? []).reduce((t, x) => t + exercicesDe(x), 0)
            const ouvert = affecter?.id === m.id
            const choisi = ouvert ? (clients ?? []).find((x) => x.uid === affecter.client) : null
            return (
              <li key={m.id} className={`espace-carte modele${ouvert ? ' modele--ouvert' : ''}`} style={{ '--i': i }}>
                <div className="modele__tete">
                  <h3 className="modele__nom">{m.nom || 'Modèle sans nom'}</h3>
                  <span className="modele__icones">
                  <button type="button" className="modele__suppr" onClick={() => dupliquer(m)} disabled={envoi} aria-label={`Dupliquer le modèle ${m.nom || 'sans nom'}`} title="Dupliquer">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>
                  </button>
                  <button type="button" className="modele__suppr modele__suppr--danger" onClick={() => setASupprimer(m.id)} aria-label={`Supprimer le modèle ${m.nom || 'sans nom'}`} title="Supprimer">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" /></svg>
                  </button>
                  </span>
                </div>
                <p className="modele__meta">{pluriel(nb, 'semaine')} · {pluriel(m.parSemaine ?? 0, 'séance')} / semaine · {pluriel(exos, 'exercice')}</p>
                <Apercu programme={m} />
                <div className="modele__actions">
                  <Link to={`/espace/coach/modeles/${m.id}`} className="bouton bouton--secondaire bouton--compact">Modifier</Link>
                  <button type="button" className="lien-souligne modele__affecter-lien" aria-expanded={ouvert} aria-controls={`aff-${m.id}`}
                    onClick={() => setAffecter(ouvert ? null : { id: m.id, client: clients?.[0]?.uid ?? '', debut: lundis[0] })}>
                    Affecter à un coaché
                  </button>
                </div>
                <div id={`aff-${m.id}`} className="modele__zone" inert={!ouvert}>
                  <div className="modele__interieur">
                    <div className="modele__affecter">
                      {(clients ?? []).length === 0 ? <p className="espace-aide">Invitez d’abord un coaché depuis « Mes coachés ».</p> : (<>
                        <div className="progs__champs progs__champs--affecter">
                          <div className="champ-groupe"><label htmlFor={`aff-c-${m.id}`}>Coaché</label>
                            <select id={`aff-c-${m.id}`} className="champ" value={affecter?.id === m.id ? affecter.client : ''} onChange={(e) => setAffecter({ ...affecter, client: e.target.value })}>
                              {(clients ?? []).map((c) => <option key={c.uid} value={c.uid}>{c.prenom} {c.nom}</option>)}
                            </select></div>
                          <div className="champ-groupe"><label htmlFor={`aff-d-${m.id}`}>Début (un lundi)</label>
                            <select id={`aff-d-${m.id}`} className="champ" value={affecter?.id === m.id ? affecter.debut : lundis[0]} onChange={(e) => setAffecter({ ...affecter, debut: e.target.value })}>
                              {lundis.map((l) => <option key={l} value={l}>{dateLongue(l)}</option>)}
                            </select></div>
                        </div>
                        <p className="espace-aide">{choisi?.programme ? `${choisi.prenom} a déjà « ${choisi.programme.nom} » : la copie s’ajoute en brouillon, sans le remplacer.` : 'La copie arrive en brouillon : vous la publiez quand elle est prête.'}</p>
                        <button type="button" className="bouton bouton--principal bouton--compact" disabled={envoi} onClick={() => affecterModele(m)}>Affecter le programme</button>
                      </>)}
                    </div>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      </section>
      {modeleASupprimer && (
        <Confirmation titre={`Supprimer « ${modeleASupprimer.nom || 'ce modèle'} » ?`}
          texte="Le modèle est effacé. Les programmes déjà affectés à vos coachés ne changent pas."
          libelle="Supprimer le modèle" fermer={() => setASupprimer(null)}
          action={() => tenter(async () => { await supprimerModele(modeleASupprimer.id); setMessage('Modèle supprimé. Les programmes déjà affectés ne changent pas.') })} />
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
                <span className="progs__initiales" aria-hidden="true">{(c.prenom?.[0] ?? '') + (c.nom?.[0] ?? '')}</span>
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
