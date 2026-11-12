import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import handler from '../../api/supprimer-client.js'
import { app, appeler, BUCKET, compteAvecJeton, toutEffacer } from './aide.js'

let coach, A, B
const bucket = () => app().storage().bucket(BUCKET)

async function peupler(c) {
  const db = app().firestore()
  await db.doc(`utilisateurs/${c.uid}`).set({ role: 'client', prenom: 'X', nom: 'Y' })
  await db.doc(`programmes/p_${c.uid}`).set({ client: c.uid, nom: 'P' })
  await db.doc(`seancesFaites/p_${c.uid}_s1`).set({ client: c.uid })
  await bucket().file(`clients/${c.uid}/photo.jpg`).save(Buffer.from('x'), { contentType: 'image/jpeg' })
}
const existe = async (chemin) => (await app().firestore().doc(chemin).get()).exists

beforeAll(() => app())
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
    const [fichiersA] = await bucket().getFiles({ prefix: `clients/${A.uid}/` })
    expect(fichiersA).toHaveLength(0)
    await expect(app().auth().getUser(A.uid)).rejects.toMatchObject({ code: 'auth/user-not-found' })

    expect(await existe(`utilisateurs/${B.uid}`)).toBe(true)
    expect(await existe(`programmes/p_${B.uid}`)).toBe(true)
    expect(await existe(`seancesFaites/p_${B.uid}_s1`)).toBe(true)
    const [fichiersB] = await bucket().getFiles({ prefix: `clients/${B.uid}/` })
    expect(fichiersB).toHaveLength(1)
    await expect(app().auth().getUser(B.uid)).resolves.toBeTruthy()
  })
})
