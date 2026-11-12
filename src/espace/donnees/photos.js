// Réduction des photos dans le navigateur avant envoi (JPEG, 1600 px de côté au plus).
const TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_OCTETS = 20 * 1024 * 1024

function refus(code) {
  const e = new Error(code)
  e.code = code
  return e
}

// Renvoie un Blob JPEG. Rejette Error('format') ou Error('taille') (avec error.code identique).
export async function reduireImage(fichier, { cote = 1600, qualite = 0.82 } = {}) {
  if (!TYPES.includes(fichier.type)) throw refus('format')
  if (fichier.size > MAX_OCTETS) throw refus('taille')

  const { source, largeur, hauteur, liberer } = await ouvrir(fichier)
  try {
    const echelle = Math.min(1, cote / Math.max(largeur, hauteur))
    const w = Math.max(1, Math.round(largeur * echelle))
    const h = Math.max(1, Math.round(hauteur * echelle))

    if (typeof OffscreenCanvas !== 'undefined') {
      const c = new OffscreenCanvas(w, h)
      const ctx = c.getContext('2d')
      ctx.fillStyle = '#fff' // les PNG transparents deviennent blancs en JPEG
      ctx.fillRect(0, 0, w, h)
      ctx.drawImage(source, 0, 0, w, h)
      return await c.convertToBlob({ type: 'image/jpeg', quality: qualite })
    }
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    const ctx = c.getContext('2d')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, w, h)
    ctx.drawImage(source, 0, 0, w, h)
    return await new Promise((resolve, reject) =>
      c.toBlob((b) => (b ? resolve(b) : reject(refus('format'))), 'image/jpeg', qualite))
  } finally {
    liberer()
  }
}

// createImageBitmap (orientation EXIF respectée), repli sur <img>
async function ouvrir(fichier) {
  if (typeof createImageBitmap === 'function') {
    try {
      const bmp = await createImageBitmap(fichier, { imageOrientation: 'from-image' })
      return { source: bmp, largeur: bmp.width, hauteur: bmp.height, liberer: () => bmp.close?.() }
    } catch { /* repli ci-dessous */ }
  }
  const url = URL.createObjectURL(fichier)
  try {
    const img = new Image()
    img.src = url
    await img.decode().catch(() => { throw refus('format') })
    return { source: img, largeur: img.naturalWidth, hauteur: img.naturalHeight, liberer: () => URL.revokeObjectURL(url) }
  } catch (e) {
    URL.revokeObjectURL(url)
    throw e
  }
}
