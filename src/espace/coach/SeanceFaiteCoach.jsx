import { estEnSeries } from '../donnees/seances.js'
import { useState } from 'react'
import { casesExercice, comparerSeance, detailSeries, bilanSeance } from '../donnees/ecarts.js'
import { nomBloc } from '../donnees/programme.js'
import { resumeFormat, fr } from '../donnees/seances.js'
import { frNombre } from '../donnees/resume.js'
import PhotoStockee from './PhotoStockee.jsx'

// Séance faite, vue du coach (maquette de Thomas, 16 novembre 2026) : la même page que la création de séance, en lecture seule.
// À gauche le bilan (séries, effort, ressenti, commentaire pour le coaché) ; à droite les blocs, une ligne par exercice avec
// ce que le coaché a fait, le prévu en petit dessous quand c'est différent, et un verdict. Un clic sur la ligne ouvre le détail série par série.

const VERDICTS = {
  prevu: ['Comme prévu', 'ok'], plus: ['Plus lourd', 'pl'], moins: ['Moins', 'mo'], 'pas-fait': ['Pas fait', 'pas'], retire: ['Retiré', 'pas'],
}
const MODES = [['prevu', 'Prévu'], ['fait', 'Fait'], ['compare', 'Comparer']]

function Pastille({ statut }) {
  const [texte, cl] = VERDICTS[statut] ?? VERDICTS.prevu
  return <span className={`sf-verdict sf-verdict--${cl}`}><i aria-hidden="true" />{texte}</span>
}

function LigneSerie({ el, code, lignes, verdict, photo, mode }) {
  const [ouvert, setOuvert] = useState(false)
  const cases = casesExercice(el, lignes)
  const detail = detailSeries(el, lignes)
  const id = `sf-${el.id}`
  return (
    <li className="sf-ligne">
      <div className="sf-ligne__principal">
        <PhotoStockee chemin={photo} alt="" classe="espace-vignette" />
        <p className="sf-ligne__nom"><span className="es2-code" aria-hidden="true">{code}</span> {el.nom}</p>
        {cases.map((c) => {
          if (c.cle === 'repos' && !c.prevu) return <span key={c.cle} className="sf-case sf-case--vide" aria-hidden="true" />
          const montrePrevu = mode === 'prevu' || (mode === 'compare' && c.prevu) || (c.etat !== 'ok' && c.etat !== 'vide' && c.prevu)
          const valeur = mode === 'prevu' || c.cle === 'repos' ? c.prevu : (c.fait || '—')
          const etat = mode === 'prevu' || c.cle === 'repos' ? 'neutre' : c.etat
          return (
            <span key={c.cle} className={`sf-case sf-case--${etat}`} title={`${c.libelle} : ${c.fait || 'rien noté'}${c.prevu ? ` (prévu ${c.prevu})` : ''}`}>
              <b>{valeur || '—'}</b>
              {mode !== 'prevu' && c.cle !== 'repos' && montrePrevu && c.prevu && c.prevu !== c.fait && <small>prévu {c.prevu}</small>}
            </span>
          )
        })}
        <Pastille statut={verdict} />
        <button type="button" className="sf-chevron" aria-expanded={ouvert} aria-controls={id} aria-label={`Détail des séries : ${el.nom}`} onClick={() => setOuvert((o) => !o)}>
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
        </button>
      </div>
      {ouvert && (
        <div className="sf-detail" id={id}>
          {detail.map((d) => (
            <div key={d.n} className={`sf-detail__ligne sf-detail__ligne--${d.etat}`}>
              <span className="sf-detail__n">Série {d.n}</span>
              <span className="sf-detail__prevu">Prévu : {d.prevu || '—'}</span>
              <span className="sf-detail__fait">{d.etat === 'non-faite' ? 'non faite' : d.fait || 'fait'}</span>
            </div>
          ))}
        </div>
      )}
    </li>
  )
}

function LigneAutre({ bloc, ligne }) {
  return (
    <li className="sf-ligne">
      <div className="sf-ligne__principal sf-ligne__principal--autre">
        <p className="sf-ligne__nom">{ligne.nom}<small>{ligne.prevu}</small></p>
        <span className="sf-case sf-case--neutre sf-case--large"><b>{ligne.fait || '—'}</b>{ligne.ecart && ligne.statut !== 'prevu' && <small>{ligne.ecart}</small>}</span>
        <Pastille statut={ligne.statut} />
      </div>
    </li>
  )
}

export default function SeanceFaiteCoach({ seance, sf, prenom, banque, rpeVise, semaine, numero, commenter }) {
  const [mode, setMode] = useState('fait')
  const [texte, setTexte] = useState(sf?.commentaireCoach ?? '')
  const [envoye, setEnvoye] = useState(false)
  const cmp = comparerSeance(seance, sf)
  const parCle = new Map(cmp.lignes.map((l) => [l.cle, l]))
  const bilan = bilanSeance(seance, sf)
  const blocs = seance.blocs ?? []
  const segments = cmp.lignes.filter((l) => l.statut !== 'retire')
  const date = sf?.date ? new Date(`${sf.date}T12:00:00`).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) : ''
  const photoDe = (e) => e.photos?.[0] || (banque ?? []).find((x) => x.id === e.exoId)?.photos?.[0]
  const envoyer = () => { commenter(texte); setEnvoye(true) }

  return (
    <div className="espace-seance es2 sf">
      <aside className="sf-bilan" aria-label="Bilan de la séance">
        <h2>Bilan de la séance</h2>
        <p className="sf-bilan__gros"><b>{bilan.faites} / {bilan.total}</b> <span>séries faites</span></p>
        <div className="sf-barre" aria-hidden="true">{segments.map((l) => <i key={l.cle} className={`sf-barre__${l.statut}`} />)}</div>
        {cmp.verdict && <p className="sf-bilan__verdict">{cmp.verdict}</p>}
        <dl className="sf-bilan__liste">
          {bilan.rpeMoyen !== null && (
            <div className={bilan.rpeMoyen > Number(String(rpeVise ?? '').replace(',', '.')) ? 'est-haut' : ''}>
              <dt>Effort (RPE)</dt><dd>{fr(bilan.rpeMoyen)}{rpeVise ? <small> prévu {fr(rpeVise)}</small> : null}</dd>
            </div>
          )}
          {Number.isInteger(sf?.effort) && <div><dt>Effort ressenti</dt><dd>{sf.effort}<small> / 10</small></dd></div>}
        </dl>
        {(sf?.ressenti || sf?.commentaire) && (
          <div className="sf-bilan__mot">
            <em>{prenom || 'Le coaché'}{sf.ressenti ? ` · « ${sf.ressenti} »` : ''}</em>
            {sf.commentaire && <p>« {sf.commentaire} »</p>}
          </div>
        )}
        <div className="sf-bilan__reponse">
          <label htmlFor="sf-commentaire">Votre commentaire pour {prenom || 'le coaché'}</label>
          <textarea id="sf-commentaire" className="champ" rows={3} value={texte} onChange={(e) => { setTexte(e.target.value); setEnvoye(false) }} />
          <button type="button" className="bouton bouton--principal bouton--compact" onClick={envoyer} disabled={texte.trim() === (sf?.commentaireCoach ?? '').trim()}>
            {envoye ? 'Envoyé ✓' : 'Envoyer'}
          </button>
        </div>
      </aside>

      <section className="es2__seance" aria-label="Ce qui était prévu et ce qui a été fait">
        <div className="sf-tete">
          <p className="sf-tete__infos">{[`Faite ${date}`.trim(), semaine ? `semaine ${semaine}` : '', seance.lieu, seance.duree ? `${seance.duree} min prévues` : ''].filter(Boolean).join(' · ')}</p>
          <div className="sf-modes" role="group" aria-label="Affichage">
            {MODES.map(([id, nom]) => <button key={id} type="button" aria-pressed={mode === id} className={mode === id ? 'est-actif' : ''} onClick={() => setMode(id)}>{nom}</button>)}
          </div>
        </div>
        {blocs.map((b) => {
          const serie = estEnSeries(b.format)
          return (
            <section key={b.id} className="es2-bloc sf-bloc" aria-labelledby={`sfb-${b.id}`} data-format="series">
              <div className="es2-bloc__tete">
                <div className="es2-nom"><h2 id={`sfb-${b.id}`} className="es2-nom__titre"><span className="es2-lettre" aria-hidden="true">{b.lettre}</span>{nomBloc(b)}{!serie && <small className="sf-format"> · {resumeFormat(b)}</small>}</h2></div>
                <span className="sf-lecture">🔒 lecture seule</span>
              </div>
              {serie && (b.elements ?? []).length > 0 && (
                <div className="sf-colonnes" aria-hidden="true"><span /><span /><span>Séries</span><span>Reps</span><span>Charge</span><span>Repos</span><span /><span /></div>
              )}
              <ol className="es2-lignes">
                {serie
                  ? (b.elements ?? []).map((el, i) => (
                    <LigneSerie key={el.id} el={el} code={`${b.lettre}${i + 1}`} lignes={sf?.series?.[el.id] ?? []} verdict={parCle.get(el.id)?.statut ?? 'pas-fait'} photo={photoDe(el)} mode={mode} />
                  ))
                  : parCle.get(b.id) && <LigneAutre bloc={b} ligne={parCle.get(b.id)} />}
              </ol>
            </section>
          )
        })}
        {cmp.lignes.some((l) => l.statut === 'retire') && (
          <p className="espace-aide">{cmp.lignes.filter((l) => l.statut === 'retire').length} exercice(s) noté(s) par {prenom || 'le coaché'} ont été retirés du programme depuis.</p>
        )}
        <p className="sf-total">{numero ? `Séance ${numero} · ` : ''}{frNombre(Math.round(Object.values(sf?.series ?? {}).flat().reduce((t, x) => t + ((x?.fait !== false ? (parseFloat(String(x?.charge).replace(',', '.')) || 0) * (parseFloat(String(x?.reps).replace(',', '.')) || 0) : 0)), 0)))} kg soulevés</p>
      </section>
    </div>
  )
}
