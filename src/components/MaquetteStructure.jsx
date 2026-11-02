import { Link } from 'react-router-dom'
import portraitBrasCroises from '../assets/portrait-contact.jpg'

// Maquette (?maquette=structure) : quatre rubriques inspirées de la structure de sites montrés par Marie,
// dans sa charte : titres en Hanken Grotesk Black avec un seul mot mis en avant (souligné vermillon sur fond clair,
// jaune sur fond encre), vouvoiement, aucun émoji. Tous les textes viennent du site ou du design system
// (contexte de marque confirmé par Marie) ; ils sont à relire et valider par Marie.

// Mot mis en avant (composant MotMisEnAvant de la charte) : le fond décide du style
export function Mot({ children }) {
  return <span className="mot-avant">{children}</span>
}

export function QuiJeSuis() {
  return (
    <section className="section maq-qui" aria-labelledby="qui-titre">
      <div className="conteneur maq-qui__grille">
        <img className="maq-qui__photo" src={portraitBrasCroises} alt="Marie Sillas, bras croisés" />
        <div className="maq-qui__texte">
          <p className="surtitre">Qui je suis</p>
          <h2 id="qui-titre" className="titre titre--section">Moi c’est <Mot>Marie</Mot></h2>
          <p className="texte">
            Rima, c’est Marie à l’envers. Active, pour mon côté dynamique. Après la danse, la gymnastique et le karaté,
            puis six ans de salariat, je suis devenue coach sportive, diplômée en octobre 2026.
          </p>
          <p className="texte">
            Ma spécialité : la force et l’entraînement fonctionnel à la barre, au kettlebell, au poids du corps et au
            landmine, avec une grande place pour la mobilité.
          </p>
          <p className="maq-qui__signature">Marie</p>
          <a href="#accompagnement" className="bouton bouton--principal">Mes formules</a>
        </div>
      </div>
    </section>
  )
}

const POINTS = [
  ['Le mouvement d’abord', 'Des séances construites à partir des mouvements fondamentaux, pour gagner en mobilité, en force et en autonomie.'],
  ['Moins, mais mieux', 'Des séances d’une heure, à la maison, dehors ou en salle, adaptées à votre niveau.'],
  ['Le défi plutôt que la routine', 'EMOM, AMRAP, density, complex, circuit : du volume global, à l’opposé du « 3 séries de 12 ».'],
  ['La confiance qui s’installe', 'Au fil des séances, vous prenez confiance et le plaisir de bouger s’installe.'],
]

export function Methode() {
  return (
    <section className="section maq-methode" aria-labelledby="methode-titre">
      <div className="conteneur">
        <div className="maq-centre">
          <p className="surtitre">Ma méthode</p>
          <h2 id="methode-titre" className="titre titre--section">Pourquoi ça <Mot>marche</Mot></h2>
          <p className="texte">Un corps fort et mobile grâce à une pratique fonctionnelle.</p>
        </div>
        <ol className="maq-methode__liste">
          {POINTS.map(([titre, texte], i) => (
            <li key={titre}>
              <span className="maq-methode__numero">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="maq-methode__titre">{titre}</h3>
              <p>{texte}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

const QUESTIONS = [
  ['Je débute complètement, est-ce pour moi ?', 'Oui. Les séances sont adaptées à votre niveau et partent des mouvements fondamentaux.'],
  ['Faut-il du matériel ou une salle ?', 'Non. Le matériel est fourni : tapis, kettlebells, slam balls, etc. Les séances ont lieu à domicile, en extérieur, dans vos locaux ou en salle.'],
  ['Comment se déroule une séance ?', 'Mobilité & Activation : 5 à 10 min. Corps de séance : 30 à 45 min. Retour au calme : 5 min.'],
  ['Où vous déplacez-vous ?', 'Je suis basée à Houdan (78). Le déplacement est inclus jusqu’à 20 km autour de Houdan.'],
  ['Et si je préfère un suivi à distance ?', 'Active Plus est un suivi en ligne de 12 semaines, avec un programme 100 % personnalisé et un suivi hebdomadaire sur WhatsApp.'],
  ['Comment réserver ?', 'Écrivez-moi avec le formulaire de contact ou par e-mail, et je vous réponds pour choisir la formule qui vous convient.'],
]

export function Questions() {
  return (
    <section className="section maq-questions" aria-labelledby="questions-titre">
      <div className="conteneur conteneur--etroit">
        <h2 id="questions-titre" className="titre titre--section maq-centre maq-questions__titre">Les questions qu’on me <Mot>pose</Mot></h2>
        <div className="maq-questions__liste">
          {QUESTIONS.map(([q, r]) => (
            <details key={q} className="maq-question">
              <summary>{q}<span className="maq-question__plus" aria-hidden="true" /></summary>
              <p>{r}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Pret() {
  return (
    <section className="section maq-pret" aria-labelledby="pret-titre">
      <div className="conteneur maq-centre">
        <h2 id="pret-titre" className="titre titre--section">On commence ?</h2>
        <p className="texte">Séances d’une heure, à domicile, en salle, en extérieur ou en ligne.</p>
        <div className="maq-pret__boutons">
          <Link to="/contact" className="bouton bouton--encre">M’écrire</Link>
          <a href="#accompagnement" className="bouton maq-pret__contour">Voir les formules</a>
        </div>
      </div>
    </section>
  )
}
