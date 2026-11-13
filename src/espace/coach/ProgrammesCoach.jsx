import { Link } from 'react-router-dom'
import { ajoutJours, aujourdhuiIso, dateLongue } from '../donnees/calculs.js'
import { useDonneesCoach } from './donneesCoach.js'

// Page « Programmes » (maquette PDF, 13 novembre 2026) : tous les programmes, coaché par coaché.
export default function ProgrammesCoach() {
  const { clients, programmes, erreur } = useDonneesCoach()
  const aujourdhui = aujourdhuiIso()
  const etat = (p) => {
    const fin = ajoutJours(p.debut, (p.semaines?.length ?? 0) * 7 - 1)
    if (p.statut !== 'publié') return ['Brouillon', 'autre']
    if (aujourdhui < p.debut) return ['À venir', 'autre']
    if (aujourdhui > fin) return ['Terminé', 'autre']
    return ['En cours', 'actif']
  }
  const groupes = (clients ?? [])
    .map((c) => ({ c, liste: (programmes ?? []).filter((p) => p.client === c.uid).sort((a, b) => (b.debut || '').localeCompare(a.debut || '')) }))
  const total = (programmes ?? []).length

  return (
    <section className="section">
      <div className="conteneur espace-coach">
        <header className="espace-coach__entete">
          <div>
            <p className="surtitre">Espace coach</p>
            <h1 className="titre titre--section">Programmes</h1>
            <p className="espace-texte">{programmes === null ? ' ' : `${total} programme${total > 1 ? 's' : ''} pour ${groupes.length} coaché${groupes.length > 1 ? 's' : ''}`}</p>
          </div>
        </header>
        <p className="espace-message espace-message--erreur" role="alert">{erreur}</p>
        {clients && programmes && (
          <div className="programmes-coach">
            {groupes.map(({ c, liste }) => (
              <section key={c.uid} className="programmes-coach__groupe" aria-labelledby={`pg-${c.uid}`}>
                <div className="programmes-coach__tete">
                  <h2 id={`pg-${c.uid}`} className="programmes-coach__nom">{c.prenom} {c.nom}</h2>
                  <Link to={`/espace/coach/clients/${c.uid}/programme?nouveau=1`} className="lien-souligne">Nouveau programme<span className="sr-only"> pour {c.prenom} {c.nom}</span></Link>
                </div>
                {liste.length === 0 ? <p className="espace-aide">Pas encore de programme.</p> : (
                  <ul className="programmes-coach__liste">
                    {liste.map((p) => {
                      const [libelle, classe] = etat(p)
                      const nb = p.semaines?.length ?? 0
                      return (
                        <li key={p.id} className="programme-ligne">
                          <Link to={`/espace/coach/clients/${c.uid}/programme?programme=${p.id}`} className="programme-ligne__lien">
                            <span className="programme-ligne__nom">{p.nom || 'Programme sans nom'}</span>
                            <span className="programme-ligne__infos">{nb} semaine{nb > 1 ? 's' : ''} · du {dateLongue(p.debut)} au {dateLongue(ajoutJours(p.debut, nb * 7 - 1))}</span>
                          </Link>
                          <span className={`espace-statut espace-statut--${classe}`}>{libelle}</span>
                        </li>
                      )
                    })}
                  </ul>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
