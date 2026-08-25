import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './theme.css'
import { AuthGate } from './components/Auth'
import { TooltipProvider } from './components/ui/tooltip'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider>
      <AuthGate>
        <App />
      </AuthGate>
    </TooltipProvider>
  </StrictMode>,
)