/* Notifications de l'application Rimaactive (19 novembre 2026), chargé par le service worker du site (vite.config.js).
   Le message arrive de Firebase Cloud Messaging ; on l'affiche, et un toucher ouvre la bonne page de l'espace. */
self.addEventListener('push', (event) => {
  let d = {}
  try { d = event.data ? event.data.json() : {} } catch { d = { notification: { body: event.data && event.data.text() } } }
  const n = d.notification || {}
  const lien = (d.fcmOptions && d.fcmOptions.link) || (d.data && d.data.lien) || '/espace'
  event.waitUntil(self.registration.showNotification(n.title || 'Rimaactive', {
    body: n.body || '',
    icon: n.icon || '/icone-192.png',
    badge: '/icone-192.png',
    tag: n.tag,
    data: { lien },
  }))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const lien = (event.notification.data && event.notification.data.lien) || '/espace'
  event.waitUntil((async () => {
    const fenetres = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })
    for (const f of fenetres) {
      if ('focus' in f) { await f.focus(); if ('navigate' in f) await f.navigate(lien).catch(() => {}); return }
    }
    await self.clients.openWindow(lien)
  })())
})
