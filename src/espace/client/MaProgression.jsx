import { useState } from 'react'
import { meilleuresCharges, regularite, seancesComptees } from '../donnees/calculs.js'
import { bilanSeance, dateSeance } from '../donnees/progression.js'
import { dateCourte, exercicesDe } from '../donnees/seances.js'
import { Link } from 'react-router-dom'
import MesPhotos from './MesPhotos.jsx'
import useReglages from '../coach/useReglages.js'
import { nomType } from '../donnees/reglages.js'
import MesMesures from './MesMesures.jsx'
import { Courbe } from '../coach/FicheClient.jsx'
import { Trophee } from './FinDeSeance.jsx'
import { frNombre } from '../donnees/resume.js'

const NB_POINTS = 8 // dernières séances montrées par exercice, comme dans les statistiques

// Ma progression en onglets (Marie, 25 novembre 2026) : Charges, Séances (régularité et historique), Mesures, Photos.
// Même style que Mon programme : une rangée de pastilles, puis des cartes blanches.
const ONGLETS = [['charges', 'Charges'], ['seances', 'Séances'], ['mesures', 'Mesures'], ['photos', 'Photos']]

export default function MaProgression({ uid, programme, programmes, faites, seances, records = [] }) {
  const [onglet, setOnglet] = useState('charges')
  return (
    <div className="ec-prog2">
      <div className="ec-prog2__onglets" role="tablist" aria-label="Ma progression">
        {ONGLETS.map(([id, nom]) => (
          <button key={id} type="button" role="tab" id={`onglet-${id}`} aria-selected={onglet === id} aria-controls={`panneau-${id}`}
            className="ec-prog2__onglet" onClick={() => setOnglet(id)}>{nom}</button>
        ))}
      </div>
      <div className="ec-prog2__panneau" role="tabpanel" id={`panneau-${onglet}`} aria-labelledby={`onglet-${onglet}`}>
        {onglet === 'charges' && <Charges programmes={programmes} seances={seances} records={records} />}
        {onglet === 'seances' && (
          <>
            <section className="ec-prog2__carte" aria-labelledby="titre-regularite">
              <h2 id="titre-regularite" className="ec-prog2__lab">Ma régularité</h2>
              <Regularite programme={programme} faites={faites} />
            </section>
            <section aria-labelledby="titre-historique" className="ec-prog2__bloc">
              <h2 id="titre-historique" className="ec-prog2__lab">Mes séances</h2>
              <Historique programmes={programmes} seances={seances} />
            </section>
          </>
        )}
        {onglet === 'mesures' && <section className="ec-prog2__carte" aria-label="Mon poids et mes mensurations"><MesMesures uid={uid} /></section>}
        {onglet === 'photos' && <section className="ec-prog2__carte" aria-label="Mes photos"><MesPhotos uid={uid} /></section>}
      </div>
    </div>
  )
}

// ---------- Ma régularité ----------
function Regularite({ programme, faites }) {
  if (!programme) return <p className="ec-vide">Votre programme arrive bientôt.</p>
  const comptes = regularite(programme, faites)
  return (
    <ul className="ec-regul">
      {(programme.semaines ?? []).map((sem, i) => {
        const { prevues, faites: nf } = comptes[i]
        const seancesSem = seancesComptees(sem)
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
// Les records en pastilles, puis un seul graphique : celui de l'exercice choisi (25 novembre 2026, plus de liste de graphiques)
function Charges({ programmes, seances, records }) {
  const { exoIdParElement, noms } = exercicesDe(programmes)
  const courbes = [...noms.entries()]
    .map(([exoId, nom]) => ({ exoId, nom, points: meilleuresCharges(seances, exoIdParElement, exoId) }))
    .filter((c) => c.points.length > 0)
    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
  const [choix, setChoix] = useState(null)
  const courbe = courbes.find((c) => c.exoId === choix) ?? courbes[0]
  if (courbes.length === 0) return <p className="ec-vide">Vos charges apparaîtront ici dès votre première séance de force enregistrée.</p>
  return (
    <>
      {records.length > 0 && (
        <section className="ec-prog2__bloc" aria-labelledby="titre-records">
          <h2 id="titre-records" className="ec-prog2__lab"><Trophee />Mes records</h2>
          <ul className="ec-prog2__records">
            {records.map((r) => (
              <li key={r.exoId}>
                <span className="ec-prog2__rec-nom">{r.nom}</span>
                <span className="ec-prog2__rec-val">{frNombre(r.charge)} kg × {frNombre(r.reps)}</span>
                <span className="ec-prog2__rec-date">le {dateCourte(r.date)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
      <section className="ec-prog2__carte" aria-labelledby="titre-charges">
        <h2 id="titre-charges" className="ec-prog2__lab">Mes charges</h2>
        <div className="ec-prog2__exos" role="group" aria-label="Exercice">
          {courbes.map((c) => (
            <button key={c.exoId} type="button" className="ec-prog2__exo" aria-pressed={c.exoId === courbe.exoId} onClick={() => setChoix(c.exoId)}>{c.nom}</button>
          ))}
        </div>
        <ul className="fiche-liste ec-charges ec-prog2__courbe">
          <Courbe key={courbe.exoId} nom={courbe.nom} points={courbe.points.slice(-NB_POINTS)} />
        </ul>
      </section>
    </>
  )
}

// ---------- Mes séances ----------
function Historique({ programmes, seances }) {
  const { types } = useReglages()
  const lignes = seances
    .filter((s) => s.statut === 'terminée')
    .sort((a, b) => (b.date || '').localeCompare(a.date || '') || a.id.localeCompare(b.id))
    .map((s) => {
      const programme = programmes.find((x) => x.id === s.programme)
      let trouve = null
      ;(programme?.semaines ?? []).forEach((sem, i) => {
        const liste = seancesComptees(sem)
        const k = liste.findIndex((x) => x.id === s.seance)
        if (k !== -1) trouve = { seance: liste[k], semaine: i + 1, numero: k + 1 } // numéro dans la semaine, comme la maquette
      })
      return { s, programme, trouve }
    })
  return (
    <>
      {lignes.length === 0 && <p className="ec-vide">Vos séances apparaîtront ici dès que vous aurez enregistré la première.</p>}
      {lignes.length > 0 && <ul className="ec-histo">
        {lignes.map(({ s, programme, trouve }) => {
          const titre = trouve?.seance.titre || (trouve ? 'Séance' : 'Séance faite')
          const type = nomType(trouve?.seance.type, types)
          // séance d'un programme supprimé par Marie : on garde la date et le bilan, et on le dit
          const quand = [dateSeance(s.date), trouve ? `semaine ${trouve.semaine}` : 'programme retiré', trouve ? type : ''].filter(Boolean).join(' · ')
          const bilan = bilanSeance(trouve?.seance.type, s)
          const contenu = (
            <>
              {trouve
                ? <span className="ec-histo__numero">{String(trouve.numero).padStart(2, '0')}</span>
                : <span className="ec-histo__fait" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>}
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
      </ul>}
    </>
  )
}
