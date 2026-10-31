# Passation — site Rimaactive

Document de reprise pour une nouvelle discussion avec Claude. À lire en entier avant de toucher au site.
Mis à jour le 31 octobre 2026 (pages de formules et page M'écrire refaites, mises en ligne).

## 1. Qui, quoi

- **Marie Sillas**, coach sportive indépendante autour de Houdan (78). Activité : **Rimaactive**.
- Marie écrit en français : **toujours lui répondre en français**, simplement, sans jargon technique.
- Site vitrine en **React 19 + Vite + react-router-dom**, dépôt GitHub `thomasroulland/rimaactive`, branche `main`.
  Une CI GitHub Actions vérifie le build à chaque push (`gh run list -R thomasroulland/rimaactive -L 1`).
- **Design system** (la référence de l'identité) : artefact « Design System » Rimaactive,
  https://claude.ai/artifact/4svx69gTGF2WhNCJc2r5eP (charte validée le 29 octobre 2026).
  Le lire avant tout changement visuel : `project/README.md` et `project/tokens.json`.

## 2. Règles à ne jamais enfreindre

- **Aucun numéro de téléphone** de Marie sur le site.
- E-mail : **marie.sillas.coaching@outlook.com**. Réseaux : **Instagram @rimaactive, Facebook, LinkedIn** (ajoutés par Marie le 30 octobre 2026 ; adresses Facebook et LinkedIn à demander). Pas de TikTok.
- **Vouvoiement** partout sur le site.
- **Ne rien inventer** : ni prix, ni témoignage, ni chiffre, ni diplôme. Les textes écrits par Claude sont signalés à Marie pour validation.
- Une majuscule au début des titres, c'est tout (pas de titres tout en capitales). Pas d'émoji.
- Respecter la charte : Marie a refusé des maquettes qui changeaient couleurs ou polices.
  On peut proposer des **mises en page** différentes, jamais une autre identité.

## 3. Identité (résumé du design system)

- Couleurs : craie `#F4F3EF` (fond), blanc, craie-foncé `#E8E5DE`, encre `#161514` (texte),
  vermillon `#FF4A1C` (signature : logo, bandeau d'infos, grands numéros), jaune signal `#F2C230`
  (action : bouton principal, survol des cartes, page active), gris chaud `#57534E` (texte secondaire),
  filet `#DCD9D2`, gris contrôle `#88837B` (bordure des champs).
- Jaune jamais en texte sur fond clair. Sur vermillon, texte **encre** (pas blanc).
- Polices (auto-hébergées dans `public/fonts/`) : **Hanken Grotesk Black** pour les titres,
  **Hanken Grotesk** pour le texte, **Hanken Grotesk italique** pour l'accroche
  « Un corps fort et mobile grâce à une pratique fonctionnelle ». (Fraunces a été retirée.)
- Tailles : texte courant **16 px / 26 px** partout (Marie trouve 17-18 px trop gros) ;
  titres de rubrique 55/54 ; titres de cartes 32/32 ; surtitres 12 px capitales espacées ; boutons 15 px.
- Pictogrammes **Phosphor Light** (`src/components/Picto.jsx`), plus une kettlebell dessinée sur la même grille.
- Arrondis : 16 px cartes et photos, 8 px champs ; boutons en pilule.

## 4. Contraintes de mise en page

- **Chaque rubrique tient sur un écran** à 100 % : vérifier à 1536 × 692 (écran de Marie, zoom 125 %)
  et 1280 × 620 (petit portable), puis sur téléphone (390 × 844, les rubriques s'empilent).
- `index.html` contient un script de mise à l'échelle (variables `--ecran`, `--vw`, `--largeur`) ;
  `.section.ecran-plein` fait tenir une rubrique dans l'écran.
- Barre de menu : **45 px** (56 px sur téléphone).

## 5. État actuel du site (branche `main`, en ligne)

**Barre de menu** (`src/components/Entete.jsx`) : logo « rimaactive » (craie sur la photo, encre sinon ;
plus de logo rouge), bulles Accueil / Entreprises / Duo et groupes / Individuel (typo des surtitres,
page en cours cernée d'encre, toutes les bulles restent claires), bouton « M'écrire » à droite.
En haut de l'accueil, la barre est transparente sur la photo ; dès qu'on défile (et sur les autres pages)
elle passe en craie. « M'écrire » reste toujours jaune. Seules les couleurs changent. Téléphone : bouton « Menu ».

**Accueil** (`src/pages/Accueil.jsx`), dans l'ordre :
1. Haut de page : photo du squat (`heros-squat-nb.jpg`) en plein écran sous la barre, calée en haut
   (tête jamais coupée). « COACH SPORTIVE DIPLÔMÉE · HOUDAN (78) » en jaune, « Marie Sillas » en grand,
   accroche en italique, bouton « Mon approche » (jaune) seul. Plus de bandeau vermillon.
2. Mon approche : portrait entier (`portrait-marie.jpg`, 4:5, ni coupé ni rapproché, sans aplat jaune)
   et encadré de même hauteur, centrés ensemble. Encadré : titre « Mon approche », texte, citation,
   4 pastilles 01 Force / 02 Endurance / 03 Puissance / 04 Mobilité (bulle vermillon, chiffre encre).
   Page À propos supprimée : c'est la seule présentation de Marie.
3. Mon accompagnement : 3 cartes (photo arrondie, titre, lieux en petites capitales, phrase de Marie,
   puis le prix et une flèche ronde qui passe en jaune au survol ; toute la carte est le lien) : Entreprises (Locaux · Extérieur),
   Duo et groupes (Domicile · Extérieur), Individuel (Domicile · Salle · En ligne).
   Sous la phrase, un prix « à partir de » tiré de la fiche : À partir de 110 € la séance /
   Dès 14 € par personne / Dès 45 € la séance. Sur téléphone et tablette (< 900 px),
   cartes compactes : petite photo à gauche, sans la phrase.
4. Ma boîte à outils : carrousel clair (`BoiteOutils.jsx`), cartes blanches toutes de même taille, celle
   du milieu avec une ombre ; 5 formats (Density Training, Circuit training, EMOM, AMRAP, Complex ;
   Balistique retiré), bulles jaunes d'objectifs toujours sur une ligne.
   Rubrique « Ma zone d'intervention » supprimée (Marie va aussi au-delà de 20 km).

**Bloc du bas** (`Pied.jsx` + `AppelContact.jsx`), encre, sur toutes les pages sauf M'écrire :
à gauche « Besoin d'en savoir plus ? / Contactez-moi / Basée à Houdan (78), je me déplace dans les
Yvelines, l'Eure-et-Loir et l'Eure. » ; à droite le menu, l'e-mail, « Instagram / Facebook / LinkedIn »
(Facebook et LinkedIn sans lien en attendant leurs adresses, voir `RESEAUX` dans `liens.js`) ; puis les mentions.

**Pages Entreprises / Duo et groupes / Individuel** (`/entreprises`, `/communes`, `/particuliers`, gabarit
`src/components/PageService.jsx`, données dans `src/pages/*.jsx`), refaites le 31 octobre 2026 (mélange des
maquettes de refonte 2 et 3, couleurs de la 4) :
- en haut, un **bandeau photo** (la photo de la carte de l'accueil, voile encre), les lieux en jaune et le nom de la
  page en grand ; la barre de menu est transparente dessus, comme sur l'accueil ;
- dessous, sur toute la largeur, une **ligne d'infos** : onglets Présentiel / En ligne (Individuel), liste cochée
  (lieu, « Matériel fourni : tapis, kettlebells, slam balls, etc. », « Déplacement inclus jusqu'à 20 km autour de
  Houdan (78) »), puis les mentions de tarifs ;
- puis les **cartes en pleine largeur**, blanches et encre, de même hauteur d'une page et d'un onglet à l'autre ;
  un pictogramme de la charte par formule, choisi par Marie : Active 60 entreprise, Active Day lieu, Active Duo
  groupe, Active Group extérieur, Active Solo barre, Active Flex kettlebell (en ligne : Start durée, Progress barre,
  Plus groupe). Marie veut garder **3 pages distinctes** (mieux pour Google) ; pas d'encart « En ligne » dans
  l'onglet Présentiel (le bouton Présentiel / En ligne suffit).
- Ces pages ne tiennent plus sur un seul écran (le bandeau photo prend de la place) : choix accepté par Marie.
- Entreprises : Active 60 et Active Day ont la même structure : « Par séance / À partir de 110 € » (ou 180 €) /
  « Selon le devis et le nombre de personnes » (les tarifs 110 € de 4 à 8 pers. et 150 € de 9 à 12 ne sont plus affichés).
- Duo et groupes : Active Duo 85 € la séance (42,50 € par personne), Active Group 14 € par personne.
- Individuel, onglet Présentiel : Active Solo 65 € domicile / 55 € salle ; Active Flex 220 € / 180 € par mois
  (liste « Compris » dans la carte). Offre Bilan postural + correctifs seul **retirée** par Marie. Onglet En ligne (8 semaines) :
  Active Start 35 €, Active Progress 40 €, Active Plus 160 € (« ou 2 × 80 € · 20 € par semaine » en petit dessous).
- Tailles identiques sur les trois pages : prix 56 px (44 px sur petit portable), tout le texte des cartes en 14 px,
  liste cochée 16 px, noms des formules 32 px.
- Déplacement inclus jusqu'à 20 km autour de Houdan (78). Tarifs valables jusqu'au
  30 avril 2027. TVA non applicable, art. 293 B du CGI.

**Page M'écrire** (`/contact`) (maquette de refonte 2) : la photo du squat sur la moitié gauche ; à droite
« Besoin d'en savoir plus ? », « Contactez-moi », la phrase sur les déplacements, l'e-mail, puis le formulaire
Prénom et nom / E-mail / (Formule choisie) / Vous êtes / Votre message (facultatif) / case d'accord / Envoyer ;
en bas seulement la ligne des mentions. Il faut défiler d'environ 110 px sur l'écran de Marie.
⚠️ Le formulaire **n'envoie rien** pour l'instant (simple message de confirmation) : à brancher
(Formspree ou autre) si Marie le demande.

**Téléphone et tablette** : bouton « M'écrire » fixe en bas de l'écran (sauf sur la page M'écrire),
en plus de celui de la barre.

**Aperçu de partage** : image prête dans `public/apercu-partage.jpg` (photo, « Coach sportive diplômée ·
Houdan (78) », « Marie Sillas »), balises og:title / og:description dans `index.html`. **Manque** og:image
et og:url, qui demandent l'adresse complète du site : Marie doit d'abord acheter son nom de domaine.

**Description pour Google** (`index.html`) : « Marie Sillas, coach sportive diplômée basée à Houdan (78) : … ».

## 6. Travail en cours

Rien en attente de mise en ligne. Les branches de maquettes (`maquette-*`, `approche-maquette1`,
`accueil-refonte`…) sont toutes fusionnées ou abandonnées.

## 7. Questions ouvertes à reposer à Marie

1. **Nom de domaine** (Marie doit l'acheter) : ensuite ajouter og:image et og:url dans `index.html`.
2. Adresses de ses pages **Facebook** et **LinkedIn** (à mettre dans `RESEAUX`, `src/components/liens.js`).
3. Brancher l'envoi du formulaire de contact (Formspree ou autre) ?
4. Textes repris de sa maquette, à confirmer : phrase de la case d'accord du formulaire.
5. Courte présentation « qui je suis » : elle n'a pas encore donné de texte (diplôme, parcours).
6. Taille du texte courant : la charte dit 18 px (« site-texte ») et 16 px (« corps ») ; le site est en 16 px. Corriger la charte ?
7. Mentions légales : SIRET, carte professionnelle, assurance RC pro, médiateur à compléter.

## 8. Ce que Marie a déjà dit (préférences)

- Aime : formules en cartes sur fond clair, pages courtes qui tiennent sur un écran, bouton « Choisir »
  sur chaque formule, cartes toutes de la même taille, textes de même taille dans une rubrique,
  bulles jaunes sur une seule ligne.
- N'aime pas : le look « cartoon » (photos penchées) ; texte trop gros ; photos coupées (vérifier les cadrages) ;
  qu'on change l'emplacement d'une photo sans le dire ; qu'on sorte de la charte.
- Veut voir des **maquettes en images** (captures) avant la mise en ligne, et une **seule image** par maquette complète.

## 9. Façon de travailler qui a bien marché

- Une branche par sujet, captures Playwright (Chromium préinstallé) envoyées à Marie, puis fusion
  `--ff-only` dans `main` et push quand elle valide. Vérifier la CI après chaque push.
- Commits signés `git -c user.name="Marie Sillas" -c user.email="marie.sillas@gmail.com"`.
- Serveur d'aperçu : `npx vite build` puis `npx vite preview --port 4173` en arrière-plan
  (il s'arrête tout seul après un moment, le relancer si besoin).
- Les maquettes de refonte complète (4 directions, HTML statique) sont sur la branche `maquettes-refonte`,
  dossier `maquettes/refonte/`. Marie a écarté la 1 ; elle a retenu des morceaux des 2, 3 et 4.
- Ne jamais enregistrer de captures d'écran dans le dépôt (c'est arrivé une fois).
