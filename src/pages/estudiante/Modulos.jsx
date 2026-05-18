// ─── Noticias ────────────────────────────────────────────────────
import { useEffect, useState } from 'react'
import { Newspaper, Clock, ExternalLink } from 'lucide-react'
import { getNoticias } from '../../services/dataService'

export function Noticias() {
  const [noticias, setNoticias] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    getNoticias(20).then(d => { setNoticias(d); setCargando(false) }).catch(() => setCargando(false))
  }, [])

  return (
    <div className="page">
      <div className="page-header">
        <h1>Noticias</h1>
        <p>Novedades de la Facultad</p>
      </div>
      {cargando ? <div className="spinner" /> : noticias.length === 0 ? (
        <div className="empty-state"><Newspaper size={48} /><h3>No hay noticias aún</h3></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {noticias.map(n => (
            <div key={n.id} className="card">
              {n.imagen && (
                <img src={n.imagen} alt={n.titulo} style={{ width:'100%', height:'200px', objectFit:'cover',
                  borderRadius:'var(--radius-sm)', marginBottom:'1rem' }} />
              )}
              <div style={{ display:'flex', gap:'.75rem', alignItems:'flex-start', marginBottom:'.5rem' }}>
                {n.categoria && <span className="badge badge-primary">{n.categoria}</span>}
              </div>
              <h2 style={{ fontSize:'1.1rem', marginBottom:'.5rem' }}>{n.titulo}</h2>
              <p style={{ color:'var(--text-secondary)', fontSize:'.9rem', marginBottom:'1rem' }}>
                {n.contenido}
              </p>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <span style={{ color:'var(--text-muted)', fontSize:'.78rem', display:'flex', alignItems:'center', gap:'.35rem' }}>
                  <Clock size={12} />
                  {n.fecha?.toDate ? n.fecha.toDate().toLocaleDateString('es-AR') : 'Sin fecha'}
                </span>
                {n.link && (
                  <a href={n.link} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                    Ver más <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Mensajes ────────────────────────────────────────────────────
import { getMensajes } from '../../services/dataService'
import { useAuth } from '../../context/AuthContext'
import { Mail, Clock as ClockIcon } from 'lucide-react'

export function Mensajes() {
  const { user } = useAuth()
  const [mensajes, setMensajes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [seleccionado, setSeleccionado] = useState(null)

  useEffect(() => {
    if (user) {
      getMensajes(user.uid).then(d => { setMensajes(d); setCargando(false) }).catch(() => setCargando(false))
    }
  }, [user])

  return (
    <div className="page">
      <div className="page-header">
        <h1>Mensajes</h1>
        <p>Comunicaciones de la Facultad</p>
      </div>
      {cargando ? <div className="spinner" /> : mensajes.length === 0 ? (
        <div className="empty-state"><Mail size={48} /><h3>No tenés mensajes</h3></div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'.5rem' }}>
          {mensajes.map(m => (
            <div key={m.id} className="card" style={{
              cursor:'pointer',
              borderLeft: !m.leido ? '3px solid var(--primary)' : '3px solid transparent',
            }} onClick={() => setSeleccionado(seleccionado?.id === m.id ? null : m)}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div>
                  {!m.leido && <span className="badge badge-primary" style={{ marginBottom:'.35rem', display:'inline-block' }}>Nuevo</span>}
                  <h3 style={{ fontSize:'.95rem' }}>{m.asunto}</h3>
                  <span style={{ color:'var(--text-muted)', fontSize:'.78rem', display:'flex', alignItems:'center', gap:'.3rem', marginTop:'.25rem' }}>
                    <ClockIcon size={11} />
                    {m.fecha?.toDate ? m.fecha.toDate().toLocaleDateString('es-AR') : ''}
                  </span>
                </div>
              </div>
              {seleccionado?.id === m.id && (
                <p style={{ marginTop:'1rem', color:'var(--text-secondary)', fontSize:'.9rem', lineHeight:1.7,
                  borderTop:'1px solid var(--border)', paddingTop:'1rem' }}>
                  {m.cuerpo}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Calendario ──────────────────────────────────────────────────
import { getCalendario } from '../../services/dataService'
import { Calendar as CalIcon } from 'lucide-react'

const TIPO_COLOR = {
  examen:    { bg: 'rgba(231,76,60,.15)', color: 'var(--danger)',  label: 'Examen' },
  feriado:   { bg: 'rgba(245,166,35,.15)', color: 'var(--accent)', label: 'Feriado' },
  inscripcion: { bg: 'rgba(47,128,237,.15)', color: 'var(--primary-light)', label: 'Inscripción' },
  evento:    { bg: 'rgba(39,174,96,.15)', color: 'var(--success)', label: 'Evento' },
  otro:      { bg: 'rgba(139,145,160,.15)', color: 'var(--text-secondary)', label: 'Otro' },
}

export function Calendario() {
  const [items, setItems] = useState([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState('todos')

  useEffect(() => {
    getCalendario().then(d => { setItems(d); setCargando(false) }).catch(() => setCargando(false))
  }, [])

  const filtrados = filtro === 'todos' ? items : items.filter(i => i.tipo === filtro)

  return (
    <div className="page">
      <div className="page-header">
        <h1>Calendario Académico</h1>
        <p>Fechas y eventos del ciclo lectivo</p>
      </div>

      {/* Filtros */}
      <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap', marginBottom:'1.5rem' }}>
        {['todos', 'examen', 'feriado', 'inscripcion', 'evento', 'otro'].map(t => (
          <button key={t} className={`btn btn-sm ${filtro === t ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setFiltro(t)}>
            {t === 'todos' ? 'Todos' : TIPO_COLOR[t]?.label || t}
          </button>
        ))}
      </div>

      {cargando ? <div className="spinner" /> : filtrados.length === 0 ? (
        <div className="empty-state"><CalIcon size={48} /><h3>No hay eventos en el calendario</h3></div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'.75rem' }}>
          {filtrados.map(item => {
            const tipo = TIPO_COLOR[item.tipo] || TIPO_COLOR.otro
            const fecha = item.fecha?.toDate ? item.fecha.toDate() : new Date(item.fecha)
            return (
              <div key={item.id} className="card" style={{ display:'flex', gap:'1.25rem', alignItems:'flex-start' }}>
                {/* Fecha */}
                <div style={{
                  minWidth: '54px', textAlign:'center',
                  background: tipo.bg, borderRadius:'var(--radius-sm)',
                  padding: '.5rem .25rem', flexShrink: 0,
                }}>
                  <div style={{ fontSize:'1.4rem', fontWeight:800, fontFamily:'var(--font-display)', color: tipo.color, lineHeight:1 }}>
                    {fecha.getDate()}
                  </div>
                  <div style={{ fontSize:'.65rem', color: tipo.color, textTransform:'uppercase', letterSpacing:'.05em' }}>
                    {fecha.toLocaleString('es-AR', { month:'short' })}
                  </div>
                </div>
                <div>
                  <span className="badge" style={{ background: tipo.bg, color: tipo.color, marginBottom:'.35rem', display:'inline-block' }}>
                    {tipo.label}
                  </span>
                  <h3 style={{ fontSize:'.95rem', marginBottom:'.2rem' }}>{item.titulo}</h3>
                  {item.descripcion && <p style={{ color:'var(--text-muted)', fontSize:'.82rem' }}>{item.descripcion}</p>}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Eventos ─────────────────────────────────────────────────────
import { getEventos } from '../../services/dataService'
import { PartyPopper } from 'lucide-react'

export function Eventos() {
  const [eventos, setEventos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    getEventos().then(d => { setEventos(d); setCargando(false) }).catch(() => setCargando(false))
  }, [])

  return (
    <div className="page">
      <div className="page-header">
        <h1>Eventos</h1>
        <p>Actividades y eventos para estudiantes</p>
      </div>
      {cargando ? <div className="spinner" /> : eventos.length === 0 ? (
        <div className="empty-state"><PartyPopper size={48} /><h3>No hay eventos próximos</h3></div>
      ) : (
        <div className="card-grid card-grid-2">
          {eventos.map(ev => {
            const fecha = ev.fecha?.toDate ? ev.fecha.toDate() : new Date(ev.fecha)
            return (
              <div key={ev.id} className="card">
                {ev.imagen && (
                  <img src={ev.imagen} alt={ev.titulo} style={{ width:'100%', height:'160px', objectFit:'cover',
                    borderRadius:'var(--radius-sm)', marginBottom:'1rem' }} />
                )}
                <span className="badge badge-accent" style={{ marginBottom:'.5rem', display:'inline-block' }}>
                  {fecha.toLocaleDateString('es-AR', { weekday:'short', day:'numeric', month:'long' })}
                </span>
                <h3 style={{ fontSize:'1rem', marginBottom:'.35rem' }}>{ev.titulo}</h3>
                <p style={{ color:'var(--text-secondary)', fontSize:'.85rem', marginBottom:'.75rem' }}>{ev.descripcion}</p>
                {ev.lugar && (
                  <p style={{ color:'var(--text-muted)', fontSize:'.78rem' }}>📍 {ev.lugar}</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Biblioteca ──────────────────────────────────────────────────
import { getBiblioteca } from '../../services/dataService'
import { BookMarked, Download, ExternalLink as ExtLink } from 'lucide-react'

const CATEGORIAS = ['Todos', 'Apuntes', 'Libros', 'Reglamentos', 'Formularios', 'Otros']

export function Biblioteca() {
  const [recursos, setRecursos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [cat, setCat] = useState('Todos')

  useEffect(() => {
    getBiblioteca().then(d => { setRecursos(d); setCargando(false) }).catch(() => setCargando(false))
  }, [])

  const filtrados = cat === 'Todos' ? recursos : recursos.filter(r => r.categoria === cat)

  return (
    <div className="page">
      <div className="page-header">
        <h1>Biblioteca Virtual</h1>
        <p>Material de estudio y recursos académicos</p>
      </div>

      <div style={{ display:'flex', gap:'.5rem', flexWrap:'wrap', marginBottom:'1.5rem' }}>
        {CATEGORIAS.map(c => (
          <button key={c} className={`btn btn-sm ${cat === c ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>

      {cargando ? <div className="spinner" /> : filtrados.length === 0 ? (
        <div className="empty-state"><BookMarked size={48} /><h3>No hay recursos en esta categoría</h3></div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:'.5rem' }}>
          {filtrados.map(r => (
            <div key={r.id} className="card" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1rem' }}>
              <div style={{ display:'flex', gap:'.75rem', alignItems:'center' }}>
                <div style={{
                  width:'40px', height:'40px', flexShrink:0,
                  background:'rgba(47,128,237,.1)', borderRadius:'var(--radius-sm)',
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'1.2rem',
                }}>
                  {r.tipo === 'pdf' ? '📄' : r.tipo === 'video' ? '🎬' : '📎'}
                </div>
                <div>
                  <h3 style={{ fontSize:'.9rem' }}>{r.titulo}</h3>
                  <div style={{ display:'flex', gap:'.5rem', marginTop:'.2rem', flexWrap:'wrap' }}>
                    {r.categoria && <span className="badge badge-primary">{r.categoria}</span>}
                    {r.materia && <span style={{ color:'var(--text-muted)', fontSize:'.75rem' }}>{r.materia}</span>}
                  </div>
                </div>
              </div>
              {r.url && (
                <a href={r.url} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm" style={{ flexShrink:0 }}>
                  {r.tipo === 'pdf' ? <><Download size={13}/> Descargar</> : <><ExtLink size={13}/> Abrir</>}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Redes Sociales ──────────────────────────────────────────────
import { getRedesSociales } from '../../services/dataService'
import { Share2 } from 'lucide-react'

const ICONOS_RED = {
  instagram: '📸', facebook: '📘', twitter: '🐦', youtube: '▶️',
  linkedin: '💼', tiktok: '🎵', whatsapp: '💬', otro: '🔗',
}

export function RedesSociales() {
  const [redes, setRedes] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    getRedesSociales().then(d => { setRedes(d); setCargando(false) }).catch(() => setCargando(false))
  }, [])

  return (
    <div className="page">
      <div className="page-header">
        <h1>Redes Sociales</h1>
        <p>Seguinos y estate al tanto de todas las novedades</p>
      </div>
      {cargando ? <div className="spinner" /> : redes.length === 0 ? (
        <div className="empty-state"><Share2 size={48} /><h3>No hay redes configuradas</h3></div>
      ) : (
        <div className="card-grid card-grid-3">
          {redes.map((r, i) => (
            <a key={i} href={r.url} target="_blank" rel="noreferrer" style={{ textDecoration:'none' }}>
              <div className="card" style={{ textAlign:'center', cursor:'pointer' }}>
                <div style={{ fontSize:'2.5rem', marginBottom:'.75rem' }}>
                  {ICONOS_RED[r.red?.toLowerCase()] || ICONOS_RED.otro}
                </div>
                <h3 style={{ fontSize:'1rem', marginBottom:'.25rem', textTransform:'capitalize' }}>{r.red}</h3>
                {r.usuario && <p style={{ color:'var(--text-muted)', fontSize:'.85rem' }}>@{r.usuario}</p>}
                <span className="btn btn-ghost btn-sm" style={{ marginTop:'.75rem', display:'inline-flex' }}>
                  <ExtLink size={12} /> Visitar
                </span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
