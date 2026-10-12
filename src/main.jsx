import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LangProvider } from './i18n/index.jsx'
import App from './App.jsx'
import Home from './pages/Home.jsx'
import Warsztaty from './pages/Warsztaty.jsx'
import Oferta from './pages/Oferta.jsx'
import Voucher from './pages/Voucher.jsx'
import Sklep from './pages/Sklep.jsx'
import Kontakt from './pages/Kontakt.jsx'
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
            <Route path="warsztaty" element={<Warsztaty />} />
            <Route path="warsztaty/:id" element={<Oferta />} />
            <Route path="voucher" element={<Voucher />} />
            <Route path="sklep" element={<Sklep />} />
            <Route path="kontakt" element={<Kontakt />} />
            <Route path="polityka-prywatnosci" element={<Legal doc="privacy" />} />
            <Route path="cookies" element={<Legal doc="cookies" />} />
            <Route path="regulamin" element={<Legal doc="terms" />} />
            {/* the booking calendar is gone: bookings live on the studio's site */}
            <Route path="kalendarz" element={<Navigate to="/warsztaty" replace />} />
            <Route path="*" element={<Home />} />
          </Route>
          <Route path="/admin/*" element={<Admin />} />
        </Routes>
      </BrowserRouter>
    </LangProvider>
  </React.StrictMode>
)
