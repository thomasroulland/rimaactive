import { Link } from 'react-router-dom'
import { seDeconnecter } from '../firebase.js'
import { etatAccueil, listeSeances, regularite, semaineCourante, aujourdhuiIso } from '../donnees/calculs.js'
import { dateLongue, statutSeance } from '../donnees/seances.js'
import Picto from '../../components/Picto.jsx'
import LigneSeance from './LigneSeance.jsx'

// Accueil du client : selon etatAccueil, la prochaine séance, « Ma semaine » et « Ma régularité ».
export default function Accueil({ prenom, programme, seances, faites }) {
  const aujourdhui = aujourdhuiIso()
  const etat = etatAccueil(programme, faites, aujourdhui)
  const liste = listeSeances(programme)
  const nbSemaines = programme?.semaines?.length ?? 0
  const semaine = programme ? semaineCourante(programme.debut, aujourdhui, nbSemaines) : 0

  return (
    <section className="client-page">
      <div className="client-pile">
        <p className="espace-texte">{prenom ? `Bonjour ${prenom},` : 'Bonjour,'}</p>
        {etat.type === 'aucun' && (
          <>
            <h1 className="client-titre">Votre programme arrive bientôt.</h1>
            <p className="espace-texte">Marie le prépare pour vous.</p>
          </>
        )}
        {etat.type === 'bientot' && (
          <>
            <h1 className="client-titre">Votre programme commence le {dateLongue(etat.debut)}.</h1>
            <p className="espace-texte">Vous pouvez déjà découvrir vos séances.</p>
            <Link className="bouton bouton--secondaire client-bouton-gauche" to="/espace/programme">Voir mon programme</Link>
          </>
        )}
        {etat.type === 'termine' && (
          <>
            <h1 className="client-titre">Programme terminé. Bravo !</h1>
            <p className="espace-texte">Marie vous propose bientôt la suite.</p>
          </>
        )}
        {etat.type === 'prochaine' && (
          <h1 className="client-titre">
            Séance {liste.findIndex((x) => x.seance.id === etat.seance.id) + 1} sur {liste.length}
          </h1>
        )}
      </div>

      {etat.type === 'prochaine' && (
        <Prochaine programmeId={programme.id} etat={etat} statut={statutSeance(seances, programme.id, etat.seance.id)} />
      )}

      {etat.type === 'prochaine' && semaine > 0 && (
        <MaSemaine programme={programme} semaine={semaine} liste={liste} seances={seances} />
      )}

      {(etat.type === 'prochaine' || etat.type === 'termine') && (
        <MaRegularite programme={programme} faites={faites} jusqua={etat.type === 'termine' ? nbSemaines : semaine} />
      )}

      <button type="button" className="espace-lien client-sortie" onClick={seDeconnecter}>Se déconnecter</button>
    </section>
  )
}

function Prochaine({ programmeId, etat, statut }) {
  const { seance } = etat
  const infos = [
    seance.lieu && { picto: 'map-pin', texte: seance.lieu },
    seance.duree && { picto: 'clock', texte: seance.duree },
    seance.objectif && { picto: 'check-square', texte: seance.objectif },
  ].filter(Boolean)
  return (
    <article className="client-prochaine" aria-labelledby="titre-prochaine">
      <p className="surtitre">Semaine {etat.semaine} · {dateLongue(etat.date)}</p>
      <h2 id="titre-prochaine" className="client-prochaine__titre">{seance.titre || 'Ma prochaine séance'}</h2>
      {infos.length > 0 && (
        <ul className="client-infos client-infos--clair">
          {infos.map((i) => <li key={i.picto}><Picto nom={i.picto} taille={20} />{i.texte}</li>)}
        </ul>
      )}
      <Link className="bouton bouton--principal client-bouton-gauche" to={`/espace/seance/${programmeId}/${seance.id}`}>
        {statut === 'En cours' ? 'Reprendre ma séance' : 'Ouvrir ma séance'}
      </Link>
    </article>
  )
}

function MaSemaine({ programme, semaine, liste, seances }) {
  const sem = programme.semaines[semaine - 1]
  const items = liste.filter((x) => x.semaine === semaine)
  return (
    <section className="client-pile" aria-labelledby="titre-ma-semaine">
      <h2 id="titre-ma-semaine" className="client-sous-titre">Ma semaine</h2>
      {sem?.mot && (
        <figure className="client-mot">
          <blockquote className="client-mot__texte">{sem.mot}</blockquote>
          <figcaption className="client-mot__auteur">Le mot de Marie{sem.rpe ? ` · RPE visé ${sem.rpe}` : ''}</figcaption>
        </figure>
      )}
      {items.length === 0
        ? <p className="espace-texte">Pas de séance prévue cette semaine.</p>
        : (
          <ul className="client-liste">
            {items.map((x) => (
              <LigneSeance key={x.seance.id} programmeId={programme.id} item={x} numero={liste.indexOf(x) + 1}
                statut={statutSeance(seances, programme.id, x.seance.id)} />
            ))}
          </ul>
        )}
    </section>
  )
}

function MaRegularite({ programme, faites, jusqua }) {
  const lignes = regularite(programme, faites).slice(0, Math.max(jusqua, 1))
  return (
    <section className="client-pile" aria-labelledby="titre-regularite">
      <h2 id="titre-regularite" className="client-sous-titre">Ma régularité</h2>
      <ul className="client-regularite">
        {lignes.map((g) => (
          <li key={g.semaine}>
            <span className="client-regularite__semaine">Semaine {g.semaine}</span>
            <span className="client-regularite__cases" aria-hidden="true">
              {Array.from({ length: g.prevues }, (_, i) => (
                <span key={i} className={i < g.faites ? 'client-case client-case--faite' : 'client-case'} />
              ))}
            </span>
            <span className="client-regularite__texte">
              {g.faites} {g.faites > 1 ? 'séances faites' : 'séance faite'} sur {g.prevues}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
