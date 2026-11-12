import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import {
  assertFails, assertSucceeds, initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, serverTimestamp, query, where } from 'firebase/firestore'
import { contenuFin, contenuNotes } from '../../src/espace/donnees/seances.js'

let env, coach, A, B, anon, sansRole

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-rimaactive',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  })
  coach = env.authenticatedContext('coach1', { role: 'coach' }).firestore()
  A = env.authenticatedContext('A', { role: 'client' }).firestore()
  B = env.authenticatedContext('B', { role: 'client' }).firestore()
  anon = env.unauthenticatedContext().firestore()
  // Compte créé sans passer par Marie (inscription libre) : connecté, mais sans rôle
  sansRole = env.authenticatedContext('X', {}).firestore()
})
afterAll(() => env.cleanup())

const base = (client, statut) => ({ client, nom: 'P', debut: '2026-11-16', parSemaine: 3, statut, semaines: [] })
const seance = (extra = {}) => ({
  client: 'A', programme: 'P1', seance: 'S1', date: '2026-11-16', statut: 'en cours', series: {}, ...extra,
})

beforeEach(async () => {
  await env.clearFirestore()
  await env.withSecurityRulesDisabled(async (ctx) => {
    const db = ctx.firestore()
    await setDoc(doc(db, 'utilisateurs/A'), { prenom: 'A', role: 'client', statut: 'invité', accordSante: null })
    await setDoc(doc(db, 'utilisateurs/B'), { prenom: 'B', role: 'client', statut: 'invité', accordSante: null })
    await setDoc(doc(db, 'exercices/E1'), { nom: 'Squat', retire: false })
    await setDoc(doc(db, 'programmes/P1'), base('A', 'publié'))
    await setDoc(doc(db, 'programmes/P2'), base('A', 'brouillon'))
    await setDoc(doc(db, 'programmes/P3'), base('B', 'publié'))
    await setDoc(doc(db, 'utilisateurs/X'), { prenom: 'X', role: 'client', statut: 'invité', accordSante: null })
    await setDoc(doc(db, 'programmes/PX'), base('X', 'publié'))
    await setDoc(doc(db, 'seancesFaites/PX_S1'), seance({ client: 'X', programme: 'PX' }))
    await setDoc(doc(db, 'seancesFaites/P1_S1'), seance())
    await setDoc(doc(db, 'seancesFaites/P1_S2'), seance({ seance: 'S2', statut: 'terminée', effort: 7 }))
  })
})

describe('utilisateurs', () => {
  it('le client A lit son profil, pas celui de B', async () => {
    await assertSucceeds(getDoc(doc(A, 'utilisateurs/A')))
    await assertFails(getDoc(doc(A, 'utilisateurs/B')))
  })
  it('le coach lit les deux profils', async () => {
    await assertSucceeds(getDoc(doc(coach, 'utilisateurs/A')))
    await assertSucceeds(getDoc(doc(coach, 'utilisateurs/B')))
  })
  it("le client A accepte l'accord santé une seule fois, avec ces deux champs seulement", async () => {
    await assertSucceeds(updateDoc(doc(A, 'utilisateurs/A'), { accordSante: serverTimestamp(), statut: 'actif' }))
    await assertFails(updateDoc(doc(A, 'utilisateurs/A'), { accordSante: serverTimestamp(), statut: 'actif' }))
    await env.withSecurityRulesDisabled(async (ctx) => {
      const snap = await getDoc(doc(ctx.firestore(), 'utilisateurs/A'))
      if (snap.data().accordSante === null) throw new Error('accordSante devrait rester renseigné')
    })
  })
  it('le client A ne peut modifier aucun autre champ (rôle)', async () => {
    await assertFails(updateDoc(doc(A, 'utilisateurs/A'), { role: 'coach' }))
    await assertFails(updateDoc(doc(A, 'utilisateurs/A'), { accordSante: serverTimestamp(), statut: 'actif', role: 'coach' }))
  })
  it("le client A ne modifie pas le profil de B", async () => {
    await assertFails(updateDoc(doc(A, 'utilisateurs/B'), { accordSante: serverTimestamp(), statut: 'actif' }))
  })
})

describe('utilisateurs : coach et anonyme', () => {
  it('le coach met un client en pause', async () => {
    await assertSucceeds(updateDoc(doc(coach, 'utilisateurs/A'), { statut: 'en pause' }))
  })
  it('le coach ne change pas le rôle', async () => {
    await assertFails(updateDoc(doc(coach, 'utilisateurs/A'), { role: 'coach' }))
  })
  it('un anonyme ne lit ni n\'écrit', async () => {
    await assertFails(getDoc(doc(anon, 'utilisateurs/A')))
    await assertFails(updateDoc(doc(anon, 'utilisateurs/A'), { statut: 'actif' }))
  })
})

describe('anonyme sur les autres collections', () => {
  it('ne lit ni n\'écrit exercices, programmes, séances', async () => {
    for (const chemin of ['exercices/E1', 'programmes/P1', 'seancesFaites/P1_S1']) {
      await assertFails(getDoc(doc(anon, chemin)))
      await assertFails(setDoc(doc(anon, chemin), { client: 'A', nom: 'x' }))
    }
  })
})

describe('exercices', () => {
  it('le coach écrit et lit', async () => {
    await assertSucceeds(setDoc(doc(coach, 'exercices/E2'), { nom: 'Fente', retire: false }))
    await assertSucceeds(getDoc(doc(coach, 'exercices/E1')))
  })
  it('un client ne lit pas et ne modifie pas', async () => {
    await assertFails(getDoc(doc(A, 'exercices/E1')))
    await assertFails(setDoc(doc(A, 'exercices/E3'), { nom: 'X' }))
  })
})

describe('programmes', () => {
  it('le client A lit son programme publié', async () => {
    await assertSucceeds(getDoc(doc(A, 'programmes/P1')))
  })
  it('le client A ne lit ni un brouillon ni le programme de B', async () => {
    await assertFails(getDoc(doc(A, 'programmes/P2')))
    await assertFails(getDoc(doc(A, 'programmes/P3')))
  })
  it("le client A n'écrit jamais un programme", async () => {
    await assertFails(updateDoc(doc(A, 'programmes/P1'), { nom: 'Autre' }))
    await assertFails(setDoc(doc(A, 'programmes/P9'), base('A', 'publié')))
    await assertFails(deleteDoc(doc(A, 'programmes/P1')))
  })
  it('le coach lit et écrit', async () => {
    await assertSucceeds(getDoc(doc(coach, 'programmes/P2')))
    await assertSucceeds(updateDoc(doc(coach, 'programmes/P2'), { nom: 'Autre' }))
  })
})

describe('seancesFaites', () => {
  it("le client A crée P1_S3 pour son programme publié", async () => {
    await assertSucceeds(setDoc(doc(A, 'seancesFaites/P1_S3'), seance({ seance: 'S3' })))
  })
  it("refuse un identifiant qui n'est pas programme_seance", async () => {
    await assertFails(setDoc(doc(A, 'seancesFaites/mauvais'), seance({ seance: 'S3' })))
  })
  it('refuse un programme de B ou un brouillon', async () => {
    await assertFails(setDoc(doc(A, 'seancesFaites/P3_S1'), seance({ programme: 'P3' })))
    await assertFails(setDoc(doc(A, 'seancesFaites/P2_S1'), seance({ programme: 'P2' })))
  })
  it('refuse de créer une séance au nom de B', async () => {
    await assertFails(setDoc(doc(A, 'seancesFaites/P1_S3'), seance({ seance: 'S3', client: 'B' })))
  })
  it('le client A lit ses séances, pas celles de B', async () => {
    await assertSucceeds(getDoc(doc(A, 'seancesFaites/P1_S1')))
    await assertFails(getDoc(doc(B, 'seancesFaites/P1_S1')))
  })
  it('le client A met à jour une séance en cours', async () => {
    await assertSucceeds(updateDoc(doc(A, 'seancesFaites/P1_S1'), { statut: 'terminée', effort: 6, majLe: serverTimestamp() }))
  })
  it('le client A ne modifie plus une séance terminée', async () => {
    await assertFails(updateDoc(doc(A, 'seancesFaites/P1_S2'), { effort: 3 }))
  })
  it('le coach change seulement commentaireCoach et majLe sur une séance terminée', async () => {
    await assertSucceeds(updateDoc(doc(coach, 'seancesFaites/P1_S2'), { commentaireCoach: 'Bravo', majLe: serverTimestamp() }))
    await assertFails(updateDoc(doc(coach, 'seancesFaites/P1_S2'), { effort: 2 }))
  })
  it('le client A ne change ni client, ni programme, ni seance', async () => {
    await assertFails(updateDoc(doc(A, 'seancesFaites/P1_S1'), { client: 'B' }))
    await assertFails(updateDoc(doc(A, 'seancesFaites/P1_S1'), { programme: 'P3' }))
    await assertFails(updateDoc(doc(A, 'seancesFaites/P1_S1'), { seance: 'S9' }))
  })
  it('le client B ne modifie pas la séance de A', async () => {
    await assertFails(updateDoc(doc(B, 'seancesFaites/P1_S1'), { effort: 5 }))
  })
  it('le client ne peut pas écrire commentaireCoach ni un champ inconnu', async () => {
    await assertFails(setDoc(doc(A, 'seancesFaites/P1_S3'), seance({ seance: 'S3', commentaireCoach: 'Super' })))
    await assertFails(setDoc(doc(A, 'seancesFaites/P1_S3'), seance({ seance: 'S3', truc: 1 })))
    await assertFails(updateDoc(doc(A, 'seancesFaites/P1_S1'), { commentaireCoach: 'Super' }))
    await assertFails(updateDoc(doc(A, 'seancesFaites/P1_S1'), { truc: 1 }))
  })
  it('le coach commente une séance en cours mais ne change pas ses séries', async () => {
    await assertSucceeds(updateDoc(doc(coach, 'seancesFaites/P1_S1'), { commentaireCoach: 'Bien', majLe: serverTimestamp() }))
    await assertFails(updateDoc(doc(coach, 'seancesFaites/P1_S1'), { series: { x: [{ charge: 1 }] } }))
  })
  it('personne ne supprime une séance faite', async () => {
    await assertFails(deleteDoc(doc(A, 'seancesFaites/P1_S1')))
    await assertFails(deleteDoc(doc(A, 'seancesFaites/P1_S2')))
    await assertFails(deleteDoc(doc(coach, 'seancesFaites/P1_S2')))
  })
})

// Ce qu'écrit l'écran client (depots.js : noterSeance et terminerSeance), sur l'émulateur
describe('séance du client : écritures de l’écran', () => {
  const base = (seance) => ({ client: 'A', programme: 'P1', seance, date: '2026-11-17', majLe: serverTimestamp() })
  const fin = { effort: 7, ressenti: 'Bien', commentaire: '', distance: '', temps: '', series: { e1: [{ charge: '40', reps: '8', rpe: '7' }] } }

  it('note des séries puis termine la séance (fusion)', async () => {
    await assertSucceeds(setDoc(doc(A, 'seancesFaites/P1_S3'), contenuNotes(base('S3'), { series: { e1: [{ charge: '40', reps: '8', rpe: '' }] } }), { merge: true }))
    await assertSucceeds(setDoc(doc(A, 'seancesFaites/P1_S3'), contenuNotes(base('S3'), { series: { e2: [{ charge: '', reps: '12', rpe: '' }] } }), { merge: true }))
    await assertSucceeds(setDoc(doc(A, 'seancesFaites/P1_S3'), contenuFin(base('S3'), fin), { merge: true }))
    const d = (await getDoc(doc(A, 'seancesFaites/P1_S3'))).data()
    if (d.statut !== 'terminée' || !d.series.e1 || !d.series.e2) throw new Error('fusion des séries attendue')
  })

  it('« Fin de séance » envoyée deux fois : un seul document, le second envoi est refusé', async () => {
    await assertSucceeds(setDoc(doc(A, 'seancesFaites/P1_S4'), contenuFin(base('S4'), fin), { merge: true }))
    await assertFails(setDoc(doc(A, 'seancesFaites/P1_S4'), contenuFin(base('S4'), { ...fin, effort: 3 }), { merge: true }))
    const s = await getDocs(query(collection(A, 'seancesFaites'), where('client', '==', 'A'), where('seance', '==', 'S4')))
    if (s.size !== 1) throw new Error(`un seul document attendu, ${s.size} trouvés`)
    if (s.docs[0].data().effort !== 7) throw new Error('le premier envoi doit rester')
  })

  it('une note arrivée après la fin de séance est refusée', async () => {
    await assertFails(setDoc(doc(A, 'seancesFaites/P1_S2'), contenuNotes(base('S2'), { series: { e1: [] } }), { merge: true }))
  })

  it('le client lit son programme publié et ses séances avec les requêtes de l’écran', async () => {
    await assertSucceeds(getDocs(query(collection(A, 'programmes'), where('client', '==', 'A'), where('statut', '==', 'publié'))))
    await assertFails(getDocs(query(collection(A, 'programmes'), where('client', '==', 'A'))))
    await assertSucceeds(getDocs(query(collection(A, 'seancesFaites'), where('client', '==', 'A'))))
  })
})

describe('nouvelles informations du coaché', () => {
  const base = (seance) => ({ client: 'A', programme: 'P1', seance, date: '2026-11-17', majLe: serverTimestamp() })
  it('crée sa séance avec notes, blocs et commentaire ; refuse douleur', async () => {
    await assertSucceeds(setDoc(doc(A, 'seancesFaites/P1_S6'), contenuNotes(base('S6'), { notes: { e1: 'Dur' }, blocs: { b1: { resultat: '12', fait: true } } }), { merge: true }))
    await assertSucceeds(setDoc(doc(A, 'seancesFaites/P1_S6'), contenuFin(base('S6'), { effort: 7, ressenti: 'Bien', commentaire: 'Top' }), { merge: true }))
    await assertFails(setDoc(doc(A, 'seancesFaites/P1_S7'), { ...contenuFin(base('S7'), { effort: 7 }), douleur: { oui: false } }, { merge: true }))
  })
  it('avatar : son dossier seulement, seul', async () => {
    await assertSucceeds(updateDoc(doc(A, 'utilisateurs/A'), { avatar: 'clients/A/profil/p.jpg' }))
    await assertSucceeds(updateDoc(doc(A, 'utilisateurs/A'), { avatar: null }))
    await assertFails(updateDoc(doc(A, 'utilisateurs/A'), { avatar: 'clients/B/profil/p.jpg' }))
    await assertFails(updateDoc(doc(A, 'utilisateurs/A'), { avatar: 12 }))
    await assertFails(updateDoc(doc(A, 'utilisateurs/A'), { avatar: 'clients/A/profil/p.jpg', statut: 'actif' }))
    await assertFails(updateDoc(doc(A, 'utilisateurs/B'), { avatar: 'clients/B/profil/p.jpg' }))
  })
  it('mesures : créer, lire, supprimer ; pas de mise à jour ; pas celles des autres', async () => {
    await assertSucceeds(setDoc(doc(A, 'utilisateurs/A/mesures/m1'), { date: '2026-11-17', poids: 72.5, creeLe: serverTimestamp() }))
    await assertSucceeds(getDoc(doc(A, 'utilisateurs/A/mesures/m1')))
    await assertFails(getDoc(doc(B, 'utilisateurs/A/mesures/m1')))
    await assertFails(setDoc(doc(B, 'utilisateurs/A/mesures/m2'), { date: '2026-11-17', creeLe: serverTimestamp() }))
    await assertSucceeds(getDoc(doc(coach, 'utilisateurs/A/mesures/m1')))
    await assertFails(updateDoc(doc(A, 'utilisateurs/A/mesures/m1'), { poids: '70' }))
    await assertFails(deleteDoc(doc(B, 'utilisateurs/A/mesures/m1')))
    await assertSucceeds(deleteDoc(doc(A, 'utilisateurs/A/mesures/m1')))
  })
  it('mesures et photos : champs, date et chemins resserrés', async () => {
    const m = (extra) => ({ date: '2026-11-17', poids: 72.5, creeLe: serverTimestamp(), ...extra })
    await assertFails(setDoc(doc(A, 'utilisateurs/A/mesures/m3'), m({ inconnu: 1 })))
    await assertFails(setDoc(doc(A, 'utilisateurs/A/mesures/m3'), m({ date: '17/11/2026' })))
    await assertFails(setDoc(doc(A, 'utilisateurs/A/mesures/m3'), m({ poids: '72,5' })))
    await assertSucceeds(setDoc(doc(A, 'utilisateurs/A/mesures/m3'), m({ taille: null })))
    const p = (chemin, extra) => ({ date: '2026-11-17', chemin, creeLe: serverTimestamp(), ...extra })
    await assertFails(setDoc(doc(A, 'utilisateurs/A/photos/p3'), p('clients/A/progression/x.jpg', { inconnu: 1 })))
    await assertFails(setDoc(doc(A, 'utilisateurs/A/photos/p3'), p('clients/A/progression/x.jpg', { date: 'hier' })))
    await assertFails(setDoc(doc(A, 'utilisateurs/A/photos/p3'), p('clients/A/progression/../../B/x.jpg')))
    await assertFails(setDoc(doc(A, 'utilisateurs/A/photos/p3'), p('clients/A/progression/a/b.jpg')))
    await assertFails(updateDoc(doc(A, 'utilisateurs/A'), { avatar: 'clients/A/profil/../../B/p.jpg' }))
    await assertFails(updateDoc(doc(A, 'utilisateurs/A'), { avatar: 'clients/A/profil/a/p.jpg' }))
  })
  it('photos : chemin dans son dossier ; lecture par la coach', async () => {
    await assertSucceeds(setDoc(doc(A, 'utilisateurs/A/photos/p1'), { date: '2026-11-17', chemin: 'clients/A/progression/x.jpg', creeLe: serverTimestamp() }))
    await assertFails(setDoc(doc(A, 'utilisateurs/A/photos/p2'), { date: '2026-11-17', chemin: 'clients/B/progression/x.jpg', creeLe: serverTimestamp() }))
    await assertSucceeds(getDoc(doc(coach, 'utilisateurs/A/photos/p1')))
    await assertFails(getDoc(doc(B, 'utilisateurs/A/photos/p1')))
    await assertFails(updateDoc(doc(A, 'utilisateurs/A/photos/p1'), { date: '2026-11-18' }))
    await assertSucceeds(deleteDoc(doc(A, 'utilisateurs/A/photos/p1')))
  })
})

describe('compte sans rôle (inscription libre)', () => {
  it('ne lit ni son profil, ni un programme publié à son nom, ni ses séances', async () => {
    await assertFails(getDoc(doc(sansRole, 'utilisateurs/X')))
    await assertFails(getDoc(doc(sansRole, 'programmes/PX')))
    await assertFails(getDoc(doc(sansRole, 'seancesFaites/PX_S1')))
    await assertFails(getDocs(query(collection(sansRole, 'programmes'), where('client', '==', 'X'), where('statut', '==', 'publié'))))
  })
  it("n'écrit ni profil, ni séance", async () => {
    await assertFails(updateDoc(doc(sansRole, 'utilisateurs/X'), { accordSante: serverTimestamp(), statut: 'actif' }))
    await assertFails(setDoc(doc(sansRole, 'seancesFaites/PX_S2'), seance({ client: 'X', programme: 'PX', seance: 'S2' })))
    await assertFails(updateDoc(doc(sansRole, 'seancesFaites/PX_S1'), { effort: 5 }))
  })
  it('ne lit ni exercices ni profils des autres', async () => {
    await assertFails(getDoc(doc(sansRole, 'exercices/E1')))
    await assertFails(getDoc(doc(sansRole, 'utilisateurs/A')))
  })
})

describe('« Fin de séance » après le retrait de tous les exercices', () => {
  const base = (seance) => ({ client: 'A', programme: 'P1', seance, date: '2026-11-17', majLe: serverTimestamp() })
  it('garde les notes des exercices retirés quand plus aucun exercice n’est affiché', async () => {
    await assertSucceeds(setDoc(doc(A, 'seancesFaites/P1_S5'), contenuNotes(base('S5'), { series: { e1: [{ charge: '40', reps: '8', rpe: '' }] } }), { merge: true }))
    // Marie a retiré tous les exercices : l'écran n'a plus rien à envoyer (series vide)
    await assertSucceeds(setDoc(doc(A, 'seancesFaites/P1_S5'), contenuFin(base('S5'), { effort: 6, series: {} }), { merge: true }))
    const d = (await getDoc(doc(A, 'seancesFaites/P1_S5'))).data()
    if (d.statut !== 'terminée') throw new Error('séance terminée attendue')
    if (!d.series?.e1?.length || d.series.e1[0].charge !== '40') throw new Error(`notes de e1 perdues : ${JSON.stringify(d.series)}`)
  })
})
