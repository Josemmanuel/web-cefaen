import { useEffect, useState } from 'react'
import { Newspaper, Calendar, PartyPopper, BookMarked, Users, Mail } from 'lucide-react'
import { getNoticias, getEventos, getCalendario, getBiblioteca, getUsuarios } from '../../services/dataService'

const STATS = [
  { label: 'Noticias',    icon: Newspaper,   key: 'noticias',   color: '#27ae60' },
  { label: 'Eventos',     icon: PartyPopper, key: 'eventos',    color: '#f5a623' },
  { label: 'Calendario',  icon: Calendar,    key: 'calendario', color: '#2f80ed' },
  { label: 'Biblioteca',  icon: BookMarked,  key: 'biblioteca', color: '#e74c3c' },
  { label: 'Usuarios',    icon: Users,       key: 'usuarios',   color: '#9b59b6' },
]

export default function AdminDashboard() {
  const [counts, setCounts] = useState({})
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    Promise.allSettled([
      getNoticias(100), getEventos(), getCalendario(),
      getBiblioteca(), getUsuarios()
    ]).then(results => {
      const [n, e, c, b, u] = results.map(r => r.status === 'fulfilled' ? r.value : [])
      setCounts({ noticias: n.length, eventos: e.length, calendario: c.length, biblioteca: b.length, usuarios: u.length })
      setCargando(false)
    })
  }, [])

  return (
    <div className="page">
      <div className="page-header">
        <h1>Panel de Control</h1>
        <p>Resumen general del portal estudiantil</p>
      </div>

      <div className="card-grid card-grid-3" style={{ marginBottom:'2rem' }}>
        {STATS.map(({ label, icon: Icon, key, color }) => (
          <div key={key} className="card">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <p style={{ color:'var(--text-muted)', fontSize:'.8rem', marginBottom:'.25rem' }}>{label}</p>
                <p style={{ fontSize:'2rem', fontWeight:800, fontFamily:'var(--font-display)', color }}>
                  {cargando ? '—' : counts[key] || 0}
                </p>
              </div>
              <div style={{
                width:'44px', height:'44px',
                background: color + '22',
                borderRadius:'var(--radius-sm)',
                display:'flex', alignItems:'center', justifyContent:'center',
              }}>
                <Icon size={22} color={color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 style={{ fontSize:'1rem', marginBottom:'1rem' }}>Acciones rápidas</h2>
        <div style={{ display:'flex', gap:'.75rem', flexWrap:'wrap' }}>
          {[
            { label:'Nueva noticia',    to:'/admin/noticias' },
            { label:'Agregar evento',   to:'/admin/eventos' },
            { label:'Nuevo recurso',    to:'/admin/biblioteca' },
            { label:'Enviar mensaje',   to:'/admin/mensajes' },
          ].map(({ label, to }) => (
            <a key={to} href={to} className="btn btn-ghost">{label}</a>
          ))}
        </div>
      </div>
    </div>
  )
}
