import { valeurChiffre } from '../donnees/chiffres.js'

// Carte noire de « Ma progression » (proposition A, Marie, 25 novembre 2026) : le premier chiffre en grand,
// les deux autres en dessous. Les 3 chiffres sont choisis par Marie pour chaque coaché (26 novembre 2026).
// Aussi montrée en aperçu dans la fiche du coaché, côté coach.
export default function CarteChiffres({ cles, ctx, etiquette }) {
  const [grand, ...petits] = cles.map((c) => ({ cle: c, ...valeurChiffre(c, ctx) }))
  return (
    <section className="ec-prog-noire" aria-label="Chiffres clés">
      <p className="ec-prog-noire__lab">{etiquette}</p>
      <p className="ec-prog-noire__grand">{grand.valeur}{grand.unite && <small>{grand.cle === 'seances' ? `${grand.unite} séances` : grand.unite}</small>}</p>
      {grand.cle !== 'seances' && <p className="ec-prog-noire__sous">{grand.libelle}</p>}
      {grand.barre !== undefined && <span className="ec-prog-noire__barre" aria-hidden="true"><span style={{ width: `${Math.round(grand.barre * 100)}%` }} /></span>}
      <div className="ec-prog-noire__duo">
        {petits.map((c) => (
          <p key={c.cle}><b>{c.valeur}{c.unite && ` ${c.unite}`}</b><span>{c.libelle}</span></p>
        ))}
      </div>
    </section>
  )
}
