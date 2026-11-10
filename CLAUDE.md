# Consignes pour Claude — site Rimaactive

Lire `PASSATION.md` en entier avant de toucher au site : règles, charte, état du site et façon de travailler.

**La charte graphique est dans le design system Rimaactive** (Marie, 10 novembre 2026) :
artefact https://claude.ai/artifact/4svx69gTGF2WhNCJc2r5eP. C'est la référence pour les couleurs,
les polices, les tailles, les pictogrammes et les photos ; la consulter (lecture seule) avant toute
question de style. `DESIGN.md` en est le résumé pour les outils de design.
Répondre à Marie en français, simplement, sans jargon.

## Toujours utiliser les skills

Marie demande que Claude utilise **à chaque demande** les skills disponibles qui conviennent le mieux,
avant de répondre ou de coder (pas seulement quand elle les nomme). Dire en une ligne lesquels ont servi.

| Demande | Skills à charger |
| --- | --- |
| Mise en page, rubrique, composant, téléphone, accessibilité | `ui-ux-pro-max` (dans `.claude/skills/`), `frontend-design` |
| Relire ou critiquer une page, une maquette | `website-design:web-review`, `design:design-critique`, `design:accessibility-review` |
| Nouvelle idée, nouvelle rubrique, refonte | `superpowers:brainstorming`, puis `superpowers:writing-plans` |
| Textes du site (titres, boutons, descriptions) | `copywriting-kit:copy-edit`, `copywriting-kit:copy-diagnose`, `design:ux-copy` |
| Bug, affichage cassé | `superpowers:systematic-debugging` |
| Avant de dire « c'est fini » ou de fusionner | `superpowers:verification-before-completion` |

Si un skill n'est pas disponible dans la discussion, le dire et continuer avec les autres.

**La charte passe avant les skills** : aucune palette, police, taille ou « style » proposé par un skill
ne remplace le design system Rimaactive (voir `PASSATION.md` § 2 et 3). Les skills servent à la mise
en page, à l'ergonomie, à l'accessibilité, aux textes et aux vérifications.

## Mise en ligne : seulement avec l'accord écrit de Marie

~~Mode automatique du 4 novembre 2026~~ **remplacé le 10 novembre 2026** : ne rien mettre en ligne ni pousser
sur GitHub sans l'accord écrit de Marie ; avant toute modification définitive, lui montrer une image « avant / après »
et attendre son OK ; si elle dit non, tout annuler.
