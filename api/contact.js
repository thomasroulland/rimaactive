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

export function contenuEmail(d, maintenant = new Date()) {
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
  const tel = d.telephone.replace(/[^\d+]/g, '')
  const quand = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full', timeStyle: 'short', timeZone: 'Europe/Paris' }).format(maintenant)
  const police = "font-family:'Hanken Grotesk',Helvetica,Arial,sans-serif;"
  const ligne = ([k, v, lien]) => `<tr><td style="padding:14px 0 0 0;border-top:1px solid #ECE9E3;${police}">
      <p style="margin:0 0 3px 0;font-size:11px;line-height:14px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#57534E;">${k}</p>
      <p style="margin:0 0 14px 0;font-size:16px;line-height:22px;font-weight:700;color:#161514;">${lien ? `<a href="${html(lien)}" style="color:#161514;text-decoration:underline;">${html(v)}</a>` : html(v)}</p></td></tr>`
  // Même charte que l'e-mail d'invitation : bandeau encre et logo, trait vermillon, carte blanche, boutons arrondis (23 novembre 2026)
  const body = `<div style="margin:0;padding:0;background:#F4F3EF;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#F4F3EF;">${html(d.offre)}${d.formule ? ' · ' + html(d.formule.replace(` · ${d.offre}`, '')) : ''} — ${html(d.message ? d.message.slice(0, 90) : 'pas de message')}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F4F3EF;">
    <tr><td align="center" style="padding:32px 12px 40px 12px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:580px;">
        <tr><td style="background:#161514;border-radius:20px 20px 0 0;padding:28px 36px 26px 36px;">
          <img src="https://rimaactive.fr/email/rimaactive-logo-blanc.png" width="140" height="28" alt="Rimaactive" style="display:block;border:0;width:140px;height:28px;">
        </td></tr>
        <tr><td style="height:4px;background:#FF4A1C;font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td style="background:#FFFFFF;border-radius:0 0 20px 20px;padding:36px 36px 34px 36px;${police}">
          <p style="margin:0 0 10px 0;font-size:12px;line-height:16px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:#FF4A1C;">Nouvelle demande</p>
          <h1 style="margin:0 0 14px 0;font-size:34px;line-height:38px;font-weight:900;letter-spacing:-1.4px;color:#161514;">${html(d.nom)}</h1>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 26px 0;"><tr>
            <td style="background:#FCEFC4;border-radius:999px;padding:7px 14px;font-size:14px;line-height:18px;font-weight:700;color:#161514;${police}">${html(d.offre)}${d.formule ? ' · ' + html(d.formule.replace(` · ${d.offre}`, '')) : ' · formule pas encore choisie'}</td>
          </tr></table>

          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 30px 0;"><tr>
            <td align="center" bgcolor="#F2C230" style="border-radius:999px;">
              <a href="mailto:${html(d.email)}" style="display:inline-block;padding:14px 26px;${police}font-size:15px;line-height:20px;font-weight:700;color:#161514;text-decoration:none;border-radius:999px;white-space:nowrap;">Répondre</a>
            </td>
            <td style="width:10px;font-size:0;">&nbsp;</td>
            <td align="center" style="border-radius:999px;border:1.5px solid #161514;">
              <a href="tel:${html(tel)}" style="display:inline-block;padding:12.5px 24px;${police}font-size:15px;line-height:20px;font-weight:700;color:#161514;text-decoration:none;border-radius:999px;white-space:nowrap;">Appeler</a>
            </td>
          </tr></table>

          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 10px 0;">
            ${[['E-mail', d.email, `mailto:${d.email}`], ['Téléphone', d.telephone, `tel:${tel}`], d.entreprise && ['Entreprise', d.entreprise]].filter(Boolean).map(ligne).join('')}
          </table>

          <p style="margin:6px 0 8px 0;font-size:11px;line-height:14px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#57534E;">Message</p>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="background:#F4F3EF;border-left:3px solid #FF4A1C;border-radius:4px 14px 14px 4px;padding:16px 18px;font-size:16px;line-height:25px;color:#161514;white-space:pre-wrap;${police}">${d.message ? html(d.message) : '<span style="color:#57534E;">Pas de message.</span>'}</td>
          </tr></table>
        </td></tr>
        <tr><td align="center" style="padding:24px 20px 0 20px;${police}font-size:12px;line-height:19px;color:#57534E;">
          Reçu depuis le formulaire de contact de rimaactive.fr, ${html(quand)}.<br>
          « Répondre » dans votre messagerie écrit directement à ${html(d.nom)}.
        </td></tr>
      </table>
    </td></tr>
  </table>
</div>`
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
