import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import AppDAW from './AppDAW.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppDAW />
  </StrictMode>,
)
