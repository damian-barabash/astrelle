import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LangProvider } from './i18n/index.jsx'
import App from './App.jsx'
import Home from './pages/Home.jsx'
import Kalendarz from './pages/Kalendarz.jsx'
import Sklep from './pages/Sklep.jsx'
import Legal from './pages/Legal.jsx'
import Admin from './admin/Admin.jsx'
import './styles/global.css'

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LangProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Home />} />
            <Route path="kalendarz" element={<Kalendarz />} />
            <Route path="sklep" element={<Sklep />} />
            <Route path="polityka-prywatnosci" element={<Legal doc="privacy" />} />
            <Route path="cookies" element={<Legal doc="cookies" />} />
            <Route path="regulamin" element={<Legal doc="terms" />} />
            <Route path="*" element={<Home />} />
          </Route>
          <Route path="/admin/*" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </LangProvider>
  </React.StrictMode>
)
