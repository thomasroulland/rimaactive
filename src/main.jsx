import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './components/gardeRetour.js' // avant le routeur : voir le fichier
import './components/installation.js' // écoute tôt la proposition d'installation du navigateur
import App from './App.jsx'
import './styles.css'
import './verre.css'
import initVerre from './verre.js'

initVerre()
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
