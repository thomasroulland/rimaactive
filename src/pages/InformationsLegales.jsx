import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import PageJuridique, { ACompleter } from '../components/PageJuridique.jsx'
import { CONTACT } from '../components/liens.js'
import useTitre from '../components/useTitre.js'
import { SECTIONS_MENTIONS } from './MentionsLegales.jsx'
import { SECTIONS_CONFIDENTIALITE } from './Confidentialite.jsx'

// Conditions générales de vente : la trame est posée, les règles propres à Marie (paiement, annulation…)
// restent à compléter par elle. Rien n'est inventé : chaque point à décider est marqué « À compléter ».
const SECTIONS_CGV = [
  {
    id: 'cgv-objet',
    titre: 'Objet',
    contenu: (
      <p>
        Les présentes conditions s'appliquent aux séances de coaching sportif proposées par Marie Sillas sous le nom
        Rimaactive : séances pour les entreprises, en duo ou en groupe, en individuel et programmes en ligne.
      </p>
    ),
  },
  {
    id: 'cgv-tarifs',
    titre: 'Prestations et tarifs',
    contenu: (
      <>
        <p>
          Le contenu de chaque formule est indiqué sur les pages Entreprises, Duo et groupes et Individuel.
          Les tarifs sont communiqués sur demande.
        </p>
        <p>Les formules sur devis font l'objet d'une proposition écrite avant toute séance.</p>
      </>
    ),
  },
  {
    id: 'cgv-reservation',
    titre: 'Réservation',
    contenu: (
      <p>
        La réservation se fait par le formulaire de contact ou par e-mail à{' '}
        <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>. Elle est confirmée par écrit :{' '}
        <ACompleter>modalité de confirmation (e-mail, devis signé, acompte…)</ACompleter>.
      </p>
    ),
  },
  {
    id: 'cgv-paiement',
    titre: 'Paiement',
    contenu: <p><ACompleter>moyens de paiement acceptés, moment du paiement (avant la séance, au mois…), délai pour les entreprises</ACompleter></p>,
  },
  {
    id: 'cgv-annulation',
    titre: 'Annulation et report',
    contenu: <p><ACompleter>délai pour annuler ou reporter une séance sans frais, et ce qui se passe en cas d'annulation tardive ou de votre fait</ACompleter></p>,
  },
  {
    id: 'cgv-retractation',
    titre: 'Droit de rétractation',
    contenu: (
      <p>
        <ACompleter>conditions du droit de rétractation de 14 jours pour les particuliers qui réservent à distance (programmes en ligne notamment)</ACompleter>
      </p>
    ),
  },
  {
    id: 'cgv-sante',
    titre: 'Santé et sécurité',
    contenu: (
      <p>
        Vous signalez avant la première séance toute douleur, blessure ou pathologie.{' '}
        <ACompleter>certificat médical demandé ou non</ACompleter>.
      </p>
    ),
  },
  {
    id: 'cgv-litiges',
    titre: 'Litiges',
    contenu: (
      <p>
        En cas de désaccord, une solution amiable est recherchée en premier lieu. Les particuliers peuvent recourir
        gratuitement au médiateur de la consommation indiqué dans les mentions légales. Droit français applicable.
      </p>
    ),
  },
]

// Une partie de la page : ses sous-parties en titres de niveau 3
function Partie({ sections }) {
  return sections.map((s) => (
    <div key={s.id} id={s.id} className="juridique__sous-partie">
      <h3>{s.titre}</h3>
      {s.contenu}
    </div>
  ))
}

const PARTIES = [
  { id: 'mentions', titre: 'Mentions légales', contenu: <Partie sections={SECTIONS_MENTIONS} /> },
  { id: 'confidentialite', titre: 'Politique de confidentialité', contenu: <Partie sections={SECTIONS_CONFIDENTIALITE} /> },
  { id: 'cgv', titre: 'Conditions générales de vente', contenu: <Partie sections={SECTIONS_CGV} /> },
]

// Mentions légales, politique de confidentialité et conditions générales de vente, réunies sur une seule page
export default function InformationsLegales() {
  useTitre('Mentions légales et confidentialité')
  const { hash } = useLocation()
  // un lien vers une partie (#confidentialite, #cgv) y amène directement
  useEffect(() => {
    if (!hash) return
    const cible = document.getElementById(hash.slice(1))
    if (cible) cible.scrollIntoView()
  }, [hash])
  return (
    <PageJuridique
      fil="Informations légales"
      titre="Informations légales"
      miseAJour="5 novembre 2026"
      intro="Mentions légales, politique de confidentialité et conditions générales de vente."
      sections={PARTIES}
    />
  )
}
