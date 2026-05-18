import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Calendar, Newspaper, Mail,
  Share2, BookOpen, PartyPopper, LogOut,
  Menu, X, BookMarked
} from 'lucide-react'
import { logout } from '../../services/authService'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/estudiante',           icon: LayoutDashboard, label: 'Inicio',            end: true },
  { to: '/estudiante/calendario',icon: Calendar,         label: 'Calendario Académico' },
  { to: '/estudiante/noticias',  icon: Newspaper,        label: 'Noticias' },
  { to: '/estudiante/mensajes',  icon: Mail,             label: 'Mensajes' },
  { to: '/estudiante/eventos',   icon: PartyPopper,      label: 'Eventos' },
  { to: '/estudiante/biblioteca',icon: BookMarked,       label: 'Biblioteca Virtual' },
  { to: '/estudiante/redes',     icon: Share2,           label: 'Redes Sociales' },
]

export default function EstudianteLayout() {
  const { perfil } = useAuth()
  const nav = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => { await logout(); nav('/login') }

  const initiales = perfil?.nombre
    ? perfil.nombre.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase()
    : 'E'

  return (
    <div className="app-shell">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.6)',zIndex:99 }}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">📚</div>
          <div>
            <div className="sidebar-logo-text">FAEN</div>
            <div className="sidebar-logo-sub">Portal Estudiantil</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Menú</div>
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginBottom:'1rem' }}>
            <div className="avatar">{initiales}</div>
            <div>
              <div style={{ fontSize:'.85rem', fontWeight:600 }}>{perfil?.nombre || 'Estudiante'}</div>
              <div style={{ fontSize:'.72rem', color:'var(--text-muted)' }}>{perfil?.legajo || ''}</div>
            </div>
          </div>
          <button className="btn btn-ghost" style={{ width:'100%', justifyContent:'center' }} onClick={handleLogout}>
            <LogOut size={15} /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="main-content">
        <header className="topbar">
          <button
            className="btn btn-ghost btn-sm"
            style={{ display:'none' }}
            id="menu-toggle"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <span className="topbar-title">Portal Estudiantil — FAEN</span>
          <div className="topbar-right">
            <div className="avatar" title={perfil?.nombre}>{initiales}</div>
          </div>
        </header>
        <main>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          #menu-toggle { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
