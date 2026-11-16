import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { nomType } from '../donnees/reglages.js'
import AjoutSeance from './AjoutSeance.jsx'
import { IconeCopier, IconePoints } from './Icones.jsx'

// Grille du programme (maquette de Thomas, 15 novembre 2026) : une colonne par semaine, les séances empilées dedans.
// On glisse une séance d'une colonne à l'autre (ou plus haut, plus bas) ; Alt en glissant la copie ; ⧉ la duplique juste après ;
// le menu ⋯ fait la même chose au clavier ou au toucher. Une séance déjà faite par le coaché ne se déplace ni ne se supprime (cadenas), mais elle se copie.
const TYPE_SEANCE = 'application/x-rimaactive-seance'

const nbExos = (s) => (s.blocs ?? []).reduce((t, b) => t + (b.elements ?? []).length, 0)

// Ferme le menu <details> qui contient le bouton cliqué
const fermer = (ev) => { const d = ev.currentTarget.closest('details'); if (d) d.open = false }

function MenuSeance({ nom, semaines, courante, faite, dupliquer, deplacer, supprimer }) {
  return (
    <details className="gp-menu">
      <summary aria-label={`Actions : ${nom}`} title="Actions"><IconePoints /></summary>
      <div className="gp-menu__liste" role="group" aria-label={`Actions : ${nom}`}>
        <button type="button" onClick={(e) => { fermer(e); dupliquer(courante) }}>Dupliquer juste après</button>
        <p className="gp-menu__titre">Copier vers…</p>
        <div className="gp-menu__semaines">
          {semaines.map((_, i) => <button key={i} type="button" onClick={(e) => { fermer(e); dupliquer(i) }}>S{i + 1}</button>)}
        </div>
        {!faite && (
          <>
            <p className="gp-menu__titre">Déplacer vers…</p>
            <div className="gp-menu__semaines">
              {semaines.map((_, i) => i !== courante && <button key={i} type="button" onClick={(e) => { fermer(e); deplacer(i) }}>S{i + 1}</button>)}
            </div>
            <button type="button" className="gp-menu__danger" onClick={(e) => { fermer(e); supprimer() }}>Supprimer la séance</button>
          </>
        )}
      </div>
    </details>
  )
}

export default function GrilleProgramme({ prog, verrous, types, lien, gererTypes, actions, annulable, annuler, maxSemaines, semainePrete }) {
  const [glisse, setGlisse] = useState(null) // { s, se } de la séance en train d'être glissée
  const [depot, setDepot] = useState(null) // { s, index } : où elle tomberait
  const [mots, setMots] = useState({}) // semaines dont le « mot pour le coaché » est ouvert
  const colonnes = useRef({})
  const enCours = useRef(null) // la séance glissée, lisible tout de suite (l'état `glisse` ne sert qu'à l'affichage)
  const semaines = prog.semaines
  const attente = verrous === null
  const faite = (id) => verrous?.has(id)

  // place de dépôt d'après la hauteur de la souris : avant la première carte dont le milieu est plus bas
  const indexDepuis = (ev, s) => {
    const cartes = [...(colonnes.current[s]?.querySelectorAll(':scope > .gp-seance') ?? [])]
    const i = cartes.findIndex((c) => { const r = c.getBoundingClientRect(); return ev.clientY < r.top + r.height / 2 })
    return i < 0 ? cartes.length : i
  }
  const survoler = (s) => (ev) => {
    if (!enCours.current || ![...ev.dataTransfer.types].includes(TYPE_SEANCE)) return
    ev.preventDefault()
    ev.dataTransfer.dropEffect = ev.altKey ? 'copy' : 'move'
    const index = indexDepuis(ev, s)
    setDepot((d) => (d && d.s === s && d.index === index ? d : { s, index }))
  }
  const deposer = (s) => (ev) => {
    const de = enCours.current
    if (!de) return
    ev.preventDefault()
    const index = indexDepuis(ev, s)
    enCours.current = null
    setGlisse(null); setDepot(null)
    if (ev.altKey) actions.dupliquer(de, { vers: s, index })
    else if (!(de.s === s && (index === de.se || index === de.se + 1))) actions.deplacer(de, { vers: s, index })
  }
  const quitter = (ev) => { if (!ev.currentTarget.contains(ev.relatedTarget)) setDepot(null) }

  return (
    <div className="gp-zone">
      {annulable && (
        <p className="gp-annuler" role="status">{annulable.texte}<button type="button" onClick={annuler}>Annuler</button></p>
      )}
      <div className="gp" style={{ gridTemplateColumns: `repeat(${semaines.length}, minmax(252px, 1fr)) minmax(150px, 190px)` }}>
        {semaines.map((w, s) => {
          const nbFaites = w.seances.filter((x) => faite(x.id)).length
          return (
            <section key={w.id} className={`gp-col${depot?.s === s ? ' est-depot' : ''}`} aria-labelledby={`gp-sem-${w.id}`}>
              <header className="gp-col__tete">
                <h2 id={`gp-sem-${w.id}`}>Semaine {s + 1}</h2>
                <details className="gp-menu gp-menu--semaine">
                  <summary aria-label={`Actions : semaine ${s + 1}`} title="Actions de la semaine"><IconePoints /></summary>
                  <div className="gp-menu__liste" role="group" aria-label={`Actions : semaine ${s + 1}`}>
                    <button type="button" onClick={(e) => { fermer(e); actions.dupliquerSemaine(s) }}>Dupliquer dans la semaine {s + 2}</button>
                    <button type="button" onClick={(e) => { fermer(e); setMots((m) => ({ ...m, [w.id]: !m[w.id] })) }}>Mot pour le coaché</button>
                    {semaines.length > 1 && !attente && nbFaites === 0 && (
                      <button type="button" className="gp-menu__danger" onClick={(e) => { fermer(e); actions.supprimerSemaine(s) }}>Supprimer la semaine</button>
                    )}
                  </div>
                </details>
              </header>
              <div className="gp-col__reglages">
                <label className="gp-rpe">RPE visé
                  <input inputMode="decimal" autoComplete="off" value={w.rpe ?? ''} aria-label={`RPE visé de la semaine ${s + 1}`} placeholder="–" onChange={(e) => actions.majSemaine(s, 'rpe', e.target.value)} />
                </label>
                <span className="gp-compte">{w.seances.length} séance{w.seances.length > 1 ? 's' : ''}</span>
              </div>
              {(mots[w.id] || (w.mot ?? '').trim()) && (
                <label className="gp-mot">Mot pour le coaché
                  <input autoComplete="off" value={w.mot ?? ''} onChange={(e) => actions.majSemaine(s, 'mot', e.target.value)} />
                </label>
              )}
              <ol className="gp-liste" ref={(el) => { colonnes.current[s] = el }} onDragOver={survoler(s)} onDragLeave={quitter} onDrop={deposer(s)}>
                {w.seances.length === 0 && depot?.s !== s && <li className="gp-vide">Aucune séance</li>}
                {w.seances.map((x, i) => {
                  const f = faite(x.id)
                  const nb = nbExos(x)
                  return (
                    <li key={x.id} className="gp-item">
                      {depot?.s === s && depot.index === i && <span className="gp-depot" aria-hidden="true" />}
                      <article className={`gp-seance${f ? ' est-faite' : ''}${glisse?.s === s && glisse.se === i ? ' est-leve' : ''}`}
                        draggable={!f && !attente}
                        onDragStart={(ev) => { ev.dataTransfer.setData(TYPE_SEANCE, `${s}:${i}`); ev.dataTransfer.effectAllowed = 'copyMove'; enCours.current = { s, se: i }; setGlisse({ s, se: i }) }}
                        onDragEnd={() => { enCours.current = null; setGlisse(null); setDepot(null) }}>
                        {!f && <span className="gp-poignee" aria-hidden="true" title="Glisser pour déplacer">⋮⋮</span>}
                        <div className="gp-seance__corps">
                          <p className="gp-seance__haut"><span className="gp-num">{String(i + 1).padStart(2, '0')}</span><span>{nomType(x.type, types)}</span></p>
                          <h3 className="gp-seance__titre">
                            <Link to={lien(s, x.id)}><span className="sr-only">Séance {i + 1} : </span>{x.titre || 'Séance sans titre'}</Link>
                          </h3>
                          <p className="gp-seance__meta">{nb} exercice{nb > 1 ? 's' : ''}{x.duree ? ` · ${x.duree} min` : ''}</p>
                          <p className={`gp-seance__etat${f ? ' est-faite' : ''}`}>{f ? '✓ Faite · non modifiable' : 'À faire'}</p>
                        </div>
                        {!attente && (
                          <div className="gp-seance__outils">
                            <button type="button" className="gp-dup" aria-label={`Dupliquer la séance ${i + 1} de la semaine ${s + 1}`} title="Dupliquer juste après" onClick={() => actions.dupliquer({ s, se: i }, { vers: s, index: i + 1 })}><IconeCopier /></button>
                            <MenuSeance nom={`séance ${i + 1}, semaine ${s + 1}`} semaines={semaines} courante={s} faite={f}
                              dupliquer={(vers) => actions.dupliquer({ s, se: i }, vers === s ? { vers, index: i + 1 } : { vers })}
                              deplacer={(vers) => actions.deplacer({ s, se: i }, { vers })}
                              supprimer={() => actions.supprimer(s, i, x)} />
                          </div>
                        )}
                      </article>
                    </li>
                  )
                })}
                {depot?.s === s && depot.index >= w.seances.length && <li className="gp-item"><span className="gp-depot" aria-hidden="true" /></li>}
              </ol>
              <AjoutSeance types={types} ajouter={(type) => actions.ajouterSeance(s, type)} gerer={gererTypes} />
            </section>
          )
        })}
        {semaines.length < maxSemaines && (
          <div className="gp-nouvelle">
            <button type="button" onClick={actions.ajouterSemaine}>＋ Semaine</button>
            <p>Une semaine vide, à remplir ou à copier.</p>
          </div>
        )}
      </div>
    </div>
  )
}
