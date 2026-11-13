import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase.js'
import { enregistrerExercice, retirerExercice, nouvelIdExercice, supprimerExercice } from '../depots.js'
import Confirmation from './Confirmation.jsx'
import { reduireImage } from '../donnees/photos.js'
import { messageErreur } from '../erreurs.js'
import PhotoStockee from './PhotoStockee.jsx'
import useReglages from './useReglages.js'
import ChoixAvecAjout from './ChoixAvecAjout.jsx'

// Liste proposée par Claude, à faire valider par Marie
export const MUSCLES = ['Quadriceps', 'Ischio-jambiers', 'Fessiers', 'Mollets', 'Pectoraux', 'Dos', 'Épaules', 'Biceps', 'Triceps', 'Abdominaux', 'Lombaires']

const VIDE = { nom: '', categorie: 'Renforcement', materiel: 'À préciser', execution: '', consignes: '', erreurs: '', video: '', muscles: [], photos: [], retire: false }

// Fiche d'un exercice : création (/nouveau) ou modification (/:id)
export default function FicheExercice() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [fiche, setFiche] = useState(id ? null : VIDE)
  const [idCree] = useState(() => (id ? null : nouvelIdExercice())) // créé une fois : un réessai reprend le même dossier
  const [nouvelles, setNouvelles] = useState([]) // [{ cle, fichier, apercu }]
  const [erreur, setErreur] = useState('')
  const [envoi, setEnvoi] = useState(false)
  const [introuvable, setIntrouvable] = useState(false)
  const [confirmer, setConfirmer] = useState(false)
  const reglages = useReglages()
  const champFichiers = useRef(null)
  const nouvellesRef = useRef([])
  nouvellesRef.current = nouvelles

  useEffect(() => {
    if (!id) return
    getDoc(doc(db, 'exercices', id))
      .then((d) => {
        if (!d.exists()) { setIntrouvable(true); return }
        // un seul champ « Consigne d'exécution » (14 novembre 2026) : les anciens champs y sont regroupés
        const x = d.data()
        const morceaux = [x.execution, x.consignes, x.erreurs ? `Erreurs à éviter : ${x.erreurs}` : ''].map((t) => (t ?? '').trim()).filter(Boolean)
        setFiche({ ...VIDE, ...x, consignes: morceaux.join('\n\n'), execution: '', erreurs: '' })
      })
      .catch(() => setErreur('Impossible de charger cette fiche. Vérifiez votre connexion.'))
  }, [id])

  useEffect(() => () => nouvellesRef.current.forEach((n) => URL.revokeObjectURL(n.apercu)), [])

  if (introuvable) {
    return (
      <section className="section"><div className="conteneur espace-coach">
        <p className="espace-texte">Cet exercice n’existe pas.</p>
        <Link to="/espace/coach/exercices" className="bouton bouton--secondaire">Retour à la banque</Link>
      </div></section>
    )
  }
  if (!fiche) return <p className="section espace-attente" role="status">{erreur || 'Chargement…'}</p>

  const maj = (champ) => (e) => setFiche({ ...fiche, [champ]: e.target.value })
  const basculerMuscle = (m) => setFiche({
    ...fiche,
    muscles: fiche.muscles.includes(m) ? fiche.muscles.filter((x) => x !== m) : [...fiche.muscles, m],
  })

  async function ajouter(event) {
    const fichiers = [...event.target.files]
    event.target.value = ''
    setErreur('')
    const ajoutees = []
    for (const f of fichiers) {
      try {
        await reduireImage(f) // refus immédiat d'un HEIC ou d'une photo énorme
        ajoutees.push({ cle: `${f.name}-${f.size}-${Math.random()}`, fichier: f, apercu: URL.createObjectURL(f) })
      } catch (e) {
        setErreur(`${f.name} : ${messageErreur(e.code ?? e.message)}`)
      }
    }
    setNouvelles((n) => [...n, ...ajoutees])
  }

  // Déplace un élément d'une liste d'un cran (sens = -1 ou 1)
  const deplacer = (liste, i, sens) => {
    const j = i + sens
    if (j < 0 || j >= liste.length) return liste
    const copie = [...liste]
    ;[copie[i], copie[j]] = [copie[j], copie[i]]
    return copie
  }
  const retirerEnregistree = (chemin) => {
    setFiche({ ...fiche, photos: fiche.photos.filter((p) => p !== chemin) }) // le fichier reste dans Storage (copies des programmes)
  }
  const retirerNouvelle = (cle) => {
    const n = nouvelles.find((x) => x.cle === cle)
    if (n) URL.revokeObjectURL(n.apercu)
    setNouvelles(nouvelles.filter((x) => x.cle !== cle))
  }

  async function enregistrer(event) {
    event.preventDefault()
    if (!fiche.nom.trim()) { setErreur('Donnez un nom à l’exercice avant d’enregistrer.'); return }
    setEnvoi(true); setErreur('')
    try {
      await enregistrerExercice({ ...fiche, id: id ?? idCree }, nouvelles.map((n) => n.fichier))
      navigate('/espace/coach/exercices', { state: { message: `Fiche « ${fiche.nom.trim()} » enregistrée.` } })
    } catch (e) {
      setErreur(messageErreur(e.code ?? e.message))
      setEnvoi(false)
    }
  }

  async function changerRetrait() {
    setEnvoi(true); setErreur('')
    try {
      if (fiche.retire) {
        await enregistrerExercice({ ...fiche, id, retire: false }, nouvelles.map((n) => n.fichier))
        navigate('/espace/coach/exercices', { state: { message: `« ${fiche.nom.trim()} » est désarchivé : il revient dans la recherche des séances.` } })
      } else {
        await retirerExercice(id)
        navigate('/espace/coach/exercices', { state: { message: `« ${fiche.nom.trim()} » est archivé. Les séances qui l’utilisent déjà ne changent pas.` } })
      }
    } catch (e) {
      setErreur(messageErreur(e.code ?? e.message))
      setEnvoi(false)
    }
  }

  async function supprimer() {
    setEnvoi(true); setErreur('')
    try {
      await supprimerExercice(id)
      navigate('/espace/coach/exercices', { state: { message: `« ${fiche.nom.trim() || 'L’exercice'} » est supprimé. Les séances qui l’utilisent déjà ne changent pas.` } })
    } catch (e) {
      setErreur(messageErreur(e.code ?? e.message))
      setEnvoi(false)
    }
  }

  const nbPhotos = fiche.photos.length + nouvelles.length
  const nomPhoto = (i) => `Photo ${i + 1} de ${fiche.nom || 'l’exercice'}`

  return (
    <section className="section">
      <div className="conteneur espace-coach">
        <Link to="/espace/coach/exercices" className="espace-retour"><svg width="20" height="20" aria-hidden="true" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round"><path d="M216 128H40M112 56l-72 72 72 72" /></svg> Banque d’exercices</Link>
        <header>
          <p className="surtitre">{id ? 'Fiche exercice' : 'Nouvel exercice'}</p>
          <h1 className="titre titre--section">{fiche.nom || 'Nouvel exercice'}</h1>
          {fiche.retire && <p className="espace-texte espace-verrou">Exercice archivé : il n’apparaît plus dans la recherche des séances. Les séances qui l’utilisent déjà ne changent pas.</p>}
        </header>

        <form className="espace-fiche" onSubmit={enregistrer} noValidate>
          <div className="espace-carte espace-fiche__champs">
            <div className="champ-groupe">
              <label htmlFor="exo-nom">Nom de l’exercice</label>
              <input id="exo-nom" className="champ" autoComplete="off" required value={fiche.nom} onChange={maj('nom')} />
            </div>
            <div className="formulaire-ligne">
              <ChoixAvecAjout id="exo-cat" label="Catégorie" cle="categories" liste={reglages.categories} libelleNouveau="Nouvelle catégorie"
                valeur={fiche.categorie} changer={(v) => setFiche((f) => ({ ...f, categorie: v }))} />
              <ChoixAvecAjout id="exo-mat" label="Matériel" cle="materiels" liste={reglages.materiels} libelleNouveau="Nouveau matériel"
                valeur={fiche.materiel} changer={(v) => setFiche((f) => ({ ...f, materiel: v }))} />
            </div>
            <div className="champ-groupe">
              <label htmlFor="exo-consignes">Consigne d’exécution</label>
              <textarea id="exo-consignes" className="champ espace-fiche__consigne" rows={8} value={fiche.consignes}
                placeholder="Position de départ, mouvement, respiration, points à surveiller, erreurs à éviter…" onChange={maj('consignes')} />
            </div>
            <div className="champ-groupe">
              <label htmlFor="exo-video">Lien vidéo (facultatif)</label>
              <input id="exo-video" className="champ" type="url" inputMode="url" placeholder="https://…" value={fiche.video ?? ''} onChange={maj('video')} />
            </div>
            <fieldset className="champ-groupe">
              <legend>Groupes musculaires sollicités</legend>
              <div className="espace-muscles">
                {MUSCLES.map((m) => (
                  <label key={m} className="espace-case">
                    <input type="checkbox" checked={fiche.muscles.includes(m)} onChange={() => basculerMuscle(m)} />
                    {m}
                  </label>
                ))}
              </div>
            </fieldset>
          </div>

          <section className="espace-carte espace-fiche__photos" aria-labelledby="exo-photos-titre">
            <h2 id="exo-photos-titre" className="espace-sous-titre">Photos</h2>
            <p className="espace-texte">La première photo est la photo principale, vue par vos coachés dans leurs séances.</p>
            {nbPhotos === 0 && <p className="espace-texte">Aucune photo pour l’instant.</p>}
            <ul className="espace-photos">
              {fiche.photos.map((chemin, i) => (
                <li key={chemin} className="espace-photo">
                  <PhotoStockee chemin={chemin} alt={nomPhoto(i)} classe="espace-photo__image" />
                  <span className="espace-photo__legende">{i === 0 ? 'Photo principale' : `Photo ${i + 1}`}</span>
                  <div className="espace-photo__actions">
                    <button type="button" className="espace-lien" disabled={i === 0} onClick={() => setFiche({ ...fiche, photos: deplacer(fiche.photos, i, -1) })}>Avancer<span className="sr-only"> la photo {i + 1}</span></button>
                    <button type="button" className="espace-lien" disabled={i === fiche.photos.length - 1} onClick={() => setFiche({ ...fiche, photos: deplacer(fiche.photos, i, 1) })}>Reculer<span className="sr-only"> la photo {i + 1}</span></button>
                    <button type="button" className="espace-lien" onClick={() => retirerEnregistree(chemin)}>Retirer<span className="sr-only"> la photo {i + 1}</span></button>
                  </div>
                </li>
              ))}
              {nouvelles.map((n, i) => {
                const rang = fiche.photos.length + i
                return (
                  <li key={n.cle} className="espace-photo">
                    <PhotoStockee src={n.apercu} alt={nomPhoto(rang)} classe="espace-photo__image" />
                    <span className="espace-photo__legende">{rang === 0 ? 'Photo principale' : `Photo ${rang + 1}`} (à enregistrer)</span>
                    <div className="espace-photo__actions">
                      <button type="button" className="espace-lien" disabled={i === 0} onClick={() => setNouvelles(deplacer(nouvelles, i, -1))}>Avancer<span className="sr-only"> la photo {rang + 1}</span></button>
                      <button type="button" className="espace-lien" disabled={i === nouvelles.length - 1} onClick={() => setNouvelles(deplacer(nouvelles, i, 1))}>Reculer<span className="sr-only"> la photo {rang + 1}</span></button>
                      <button type="button" className="espace-lien" onClick={() => retirerNouvelle(n.cle)}>Retirer<span className="sr-only"> la photo {rang + 1}</span></button>
                    </div>
                  </li>
                )
              })}
            </ul>
            <input ref={champFichiers} id="exo-fichiers" className="sr-only" type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={ajouter} />
            <button type="button" className="bouton bouton--secondaire" onClick={() => champFichiers.current.click()}>Ajouter des photos</button>
          </section>

          <div className="espace-fiche__bas">
            <p className="espace-message espace-message--erreur" role="alert">{erreur}</p>
            <div className="espace-actions">
              <button type="submit" className="bouton bouton--principal" disabled={envoi}>{envoi ? 'Enregistrement…' : 'Enregistrer la fiche'}</button>
              <Link to="/espace/coach/exercices" className="bouton bouton--secondaire">Annuler</Link>
              {id && (
                <button type="button" className="espace-lien" disabled={envoi} onClick={changerRetrait}>
                  {fiche.retire ? 'Désarchiver l’exercice' : 'Archiver l’exercice'}
                </button>
              )}
              {id && (
                <button type="button" className="espace-lien espace-lien--danger" disabled={envoi} onClick={() => setConfirmer(true)}>
                  Supprimer l’exercice
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
      {confirmer && (
        <Confirmation titre={`Supprimer « ${fiche.nom.trim() || 'cet exercice'} » ?`}
          texte="La fiche est effacée de votre banque pour de bon. Les séances qui l’utilisent déjà le gardent tel quel. Pour simplement le cacher, archivez-le plutôt."
          libelle="Supprimer l’exercice" action={supprimer} fermer={() => setConfirmer(false)} />
      )}
    </section>
  )
}
