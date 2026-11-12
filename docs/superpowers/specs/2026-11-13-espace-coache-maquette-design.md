# Espace coaché à l'identique de la maquette : projet

13 novembre 2026. Décisions de Marie dans la discussion du 12-13 novembre. Remplace, pour les écrans du coaché
seulement, la partie « Client » du projet du 12 novembre (`2026-11-12-espace-client-design.md`), qui reste valable pour
tout le reste (Firebase, invitation, rôles, règles, espace coach).

Référence visuelle : maquette « Espace coaching · ordinateur » (`Main.dc.html`) de l'artefact
https://claude.ai/artifact/1QFtKuZVoggcyj43ASftEu, avec le **style adouci validé par Marie le 13 novembre** (voir §2).
Captures de référence de chaque état de la maquette : à refaire au début de la construction (la maquette s'ouvre en
local avec `artifact-type/dc-runtime.js` servi comme `support.js`).

## 1. Ce que Marie a décidé

- Option « A » : tout ce que contient la maquette du coaché, maintenant, avec la même apparence.
- **Seulement les pages du coaché.** L'espace coach garde ses écrans et fonctions actuels ; il sera repris plus tard.
- Rendu « joli » : champs à trait fin, moins de contraste (§2).

## 2. Style

La maquette fait foi pour la mise en page, les textes, les tailles et les couleurs, avec ces adoucissements validés :

- champs : trait 1 px `#d9d5cd`, rayon 10 px ; survol `#b9b4ab` ; focus trait `#57534e` et halo `0 0 0 3px rgba(22,21,20,.08)` ;
- cases « Fait » et « Bloc fait » : trait 1,5 px `#c9c4bb`, rayon 12 px ; cases de régularité : 1,5 px `#b9b4ab` ;
- notes d'effort, choix de ressenti, pastilles de semaines : trait 1 px `#d9d5cd`, fond blanc ; choisi = jaune signal
  avec texte encre (comme la maquette) ;
- titres des rubriques repliables : filet 1 px `#dcd9d2` ; rond « + / – » : trait 1 px `#d9d5cd` ;
- titres de rubrique (Ma semaine, Fin de séance, Mes blocs…) en Hanken Grotesk (pas la police de remplacement) ;
- inchangés : barre noire, carte noire, jaune des boutons, vermillon (numéros, soulignés), anneau de focus 2 px encre.

## 3. Présentation générale

- `/espace` sort de la présentation du site vitrine : ni menu ni pied du site. Une barre noire propre à l'espace
  (logo craie à gauche ; à droite « Tableau de bord », « Mon programme » soulignés vermillon pour la page en cours, rond
  de compte) et un pied simple (« Marie Sillas · Coach sportive diplômée » à gauche, e-mail à droite), comme la maquette.
- La page de connexion et l'accord utilisent la même barre (logo seul).
- L'espace coach garde ses écrans et ses onglets actuels, sous cette même barre noire (logo seul à gauche, ses propres
  onglets inchangés).
- Téléphone d'abord (390 × 844), ordinateur ensuite (1280 × 800), comme la maquette ; aucune barre de défilement
  horizontale.

## 4. Écrans du coaché

### Tableau de bord (`/espace`)
- Avatar (initiales ou photo, pastille « + » pour ajouter ou changer la photo), « Bonjour Prénom, nous sommes {date}. »,
  titre « Séance n sur N » et barre d'avancement fine (séances faites / prévues).
- Carte noire de la prochaine séance : surtitre « Séance n » en jaune, titre, lieu et objectif, bouton « Ouvrir ma
  séance ». États sans programme, avant le début et programme terminé : textes actuels.
- Onglets « Cette semaine » (liste des séances de la semaine, case cochée si faite, « À faire » / « Faite ») et
  « Ma progression ».

### Ma progression (onglet du tableau de bord)
Rubriques repliables comme la maquette :
- **Ma régularité** : une ligne par semaine, cases par séance, « n séance(s) sur N faite(s) » ;
- **Mes charges** : meilleure charge par exercice au fil des séances (`meilleuresCharges`, séries `fait: false` exclues) ;
  texte vide de la maquette ;
- **Mes séances** : séances enregistrées (date, titre, effort, ressenti) ; texte vide de la maquette ;
- **Mes photos** : « Privées : visibles uniquement par vous et Marie. », date de la photo + « Ajouter une photo »,
  galerie par date avec suppression ; texte vide de la maquette ;
- **Mon poids et mes mensurations** : texte de la maquette, formulaire Date, Poids (kg), Tour de taille, de hanches, de
  poitrine, de bras, de cuisse (cm), « Enregistrer mes mesures », historique (tableau) avec suppression d'une ligne.

### Mon programme (`/espace/programme`)
- Surtitre prénom nom, titre « Mon programme ».
- **Mes blocs** : un bloc par programme publié du client, du plus ancien au plus récent ; en cours = jaune avec point
  vermillon, « En cours · semaine n sur N », dates de début et de fin ; passés en trait clair ; carte « Votre prochain
  bloc apparaîtra ici. » à la fin. Choisir un bloc affiche ses semaines.
- **Mes semaines** : pastilles S1…Sn (semaine en cours marquée d'un point vermillon), puis les cartes des séances
  (grand numéro vermillon 01, 02…, titre, « Séance n », lieu · objectif, « À faire » / « Faite »).

### Séance (`/espace/seance/:programmeId/:seanceId`)
- Retour « Tableau de bord », surtitre « Semaine n · Séance n », titre, ligne d'infos Lieu / Objectif / Effort visé
  (RPE de la semaine).
- Blocs « Bloc A », « Bloc C · EMOM 10 min », « Bloc D · TABATA 8 × 20 s / 10 s » (`resumeFormat`).
- Exercice : code (A1) en vermillon, nom, prescription, repos ; vignette photo + lien « Consignes » qui ouvre la fenêtre
  photos et consignes (photos, consignes, muscles sollicités).
- Bloc en séries classiques : tableau Série / Reps / Charge (kg) / RPE (liste – , 5 à 10) / Fait, pré-rempli, puis
  « Note » par exercice (« Ex. dernière rep difficile »).
- Bloc EMOM, AMRAP, TABATA, HIIT : par exercice, la charge seulement ; puis un encadré « Mon résultat » : « Minutes
  réussies » (EMOM, « sur {durée} »), « Tours faits » (AMRAP, TABATA, HIIT ; « sur {tours} » quand il y en a), « RPE du
  bloc », case « Bloc fait », « Note ».
- Panneau « Fin de séance » (à droite sur ordinateur, en bas sur téléphone) : « Effort global de la séance » 5 à 10 avec
  l'aide « Touchez une note : 5 modéré, 10 effort maximal. », « Mon ressenti » (Très bien, Bien, Moyen, Difficile),
  « Mon commentaire » (« Sensations, douleurs, ce qui a été facile ou difficile »), « Enregistrer ma séance ».
- Séance de course : la sortie prévue, distance et temps faits, puis le même panneau.
- Séance déjà enregistrée : lecture seule, avec ce qui a été noté.
- Conservés : enregistrement au fil de la saisie, hors ligne, « Séance déjà enregistrée », exercice retiré du programme.

### Compte
- Le rond de compte ouvre un petit menu : « Se déconnecter » (efface la copie hors ligne, comme aujourd'hui).

## 5. Données

Ajouts (rien de supprimé ; les anciennes séances restent lisibles) :

- `seancesFaites/{programmeId}_{seanceId}` : nouveaux champs écrits par le client : `notes` `{ [elementId]: texte }`,
  `blocs` `{ [blocId]: { resultat, rpe, fait, note } }`, `commentaire` (texte) ; `ressenti` prend « Très bien »,
  « Bien », « Moyen » ou « Difficile » ; `effort` 5 à 10. `douleur` n'est plus écrit (les douleurs vont dans le
  commentaire). Mise à jour de la liste des champs autorisés dans les règles.
- `utilisateurs/{uid}.avatar` : chemin de la photo de profil ; le client peut changer **seulement** ce champ (en plus de
  l'accord).
- `utilisateurs/{uid}/mesures/{id}` : `{ date, poids, taille, hanches, poitrine, bras, cuisse, creeLe }` (nombres ou
  vides ; au moins une valeur) ; lus et écrits par le client et la coach.
- `utilisateurs/{uid}/photos/{id}` : `{ date, chemin, creeLe }` ; lus et écrits par le client et la coach.
- Storage : `clients/{uid}/progression/{fichier}` et `clients/{uid}/profil/{fichier}` (règles existantes de
  `clients/{uid}/**` : client et coach, images 5 Mo au plus) ; photos réduites dans le navigateur avant l'envoi.
- La suppression d'un client (`api/supprimer-client.js`) efface aussi les sous-collections `mesures` et `photos`.

## 6. Vérifications

- Tests des règles : un client lit et écrit ses mesures et photos, pas celles d'un autre ; ne modifie de son profil que
  `avatar` (et l'accord) ; écrit les nouveaux champs de séance, pas d'autres ; suppression complète d'un client avec
  mesures et photos.
- Tests des calculs : avancement, semaines, blocs (programmes en cours / passés / à venir), résultat de bloc.
- Captures de chaque écran du coaché, téléphone et ordinateur, à côté de la capture de la maquette correspondante ;
  rien en ligne sans l'accord écrit de Marie.

## 7. Hors de ce projet

L'espace coach (affichage des photos, mesures, notes et résultats ; alertes ; visios ; statistiques ; notes privées ;
modèles de programmes) : à reprendre plus tard. Rappel : faire vérifier la question HDS avant les vrais clients.
