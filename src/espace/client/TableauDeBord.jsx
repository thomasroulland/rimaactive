import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { etatAccueil, aujourdhuiIso } from '../donnees/calculs.js'
import { avancement, semaineDe, bonjour } from '../donnees/progression.js'
import { dateLongue, statutSeance } from '../donnees/seances.js'
import Avatar from './Avatar.jsx'
import CetteSemaine from './CetteSemaine.jsx'
import MaProgression from './MaProgression.jsx'

const PICTO_LIEU = 'M128,66a38,38,0,1,0,38,38A38,38,0,0,0,128,66Zm0,64a26,26,0,1,1,26-26A26,26,0,0,1,128,130Zm0-112a86.1,86.1,0,0,0-86,86c0,30.91,14.34,63.74,41.47,94.94a252.32,252.32,0,0,0,41.09,38,6,6,0,0,0,6.88,0,252.32,252.32,0,0,0,41.09-38c27.13-31.2,41.47-64,41.47-94.94A86.1,86.1,0,0,0,128,18Zm0,206.51C113,212.93,54,163.62,54,104a74,74,0,0,1,148,0C202,163.62,143,212.93,128,224.51Z'
const PICTO_OBJECTIF = 'M172.24,99.76a6,6,0,0,1,0,8.48l-56,56a6,6,0,0,1-8.48,0l-24-24a6,6,0,0,1,8.48-8.48L112,151.51l51.76-51.75A6,6,0,0,1,172.24,99.76ZM222,48V208a14,14,0,0,1-14,14H48a14,14,0,0,1-14-14V48A14,14,0,0,1,48,34H208A14,14,0,0,1,222,48Zm-12,0a2,2,0,0,0-2-2H48a2,2,0,0,0-2,2V208a2,2,0,0,0,2,2H208a2,2,0,0,0,2-2Z'

const ONGLETS = [{ id: 'semaine', nom: 'Cette semaine' }, { id: 'progression', nom: 'Ma progression' }]

// Tableau de bord du coaché : avatar, bonjour, avancement, carte noire, onglets « Cette semaine » / « Ma progression ».
export default function TableauDeBord({ uid, profil, programme, programmes, faites, seances }) {
  const [params, setParams] = useSearchParams()
  const onglet = params.get('onglet') === 'progression' ? 'progression' : 'semaine'
  const [erreurAvatar, setErreurAvatar] = useState('')
  const aujourdhui = aujourdhuiIso()
  const etat = etatAccueil(programme, faites, aujourdhui)
  const av = programme ? avancement(programme, faites) : { faites: 0, prevues: 0, numero: 0 }
  const semaine = programme ? semaineDe(programme, aujourdhui) : 0
  const prenom = profil?.prenom
  const salut = prenom ? bonjour(prenom, new Date()) : 'Bonjour,'
  const choisir = (id) => setParams(id === 'semaine' ? {} : { onglet: id }, { replace: true })

  return (
    <div className="ec-page ec-tdb">
      <div className="ec-tdb__tete">
        <div className="ec-tdb__qui">
          <Avatar uid={uid} profil={profil} onErreur={setErreurAvatar} />
          <div className="ec-tdb__texte">
            <p className="ec-texte ec-gris">{salut}</p>
            {etat.type === 'prochaine' && <h1 className="ec-h1">Séance {av.numero} sur {av.prevues}</h1>}
          </div>
        </div>
        {erreurAvatar && <p className="ec-erreur" role="alert">{erreurAvatar}</p>}
        {av.prevues > 0 && (
          <div className="ec-progres" role="progressbar" aria-label="Séances faites" aria-valuemin={0} aria-valuemax={av.prevues} aria-valuenow={av.faites}>
            <div className="ec-progres__plein" style={{ width: `${Math.round((av.faites / av.prevues) * 100)}%` }} />
          </div>
        )}
      </div>

      <CarteNoire etat={etat} programme={programme} statut={etat.type === 'prochaine' ? statutSeance(seances, programme.id, etat.seance.id) : null} numero={av.numero} />

      <div className="ec-parties" role="group" aria-label="Partie du tableau de bord">
        {ONGLETS.map((o) => (
          <button key={o.id} type="button" className="ec-partie" aria-pressed={onglet === o.id} onClick={() => choisir(o.id)}>{o.nom}</button>
        ))}
      </div>

      {onglet === 'semaine'
        ? (programme && etat.type !== 'aucun' && <CetteSemaine programme={programme} semaine={semaine} faites={faites} seances={seances} />)
        : <MaProgression uid={uid} programme={programme} programmes={programmes} faites={faites} seances={seances} />}
    </div>
  )
}

function CarteNoire({ etat, programme, statut, numero }) {
  if (etat.type === 'prochaine') {
    const { seance } = etat
    return (
      <article className="ec-noire" aria-labelledby="titre-prochaine">
        <p className="ec-surtitre ec-noire__surtitre">Séance {numero}</p>
        <div className="ec-noire__ligne">
          <h2 id="titre-prochaine" className="ec-noire__titre">{seance.titre || 'Ma prochaine séance'}</h2>
          <Link className="ec-bouton" to={`/espace/seance/${programme.id}/${seance.id}`}>
            {statut === 'En cours' ? 'Reprendre ma séance' : 'Ouvrir ma séance'}
            <Fleche />
          </Link>
        </div>
        {(seance.lieu || seance.objectif) && (
          <ul className="ec-noire__infos">
            {seance.lieu && <li><Pictogramme d={PICTO_LIEU} />{seance.lieu}</li>}
            {seance.objectif && <li><Pictogramme d={PICTO_OBJECTIF} />{seance.objectif}</li>}
          </ul>
        )}
      </article>
    )
  }
  return (
    <article className="ec-noire" aria-labelledby="titre-prochaine">
      {etat.type === 'aucun' && (
        <>
          <h1 id="titre-prochaine" className="ec-noire__titre">Votre programme arrive bientôt.</h1>
          <p className="ec-texte">Marie le prépare pour vous.</p>
        </>
      )}
      {etat.type === 'bientot' && (
        <>
          <h1 id="titre-prochaine" className="ec-noire__titre">Votre programme commence le {dateLongue(etat.debut)}.</h1>
          <p className="ec-texte">Vous pouvez déjà découvrir vos séances.</p>
          <Link className="ec-bouton ec-noire__seul" to="/espace/programme">Voir mon programme<Fleche /></Link>
        </>
      )}
      {etat.type === 'termine' && (
        <>
          <h1 id="titre-prochaine" className="ec-noire__titre">Programme terminé. Bravo !</h1>
          <p className="ec-texte">Marie vous propose bientôt la suite.</p>
        </>
      )}
    </article>
  )
}

function Fleche() {
  return (
    <span className="ec-bouton__fleche" aria-hidden="true">
      <svg width="12" height="12" viewBox="0 0 256 256" fill="none" stroke="currentColor" strokeWidth="28" strokeLinecap="round" strokeLinejoin="round"><path d="M72 184L184 72M88 72h96v96" /></svg>
    </span>
  )
}

function Pictogramme({ d }) {
  return <svg width="20" height="20" aria-hidden="true" viewBox="0 0 256 256" fill="currentColor"><path d={d} /></svg>
}
