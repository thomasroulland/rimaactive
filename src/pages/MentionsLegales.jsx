import { Link } from 'react-router-dom'
import PageJuridique, { ACompleter } from '../components/PageJuridique.jsx'
import { CONTACT } from '../components/liens.js'
import useTitre from '../components/useTitre.js'

const SECTIONS = [
  {
    id: 'editeur',
    titre: 'éditrice du site',
    contenu: (
      <>
        <p>Le site rimaactive est édité par :</p>
        <dl className="coordonnees-legales">
          <dt>Nom</dt>
          <dd>Marie Sillas, entrepreneuse individuelle, sous le nom commercial Rimaactive</dd>
          <dt>Adresse</dt>
          <dd><ACompleter>adresse professionnelle ou de domiciliation</ACompleter></dd>
          <dt>SIRET</dt>
          <dd><ACompleter>numéro SIRET</ACompleter></dd>
          <dt>TVA</dt>
          <dd>
            <ACompleter>si micro-entreprise : « TVA non applicable, article 293 B du CGI » ; sinon numéro de TVA intracommunautaire</ACompleter>
          </dd>
          <dt>E-mail</dt>
          <dd><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></dd>
          <dt>Téléphone</dt>
          <dd><a href={CONTACT.telephoneLien}>{CONTACT.telephone}</a></dd>
        </dl>
        <p>Directrice de la publication : Marie Sillas.</p>
      </>
    ),
  },
  {
    id: 'activite',
    titre: 'activité réglementée',
    contenu: (
      <>
        <p>
          L'encadrement d'activités physiques contre rémunération est réservé aux titulaires d'un diplôme reconnu et
          d'une carte professionnelle d'éducateur sportif (articles L212-1 et L212-11 du Code du sport).
        </p>
        <dl className="coordonnees-legales">
          <dt>Diplôme</dt>
          <dd><ACompleter>intitulé du diplôme (BPJEPS, licence STAPS…)</ACompleter></dd>
          <dt>Carte professionnelle</dt>
          <dd><ACompleter>numéro de carte, délivrée par le SDJES de votre département</ACompleter></dd>
          <dt>Assurance</dt>
          <dd><ACompleter>assureur responsabilité civile professionnelle et zone couverte</ACompleter></dd>
        </dl>
      </>
    ),
  },
  {
    id: 'hebergeur',
    titre: 'hébergement',
    contenu: (
      <>
        <p>Le site est hébergé par :</p>
        <dl className="coordonnees-legales">
          <dt>Hébergeur</dt>
          <dd>Vercel Inc.</dd>
          <dt>Adresse</dt>
          <dd>440 N Barranca Ave #4133, Covina, CA 91723, États-Unis</dd>
          <dt>Site</dt>
          <dd><a href="https://vercel.com" rel="noopener noreferrer">vercel.com</a></dd>
        </dl>
      </>
    ),
  },
  {
    id: 'propriete',
    titre: 'propriété intellectuelle',
    contenu: (
      <>
        <p>
          Les textes, photos, vidéos, le logo Rimaactive et l'ensemble des éléments graphiques de ce site sont la
          propriété de Marie Sillas, sauf mention contraire. Toute reproduction, représentation ou adaptation, totale
          ou partielle, sans autorisation écrite préalable est interdite.
        </p>
        <p>Les polices Hanken Grotesk et Instrument Serif sont distribuées sous licence libre SIL Open Font License.</p>
      </>
    ),
  },
  {
    id: 'responsabilite',
    titre: 'responsabilité',
    contenu: (
      <>
        <p>
          Les informations de ce site sont données à titre indicatif et peuvent évoluer. Elles ne remplacent pas un
          avis médical : en cas de douleur, de blessure ou de pathologie, consultez un professionnel de santé avant de
          reprendre une activité physique.
        </p>
        <p>
          Les liens vers d'autres sites (réseaux sociaux notamment) sont fournis pour votre confort. Rimaactive n'est
          pas responsable de leur contenu ni de leur politique de confidentialité.
        </p>
      </>
    ),
  },
  {
    id: 'donnees',
    titre: 'données personnelles',
    contenu: (
      <p>
        Le traitement de vos données et vos droits sont détaillés dans la{' '}
        <Link to="/confidentialite">politique de confidentialité</Link>.
      </p>
    ),
  },
  {
    id: 'droit',
    titre: 'droit applicable',
    contenu: (
      <>
        <p>
          Le présent site et ses mentions sont soumis au droit français. En cas de litige, une solution amiable sera
          recherchée avant toute action en justice.
        </p>
        <p>
          Pour les particuliers, en cas de litige lié à une prestation, vous pouvez recourir gratuitement à un
          médiateur de la consommation : <ACompleter>nom et coordonnées du médiateur choisi</ACompleter>.
        </p>
      </>
    ),
  },
]

export default function MentionsLegales() {
  useTitre('Mentions légales')
  return (
    <PageJuridique
      fil="Mentions légales"
      titre="mentions légales"
      miseAJour="16 octobre 2026"
      intro="Qui édite ce site, qui l'héberge, et ce que vous pouvez en faire."
      sections={SECTIONS}
    />
  )
}
