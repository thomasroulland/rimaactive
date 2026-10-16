export default function Tuile({ titre, surtitre, petit = false, large = false, children }) {
  return (
    <div className={`tuile ${large ? 'tuile--large' : ''}`}>
      {surtitre && <p className="surtitre" style={{ fontSize: 15 }}>{surtitre}</p>}
      <h3 className={`tuile__titre ${petit ? 'tuile__titre--petit' : ''}`}>{titre}</h3>
      {children ?? <p className="texte">[Texte provisoire à rédiger]</p>}
    </div>
  )
}
