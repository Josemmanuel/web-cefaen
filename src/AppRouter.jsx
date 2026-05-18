import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Auth
import Login from './pages/Login'
import Registro from './pages/Registro'

// Layouts
import EstudianteLayout from './pages/estudiante/EstudianteLayout'
import AdminLayout from './pages/admin/AdminLayout'

// Estudiante
import Dashboard from './pages/estudiante/Dashboard'
import Biblioteca from './pages/estudiante/Biblioteca'
import {
  Noticias, Mensajes, Calendario,
  Eventos, RedesSociales
} from './pages/estudiante/Modulos'

// Admin
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminNoticias from './pages/admin/AdminNoticias'
import AdminCodigos from './pages/admin/AdminCodigos'
import AdminEstudiantes from './pages/admin/AdminEstudiantes'
import AdminBiblioteca from './pages/admin/AdminBiblioteca'

// ── Rutas protegidas ──────────────────────────
function RutaEstudiante({ children }) {
  const { user, perfil, cargando } = useAuth()
  if (cargando) return <div className="loading-full"><div className="spinner" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (perfil?.rol === 'admin') return <Navigate to="/admin" replace />
  return children
}

function RutaAdmin({ children }) {
  const { user, perfil, cargando } = useAuth()
  if (cargando) return <div className="loading-full"><div className="spinner" /></div>
  if (!user) return <Navigate to="/login" replace />
  if (perfil?.rol !== 'admin') return <Navigate to="/estudiante" replace />
  return children
}

function RutaPublica({ children }) {
  const { user, perfil, cargando } = useAuth()
  if (cargando) return <div className="loading-full"><div className="spinner" /></div>
  if (user && perfil?.rol === 'admin') return <Navigate to="/admin" replace />
  if (user) return <Navigate to="/estudiante" replace />
  return children
}

// ── App Router ────────────────────────────────
export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/login"    element={<RutaPublica><Login /></RutaPublica>} />
        <Route path="/registro" element={<RutaPublica><Registro /></RutaPublica>} />
        <Route path="/"         element={<Navigate to="/login" replace />} />

        {/* Estudiante */}
        <Route path="/estudiante" element={<RutaEstudiante><EstudianteLayout /></RutaEstudiante>}>
          <Route index element={<Dashboard />} />
          <Route path="calendario" element={<Calendario />} />
          <Route path="noticias"   element={<Noticias />} />
          <Route path="mensajes"   element={<Mensajes />} />
          <Route path="eventos"    element={<Eventos />} />
          <Route path="biblioteca" element={<Biblioteca />} />
          <Route path="redes"      element={<RedesSociales />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={<RutaAdmin><AdminLayout /></RutaAdmin>}>
          <Route index                element={<AdminDashboard />} />
          <Route path="noticias"      element={<AdminNoticias />} />
          <Route path="codigos"       element={<AdminCodigos />} />
          <Route path="estudiantes"   element={<AdminEstudiantes />} />
          <Route path="biblioteca"    element={<AdminBiblioteca />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
