import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { NotificationProvider } from './contexts/NotificationContext'
import { Toaster } from 'sonner'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <NotificationProvider>
      <App />
      <Toaster position="top-right" richColors />
    </NotificationProvider>
  </React.StrictMode>,
)

