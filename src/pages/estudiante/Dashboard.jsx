import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, Newspaper, Mail, BookMarked, PartyPopper, Share2, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getNoticias, getEventos, getMensajes } from '../../services/dataService'

const MODULOS = [
  { to: 'calendario', icon: Calendar,     label: 'Calendario',  desc: 'Fechas importantes del ciclo lectivo', color: '#2f80ed' },
  { to: 'noticias',   icon: Newspaper,    label: 'Noticias',    desc: 'Novedades de la facultad',             color: '#27ae60' },
  { to: 'mensajes',   icon: Mail,         label: 'Mensajes',    desc: 'Comunicaciones personales',            color: '#9b59b6' },
  { to: 'eventos',    icon: PartyPopper,  label: 'Eventos',     desc: 'Actividades y eventos académicos',     color: '#f5a623' },
  { to: 'biblioteca', icon: BookMarked,   label: 'Biblioteca',  desc: 'Material de estudio y recursos',       color: '#e74c3c' },
  { to: 'redes',      icon: Share2,       label: 'Redes',       desc: 'Seguinos en redes sociales',           color: '#1abc9c' },
]

export default function Dashboard() {
  const { perfil, user } = useAuth()
  const [stats, setStats] = useState({ noticias: 0, eventos: 0, mensajes: 0 })
  const [ultimaNoticia, setUltimaNoticia] = useState(null)

  useEffect(() => {
    const cargar = async () => {
      try {
        const [n, e, m] = await Promise.all([
          getNoticias(5),
          getEventos(),
          getMensajes(user.uid),
        ])
        setStats({ noticias: n.length, eventos: e.length, mensajes: m.filter(x => !x.leido).length })
        if (n.length) setUltimaNoticia(n[0])
      } catch { /* silencioso si no hay datos */ }
    }
    if (user) cargar()
  }, [user])

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div className="page">
      {/* Bienvenida */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary-dim) 0%, rgba(47,128,237,.08) 100%)',
        border: '1px solid var(--primary-dim)',
        borderRadius: 'var(--radius-lg)',
        padding: '2rem',
        marginBottom: '2rem',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', right: '-20px', top: '-20px',
          width: '180px', height: '180px',
          background: 'radial-gradient(circle, rgba(47,128,237,.15) 0%, transparent 70%)',
        }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem', marginBottom: '.25rem' }}>
          {saludo},
        </p>
        <h1 style={{ fontSize: '1.8rem', marginBottom: '.5rem' }}>
          {perfil?.nombre?.split(' ')[0] || 'Estudiante'} 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem' }}>
          {perfil?.carrera ? `${perfil.carrera} · Legajo ${perfil.legajo}` : 'Portal Estudiantil FAEN'}
        </p>

        {/* Mini stats */}
        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Noticias', val: stats.noticias, color: 'var(--primary-light)' },
            { label: 'Eventos',  val: stats.eventos,  color: 'var(--accent)' },
            { label: 'Mensajes nuevos', val: stats.mensajes, color: '#9b59b6' },
          ].map(s => (
            <div key={s.label}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: s.color, fontFamily: 'var(--font-display)' }}>{s.val}</div>
              <div style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Última noticia */}
      {ultimaNoticia && (
        <div className="card" style={{ marginBottom: '2rem', borderLeft: '3px solid var(--primary)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
            <div>
              <span className="badge badge-primary" style={{ marginBottom: '.5rem', display: 'inline-block' }}>Última noticia</span>
              <h3 style={{ fontSize: '1rem', marginBottom: '.25rem' }}>{ultimaNoticia.titulo}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '.85rem' }}>{ultimaNoticia.resumen || ultimaNoticia.contenido?.slice(0, 100) + '...'}</p>
            </div>
            <Link to="noticias" style={{ flexShrink: 0 }}>
              <button className="btn btn-ghost btn-sm"><ArrowRight size={14} /></button>
            </Link>
          </div>
        </div>
      )}

      {/* Módulos */}
      <h2 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '1rem', fontWeight: 600 }}>Accesos rápidos</h2>
      <div className="card-grid card-grid-3">
        {MODULOS.map(({ to, icon: Icon, label, desc, color }) => (
          <Link key={to} to={to} style={{ textDecoration: 'none' }}>
            <div className="card" style={{ cursor: 'pointer', height: '100%' }}>
              <div style={{
                width: '40px', height: '40px',
                background: color + '22',
                borderRadius: 'var(--radius-sm)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '1rem',
              }}>
                <Icon size={20} color={color} />
              </div>
              <h3 style={{ fontSize: '.95rem', marginBottom: '.25rem' }}>{label}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '.8rem' }}>{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
