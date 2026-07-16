import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LangProvider } from './i18n/index.jsx'
import App from './App.jsx'
import Home from './pages/Home.jsx'
import Proces from './pages/Proces.jsx'
import Cennik from './pages/Cennik.jsx'
import Admin from './admin/Admin.jsx'
import './styles/global.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LangProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Home />} />
            <Route path="proces" element={<Proces />} />
            <Route path="cennik" element={<Cennik />} />
          </Route>
          <Route path="/admin/*" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </LangProvider>
  </React.StrictMode>
)
