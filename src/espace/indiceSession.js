// Souvenir (sur cet appareil) qu'une session est ouverte, pour afficher tout de suite le bon écran au chargement de /espace :
// la connexion si personne n'est connecté, sinon l'écran d'attente de l'espace. Aucune donnée personnelle : seulement le rôle.
// Ce fichier est chargé avec le site : il ne doit pas importer Firebase.
const CLE = 'rima-espace'
export function lireIndice() {
  try { return window.localStorage.getItem(CLE) } catch { return null }
}
export function ecrireIndice(valeur) {
  try {
    if (valeur) window.localStorage.setItem(CLE, valeur)
    else window.localStorage.removeItem(CLE)
  } catch { /* stockage indisponible : on affichera simplement l'écran d'attente */ }
}
