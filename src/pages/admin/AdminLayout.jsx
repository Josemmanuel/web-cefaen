import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Calendar, Newspaper, Mail,
  Share2, BookMarked, PartyPopper, Users,
  LogOut, Settings, Menu, ShieldCheck, KeyRound
} from 'lucide-react'
import { logout } from '../../services/authService'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { to: '/admin',                 icon: LayoutDashboard, label: 'Panel',            end: true },
  { to: '/admin/noticias',        icon: Newspaper,       label: 'Noticias' },
  { to: '/admin/calendario',      icon: Calendar,        label: 'Calendario' },
  { to: '/admin/mensajes',        icon: Mail,            label: 'Mensajes' },
  { to: '/admin/eventos',         icon: PartyPopper,     label: 'Eventos' },
  { to: '/admin/biblioteca',      icon: BookMarked,      label: 'Biblioteca' },
  { to: '/admin/redes',           icon: Share2,          label: 'Redes Sociales' },
  { to: '/admin/codigos',         icon: KeyRound,        label: 'Códigos de acceso' },
  { to: '/admin/estudiantes',     icon: Users,           label: 'Estudiantes' },
]

export default function AdminLayout() {
  const { perfil } = useAuth()
  const nav = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => { await logout(); nav('/login') }

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.6)',zIndex:99 }} />
      )}

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon" style={{ background:'linear-gradient(135deg, #4a0080, #9b59b6)' }}>
            <ShieldCheck size={20} color="white" />
          </div>
          <div>
            <div className="sidebar-logo-text">CEFAEN Admin</div>
            <div className="sidebar-logo-sub">Panel de Control</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Gestión</div>
          {NAV.map(({ to, icon: Icon, label, end }) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}>
              <Icon size={18} />{label}
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div style={{ display:'flex', alignItems:'center', gap:'.75rem', marginBottom:'1rem' }}>
            <div className="avatar" style={{ background:'linear-gradient(135deg, #4a0080, #9b59b6)' }}>A</div>
            <div>
              <div style={{ fontSize:'.85rem', fontWeight:600 }}>{perfil?.nombre || 'Administrador'}</div>
              <div style={{ fontSize:'.72rem', color:'var(--text-muted)' }}>Admin</div>
            </div>
          </div>
          <button className="btn btn-ghost" style={{ width:'100%', justifyContent:'center' }} onClick={handleLogout}>
            <LogOut size={15} /> Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <span className="topbar-title">Panel de Administración — CEFAEN</span>
        </header>
        <main><Outlet /></main>
      </div>
    </div>
  )
}
