import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import inviter from '../../api/inviter.js'
import relancer from '../../api/relancer-invitation.js'
import activer from '../../api/activer-invitation.js'
import { DUREE_INVITATION, empreinte } from '../../api/_invitation.js'
import { app, appeler, compteAvecJeton, toutEffacer } from './aide.js'

let coach, client
const champs = { prenom: 'Léa', nom: 'Martin', email: 'lea@example.com' }
const vraiFetch = globalThis.fetch
let envois

// Resend est simulé : les appels à l'émulateur passent, ceux vers api.resend.com sont notés et acceptés
function simulerResend(reponse = { ok: true, status: 200 }) {
  envois = []
  vi.spyOn(globalThis, 'fetch').mockImplementation((url, options) => {
    if (String(url).startsWith('https://api.resend.com/')) { envois.push(JSON.parse(options.body)); return Promise.resolve({ ...reponse, json: async () => ({}) }) }
    return vraiFetch(url, options)
  })
}
const jetonDe = (envoi) => /[?&]t=([A-Za-z0-9_-]+)/.exec(envoi.text)[1]

beforeAll(() => app())
afterEach(() => { vi.restoreAllMocks(); delete process.env.RESEND_API_KEY })
beforeEach(async () => {
  await toutEffacer()
  coach = await compteAvecJeton('coach@example.com', 'coach')
  client = await compteAvecJeton('client@example.com', 'client')
})

describe('invitation par le site (lien de 7 jours)', () => {
  it('sans clé Resend : compte créé, envoye: false (le navigateur envoie l’e-mail Firebase)', async () => {
    const r = await appeler(inviter, { jeton: coach.jeton, body: champs })
    expect(r.code).toBe(201)
    expect(r.corps.envoye).toBe(false)
    const invs = await app().firestore().collection('invitations').where('uid', '==', r.corps.uid).get()
    expect(invs.size).toBe(1)
  })

  it('avec clé Resend : e-mail envoyé avec un lien valable 7 jours, puis mot de passe choisi et lien effacé', async () => {
    process.env.RESEND_API_KEY = 'cle-test'
    simulerResend()
    const avant = Date.now()
    const r = await appeler(inviter, { jeton: coach.jeton, body: champs })
    expect(r.corps.envoye).toBe(true)
    expect(envois).toHaveLength(1)
    expect(envois[0].to).toEqual(['lea@example.com'])
    expect(envois[0].html).toContain('valable 7&nbsp;jours')
    const jeton = jetonDe(envois[0])
    const inv = (await app().firestore().doc(`invitations/${empreinte(jeton)}`).get()).data()
    expect(inv.expire - avant).toBeGreaterThanOrEqual(DUREE_INVITATION - 5000)
    expect(DUREE_INVITATION).toBeGreaterThanOrEqual(24 * 60 * 60 * 1000)

    const verif = await appeler(activer, { body: { t: jeton } })
    expect(verif.code).toBe(200)
    expect(verif.corps).toEqual({ prenom: 'Léa' })
    expect((await appeler(activer, { body: { t: jeton, motDePasse: 'court' } })).code).toBe(400)
    const ok = await appeler(activer, { body: { t: jeton, motDePasse: 'motdepasse-solide' } })
    expect(ok.code).toBe(200)
    expect(ok.corps).toEqual({ email: 'lea@example.com' })
    // le mot de passe marche, et le lien ne sert qu'une fois
    const connexion = await vraiFetch(`http://${process.env.FIREBASE_AUTH_EMULATOR_HOST}/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=x`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'lea@example.com', password: 'motdepasse-solide', returnSecureToken: true }),
    })
    expect(connexion.status).toBe(200)
    expect((await appeler(activer, { body: { t: jeton } })).code).toBe(404)
  })

  it('lien expiré : 410 ; lien inconnu : 404', async () => {
    const r = await appeler(inviter, { jeton: coach.jeton, body: champs })
    const invs = await app().firestore().collection('invitations').where('uid', '==', r.corps.uid).get()
    await invs.docs[0].ref.update({ expire: Date.now() - 1000 })
    const autre = await appeler(activer, { body: { t: 'nimporte' } })
    expect(autre.code).toBe(404)
    // on ne connaît pas le jeton (seule son empreinte est gardée) : on en pose un connu
    await app().firestore().doc(`invitations/${empreinte('connu')}`).set({ uid: r.corps.uid, email: 'lea@example.com', expire: Date.now() - 1 })
    expect((await appeler(activer, { body: { t: 'connu' } })).code).toBe(410)
  })

  it('relance : coach seulement, nouveau lien, l’ancien ne marche plus', async () => {
    process.env.RESEND_API_KEY = 'cle-test'
    simulerResend()
    const r = await appeler(inviter, { jeton: coach.jeton, body: champs })
    const ancien = jetonDe(envois[0])
    expect((await appeler(relancer, { jeton: client.jeton, body: { uid: r.corps.uid } })).code).toBe(403)
    const re = await appeler(relancer, { jeton: coach.jeton, body: { uid: r.corps.uid } })
    expect(re.code).toBe(200)
    expect(re.corps).toEqual({ envoye: true, email: 'lea@example.com' })
    const nouveau = jetonDe(envois[1])
    expect(nouveau).not.toBe(ancien)
    expect((await appeler(activer, { body: { t: ancien } })).code).toBe(404)
    expect((await appeler(activer, { body: { t: nouveau } })).code).toBe(200)
  })

  it('relance d’un client déjà actif : 409 ; client inconnu : 404', async () => {
    const r = await appeler(inviter, { jeton: coach.jeton, body: champs })
    await app().firestore().doc(`utilisateurs/${r.corps.uid}`).update({ statut: 'actif' })
    expect((await appeler(relancer, { jeton: coach.jeton, body: { uid: r.corps.uid } })).code).toBe(409)
    expect((await appeler(relancer, { jeton: coach.jeton, body: { uid: 'personne' } })).code).toBe(404)
  })

  it('Resend refuse l’envoi : le compte est créé quand même, envoye: false', async () => {
    process.env.RESEND_API_KEY = 'cle-test'
    simulerResend({ ok: false, status: 422 })
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const r = await appeler(inviter, { jeton: coach.jeton, body: champs })
    expect(r.code).toBe(201)
    expect(r.corps.envoye).toBe(false)
  })
})
