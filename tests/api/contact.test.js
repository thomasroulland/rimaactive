import { afterEach, describe, expect, it, vi } from 'vitest'
import contact, { contenuEmail, lireDemande } from '../../api/contact.js'
import { appeler } from './aide.js'

const demande = { offre: 'Individuel', formule: 'Suivi mensuel · Individuel', nom: 'Léa Martin', email: 'lea@example.com', telephone: '06 12 34 56 78', message: 'Bonjour <b>Marie</b>', accord: true }
let envois
function simulerResend(reponse = { ok: true, status: 200 }) {
  envois = []
  vi.spyOn(globalThis, 'fetch').mockImplementation((url, options) => {
    envois.push({ url: String(url), corps: JSON.parse(options.body), entetes: options.headers })
    return Promise.resolve({ ...reponse, json: async () => ({}) })
  })
}
afterEach(() => { vi.restoreAllMocks(); delete process.env.RESEND_API_KEY; delete process.env.CONTACT_DESTINATAIRE })

describe('formulaire de contact (Resend)', () => {
  it('envoie un e-mail à Marie, « Répondre » écrit à la personne, le message est échappé', async () => {
    process.env.RESEND_API_KEY = 'cle-test'
    simulerResend()
    const r = await appeler(contact, { body: demande })
    expect(r.code).toBe(200)
    expect(envois).toHaveLength(1)
    const e = envois[0]
    expect(e.url).toBe('https://api.resend.com/emails')
    expect(e.entetes.authorization).toBe('Bearer cle-test')
    expect(e.corps.to).toEqual(['marie.sillas.coaching@outlook.com'])
    expect(e.corps.reply_to).toBe('lea@example.com')
    expect(e.corps.subject).toBe('Demande de contact · Individuel · Léa Martin')
    expect(e.corps.text).toContain('Formule : Individuel · Suivi mensuel')
    expect(e.corps.text).toContain('Téléphone : 06 12 34 56 78')
    expect(e.corps.html).toContain('Bonjour &lt;b&gt;Marie&lt;/b&gt;')
    expect(e.corps.html).not.toContain('<b>Marie</b>')
  })

  it('champs manquants ou faux : 400 et rien n’est envoyé', async () => {
    process.env.RESEND_API_KEY = 'cle-test'
    simulerResend()
    for (const faux of [{ email: 'pas-un-email' }, { nom: '' }, { telephone: ' ' }, { accord: false }, { offre: 'Autre' }, { offre: 'Entreprises' }, { message: 'x'.repeat(4001) }]) {
      expect((await appeler(contact, { body: { ...demande, ...faux } })).code).toBe(400)
    }
    expect(envois).toHaveLength(0)
  })

  it('entreprise : son nom est demandé et figure dans l’e-mail', () => {
    const d = lireDemande({ ...demande, offre: 'Entreprises', formule: '', entreprise: 'Acme' })
    expect(d.entreprise).toBe('Acme')
    expect(contenuEmail(d).text).toContain('Entreprise : Acme')
    expect(contenuEmail(d).text).toContain('Entreprises (formule pas encore choisie)')
    expect(lireDemande({ ...demande, entreprise: 'Acme' }).entreprise).toBe('')
  })

  it('robot (champ caché rempli) : réponse « envoyé » sans e-mail', async () => {
    process.env.RESEND_API_KEY = 'cle-test'
    simulerResend()
    const r = await appeler(contact, { body: { ...demande, site: 'http://spam' } })
    expect(r.code).toBe(200)
    expect(envois).toHaveLength(0)
  })

  it('sans clé Resend ou si Resend refuse : 503, la page propose l’adresse de Marie', async () => {
    expect((await appeler(contact, { body: demande })).code).toBe(503)
    process.env.RESEND_API_KEY = 'cle-test'
    simulerResend({ ok: false, status: 422 })
    vi.spyOn(console, 'error').mockImplementation(() => {})
    expect((await appeler(contact, { body: demande })).code).toBe(503)
  })

  it('destinataire réglable (CONTACT_DESTINATAIRE)', async () => {
    process.env.RESEND_API_KEY = 'cle-test'
    process.env.CONTACT_DESTINATAIRE = 'autre@example.com'
    simulerResend()
    await appeler(contact, { body: demande })
    expect(envois[0].corps.to).toEqual(['autre@example.com'])
  })
})
