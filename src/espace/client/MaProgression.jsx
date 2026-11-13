import { useRef } from 'react'
import { meilleuresCharges, regularite, semaineCourante } from '../donnees/calculs.js'
import { bilanSeance, dateSeance } from '../donnees/progression.js'
import { evolutionCharges, exercicesDe, fr } from '../donnees/seances.js'
import { Link } from 'react-router-dom'
import MesPhotos from './MesPhotos.jsx'
import MesMesures from './MesMesures.jsx'

const NB_POINTS = 6 // dernières séances montrées par exercice

// Onglet « Ma progression » : cinq rubriques repliables, ouvertes par défaut.
export default function MaProgression({ uid, programme, programmes, faites, seances }) {
  return (
    <div className="ec-rubriques">
      <Rubrique id="titre-regularite" titre="Ma régularité">
        <Regularite programme={programme} faites={faites} />
      </Rubrique>
      <Rubrique id="titre-charges" titre="Mes charges">
        <Charges programmes={programmes} seances={seances} />
      </Rubrique>
      <Rubrique id="titre-historique" titre="Mes séances">
        <Historique programmes={programmes} seances={seances} />
      </Rubrique>
      <Rubrique id="titre-photos" titre="Mes photos">
        <MesPhotos uid={uid} />
      </Rubrique>
      <Rubrique id="titre-mesures" titre="Mon poids et mes mensurations">
        <MesMesures uid={uid} />
      </Rubrique>
    </div>
  )
}

// Rubrique repliable : <details> (clavier et lecteurs d'écran inchangés), avec une hauteur qui s'anime à l'ouverture et à la fermeture.
// data-etat : « replie » (hauteur 0) puis retiré à la fin du mouvement ; sans mouvement (préférence système), le <details> fait seul.
function Rubrique({ id, titre, children }) {
  const racine = useRef(null)
  const minuterie = useRef(null)

  const basculer = (e) => {
    const d = racine.current
    if (!d || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    e.preventDefault()
    clearTimeout(minuterie.current)
    const fin = (ouvert) => {
      d.open = ouvert
      d.removeAttribute('data-etat')
    }
    const replie = !d.open || d.dataset.etat === 'replie' // fermée, ou en train de se fermer : on (ré)ouvre
    if (replie) {
      if (!d.open) {
        d.dataset.etat = 'replie'
        d.open = true
        void d.offsetHeight // la hauteur 0 est appliquée avant de lancer le mouvement
      }
      d.dataset.etat = 'deplie'
      minuterie.current = setTimeout(() => fin(true), 320)
    } else {
      d.dataset.etat = 'deplie'
      void d.offsetHeight
      d.dataset.etat = 'replie'
      minuterie.current = setTimeout(() => fin(false), 320)
    }
  }

  return (
    <details className="ec-repli" open ref={racine}>
      <summary onClick={basculer}><h2 id={id} className="ec-h2">{titre}</h2></summary>
      <div className="ec-repli__zone">
        <div className="ec-repli__interieur"><div className="ec-pile">{children}</div></div>
      </div>
    </details>
  )
}

// ---------- Ma régularité ----------
function Regularite({ programme, faites }) {
  if (!programme) return <p className="ec-texte ec-gris">Votre programme arrive bientôt.</p>
  const comptes = regularite(programme, faites)
  return (
    <ul className="ec-regul">
      {(programme.semaines ?? []).map((sem, i) => {
        const { prevues, faites: nf } = comptes[i]
        const seancesSem = sem.seances ?? []
        return (
          <li key={sem.id ?? i} className="ec-regul__ligne">
            <span className="ec-regul__semaine">Semaine {i + 1}</span>
            <span className="ec-regul__cases" role="img" aria-label={`Semaine ${i + 1} : ${nf} séances faites sur ${prevues}`}>
              {seancesSem.map((s) => <span key={s.id} className={`ec-case-regul${faites.has(s.id) ? ' cochee' : ''}`} />)}
            </span>
            <span className="ec-petit ec-regul__txt">{nf} séance{nf > 1 ? 's' : ''} sur {prevues} faite{nf > 1 ? 's' : ''}</span>
          </li>
        )
      })}
    </ul>
  )
}

// ---------- Mes charges ----------
function Charges({ programmes, seances }) {
  const { exoIdParElement, noms } = exercicesDe(programmes)
  const courbes = [...noms.entries()]
    .map(([exoId, nom]) => ({ exoId, nom, points: meilleuresCharges(seances, exoIdParElement, exoId) }))
    .filter((c) => c.points.length > 0)
    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
  // « S2·12/11 » : semaine du programme (le plus récent commencé ce jour-là) et jour/mois
  const libelle = (date) => {
    const p = [...programmes].filter((x) => x.debut && x.debut <= date).sort((a, b) => (a.debut < b.debut ? 1 : -1))[0]
    const [, m, j] = date.split('-').map(Number)
    const jm = `${j}/${m}`
    return p ? `S${Math.max(1, semaineCourante(p.debut, date, (p.semaines ?? []).length))}·${jm}` : jm
  }
  return (
    <>
      {courbes.length === 0 && <p className="ec-texte ec-gris">Vos charges apparaîtront ici dès votre première séance de force enregistrée.</p>}
      <div className="ec-charges">
        {courbes.map((c) => <Courbe key={c.exoId} nom={c.nom} points={c.points} libelle={libelle} />)}
      </div>
    </>
  )
}

function Courbe({ nom, points, libelle }) {
  const vus = points.slice(-NB_POINTS)
  const valeur = (p) => parseFloat(String(p.charge).replace(',', '.')) || 0
  const vals = vus.map(valeur)
  const max = Math.max(...vals)
  const min = Math.min(...vals)
  const der = points[points.length - 1]
  const description = vus
    .map((p) => `${libelle(p.date)}, ${fr(p.charge)} kg${p.reps ? ` pour ${p.reps} répétitions` : ''}`)
    .join(' ; ')
  return (
    <article className="ec-carte ec-courbe">
      <div className="ec-courbe__tete">
        <h3 className="ec-courbe__nom">{nom}</h3>
        <p className="ec-courbe__derniere">{fr(der.charge)} kg{der.reps ? ` × ${der.reps}` : ''}</p>
      </div>
      <div className="ec-courbe__barres" role="img" aria-label={`${nom} : ${description}`}>
        {vus.map((p, i) => (
          <div key={i} className="ec-courbe__point">
            <span className="ec-courbe__valeur">{fr(p.charge)}{p.reps ? `×${p.reps}` : ''}</span>
            <span className="ec-courbe__barre" style={{ height: `${Math.round(max > min ? 14 + ((vals[i] - min) / (max - min)) * 34 : 30)}px` }} />
            <span className="ec-courbe__date">{libelle(p.date)}</span>
          </div>
        ))}
      </div>
      <p className="ec-petit">{evolutionCharges(points)}</p>
    </article>
  )
}

// ---------- Mes séances ----------
function Historique({ programmes, seances }) {
  const lignes = seances
    .filter((s) => s.statut === 'terminée')
    .sort((a, b) => (b.date || '').localeCompare(a.date || '') || a.id.localeCompare(b.id))
    .map((s) => {
      const programme = programmes.find((x) => x.id === s.programme)
      let trouve = null
      ;(programme?.semaines ?? []).forEach((sem, i) => {
        const k = (sem.seances ?? []).findIndex((x) => x.id === s.seance)
        if (k !== -1) trouve = { seance: sem.seances[k], semaine: i + 1, numero: k + 1 } // numéro dans la semaine, comme la maquette
      })
      return { s, programme, trouve }
    })
  return (
    <>
      {lignes.length === 0 && <p className="ec-texte ec-gris">Vos séances apparaîtront ici dès que vous aurez enregistré la première.</p>}
      <ul className="ec-histo">
        {lignes.map(({ s, programme, trouve }) => {
          const titre = trouve?.seance.titre || 'Séance'
          const type = trouve?.seance.type === 'course' ? 'Course' : 'Force'
          const quand = [dateSeance(s.date), trouve ? `semaine ${trouve.semaine}` : '', trouve ? type : ''].filter(Boolean).join(' · ')
          const bilan = bilanSeance(trouve?.seance.type, s)
          const contenu = (
            <>
              <span className="ec-histo__numero">{trouve ? String(trouve.numero).padStart(2, '0') : ''}</span>
              <span className="ec-histo__corps">
                <span className="ec-histo__titre">{titre}</span>
                <span className="ec-histo__meta">{quand}</span>
                {bilan && <span className="ec-histo__bilan">{bilan}</span>}
                {s.commentaire && <span className="ec-histo__note">« {s.commentaire} »</span>}
              </span>
            </>
          )
          return (
            <li key={s.id}>
              {programme
                ? <Link className="ec-histo__carte" to={`/espace/seance/${s.programme}/${s.seance}`} aria-label={`${titre}, ${dateSeance(s.date)}, voir mes résultats`}>{contenu}</Link>
                : <div className="ec-histo__carte">{contenu}</div>}
            </li>
          )
        })}
      </ul>
    </>
  )
}
