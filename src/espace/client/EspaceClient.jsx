import { useEffect, useMemo, useState } from 'react'
import { Routes, Route, NavLink, Navigate } from 'react-router-dom'
import { ecouterMonProgramme, ecouterMesSeances } from '../depots.js'
import Picto from '../../components/Picto.jsx'
import Accueil from './Accueil.jsx'
import Programme from './Programme.jsx'
import Seance from './Seance.jsx'
import MesCharges from './MesCharges.jsx'

// Données du client en direct : programme publié le plus récent, tous ses programmes publiés, ses séances faites.
function useDonneesClient(uid) {
  const [prog, setProg] = useState({ pret: false, programme: null, programmes: [] })
  const [seances, setSeances] = useState(null)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    const message = () => setErreur('Impossible de charger votre programme. Vérifiez votre connexion.')
    const a = ecouterMonProgramme(uid, (programme, programmes) => setProg({ pret: true, programme, programmes }), message)
    const b = ecouterMesSeances(uid, setSeances, message)
    return () => { a(); b() }
  }, [uid])

  // séances terminées : identifiants de séance (champ `seance`), jamais les identifiants de documents
  const faites = useMemo(() => new Set(
    (seances ?? []).filter((s) => s.statut === 'terminée' && s.programme === prog.programme?.id).map((s) => s.seance),
  ), [seances, prog.programme])

  return {
    ...prog,
    seances: seances ?? [],
    faites,
    chargement: (!prog.pret || seances === null) && !erreur,
    erreur,
  }
}

// Espace client, conçu d'abord pour le téléphone : barre du bas Accueil · Programme · Mes charges
// (sur ordinateur, la même barre passe en haut, comme les onglets du coach).
export default function EspaceClient({ uid, prenom }) {
  const donnees = useDonneesClient(uid)

  useEffect(() => {
    document.body.classList.add('avec-barre-client')
    return () => document.body.classList.remove('avec-barre-client')
  }, [])

  return (
    <div className="client">
      <nav className="client-barre" aria-label="Espace client">
        <NavLink to="/espace" end className="client-barre__lien"><Picto nom="house" taille={24} /><span>Accueil</span></NavLink>
        <NavLink to="/espace/programme" className="client-barre__lien"><Picto nom="check-square" taille={24} /><span>Programme</span></NavLink>
        <NavLink to="/espace/charges" className="client-barre__lien"><Picto nom="barbell" taille={24} /><span>Mes charges</span></NavLink>
      </nav>
      {donnees.erreur && <p className="client-alerte" role="alert">{donnees.erreur}</p>}
      {donnees.chargement
        ? <p className="client-page espace-attente" role="status">Chargement…</p>
        : (
          <Routes>
            <Route index element={<Accueil prenom={prenom} {...donnees} />} />
            <Route path="programme" element={<Programme {...donnees} />} />
            <Route path="seance/:programmeId/:seanceId" element={<Seance {...donnees} />} />
            <Route path="charges" element={<MesCharges {...donnees} />} />
            <Route path="*" element={<Navigate to="/espace" replace />} />
          </Routes>
        )}
    </div>
  )
}
