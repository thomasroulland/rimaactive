import MotSemaine from './MotSemaine.jsx'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { ajoutJours, aujourdhuiIso } from '../donnees/calculs.js'
import { avancement, blocsDuClient, dateSeance, seancesDeLaSemaine } from '../donnees/progression.js'
import { dateLongue, statutSeance } from '../donnees/seances.js'
import ApercuSeance from './ApercuSeance.jsx'
import { Chevron, Statut } from './Statut.jsx'
import { CarteEchauffement } from './Echauffement.jsx'

const ETATS = { 'en cours': 'encours', passé: 'passe', 'à venir': 'avenir' }
const ETIQUETTES = { 'en cours': 'En cours', passé: 'Terminé', 'à venir': 'À venir' }

function etatTexte(bloc) {
  if (bloc.etat === 'en cours') return `En cours · semaine ${bloc.semaine} sur ${(bloc.programme.semaines ?? []).length}`
  if (bloc.etat === 'passé') return 'Terminé'
  return 'À venir'
}

function seancesFaitesDe(seances, programmeId) {
  return new Set(
    (seances ?? []).filter((s) => s.statut === 'terminée' && s.programme === programmeId).map((s) => s.seance),
  )
}

// « 9 nov. » au lieu de « Lun. 9 nov. » (pastilles des blocs)
const sansJour = (t) => String(t ?? '').replace(/^[^ ]+\. /, '')

const MOIS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
const jm = (iso) => { const [, m, j] = iso.split('-').map(Number); return { j, m: MOIS[m - 1] } }
// « 16 – 22 nov. » ou « 30 nov. – 6 déc. »
function datesSemaine(debut, n) {
  if (!debut) return ''
  const a = jm(ajoutJours(debut, (n - 1) * 7)), b = jm(ajoutJours(debut, (n - 1) * 7 + 6))
  return a.m === b.m ? `${a.j} – ${b.j} ${b.m}` : `${a.j} ${a.m} – ${b.j} ${b.m}`
}

// « Mon programme » (refait le 19 novembre 2026, maquette validée par Thomas) : les blocs en haut, puis les semaines.
// Ordinateur : toutes les semaines côte à côte. Téléphone : une semaine à la fois, avec des flèches et une rangée de barres
// (comme « Ma semaine » de l'accueil). Un seul état par séance : « À reprendre », « Faite », ou le lieu et l'objectif.
export default function MonProgramme({ programmes, programme, seances }) {
  const aujourdhui = aujourdhuiIso()
  const blocs = useMemo(() => blocsDuClient(programmes, aujourdhui), [programmes, aujourdhui])
  const defaut = Math.max(0, blocs.findIndex((b) => b.programme.id === programme?.id))
  const [choisi, setChoisi] = useState(null)
  const index = choisi !== null && blocs[choisi] ? choisi : defaut
  const bloc = blocs[index]
  const frise = useRef(null)
  // Au chargement, le bloc en cours est amené dans la rangée des blocs (seule la rangée défile, jamais la page)
  useEffect(() => {
    const f = frise.current
    const b = f?.querySelector('[data-bloc-courant]')
    if (f && b) f.scrollLeft = Math.max(0, b.offsetLeft - f.offsetLeft - 2)
  }, [blocs.length, defaut])
  const nbSemaines = (bloc?.programme.semaines ?? []).length
  const faites = useMemo(() => (bloc ? seancesFaitesDe(seances, bloc.programme.id) : new Set()), [seances, bloc])

  return (
    <div className="ec-page ec-prog ec-prog2">
      <div className="ec-prog2__tete">
        {/* juste le titre : les blocs et les semaines disent le reste (Marie, 22 novembre 2026) */}
        <h1 className="ec-h1">Mon programme</h1>
      </div>

      {/* les blocs en haut, sur ordinateur et téléphone (demande de Thomas, 19 novembre 2026) */}
      {blocs.length > 0 && (
        <div className="ec-blocs" ref={frise} role="group" aria-label="Mes blocs">
          {blocs.map((b, i) => (
            <button key={b.programme.id} type="button" className={`ec-blocs__pastille est-${ETATS[b.etat]}`} aria-pressed={i === index}
              data-bloc-courant={i === defaut ? '' : undefined} aria-label={`Bloc ${i + 1}, ${etatTexte(b)}`}
              onClick={() => setChoisi(i)}>
              <span className="ec-blocs__textes"><span>Bloc {i + 1}</span><small>{sansJour(dateSeance(b.debut))} → {sansJour(dateSeance(b.fin))}</small></span>
              <span className="ec-blocs__etat">{ETIQUETTES[b.etat]}</span>
            </button>
          ))}
          {!blocs.some((b) => b.etat === 'à venir') && <span className="ec-blocs__pastille est-prochain" aria-label="Le prochain bloc apparaîtra ici"><span className="ec-blocs__textes"><span>Bloc {blocs.length + 1}</span></span><span className="ec-blocs__etat">À venir</span></span>}
        </div>
      )}

      {bloc?.etat === 'passé' && <Bilan bloc={bloc} numero={index + 1} faites={faites} />}

      {bloc && <CarteEchauffement programme={bloc.programme} />}
      {bloc && nbSemaines > 0 && <Semaines key={bloc.programme.id} bloc={bloc} nb={nbSemaines} faites={faites} seances={seances} />}
    </div>
  )
}

function Semaines({ bloc, nb, faites, seances }) {
  const courante = bloc.etat === 'en cours' ? bloc.semaine : 0
  const [vue, setVue] = useState(() => (courante || (bloc.etat === 'passé' ? nb : 1)))
  const [sens, setSens] = useState(0)
  const aller = (n) => { if (n < 1 || n > nb || n === vue) return; setSens(n > vue ? 1 : -1); setVue(n) }
  const avant = aujourdhuiIso() < bloc.programme.debut // programme pas commencé : aperçu au lieu d'ouvrir la séance
  const [apercu, setApercu] = useState(null)
  return (
    <section className="ec-semgrille" aria-label="Mes semaines">
      {Array.from({ length: nb }, (_, k) => k + 1).map((n) => {
        const lignes = seancesDeLaSemaine(bloc.programme, n, faites)
        return (
          <article key={n} className={`ec-semc${n === courante ? ' est-courante' : ''}${n === vue ? ' est-vue' : ''}${n === vue && sens > 0 ? ' vient-droite' : n === vue && sens < 0 ? ' vient-gauche' : ''}`}
            aria-labelledby={`semc-${n}`} aria-current={n === courante ? 'date' : undefined}>
            <div className="ec-semc__tete">
              <div className="ec-semc__titres">
                <h2 id={`semc-${n}`} className="ec-semc__titre">Semaine {n} <span>sur {nb}</span>{n === courante && <em className="ec-semc__badge">Cette semaine</em>}</h2>
                {/* seulement les dates (Marie, 26 novembre 2026) : plus de « 3 séances » ni « 2 faites sur 3 » */}
                <p className="ec-semc__infos">{datesSemaine(bloc.debut, n)}</p>
              </div>
              {nb > 1 && (
                <div className="ec-semc__nav" role="group" aria-label="Changer de semaine">
                  <button type="button" className="ec-semaine__fleche" onClick={() => aller(n - 1)} disabled={n <= 1} aria-label="Semaine précédente">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m15 6-6 6 6 6" /></svg>
                  </button>
                  <button type="button" className="ec-semaine__fleche" onClick={() => aller(n + 1)} disabled={n >= nb} aria-label="Semaine suivante">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6" /></svg>
                  </button>
                </div>
              )}
            </div>
            {nb > 1 && (
              <div className="ec-semaine__points ec-semc__points" aria-hidden="true">
                {Array.from({ length: nb }, (_, i) => (
                  <button key={i} type="button" tabIndex={-1} className={`ec-semaine__point${i + 1 === n ? ' est-vue' : ''}${i + 1 === courante ? ' est-moi' : ''}${(courante ? i + 1 < courante : bloc.etat === 'passé') ? ' est-passee' : ''}`} onClick={() => aller(i + 1)} />
                ))}
              </div>
            )}
            <MotSemaine semaine={bloc.programme.semaines[n - 1]} />
            {lignes.length === 0
              ? <p className="ec-semaine__vide">Pas de séance cette semaine.</p>
              : (
                // même liste que « Ma semaine » du tableau de bord (Marie, 26 novembre 2026) : case cochée, « Séance 1 », titre, « Faite »
                <ul className="ec-semaine__liste ec-semc__liste2">
                  {lignes.map((x) => {
                    const statut = statutSeance(seances, bloc.programme.id, x.seance.id)
                    const classe = statut === 'Faite' ? 'cochee' : statut === 'En cours' ? 'encours' : ''
                    return (
                      <li key={x.seance.id}>
                        <Link className="ec-ligne" to={`/espace/seance/${bloc.programme.id}/${x.seance.id}`} state={{ depuis: 'programme' }}
                          onClick={avant && statut === 'À faire' ? (e) => { e.preventDefault(); setApercu(x) } : undefined}
                          aria-haspopup={avant && statut === 'À faire' ? 'dialog' : undefined}>
                          <span className={`ec-case-regul ${classe}`.trim()} aria-hidden="true" />
                          <span className="ec-ligne__corps">
                            <span className="ec-ligne__titre">Séance {x.numero}</span>
                            {x.seance.titre && <span className="ec-ligne__meta">{x.seance.titre}</span>}
                          </span>
                          {statut !== 'À faire' && <Statut statut={statut === 'En cours' ? 'À reprendre' : statut} />}
                          <Chevron />
                        </Link>
                      </li>
                    )
                  })}
                </ul>
              )}
          </article>
        )
      })}
      {apercu && <ApercuSeance seance={apercu.seance} numero={apercu.numero} debut={bloc.programme.debut} fermer={() => setApercu(null)} />}
    </section>
  )
}

function Bilan({ bloc, numero, faites }) {
  const { faites: nb, prevues } = avancement(bloc.programme, faites)
  return (
    <section className="ec-bilan" aria-label="Bilan du bloc">
      <p className="ec-surtitre">Bloc {numero} · terminé</p>
      {bloc.programme.nom && <h2 className="ec-bilan__titre">{bloc.programme.nom}</h2>}
      <p className="ec-texte">Du {dateLongue(bloc.debut).toLowerCase()} au {dateLongue(bloc.fin).toLowerCase()}</p>
      <p className="ec-texte"><strong>{nb} {nb > 1 ? 'séances faites' : 'séance faite'} sur {prevues}</strong></p>
      <p className="ec-petit">Le détail de vos séances faites est dans votre tableau de bord, partie « Ma progression ».</p>
    </section>
  )
}
