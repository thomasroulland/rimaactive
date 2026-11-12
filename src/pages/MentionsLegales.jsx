import { ACompleter } from '../components/PageJuridique.jsx'
import { CONTACT } from '../components/liens.js'

export const SECTIONS_MENTIONS = [
  {
    id: 'editeur',
    titre: 'Éditrice du site',
    contenu: (
      <>
        <p>Le site rimaactive est édité par :</p>
        <dl className="coordonnees-legales">
          <dt>Nom</dt>
          <dd>Marie Sillas, entrepreneuse individuelle, sous le nom commercial Rimaactive</dd>
          <dt>Adresse</dt>
          <dd>26 rue d’Epernon, 78550 Houdan</dd>
          <dt>SIRET</dt>
          <dd>132 567 819 00017 (code APE 8551Z)</dd>
          <dt>TVA</dt>
          <dd>TVA non applicable, article 293 B du CGI</dd>
          <dt>E-mail</dt>
          <dd><a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a></dd>
          {/* seul endroit du site avec un numéro de téléphone : demandé par Marie pour les mentions légales (12 novembre 2026) */}
          <dt>Téléphone</dt>
          <dd>06 61 68 16 03</dd>
        </dl>
        <p>Directrice de la publication : Marie Sillas.</p>
      </>
    ),
  },
  {
    id: 'activite',
    titre: 'Activité réglementée',
    contenu: (
      <>
        <p>
          L'encadrement d'activités physiques contre rémunération est réservé aux titulaires d'un diplôme reconnu et
          d'une carte professionnelle d'éducateur sportif (articles L212-1 et L212-11 du Code du sport).
        </p>
        <dl className="coordonnees-legales">
          <dt>Diplôme</dt>
          <dd>CQP Instructeur Fitness, option Musculation et Personal Training (certification de branche, RNCP 40595)</dd>
          <dt>Carte professionnelle</dt>
          <dd>En cours de délivrance par le SDJES des Yvelines</dd>
          <dt>Assurance</dt>
          <dd>Hiscox, responsabilité civile professionnelle, activité de coach sportif, France</dd>
        </dl>
      </>
    ),
  },
  {
    id: 'hebergeur',
    titre: 'Hébergement',
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
    titre: 'Propriété intellectuelle',
    contenu: (
      <>
        <p>
          Les textes, photos, vidéos, le logo Rimaactive et l'ensemble des éléments graphiques de ce site sont la
          propriété de Marie Sillas, sauf mention contraire. Toute reproduction, représentation ou adaptation, totale
          ou partielle, sans autorisation écrite préalable est interdite.
        </p>
        <p>La police Hanken Grotesk est distribuée sous licence libre SIL Open Font License.</p>
      </>
    ),
  },
  {
    id: 'responsabilite',
    titre: 'Responsabilité',
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
    id: 'droit',
    titre: 'Droit applicable',
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
