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
   blanches qui se soulèvent au survol : photo, titre, « 4 à 16 personnes » / « 2 à 10 personnes » / « Domicile · Salle ·
   En ligne », phrase, prix « à partir de » et flèche ronde. Sur téléphone et tablette, cartes compactes.
4. « Les questions qu'on me pose » (#questions), fond blanc : « Avant de vous lancer » puis le titre sur une ligne ;
   6 questions qui s'ouvrent au clic (réponses écrites par Claude à partir du site, à faire relire par Marie).
   La rubrique « Ma boîte à outils » (carrousel) est supprimée (BoiteOutils.jsx retiré).

**Bloc du bas** (`Pied.jsx`), encre, discret (5 novembre 2026, demandé par Marie : plus minimaliste) : sur une ligne
le logo et « Basée à Houdan, je me déplace dans les Yvelines (78), / l'Eure-et-Loir (28) et l'Eure (27). », l'e-mail,
Instagram / Facebook / TikTok en petites bulles ; sous un filet, « © année Rimaactive » et le lien « Mentions légales et
politique de confidentialité ». Ni menu des pages, ni bouton « M'écrire », ni grand titre « Contactez-moi ».

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
« Besoin d'en savoir plus ? », « Contactez-moi », la phrase sur les déplacements, l'e-mail, puis le formulaire
Prénom et nom / E-mail / (Formule choisie) / Vous êtes / Votre message (facultatif) / case d'accord / Envoyer ;
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
