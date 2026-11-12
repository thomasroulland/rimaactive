import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import {
  assertFails, assertSucceeds, initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import { doc, getDoc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore'

let env, coach, A, B

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-rimaactive',
    firestore: { rules: readFileSync('firestore.rules', 'utf8') },
  })
  coach = env.authenticatedContext('coach1', { role: 'coach' }).firestore()
  A = env.authenticatedContext('A', { role: 'client' }).firestore()
  B = env.authenticatedContext('B', { role: 'client' }).firestore()
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
  })
  it('le client A ne peut modifier aucun autre champ (rôle)', async () => {
    await assertFails(updateDoc(doc(A, 'utilisateurs/A'), { role: 'coach' }))
    await assertFails(updateDoc(doc(A, 'utilisateurs/A'), { accordSante: serverTimestamp(), statut: 'actif', role: 'coach' }))
  })
  it("le client A ne modifie pas le profil de B", async () => {
    await assertFails(updateDoc(doc(A, 'utilisateurs/B'), { accordSante: serverTimestamp(), statut: 'actif' }))
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
  it('personne ne supprime une séance faite', async () => {
    await assertFails(deleteDoc(doc(A, 'seancesFaites/P1_S1')))
    await assertFails(deleteDoc(doc(A, 'seancesFaites/P1_S2')))
    await assertFails(deleteDoc(doc(coach, 'seancesFaites/P1_S2')))
  })
})
