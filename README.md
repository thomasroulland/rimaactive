# Rimaactive

Site vitrine de Rimaactive, codé en React (Vite + React Router) d'après le canvas Claude Design « Site Rimaactive ».

## Lancer en local

```bash
npm install
npm run dev
```

## Mettre en ligne sur Vercel

1. Importer ce dépôt sur [vercel.com/new](https://vercel.com/new).
2. Vercel détecte Vite tout seul : commande `npm run build`, dossier `dist`.
3. `vercel.json` renvoie toutes les URL vers `index.html` pour que les pages (`/entreprises`, `/contact`…) marchent en accès direct.

## Organisation

- `src/pages/` : une page par fichier (Accueil, Entreprises, Communes, Particuliers, À propos, Contact).
- `src/components/` : en-tête, pied de page, boutons, tuiles, emplacements photo, animation de la barre.
- `src/styles.css` : couleurs et typographie du design system Rimaactive.
- `public/fonts/` : Hanken Grotesk et Instrument Serif.

Les textes entre crochets `[…]` sont provisoires et restent à rédiger.
Les emplacements photo grisés sont à remplacer par les vraies photos.
