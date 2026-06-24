import React from 'react'
import { createRoot } from 'react-dom/client'
import { LangProvider } from './i18n/index.jsx'
import App from './App.jsx'
import './styles/global.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LangProvider>
      <App />
    </LangProvider>
  </React.StrictMode>
)
