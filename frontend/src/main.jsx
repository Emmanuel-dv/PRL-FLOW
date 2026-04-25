import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import AppRouter from './routes/AppRouter'
import { Toaster } from 'sonner'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <AppRouter />
      <Toaster position="top-right" richColors />
    </AuthProvider>
  </StrictMode>,
)
