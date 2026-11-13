import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { aujourdhuiIso } from '../donnees/calculs.js'
import { avancement, blocsDuClient, dateSeance, seancesDeLaSemaine } from '../donnees/progression.js'
import { dateLongue, statutSeance } from '../donnees/seances.js'
import { Statut } from './Statut.jsx'

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

// « Mon programme » : blocs (en cours, terminés, à venir), puis les semaines du bloc choisi et leurs séances.
export default function MonProgramme({ profil, programmes, programme, seances }) {
  const aujourdhui = aujourdhuiIso()
  const blocs = useMemo(() => blocsDuClient(programmes, aujourdhui), [programmes, aujourdhui])
  const defaut = Math.max(0, blocs.findIndex((b) => b.programme.id === programme?.id))
  const [choisi, setChoisi] = useState(null)
  const [semaineChoisie, setSemaineChoisie] = useState(null)
  const index = choisi !== null && blocs[choisi] ? choisi : defaut
  const bloc = blocs[index]
  const frise = useRef(null)
  // Au chargement, le bloc en cours est amené dans la frise (on ne fait défiler que la frise, jamais la page).
  useEffect(() => {
    const f = frise.current
    const b = f?.querySelector('[data-bloc-courant]')
    if (f && b) f.scrollLeft = Math.max(0, b.offsetLeft - f.offsetLeft - 2)
  }, [blocs.length, defaut])
  const nom = [profil?.prenom, profil?.nom].filter(Boolean).join(' ')

  const choisirBloc = (i) => { setChoisi(i); setSemaineChoisie(null) }
  const nbSemaines = (bloc?.programme.semaines ?? []).length
  const semaine = Math.min(semaineChoisie ?? (bloc?.etat === 'en cours' ? bloc.semaine : 1), Math.max(1, nbSemaines))
  const faites = useMemo(() => (bloc ? seancesFaitesDe(seances, bloc.programme.id) : new Set()), [seances, bloc])
  const lignes = bloc ? seancesDeLaSemaine(bloc.programme, semaine, faites) : []
  const aVenir = blocs.some((b) => b.etat === 'à venir')

  return (
    <div className="ec-page ec-prog">
      <div className="ec-prog__tete">
        {nom && <p className="ec-surtitre">{nom}</p>}
        <h1 className="ec-h1">Mon programme</h1>
      </div>

      <section className="ec-prog__rubrique" aria-labelledby="titre-blocs">
        <h2 id="titre-blocs" className="ec-h2">Mes blocs</h2>
        <div className="ec-frise" ref={frise} role="group" aria-label={`Mes blocs de ${nbSemaines || 4} semaines`}>
          {blocs.map((b, i) => (
            <button
              key={b.programme.id}
              type="button"
              className={`ec-etape ${ETATS[b.etat]}`}
              aria-pressed={i === index}
              data-bloc-courant={i === defaut ? '' : undefined}
              aria-label={`Bloc ${i + 1}, ${etatTexte(b)}`}
              onClick={() => choisirBloc(i)}
            >
              <span className="ec-etape__tete">
                <span className="ec-etape__nom">Bloc {i + 1}</span>
                <span className={`ec-etat ec-etat--${ETATS[b.etat]}`}>{ETIQUETTES[b.etat]}</span>
              </span>
              <span className="ec-etape__dates">{dateSeance(b.debut)} → {dateSeance(b.fin)}</span>
              <Semaines bloc={b} />
            </button>
          ))}
          {!aVenir && <p className="ec-etape-vide">Votre prochain bloc apparaîtra ici.</p>}
        </div>
      </section>

      {bloc?.etat === 'passé' && <Bilan bloc={bloc} numero={index + 1} faites={faites} />}

      {bloc && nbSemaines > 0 && (
        <section className="ec-prog__rubrique" aria-labelledby="titre-semaines">
          <h2 id="titre-semaines" className="ec-h2">Mes semaines</h2>
          <div className="ec-pastilles" role="group" aria-label="Choisir une semaine">
            {Array.from({ length: nbSemaines }, (_, k) => k + 1).map((n) => (
              <button
                key={n}
                type="button"
                className={`ec-pastille${bloc.etat === 'en cours' && n === bloc.semaine ? ' encours' : ''}`}
                aria-pressed={n === semaine}
                aria-label={`Semaine ${n}${bloc.etat === 'en cours' && n === bloc.semaine ? ', en cours' : ''}`}
                onClick={() => setSemaineChoisie(n)}
              >
                S{n}
              </button>
            ))}
          </div>
          <ul className="ec-prog__seances">
            {lignes.map((x) => {
              const statut = statutSeance(seances, bloc.programme.id, x.seance.id)
              const meta = [x.seance.lieu, x.seance.objectif].filter(Boolean).join(' · ')
              return (
                <li key={x.seance.id}>
                  <Link
                    className="ec-pcarte"
                    to={`/espace/seance/${bloc.programme.id}/${x.seance.id}`}
                    state={{ depuis: 'programme' }}
                    aria-label={`Séance ${x.numero}, ${x.seance.titre || 'sans titre'}, ${statut}`}
                  >
                    <span className="ec-pcarte__numero" aria-hidden="true">{String(x.numero).padStart(2, '0')}</span>
                    <span className="ec-pcarte__corps">
                      <span className="ec-pcarte__titre">{x.seance.titre || `Séance ${x.numero}`}</span>
                      {x.seance.titre && <span className="ec-pcarte__num">Séance {x.numero}</span>}
                      {meta && <span className="ec-pcarte__meta">{meta}</span>}
                      <span className="ec-pcarte__bas"><Statut statut={statut} /></span>
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      )}
    </div>
  )
}

// Fine frise des semaines du bloc : faites (ou passées) en encre, à venir en craie foncé.
function Semaines({ bloc }) {
  const n = (bloc.programme.semaines ?? []).length
  if (n === 0) return null
  const pleines = bloc.etat === 'passé' ? n : bloc.etat === 'en cours' ? bloc.semaine : 0
  const texte = bloc.etat === 'en cours' ? `Semaine ${bloc.semaine} sur ${n}` : `${n} semaine${n > 1 ? 's' : ''}`
  return (
    <span className="ec-etape__semaines">
      <span className="ec-etape__barres" aria-hidden="true">
        {Array.from({ length: n }, (_, k) => <span key={k} className={k < pleines ? 'pleine' : undefined} />)}
      </span>
      <span className="ec-etape__texte">{texte}</span>
    </span>
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
