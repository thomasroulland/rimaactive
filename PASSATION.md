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
- E-mail : **marie.sillas.coaching@outlook.com**. Réseaux : **Instagram, Facebook et TikTok, tous @rimaactive** (4 novembre 2026 ; LinkedIn retiré à la demande de Marie ; adresses Facebook et TikTok à confirmer par Marie).
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
1. Haut de page (choisi par Marie, novembre 2026) : sur craie, « COACH SPORTIVE DIPLÔMÉE · HOUDAN (78) & ALENTOURS »
   en gris, « Coach / Marie » en grand (Marie souligné vermillon), accroche en italique, boutons « Qui suis-je »
   (contour encre, vers #approche) et « M'écrire » (jaune). À droite, la photo bras croisés (`portrait-contact.jpg`)
   dans un cadre arrondi, avec trois bulles blanches (Session de 60 min, Matériel fourni, Présentiel & en ligne)
   en bas à gauche ; sur téléphone, les bulles passent sous la photo. La barre de menu reste craie sur l'accueil.
   Le « M'écrire » de la barre est caché sur l'accueil jusqu'à la rubrique « Moi c'est Marie » ; « Accueil » ramène en haut.
2. « Moi c'est Marie » (ancre #approche, novembre 2026) : portrait entier (`portrait-marie.jpg`) et encadré arrondi de
   même hauteur sur fond craie foncé. Dans l'encadré : « Qui suis-je », « Moi c'est Marie » (« Marie » souligné vermillon,
   règle MotMisEnAvant de la charte), les 3 paragraphes écrits par Marie (karaté, six ans de salariat, méthode), avec ses sauts de ligne
   exacts sur grand écran (`<br className="saut" />`, masqués sous 1100 px),
   bouton jaune « Mes services » vers #accompagnement. Les pastilles Force/Endurance/Puissance/Mobilité sont retirées.
   Page À propos supprimée : c'est la seule présentation de Marie.
2 bis. « Ma méthode » (#methode, novembre 2026), fond blanc : « Ma méthode », « Pourquoi ça marche » (« marche » en
   vermillon), 4 principes numérotés en vermillon, puis « Vos objectifs » en 4 bulles jaunes : Transformation &
   Silhouette, Performance & Force, Condition physique & Endurance, Mental & Discipline (donnés par Marie).
3. Mes services (#accompagnement), fond craie foncé : « Mes services » puis « Trois façons de s'entraîner avec moi » sur
   une ligne, repères (Session de 60 min, Matériel fourni, Présentiel & en ligne) ; 3 cartes en bulles
   blanches qui se soulèvent au survol : photo, titre, « 4 à 16 personnes » / « 2 à 8 personnes » / « Domicile · Salle ·
   En ligne », phrase, prix « à partir de » et flèche ronde. Sur téléphone et tablette, cartes compactes.
4. « Les questions qu'on me pose » (#questions), fond blanc : « Avant de vous lancer » puis le titre sur une ligne ;
   6 questions qui s'ouvrent au clic : questions et réponses écrites par Marie (5 novembre 2026), reprises telles quelles.
   Réponse 2 : « …avant un retour au calme. » (durée retirée à la demande de Marie).
   La rubrique « Ma boîte à outils » (carrousel) est supprimée (BoiteOutils.jsx retiré).

**Bloc du bas** (`Pied.jsx`), encre, discret (5 novembre 2026, demandé par Marie : plus minimaliste) : sur une ligne
le logo, l'e-mail (la phrase « Basée à Houdan… » retirée à la demande de Marie),
Instagram / Facebook / TikTok en petites bulles ; sous un filet, « © année Rimaactive » et le lien « Mentions légales et
politique de confidentialité ». Ni menu des pages, ni bouton « M'écrire », ni grand titre « Contactez-moi ».

**Mes services (accueil, 6 novembre 2026)** : plus de prix (choix de Marie, crédit d'impôt services à la personne envisagé) ;
chaque carte mène à sa page, « Me contacter » (vermillon, 19 px gras) mène au formulaire avec l'offre cochée
(`/contact?offre=Entreprises`). Les prix des pages Entreprises / Duo et groupes / Individuel sont aussi masqués (6 novembre 2026, avec la mention
« Tarifs valables jusqu'au 30 avril 2027. TVA non applicable… ») : ils restent dans le code (`tarifs` des cartes),
il suffit de remettre `AFFICHER_TARIFS = true` dans `PageService.jsx` (et la mention `note`) pour les réafficher.

**Informations légales** (`/mentions-legales`, `InformationsLegales.jsx`) : une seule page en trois parties, Mentions
légales (#mentions), Politique de confidentialité (#confidentialite), Conditions générales de vente (#cgv). Les textes
des deux premières sont dans `MentionsLegales.jsx` et `Confidentialite.jsx` ; `/confidentialite` redirige vers
`#confidentialite`. Les CGV sont une trame : paiement, annulation, rétractation, certificat médical… sont « À compléter »
par Marie (ne rien inventer).

**Icône « Mon espace »** (haut à droite) : ouvre un message « En construction / Pour l'instant, rien n'est accessible
ici. » au centre de l'écran. Plus de page `/espace`.

**Pages Entreprises / Duo et groupes / Individuel** (`/entreprises`, `/communes`, `/particuliers`, gabarit
`src/components/PageService.jsx`, données dans `src/pages/*.jsx`), refaites le 31 octobre 2026 (mélange des
maquettes de refonte 2 et 3, couleurs de la 4) :
- en haut, un **bandeau photo** (la photo de la carte de l'accueil, voile encre) avec le nom de la page en grand
  (plus de lieux en jaune) ; sur Individuel, les onglets Présentiel / En ligne sont posés sur la photo à droite ;
  la barre de menu est transparente dessus, comme sur l'accueil ;
- dessous, les **cartes en pleine largeur**, blanches et encre, de même hauteur d'une page et d'un onglet à l'autre ;
  un pictogramme de la charte par formule, choisi par Marie : Active 60 entreprise, Active Day lieu, Active Duo
  groupe, Active Group extérieur, Active Solo barre, Active Flex kettlebell (en ligne : Start durée, Progress barre,
  Plus groupe). Sous les cartes, **centrées** : la liste cochée (lieu, « Matériel fourni : tapis, kettlebells, slam
  balls, etc. », « Déplacement inclus jusqu'à 20 km autour de Houdan (78) ») et les mentions de tarifs. Marie veut garder **3 pages distinctes** (mieux pour Google) ; pas d'encart « En ligne » dans
  l'onglet Présentiel (le bouton Présentiel / En ligne suffit).
- Sur ordinateur, bandeau + formules **remplissent exactement l'écran** : le bloc noir du bas n'apparaît qu'en
  défilant (demande de Marie du 2 novembre 2026 ; vérifier aussi en 1900 × 867, son grand écran). Cartes resserrées, liste « Compris » d'Active Flex
  sur deux colonnes. Les min-height des cartes sont en px avant le zoom automatique du site (`index.html`).
- Active 60, Active Day, Active Duo et Active Group ont « Compris pour chaque session », sur une colonne :
  Mobilité & Activation : 7 à 10 min, Corps de séance : 40 à 50 min, Retour au calme : 3 à 5 min (Marie, 5 novembre 2026).
- Survol à la souris des cartes de formules : la carte se soulève avec une ombre, le pictogramme grossit, « Choisir »
  passe en jaune (en craie sur la carte encre). Textes alignés au pixel près d'une carte et d'une page à l'autre.
- Entreprises : « 60 min · Ponctuel ou hebdomadaire », « Sur devis · Ponctuel » ; prix « À partir de 110 € par session »
  (180 € pour Active Day) ; plus de « Par séance » au-dessus ni de « Selon le nombre de personnes » dessous.
- Entreprises : Active 60 et Active Day ont la même structure : « Par séance / À partir de 110 € » (ou 180 €) /
  « Selon le devis et le nombre de personnes » (les tarifs 110 € de 4 à 8 pers. et 150 € de 9 à 12 ne sont plus affichés).
- Duo et groupes : Active Duo 85 € la séance (42,50 € par personne), Active Group 14 € par personne.
- Individuel (2 novembre 2026) : **trois formules seulement**, toutes sur la page ; le bouton Présentiel / En ligne
  **grise** les formules de l'autre mode (pas de clic). Les anciens programmes en ligne Start 35 € et Progress 40 €,
  et l'offre Bilan postural seule, sont retirés.
  - Active Start (« Séance à l'unité », présentiel) : 65 € domicile / 55 € salle, « Compris pour chaque session ».
  - Active Progress (« Suivi mensuel », présentiel) : 220 € domicile / 180 € salle (prix global, pas de prix par séance) ;
    Compris : Bilan initial & postural, Programme 100 % personnalisé, 4 sessions de coaching privé, Suivi hebdomadaire
    sur WhatsApp, Bilan de progression mensuel.
  - Active Plus (« Suivi trimestriel », en ligne) : 12 semaines, 240 €, « 80 € par mois pendant 3 mois » ; Compris :
    Bilan initial, Programme 100 % personnalisé, Suivi hebdomadaire sur WhatsApp, Bilan de progression mensuel.
  - En mode En ligne, pas de liste cochée sous les cartes (seulement les mentions).
- Duo et groupes : « 60 min · À domicile ou en extérieur » / « 60 min · En extérieur » ; « 85 € par session » et
  « 14 € par personne et par session » (plus de « Par séance » ni de « 42,50 € par personne »).
- Tailles identiques sur les trois pages : prix 56 px (44 px sur petit portable), tout le texte des cartes en 14 px,
  liste cochée 16 px, noms des formules 32 px.
- Déplacement inclus jusqu'à 20 km autour de Houdan (78). Tarifs valables jusqu'au
  30 avril 2027. TVA non applicable, art. 293 B du CGI.

**Page M'écrire** (`/contact`) (maquette de refonte 2) : le portrait bras croisés de Marie (`portrait-contact.jpg`,
nouvelle version envoyée le 2 novembre 2026, 1121 × 1403, qualité 92) sur un peu moins de la moitié gauche (0.8fr / 1.2fr) ; à droite
« Besoin d'en savoir plus ? », « Contactez-moi » (« moi » souligné vermillon), la phrase sur les déplacements (plus
l'e-mail, retiré à la demande de Marie le 5 novembre 2026), puis le formulaire (message plus haut) ; le « M'écrire »
jaune de la barre est caché sur cette page
(5 novembre 2026, demandé par Marie) Prénom et nom / E-mail / Téléphone (obligatoires) / Nom de l'entreprise (seulement
si « Entreprises » est choisi) / « Vous êtes intéressé(e) par » Entreprises · Duo et groupes · Individuel (bulles) /
Formule (facultatif, liste des formules de l'offre choisie, prise dans les pages) / Votre message (facultatif) /
case d'accord / Envoyer. Venant du bouton « Choisir » d'une carte (`?formule=Active Progress · Présentiel`),
l'offre et la formule sont déjà remplies ;
en bas seulement la ligne des mentions. Tient sur un écran d'ordinateur.
⚠️ Le formulaire **n'envoie rien** pour l'instant (simple message de confirmation) : à brancher
(Formspree ou autre) si Marie le demande.

**Aperçu de partage** : image prête dans `public/apercu-partage.jpg` (photo, « Coach sportive diplômée ·
Houdan (78) », « Marie Sillas »), balises og:title / og:description dans `index.html`. **Manque** og:image
et og:url, qui demandent l'adresse complète du site : Marie doit d'abord acheter son nom de domaine.

**Description pour Google** (`index.html`) : « Marie Sillas, coach sportive diplômée basée à Houdan (78) : … ».

## 6. Travail en cours

Rien en attente de mise en ligne. Les branches de maquettes (`maquette-*`, `approche-maquette1`,
`accueil-refonte`…) sont toutes fusionnées ou abandonnées.

## 7. Questions ouvertes à reposer à Marie

1. **Nom de domaine** (Marie doit l'acheter) : ensuite ajouter og:image et og:url dans `index.html`.
2. Confirmer les adresses **Facebook** et **TikTok** @rimaactive (dans `RESEAUX`, `src/components/liens.js`).
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

- Marie a refusé le bouton « M'écrire » fixe en bas de l'écran sur téléphone : ne pas le remettre.


## Réorganisation du 9 novembre 2026 (demandée par Marie)

- **Menu** : Accueil · Individuel (`/particuliers`) · Groupes (`/groupes`, ancien `/communes` redirigé) · Entreprises · En ligne (`/en-ligne`).
- **Accueil** : inchangé, sans prix ; « Mes services » a 4 tuiles (Entreprises, Groupes 2 à 8 personnes, Individuel « Domicile · Salle »,
  En ligne avec la photo `service-en-ligne.jpg` envoyée par Marie) ; titre « Quatre façons de s'entraîner avec moi ».
- **Pages de service avec prix** (`AFFICHER_TARIFS = true` dans `PageService.jsx`) :
  Individuel : À domicile 70 € la séance, Suivi mensuel 260 €/mois (4 séances à domicile, programme personnalisé, suivi inclus),
  En salle 60 € ; Groupes : 70 € la séance (2 à 8 pers.) ; Entreprises : à partir de 120 € la séance, devis gratuit sous 48 h
  (bouton « Demander un devis ») ; En ligne : Active Plus 240 € les 12 semaines ou 3 × 80 € (programme, suivi hebdo, bilans).
  Sous les cartes : déplacements compris jusqu'à 20 km autour de Houdan, au-delà sur devis ; TVA non applicable, art. 293 B du CGI.
- **Supprimés** : Active Day, Duo, Active Start, Active Flex, Active Progress et tous les anciens prix. Aucune mention de crédit d'impôt.
- **Bas de page** : « Mentions légales » (mentions + confidentialité) et « CGV » (`/cgv`, page vide « en cours de rédaction »).
- **Haut de l'accueil (publié le 9 novembre 2026)** : photo de Marie entière contre le bord gauche (sans bulles), texte posé dessus
  à gauche ; à droite les captures de son outil de suivi, une à la fois, qui glissent vers la gauche (`CAPTURES` dans `Accueil.jsx`,
  styles `.heros--v3`). Pour l'instant des emplacements gris : remplacer par les images de Marie quand elle les envoie.

- **Ordre de l’accueil (9 novembre 2026)** : haut de page, Pourquoi ça marche, Mes services (4 tuiles), Les questions, Qui suis-je (en dernier).
  « Me contacter » des tuiles en encre (plus de vermillon). Le « M’écrire » de la barre apparaît dès qu’on quitte le haut de page.

- **Détail des formules (10 novembre 2026)** : un clic sur une carte (ou « Voir le détail + ») ouvre la formule en grand, fond blanc
  (`dialog.detail` dans `PageService.jsx`). Pour ajouter des rubriques : `detail: [[titre, texte], …]` dans la carte.

- **Offres au 10 novembre 2026** : À domicile Séance à l’unité 70 € · Suivi mensuel 260 €/mois (soit 65 € la séance) ; En salle Séance à l’unité 60 € ·
  Suivi mensuel 220 €/mois (soit 55 € la séance) ; Groupes 70 € la séance ; Entreprises sur devis ; En ligne Suivi mensuel 150 € les 3 mois ou 3 × 50 €.

- **Page unique « Mes offres » (`/offres`, `Offres.jsx`, 10 novembre 2026)** : menu Accueil · Mes offres ; bulles collantes Individuel · Groupes ·
  Entreprises · En ligne ; Individuel garde les boutons À domicile / En salle (2 cartes) ; les autres rubriques : photo + carte.
  Les anciennes adresses (/particuliers, /groupes, /entreprises, /en-ligne, /communes) mènent à leur rubrique. Les formules restent
  dans Particuliers.jsx, Groupes.jsx, Entreprises.jsx, EnLigne.jsx (le formulaire de contact s’en sert aussi).

## Barre de menu et page M'écrire (10 novembre 2026, choisis par Marie en mode live)

- **Menu** (`Entete.jsx`, `.nav__lien`) : mots simples, 14 px, en petites pilules de 30 px ; la page en cours est une pilule
  encre, texte craie ; au survol, le jaune monte du bas et le mot « roule » vers le haut (son double, `data-texte`).
  Plus de soulignement vermillon dans le menu (Marie trouve qu'il y en a déjà beaucoup sur le site).
- **« M'écrire »** de la barre (`.entete__ecrire`) : pilule jaune 32 px, minuscules 14 px, la flèche dans une pastille encre
  qui tourne au survol.
- **Page M'écrire** (`Contact.jsx`) : l'offre d'abord (bulles), puis Formule | Prénom et nom, puis E-mail | Téléphone
  (+ Nom de l'entreprise sur la même ligne si « Entreprises » est coché : rien ne bouge). Champs plus doux : contour fin
  couleur filet, coins 10 px, intitulés en 600 ; bulles d'offre sans gros contour (la cochée en encre).
  La case d'accord et « Envoyer » sont sur la même ligne ; « Envoyer » : petite pilule jaune de largeur fixe (118 px),
  la flèche n'apparaît qu'au survol, sans rien décaler. Sur ordinateur, la photo descend jusqu'en bas et la page ne défile
  pas : la ligne des mentions est posée en bas, à droite de la photo (`.pied--mentions` en position fixe ≥ 900 px).
- Écart à la charte accepté par Marie : le contour des champs de M'écrire est en filet (plus clair que le gris contrôle).

## Règle de mise en ligne (10 novembre 2026)

Marie a demandé : **rien en ligne ni sur GitHub sans son accord écrit**, et une image avant / après avant toute modification
définitive. Cette règle remplace « Mise en ligne sans demander » de CLAUDE.md.
## Changements du 11 et 12 novembre 2026 (choisis par Marie en mode live)

- **Barre de menu** : fond encre sur toute la largeur, logo craie ; le menu (Accueil, Mes offres) est à droite ; page en cours
  en pilule craie, au survol le jaune monte et le mot roule. « M'écrire » est collé au menu, séparé par un trait fin, en texte
  craie avec la flèche dans une petite pastille jaune. Quand « M'écrire » est caché (haut de l'accueil, page M'écrire),
  il ne garde plus sa place : le menu se colle à droite, puis « M'écrire » se déplie en glissant et pousse le menu.
- **Haut de l'accueil** : « Marie Sillas » sur une ligne ; boutons « M'écrire » (jaune, flèche en pastille encre)
  puis « Qui suis-je » (contour craie, vers #approche).
- **Mes offres** : la fin de page (photo + « Vous hésitez entre deux formules ? ») est supprimée ; il ne reste que la mention
  « TVA non applicable, art. 293 B du CGI. », discrète.

- **Prix du 12 novembre 2026 (validés et publiés par Marie)** : Individuel (à domicile seulement, « En salle » retiré pour l'instant) :
  Séance à l'unité 70 € la séance, « soit 35 € après crédit d'impôt » ; Suivi mensuel « 60 € × 4 séances », « soit 30 € la séance après
  crédit d'impôt » (plus de total par mois). En ligne : 45 € par mois, « soit 135 € les 3 mois », « Engagement de 3 mois » sous le titre.
  Déplacements compris jusqu'à 20 km autour de Houdan (plus de « au-delà sur devis »). Sur les cartes de « Mes offres », seulement
  « Voir le détail » ; « Choisir cette formule » est dans le détail. Le crédit d'impôt est désormais affiché, à la demande de Marie.

- **Mentions légales complétées (12 novembre 2026, validé par Marie)** : adresse 26 rue d'Epernon 78550 Houdan, SIRET, TVA, diplôme
  (CQP Instructeur Fitness), carte pro en cours (SDJES des Yvelines, numéro à ajouter à réception), assurance Hiscox, messagerie Outlook.
  **Exception à la règle « pas de téléphone »** : le numéro de Marie figure uniquement dans les mentions légales, à sa demande.
  Restent à compléter : médiateur de la consommation ; service d'envoi du formulaire à ajouter dans la confidentialité quand il sera branché.
  La rubrique « Données personnelles » des mentions (doublon du lien vers la politique) est supprimée.

## Espace client (12 novembre 2026, sur la branche espace-client-spec, pas en ligne)

Espace connecté pour les clients (programme, séances, charges) et pour Marie (coachés, banque d'exercices, éditeur de
programme). **Rien n'est en ligne ni sur GitHub** : tout est sur la branche `espace-client-spec`, `main` n'est pas touché.
Conception : `docs/superpowers/specs/2026-11-12-espace-client-design.md` ; plan : `docs/superpowers/plans/2026-11-12-espace-client.md`.
Pour mettre en route (Firebase, Vercel, rôle coach) : **`docs/espace-mise-en-route.md`**.

- **Où sont les fichiers** : écrans dans `src/espace/` (`coach/` pour Marie, `client/` pour les clients, `donnees/` pour les calculs
  purs, `depots.js` pour Firestore / Storage / API, `espace.css` pour les styles). Routes `/espace/*` chargées à la demande
  (`lazy()` dans `src/App.jsx`) : le site vitrine ne charge **jamais** Firebase. API serveur dans `api/` (`inviter.js`,
  `supprimer-client.js`, `_admin.js`), règles dans `firestore.rules` et `storage.rules`, rôle coach avec
  `scripts/definir-coach.mjs`. Tests : `tests/donnees` (purs), `tests/regles` (émulateurs), `tests/api`.
- **Lancer en local** (Java 21 requis pour les émulateurs) : `npx firebase emulators:start --project demo-rimaactive --only firestore,storage,auth`
  puis, dans un autre terminal, `VITE_FIREBASE_EMULATEURS=1 npm run dev`. Aucune vraie clé n'est utilisée.
- **Vérifier** : `npm test`, `npm run test:fuseaux` (dates sous d'autres fuseaux), `npm run test:regles` (lance les émulateurs tout seul),
  `npm run build`. La CI (`.github/workflows/ci.yml`) fait la même chose, Java 21 compris.
- **Secrets** : seulement dans Vercel. `VITE_FIREBASE_*` (publiques) et `FIREBASE_SERVICE_ACCOUNT` (JSON secret) ; ajouter
  `FIREBASE_STORAGE_BUCKET` (obligatoire) avec le nom du bucket affiché dans la console (les projets récents finissent par
  `.firebasestorage.app`) : sans lui, la suppression d'un client s'arrête avant d'effacer quoi que ce soit (erreur 500
  `configuration`). Ne jamais coller une clé dans la discussion.
- **Sécurité** : les règles n'ouvrent rien à un compte sans rôle (`client` ou `coach`) ; l'inscription libre doit aussi être
  fermée dans la console (guide, étape 3). Suppression d'un client : photos, puis séances et programmes, puis compte, puis
  profil (relançable après une panne). Invitation : si l'écriture du rôle ou du profil échoue, le compte créé est supprimé.
- **Déconnexion** (`seDeconnecter()` dans `src/espace/firebase.js`) : efface la copie hors ligne (IndexedDB) et recharge.
- **Données** : dates de programme en jours locaux `AAAA-MM-JJ` (chaînes). Une séance faite a l'identifiant `programme_séance` :
  un double appui sur « Fin de séance » ne crée qu'une séance.
- **Confidentialité** : `src/pages/Confidentialite.jsx` contient un **brouillon** (Google Firebase comme prestataire, données de
  l'espace, stockage de session, durées). À relire par Marie. La date « mis à jour le » (`InformationsLegales.jsx`, `miseAJour`)
  n'a pas été changée : à régler le jour de la publication.
- **Textes écrits par Claude à faire valider par Marie** : textes de l'espace (écrans, messages d'erreur), modèle d'e-mail
  d'invitation du guide, accord santé, brouillon de confidentialité.

**Décisions qui restent à Marie avant toute mise en ligne**
1. **HDS** : le suivi de la douleur et du ressenti est une donnée de santé. Faire valider, avant d'inviter de vrais clients, si
   l'hébergement choisi suffit ou s'il faut un hébergeur certifié HDS. En attendant, comptes de test seulement.
2. **Vercel Pro** : le forfait gratuit (Hobby) est non commercial ; passer en Pro avant la mise en service.
3. Créer le projet Firebase (Blaze avec alerte de budget d'abord, puis Firestore et Storage en `europe-west`), renseigner les variables
   Vercel (`FIREBASE_SERVICE_ACCOUNT` en « Sensitive », donc non relisible), déployer les règles et les index, donner le rôle coach
   (tout est décrit dans le guide). Claude peut déployer les règles ; `definir-coach.mjs` est lancé par Marie elle-même sur son ordinateur
   (la clé ne passe jamais par la discussion). Firebase Authentication n'a pas de région réglable : le texte
   de confidentialité ne doit affirmer l'hébergement UE que pour Firestore et Storage, une fois la région réellement choisie.
4. Valider la confidentialité, puis donner son **accord écrit** après avoir vu les captures avant / après.

## Espace coaché (13 novembre 2026, sur la branche espace-client-spec, pas en ligne)

Les écrans du coaché ont été refaits d'après la **maquette de Marie** (`Main.dc.html`, dans son artefact de design) : mise en page,
textes, tailles et couleurs de la maquette font foi. **Rien n'est en ligne ni sur GitHub.** Conception :
`docs/superpowers/specs/2026-11-13-espace-coache-maquette-design.md` ; plan : `docs/superpowers/plans/2026-11-13-espace-coache-maquette.md`.

- **Coque** (`src/espace/coque/Coque.jsx`) : barre noire (logo, liens selon le rôle, rond du compte avec menu « Déconnexion ») et pied
  de l'espace. Elle remplace l'ancienne barre du bas.
- **Style adouci** : toutes les valeurs (champs 1 px, rayon 10 px, cases, notes d'effort, pastilles, titres repliables) sont des
  variables `--ec-*` dans **un seul fichier**, `src/espace/coache.css`. Pour changer le style, on change là, pas dans les écrans.
  La barre noire, la carte noire, le jaune, le vermillon et le focus 2 px encre n'ont pas bougé.
- **Écrans** (`src/espace/client/`) :
  - tableau de bord (`TableauDeBord.jsx`) : avatar, « Bonjour, », avancement « Séance n sur N », carte noire de la prochaine séance,
    onglets « Cette semaine » (`CetteSemaine.jsx`) et « Ma progression » (`MaProgression.jsx`, rubriques repliables : mes mesures,
    mes photos, mes charges, mes séances) ;
  - « Mon programme » (`MonProgramme.jsx`) : blocs (en cours, terminé, à venir) puis semaines et séances ;
  - séance (`Seance.jsx`, `BlocSeries.jsx`, `BlocResultat.jsx`) : force (séries, EMOM, Tabata, AMRAP) et course ; fenêtre « Consignes »
    (`Consignes.jsx`, photos et consignes de l'exercice) ; fin de séance (`FinDeSeance.jsx`, effort de 5 à 10, ressenti, commentaire).
  - Calculs purs dans `src/espace/donnees/progression.js` (avancement, bloc en cours = le plus récent publié dont la date de début est
    passée, semaine, mesures lues « à la française » : 72,5).
  - Retirés : `Accueil.jsx`, `Programme.jsx`, `MesCharges.jsx`, `ExerciceSeance.jsx` ; les anciennes règles `.client-*` de `espace.css`
    qui n'étaient plus utilisées ont été supprimées (les écrans du coach et du coaché sont restés identiques, image par image).
- **Nouvelles données** (règles Firestore et Storage mises à jour, testées) :
  - `utilisateurs/{uid}` : champ `avatar` (chemin Storage `clients/{uid}/profil/<fichier>`) ; sous-collections `mesures` (poids, tour de
    taille, etc., nombres ou vides) et `photos` (chemin Storage `clients/{uid}/…`). Photos réduites avant envoi ; les photos d'iPhone (HEIC)
    ou trop lourdes sont refusées avec les mêmes messages que la banque d'exercices.
  - `seancesFaites` : `notes` (note par exercice), `blocs` (résultat par bloc, `resultat` et, pour l'AMRAP, `reps`), `commentaire`,
    `effort` de 5 à 10 (facultatif), course : `fc` et `zones` (Z1 à Z5, en %). Le champ `douleur` n'est plus demandé (les anciennes
    séances le gardent). Une carte vide n'est jamais envoyée avec `merge`, pour ne pas effacer ce qui est déjà enregistré.
  - La suppression d'un client efface aussi mesures, photos et avatar.
  - Écriture hors ligne : l'enregistrement part tout de suite, le message dit « Enregistré sur votre téléphone, envoyé au retour du réseau. ».
- **Ce qui reste côté coach** (non refait, inchangé) : écrans de Marie (mes coachés, banque d'exercices, éditeur de programme, fiche
  client). Elle ne voit pas encore le commentaire ni les notes par exercice du coaché, ni les mesures et photos de progression. Les champs
  « Effort visé » de la course et « Matériel » n'existent pas dans le programme : leurs zones sont masquées côté coaché jusqu'à ce que
  l'éditeur les propose.
- **Rappel HDS** : le ressenti, le commentaire, l'effort, la fréquence cardiaque, les mesures du corps et les photos de progression sont
  des données de santé, plus nombreuses qu'avant. La question de l'hébergeur certifié HDS (voir ci-dessus) est donc plus pressante :
  comptes de test seulement tant qu'elle n'est pas tranchée, et la confidentialité doit citer ces nouvelles données.
- **Vérifié** : `npm test` (107), `npm run test:vercel`, `npm run test:fuseaux`, `npm run test:regles`, `npm run build` ; planches
  maquette / construit des sept écrans, à 1280 et à 390 px, aucun défilement horizontal.

**Décisions prises pendant le chantier** (à confirmer ou changer par Marie)
1. « Mes charges » vit dans « Ma progression » (plus d'écran séparé).
2. Quand la maquette et le plan se contredisent, la **maquette gagne** : message de mesures vides « Remplissez au moins une mesure. ».
3. Course : « FC moyenne » et « Temps passé par zone » sont à saisir, comme dans la maquette.
4. AMRAP : deux champs, « Tours complets » et « Reps en plus », comme dans la maquette.
5. L'effort n'est pas obligatoire pour enregistrer la séance (la maquette l'autorise).
6. Après « Enregistrer ma séance », la séance est **en lecture seule** (pas de « Mettre à jour ma séance » de la maquette), pour garder des
   données fiables côté coach. À rouvrir si Marie veut pouvoir corriger.
7. Style adouci conservé sur les titres de bloc et « Mon résultat » (Marie avait demandé moins de contraste).
8. Dates de « Mes séances » comme dans le code de la maquette (« Jeu. 12 nov. ») ; graphiques à 6 points pour tenir à 390 px.
9. « Mes séances » n'affiche pas le segment « RPE séries » de la maquette ; sans distance ni temps, une course n'affiche pas de bilan.

**Textes écrits par Claude, à faire valider par Marie** (les autres textes viennent de la maquette)
- Mesures : « Indiquez des nombres, par exemple 72,5. » ; « Ajoutez une deuxième mesure pour voir votre évolution. ».
- Progression : « Envoi en cours… » ; « Impossible de charger vos photos. Vérifiez votre connexion. » et « … vos mesures. … » ;
  « Enregistré sur votre téléphone, envoyé au retour du réseau. » ; « Pas de connexion internet. Vérifiez votre réseau. ».
- Mon programme : « 1 séance faite sur 12 » / « 0 séance faite sur 12 » (singulier, la maquette met toujours le pluriel) ;
  « Votre prochain bloc apparaîtra ici. » ; libellés pour lecteurs d'écran « Bloc n, En cours · … », « Semaine n, en cours »,
  « Séance n, titre, statut ».
- Séance : « Pas encore de photo pour cet exercice. » ; « Séance introuvable » et « Cette séance n'est plus dans votre programme… » ;
  « Marie n'a pas encore ajouté d'exercice à cette séance. » ; « Exercice retiré du programme » / « Marie a retiré cet exercice… » ;
  « Notes enregistrées sur votre téléphone… », « Séance enregistrée sur votre téléphone… », « Vos notes n'ont pas pu être envoyées… »,
  « Séance déjà enregistrée. » ; libellés pour lecteurs d'écran « Voir les photos et consignes : {nom} », « Fermer la fiche ».
- Coque : « Mon compte » et « Rimaactive, mon espace » (lecteurs d'écran seulement).
