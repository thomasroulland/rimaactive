// Médiateur de la consommation (texte de Marie, 27 novembre 2026), repris dans les mentions légales et les CGV
export function Mediation() {
  return (
    <p>
      Conformément aux dispositions du Code de la consommation concernant « le processus de médiation des litiges de la
      consommation », après nous avoir sollicités et à défaut de réponse vous satisfaisant, vous avez la possibilité de
      recourir gratuitement à une procédure de médiation de la consommation auprès de : CM2C – 49 rue de Ponthieu,
      75008 Paris – Tél : 01 89 47 00 14 – Site : <a href="https://www.cm2c.net/declarer-un-litige.php" target="_blank" rel="noopener noreferrer">https://www.cm2c.net/declarer-un-litige.php</a> – Mail : <a href="mailto:litiges@cm2c.net">litiges@cm2c.net</a>
    </p>
  )
}

// Texte à remplacer par la vraie information avant la mise en ligne
export function ACompleter({ children }) {
  return <mark className="a-completer">[À compléter : {children}]</mark>
}

// Page de texte long (27 novembre 2026, demande de Marie) : même style que « M'écrire » —
// titre seul (sans fil d'Ariane ni phrase d'intro), puis un sommaire et le texte dans des cartes blanches arrondies.
// `ligne` : la ligne au-dessus du titre (date de mise à jour) ; `sommaire` : liens du sommaire, par défaut les parties.
// Une partie sans titre est une carte sans titre (CGV : une seule carte, ses articles dans le sommaire).
export default function PageJuridique({ titre, ligne, sections, sommaire = null }) {
  const liens = sommaire ?? sections
  return (
    <section className="juridique-page" aria-labelledby="juridique-titre">
      <div className="conteneur">
        <header className="juridique-page__tete">
          <p className="surtitre">{ligne}</p>
          <h1 id="juridique-titre" className="titre titre--page">{titre}</h1>
        </header>
        <div className="juridique">
          {liens.length > 1 && (
            <nav className="juridique__sommaire" aria-label="Sommaire">
              <ul>
                {liens.map((l) => (
                  <li key={l.id}><a href={`#${l.id}`}>{l.titre}</a></li>
                ))}
              </ul>
            </nav>
          )}
          <div className="juridique__texte">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="juridique__carte" aria-labelledby={section.titre ? `${section.id}-titre` : 'juridique-titre'}>
                {section.titre && <h2 id={`${section.id}-titre`} className="titre juridique__titre">{section.titre}</h2>}
                {section.contenu}
              </section>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
