# Mettre en route l'espace client — guide pour Marie

Ce guide vous accompagne pas à pas pour ouvrir votre espace client et coach. Comptez une heure environ.
Les noms des menus peuvent légèrement changer chez Google ou Vercel : si un libellé n'est pas exactement
celui écrit ici, cherchez le mot voisin (le principe reste le même). Et vous pouvez à tout moment me demander
de le faire avec vous, ou à votre place quand c'est possible.

**Rien n'est en ligne tant que vous n'avez pas donné votre accord écrit.**

## Règle d'or : les clés ne se collent jamais dans la discussion

Vous allez manipuler une clé secrète (le « compte de service », à l'étape 7). Ne la collez **jamais**
dans la discussion avec Claude, ni dans un e-mail, ni dans un fichier du site. Elle va uniquement dans les
réglages de Vercel (étape 8). Vous pouvez me dire « c'est fait » : cela me suffit.

## Avant de commencer

- Un compte Google (celui de votre choix).
- L'accès à votre compte Vercel (celui qui héberge le site).
- Votre adresse e-mail de coach, par exemple `marie.sillas@gmail.com`.

## 1. Créer le projet Firebase

1. Allez sur <https://console.firebase.google.com> et connectez-vous avec votre compte Google.
2. Cliquez sur « Créer un projet » (ou « Ajouter un projet »). Nommez-le par exemple `rimaactive`.
3. Google Analytics : vous pouvez le **refuser** (le site n'en a pas besoin, et la politique de confidentialité dit qu'il n'y a pas de mesure d'audience).
4. Notez l'**identifiant du projet** affiché dans les paramètres du projet (par exemple `rimaactive-1a2b3`). On en aura besoin à l'étape 9.

## 2. Ajouter l'application web et noter ses réglages

1. Sur la page d'accueil du projet, cliquez sur l'icône « Web » (le signe `</>`) pour ajouter une application.
2. Donnez-lui un nom (« Site Rimaactive »). Ne cochez pas « Firebase Hosting » : le site reste chez Vercel.
3. Google affiche alors un petit bloc de réglages (`apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId`). **Gardez cette page ouverte** ou copiez ces valeurs : elles servent à l'étape 8.
   Ces réglages-là ne sont pas secrets (ils sont visibles par tous dans le site), contrairement à la clé de l'étape 7.

## 3. Activer la connexion par e-mail et mot de passe

1. Dans le menu de gauche, ouvrez **Authentication** (« Build » / « Créer » si le menu est replié), puis cliquez sur « Commencer ».
2. Dans l'onglet des modes de connexion (« Sign-in method » / « Méthode de connexion »), choisissez **E-mail/Mot de passe** et activez-le.
3. Laissez désactivée l'option « Lien de connexion par e-mail (sans mot de passe) ».
4. Enregistrez.

## 4. Créer la base de données (Firestore) en Europe

1. Menu **Firestore Database**, puis « Créer une base de données ».
2. **Choisissez un emplacement en Europe** (un nom qui commence par `europe-west`, par exemple `europe-west9` pour Paris ou `europe-west1` pour la Belgique). **Ce choix est définitif** : vérifiez-le avant de valider.
3. Mode de démarrage : choisissez « Mode production » (les règles de sécurité du site seront déployées à l'étape 9).
4. **À savoir** : la région ne se règle que pour Firestore et le stockage (étape 6). Le service de connexion (Authentication) n'a pas de choix de région : c'est un service de Google qui peut traiter les adresses e-mail hors de l'Union européenne. La politique de confidentialité le précise ; notez ici la région choisie (par exemple `europe-west9`) pour vérifier que le texte public est exact avant publication.

## 5. Passer au forfait Blaze et poser une alerte de budget

Le stockage des photos demande en général le forfait « Blaze » (paiement à l'usage), à choisir **avant** de créer le stockage. Pour un petit usage comme le vôtre, le coût attendu est de quelques euros par mois ou moins, mais je ne peux pas vous le garantir : vérifiez la page de tarifs de Firebase. **Posez une alerte de budget** pour être tranquille.

1. En bas du menu de gauche, cliquez sur le forfait (« Spark ») puis « Mettre à niveau » / « Upgrade », et choisissez **Blaze**.
2. Vous devrez renseigner une carte bancaire.
3. Quand Google propose de définir un budget, indiquez par exemple **5 €** par mois et gardez les alertes par e-mail activées. Si ce n'est pas proposé tout de suite, ouvrez la console Google Cloud (lien « Gérer le forfait » / « Facturation »), section **Budgets et alertes**, et créez-y un budget de 5 €.

Une alerte prévient, elle ne bloque pas : si un jour vous en recevez une, parlez-m'en.

## 6. Activer le stockage des photos (Storage), en Europe

1. Menu **Storage**, puis « Commencer ».
2. Mode « production » là aussi, et **même région européenne** que Firestore (ou une région `europe-west`).
3. Une fois créé, le nom du « bucket » apparaît en haut de la page, sous la forme `gs://…`. **Copiez ce nom sans le `gs://`** (par exemple `rimaactive-1a2b3.firebasestorage.app` ou `rimaactive-1a2b3.appspot.com`) : il servira à l'étape 8. Les projets Firebase récents utilisent `….firebasestorage.app` ; les plus anciens `….appspot.com`. Prenez exactement celui que votre console affiche.

## 7. Créer la clé du « compte de service » (secrète)

Cette clé permet à l'API du site (inviter un client, supprimer un client) d'agir comme administrateur.

1. Dans Firebase, cliquez sur la roue dentée à côté de « Vue d'ensemble du projet », puis **Paramètres du projet**.
2. Onglet **Comptes de service** (« Service accounts »).
3. Cliquez sur **Générer une nouvelle clé privée** et confirmez. Un fichier `.json` se télécharge.
4. **Ne le partagez avec personne** et ne le mettez pas dans le dossier du site. Vous en aurez besoin à l'étape suivante, puis vous pourrez le garder dans un endroit sûr (gestionnaire de mots de passe) ou le supprimer.

## 8. Renseigner les variables dans Vercel

1. Sur <https://vercel.com>, ouvrez le projet du site, puis **Settings** → **Environment Variables**.
2. Ajoutez les variables suivantes, une par une (cochez Production, Preview et Development) :

| Nom | Valeur à coller | Secret ? |
| --- | --- | --- |
| `VITE_FIREBASE_API_KEY` | `apiKey` de l'étape 2 | non |
| `VITE_FIREBASE_AUTH_DOMAIN` | `authDomain` de l'étape 2 | non |
| `VITE_FIREBASE_PROJECT_ID` | `projectId` de l'étape 2 | non |
| `VITE_FIREBASE_STORAGE_BUCKET` | `storageBucket` de l'étape 2 | non |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` de l'étape 2 | non |
| `VITE_FIREBASE_APP_ID` | `appId` de l'étape 2 | non |
| `FIREBASE_SERVICE_ACCOUNT` | **tout le contenu** du fichier `.json` de l'étape 7, tel quel | **oui** : cochez « Sensitive » pour Production et Preview |
| `FIREBASE_STORAGE_BUCKET` | le nom du bucket copié à l'étape 6 (sans `gs://`) | non |

Pour `FIREBASE_SERVICE_ACCOUNT`, ouvrez le fichier `.json` avec un éditeur de texte, sélectionnez tout, copiez, et collez dans la case de Vercel. Une variable « Sensitive » ne peut plus être relue après enregistrement, même par vous : gardez donc le fichier `.json` en lieu sûr.

**Pourquoi `FIREBASE_STORAGE_BUCKET` ?** Sans lui, le site suppose que le bucket s'appelle `<projet>.appspot.com`. Or les projets Firebase récents utilisent `<projet>.firebasestorage.app`. Si le nom est faux, la suppression d'un client n'effacera pas ses photos. Copiez donc le nom affiché dans votre console (étape 6).

3. Les variables ne sont prises en compte qu'au prochain déploiement du site : **je m'en occupe, avec votre accord**.

## 9. Mettre en place les règles de sécurité

Ce sont les règles qui disent « un client ne voit que ses propres données ». Elles sont dans le dépôt (`firestore.rules`, `storage.rules`). Je peux les déployer pour vous : il me faut simplement l'identifiant du projet (étape 1) et que vous m'autorisiez à me connecter à Firebase avec votre compte (une fenêtre de connexion Google s'ouvre, c'est vous qui validez). La commande est :

```
npx firebase deploy --only firestore:rules,firestore:indexes,storage --project <identifiant-du-projet>
```

## 10. Personnaliser l'e-mail d'invitation

Quand vous invitez un client, il reçoit un e-mail « Réinitialisation du mot de passe » pour **créer son mot de passe**. Par défaut il est en anglais ou mal tourné : traduisons-le.

1. Dans **Authentication**, ouvrez l'onglet des **modèles** (« Templates » / « Modèles »), puis « Réinitialisation du mot de passe ».
2. Choisissez la langue **Français** (menu de langue du modèle).
3. Si vous le pouvez, renseignez le nom de l'expéditeur : « Rimaactive » (et mettez votre adresse en « répondre à »). Par défaut, l'e-mail part d'une adresse Firebase (`firebaseapp.com`) et peut arriver dans les courriers indésirables : prévenez vos clients de regarder dans leurs spams.
4. **Objet** suggéré : `Créez votre mot de passe pour votre espace Rimaactive`
5. **Message** suggéré (vous pouvez le modifier librement ; gardez le lien `%LINK%`, Firebase le remplace par le vrai lien) :

```
Bonjour,

Marie Sillas vous a ouvert votre espace Rimaactive, où vous retrouverez votre programme
et vos séances.

Pour choisir votre mot de passe et vous connecter, cliquez sur ce lien :
%LINK%

Si vous n'attendiez pas ce message, ignorez-le simplement : rien ne sera fait.

Sportivement,
Marie Sillas — Rimaactive
```

6. Enregistrez.

*Ce texte est une proposition de Claude : à relire et valider par vous.*

## 11. Vous donner le rôle de coach

Le rôle « coach » se donne **une seule fois**, à votre compte.

1. Créez d'abord votre compte : dans **Authentication** → onglet **Utilisateurs**, cliquez sur « Ajouter un utilisateur », saisissez votre e-mail et un mot de passe solide (que vous notez dans votre gestionnaire de mots de passe).
2. Lancez ensuite la commande, avec **votre e-mail** :

```
node scripts/definir-coach.mjs marie.sillas@gmail.com
```

Cette commande a besoin de la clé de l'étape 7, que Vercel ne permet plus de relire : il faut la fournir à l'ordinateur qui lance la commande. Deux façons simples :

- **Vous la lancez vous-même** : dans un terminal, placez-vous dans le dossier du site, puis (remplacez le chemin par celui de votre fichier `.json`) :
  ```
  export FIREBASE_SERVICE_ACCOUNT="$(cat /chemin/vers/cle.json)"
  node scripts/definir-coach.mjs marie.sillas@gmail.com
  ```
- **Ou je la lance avec vous** : je vous demanderai la clé par un formulaire sécurisé (jamais dans la discussion), et je lance la commande. Ne me collez jamais la clé dans le chat.

3. Déconnectez-vous puis reconnectez-vous sur `/espace` : vous arrivez sur « Mes coachés ».

## 12. Avant d'inviter de vrais clients

- **Hébergement de données de santé (HDS)** : le suivi de la douleur et du ressenti touche à la santé. En France, héberger des données de santé pour le compte d'un professionnel peut imposer de passer par un hébergeur **certifié HDS**. **Je ne peux pas dire si la configuration Firebase choisie ici suffit** : faites-le valider (CNIL, juriste, conseil de votre assurance) avant d'y mettre les données de vrais clients. En attendant, utilisez uniquement des comptes de test.
- **Forfait Vercel** : le forfait gratuit (« Hobby ») est réservé à un usage **non commercial**. Rimaactive est une activité professionnelle : passez au forfait **Pro** avant de mettre l'espace en service.
- **Politique de confidentialité** : la version de cette branche est un brouillon à relire et à valider. Vérifiez aussi la date de « mise à jour » avant publication.
- **Accord des clients** : chaque client donne son consentement pour les données de santé à sa première connexion. Tant qu'il n'a pas donné son accord, il ne voit pas son programme (il peut seulement se déconnecter).

## 13. Vérifier que tout marche

1. Connectez-vous sur `/espace` avec votre compte : vous voyez « Mes coachés ».
2. Invitez un compte de test (une adresse à vous). Vérifiez qu'il reçoit l'e-mail de l'étape 10, qu'il peut créer son mot de passe, accepter l'accord et voir son accueil.
3. Créez un petit programme pour ce compte, publiez-le, faites une séance depuis le téléphone.
4. Supprimez le compte de test depuis sa fiche.

Si une étape bloque, notez le message exact affiché et envoyez-le-moi.
