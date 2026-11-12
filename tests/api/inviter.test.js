import { beforeAll, beforeEach, describe, expect, it } from 'vitest'
import handler from '../../api/inviter.js'
import { app, appeler, compteAvecJeton, toutEffacer } from './aide.js'

let coach, client
const champs = { prenom: ' Léa ', nom: 'Martin ', email: ' Lea.Martin@Example.com ' }

beforeAll(() => app())
beforeEach(async () => {
  await toutEffacer()
  coach = await compteAvecJeton('coach@example.com', 'coach')
  client = await compteAvecJeton('client@example.com', 'client')
})

describe('POST /api/inviter', () => {
  it('refuse une autre méthode que POST (405)', async () => {
    const r = await appeler(handler, { method: 'GET', jeton: coach.jeton })
    expect(r.code).toBe(405)
  })
  it('sans jeton : 401', async () => {
    expect((await appeler(handler, { body: champs })).code).toBe(401)
  })
  it('jeton invalide : 401', async () => {
    expect((await appeler(handler, { jeton: 'nimporte', body: champs })).code).toBe(401)
  })
  it('jeton client : 403', async () => {
    expect((await appeler(handler, { jeton: client.jeton, body: champs })).code).toBe(403)
  })
  it('coach + nouvel e-mail : 201, rôle client, document invité', async () => {
    const r = await appeler(handler, { jeton: coach.jeton, body: champs })
    expect(r.code).toBe(201)
    const { uid } = r.corps
    const u = await app().auth().getUser(uid)
    expect(u.email).toBe('lea.martin@example.com')
    expect(u.displayName).toBe('Léa Martin')
    expect(u.customClaims).toEqual({ role: 'client' })
    const d = (await app().firestore().doc(`utilisateurs/${uid}`).get()).data()
    expect(d).toMatchObject({
      prenom: 'Léa', nom: 'Martin', email: 'lea.martin@example.com',
      role: 'client', statut: 'invité', accordSante: null,
    })
    expect(d.creeLe).toBeTruthy()
  })
  it('même e-mail : 409 deja-invite avec uid', async () => {
    const un = await appeler(handler, { jeton: coach.jeton, body: champs })
    const deux = await appeler(handler, { jeton: coach.jeton, body: champs })
    expect(deux.code).toBe(409)
    expect(deux.corps).toEqual({ code: 'deja-invite', uid: un.corps.uid })
  })
  it.each([
    ['e-mail invalide', { prenom: 'A', nom: 'B', email: 'marie@' }],
    ['prénom manquant', { prenom: ' ', nom: 'B', email: 'a@b.fr' }],
    ['nom manquant', { prenom: 'A', email: 'a@b.fr' }],
    ['corps absent', undefined],
  ])('%s : 400 champs', async (_, body) => {
    const r = await appeler(handler, { jeton: coach.jeton, body })
    expect(r.code).toBe(400)
    expect(r.corps).toEqual({ code: 'champs' })
  })
})
