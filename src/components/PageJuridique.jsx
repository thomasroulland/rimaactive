import { HerosPage } from './Blocs.jsx'

// Texte à remplacer par la vraie information avant la mise en ligne
export function ACompleter({ children }) {
  return <mark className="a-completer">[À compléter : {children}]</mark>
}

// Page de texte long avec un sommaire à gauche
export default function PageJuridique({ fil, titre, miseAJour, intro, sections }) {
  return (
    <>
      <HerosPage fil={fil} ligne={`mis à jour le ${miseAJour}`} titre={titre}>
        <p className="texte texte--grand">{intro}</p>
      </HerosPage>
      <section className="section section--serree">
        <div className="conteneur juridique">
          <nav className="juridique__sommaire" aria-label="Sommaire">
            <p className="mention">sommaire</p>
            <ol>
              {sections.map((section, i) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>
                    <span className="mention">{String(i + 1).padStart(2, '0')}</span>
                    {section.titre}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
          <div className="juridique__texte">
            {sections.map((section, i) => (
              <section key={section.id} id={section.id} aria-labelledby={`${section.id}-titre`}>
                <p className="mention">{String(i + 1).padStart(2, '0')}</p>
                <h2 id={`${section.id}-titre`} className="titre juridique__titre">{section.titre}</h2>
                {section.contenu}
              </section>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
