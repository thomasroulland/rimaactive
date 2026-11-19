// Notifications (19 novembre 2026) : le coaché accepte une fois, son téléphone est noté dans
// utilisateurs/{uid}/appareils/{jeton}, et l'API l'utilise quand Marie publie un nouveau programme (api/notifier-programme.js).
// Sur iPhone, Apple ne permet les notifications qu'à l'application ajoutée à l'écran d'accueil.
import { doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase.js'

// Clé publique « Web Push » du projet Firebase (console Firebase > Cloud Messaging > Certificats Web Push). Elle est publique.
const CLE_VAPID = import.meta.env.VITE_FIREBASE_VAPID_KEY || 'BGJnV1vGkJzI87GZ5-LXDvP5Zc52BmXXiTCpeGr7F8uXKGPsNT2dEHp2hpo48Ozg2TFHaSUvVWzgAry-2GvirKM'

const surIphone = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
const installee = () => window.matchMedia?.('(display-mode: standalone)').matches || navigator.standalone === true

// 'possible' | 'deja' | 'refuse' | 'installer' (iPhone : ajouter d'abord à l'écran d'accueil) | 'impossible'
export function etatNotifications() {
  if (!CLE_VAPID || typeof window === 'undefined' || !('serviceWorker' in navigator)) return 'impossible'
  if (!('Notification' in window) || !('PushManager' in window)) return surIphone() && !installee() ? 'installer' : 'impossible'
  if (Notification.permission === 'granted') return 'deja'
  if (Notification.permission === 'denied') return 'refuse'
  return 'possible'
}

// À appeler sur un appui (Apple l'exige). Renvoie true si le téléphone est bien inscrit.
export async function activerNotifications(uid) {
  const accord = await Notification.requestPermission()
  if (accord !== 'granted') return false
  await inscrireAppareil(uid)
  return true
}

// Note (ou renouvelle) le jeton de ce téléphone ; sans effet si l'accord n'est pas donné
export async function inscrireAppareil(uid) {
  if (etatNotifications() !== 'deja' || !uid) return
  const { getMessaging, getToken, isSupported } = await import('firebase/messaging')
  if (!(await isSupported())) return
  const enregistrement = await navigator.serviceWorker.ready
  const jeton = await getToken(getMessaging(), { vapidKey: CLE_VAPID, serviceWorkerRegistration: enregistrement })
  if (!jeton) return
  await setDoc(doc(db, 'utilisateurs', uid, 'appareils', jeton), {
    jeton, creeLe: serverTimestamp(), plateforme: surIphone() ? 'iphone' : /android/i.test(navigator.userAgent) ? 'android' : 'autre',
  })
}
