import { useEffect, useMemo, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ecouterMonProgramme, ecouterMesSeances } from '../depots.js'
import { aujourdhuiIso } from '../donnees/calculs.js'
import { programmeAffiche } from '../donnees/progression.js'
import TableauDeBord from './TableauDeBord.jsx'
import Programme from './Programme.jsx'
import Seance from './Seance.jsx'

// Données du client en direct : programme affiché (en cours, sinon à venir, sinon le dernier), tous ses programmes publiés, ses séances faites.
function useDonneesClient(uid) {
  const [prog, setProg] = useState({ pret: false, programmes: [] })
  const [seances, setSeances] = useState(null)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    const message = () => setErreur('Impossible de charger votre programme. Vérifiez votre connexion.')
    const a = ecouterMonProgramme(uid, (_recent, programmes) => setProg({ pret: true, programmes }), message)
    const b = ecouterMesSeances(uid, setSeances, message)
    return () => { a(); b() }
  }, [uid])

  const programme = useMemo(() => programmeAffiche(prog.programmes, aujourdhuiIso()), [prog.programmes])

  // séances terminées : identifiants de séance (champ `seance`), jamais les identifiants de documents
  const faites = useMemo(() => new Set(
    (seances ?? []).filter((s) => s.statut === 'terminée' && s.programme === programme?.id).map((s) => s.seance),
  ), [seances, programme])

  return {
    programmes: prog.programmes,
    programme,
    seances: seances ?? [],
    faites,
    chargement: (!prog.pret || seances === null) && !erreur,
    erreur,
  }
}

// Routes du coaché : tableau de bord, programme et séance (la barre et le pied sont dans la Coque).
export default function EspaceClient({ uid, profil }) {
  const donnees = useDonneesClient(uid)

  return (
    <>
      {donnees.erreur && <p className="client-alerte" role="alert">{donnees.erreur}</p>}
      {donnees.chargement
        ? <p className="client-page espace-attente" role="status">Chargement…</p>
        : (
          <Routes>
            <Route index element={<TableauDeBord uid={uid} profil={profil} {...donnees} />} />
            <Route path="programme" element={<Programme {...donnees} />} />
            <Route path="seance/:programmeId/:seanceId" element={<Seance {...donnees} />} />
            <Route path="*" element={<Navigate to="/espace" replace />} />
          </Routes>
        )}
    </>
  )
}
