import MenuFlottant from './MenuFlottant.jsx'
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { nomType } from '../donnees/reglages.js'
import AjoutSeance from './AjoutSeance.jsx'
import { IconeCopier, IconePoints } from './Icones.jsx'

// Grille du programme (maquette de Thomas, 15 novembre 2026) : une colonne par semaine, les séances empilées dedans.
// On glisse une séance d'une colonne à l'autre (ou plus haut, plus bas) ; Alt en glissant la copie ; ⧉ la duplique juste après ;
// le menu ⋯ fait la même chose au clavier ou au toucher. Une séance déjà faite par le coaché ne se déplace ni ne se supprime (cadenas), mais elle se copie.
const TYPE_SEANCE = 'application/x-rimaactive-seance'
const TYPE_MODELE = 'application/x-rimaactive-modele-seance'

const nbExos = (s) => (s.blocs ?? []).reduce((t, b) => t + (b.elements ?? []).length, 0)

function MenuSeance({ nom, semaines, courante, faite, dupliquer, deplacer, supprimer, versModele }) {
  return (
    <MenuFlottant libelle={`Actions : ${nom}`} titre="Actions" bouton={<IconePoints />} aria={`Actions : ${nom}`}>
      {(fermer) => (
        <>
          <button type="button" onClick={() => { fermer(); dupliquer(courante) }}>Dupliquer juste après</button>
          {versModele && <button type="button" onClick={() => { fermer(); versModele() }}>Enregistrer comme modèle</button>}
          <p className="gp-menu__titre">Copier vers…</p>
          <div className="gp-menu__semaines">
            {semaines.map((_, i) => <button key={i} type="button" onClick={() => { fermer(); dupliquer(i) }}>S{i + 1}</button>)}
          </div>
          {!faite && (
            <>
              <p className="gp-menu__titre">Déplacer vers…</p>
              <div className="gp-menu__semaines">
                {semaines.map((_, i) => i !== courante && <button key={i} type="button" onClick={() => { fermer(); deplacer(i) }}>S{i + 1}</button>)}
              </div>
              <button type="button" className="gp-menu__danger" onClick={() => { fermer(); supprimer() }}>Supprimer la séance</button>
            </>
          )}
        </>
      )}
    </MenuFlottant>
  )
}

export default function GrilleProgramme({ prog, verrous, types, lien, gererTypes, actions, annulable, annuler, maxSemaines, courante = -1, modeles = null }) {
  const [glisse, setGlisse] = useState(null) // { s, se } de la séance en train d'être glissée
  const [depot, setDepot] = useState(null) // { s, index } : où elle tomberait
  const [mots, setMots] = useState({}) // semaines dont le « mot pour le coaché » est ouvert
  const colonnes = useRef({})
  const enCours = useRef(null) // la séance glissée, lisible tout de suite (l'état `glisse` ne sert qu'à l'affichage)
  const modeleEnCours = useRef(null) // id du modèle de séance glissé depuis le panneau
  const [modeleGlisse, setModeleGlisse] = useState(false) // pour montrer où le déposer
  const semaines = prog.semaines
  const zone = useRef(null)
  // à l'ouverture, la grille défile jusqu'à la semaine en cours (visible sans chercher)
  useEffect(() => {
    const g = zone.current
    const col = g?.querySelector('.gp-col.est-courante')
    if (!g || !col) return
    // défilement horizontal de la grille seulement (la page ne bouge pas)
    g.scrollLeft += col.getBoundingClientRect().left - g.getBoundingClientRect().left - 16
  }, [prog.id, courante])
  const attente = verrous === null
  const faite = (id) => verrous?.has(id)

  // place de dépôt d'après la hauteur de la souris : avant la première carte dont le milieu est plus bas
  const indexDepuis = (ev, s) => {
    const cartes = [...(colonnes.current[s]?.querySelectorAll(':scope > .gp-seance') ?? [])]
    const i = cartes.findIndex((c) => { const r = c.getBoundingClientRect(); return ev.clientY < r.top + r.height / 2 })
    return i < 0 ? cartes.length : i
  }
  const survoler = (s) => (ev) => {
    const modele = modeleEnCours.current && [...ev.dataTransfer.types].includes(TYPE_MODELE)
    if (!modele && (!enCours.current || ![...ev.dataTransfer.types].includes(TYPE_SEANCE))) return
    ev.preventDefault()
    ev.dataTransfer.dropEffect = modele || ev.altKey ? 'copy' : 'move'
    const index = indexDepuis(ev, s)
    setDepot((d) => (d && d.s === s && d.index === index ? d : { s, index }))
  }
  const deposer = (s) => (ev) => {
    if (modeleEnCours.current) {
      ev.preventDefault()
      const id = modeleEnCours.current
      modeleEnCours.current = null
      setModeleGlisse(false); setDepot(null)
      actions.ajouterModele(s, id, indexDepuis(ev, s))
      return
    }
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
    <div className={`gp-zone${modeles ? ' gp-zone--modeles' : ''}${modeleGlisse ? ' est-glisse-modele' : ''}`}>
      {modeles && (
        <PanneauModeles modeles={modeles} types={types} semaines={semaines} courante={courante}
          glisserModele={(id) => { modeleEnCours.current = id; setModeleGlisse(true) }} finGlisse={() => { modeleEnCours.current = null; setModeleGlisse(false); setDepot(null) }}
          ajouter={actions.ajouterModele} seanceGlissee={enCours} versModele={(de) => { enCours.current = null; setGlisse(null); setDepot(null); actions.versModele(de.s, de.se) }} />
      )}
      {annulable && (
        <p className="gp-annuler" role="status">{annulable.texte}<button type="button" onClick={annuler}>Annuler</button></p>
      )}
      <div className="gp" ref={zone} style={{ gridTemplateColumns: `repeat(${semaines.length}, minmax(252px, 1fr)) minmax(150px, 190px)` }}>
        {semaines.map((w, s) => {
          const nbFaites = w.seances.filter((x) => faite(x.id)).length
          return (
            <section key={w.id} className={`gp-col${depot?.s === s ? ' est-depot' : ''}${s === courante ? ' est-courante' : ''}`} aria-labelledby={`gp-sem-${w.id}`} aria-current={s === courante ? 'date' : undefined}>
              <header className="gp-col__tete">
                <h2 id={`gp-sem-${w.id}`}>Semaine {s + 1}{s === courante && <span className="gp-courante">En cours</span>}</h2>
                <MenuFlottant classe="gp-menu--semaine" libelle={`Actions : semaine ${s + 1}`} titre="Actions de la semaine" bouton={<IconePoints />} aria={`Actions : semaine ${s + 1}`}>
                  {(fermer) => (
                    <>
                      <button type="button" onClick={() => { fermer(); actions.dupliquerSemaine(s) }}>Dupliquer dans la semaine {s + 2}</button>
                      {semaines.length > 1 && !attente && nbFaites === 0 && (
                        <button type="button" className="gp-menu__danger" onClick={() => { fermer(); actions.supprimerSemaine(s) }}>Supprimer la semaine</button>
                      )}
                    </>
                  )}
                </MenuFlottant>
              </header>
              <div className="gp-col__reglages">
                <label className="gp-rpe">RPE visé
                  <input inputMode="decimal" autoComplete="off" value={w.rpe ?? ''} aria-label={`RPE visé de la semaine ${s + 1}`} placeholder="–" onChange={(e) => actions.majSemaine(s, 'rpe', e.target.value)} />
                </label>
                <button type="button" className={`gp-motbtn${(w.mot ?? '').trim() ? ' a-un-mot' : ''}`} aria-expanded={!!mots[w.id]} aria-label="Mot pour le coaché" title="Mot pour le coaché"
                  onClick={() => setMots((m) => ({ ...m, [w.id]: true }))}>
                  {(w.mot ?? '').trim() ? '✎ Mot écrit' : '＋ Mot'}
                </button>
                <span className="sr-only">{w.seances.length} séance{w.seances.length > 1 ? 's' : ''}</span>
              </div>
              {mots[w.id] && (
                <label className="gp-mot">Mot pour le coaché
                  <input autoFocus autoComplete="off" value={w.mot ?? ''} onChange={(e) => actions.majSemaine(s, 'mot', e.target.value)}
                    onBlur={() => setMots((m) => ({ ...m, [w.id]: false }))}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') e.currentTarget.blur() }} />
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
                              supprimer={() => actions.supprimer(s, i, x)} versModele={actions.versModele ? () => actions.versModele(s, i) : undefined} />
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

// Panneau « Modèles de séance » (16 novembre 2026) : à gauche de la grille, on glisse un modèle dans une semaine (ou ＋ pour choisir
// la semaine) ; glisser une séance de la grille sur le panneau l'enregistre comme modèle. Se replie pour laisser la place.
function PanneauModeles({ modeles, types, semaines, courante, glisserModele, finGlisse, ajouter, seanceGlissee, versModele }) {
  const [ouvert, setOuvert] = useState(() => { try { return localStorage.getItem('rima-panneau-modeles') !== 'ferme' } catch { return true } })
  const [recherche, setRecherche] = useState('')
  const [cible, setCible] = useState(false)
  const basculer = () => setOuvert((o) => { try { localStorage.setItem('rima-panneau-modeles', o ? 'ferme' : 'ouvert') } catch { /* rien */ } return !o })
  const simple = (t) => String(t ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const liste = modeles.filter((m) => !recherche.trim() || simple(`${m.nom} ${nomType(m.seance?.type, types)}`).includes(simple(recherche.trim())))
  const accueillir = {
    onDragOver: (ev) => { if (seanceGlissee.current && [...ev.dataTransfer.types].includes(TYPE_SEANCE)) { ev.preventDefault(); ev.dataTransfer.dropEffect = 'copy'; setCible(true) } },
    onDragLeave: (ev) => { if (!ev.currentTarget.contains(ev.relatedTarget)) setCible(false) },
    onDrop: (ev) => { const de = seanceGlissee.current; setCible(false); if (!de) return; ev.preventDefault(); versModele(de) },
  }
  if (!ouvert) {
    return (
      <aside className={`gp-modeles est-ferme${cible ? ' est-cible' : ''}`} aria-label="Modèles de séance" {...accueillir}>
        <button type="button" className="gp-modeles__ouvrir" onClick={basculer} aria-expanded="false" title="Afficher les modèles de séance">
          <span aria-hidden="true">›</span><span className="gp-modeles__vertical">Modèles</span><span className="gp-modeles__nb">{modeles.length}</span>
        </button>
      </aside>
    )
  }
  return (
    <aside className={`gp-modeles${cible ? ' est-cible' : ''}`} aria-labelledby="gp-modeles-titre" {...accueillir}>
      <header className="gp-modeles__tete">
        <h2 id="gp-modeles-titre">Séances types</h2>
        <button type="button" className="gp-modeles__replier" onClick={basculer} aria-expanded="true" aria-label="Replier les modèles" title="Replier">‹</button>
      </header>
      <label className="sr-only" htmlFor="gp-modeles-cherche">Chercher un modèle</label>
      <input id="gp-modeles-cherche" className="gp-modeles__cherche" type="search" autoComplete="off" placeholder="Chercher un modèle…" value={recherche} onChange={(e) => setRecherche(e.target.value)} />
      <p className="gp-modeles__aide"><span>Glissez une séance type dans une semaine</span><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg></p>
      {modeles.length === 0
        ? <p className="gp-modeles__vide">Aucun modèle pour l’instant. Glissez une séance de la grille ici pour en créer un, ou créez-en dans « Modèles ».</p>
        : liste.length === 0 ? <p className="gp-modeles__vide">Aucun modèle ne correspond.</p> : (
          <ul className="gp-modeles__liste">
            {liste.map((m) => {
              const blocs = m.seance?.blocs ?? []
              const exos = blocs.reduce((t, b) => t + (b.elements ?? []).length, 0)
              return (
                <li key={m.id} className="gp-modele" draggable
                  onDragStart={(ev) => { ev.dataTransfer.setData(TYPE_MODELE, m.id); ev.dataTransfer.effectAllowed = 'copy'; glisserModele(m.id) }}
                  onDragEnd={finGlisse}>
                  <span className="gp-modele__poignee" aria-hidden="true"><svg viewBox="0 0 10 16" width="10" height="16" fill="currentColor"><circle cx="2" cy="2" r="1.5" /><circle cx="8" cy="2" r="1.5" /><circle cx="2" cy="8" r="1.5" /><circle cx="8" cy="8" r="1.5" /><circle cx="2" cy="14" r="1.5" /><circle cx="8" cy="14" r="1.5" /></svg></span>
                  <span className="gp-modele__corps">
                    <span className="gp-modele__type">{nomType(m.seance?.type, types)}</span>
                    <span className="gp-modele__nom">{m.nom || 'Modèle sans nom'}</span>
                    <span className="gp-modele__meta">{exos} exercice{exos > 1 ? 's' : ''}{m.seance?.duree ? ` · ${m.seance.duree} min` : ''}</span>
                  </span>
                  <MenuFlottant classe="gp-modele__ajout" classeBouton="gp-modele__plus" libelle={`Ajouter « ${m.nom} » dans une semaine`} titre="Ajouter dans une semaine" bouton="＋" aria="Choisir la semaine">
                    {(fermer) => (
                      <>
                        <p className="gp-menu__titre">Ajouter dans…</p>
                        <div className="gp-menu__semaines">
                          {semaines.map((_, i) => <button key={i} type="button" className={i === courante ? 'est-courante' : undefined} onClick={() => { fermer(); ajouter(i, m.id) }}>S{i + 1}</button>)}
                        </div>
                      </>
                    )}
                  </MenuFlottant>
                </li>
              )
            })}
          </ul>
        )}
      {cible && <p className="gp-modeles__depot" aria-hidden="true">Déposez pour en faire un modèle</p>}
    </aside>
  )
}
