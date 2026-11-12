# Espace client et espace coach Rimaactive : projet

12 novembre 2026. Décisions prises avec Marie dans la discussion du 12 novembre. Maquette de référence :
artefact « Espace client Rimaactive » (https://claude.ai/artifact/1QFtKuZVoggcyj43ASftEu), écrans
« Espace coaching » (client) et « Espace coach ».

## 1. Le but

Marie suit ses clients avec un outil à elle, sur son site :

- elle invite chaque client et lui écrit un programme sur mesure ;
- le client suit ses séances sur son téléphone et note ce qu'il a fait ;
- Marie voit tout et suit les progrès.

C'est réussi quand un client invité peut se connecter, voir son programme, faire une séance en notant charges,
répétitions et ressenti, et que Marie retrouve ces notes dans son espace coach.

Ce document couvre les **parties 1 et 2** (fondations, programmes et séances). Les parties 3 (suivi : poids,
mensurations, photos avant / après, régularité) et 4 (échanges : messages, comptes rendus de visio, alertes) auront
chacune leur propre document, plus tard.

## 2. Décisions de Marie

| Sujet | Décision |
| --- | --- |
| Base de données | Firebase : Authentication, Firestore, Storage, région Europe |
| Hébergement | Vercel, dans le site actuel (pas d'application séparée) |
| Création des comptes | Marie invite chaque client ; aucune inscription libre |
| Appareil du client | Téléphone d'abord, ordinateur aussi |
| Appareil du coach | Ordinateur d'abord, téléphone pour consulter |
| Pendant la séance | Le client lit **et note** : charges, répétitions, RPE, ressenti, douleur |
| Programmes | Sur mesure pour chaque client, sans modèle |
| Fiche d'exercice | Nom, consignes d'exécution, muscles sollicités, une ou plusieurs photos d'explication |
| Photos avant / après | Gardées, dans Firebase Storage, un dossier par client (partie 3) |

## 3. Organisation technique

- **Site actuel** (React 19, Vite, react-router-dom), même dépôt, même charte (design system Rimaactive). L'espace vit
  sous `/espace` : `/espace/connexion`, `/espace` (client), `/espace/coach/...` (coach). Le bouton « Mon espace » de
  la barre de menu mène à `/espace` au lieu du message « En construction ».
- **Firebase**, projet en région Europe (`europe-west`) :
  - Authentication : e-mail et mot de passe ;
  - Firestore : toutes les données ;
  - Storage : photos (exercices, puis avant / après en partie 3).
  Le site parle à Firebase directement depuis le navigateur (SDK web). La sécurité est assurée par les **règles
  Firebase**, pas par l'écran.
- **Une fonction Vercel** `api/inviter.js` (Node, Firebase Admin SDK) : réservée au coach, elle crée le compte du
  client, lui donne le rôle « client » et envoie l'e-mail « Créez votre mot de passe ». `vercel.json` doit laisser
  passer `/api/` avant la règle qui renvoie tout vers `index.html`.
- Les clés Firebase du site (publiques par nature) vont dans les variables d'environnement Vercel (`VITE_FIREBASE_*`).
  La clé secrète de l'Admin SDK va **seulement** dans les variables secrètes Vercel, jamais dans le dépôt.
- Le reste du site vitrine ne charge pas Firebase : l'espace est chargé à part (import dynamique), pour que
  l'accueil reste rapide.

## 4. Rôles et sécurité

- **Coach** : Marie seule. Rôle `coach` posé sur son compte (champ personnalisé de Firebase Authentication). Elle lit
  et écrit tout.
- **Client** : rôle `client`. Il lit son profil, ses programmes **publiés** et ses séances. Il écrit uniquement ses
  séances faites (et, en partie 3, ses mesures et photos). Il ne lit rien d'un autre client et ne peut pas modifier
  son programme.
- Une séance faite est **figée** : ni le client ni le coach ne peuvent changer les charges notées après la fin de
  séance (le coach peut seulement ajouter un commentaire).
- Données de santé (RGPD, art. 9) :
  - accord explicite obligatoire au premier passage, enregistré avec sa date ;
  - suppression complète d'un client (compte, données, photos) par le coach ;
  - politique de confidentialité mise à jour (Firebase / Google comme prestataire, données de l'espace, durées),
    montrée à Marie avant publication ;
  - **avant d'inviter de vrais clients**, faire vérifier par un juriste ou la CNIL si un hébergement certifié « HDS »
    est obligatoire. La construction et les essais peuvent se faire avant.

## 5. Les données (Firestore)

- `utilisateurs/{uid}` : prénom, nom, e-mail, rôle, statut (`invité`, `actif`, `en pause`), date d'accord RGPD.
- `exercices/{id}` : nom, consignes, muscles sollicités, liste de photos (chemins Storage), retiré (oui / non).
- `programmes/{id}` : client (uid), nom, date de début, nombre de semaines, séances par semaine, statut (`brouillon`,
  `publié`), et les semaines :
  - semaine : numéro, mot de la semaine, RPE visé ;
  - séance : identifiant, titre, jour, lieu, durée, objectif, type (`force` ou `course`), consigne ;
  - bloc : lettre (A, B, C…), format (`series`, `emom`, `amrap`, `tabata`, `hiit`) et ses réglages (durée pour EMOM et AMRAP ; travail, repos et tours pour TABATA et HIIT) ;
  - élément : exercice (copie du nom, des consignes et des photos au moment de l'ajout, pour qu'un exercice retiré
    ou modifié dans la banque ne change pas un programme existant), séries, répétitions, charge ou % du 1RM, RPE,
    repos, tempo, commentaire ;
  - séance de course : distance et temps visés.
- `seancesFaites/{id}` : client, programme, séance, date, et pour chaque élément la liste des séries réellement
  faites (charge, répétitions, RPE) ; à la fin : effort 1 à 10, ressenti, douleur (oui / non, endroit, note) ;
  pour la course : distance et temps. Statut `en cours` puis `terminée` (figée).
- Storage : `exercices/{id}/...` pour les photos d'explication ; `clients/{uid}/...` réservé à la partie 3.

## 6. Les écrans

### Coach (ordinateur d'abord)

- **Connexion**, puis **Mes coachés** : liste des clients avec statut, programme en cours, semaine en cours ; bouton
  « Inviter un client » (prénom, nom, e-mail).
- **Fiche client** : son programme, les séances faites avec ce qu'il a noté, la courbe de ses meilleures charges par
  exercice ; « Supprimer ce client et ses données » (avec confirmation).
- **Banque d'exercices** : liste, recherche, ajout et modification d'une fiche (nom, consignes, muscles, photos).
- **Créer / modifier un programme** : comme la maquette « Espace coach » (semaines, séances, blocs, formats,
  éléments, dupliquer la semaine, mot de la semaine) ; « Publier ». Une séance pas encore faite peut être modifiée
  après publication ; le client voit la nouvelle version.

### Client (téléphone d'abord)

- **Première connexion** : choix du mot de passe (depuis l'e-mail), puis accord RGPD.
- **Accueil** : prochaine séance, « Ma semaine » et le mot de la semaine, régularité.
- **Mon programme** : semaines et séances, faites ou à venir.
- **Séance** : blocs ; pour chaque exercice, photo, consignes, muscles ; saisie série par série, pré-remplie avec le
  prévu ; « Fin de séance » (effort, ressenti, douleur).
- **Mes charges** : progrès par exercice.
- Réseau coupé : la saisie continue et part quand le réseau revient (cache hors ligne de Firestore).

Les écrans suivent la maquette et le design system Rimaactive ; la charte passe avant tout autre choix de style.

## 7. Erreurs

Messages en français, qui disent quoi faire : mauvais mot de passe, invitation expirée (Marie peut la renvoyer),
e-mail déjà invité, réseau coupé, photo trop lourde ou mauvais format. Les photos sont réduites dans le navigateur
avant l'envoi.

## 8. Vérifications

- Tests automatiques des règles Firebase avec l'émulateur Firebase :
  - un client ne lit pas les données d'un autre ;
  - un client ne modifie pas son programme ni un programme en brouillon ;
  - une séance terminée ne change plus ;
  - seul le coach peut appeler l'invitation.
- Tests des calculs (semaine en cours, meilleures charges, pré-remplissage).
- Un **projet Firebase d'essai** séparé, avec de faux clients, pour que Marie essaie tout sans risque.
- Avant chaque mise en ligne : captures avant / après sur téléphone et ordinateur, et accord écrit de Marie.

## 9. Ordre de construction

1. Firebase (projet d'essai), connexion, invitation, rôles, page « Mon espace ».
2. Banque d'exercices.
3. Création des programmes (coach).
4. Espace client : programme et séances, saisie des charges.
5. Suivi des séances et courbes de charges (coach).

## 10. Ce qu'il faut à Marie

- Un compte Firebase, créé avec son compte Google, avec une carte bancaire (paiement à l'usage, nécessaire pour
  Storage).
- Les clés Firebase, saisies par Marie dans les réglages Vercel (jamais dans la discussion).
- Son adresse e-mail de coach.
- L'avis d'un juriste ou de la CNIL sur la certification HDS, avant les vrais clients.
- L'offre Vercel adaptée à une activité professionnelle (l'offre gratuite « Hobby » est réservée aux projets non
  commerciaux).

## 11. Hors de ce projet

Poids, mensurations, photos avant / après et régularité détaillée (partie 3) ; messages, comptes rendus de visio et
alertes (partie 4) ; paiement en ligne ; modèles de programmes réutilisables (Marie travaille sur mesure).
