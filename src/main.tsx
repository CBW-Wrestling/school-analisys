import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import './theme.css'
import { AuthGate } from './components/Auth'
import { TooltipProvider } from './components/ui/tooltip'

const initialTheme = localStorage.getItem('theme') ?? 'dark'
document.documentElement.classList.toggle('dark', initialTheme === 'dark')
document.documentElement.dataset.theme = initialTheme

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TooltipProvider>
      <AuthGate>
        <App />
      </AuthGate>
    </TooltipProvider>
  </StrictMode>,
)