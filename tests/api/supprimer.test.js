import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import handler from '../../api/supprimer-client.js'
import { nomBucket } from '../../api/_admin.js'
import { app, appeler, BUCKET, compteAvecJeton, toutEffacer } from './aide.js'

let coach, A, B
const bucket = () => app().storage().bucket(BUCKET)

async function peupler(c) {
  const db = app().firestore()
  await db.doc(`utilisateurs/${c.uid}`).set({ role: 'client', prenom: 'X', nom: 'Y' })
  await db.doc(`programmes/p_${c.uid}`).set({ client: c.uid, nom: 'P' })
  await db.doc(`seancesFaites/p_${c.uid}_s1`).set({ client: c.uid })
  await db.doc(`utilisateurs/${c.uid}/mesures/m1`).set({ date: '2026-11-17', poids: '72,5' })
  await db.doc(`utilisateurs/${c.uid}/photos/ph1`).set({ date: '2026-11-17', chemin: `clients/${c.uid}/progression/x.jpg` })
  await bucket().file(`clients/${c.uid}/photo.jpg`).save(Buffer.from('x'), { contentType: 'image/jpeg' })
}
const existe = async (chemin) => (await app().firestore().doc(chemin).get()).exists

beforeAll(() => app())
afterEach(() => vi.restoreAllMocks())
beforeEach(async () => {
  await toutEffacer()
  coach = await compteAvecJeton('coach@example.com', 'coach')
  A = await compteAvecJeton('a@example.com', 'client')
  B = await compteAvecJeton('b@example.com', 'client')
  await peupler(A)
  await peupler(B)
})

describe('POST /api/supprimer-client', () => {
  it('405 si ce n est pas POST', async () => {
    expect((await appeler(handler, { method: 'GET', jeton: coach.jeton })).code).toBe(405)
  })
  it('sans jeton : 401', async () => {
    expect((await appeler(handler, { body: { uid: A.uid } })).code).toBe(401)
  })
  it('jeton client : 403', async () => {
    expect((await appeler(handler, { jeton: B.jeton, body: { uid: A.uid } })).code).toBe(403)
  })
  it('uid manquant : 400 champs', async () => {
    const r = await appeler(handler, { jeton: coach.jeton, body: {} })
    expect(r.code).toBe(400)
    expect(r.corps).toEqual({ code: 'champs' })
  })
  it('refuse de supprimer un coach : 403', async () => {
    const r = await appeler(handler, { jeton: coach.jeton, body: { uid: coach.uid } })
    expect(r.code).toBe(403)
    await expect(app().auth().getUser(coach.uid)).resolves.toBeTruthy()
  })
  it('supprime tout du client A, laisse B intact : 204', async () => {
    const r = await appeler(handler, { jeton: coach.jeton, body: { uid: A.uid } })
    expect(r.code).toBe(204)
    expect(await existe(`utilisateurs/${A.uid}`)).toBe(false)
    expect(await existe(`programmes/p_${A.uid}`)).toBe(false)
    expect(await existe(`seancesFaites/p_${A.uid}_s1`)).toBe(false)
    expect(await existe(`utilisateurs/${A.uid}/mesures/m1`)).toBe(false)
    expect(await existe(`utilisateurs/${A.uid}/photos/ph1`)).toBe(false)
    const [fichiersA] = await bucket().getFiles({ prefix: `clients/${A.uid}/` })
    expect(fichiersA).toHaveLength(0)
    await expect(app().auth().getUser(A.uid)).rejects.toMatchObject({ code: 'auth/user-not-found' })

    expect(await existe(`utilisateurs/${B.uid}`)).toBe(true)
    expect(await existe(`programmes/p_${B.uid}`)).toBe(true)
    expect(await existe(`seancesFaites/p_${B.uid}_s1`)).toBe(true)
    expect(await existe(`utilisateurs/${B.uid}/mesures/m1`)).toBe(true)
    expect(await existe(`utilisateurs/${B.uid}/photos/ph1`)).toBe(true)
    const [fichiersB] = await bucket().getFiles({ prefix: `clients/${B.uid}/` })
    expect(fichiersB).toHaveLength(1)
    await expect(app().auth().getUser(B.uid)).resolves.toBeTruthy()
  })
})

describe('POST /api/supprimer-client : suppression complète ou rien', () => {
  const toutLaPourA = async () => {
    expect(await existe(`utilisateurs/${A.uid}`)).toBe(true)
    expect(await existe(`programmes/p_${A.uid}`)).toBe(true)
    expect(await existe(`seancesFaites/p_${A.uid}_s1`)).toBe(true)
    await expect(app().auth().getUser(A.uid)).resolves.toBeTruthy()
  }
  const plusRienPourA = async () => {
    expect(await existe(`utilisateurs/${A.uid}`)).toBe(false)
    expect(await existe(`programmes/p_${A.uid}`)).toBe(false)
    expect(await existe(`seancesFaites/p_${A.uid}_s1`)).toBe(false)
    const [fichiers] = await bucket().getFiles({ prefix: `clients/${A.uid}/` })
    expect(fichiers).toHaveLength(0)
    await expect(app().auth().getUser(A.uid)).rejects.toMatchObject({ code: 'auth/user-not-found' })
  }

  it('bucket introuvable (nom faux) : 500 et aucune donnée effacée', async () => {
    const proto = Object.getPrototypeOf(bucket())
    vi.spyOn(proto, 'deleteFiles').mockRejectedValueOnce(Object.assign(new Error('The specified bucket does not exist.'), { code: 404 }))
    const r = await appeler(handler, { jeton: coach.jeton, body: { uid: A.uid } })
    expect(r.code).toBe(500)
    await toutLaPourA()
  })

  it('panne du profil après le compte : un nouvel essai termine la suppression', async () => {
    const db = app().firestore()
    const vrai = db.doc.bind(db)
    let premier = true
    vi.spyOn(db, 'doc').mockImplementation((chemin) => {
      const r = vrai(chemin)
      if (chemin === `utilisateurs/${A.uid}` && premier) {
        return { get: () => r.get(), delete: () => { premier = false; return Promise.reject(new Error('panne')) } }
      }
      return r
    })
    expect((await appeler(handler, { jeton: coach.jeton, body: { uid: A.uid } })).code).toBe(500)
    expect(await existe(`utilisateurs/${A.uid}`)).toBe(true)
    expect((await appeler(handler, { jeton: coach.jeton, body: { uid: A.uid } })).code).toBe(204)
    await plusRienPourA()
  })

  it('panne du compte de connexion : un nouvel essai termine la suppression', async () => {
    vi.spyOn(app().auth(), 'deleteUser').mockRejectedValueOnce(new Error('panne'))
    expect((await appeler(handler, { jeton: coach.jeton, body: { uid: A.uid } })).code).toBe(500)
    // le compte et le profil existent encore : A reste dans « Mes coachés », Marie peut réessayer
    await expect(app().auth().getUser(A.uid)).resolves.toBeTruthy()
    expect(await existe(`utilisateurs/${A.uid}`)).toBe(true)
    expect((await appeler(handler, { jeton: coach.jeton, body: { uid: A.uid } })).code).toBe(204)
    await plusRienPourA()
  })

  it('refuse un uid qui ne ressemble pas à un identifiant : 400', async () => {
    const r = await appeler(handler, { jeton: coach.jeton, body: { uid: '../x' } })
    expect(r.code).toBe(400)
    expect(r.corps).toEqual({ code: 'champs' })
  })
})

describe('nomBucket', () => {
  it('prend FIREBASE_STORAGE_BUCKET', () => {
    expect(nomBucket({ FIREBASE_STORAGE_BUCKET: ' rimaactive-1.firebasestorage.app ' })).toBe('rimaactive-1.firebasestorage.app')
  })
  it('sur les émulateurs, prend le bucket de test', () => {
    expect(nomBucket({ FIREBASE_STORAGE_EMULATOR_HOST: '127.0.0.1:9199' })).toBe('demo-rimaactive.appspot.com')
  })
  it('en ligne sans la variable : erreur 500 « configuration », avant toute suppression', () => {
    expect(() => nomBucket({})).toThrow(expect.objectContaining({ statut: 500, message: 'configuration' }))
  })
})
