import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { creerGestionnaire } from '../../api/notifier-programme.js'
import { app, appeler, compteAvecJeton, toutEffacer } from './aide.js'

let coach, client, envoyer, handler
beforeAll(() => app())
afterEach(() => vi.restoreAllMocks())
beforeEach(async () => {
  await toutEffacer()
  coach = await compteAvecJeton('coach@example.com', 'coach')
  client = await compteAvecJeton('client@example.com', 'client')
  envoyer = vi.fn(async (_a, m) => ({ successCount: 1, responses: m.tokens.map((t) => (t === 'perime' ? { success: false, error: { code: 'messaging/registration-token-not-registered' } } : { success: true })) }))
  handler = creerGestionnaire(envoyer)
  const db = app().firestore()
  await db.doc('programmes/P1').set({ client: client.uid, nom: 'Silhouette', statut: 'publié' })
  await db.doc('programmes/P2').set({ client: client.uid, nom: 'Brouillon', statut: 'brouillon' })
  await db.doc(`utilisateurs/${client.uid}/appareils/bon`).set({ jeton: 'bon' })
  await db.doc(`utilisateurs/${client.uid}/appareils/perime`).set({ jeton: 'perime' })
})

describe('POST /api/notifier-programme', () => {
  it('réservé au coach', async () => {
    expect((await appeler(handler, { body: { programme: 'P1' } })).code).toBe(401)
    expect((await appeler(handler, { jeton: client.jeton, body: { programme: 'P1' } })).code).toBe(403)
  })
  it('envoie une fois aux téléphones du coaché, oublie les jetons périmés', async () => {
    const r = await appeler(handler, { jeton: coach.jeton, body: { programme: 'P1' } })
    expect(r.code).toBe(200)
    expect(envoyer).toHaveBeenCalledTimes(1)
    const m = envoyer.mock.calls[0][1]
    expect(m.tokens.sort()).toEqual(['bon', 'perime'])
    expect(m.webpush.notification.body).toContain('Silhouette')
    const restants = await app().firestore().collection(`utilisateurs/${client.uid}/appareils`).get()
    expect(restants.docs.map((d) => d.id)).toEqual(['bon'])
    const encore = await appeler(handler, { jeton: coach.jeton, body: { programme: 'P1' } })
    expect(encore.corps).toMatchObject({ deja: true })
    expect(envoyer).toHaveBeenCalledTimes(1)
  })
  it('rien pour un brouillon ou un programme inconnu', async () => {
    expect((await appeler(handler, { jeton: coach.jeton, body: { programme: 'P2' } })).code).toBe(409)
    expect((await appeler(handler, { jeton: coach.jeton, body: { programme: 'nope' } })).code).toBe(404)
    expect((await appeler(handler, { jeton: coach.jeton, body: { programme: 'a/b' } })).code).toBe(400)
    expect(envoyer).not.toHaveBeenCalled()
  })
})

describe('POST /api/notifier-programme, programme modifié', () => {
  it('prévient le coaché, au plus une fois par heure', async () => {
    const r = await appeler(handler, { jeton: coach.jeton, body: { programme: 'P1', type: 'modifie' } })
    expect(r.code).toBe(200)
    expect(envoyer.mock.calls[0][1].webpush.notification.title).toBe('Votre programme a été mis à jour')
    const encore = await appeler(handler, { jeton: coach.jeton, body: { programme: 'P1', type: 'modifie' } })
    expect(encore.corps).toMatchObject({ deja: true })
    expect(envoyer).toHaveBeenCalledTimes(1)
    // la notification « nouveau » reste indépendante
    await appeler(handler, { jeton: coach.jeton, body: { programme: 'P1' } })
    expect(envoyer).toHaveBeenCalledTimes(2)
  })
  it('rien pour un brouillon', async () => {
    expect((await appeler(handler, { jeton: coach.jeton, body: { programme: 'P2', type: 'modifie' } })).code).toBe(409)
    expect(envoyer).not.toHaveBeenCalled()
  })
})
