// Contenus réels du site (textes et tarifs de Marie) et éléments communs aux 4 maquettes
const A = 'file:///home/user/rimaactive/src/assets/';
const IMG = {
  heros: A + 'heros-squat-nb.jpg', portrait: A + 'portrait-marie.jpg',
  entreprises: A + 'service-entreprises.jpg', groupes: A + 'service-groupes.jpg', individuel: A + 'service-individuel.jpg',
  logoEncre: A + 'rimaactive-mot-encre.svg', logoCraie: A + 'rimaactive-mot-craie.svg',
};

function picto(nom, taille = 24) {
  if (nom === 'kettlebell') return `<svg class="picto" width="${taille}" height="${taille}" viewBox="18.5 26.5 219 219" fill="none" stroke="currentColor" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"><path d="M92 104V84a36 36 0 0 1 72 0v20"/><circle cx="128" cy="160" r="64"/><path d="M100 216h56"/></svg>`;
  return `<svg class="picto" width="${taille}" height="${taille}" viewBox="0 0 256 256" fill="currentColor"><path d="${window.TRACES[nom]}"/></svg>`;
}
const fleche = '<svg width="12" height="12" viewBox="0 0 256 256" fill="none" stroke="currentColor" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"><path d="M72 184 184 72M88 72h96v96"/></svg>';
const coche = (items) => `<ul class="coche">${items.map((t) => `<li>${picto('check-square', 20)}<span>${t}</span></li>`).join('')}</ul>`;

const D = {
  surtitre: 'Coach sportive diplômée · Houdan (78)',
  nom: 'Marie Sillas',
  accroche: 'Un corps fort et mobile grâce à une pratique fonctionnelle',
  approche: [
    'Je vous propose des séances à domicile ou en salle, adaptées à votre niveau. Ensemble, on travaille à partir des mouvements fondamentaux pour gagner en mobilité, en force et en autonomie.',
    'Au fil des séances, vous prenez confiance et le plaisir de bouger s’installe.',
  ],
  points: ['Force', 'Endurance', 'Puissance', 'Mobilité'],
  offres: [
    { titre: 'Entreprises', lieux: 'Locaux · Extérieur', prix: 'À partir de 110 € la séance', image: IMG.entreprises, picto: 'buildings',
      texte: 'J’accompagne vos équipes avec des séances de mobilité et de renforcement fonctionnel dans vos locaux ou en extérieur.' },
    { titre: 'Duo et groupes', lieux: 'Domicile · Extérieur', prix: 'Dès 14 € par personne', image: IMG.groupes, picto: 'users',
      texte: 'Retrouvez-moi en extérieur, près de chez vous, pour progresser ensemble dans un esprit d’entraide.' },
    { titre: 'Individuel', lieux: 'Domicile · Salle · En ligne', prix: 'Dès 45 € la séance', image: IMG.individuel, picto: 'kettlebell',
      texte: 'Je vous accompagne en présentiel ou à distance avec des séances construites autour de vos objectifs et de votre niveau.' },
  ],
  formats: [
    ['Density Training', 'Une séance dans un temps donné à densifier au fil des semaines pour progresser de façon mesurable.', ['Prise de masse', 'Force']],
    ['Circuit training', 'Des enchaînements d’exercices qui sollicitent tout le corps pour améliorer votre endurance globale.', ['Dépense énergétique', 'Condition physique']],
    ['EMOM', 'Un départ toutes les minutes pour densifier votre séance et apprendre à gérer l’effort face à la fatigue.', ['Endurance de force', 'Mental']],
    ['AMRAP', 'Un maximum de tours sur un temps donné pour tester votre mental et apprendre à gérer votre rythme.', ['Dépassement de soi', 'Cardio']],
    ['Complex', 'Des combinaisons d’exercices enchaînés avec le même outil pour renforcer votre coordination.', ['Puissance', 'Coordination']],
  ],
  // Page Individuel, onglet Présentiel (la page de formules montrée dans chaque maquette)
  individuel: {
    liste: ['En salle ou à domicile', 'Matériel fourni : tapis, kettlebells, slam balls, etc.', 'Déplacement inclus jusqu’à 20 km autour de Houdan (78)'],
    formules: [
      { nom: 'Active Solo', sur: '1 séance en présentiel', picto: 'barbell', tarifs: [['À domicile', '65 €', 'la séance'], ['En salle', '55 €', 'la séance']] },
      { nom: 'Active Flex', sur: '4 séances par mois en présentiel', picto: 'kettlebell', sombre: true,
        tarifs: [['À domicile', '220 €', '55 € la séance'], ['En salle', '180 €', '45 € la séance']],
        compris: ['Bilan initial + bilan postural + correctifs', 'Programme personnalisé', 'Suivi hebdomadaire par message', 'Bilan mensuel', 'Engagement mois par mois'] },
    ],
  },
  note: 'Tarifs valables jusqu’au 30 avril 2027. TVA non applicable, art. 293 B du CGI.',
  lieu: 'Basée à Houdan (78), je me déplace dans les Yvelines, l’Eure-et-Loir et l’Eure.',
  email: 'marie.sillas.coaching@outlook.com',
};

function barre(actif, surPhoto = false) {
  const pages = ['Accueil', 'Entreprises', 'Duo et groupes', 'Individuel'];
  return `<header class="conteneur barre ${surPhoto ? 'barre--photo' : ''}">
    <img class="logo" src="${surPhoto ? IMG.logoCraie : IMG.logoEncre}" alt="rimaactive">
    <nav class="bulles">${pages.map((p) => `<a class="bulle ${p === actif ? 'bulle--active' : ''}">${p}</a>`).join('')}</nav>
    <a class="ecrire">M’écrire ${fleche}</a><span class="menu-tel" style="${surPhoto ? 'color:var(--craie)' : ''}">Menu</span>
  </header>`;
}

function pied(seulementMentions = false) {
  const bas = `<div class="bas"><span>© 2026 Rimaactive</span><span>Mentions légales &nbsp;&nbsp; Confidentialité</span></div>`;
  if (seulementMentions) return `<footer class="conteneur" style="padding:16px var(--g)"><div style="border-top:1px solid var(--filet);padding-top:16px;display:flex;justify-content:center;gap:24px;font-size:14px;color:var(--gris)"><span>© 2026 Rimaactive</span><span>Mentions légales</span><span>Confidentialité</span></div></footer>`;
  return `<footer class="pied"><div class="conteneur"><div class="grille">
    <div><p class="surtitre">Besoin d’en savoir plus ?</p><h2 class="titre t-section">Contactez-moi</h2><p class="lieu">${D.lieu}</p></div>
    <div class="infos"><nav class="menu"><a>Accueil</a><a>Entreprises</a><a>Duo et groupes</a><a>Individuel</a><a>Contact</a></nav>
      <div><p class="etiq">E-mail</p><a><b>${D.email}</b></a></div>
      <div><p class="etiq">Suivez-moi</p><b>Instagram</b> / Facebook / LinkedIn</div></div>
  </div>${bas}</div></footer>`;
}

function formulaire() {
  const champ = (l, ph, plein = false) => `<label class="champ ${plein ? 'plein' : ''}"><span>${l}</span><input placeholder="${ph}"></label>`;
  return `<form class="formulaire">
    ${champ('Prénom et nom', 'Prénom et nom')}${champ('E-mail', 'vous@exemple.fr')}
    <label class="champ plein"><span>Vous êtes</span><select><option>Particulier</option></select></label>
    <label class="champ plein"><span>Votre message <i class="gris" style="font-style:normal;font-weight:400">(facultatif)</i></span><textarea rows="3" placeholder="Vos objectifs, vos disponibilités…"></textarea></label>
    <label class="accord plein"><input type="checkbox"> <span>J’accepte d’être recontacté(e) au sujet de ma demande. Mes informations restent privées.</span></label>
    <div class="plein"><a class="bouton bouton--jaune">Envoyer</a></div>
  </form>`;
}

// Affiche la page demandée (?p=accueil|formules|contact) de la maquette
function afficher(pages) {
  const p = new URLSearchParams(location.search).get('p') || 'accueil';
  document.body.innerHTML = pages[p]();
}
