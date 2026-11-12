# Espace client et espace coach : plan de construction

> **Pour les agents :** sous-skill obligatoire : superpowers:subagent-driven-development (recommandé) ou
> superpowers:executing-plans, tâche par tâche. Les étapes utilisent des cases `- [ ]` pour le suivi.

**But :** un espace sous `/espace` où Marie invite ses clients, écrit leurs programmes sur mesure, et où chaque client
suit ses séances sur téléphone en notant charges, répétitions et ressenti.

**Architecture :** le site React/Vite actuel charge à part (import dynamique) un module `src/espace/` qui parle
directement à Firebase (Authentication, Firestore, Storage, région Europe). La sécurité repose sur les règles
Firebase, testées avec l'émulateur. Deux fonctions Vercel (`api/`) utilisent l'Admin SDK pour inviter et supprimer un
client.

**Technologies :** React 19, Vite 6, react-router-dom 7, SDK web `firebase`, `firebase-admin` (fonctions Vercel),
Vitest, `@firebase/rules-unit-testing`, `firebase-tools` (émulateurs, Java déjà présent), Playwright pour les captures.

**Projet (spec) :** `docs/superpowers/specs/2026-11-12-espace-client-design.md`. Lire aussi `CLAUDE.md`,
`PASSATION.md`, `DESIGN.md`.

## Contraintes globales

- Charte Rimaactive obligatoire (`DESIGN.md`, variables de `src/styles.css`) : craie, encre, vermillon, jaune signal,
  Hanken Grotesk, pictogrammes Phosphor Light (`src/components/Picto.jsx`), boutons en pilule, cartes 16 px.
- Textes en français, vouvoiement, majuscule au début des titres seulement, pas d'émoji. Textes écrits par Claude
  signalés à Marie pour validation.
- Espace client conçu d'abord pour 390 × 844 ; espace coach d'abord pour 1280 × 800 et au-delà ; tout doit marcher
  aux deux tailles.
- Firebase en région Europe (`europe-west`). Aucune clé secrète dans le dépôt : `VITE_FIREBASE_*` (publiques) et
  `FIREBASE_SERVICE_ACCOUNT` (secrète, JSON) dans les variables Vercel uniquement.
- Le site vitrine ne charge pas Firebase : tout import de `firebase` reste sous `src/espace/`, atteint par `lazy()`.
- Dates de programme en jours locaux `AAAA-MM-JJ` (chaînes), jamais converties en UTC.
- Rien en ligne ni sur GitHub sans l'accord écrit de Marie ; captures avant / après (téléphone et ordinateur) avant
  chaque mise en ligne. Commits signés `git -c user.name="Marie Sillas" -c user.email="marie.sillas@gmail.com"`.
- Ne jamais enregistrer de captures dans le dépôt.

## Points à surveiller (tests ajoutés dans les tâches indiquées)

1. **« Fin de séance » envoyée deux fois** (double appui, réseau qui revient) : une seule séance faite, grâce à
   l'identifiant `${programmeId}_${seanceId}` (tâche 1 et tâche 9).
2. **Programme modifié pendant qu'un client fait la séance** : un élément retiré du programme n'efface pas les séries
   déjà notées ; l'écran les affiche sous « Exercice retiré du programme » (tâche 3, `fusionnerNotes`).
3. **E-mail déjà invité** : l'API répond `deja-invite` et l'écran propose « Renvoyer l'invitation » (tâche 5).
4. **Photo d'iPhone en HEIC ou photo énorme** : refus clair « Format non pris en charge : envoyez une photo JPEG,
   PNG ou WebP. » ; au-delà de 20 Mo, « Photo trop lourde (20 Mo maximum). » (tâche 7).
5. **Client sans programme publié ou avant sa date de début** : accueil « Votre programme arrive bientôt » ou
   « Votre programme commence le … », jamais d'écran vide ni d'erreur (tâche 3 et tâche 9).

---

## Structure des fichiers

```text
api/_admin.js                 initialise firebase-admin, verifierCoach(req)
api/inviter.js                POST : crée le compte client
api/supprimer-client.js       POST : supprime un client et toutes ses données
scripts/definir-coach.mjs     donne le rôle coach au compte de Marie (une fois)
firebase.json, .firebaserc    émulateurs et déploiement des règles
firestore.rules, storage.rules, firestore.indexes.json
src/espace/firebase.js        initialisation (cache hors ligne, émulateurs en local)
src/espace/EspaceApp.jsx      routes /espace/*, garde selon le rôle
src/espace/useSession.js      { utilisateur, profil, role, chargement }
src/espace/erreurs.js         messageErreur(code) en français
src/espace/donnees/calculs.js     calculs purs (dates, semaines, charges)
src/espace/donnees/programme.js   modifications pures d'un programme
src/espace/donnees/photos.js      reduireImage(file)
src/espace/depots.js          lectures et écritures Firestore / Storage / API
src/espace/Connexion.jsx, Accord.jsx
src/espace/coach/MesCoaches.jsx, FicheClient.jsx, Exercices.jsx, FicheExercice.jsx, EditeurProgramme.jsx
src/espace/client/Accueil.jsx, Programme.jsx, Seance.jsx, MesCharges.jsx
src/espace/espace.css         styles de l'espace (variables de la charte)
tests/regles/*.test.js        règles (émulateur)   tests/donnees/*.test.js   tests/api/*.test.js
```

Modifiés : `package.json`, `vercel.json`, `src/App.jsx`, `src/components/Entete.jsx`, `.github/workflows/ci.yml`,
`.gitignore`, `PASSATION.md`.

## Modèle de données (référence pour toutes les tâches)

```js
// utilisateurs/{uid}
{ prenom, nom, email, role: 'client' | 'coach', statut: 'invité' | 'actif' | 'en pause',
  accordSante: Timestamp | null, creeLe: Timestamp }
// exercices/{id}
{ nom, consignes, muscles: string[], photos: string[] /* chemins Storage */, retire: false, majLe }
// programmes/{id}
{ client: uid, nom, debut: 'AAAA-MM-JJ', parSemaine, statut: 'brouillon' | 'publié', majLe,
  semaines: [{ id, mot, rpe, seances: [{ id, titre, jour /* 'Lundi'… */, lieu, duree, objectif,
    type: 'force' | 'course', consigne, distance, temps,
    blocs: [{ id, lettre, format: 'series' | 'emom' | 'amrap' | 'tabata' | 'hiit', duree, repos,
      elements: [{ id, exoId, nom, consignes, muscles, photos, series, reps, charge, pct, rpe, repos, tempo,
        commentaire }] }] }] }] }
// seancesFaites/{programmeId}_{seanceId}
{ client, programme, seance, date: 'AAAA-MM-JJ', statut: 'en cours' | 'terminée',
  series: { [elementId]: [{ charge, reps, rpe }] }, effort /* 1-10 */, ressenti, douleur: { oui, endroit, note },
  distance, temps, commentaireCoach, majLe }
```

---

### Tâche 1 : outils de test, configuration Firebase et règles Firestore

**Fichiers :** créer `firebase.json`, `.firebaserc`, `firestore.rules`, `firestore.indexes.json`,
`tests/regles/firestore.test.js`, `vitest.config.js` ; modifier `package.json`, `.gitignore`.

**Interfaces :**
- Produit : scripts npm `test` (Vitest, sans émulateur), `test:regles`
  (`firebase emulators:exec --only firestore,storage,auth "vitest run tests/regles tests/api"`) ; projet
  `demo-rimaactive` pour les émulateurs (aucun compte réel nécessaire).
- Règles : fonctions `connecte()`, `estCoach()` (`request.auth.token.role == 'coach'`), `estMoi(uid)`.

- [ ] **Étape 1 : installer** `firebase` et `firebase-admin` (dépendances), `vitest`, `@firebase/rules-unit-testing`,
  `firebase-tools` (dev). `firebase.json` : émulateurs auth 9099, firestore 8080, storage 9199, ui désactivée.
  `.gitignore` : `*-debug.log`, `.firebase/`.
- [ ] **Étape 2 : écrire les tests qui échouent**, un `it` par règle, avec `initializeTestEnvironment` et trois
  contextes : coach (`{ role: 'coach' }`), client A, client B :
  - client A lit `utilisateurs/A`, pas `utilisateurs/B` ; le coach lit les deux ;
  - client A met à jour `utilisateurs/A` avec seulement `{ accordSante: serverTimestamp(), statut: 'actif' }` quand
    `accordSante` est `null` : OK ; tout autre champ (ex. `role`) : refusé ; une deuxième fois : refusé ;
  - `exercices` : le coach écrit et lit, un client ne lit pas ;
  - client A lit un programme `{ client: 'A', statut: 'publié' }`, pas un brouillon, pas celui de B ; il ne
    l'écrit jamais ;
  - client A crée `seancesFaites/P1_S1` si l'id vaut `${programme}_${seance}`, `client == A` et le programme P1
    est publié et à lui ; refusé pour un programme de B ou un brouillon ;
  - client A met à jour sa séance `en cours` ; refusé si elle est `terminée` ; le coach peut changer seulement
    `commentaireCoach` et `majLe` sur une séance terminée ;
  - personne ne supprime une séance faite depuis le navigateur.
- [ ] **Étape 3 : lancer** `npm run test:regles` : échec (règles absentes).
- [ ] **Étape 4 : écrire `firestore.rules`** pour faire passer ces tests (lecture du programme parent avec `get()`).
- [ ] **Étape 5 : relancer** `npm run test:regles` : tout passe.
- [ ] **Étape 6 : commit** « Espace : règles Firestore et tests ».

### Tâche 2 : règles Storage

**Fichiers :** créer `storage.rules`, `tests/regles/storage.test.js` ; modifier `firebase.json`.

**Interfaces :** chemins `exercices/{exoId}/{fichier}` et `clients/{uid}/{fichier}`.

- [ ] **Étape 1 : tests qui échouent :**
  - tout connecté lit `exercices/**` ; seul le coach y écrit ;
  - `clients/A/**` : lu et écrit par A et par le coach, refusé à B ;
  - écriture refusée si `contentType` n'est pas `image/jpeg|png|webp` ou si la taille dépasse 5 Mo (après
    réduction dans le navigateur).
- [ ] **Étape 2 : lancer** `npm run test:regles` : échec.
- [ ] **Étape 3 : écrire `storage.rules`** (lecture du rôle via `request.auth.token.role`).
- [ ] **Étape 4 : relancer** : tout passe.
- [ ] **Étape 5 : commit** « Espace : règles Storage ».

### Tâche 3 : calculs et modifications de programme (fonctions pures)

**Fichiers :** créer `src/espace/donnees/calculs.js`, `src/espace/donnees/programme.js`,
`tests/donnees/calculs.test.js`, `tests/donnees/programme.test.js`.

**Interfaces (produit) :**
- `JOURS = ['Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche']`
- `ajoutJours(iso: string, n: number) -> string` ; `ecartJours(a: string, b: string) -> number`
- `semaineCourante(debut: string, aujourdhui: string, nbSemaines: number) -> number` : 0 avant le début, sinon
  `floor(écart / 7) + 1` borné à `nbSemaines`.
- `listeSeances(programme) -> [{ semaine: number, seance, date: string }]` : date = `debut + semaineIndex × 7 +
  index du jour`.
- `etatAccueil(programme | null, faites: Set<string>, aujourdhui) -> { type: 'aucun' } | { type: 'bientot', debut }
  | { type: 'termine' } | { type: 'prochaine', semaine, seance, date }`
- `preRemplir(element) -> [{ charge, reps, rpe: '' }]` : `series` lignes (1 si vide) ; `charge` = `element.charge`
  ; si seul `pct` est donné, `charge` vide.
- `fusionnerNotes(seance, series) -> [{ element | null, lignes }]` : éléments du programme dans l'ordre, puis les
  séries d'éléments disparus avec `element: null`.
- `meilleuresCharges(seancesFaites, exoIdParElement: Map, exoId) -> [{ date, charge, reps }]` : par séance
  terminée, la série à la plus forte charge pour cet exercice, triées par date.
- `regularite(programme, faites: Set) -> [{ semaine, prevues, faites }]`
- `nouveauProgramme({ client, nom, debut, semaines, parSemaine }) -> programme` (brouillon, séances vides, jours
  par défaut Lundi, Mercredi, Vendredi… selon `parSemaine`) ; `dupliquerSemaine(programme, i) -> programme`
  (copie la semaine i dans la semaine i + 1, ou l'ajoute à la fin si i est la dernière ; nouveaux `id`) ;
  `ajouterElement(programme, chemin: { s, se, b }, exercice) -> programme` (copie `nom`, `consignes`, `muscles`,
  `photos` de l'exercice) ; `nouvelId() -> string` (`crypto.randomUUID()`).
  Toutes renvoient un nouvel objet, sans modifier l'entrée.

- [ ] **Étape 1 : tests qui échouent**, avec ces valeurs :
  - `semaineCourante('2026-11-16', '2026-11-15', 4) === 0` ; `('2026-11-16','2026-11-16',4) === 1` ;
    `('2026-11-16','2026-11-23',4) === 2` ; `('2026-11-16','2027-01-30',4) === 4` ;
  - `listeSeances` d'un programme débutant le lundi `2026-11-16`, séance du Mercredi de la semaine 2 →
    `'2026-11-25'` ; aucun décalage d'un jour en fuseau `Europe/Paris` (lancer ce test avec `TZ=Pacific/Kiritimati`
    aussi) ;
  - `etatAccueil(null, …)` → `aucun` ; avant le début → `bientot` ; toutes faites → `termine` ;
  - `preRemplir({ series: '4', reps: '5', charge: '60' })` → 4 lignes `{ charge: '60', reps: '5', rpe: '' }` ;
    `{ series: '', reps: '12' }` → 1 ligne ; `{ series: '3', reps: '5', pct: '75' }` → charge `''` ;
  - `fusionnerNotes` : un élément retiré du programme mais présent dans `series` est rendu avec `element: null` ;
  - `meilleuresCharges` ignore les séances `en cours` et les charges vides ;
  - `dupliquerSemaine` : ids différents, contenu identique, l'entrée n'est pas modifiée ;
  - `ajouterElement` : modifier ensuite l'exercice source ne change pas l'élément copié.
- [ ] **Étape 2 : lancer** `npx vitest run tests/donnees` : échec.
- [ ] **Étape 3 : écrire** `calculs.js` et `programme.js`.
- [ ] **Étape 4 : relancer** : tout passe.
- [ ] **Étape 5 : commit** « Espace : calculs et programme ».

### Tâche 4 : Firebase côté site, session, connexion et entrée « Mon espace »

**Fichiers :** créer `src/espace/firebase.js`, `useSession.js`, `erreurs.js`, `EspaceApp.jsx`, `Connexion.jsx`,
`espace.css`, `tests/donnees/erreurs.test.js`, `.env.example` ; modifier `src/App.jsx`, `src/components/Entete.jsx`,
`vercel.json`.

**Interfaces :**
- Produit : `auth`, `db`, `stockage` (exports de `firebase.js`) ; `useSession() -> { utilisateur, profil, role,
  chargement }` (rôle lu dans le jeton, `profil` = `utilisateurs/{uid}` en direct) ; `messageErreur(code) -> string` ;
  route `espace/*` → `lazy(() => import('./espace/EspaceApp.jsx'))`.
- `EspaceApp` : non connecté → `Connexion` ; `client` sans `accordSante` → `Accord` (tâche 6) ; `client` →
  `/espace` (tâche 9) ; `coach` → `/espace/coach` (tâche 6).

- [ ] **Étape 1 : test qui échoue** `erreurs.test.js` : `messageErreur('auth/invalid-credential')` →
  `'E-mail ou mot de passe incorrect.'` ; `'auth/too-many-requests'` → `'Trop d’essais. Réessayez dans quelques
  minutes.'` ; `'auth/network-request-failed'` → `'Pas de connexion internet. Vérifiez votre réseau.'` ;
  `'auth/expired-action-code'` → `'Ce lien a expiré. Demandez à Marie de vous renvoyer l’invitation.'` ;
  code inconnu → `'Une erreur est survenue. Réessayez.'`.
- [ ] **Étape 2 : lancer** `npx vitest run tests/donnees/erreurs.test.js` : échec ; **écrire** `erreurs.js` ;
  relancer : passe.
- [ ] **Étape 3 : écrire `firebase.js`** : `initializeApp` avec `import.meta.env.VITE_FIREBASE_*`,
  `initializeFirestore(app, { localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }) })`,
  `connectAuthEmulator` / `connectFirestoreEmulator` / `connectStorageEmulator` si
  `import.meta.env.VITE_FIREBASE_EMULATEURS === '1'`. `.env.example` liste les variables sans valeur.
- [ ] **Étape 4 : écrire `Connexion.jsx`** : e-mail, mot de passe, « Se connecter », lien « Mot de passe oublié ? »
  (`sendPasswordResetEmail`, message « Si un compte existe pour cette adresse, un e-mail vient de partir. »), erreurs
  via `messageErreur`. Charte : champs et boutons du site (`.champ`, `.bouton--principal`).
- [ ] **Étape 5 : brancher** : `App.jsx` route `espace/*` dans `Layout` avec `Suspense` ; dans `Entete.jsx`, le
  bouton « Mon espace » devient un `Link` vers `/espace` et le dialogue « En construction » est retiré ;
  `vercel.json` : `{ "source": "/((?!api/).*)", "destination": "/index.html" }`.
- [ ] **Étape 6 : vérifier** : `npm run build` passe ; le fichier JS de l'accueil ne contient pas `firebase`
  (`grep -L firebase dist/assets/index-*.js`) ; avec `VITE_FIREBASE_EMULATEURS=1 npx vite` et
  `npx firebase emulators:start --project demo-rimaactive`, un compte créé dans l'émulateur se connecte.
- [ ] **Étape 7 : commit** « Espace : connexion et entrée Mon espace ».

### Tâche 5 : API d'invitation et de suppression, rôle coach

**Fichiers :** créer `api/_admin.js`, `api/inviter.js`, `api/supprimer-client.js`, `scripts/definir-coach.mjs`,
`tests/api/inviter.test.js`, `tests/api/supprimer.test.js`.

**Interfaces :**
- `api/_admin.js` : `admin()` (initialise une fois avec `FIREBASE_SERVICE_ACCOUNT`, ou sans identifiants si
  `FIRESTORE_EMULATOR_HOST` est défini) ; `verifierCoach(req) -> Promise<uid>` (jeton `Authorization: Bearer`,
  rôle `coach`, sinon erreur 401/403).
- `POST /api/inviter` `{ prenom, nom, email }` → 201 `{ uid }` ; 409 `{ code: 'deja-invite', uid }` si l'e-mail
  existe ; 400 `{ code: 'champs' }` si un champ manque ou l'e-mail est invalide. Crée l'utilisateur Auth
  (`displayName`), pose `{ role: 'client' }`, écrit `utilisateurs/{uid}` (`statut: 'invité'`, `accordSante: null`).
  L'e-mail est envoyé ensuite par le navigateur du coach avec `sendPasswordResetEmail` (modèle Firebase en français,
  réglé par Marie : objet « Créez votre mot de passe pour votre espace Rimaactive »).
- `POST /api/supprimer-client` `{ uid }` → 204 : supprime `seancesFaites` et `programmes` où `client == uid`,
  `utilisateurs/{uid}`, les fichiers `clients/{uid}/`, puis le compte Auth. Refuse de supprimer un coach (403).
- `node scripts/definir-coach.mjs <email>` : pose `{ role: 'coach' }` et crée `utilisateurs/{uid}` rôle coach.

- [ ] **Étape 1 : tests qui échouent** (émulateurs, appel direct du gestionnaire avec de faux `req`/`res`) :
  sans jeton → 401 ; jeton client → 403 ; coach + nouvel e-mail → 201, rôle `client`, document `invité` ;
  même e-mail → 409 `deja-invite` ; e-mail `"marie@"` → 400 ; suppression → plus aucun document ni fichier ni compte
  pour ce client, ceux d'un autre client intacts.
- [ ] **Étape 2 : lancer** `npm run test:regles` : échec.
- [ ] **Étape 3 : écrire** les trois fichiers `api/` et le script.
- [ ] **Étape 4 : relancer** : tout passe.
- [ ] **Étape 5 : commit** « Espace : invitation et suppression d'un client ».

### Tâche 6 : espace coach « Mes coachés », invitation et accord du client

**Fichiers :** créer `src/espace/depots.js` (parties utilisateurs), `coach/MesCoaches.jsx`, `Accord.jsx` ; modifier
`EspaceApp.jsx`, `espace.css`.

**Interfaces :**
- `depots.js` : `ecouterClients(rappel) -> desabonner` ; `inviterClient({ prenom, nom, email }) -> { uid }` (appelle
  l'API puis `sendPasswordResetEmail` ; sur 409, renvoie `{ dejaInvite: true, uid }`) ;
  `renvoyerInvitation(email)` ; `donnerAccord(uid)` ; `supprimerClient(uid)` ; `appelerApi(chemin, corps)` (ajoute le
  jeton du coach).
- Écrans : `/espace/coach` liste (prénom nom, statut, programme en cours, « Semaine n sur N » via
  `semaineCourante`), bouton « Inviter un client » (dialogue : prénom, nom, e-mail) ; `Accord` : texte d'accord, case
  obligatoire « J’accepte que mes mesures, mes séances et mes photos soient enregistrées pour le suivi de mon
  coaching. », lien vers `/mentions-legales#confidentialite`, bouton « Accéder à mon espace » (texte à faire valider
  par Marie).

- [ ] **Étape 1 : vérifier dans l'émulateur** (compte coach créé avec `definir-coach.mjs`) : invitation → le client
  apparaît « Invité » ; e-mail visible dans l'onglet Auth de l'émulateur ; deuxième invitation du même e-mail →
  message « Ce client est déjà invité. » et bouton « Renvoyer l’invitation » ; connexion du client → écran d'accord ;
  sans case cochée, le bouton reste inactif ; après accord, statut « Actif ».
- [ ] **Étape 2 : captures** 1280 × 800 et 390 × 844 de la liste, du dialogue et de l'accord (dossier de travail,
  pas le dépôt).
- [ ] **Étape 3 : commit** « Espace coach : mes coachés et invitation ».

### Tâche 7 : banque d'exercices et réduction des photos

**Fichiers :** créer `src/espace/donnees/photos.js`, `tests/donnees/photos.test.js`, `coach/Exercices.jsx`,
`coach/FicheExercice.jsx` ; modifier `depots.js`.

**Interfaces :**
- `reduireImage(fichier: File, { cote = 1600, qualite = 0.82 }) -> Promise<Blob>` (JPEG) ; rejette avec
  `Error('format')` si le type n'est pas `image/jpeg|png|webp`, `Error('taille')` au-delà de 20 Mo ;
  `messageErreur('format')` et `messageErreur('taille')` donnent les textes des « Points à surveiller » n° 4.
- `depots.js` : `ecouterExercices(rappel)`, `enregistrerExercice(exercice, nouvellesPhotos: File[]) -> id`
  (réduit, envoie dans `exercices/{id}/`), `retirerExercice(id)` (`retire: true`, les programmes gardent leur copie),
  `urlPhoto(chemin) -> Promise<string>`.

- [ ] **Étape 1 : tests qui échouent** `photos.test.js` : fichier `image/heic` → rejet `format` ; 21 Mo → `taille` ;
  ajouter les deux codes à `erreurs.test.js`.
- [ ] **Étape 2 : lancer, écrire `photos.js`** (`createImageBitmap` + `OffscreenCanvas`, repli `<canvas>`), relancer :
  passe.
- [ ] **Étape 3 : écrans** : liste avec recherche par nom et par muscle ; fiche : nom, consignes (zone de texte),
  muscles (liste à cocher : Quadriceps, Ischio-jambiers, Fessiers, Mollets, Pectoraux, Dos, Épaules, Biceps, Triceps,
  Abdominaux, Lombaires — liste à faire valider par Marie), photos (ajout multiple, ordre, retrait).
- [ ] **Étape 4 : vérifier dans l'émulateur** : création avec deux photos, modification, retrait ; captures.
- [ ] **Étape 5 : commit** « Espace coach : banque d'exercices ».

### Tâche 8 : éditeur de programme

**Fichiers :** créer `coach/EditeurProgramme.jsx` ; modifier `depots.js`, `coach/MesCoaches.jsx`.

**Interfaces :**
- `depots.js` : `ecouterProgrammes(clientUid, rappel)`, `enregistrerProgramme(programme)` (brouillon, `majLe`),
  `publierProgramme(id)`, `seancesVerrouillees(programmeId) -> Promise<Set<seanceId>>` (séances ayant une séance faite
  `terminée`).
- Utilise `nouveauProgramme`, `dupliquerSemaine`, `ajouterElement` (tâche 3).

- [ ] **Étape 1 : écran** fidèle à la maquette « Espace coach » : création (nom, semaines 2–12, séances par semaine
  1–6, date de début) ; pastilles S1…Sn ; « Dupliquer la semaine », « Ajouter une semaine » ; « Le mot de la semaine
  (vu par le coaché) » ; séances (titre, jour, lieu, durée, objectif, type force / course) ; blocs A, B… avec format
  (Séries classiques, EMOM, AMRAP, TABATA, HIIT) ; éléments choisis dans la banque, champs séries, répétitions,
  charge, % 1RM, RPE, repos, tempo, commentaire ; « Enregistrer le brouillon », « Publier ».
- [ ] **Étape 2 : verrou** : une séance de `seancesVerrouillees` s'affiche en lecture seule avec « Séance faite :
  non modifiable ».
- [ ] **Étape 3 : vérifier dans l'émulateur** : programme de 4 semaines créé, dupliqué, publié ; le client ne le voit
  pas avant publication (contrôlé par la règle de la tâche 1) ; captures 1280 × 800.
- [ ] **Étape 4 : commit** « Espace coach : éditeur de programme ».

### Tâche 9 : espace client (accueil, programme, séance, mes charges)

**Fichiers :** créer `client/Accueil.jsx`, `client/Programme.jsx`, `client/Seance.jsx`, `client/MesCharges.jsx` ;
modifier `depots.js`, `EspaceApp.jsx`, `espace.css`.

**Interfaces :**
- `depots.js` : `ecouterMonProgramme(uid, rappel)` (le plus récent `publié`), `ecouterMesSeances(uid, rappel)`,
  `noterSeance(programmeId, seanceId, donnees)` (`setDoc` avec fusion sur `seancesFaites/${programmeId}_${seanceId}`,
  `statut: 'en cours'`), `terminerSeance(programmeId, seanceId, { effort, ressenti, douleur, distance, temps })`.
- Utilise `etatAccueil`, `listeSeances`, `preRemplir`, `fusionnerNotes`, `meilleuresCharges`, `regularite`.

- [ ] **Étape 1 : écrans** (390 × 844 d'abord) : barre du bas Accueil · Programme · Mes charges ; accueil selon
  `etatAccueil` (textes : « Votre programme arrive bientôt. Marie le prépare pour vous. », « Votre programme commence
  le {date}. », « Programme terminé. Bravo ! Marie vous propose bientôt la suite. ») ; séance : blocs, photo,
  consignes, muscles, lignes de séries pré-remplies (champs numériques ≥ 44 px), « Fin de séance » (effort 1–10,
  ressenti Facile / Bien / Difficile, douleur oui / non + endroit + note) ; course : distance et temps.
- [ ] **Étape 2 : test** (ajouté à `tests/regles/firestore.test.js`) : deux `terminerSeance` successifs sur la même
  séance → un seul document ; le second est refusé car la séance est déjà `terminée`, et l'écran affiche « Séance
  déjà enregistrée ».
- [ ] **Étape 3 : vérifier dans l'émulateur** : séance notée réseau coupé (`Network` hors ligne dans Playwright),
  envoyée au retour du réseau ; élément retiré par le coach pendant la séance → notes affichées sous « Exercice
  retiré du programme » ; captures 390 × 844 et 1280 × 800.
- [ ] **Étape 4 : commit** « Espace client : programme et séances ».

### Tâche 10 : fiche client côté coach

**Fichiers :** créer `coach/FicheClient.jsx` ; modifier `depots.js`.

**Interfaces :** `depots.js` : `ecouterSeancesClient(uid, rappel)`, `commenterSeance(id, texte)`.

- [ ] **Étape 1 : écran** : programme en cours et régularité ; liste des séances faites (date, effort, ressenti,
  douleur en évidence, détail `60 kg × 5 @8` par série) ; champ « Votre commentaire » ; courbe des meilleures charges
  par exercice (SVG simple, encre et vermillon, pas de bibliothèque) ; « Modifier le programme » ; « Supprimer ce
  client et ses données » avec confirmation qui fait taper le prénom.
- [ ] **Étape 2 : vérifier dans l'émulateur** : la séance de la tâche 9 apparaît, commentaire enregistré, suppression
  complète (vérifiée dans l'onglet de l'émulateur) ; captures.
- [ ] **Étape 3 : commit** « Espace coach : fiche client ».

### Tâche 11 : CI, documentation et préparation de la mise en ligne

**Fichiers :** modifier `.github/workflows/ci.yml`, `PASSATION.md`, `src/pages/Confidentialite.jsx` (brouillon
montré à Marie avant publication) ; créer `docs/espace-mise-en-route.md`.

- [ ] **Étape 1 : CI** : ajouter `actions/setup-java@v4` (Java 21), `npm test`, `npm run test:regles` avant
  `npm run build`. Vérifier que tout passe en local avec les mêmes commandes.
- [ ] **Étape 2 : guide pour Marie** `docs/espace-mise-en-route.md`, en français simple : créer le projet Firebase
  (région `europe-west`), activer Authentication e-mail / mot de passe et Firestore et Storage, passer au forfait
  Blaze, traduire le modèle d'e-mail « Réinitialisation du mot de passe » ; créer la clé de compte de service et la
  coller dans `FIREBASE_SERVICE_ACCOUNT` sur Vercel ; coller les `VITE_FIREBASE_*` ; déployer les règles
  (`npx firebase deploy --only firestore:rules,storage`) ; lancer `definir-coach.mjs` avec son e-mail.
- [ ] **Étape 3 : confidentialité** : ajouter Google Firebase (Google Ireland Ltd., données en Europe) aux
  prestataires et les données de l'espace client avec leurs durées ; montrer avant / après à Marie, ne rien publier
  sans son accord.
- [ ] **Étape 4 : PASSATION** : section « Espace client » (où sont les fichiers, comment lancer les émulateurs,
  rappel HDS avant les vrais clients).
- [ ] **Étape 5 : vérification finale** (`superpowers:verification-before-completion`) : `npm test`,
  `npm run test:regles`, `npm run build` ; captures de chaque écran aux deux tailles ; envoyer à Marie et attendre son
  accord écrit avant toute mise en ligne.
- [ ] **Étape 6 : commit** « Espace : CI, guide et passation ».
