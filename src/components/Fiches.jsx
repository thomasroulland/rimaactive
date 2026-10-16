export default function Fiches({ items, serre = false }) {
  return (
    <dl className={`fiches ${serre ? 'fiches--serre' : ''}`}>
      {items.map((item) => (
        <div className="fiche" key={item}>
          <dt>{item}</dt>
          <dd>[À compléter]</dd>
        </div>
      ))}
    </dl>
  )
}
