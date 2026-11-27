// Texte à remplacer par la vraie information avant la mise en ligne
export function ACompleter({ children }) {
  return <mark className="a-completer">[À compléter : {children}]</mark>
}

// Page de texte long (27 novembre 2026, demande de Marie) : même style que « M'écrire » —
// titre seul (sans fil d'Ariane ni phrase d'intro), puis un sommaire et le texte dans des cartes blanches arrondies.
export default function PageJuridique({ titre, miseAJour, sections }) {
  return (
    <section className="juridique-page" aria-labelledby="juridique-titre">
      <div className="conteneur">
        <header className="juridique-page__tete">
          <p className="surtitre">Mis à jour le {miseAJour}</p>
          <h1 id="juridique-titre" className="titre titre--page">{titre}</h1>
        </header>
        <div className="juridique">
          {sections.length > 1 && (
            <nav className="juridique__sommaire" aria-label="Sommaire">
              <ul>
                {sections.map((section) => (
                  <li key={section.id}><a href={`#${section.id}`}>{section.titre}</a></li>
                ))}
              </ul>
            </nav>
          )}
          <div className="juridique__texte">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="juridique__carte" aria-labelledby={`${section.id}-titre`}>
                <h2 id={`${section.id}-titre`} className="titre juridique__titre">{section.titre}</h2>
                {section.contenu}
              </section>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
