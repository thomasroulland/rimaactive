// POST /api/contact (sans connexion) : le formulaire « M'écrire » envoie un e-mail à Marie par Resend (23 novembre 2026).
// Corps : { offre, formule?, nom, email, telephone, entreprise?, message?, accord, site? }
// - `site` est un champ caché, vide pour une personne : rempli, c'est un robot (on répond « envoyé » sans rien envoyer) ;
// - 200 { ok: true } envoyé ; 400 { code: 'champs' } champ manquant ou trop long ; 503 { code: 'envoi' } Resend absent ou en échec
//   (la page propose alors d'écrire directement à l'adresse de Marie).
// « Répondre » dans la messagerie de Marie écrit directement à la personne (reply_to).
import { CONTACT } from '../src/components/liens.js'

const OFFRES = ['Individuel', 'En ligne', 'Groupes', 'Entreprises']
const LIMITES = { offre: 40, formule: 120, nom: 120, email: 200, telephone: 40, entreprise: 160, message: 4000 }

const texte = (v) => (typeof v === 'string' ? v.trim() : '')
const html = (v) => v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const emailValide = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)

export function lireDemande(corps) {
  const c = corps && typeof corps === 'object' ? corps : {}
  const d = Object.fromEntries(Object.keys(LIMITES).map((k) => [k, texte(c[k])]))
  const manque = !OFFRES.includes(d.offre) || !d.nom || !emailValide(d.email) || !d.telephone || c.accord !== true
    || (d.offre === 'Entreprises' && !d.entreprise)
    || Object.entries(LIMITES).some(([k, max]) => d[k].length > max)
  if (d.offre !== 'Entreprises') d.entreprise = ''
  return manque ? null : d
}

export function contenuEmail(d) {
  const lignes = [
    ['Formule', d.formule ? `${d.offre} · ${d.formule.replace(` · ${d.offre}`, '')}` : `${d.offre} (formule pas encore choisie)`],
    ['Nom', d.nom],
    d.entreprise && ['Entreprise', d.entreprise],
    ['E-mail', d.email],
    ['Téléphone', d.telephone],
  ].filter(Boolean)
  const text = [
    'Nouvelle demande depuis le formulaire de contact du site rimaactive.fr',
    '',
    ...lignes.map(([k, v]) => `${k} : ${v}`),
    '',
    'Message :',
    d.message || '(pas de message)',
    '',
    'Répondez simplement à cet e-mail pour écrire à cette personne.',
  ].join('\n')
  const body = `<!doctype html><html lang="fr"><body style="margin:0;padding:24px;background:#f4efe6;font-family:'Hanken Grotesk',Helvetica,Arial,sans-serif;color:#191817">
<div style="max-width:560px;margin:0 auto;background:#fff;border-radius:16px;padding:24px">
<p style="margin:0 0 4px;font-size:12px;font-weight:bold;letter-spacing:.08em;text-transform:uppercase;color:#ff4a1c">Formulaire de contact</p>
<h1 style="margin:0 0 18px;font-size:22px">Nouvelle demande de ${html(d.nom)}</h1>
<table style="border-collapse:collapse;width:100%;font-size:15px">${lignes.map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#6b665f;white-space:nowrap;vertical-align:top">${k}</td><td style="padding:6px 0">${html(v)}</td></tr>`).join('')}</table>
<p style="margin:18px 0 6px;color:#6b665f;font-size:15px">Message</p>
<p style="margin:0;padding:12px 14px;background:#f4f3ef;border-radius:10px;font-size:15px;line-height:1.5;white-space:pre-wrap">${d.message ? html(d.message) : '(pas de message)'}</p>
<p style="margin:18px 0 0;color:#6b665f;font-size:13px">Répondez simplement à cet e-mail pour écrire à ${html(d.nom)}.</p>
</div></body></html>`
  return { subject: `Demande de contact · ${d.offre} · ${d.nom}`.slice(0, 180), text, html: body }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ code: 'methode' })
  const corps = req.body && typeof req.body === 'object' ? req.body : {}
  if (texte(corps.site)) return res.status(200).json({ ok: true }) // robot : rien n'est envoyé
  const d = lireDemande(corps)
  if (!d) return res.status(400).json({ code: 'champs' })
  const cle = texte(process.env.RESEND_API_KEY)
  if (!cle) return res.status(503).json({ code: 'envoi' })
  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { authorization: `Bearer ${cle}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        from: texte(process.env.CONTACT_EXPEDITEUR) || 'Site Rimaactive <contact@rimaactive.fr>',
        to: [texte(process.env.CONTACT_DESTINATAIRE) || CONTACT.email],
        reply_to: d.email,
        ...contenuEmail(d),
      }),
    })
    if (!r.ok) { console.error(`Formulaire de contact refusé par Resend (${r.status})`); return res.status(503).json({ code: 'envoi' }) }
    return res.status(200).json({ ok: true })
  } catch (e) {
    console.error('Formulaire de contact : envoi impossible', e?.message)
    return res.status(503).json({ code: 'envoi' })
  }
}
