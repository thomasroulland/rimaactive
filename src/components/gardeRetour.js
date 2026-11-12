// Point d'accroche pour le bouton Précédent / Suivant du navigateur, posé AVANT le routeur (main.jsx) :
// le premier écouteur « popstate » de window passe en premier et peut empêcher le routeur de changer de page.
// Utilisé par l'éditeur de programme (espace coach) pour demander « Quitter sans enregistrer ? ».
// Aucune dépendance : le site vitrine ne charge rien de plus.
let garde = null

export function definirGardeRetour(fn) {
  garde = fn
  return () => { if (garde === fn) garde = null }
}

window.addEventListener('popstate', (e) => { if (garde) garde(e) })
