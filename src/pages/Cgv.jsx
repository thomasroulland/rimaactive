import { Link } from 'react-router-dom'
import PageJuridique, { Mediation } from '../components/PageJuridique.jsx'
import useTitre from '../components/useTitre.js'

// Conditions générales de vente : texte de Marie (27 novembre 2026), même style que les mentions légales.
// Une seule carte ; les 13 articles numérotés sont repris dans le sommaire.
const ARTICLES = [
  {
    id: 'qui-suis-je',
    titre: 'Qui suis-je',
    contenu: (
      <p>
        Marie Sillas, entrepreneuse individuelle (Rimaactive), 26 rue d’Epernon, 78550 Houdan. SIRET 132 567 819 00017.
        TVA non applicable, article 293 B du CGI. Contact : <a href="mailto:marie.sillas.coaching@outlook.com">marie.sillas.coaching@outlook.com</a> – 06 61 68 16 03.
      </p>
    ),
  },
  {
    id: 'champ',
    titre: 'Champ d’application',
    contenu: (
      <p>
        Ces CGV s’appliquent à toutes mes prestations de coaching sportif : séances individuelles (à domicile ou en salle),
        coaching en ligne, séances en petit groupe et séances en entreprise. Toute réservation vaut acceptation des CGV.
      </p>
    ),
  },
  {
    id: 'prestations',
    titre: 'Prestations et tarifs',
    contenu: (
      <p>
        Les prestations et tarifs en vigueur sont indiqués sur le site rimaactive.fr. Une séance dure 60 minutes. Le matériel
        est fourni. Les déplacements sont compris jusqu’à 20 km autour de Houdan ; au-delà, un devis est établi. Pour les
        entreprises, un devis gratuit est envoyé sous 48 h.
      </p>
    ),
  },
  {
    id: 'reservation',
    titre: 'Réservation',
    contenu: (
      <p>
        La réservation se fait par e-mail, téléphone, formulaire de contact ou message privé sur les réseaux sociaux de
        Rimaactive (Instagram, Facebook, TikTok). Elle est confirmée par écrit (e-mail ou message).
      </p>
    ),
  },
  {
    id: 'paiement',
    titre: 'Paiement',
    contenu: (
      <>
        <ul>
          <li>Séance ponctuelle : à la réservation.</li>
          <li>Coaching régulier (domicile ou salle) : en début de mois, engagement minimum de 2 mois.</li>
          <li>Coaching en ligne : en début de mois, engagement minimum de 2 mois.</li>
          <li>Groupes : à la réservation.</li>
          <li>
            Entreprises : selon le devis, à 30 jours à réception de facture. En cas de retard : pénalités au taux légal x3 et
            indemnité forfaitaire de 40 € pour frais de recouvrement.
          </li>
        </ul>
        <p>
          Moyens acceptés : virement bancaire ou espèces. Pour les séances à domicile ouvrant droit au crédit d’impôt, le
          paiement se fera via l’avance immédiate de l’URSSAF (une fois la déclaration services à la personne obtenue).
        </p>
      </>
    ),
  },
  {
    id: 'annulation',
    titre: 'Annulation et report',
    contenu: (
      <ul>
        <li>Annulation plus de 24 h avant : la séance est reportée.</li>
        <li>Annulation moins de 24 h avant ou absence : la séance est due.</li>
        <li>Séance en extérieur : en cas de météo défavorable, je préviens au plus tard 2 heures avant et la séance est reportée sans frais.</li>
        <li>Coaching régulier et en ligne : après les 2 premiers mois, arrêt possible en prévenant au moins 7 jours avant la fin du mois.</li>
      </ul>
    ),
  },
  {
    id: 'retractation',
    titre: 'Droit de rétractation (particuliers)',
    contenu: (
      <p>
        Pour une réservation faite à distance, vous disposez de 14 jours pour vous rétracter. Si vous demandez que la
        prestation commence avant la fin de ce délai, vous payez les séances déjà réalisées. Une prestation entièrement
        réalisée avec votre accord avant la fin du délai n’est plus rétractable.
      </p>
    ),
  },
  {
    id: 'sante',
    titre: 'Santé et sécurité',
    contenu: (
      <p>
        Un avis médical est recommandé en cas de douleur, de blessure, de grossesse ou de pathologie. Vous vous engagez à
        signaler tout problème de santé. Je peux adapter ou arrêter un exercice pour votre sécurité. Je ne donne aucun
        conseil en nutrition et ne promets aucun résultat.
      </p>
    ),
  },
  {
    id: 'responsabilite',
    titre: 'Responsabilité et assurance',
    contenu: (
      <p>
        Je suis assurée en responsabilité civile professionnelle. Pour les séances à domicile, vous mettez à disposition un
        espace dégagé et sûr.
      </p>
    ),
  },
  {
    id: 'en-ligne',
    titre: 'Coaching en ligne et espace personnel',
    contenu: (
      <p>
        Le programme et les contenus de l’espace personnel sont réservés à votre usage et ne peuvent pas être partagés. Les
        messages sont traités du lundi au vendredi.
      </p>
    ),
  },
  {
    id: 'reclamation',
    titre: 'Réclamation et médiation',
    contenu: (
      <>
        <p>
          Toute réclamation est à adresser par e-mail à <a href="mailto:marie.sillas.coaching@outlook.com">marie.sillas.coaching@outlook.com</a>.
        </p>
        <Mediation />
      </>
    ),
  },
  {
    id: 'donnees',
    titre: 'Données personnelles',
    contenu: <p>Voir la <Link to="/mentions-legales#confidentialite">politique de confidentialité</Link>.</p>,
  },
  {
    id: 'droit',
    titre: 'Droit applicable',
    contenu: <p>Les présentes CGV sont soumises au droit français.</p>,
  },
].map((a, i) => ({ ...a, titre: `${i + 1}. ${a.titre}` }))

export default function Cgv() {
  useTitre('CGV')
  return (
    <PageJuridique
      titre="Conditions générales de vente"
      ligne="Mis à jour le 27 novembre 2026"
      sommaire={ARTICLES}
      sections={[{
        id: 'cgv',
        titre: '',
        contenu: ARTICLES.map((a) => (
          <div key={a.id} id={a.id} className="juridique__sous-partie">
            <h2 className="juridique__article">{a.titre}</h2>
            {a.contenu}
          </div>
        )),
      }]}
    />
  )
}
