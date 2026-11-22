import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ajoutJours } from '../donnees/calculs.js'
import { seancesDeLaSemaine } from '../donnees/progression.js'
import { statutSeance } from '../donnees/seances.js'
import { Chevron, Statut } from './Statut.jsx'
import ApercuSeance from './ApercuSeance.jsx'

const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
const jourMois = (iso) => { const [, m, j] = iso.split('-').map(Number); return { j, m: MOIS[m - 1] } }
// « 16 – 22 nov. » ou « 30 nov. – 6 déc. »
function dates(debut, n) {
  if (!debut) return ''
  const a = jourMois(ajoutJours(debut, (n - 1) * 7)), b = jourMois(ajoutJours(debut, (n - 1) * 7 + 6))
  return a.m === b.m ? `${a.j} – ${b.j} ${b.m}` : `${a.j} ${a.m} – ${b.j} ${b.m}`
}

// « Ma semaine » du tableau de bord : une ligne par séance de la semaine (case, numéro, titre, état).
// Flèches pour voir une autre semaine du programme (18 novembre 2026) ; par défaut la semaine en cours,
// et « Ma semaine » ramène à celle-ci quand on s'en est éloigné.
export default function CetteSemaine({ programme, semaine, faites, seances, commence = true }) {
  const total = (programme.semaines ?? []).length || 1
  const [vue, setVue] = useState(semaine)
  const [sens, setSens] = useState(0)
  const [apercu, setApercu] = useState(null) // programme pas commencé : aperçu de la séance au lieu de l'ouvrir
  useEffect(() => { setVue(semaine) }, [semaine])
  const aller = (n) => { if (n < 1 || n > total || n === vue) return; setSens(n > vue ? 1 : -1); setVue(n) }
  const lignes = seancesDeLaSemaine(programme, vue, faites)
  const chezMoi = vue === semaine
  // « Ma semaine » seulement pour la semaine en cours d'un programme commencé ; sinon « Semaine 2 » (Marie, 22 novembre 2026)
  const titre = chezMoi && commence ? 'Ma semaine' : `Semaine ${vue}`
  return (
    <section className="ec-semaine" aria-labelledby="titre-ma-semaine">
      <div className="ec-semaine__tete">
        <div className="ec-semaine__titres">
          <h2 id="titre-ma-semaine" className="ec-h3">{titre}</h2>
          <p className="ec-semaine__dates">{[`Semaine ${vue} sur ${total}`, programme.debut ? dates(programme.debut, vue) : ''].filter(Boolean).join(' · ')}</p>
        </div>
        {total > 1 && (
          <div className="ec-semaine__nav" role="group" aria-label="Changer de semaine">
            <button type="button" className="ec-semaine__fleche" onClick={() => aller(vue - 1)} disabled={vue <= 1} aria-label="Semaine précédente">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 6-6 6 6 6" /></svg>
            </button>
            <button type="button" className="ec-semaine__fleche" onClick={() => aller(vue + 1)} disabled={vue >= total} aria-label="Semaine suivante">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
            </button>
          </div>
        )}
      </div>
      {total > 1 && (
        <div className="ec-semaine__points" aria-hidden="true">
          {Array.from({ length: total }, (_, i) => (
            <button key={i} type="button" tabIndex={-1} className={`ec-semaine__point${i + 1 === vue ? ' est-vue' : ''}${commence && i + 1 === semaine ? ' est-moi' : ''}${commence && i + 1 < semaine ? ' est-passee' : ''}`} onClick={() => aller(i + 1)} />
          ))}
        </div>
      )}
      {!chezMoi && commence && <button type="button" className="ec-semaine__revenir" onClick={() => aller(semaine)}>← Revenir à ma semaine</button>}
      <div className={`ec-semaine__corps${sens > 0 ? ' vient-droite' : sens < 0 ? ' vient-gauche' : ''}`} key={vue} aria-live="polite">
        {lignes.length === 0
          ? <p className="ec-semaine__vide">Pas de séance cette semaine.</p>
          : (
            <ul className="ec-semaine__liste">
              {lignes.map((x) => {
                const statut = statutSeance(seances, programme.id, x.seance.id)
                const classe = statut === 'Faite' ? 'cochee' : statut === 'En cours' ? 'encours' : ''
                return (
                  <li key={x.seance.id}>
                    <Link className="ec-ligne" to={`/espace/seance/${programme.id}/${x.seance.id}`}
                      onClick={commence ? undefined : (e) => { e.preventDefault(); setApercu(x) }} aria-haspopup={commence ? undefined : 'dialog'}>
                      <span className={`ec-case-regul ${classe}`.trim()} aria-hidden="true" />
                      <span className="ec-ligne__corps">
                        <span className="ec-ligne__titre">Séance {x.numero}</span>
                        {x.seance.titre && <span className="ec-ligne__meta">{x.seance.titre}</span>}
                      </span>
                      {/* « À faire » ne s'affiche plus : seulement « Faite » et « À reprendre » (maquette du 22 novembre 2026) */}
                      {statut !== 'À faire' && <Statut statut={statut === 'En cours' ? 'À reprendre' : statut} />}
                      <Chevron />
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
      </div>
      {apercu && <ApercuSeance seance={apercu.seance} numero={apercu.numero} debut={programme.debut} fermer={() => setApercu(null)} />}
    </section>
  )
}
