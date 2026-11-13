import { useEffect, useState } from 'react'
import { onIdTokenChanged, getIdTokenResult } from 'firebase/auth'
import { doc, onSnapshot } from 'firebase/firestore'
import { auth, db } from './firebase.js'
import { ecrireIndice } from './indiceSession.js'

// { utilisateur, profil, role, chargement }
// role : lu dans le jeton ('client' | 'coach' | null) ; profil : utilisateurs/{uid} en direct (null s'il n'existe pas)
export default function useSession() {
  const [etat, setEtat] = useState({ utilisateur: null, role: null, authPrete: false })
  const [profil, setProfil] = useState({ uid: null, donnees: null, pret: false })

  useEffect(() => {
    let actif = true
    const arreter = onIdTokenChanged(auth, async (utilisateur) => {
      if (!utilisateur) { ecrireIndice(null); if (actif) setEtat({ utilisateur: null, role: null, authPrete: true }); return }
      let role = null
      try { role = (await getIdTokenResult(utilisateur)).claims.role ?? null } catch { /* hors ligne : pas de rôle */ }
      ecrireIndice(role ?? 'connecte')
      if (actif) setEtat({ utilisateur, role, authPrete: true })
    })
    return () => { actif = false; arreter() }
  }, [])

  const uid = etat.utilisateur?.uid ?? null
  useEffect(() => {
    if (!uid) return undefined
    return onSnapshot(
      doc(db, 'utilisateurs', uid),
      (instantane) => setProfil({ uid, donnees: instantane.exists() ? instantane.data() : null, pret: true }),
      () => setProfil({ uid, donnees: null, pret: true }),
    )
  }, [uid])

  const profilPret = !uid || (profil.uid === uid && profil.pret)
  return {
    utilisateur: etat.utilisateur,
    profil: uid && profil.uid === uid ? profil.donnees : null,
    role: etat.role,
    chargement: !etat.authPrete || !profilPret,
  }
}
