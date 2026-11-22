import { useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { etatAccueil, aujourdhuiIso, jourCourt } from '../donnees/calculs.js'
import { semaineDe, phraseDuJour, numeroDansSemaine } from '../donnees/progression.js'
import { statutSeance } from '../donnees/seances.js'
import Avatar from './Avatar.jsx'
import CetteSemaine from './CetteSemaine.jsx'
import Nouveautes from './Nouveautes.jsx'
import CarteNotifications from './CarteNotifications.jsx'
import CarteInstallation from './CarteInstallation.jsx'
import { CarteEchauffement } from './Echauffement.jsx'


// Tableau de bord du coaché : avatar, bonjour, avancement, carte noire, puis « Cette semaine ».
// « Ma progression » a sa propre page (barre du haut, 13 novembre 2026).
export default function TableauDeBord({ uid, profil, programme, programmes, faites, seances }) {
  const [params] = useSearchParams()
  const [erreurAvatar, setErreurAvatar] = useState('')
  const aujourdhui = aujourdhuiIso()
  const etat = etatAccueil(programme, faites, aujourdhui)
  const semaine = programme ? semaineDe(programme, aujourdhui) : 0
  const prenom = profil?.prenom
  const phrase = phraseDuJour(new Date())
  if (params.get('onglet') === 'progression') return <Navigate to="/espace/progression" replace />

  return (
    <div className="ec-page ec-tdb">
      <div className="ec-tdb__tete">
        <div className="ec-tdb__qui">
          <Avatar uid={uid} profil={profil} onErreur={setErreurAvatar} />
          {/* « Bonjour Marie, » et une petite phrase du jour (Marie, 22 novembre 2026) */}
          <div className="ec-tdb__texte">
            <h1 className="ec-tdb__bonjour">Bonjour{prenom ? ` ${prenom}` : ''},</h1>
            <p className="ec-tdb__phrase">{phrase}</p>
          </div>
        </div>
        {erreurAvatar && <p className="ec-erreur" role="alert">{erreurAvatar}</p>}
      </div>

      <CarteNoire etat={etat} programme={programme} semaine={semaine} statut={etat.type === 'prochaine' ? statutSeance(seances, programme.id, etat.seance.id) : null} />

      <CarteEchauffement programme={programme} />
      <CarteNotifications uid={uid} />

      <Duo>
        {programme && etat.type !== 'aucun' && <CetteSemaine programme={programme} semaine={semaine} faites={faites} seances={seances} commence={etat.type !== 'bientot'} />}
        <Nouveautes uid={uid} programmes={programmes} seances={seances} />
      </Duo>

      {/* « Installer l'application » toujours en dernier (Marie, 22 novembre 2026) */}
      <CarteInstallation />
    </div>
  )
}

// Encart noir (maquette du 22 novembre 2026) : 1 à 2 lignes, le bouton à droite. Six cas selon l'avancement.
function CarteNoire({ etat, programme, semaine, statut }) {
  let surtitre, titre, sous = '', lien = null, bouton = ''
  if (etat.type === 'prochaine') {
    const { seance } = etat
    const numero = numeroDansSemaine(programme, seance.id)
    const nom = seance.titre || `Séance ${numero}`
    lien = `/espace/seance/${programme.id}/${seance.id}`
    titre = nom
    sous = seance.lieu || '' // seulement le lieu (Marie, 22 novembre 2026)
    if (statut === 'En cours') { surtitre = 'Séance en cours'; bouton = 'Reprendre' }
    // semaine finie : on annonce la suivante, sans flèche (il n'y a rien à ouvrir pour l'instant)
    else if (etat.semaine > semaine) { surtitre = 'Semaine terminée 🎉'; titre = 'Prochaine séance'; sous = `Séance ${numero} · ${nom}`; lien = null }
    else { surtitre = `Semaine ${etat.semaine} · séance ${numero}`; bouton = 'Ouvrir' }
  } else if (etat.type === 'bientot') {
    surtitre = 'Votre programme'; titre = `Commence ${jourCourt(etat.debut)}`; sous = 'Hâte de commencer\u00a0?'
  } else if (etat.type === 'termine') {
    surtitre = 'Programme terminé 👏🏼'; titre = 'Félicitations\u00a0!'; sous = 'Marie prépare la suite'
  } else {
    surtitre = 'Votre programme'; titre = 'Arrive bientôt'; sous = 'Marie le prépare pour toi'
  }
  return (
    <article className="ec-noire ec-noire2" aria-labelledby="titre-prochaine">
      <div className="ec-noire2__textes">
        <p className="ec-noire2__surtitre">{surtitre}</p>
        <h2 id="titre-prochaine" className="ec-noire2__titre">{titre}</h2>
        {sous && <p className="ec-noire2__sous">{sous}</p>}
      </div>
      {lien && (bouton
        ? <Link className="ec-bouton ec-noire2__bouton" to={lien}>{bouton}<Fleche /></Link>
        : <Link className="ec-noire2__rond" to={lien} aria-label="Voir la prochaine séance"><Fleche /></Link>)}
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


// « Ma semaine » et « Du nouveau » côte à côte sur ordinateur (seulement s'il y a des nouveautés : voir coache.css)
function Duo({ children }) {
  return <div className="ec-tdb__duo">{children}</div>
}
