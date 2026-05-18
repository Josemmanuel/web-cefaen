import { useEffect, useState } from 'react'
import { Plus, Trash2, X, Newspaper } from 'lucide-react'
import { getNoticias, agregarNoticia, eliminarNoticia } from '../../services/dataService'

export default function AdminNoticias() {
  const [noticias, setNoticias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ titulo: '', contenido: '', categoria: '', imagen: '', link: '' })
  const [guardando, setGuardando] = useState(false)
  const [msg, setMsg] = useState('')

  const cargar = () => getNoticias(50).then(d => { setNoticias(d); setCargando(false) })
  useEffect(() => { cargar() }, [])

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    try {
      await agregarNoticia(form)
      setModal(false)
      setForm({ titulo: '', contenido: '', categoria: '', imagen: '', link: '' })
      setMsg('Noticia publicada ✓')
      cargar()
    } catch { setMsg('Error al guardar.') }
    finally { setGuardando(false) }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar esta noticia?')) return
    await eliminarNoticia(id)
    setMsg('Noticia eliminada.')
    cargar()
  }

  return (
    <div className="page">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem' }}>
        <div className="page-header" style={{ margin:0 }}>
          <h1>Noticias</h1>
          <p>Administrá las publicaciones de la facultad</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          <Plus size={16} /> Nueva noticia
        </button>
      </div>

      {msg && <div className="toast" style={{ position:'relative', bottom:'auto', right:'auto', marginBottom:'1rem' }}>
        <span style={{ color:'var(--success)' }}>✓</span> {msg}
        <button onClick={() => setMsg('')} style={{ background:'none', border:'none', color:'var(--text-muted)', marginLeft:'auto' }}><X size={14}/></button>
      </div>}

      {cargando ? <div className="spinner" /> : noticias.length === 0 ? (
        <div className="empty-state"><Newspaper size={48} /><h3>No hay noticias aún</h3></div>
      ) : (
        <div className="card" style={{ padding:0 }}>
          <table className="tabla">
            <thead>
              <tr>
                <th>Título</th>
                <th>Categoría</th>
                <th>Fecha</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {noticias.map(n => (
                <tr key={n.id}>
                  <td style={{ color:'var(--text-primary)', fontWeight:500 }}>{n.titulo}</td>
                  <td>{n.categoria ? <span className="badge badge-primary">{n.categoria}</span> : '—'}</td>
                  <td>{n.fecha?.toDate ? n.fecha.toDate().toLocaleDateString('es-AR') : '—'}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => eliminar(n.id)}>
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Nueva Noticia</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}><X size={16}/></button>
            </div>
            <form onSubmit={guardar} style={{ display:'flex', flexDirection:'column', gap:'.85rem' }}>
              <div>
                <label style={{ fontSize:'.82rem', color:'var(--text-secondary)', display:'block', marginBottom:'.3rem' }}>Título *</label>
                <input value={form.titulo} onChange={e => setForm({...form, titulo: e.target.value})} required placeholder="Título de la noticia" />
              </div>
              <div>
                <label style={{ fontSize:'.82rem', color:'var(--text-secondary)', display:'block', marginBottom:'.3rem' }}>Contenido *</label>
                <textarea rows={4} value={form.contenido} onChange={e => setForm({...form, contenido: e.target.value})} required placeholder="Texto de la noticia..." style={{ resize:'vertical' }} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.75rem' }}>
                <div>
                  <label style={{ fontSize:'.82rem', color:'var(--text-secondary)', display:'block', marginBottom:'.3rem' }}>Categoría</label>
                  <select value={form.categoria} onChange={e => setForm({...form, categoria: e.target.value})}>
                    <option value="">Sin categoría</option>
                    <option>Académico</option><option>Institucional</option>
                    <option>Becas</option><option>Eventos</option><option>Otro</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize:'.82rem', color:'var(--text-secondary)', display:'block', marginBottom:'.3rem' }}>URL imagen</label>
                  <input value={form.imagen} onChange={e => setForm({...form, imagen: e.target.value})} placeholder="https://..." />
                </div>
              </div>
              <div>
                <label style={{ fontSize:'.82rem', color:'var(--text-secondary)', display:'block', marginBottom:'.3rem' }}>Link externo</label>
                <input value={form.link} onChange={e => setForm({...form, link: e.target.value})} placeholder="https://..." />
              </div>
              <div style={{ display:'flex', gap:'.75rem', justifyContent:'flex-end', marginTop:'.5rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={guardando}>
                  {guardando ? 'Guardando...' : 'Publicar noticia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
