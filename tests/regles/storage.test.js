import { readFileSync } from 'node:fs'
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest'
import {
  assertFails, assertSucceeds, initializeTestEnvironment,
} from '@firebase/rules-unit-testing'
import { ref, uploadBytes, getBytes, deleteObject } from 'firebase/storage'

let env, coach, A, B, anon

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-rimaactive',
    storage: { rules: readFileSync('storage.rules', 'utf8') },
  })
  coach = env.authenticatedContext('coach1', { role: 'coach' }).storage()
  A = env.authenticatedContext('A', { role: 'client' }).storage()
  B = env.authenticatedContext('B', { role: 'client' }).storage()
  anon = env.unauthenticatedContext().storage()
})
afterAll(() => env.cleanup())

const octets = (n) => new Uint8Array(n)
const jpeg = { contentType: 'image/jpeg' }
const MO = 1024 * 1024

beforeEach(async () => {
  await env.clearStorage()
  await env.withSecurityRulesDisabled(async (ctx) => {
    const st = ctx.storage()
    await uploadBytes(ref(st, 'exercices/E1/photo.jpg'), octets(10), jpeg)
    await uploadBytes(ref(st, 'clients/A/photo.jpg'), octets(10), jpeg)
  })
})

describe('exercices/**', () => {
  it('tout utilisateur connecté lit', async () => {
    await assertSucceeds(getBytes(ref(A, 'exercices/E1/photo.jpg')))
    await assertSucceeds(getBytes(ref(B, 'exercices/E1/photo.jpg')))
    await assertSucceeds(getBytes(ref(coach, 'exercices/E1/photo.jpg')))
  })
  it('seul le coach écrit', async () => {
    await assertSucceeds(uploadBytes(ref(coach, 'exercices/E1/nouvelle.jpg'), octets(10), jpeg))
    await assertFails(uploadBytes(ref(A, 'exercices/E1/nouvelle.jpg'), octets(10), jpeg))
  })
  it('le client ne peut pas supprimer', async () => {
    await assertFails(deleteObject(ref(A, 'exercices/E1/photo.jpg')))
  })
  it('un visiteur non connecté ne lit ni n’écrit', async () => {
    await assertFails(getBytes(ref(anon, 'exercices/E1/photo.jpg')))
    await assertFails(uploadBytes(ref(anon, 'exercices/E1/x.jpg'), octets(10), jpeg))
  })
})

describe('clients/{uid}/**', () => {
  it('A lit et écrit chez lui, le coach aussi', async () => {
    await assertSucceeds(getBytes(ref(A, 'clients/A/photo.jpg')))
    await assertSucceeds(uploadBytes(ref(A, 'clients/A/autre.png'), octets(10), { contentType: 'image/png' }))
    await assertSucceeds(getBytes(ref(coach, 'clients/A/photo.jpg')))
    await assertSucceeds(uploadBytes(ref(coach, 'clients/A/coach.webp'), octets(10), { contentType: 'image/webp' }))
  })
  it('B ne lit ni n’écrit chez A', async () => {
    await assertFails(getBytes(ref(B, 'clients/A/photo.jpg')))
    await assertFails(uploadBytes(ref(B, 'clients/A/b.jpg'), octets(10), jpeg))
  })
  it('un visiteur non connecté ne lit ni n’écrit', async () => {
    await assertFails(getBytes(ref(anon, 'clients/A/photo.jpg')))
    await assertFails(uploadBytes(ref(anon, 'clients/A/x.jpg'), octets(10), jpeg))
  })
  it('refuse un type de fichier autre que jpeg, png, webp', async () => {
    await assertFails(uploadBytes(ref(A, 'clients/A/x.heic'), octets(10), { contentType: 'image/heic' }))
    await assertFails(uploadBytes(ref(A, 'clients/A/x.pdf'), octets(10), { contentType: 'application/pdf' }))
    await assertFails(uploadBytes(ref(coach, 'exercices/E1/x.gif'), octets(10), { contentType: 'image/gif' }))
  })
  it('refuse plus de 5 Mo, accepte juste en dessous', async () => {
    await assertSucceeds(uploadBytes(ref(A, 'clients/A/ok.jpg'), octets(5 * MO - 1), jpeg))
    await assertFails(uploadBytes(ref(A, 'clients/A/gros.jpg'), octets(5 * MO + 1), jpeg))
    await assertFails(uploadBytes(ref(coach, 'exercices/E1/gros.jpg'), octets(5 * MO + 1), jpeg))
  })
})

describe('suppression', () => {
  it('le coach supprime sous exercices/ et sous clients/A/', async () => {
    await assertSucceeds(deleteObject(ref(coach, 'exercices/E1/photo.jpg')))
    await assertSucceeds(deleteObject(ref(coach, 'clients/A/photo.jpg')))
  })
  it('le client A supprime son propre fichier', async () => {
    await assertSucceeds(deleteObject(ref(A, 'clients/A/photo.jpg')))
  })
  it('le client B ne supprime pas chez A', async () => {
    await assertFails(deleteObject(ref(B, 'clients/A/photo.jpg')))
  })
  it('un visiteur non connecté ne supprime rien', async () => {
    await assertFails(deleteObject(ref(anon, 'exercices/E1/photo.jpg')))
    await assertFails(deleteObject(ref(anon, 'clients/A/photo.jpg')))
  })
  it('un client ne supprime pas sous exercices/', async () => {
    await assertFails(deleteObject(ref(A, 'exercices/E1/photo.jpg')))
  })
})
