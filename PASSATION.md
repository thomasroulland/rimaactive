# Passation — site Rimaactive

Document de reprise pour une nouvelle discussion avec Claude. À lire en entier avant de toucher au site.
Mis à jour le 30 octobre 2026.

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
- Photos du site sous les portraits : cadre droit posé sur un **aplat jaune décalé** (Marie y tient : « moins fade »).

## 4. Contraintes de mise en page

- **Chaque rubrique tient sur un écran** à 100 % : vérifier à 1536 × 692 (écran de Marie, zoom 125 %)
  et 1280 × 620 (petit portable), puis sur téléphone (390 × 844, les rubriques s'empilent).
- `index.html` contient un script de mise à l'échelle (variables `--ecran`, `--vw`, `--largeur`) ;
  `.section.ecran-plein` fait tenir une rubrique dans l'écran.
- Barre de menu : **45 px**, même hauteur que le bandeau vermillon de l'accueil.

## 5. État actuel du site (branche `main`, en ligne)

**Accueil** (`src/pages/Accueil.jsx`), dans l'ordre :
1. Haut de page : photo noir et blanc du squat calée à droite (`heros-squat-nb.jpg`, `right: -55px` pour
   ne pas la couper), voile encre, « Marie Sillas / Coach sportive », accroche en italique,
   boutons « Mon accompagnement » (clair) puis « M'écrire » (jaune). Bandeau vermillon :
   20 km autour de Houdan (78) · Sessions de 30 à 60 min · Matériel mis à disposition.
2. Mon approche : portrait (`portrait-marie.jpg`, recadrage choisi par Marie) + texte + « Qui suis-je ? ».
   → **en cours de refonte**, voir § 6.
3. Mon accompagnement : 3 cartes photo Entreprises (photo pleine de kettlebells), Groupes
   (3-4 kettlebells, photo calée en bas), Individuel (barre + kettlebell) ; jaunes au survol.
4. Ma boîte à outils : carrousel en boucle (`BoiteOutils.jsx`), 6 formats
   (Density Training, Circuit training, EMOM, AMRAP, Complex, Balistique).
5. Ma zone d'intervention : carte OpenStreetMap (image), Où / Déplacement (« Compris dans toute la zone »,
   picto voiture) / Lieux / Durée.
6. Bloc noir « Besoin d'un accompagnement ? Contactez-moi » + bouton « M'écrire », puis pied de page centré.

**Pages Entreprises / Groupes / Individuel** (`/entreprises`, `/communes`, `/particuliers`, gabarit
`src/components/PageService.jsx`, données dans `src/pages/*.jsx`) : un seul écran.
À gauche : fil d'Ariane, surtitre, grand titre « Formules », phrase, liste cochée, « M'écrire », mentions.
À droite : une carte par formule (la dernière en encre), prix en grand, bouton « Choisir » qui ouvre
`/contact?formule=…` avec la formule pré-remplie et le profil coché. Individuel a un sélecteur
À domicile / En salle / En ligne. Tarifs repris de la fiche « Formules et tarifs » du design system
(valables jusqu'au 30 avril 2027) :
- Entreprises : Active 60 (110 € la séance de 4 à 8 pers., 150 € de 9 à 12), Active Day (dès 180 €, sur devis).
- Groupes : Active Duo 85 € la séance, Active Group 14 € par personne.
- Individuel présentiel : Active Solo 65 € domicile / 55 € salle ; Active Flex 220 € / 180 € par mois.
  Bilan postural + correctifs seul : 70 €.
- En ligne (8 semaines) : Active Start 35 €, Active Progress 40 €, Active Plus 160 € ou 2 × 80 €.
- Déplacement compris dans 20 km autour de Houdan ; au-delà, sur devis. TVA non applicable, art. 293 B du CGI.

**Contact** : formulaire (formule choisie, Vous êtes : Entreprise / Groupe / Particulier).
⚠️ Le formulaire **n'envoie rien** pour l'instant (simple message de confirmation) : à brancher
(Formspree ou autre) si Marie le demande.

## 6. Travail en cours (pas encore en ligne)

Branche **`approche-maquette1`** (poussée, non fusionnée dans `main`) :
- « Mon approche » refaite façon « maquette 1 » : portrait à fond perdu sur la moitié gauche,
  encadré fin à droite (surtitre « Mon approche », titre « S'entraîner moins, mais mieux », texte,
  citation en italique), **sans** « Qui suis-je ? ».
- **Page À propos supprimée** (route, fichier et liens du menu/pied) : cet encart est la seule présentation de Marie.
- 4 points en petit : 01 Force, 02 Endurance, 03 Puissance, 04 Mobilité, avec 3 présentations à comparer
  via `?points=1|2|3` : (1) rangée de 4 colonnes avec filets, (2) deux lignes de deux, (3) pastilles.
- **En attente** : Marie doit choisir 1, 2 ou 3. Ensuite : garder seulement la version choisie,
  retirer le paramètre `?points=` et le code des autres versions, vérifier l'écran, fusionner dans `main`.

## 7. Questions ouvertes à reposer à Marie

1. Version des 4 points de « Mon approche » (1, 2 ou 3).
2. Taille du texte courant : la charte dit 18 px (« site-texte ») et 16 px (« corps ») ; le site est en 16 px. Corriger la charte ?
3. Prix supprimés en Groupes (Duo au mois 300/540 €, Group 12 € dès 7 inscrits) : existent-ils encore ?
4. Picto voiture « Déplacement » : absent des 11 pictos de la charte, l'ajouter ou en choisir un autre ?
5. Textes écrits par Claude à valider : surtitres et descriptions courtes des cartes de formules, listes cochées.
6. Maquettes complètes inspirées d'autres sites (maquette 1 « FORME » et maquette 2 « X1 / Regex ») :
   Marie aime les deux et veut mixer rubrique par rubrique. Grille de choix proposée :
   A en-tête, B haut de page, C accompagnement, D approche, E formules, F boîte à outils, G contact,
   H numéros verticaux. Elle a déjà retenu de la maquette 1 : le design des formules (fait) et « Mon approche » (en cours).
7. Mentions légales : SIRET, carte professionnelle, assurance RC pro, médiateur à compléter.

## 8. Ce que Marie a déjà dit (préférences)

- Aime : cartes jaunes au survol, aplat jaune sous les photos, formules en cartes sur fond clair,
  pages courtes qui tiennent sur un écran, bouton « Choisir » sur chaque formule.
- N'aime pas : le look « cartoon » (photos penchées) ; texte trop gros ; photos coupées (vérifier les cadrages) ;
  qu'on change l'emplacement d'une photo sans le dire ; qu'on sorte de la charte.
- Veut voir des **maquettes en images** (captures) avant la mise en ligne, et une **seule image** par maquette complète.

## 9. Façon de travailler qui a bien marché

- Une branche par sujet, captures Playwright (Chromium préinstallé) envoyées à Marie, puis fusion
  `--ff-only` dans `main` et push quand elle valide. Vérifier la CI après chaque push.
- Commits signés `git -c user.name="Marie Sillas" -c user.email="marie.sillas@gmail.com"`.
- Serveur d'aperçu : `npx vite build` puis `npx vite preview --port 4173` en arrière-plan
  (il s'arrête tout seul après un moment, le relancer si besoin).
- Ne jamais enregistrer de captures d'écran dans le dépôt (c'est arrivé une fois).
