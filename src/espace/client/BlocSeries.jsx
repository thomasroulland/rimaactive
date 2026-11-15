import PhotoStockee from '../coach/PhotoStockee.jsx'
import { avecChargeSeule, fr, lignesExercice, resumeFormat } from '../donnees/seances.js'
import BlocResultat, { ChoixRpe } from './BlocResultat.jsx'

const Image = () => (
  <svg width="22" height="22" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="32" y="56" width="192" height="152" rx="12" /><circle cx="96" cy="112" r="16" /><path d="M32 176l56-56 104 88M152 144l32-32 40 40" />
  </svg>
)

// Un bloc de la séance : « Bloc A » ou « Bloc C · EMOM 10 min », ses exercices, puis « Mon résultat » (autres formats).
// `saisie` : lignes de séries, notes et résultat du bloc ; `actions` : fonctions de saisie (absentes en lecture seule).
export default function BlocSeries({ bloc, saisie, actions, lecture, voirConsignes }) {
  const enSeries = (bloc.format ?? 'series') === 'series'
  const resultat = saisie.blocs[bloc.id]
  return (
    <section className="ec-sbloc" aria-labelledby={`bloc-${bloc.id}`}>
      <div className="ec-sbloc__tete">
        <h2 id={`bloc-${bloc.id}`} className="ec-h3 ec-sbloc__titre">Bloc {bloc.lettre}{enSeries ? '' : ` · ${resumeFormat(bloc)}`}</h2>
        {!enSeries && resultat?.fait && <span className="ec-valide">Validé</span>}
      </div>
      <ol className="ec-sexos">
        {(bloc.elements ?? []).map((el, i) => (
          <Exercice key={el.id} element={el} code={`${bloc.lettre}${i + 1}`} bloc={bloc} enSeries={enSeries}
            lignes={saisie.lignes(el)} note={saisie.notes[el.id] ?? ''} lecture={lecture} actions={actions}
            voirConsignes={() => voirConsignes(el)} />
        ))}
      </ol>
      {!enSeries && (
        <BlocResultat bloc={bloc} resultat={resultat} lecture={lecture} changer={(cle, v) => actions?.bloc(bloc.id, cle, v)} />
      )}
    </section>
  )
}

function Exercice({ element, code, bloc, enSeries, lignes, note, lecture, actions, voirConsignes }) {
  const { prescription, details } = lignesExercice(element, enSeries)
  const base = `ex-${element.id}`
  const complet = enSeries && lignes.length > 0 && lignes.every((l) => l.fait)
  const chargeSeule = !enSeries && avecChargeSeule(bloc, element)
  return (
    <li className="ec-sexo" aria-labelledby={`${base}-nom`}>
      <div className="ec-sexo__tete">
        <div className="ec-sexo__texte">
          <p className="ec-sexo__code" aria-hidden="true">{code}{complet && <span className="ec-valide">Validé</span>}</p>
          <h3 id={`${base}-nom`} className="ec-sexo__nom"><span className="ec-invisible">{code} : </span>{element.nom}</h3>
          {prescription && <p className="ec-sexo__prescription">{prescription}</p>}
          {details && <p className="ec-petit">{details}</p>}
          {element.commentaire && <p className="ec-petit">{element.commentaire}</p>}
        </div>
        <button type="button" className="ec-fiche-bouton" onClick={voirConsignes} aria-label={`Voir les photos et consignes : ${element.nom}`}>
          <span className="ec-fiche-bouton__img">
            {element.photos?.[0] ? <PhotoStockee chemin={element.photos[0]} alt="" classe="ec-fiche-bouton__photo" /> : <Image />}
          </span>
          <span className="ec-fiche-bouton__txt">Consignes</span>
        </button>
      </div>

      {enSeries && (
        <TableauSeries base={base} nom={element.nom} element={element} lignes={lignes} lecture={lecture}
          changer={(i, cle, v) => actions?.serie(element, i, cle, v)}>
          <div>
            <label className="ec-etiquette" htmlFor={`${base}-note`}>Note</label>
            <input id={`${base}-note`} className="ec-champ" type="text" autoComplete="off" value={note} readOnly={lecture}
              placeholder={lecture ? '' : 'Ex. dernière rep difficile'} onChange={(e) => actions?.note(element.id, e.target.value)} />
          </div>
        </TableauSeries>
      )}

      {chargeSeule && (
        <div className="ec-sexo__charge">
          <label className="ec-etiquette" htmlFor={`${base}-charge`}>Charge (kg)</label>
          <input id={`${base}-charge`} className="ec-champ ec-champ--serre" type="text" inputMode="decimal" autoComplete="off"
            value={lignes[0]?.charge ?? ''} placeholder={fr(element.charge ?? '')} readOnly={lecture}
            onChange={(e) => actions?.chargeSeule(element.id, e.target.value)} />
        </div>
      )}
    </li>
  )
}

// Tableau Série / Reps / Charge (kg) / RPE / Fait, puis ce qui suit (la note)
export function TableauSeries({ base, nom, element, lignes, lecture, changer, children }) {
  const prevu = { reps: String(element?.reps ?? ''), charge: fr(element?.charge ?? '') }
  return (
    <div className="ec-series">
      <div className="ec-serie ec-serie--entete" aria-hidden="true">
        <span>Série</span><span>Reps</span><span>Charge (kg)</span><span>RPE</span><span>Fait</span>
      </div>
      {lignes.map((l, i) => {
        const lib = `${nom}, série ${i + 1}`
        const id = `${base}-s${i}`
        return (
          <div key={i} className="ec-serie" role="group" aria-label={lib}>
            <span className="ec-serie__num">{i + 1}</span>
            <input id={`${id}-reps`} className="ec-champ ec-champ--serre" type="text" inputMode="numeric" autoComplete="off"
              aria-label={`${lib}, répétitions`} value={l.reps ?? ''} placeholder={lecture ? '' : prevu.reps} readOnly={lecture}
              onChange={(e) => changer(i, 'reps', e.target.value)} />
            <input id={`${id}-charge`} className="ec-champ ec-champ--serre" type="text" inputMode="decimal" autoComplete="off"
              aria-label={`${lib}, charge en kg`} value={l.charge ?? ''} placeholder={lecture ? '' : prevu.charge} readOnly={lecture}
              onChange={(e) => changer(i, 'charge', e.target.value)} />
            <ChoixRpe id={`${id}-rpe`} libelle={`${lib}, RPE`} valeur={l.rpe} lecture={lecture} changer={(v) => changer(i, 'rpe', v)} />
            <input id={`${id}-fait`} type="checkbox" className="ec-case-fait" aria-label={`${lib}, faite`} checked={!!l.fait}
              disabled={lecture} onChange={(e) => changer(i, 'fait', e.target.checked)} />
          </div>
        )
      })}
      {children}
    </div>
  )
}
