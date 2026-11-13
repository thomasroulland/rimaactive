import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ecouterModeles, enregistrerModele, enregistrerProgramme, nouvelIdModele, nouvelIdProgramme, supprimerModele } from '../depots.js'
import { ajoutJours, aujourdhuiIso, dateLongue, lundiDe } from '../donnees/calculs.js'
import { dupliquerProgramme, nouveauProgramme } from '../donnees/programme.js'
import { messageErreur } from '../erreurs.js'
import { NB_SEMAINES } from './CreationProgramme.jsx'
import { useDonneesCoach } from './donneesCoach.js'

// Page « Programmes » (maquette coach, 13 novembre 2026) : les modèles réutilisables (créer, modifier, dupliquer,
// affecter à un coaché qui en reçoit sa propre copie), puis les programmes de chaque coaché.
export default function ProgrammesCoach() {
  return (
    <section className="section">
      <div className="conteneur espace-coach">
        <header className="espace-coach__entete mes-coaches__tete">
          <div>
            <p className="surtitre">Espace coach</p>
            <h1 className="titre titre--section">Programmes</h1>
            <p className="espace-texte">Vos modèles réutilisables. Affectez-en un à un coaché : il reçoit sa propre copie, que vous pouvez ensuite ajuster dans sa fiche.</p>
          </div>
        </header>
        <Modeles />
        <ProgrammesDesCoaches />
      </div>
    </section>
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
  useEffect(() => ecouterModeles(setModeles, () => setErreur('Impossible de charger les modèles. Vérifiez votre connexion.')), [])
  const lundis = Array.from({ length: 12 }, (_, i) => ajoutJours(lundiDe(aujourdhuiIso()), (i + 1) * 7))
  const tenter = async (fn) => { setErreur(''); setMessage(''); try { await fn() } catch (e) { setErreur(messageErreur(e.code)) } }

  const creer = (e) => {
    e.preventDefault()
    if (!np.nom.trim()) { setErreur('Donnez un nom au programme.'); return }
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

  return (
    <>
      <p className="espace-message" role="status">{message}</p>
      <p className="espace-message espace-message--erreur" role="alert">{erreur}</p>
      <form className="espace-carte fiche-carte" onSubmit={creer} aria-labelledby="t-nouveau-prog">
        <h2 id="t-nouveau-prog" className="fiche-carte__titre">Créer un programme</h2>
        <div className="formulaire-ligne">
          <div className="champ-groupe formulaire-ligne__large"><label htmlFor="np-nom">Nom</label>
            <input id="np-nom" className="champ" value={np.nom} placeholder="Ex. Remise en forme · 6 semaines" onChange={(e) => setNp({ ...np, nom: e.target.value })} /></div>
          <div className="champ-groupe"><label htmlFor="np-sem">Semaines</label>
            <select id="np-sem" className="champ" value={np.semaines} onChange={(e) => setNp({ ...np, semaines: e.target.value })}>{NB_SEMAINES.map((n) => <option key={n}>{n}</option>)}</select></div>
          <div className="champ-groupe"><label htmlFor="np-sps">Séances par semaine</label>
            <select id="np-sps" className="champ" value={np.parSemaine} onChange={(e) => setNp({ ...np, parSemaine: e.target.value })}>{[1, 2, 3, 4, 5, 6].map((n) => <option key={n}>{n}</option>)}</select></div>
          <button type="submit" className="bouton bouton--principal">Créer</button>
        </div>
      </form>
      {modeles !== null && modeles.length === 0 && <p className="espace-aide">Pas encore de modèle : créez-en un ci-dessus.</p>}
      <ul className="grille-modeles">
        {(modeles ?? []).map((m) => {
          const nb = m.semaines?.length ?? 0
          const exos = (m.semaines ?? []).flatMap((w) => w.seances ?? []).flatMap((x) => x.blocs ?? []).flatMap((b) => b.elements ?? []).length
          const ouvert = affecter?.id === m.id
          return (
            <li key={m.id} className="espace-carte fiche-carte modele">
              <h2 className="fiche-carte__titre">{m.nom || 'Modèle sans nom'}</h2>
              <p className="espace-aide">{nb} semaine{nb > 1 ? 's' : ''} · {m.parSemaine} séance{m.parSemaine > 1 ? 's' : ''} par semaine · {exos} exercice{exos > 1 ? 's' : ''}</p>
              <div className="modele__actions">
                <Link to={`/espace/coach/modeles/${m.id}`} className="bouton bouton--secondaire bouton--compact">Modifier</Link>
                <button type="button" className="lien-souligne modele__lien" onClick={() => dupliquer(m)}>Dupliquer</button>
                <button type="button" className="lien-souligne modele__lien" aria-expanded={ouvert}
                  onClick={() => setAffecter(ouvert ? null : { id: m.id, client: clients?.[0]?.uid ?? '', debut: lundis[0] })}>Affecter à un coaché</button>
              </div>
              {ouvert && (
                <div className="modele__affecter">
                  <div className="formulaire-ligne">
                    <div className="champ-groupe"><label htmlFor={`aff-c-${m.id}`}>Coaché</label>
                      <select id={`aff-c-${m.id}`} className="champ" value={affecter.client} onChange={(e) => setAffecter({ ...affecter, client: e.target.value })}>
                        {(clients ?? []).map((c) => <option key={c.uid} value={c.uid}>{c.prenom} {c.nom}</option>)}
                      </select></div>
                    <div className="champ-groupe"><label htmlFor={`aff-d-${m.id}`}>Début (un lundi)</label>
                      <select id={`aff-d-${m.id}`} className="champ" value={affecter.debut} onChange={(e) => setAffecter({ ...affecter, debut: e.target.value })}>
                        {lundis.map((l) => <option key={l} value={l}>{dateLongue(l)}</option>)}
                      </select></div>
                  </div>
                  <p className="espace-aide">{(() => { const c = (clients ?? []).find((x) => x.uid === affecter.client); return c?.programme ? `${c.prenom} a déjà le programme « ${c.programme.nom} » : la copie s’ajoute en brouillon, sans le remplacer.` : 'La copie arrive en brouillon : vous la publiez quand elle est prête.' })()}</p>
                  <button type="button" className="bouton bouton--principal bouton--compact" onClick={() => affecterModele(m)}>Affecter le programme</button>
                </div>
              )}
              <div className="modele__bas">
                {aSupprimer === m.id
                  ? <><button type="button" className="lien-souligne modele__lien" onClick={() => tenter(async () => { await supprimerModele(m.id); setASupprimer(null); setMessage('Modèle supprimé. Les programmes déjà affectés ne changent pas.') })}>Confirmer la suppression</button>
                    <button type="button" className="espace-lien" onClick={() => setASupprimer(null)}>Annuler</button></>
                  : <button type="button" className="espace-lien modele__suppr" onClick={() => setASupprimer(m.id)}>Supprimer</button>}
              </div>
            </li>
          )
        })}
      </ul>
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
  const total = (programmes ?? []).length

  return (
    <section aria-labelledby="t-progs-coaches" className="onglet-pile">
      <div className="suivi-titre">
        <h2 id="t-progs-coaches" className="espace-sous-titre">Programmes de vos coachés</h2>
        <span className="espace-aide">{programmes === null ? ' ' : `${total} programme${total > 1 ? 's' : ''} pour ${groupes.length} coaché${groupes.length > 1 ? 's' : ''}`}</span>
      </div>
      <div>
        <p className="espace-message espace-message--erreur" role="alert">{erreur}</p>
        {clients && programmes && (
          <div className="programmes-coach">
            {groupes.map(({ c, liste }) => (
              <section key={c.uid} className="programmes-coach__groupe" aria-labelledby={`pg-${c.uid}`}>
                <div className="programmes-coach__tete">
                  <h2 id={`pg-${c.uid}`} className="programmes-coach__nom">{c.prenom} {c.nom}</h2>
                  <Link to={`/espace/coach/clients/${c.uid}/programme?nouveau=1`} className="lien-souligne">Nouveau programme<span className="sr-only"> pour {c.prenom} {c.nom}</span></Link>
                </div>
                {liste.length === 0 ? <p className="espace-aide">Pas encore de programme.</p> : (
                  <ul className="programmes-coach__liste">
                    {liste.map((p) => {
                      const [libelle, classe] = etat(p)
                      const nb = p.semaines?.length ?? 0
                      return (
                        <li key={p.id} className="programme-ligne">
                          <Link to={`/espace/coach/clients/${c.uid}/programme?programme=${p.id}`} className="programme-ligne__lien">
                            <span className="programme-ligne__nom">{p.nom || 'Programme sans nom'}</span>
                            <span className="programme-ligne__infos">{nb} semaine{nb > 1 ? 's' : ''} · du {dateLongue(p.debut)} au {dateLongue(ajoutJours(p.debut, nb * 7 - 1))}</span>
                          </Link>
                          <span className={`espace-statut espace-statut--${classe}`}>{libelle}</span>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
