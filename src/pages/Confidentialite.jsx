import { Link } from 'react-router-dom'
import PageJuridique, { ACompleter } from '../components/PageJuridique.jsx'
import { CONTACT } from '../components/liens.js'
import useTitre from '../components/useTitre.js'

const Email = () => <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>

const SECTIONS = [
  {
    id: 'essentiel',
    titre: "l'essentiel",
    contenu: (
      <ul>
        <li><strong>Pas de cookie, pas de publicité, pas de mesure d'audience</strong> : vous n'êtes pas suivi sur ce site.</li>
        <li><strong>Seules les données que vous m'envoyez</strong> (formulaire, e-mail, téléphone) sont utilisées, et uniquement pour vous répondre et organiser les séances.</li>
        <li><strong>Elles ne sont ni vendues, ni partagées</strong> à des fins commerciales.</li>
        <li><strong>Vous pouvez à tout moment</strong> les consulter, les corriger ou les faire supprimer en écrivant à <Email />.</li>
      </ul>
    ),
  },
  {
    id: 'responsable',
    titre: 'responsable du traitement',
    contenu: (
      <p>
        Marie Sillas, Rimaactive, <ACompleter>adresse</ACompleter>. Contact pour toute question sur vos données :{' '}
        <Email />.
      </p>
    ),
  },
  {
    id: 'donnees',
    titre: 'données collectées et utilisation',
    contenu: (
      <>
        <div className="tableau-defilant">
          <table>
            <thead>
              <tr><th scope="col">Quoi</th><th scope="col">Pourquoi</th><th scope="col">Base légale</th></tr>
            </thead>
            <tbody>
              <tr>
                <td>Formulaire de contact : nom, e-mail ou téléphone, profil, structure, commune, besoin, disponibilités</td>
                <td>Répondre à votre demande, vous faire une proposition ou un devis</td>
                <td>Mesures précontractuelles prises à votre demande (art. 6.1.b du RGPD)</td>
              </tr>
              <tr>
                <td>Échanges par e-mail ou téléphone</td>
                <td>Organiser et suivre les séances</td>
                <td>Exécution du contrat (art. 6.1.b)</td>
              </tr>
              <tr>
                <td>Informations utiles à la pratique (niveau, éventuelles contre-indications que vous choisissez de partager)</td>
                <td>Adapter les exercices en sécurité</td>
                <td>Votre consentement explicite (art. 9.2.a), retirable à tout moment</td>
              </tr>
              <tr>
                <td>Factures et coordonnées de facturation</td>
                <td>Obligations comptables et fiscales</td>
                <td>Obligation légale (art. 6.1.c)</td>
              </tr>
              <tr>
                <td>Journaux techniques de l'hébergeur (adresse IP, date, page demandée)</td>
                <td>Faire fonctionner le site et le protéger des abus</td>
                <td>Intérêt légitime (art. 6.1.f)</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Merci de ne pas envoyer d'informations de santé détaillées par le formulaire : on en parle de vive voix lors
          du premier échange.
        </p>
      </>
    ),
  },
  {
    id: 'destinataires',
    titre: 'qui y a accès',
    contenu: (
      <>
        <p>Vos données sont lues uniquement par Marie Sillas. Elles transitent aussi par des prestataires techniques, qui n'ont pas le droit de les utiliser pour leur propre compte :</p>
        <ul>
          <li><strong>Vercel Inc.</strong> (hébergement du site), aux États-Unis ;</li>
          <li><strong><ACompleter>service d'envoi du formulaire, par ex. Formspree ou Resend</ACompleter></strong> ;</li>
          <li><strong><ACompleter>messagerie e-mail utilisée</ACompleter></strong>.</li>
        </ul>
        <p>
          Lorsque des données sont traitées hors de l'Union européenne, ce transfert est encadré par les garanties
          prévues par le RGPD (décision d'adéquation EU-US Data Privacy Framework ou clauses contractuelles types de la
          Commission européenne).
        </p>
      </>
    ),
  },
  {
    id: 'duree',
    titre: 'durée de conservation',
    contenu: (
      <ul>
        <li><strong>Demande sans suite</strong> : 3 ans après notre dernier échange, puis suppression.</li>
        <li><strong>Client</strong> : pendant toute la durée de l'accompagnement, puis 3 ans.</li>
        <li><strong>Informations liées à la pratique</strong> : supprimées à la fin de l'accompagnement, ou dès que vous le demandez.</li>
        <li><strong>Factures</strong> : 10 ans, comme l'exige le Code de commerce.</li>
        <li><strong>Journaux techniques</strong> : selon la politique de l'hébergeur, en général quelques semaines.</li>
      </ul>
    ),
  },
  {
    id: 'cookies',
    titre: 'cookies',
    contenu: (
      <>
        <p>
          Ce site <strong>ne dépose aucun cookie</strong> et n'utilise aucun outil de mesure d'audience, de publicité
          ou de réseau social intégré. C'est pour cela qu'aucun bandeau de consentement ne s'affiche.
        </p>
        <p>
          Les polices de caractères sont hébergées sur le site lui-même : aucune requête n'est envoyée à Google ou à un
          autre service tiers pendant votre visite. Les liens vers Instagram, TikTok et Facebook sont de simples liens :
          ces services ne reçoivent rien tant que vous ne cliquez pas.
        </p>
      </>
    ),
  },
  {
    id: 'droits',
    titre: 'vos droits',
    contenu: (
      <>
        <p>Conformément au RGPD et à la loi Informatique et Libertés, vous pouvez :</p>
        <ul>
          <li>accéder à vos données et en obtenir une copie ;</li>
          <li>les faire corriger ou compléter ;</li>
          <li>les faire supprimer ;</li>
          <li>limiter leur utilisation ou vous y opposer ;</li>
          <li>les récupérer dans un format lisible (portabilité) ;</li>
          <li>retirer votre consentement à tout moment, quand il est la base du traitement ;</li>
          <li>donner des directives sur le sort de vos données après votre décès.</li>
        </ul>
        <p>
          Écrivez simplement à <Email />. Je réponds dans un délai d'un mois maximum. Une pièce d'identité peut vous
          être demandée en cas de doute sur votre identité.
        </p>
        <p>
          Si vous estimez que vos droits ne sont pas respectés, vous pouvez adresser une réclamation à la CNIL :{' '}
          <a href="https://www.cnil.fr/fr/plaintes" rel="noopener noreferrer">cnil.fr/fr/plaintes</a>, ou par courrier
          au 3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07.
        </p>
      </>
    ),
  },
  {
    id: 'securite',
    titre: 'sécurité',
    contenu: (
      <p>
        Le site est servi en HTTPS : les informations que vous saisissez sont chiffrées pendant leur envoi. L'accès aux
        messages reçus est protégé par mot de passe et réservé à Marie Sillas.
      </p>
    ),
  },
  {
    id: 'modifications',
    titre: 'modifications',
    contenu: (
      <p>
        Cette politique peut évoluer, par exemple si un nouvel outil est ajouté au site. La date de mise à jour en haut
        de page fait foi. Voir aussi les <Link to="/mentions-legales">mentions légales</Link>.
      </p>
    ),
  },
]

export default function Confidentialite() {
  useTitre('Confidentialité')
  return (
    <PageJuridique
      fil="Confidentialité"
      titre="confidentialité"
      miseAJour="16 octobre 2026"
      intro="Ce que deviennent les informations que vous me confiez, et comment garder la main dessus."
      sections={SECTIONS}
    />
  )
}
