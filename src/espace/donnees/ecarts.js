import { estEnSeries } from './seances.js'
import { enDuree, fr, lignesExercice, resumeFormat, texteDuree } from './seances.js'
// Prévu / fait d'une séance, pour le coach (15 novembre 2026) : exercice par exercice, ce que Marie avait prévu,
// ce que le coaché a noté, et l'écart en une phrase. Calculs purs.

const rempli = (v) => String(v ?? '').trim() !== ''
const nombre = (v) => (rempli(v) ? parseFloat(String(v).trim().replace(',', '.')) : NaN)
const pluriel = (n, mot) => `${fr(n)} ${mot}${n > 1 ? 's' : ''}`
const arrondi = (n) => Math.round(n * 10) / 10

// « 8 » ou « 8-10 » → 8 ; « 45 s », « max » → null (pas comparable)
function repsPrevues(reps) {
  const m = /^(\d+)(\s*(-|–|à)\s*\d+)?$/.exec(String(reps ?? '').trim())
  return m ? Number(m[1]) : null
}

// « 70 × 6 », « 70 kg », « 12 rép. »
function texteFait(l) {
  const c = String(l.charge ?? '').trim()
  const d = texteDuree(l.duree)
  if (d) return c ? `${d} à ${fr(c)} kg` : d
  const r = String(l.reps ?? '').trim()
  return c && r ? `${fr(c)} × ${r}` : c ? `${fr(c)} kg` : r ? `${r} rép.` : 'sans chiffre'
}

function exerciceEnSeries(el, lignes) {
  const prevu = lignesExercice(el, true).prescription.replace(' · charge libre', '') // « charge libre » n'aide pas à comparer
  const faites = (lignes ?? []).filter((l) => l.fait !== false)
  const base = { cle: el.id, nom: el.nom || 'Exercice', prevu }
  if (faites.length === 0) return { ...base, fait: '', statut: 'pas-fait', ecart: 'Pas fait' }
  const moins = []
  const n = parseInt(String(el.series ?? '').trim(), 10)
  if (n > 0 && faites.length < n) moins.push(`${pluriel(faites.length, 'série')} sur ${n}`)
  const rp = enDuree(el) ? null : repsPrevues(el.reps) // une durée n'est pas comparée à des répétitions
  if (rp !== null) {
    const manque = faites.reduce((t, l) => (/^\d+$/.test(String(l.reps ?? '').trim()) ? t + Math.max(0, rp - Number(l.reps)) : t), 0)
    if (manque > 0) moins.push(`${pluriel(manque, 'répétition')} en moins`)
  }
  const cp = nombre(el.charge)
  const charges = faites.map((l) => nombre(l.charge)).filter((c) => !Number.isNaN(c))
  let plus = ''
  if (cp > 0 && charges.length) {
    const bas = Math.min(...charges)
    const haut = Math.max(...charges)
    if (bas < cp) moins.push(`${fr(arrondi(cp - bas))} kg de moins`)
    else if (haut > cp) plus = `${fr(arrondi(haut - cp))} kg de plus`
  }
  const fait = faites.map(texteFait).join(', ')
  if (moins.length) return { ...base, fait, statut: 'moins', ecart: moins.join(', ') }
  if (plus) return { ...base, fait, statut: 'plus', ecart: plus }
  return { ...base, fait, statut: 'prevu', ecart: 'Comme prévu' }
}

// EMOM, AMRAP, TABATA, HIIT : une ligne pour le bloc, d'après « Mon résultat »
function blocAutreFormat(bloc, r) {
  const base = { cle: bloc.id, nom: resumeFormat(bloc), prevu: (bloc.elements ?? []).map((e) => e.nom).filter(Boolean).join(', ') }
  const res = String(r?.resultat ?? '').trim()
  if (!r?.fait && !res) return { ...base, fait: '', statut: 'pas-fait', ecart: 'Pas fait' }
  const f = bloc.format
  const cible = nombre(f === 'emom' ? bloc.duree : f === 'amrap' ? '' : bloc.tours)
  const unite = f === 'emom' ? 'minute' : 'tour'
  const reps = String(r?.reps ?? '').trim()
  const fait = res ? `${pluriel(nombre(res) || 0, unite)}${f === 'amrap' && reps ? ` et ${reps} rép.` : ''}` : 'validé'
  if (res && cible > 0 && nombre(res) < cible) return { ...base, fait, statut: 'moins', ecart: `${pluriel(nombre(res), unite)} sur ${fr(cible)}` }
  return { ...base, fait, statut: 'prevu', ecart: 'Comme prévu' }
}

// { lignes: [{ cle, nom, prevu, fait, statut, ecart }], aRegarder, verdict }
// statut : 'pas-fait', 'moins' (en dessous du prévu), 'prevu', 'plus' (plus lourd que prévu), 'retire' (exercice retiré du programme)
export function comparerSeance(seance, sf) {
  const series = sf?.series ?? {}
  const lignes = []
  const connus = new Set()
  for (const bloc of seance?.blocs ?? []) {
    if (estEnSeries(bloc.format)) {
      for (const el of bloc.elements ?? []) { connus.add(el.id); lignes.push(exerciceEnSeries(el, series[el.id])) }
    } else {
      for (const el of bloc.elements ?? []) connus.add(el.id)
      lignes.push(blocAutreFormat(bloc, sf?.blocs?.[bloc.id]))
    }
  }
  for (const [id, l] of Object.entries(series)) {
    const faites = (l ?? []).filter((x) => x.fait !== false)
    if (!connus.has(id) && faites.length) lignes.push({ cle: id, nom: 'Exercice retiré du programme', prevu: '', fait: faites.map(texteFait).join(', '), statut: 'retire', ecart: '' })
  }
  const aRegarder = lignes.filter((l) => l.statut === 'moins' || l.statut === 'pas-fait').length
  const mieux = lignes.filter((l) => l.statut === 'plus')
  const compares = lignes.filter((l) => l.statut !== 'retire').length
  let verdict = ''
  if (sf?.statut !== 'terminée') verdict = 'En cours'
  else if (aRegarder > 0) verdict = `${pluriel(aRegarder, 'exercice')} à regarder`
  else if (mieux.length === 1) verdict = `Tout fait, ${mieux[0].ecart} au ${mieux[0].nom.toLowerCase()}`
  else if (mieux.length > 1) verdict = `Tout fait, plus lourd sur ${mieux.length} exercices`
  else if (compares > 0) verdict = 'Tout fait comme prévu'
  return { lignes, aRegarder, verdict }
}

// ---------- Séance faite, page du coach (16 novembre 2026) : cases « prévu / fait » et bilan ----------

const premier = (liste) => liste.find((v) => rempli(v))
// Une seule valeur → elle ; plusieurs valeurs numériques → « min–max » ; sinon la dernière
function valeurFaite(valeurs) {
  const v = valeurs.map((x) => String(x ?? '').trim()).filter(Boolean)
  if (v.length === 0) return ''
  const uniques = [...new Set(v)]
  if (uniques.length === 1) return uniques[0]
  const n = uniques.map(nombre)
  if (n.every((x) => !Number.isNaN(x))) return `${fr(Math.min(...n))}–${fr(Math.max(...n))}`
  return v[v.length - 1]
}
const comparer = (fait, prevu, plusEstMieux = true) => {
  const f = nombre(fait); const p = nombre(prevu)
  if (!rempli(fait)) return 'vide'
  if (Number.isNaN(f) || Number.isNaN(p) || !rempli(prevu)) return 'ok'
  if (f === p) return 'ok'
  return (f > p) === plusEstMieux ? 'plus' : 'moins'
}

// Cases d'un exercice en séries : [{ cle, libelle, prevu, fait, etat }] (séries, répétitions ou durée, charge, repos).
// `etat` : 'ok' (comme prévu), 'plus', 'moins' (pas assez), 'vide' (rien noté). Le repos n'est plus noté par le coaché : on montre le prévu.
export function casesExercice(el, lignes) {
  const duree = enDuree(el)
  const faites = (lignes ?? []).filter((l) => l && l.fait !== false)
  const cleMesure = duree ? 'duree' : 'reps'
  const prevuMesure = duree ? texteDuree(el?.reps) : String(el?.reps ?? '').trim()
  const faitMesure = valeurFaite(faites.map((l) => l[cleMesure]))
  const faitCharge = valeurFaite(faites.map((l) => l.charge))
  const prevuSeries = String(el?.series ?? '').trim()
  const nbSeries = faites.length ? String(faites.length) : ''
  const nombreFait = (v) => (duree ? parseFloat(String(v).replace(',', '.')) : nombre(v))
  return [
    { cle: 'series', libelle: 'Séries', prevu: prevuSeries, fait: nbSeries, etat: nbSeries ? comparer(nbSeries, prevuSeries) : 'vide' },
    { cle: 'mesure', libelle: duree ? 'Durée' : 'Reps', prevu: prevuMesure, fait: faitMesure, etat: faitMesure ? (Number.isNaN(nombreFait(faitMesure)) ? 'ok' : comparer(nombreFait(faitMesure), nombreFait(prevuMesure))) : 'vide' },
    { cle: 'charge', libelle: 'Charge', prevu: rempli(el?.charge) ? String(el.charge).trim() : '', fait: faitCharge, etat: faitCharge ? comparer(faitCharge, el?.charge) : 'vide' },
    { cle: 'repos', libelle: 'Repos', prevu: String(el?.repos ?? '').trim(), fait: '', etat: 'vide' },
  ]
}

// Détail série par série : [{ n, prevu, fait, etat }] ; `etat` 'non-faite' si la série n'a pas été cochée
export function detailSeries(el, lignes) {
  const duree = enDuree(el)
  const total = Math.max(parseInt(String(el?.series ?? '').trim(), 10) || 0, (lignes ?? []).length)
  const prevu = [duree ? texteDuree(el?.reps) : String(el?.reps ?? '').trim(), rempli(el?.charge) ? `${fr(String(el.charge).trim())} kg` : ''].filter(Boolean)
  const prevuTexte = duree ? prevu.join(' · ') : (prevu.length === 2 ? `${prevu[0]} × ${prevu[1]}` : prevu[0] ?? '')
  return Array.from({ length: total }, (_, i) => {
    const l = lignes?.[i]
    if (!l || l.fait === false) return { n: i + 1, prevu: prevuTexte, fait: '', etat: 'non-faite' }
    const m = duree ? texteDuree(l.duree) : String(l.reps ?? '').trim()
    const c = String(l.charge ?? '').trim()
    const fait = duree ? [m, c && `${fr(c)} kg`].filter(Boolean).join(' · ') : (m && c ? `${m} × ${fr(c)} kg` : c ? `${fr(c)} kg` : m ? `${m} rép.` : '')
    const e = [duree ? 'ok' : comparer(m, el?.reps), comparer(c, el?.charge)]
    const etat = e.includes('moins') ? 'moins' : e.includes('plus') ? 'plus' : 'ok'
    return { n: i + 1, prevu: prevuTexte, fait, etat }
  })
}

// Bilan d'une séance faite : séries cochées sur séries prévues, RPE moyen noté
export function bilanSeance(seance, sf) {
  let faites = 0; let total = 0; const rpes = []
  for (const b of seance?.blocs ?? []) {
    if (!estEnSeries(b.format)) continue
    for (const el of b.elements ?? []) {
      const l = sf?.series?.[el.id] ?? []
      total += Math.max(parseInt(String(el.series ?? '').trim(), 10) || 0, l.length)
      for (const x of l) { if (x && x.fait !== false) { faites += 1; const r = nombre(x.rpe); if (!Number.isNaN(r)) rpes.push(r) } }
    }
  }
  const rpeMoyen = rpes.length ? arrondi(rpes.reduce((t, r) => t + r, 0) / rpes.length) : null
  return { faites, total, rpeMoyen }
}
