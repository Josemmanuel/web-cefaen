import { useEffect, useState } from 'react'
import { Plus, Trash2, X, BookMarked, FolderOpen, File, AlertCircle, Link } from 'lucide-react'
import {
  getCarreras, agregarCarrera, eliminarCarrera,
  getMaterias, agregarMateria, eliminarMateria,
  getRecursos, agregarRecurso, eliminarRecurso
} from '../../services/bibliotecaService'

const ANIOS = [1, 2, 3, 4, 5]
const TABS = ['Carreras', 'Materias', 'Archivos']

export default function AdminBiblioteca() {
  const [tab, setTab] = useState(0)
  const [carreras, setCarreras] = useState([])
  const [nuevaCarrera, setNuevaCarrera] = useState('')
  const [materias, setMaterias] = useState([])
  const [carreraFiltro, setCarreraFiltro] = useState('')
  const [modalMateria, setModalMateria] = useState(false)
  const [formMateria, setFormMateria] = useState({ nombre: '', carreraId: '', anio: '' })
  const [recursos, setRecursos] = useState([])
  const [modalArchivo, setModalArchivo] = useState(false)
  const [formArchivo, setFormArchivo] = useState({ titulo: '', url: '', tipo: 'pdf', carreraId: '', anio: '', materiaId: '' })
  const [materiasDisponibles, setMateriasDisponibles] = useState([])
  const [filtroArch, setFiltroArch] = useState({ carreraId: '', anio: '', materiaId: '' })
  const [guardando, setGuardando] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  const cargarCarreras = () => getCarreras().then(setCarreras)
  const cargarMaterias = () => getMaterias(carreraFiltro || null).then(setMaterias)
  const cargarRecursos = () => getRecursos({ carreraId: filtroArch.carreraId || undefined, anio: filtroArch.anio || undefined, materiaId: filtroArch.materiaId || undefined }).then(setRecursos)

  useEffect(() => { cargarCarreras() }, [])
  useEffect(() => { cargarMaterias() }, [carreraFiltro])
  useEffect(() => { cargarRecursos() }, [filtroArch])
  useEffect(() => {
    if (formArchivo.carreraId && formArchivo.anio) getMaterias(formArchivo.carreraId, parseInt(formArchivo.anio)).then(setMateriasDisponibles)
    else setMateriasDisponibles([])
  }, [formArchivo.carreraId, formArchivo.anio])

  const toast = (m, esError = false) => {
    if (esError) setError(m); else setMsg(m)
    setTimeout(() => { setMsg(''); setError('') }, 3500)
  }

  const handleCarrera = async (e) => {
    e.preventDefault()
    try { await agregarCarrera(nuevaCarrera.trim()); setNuevaCarrera(''); cargarCarreras(); toast('Carrera agregada.') }
    catch { toast('Error al guardar.', true) }
  }

  const handleMateria = async (e) => {
    e.preventDefault()
    const carrera = carreras.find(c => c.id === formMateria.carreraId)
    try { await agregarMateria({ ...formMateria, carreraNombre: carrera?.nombre || '' }); setModalMateria(false); setFormMateria({ nombre: '', carreraId: '', anio: '' }); cargarMaterias(); toast('Materia agregada.') }
    catch { toast('Error al guardar.', true) }
  }

  const handleArchivo = async (e) => {
    e.preventDefault()
    if (!formArchivo.url.includes('drive.google.com')) return toast('El link debe ser de Google Drive.', true)
    const carrera = carreras.find(c => c.id === formArchivo.carreraId)
    const materia = materiasDisponibles.find(m => m.id === formArchivo.materiaId)
    setGuardando(true)
    try {
      await agregarRecurso({ ...formArchivo, carreraNombre: carrera?.nombre || '', materiaNombre: materia?.nombre || '' })
      setModalArchivo(false); setFormArchivo({ titulo: '', url: '', tipo: 'pdf', carreraId: '', anio: '', materiaId: '' }); cargarRecursos(); toast('Archivo agregado.')
    } catch { toast('Error al guardar.', true) }
    finally { setGuardando(false) }
  }

  return (
    <div className="page">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'1.5rem' }}>
        <div>
          <h1 style={{ fontSize:'1.6rem' }}>Biblioteca Virtual</h1>
          <p style={{ color:'var(--text-secondary)', marginTop:'.25rem' }}>Gestioná carreras, materias y archivos</p>
        </div>
        {tab === 1 && <button className="btn btn-primary" onClick={() => setModalMateria(true)}><Plus size={15}/> Nueva materia</button>}
        {tab === 2 && <button className="btn btn-primary" onClick={() => setModalArchivo(true)}><Plus size={15}/> Agregar archivo</button>}
      </div>

      <div style={{ display:'flex', gap:'.5rem', marginBottom:'1.5rem', borderBottom:'1px solid var(--border)', paddingBottom:'.75rem' }}>
        {TABS.map((t, i) => <button key={i} onClick={() => setTab(i)} className={`btn btn-sm ${tab === i ? 'btn-primary' : 'btn-ghost'}`}>{t}</button>)}
      </div>

      {msg   && <div style={{ background:'rgba(39,174,96,.1)', border:'1px solid rgba(39,174,96,.3)', borderRadius:'var(--radius-sm)', padding:'.65rem 1rem', marginBottom:'1rem', color:'var(--success)', fontSize:'.88rem' }}>✓ {msg}</div>}
      {error && <div style={{ background:'rgba(231,76,60,.1)', border:'1px solid rgba(231,76,60,.3)', borderRadius:'var(--radius-sm)', padding:'.65rem 1rem', marginBottom:'1rem', color:'var(--danger)', fontSize:'.88rem', display:'flex', gap:'.5rem', alignItems:'center' }}><AlertCircle size={14}/>{error}</div>}

      {/* CARRERAS */}
      {tab === 0 && (
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <form onSubmit={handleCarrera} style={{ display:'flex', gap:'.75rem' }}>
            <input value={nuevaCarrera} onChange={e => setNuevaCarrera(e.target.value)} placeholder="Nombre de la carrera..." style={{ flex:1 }} required/>
            <button type="submit" className="btn btn-primary"><Plus size={15}/> Agregar</button>
          </form>
          {carreras.length === 0 ? <div className="empty-state"><BookMarked size={40}/><h3>No hay carreras</h3></div> : (
            <div style={{ display:'flex', flexDirection:'column', gap:'.5rem' }}>
              {carreras.map(c => (
                <div key={c.id} className="card" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1rem 1.25rem' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:'.75rem' }}>
                    <FolderOpen size={18} color="var(--primary-light)"/>
                    <span style={{ fontWeight:500 }}>{c.nombre}</span>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={async () => { if (!confirm(`¿Eliminar "${c.nombre}"?`)) return; await eliminarCarrera(c.id); cargarCarreras(); toast('Eliminada.') }}><Trash2 size={13}/></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MATERIAS */}
      {tab === 1 && (
        <div>
          <div style={{ marginBottom:'1rem' }}>
            <select value={carreraFiltro} onChange={e => setCarreraFiltro(e.target.value)} style={{ minWidth:'220px' }}>
              <option value="">Todas las carreras</option>
              {carreras.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          {materias.length === 0 ? <div className="empty-state"><BookMarked size={40}/><h3>No hay materias</h3></div> : (
            <div className="card" style={{ padding:0 }}>
              <table className="tabla">
                <thead><tr><th>Materia</th><th>Carrera</th><th>Año</th><th></th></tr></thead>
                <tbody>
                  {materias.map(m => (
                    <tr key={m.id}>
                      <td style={{ color:'var(--text-primary)', fontWeight:500 }}>{m.nombre}</td>
                      <td style={{ color:'var(--text-secondary)', fontSize:'.85rem' }}>{m.carreraNombre}</td>
                      <td><span className="badge badge-primary">{m.anio}° año</span></td>
                      <td><button className="btn btn-danger btn-sm" onClick={async () => { if (!confirm(`¿Eliminar "${m.nombre}"?`)) return; await eliminarMateria(m.id); cargarMaterias(); toast('Eliminada.') }}><Trash2 size={13}/></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ARCHIVOS */}
      {tab === 2 && (
        <div>
          <div style={{ display:'flex', gap:'.75rem', marginBottom:'1.25rem', flexWrap:'wrap' }}>
            <select value={filtroArch.carreraId} onChange={e => setFiltroArch({ carreraId:e.target.value, anio:'', materiaId:'' })} style={{ minWidth:'180px' }}>
              <option value="">Todas las carreras</option>
              {carreras.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
            <select value={filtroArch.anio} onChange={e => setFiltroArch({...filtroArch, anio:e.target.value, materiaId:''})} disabled={!filtroArch.carreraId}>
              <option value="">Todos los años</option>
              {ANIOS.map(a => <option key={a} value={a}>{a}° año</option>)}
            </select>
            <select value={filtroArch.materiaId} onChange={e => setFiltroArch({...filtroArch, materiaId:e.target.value})} disabled={!filtroArch.anio}>
              <option value="">Todas las materias</option>
              {materias.filter(m => m.carreraId === filtroArch.carreraId && (!filtroArch.anio || m.anio === parseInt(filtroArch.anio))).map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
            </select>
          </div>
          {recursos.length === 0 ? <div className="empty-state"><File size={40}/><h3>No hay archivos</h3></div> : (
            <div style={{ display:'flex', flexDirection:'column', gap:'.5rem' }}>
              {recursos.map(r => (
                <div key={r.id} className="card" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:'1rem' }}>
                  <div style={{ display:'flex', gap:'.75rem', alignItems:'center' }}>
                    <div style={{ width:'38px', height:'38px', flexShrink:0, background: r.tipo==='pdf' ? 'rgba(231,76,60,.15)' : 'rgba(47,128,237,.15)', borderRadius:'var(--radius-sm)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.7rem', fontWeight:800, color: r.tipo==='pdf' ? 'var(--danger)' : 'var(--primary-light)' }}>
                      {r.tipo?.toUpperCase()}
                    </div>
                    <div>
                      <p style={{ fontWeight:500, fontSize:'.9rem', color:'var(--text-primary)' }}>{r.titulo}</p>
                      <p style={{ fontSize:'.75rem', color:'var(--text-muted)' }}>{r.carreraNombre} · {r.anio}° año · {r.materiaNombre}</p>
                    </div>
                  </div>
                  <button className="btn btn-danger btn-sm" onClick={async () => { if (!confirm('¿Eliminar?')) return; await eliminarRecurso(r.id); cargarRecursos(); toast('Eliminado.') }}><Trash2 size={13}/></button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL MATERIA */}
      {modalMateria && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModalMateria(false)}>
          <div className="modal">
            <div className="modal-header"><h2>Nueva Materia</h2><button className="btn btn-ghost btn-sm" onClick={() => setModalMateria(false)}><X size={16}/></button></div>
            <form onSubmit={handleMateria} style={{ display:'flex', flexDirection:'column', gap:'.85rem' }}>
              <div>
                <label style={{ display:'block', fontSize:'.82rem', color:'var(--text-secondary)', marginBottom:'.35rem' }}>Nombre *</label>
                <input value={formMateria.nombre} onChange={e => setFormMateria({...formMateria, nombre:e.target.value})} placeholder="Ej: Matemática I" required/>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.75rem' }}>
                <div>
                  <label style={{ display:'block', fontSize:'.82rem', color:'var(--text-secondary)', marginBottom:'.35rem' }}>Carrera *</label>
                  <select value={formMateria.carreraId} onChange={e => setFormMateria({...formMateria, carreraId:e.target.value})} required>
                    <option value="">Seleccioná...</option>
                    {carreras.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'.82rem', color:'var(--text-secondary)', marginBottom:'.35rem' }}>Año *</label>
                  <select value={formMateria.anio} onChange={e => setFormMateria({...formMateria, anio:e.target.value})} required>
                    <option value="">Seleccioná...</option>
                    {ANIOS.map(a => <option key={a} value={a}>{a}° año</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display:'flex', gap:'.75rem', justifyContent:'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setModalMateria(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary"><Plus size={14}/> Agregar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ARCHIVO */}
      {modalArchivo && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModalArchivo(false)}>
          <div className="modal" style={{ maxWidth:'520px' }}>
            <div className="modal-header"><h2>Agregar archivo</h2><button className="btn btn-ghost btn-sm" onClick={() => setModalArchivo(false)}><X size={16}/></button></div>
            <form onSubmit={handleArchivo} style={{ display:'flex', flexDirection:'column', gap:'.85rem' }}>
              <div>
                <label style={{ display:'block', fontSize:'.82rem', color:'var(--text-secondary)', marginBottom:'.35rem' }}>Título *</label>
                <input value={formArchivo.titulo} onChange={e => setFormArchivo({...formArchivo, titulo:e.target.value})} placeholder="Ej: Guía de ejercicios — Unidad 3" required/>
              </div>
              <div>
                <label style={{ display:'block', fontSize:'.82rem', color:'var(--text-secondary)', marginBottom:'.35rem' }}>Link de Google Drive *</label>
                <input value={formArchivo.url} onChange={e => setFormArchivo({...formArchivo, url:e.target.value})} placeholder="https://drive.google.com/file/d/..." required/>
                <p style={{ fontSize:'.75rem', color:'var(--text-muted)', marginTop:'.35rem' }}>
                  En Drive → clic derecho → <strong>Compartir</strong> → <strong>Cualquier persona con el enlace</strong> → copiar link
                </p>
              </div>
              <div>
                <label style={{ display:'block', fontSize:'.82rem', color:'var(--text-secondary)', marginBottom:'.35rem' }}>Tipo</label>
                <select value={formArchivo.tipo} onChange={e => setFormArchivo({...formArchivo, tipo:e.target.value})}>
                  <option value="pdf">PDF</option>
                  <option value="docx">DOCX</option>
                </select>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'.75rem' }}>
                <div>
                  <label style={{ display:'block', fontSize:'.82rem', color:'var(--text-secondary)', marginBottom:'.35rem' }}>Carrera *</label>
                  <select value={formArchivo.carreraId} onChange={e => setFormArchivo({...formArchivo, carreraId:e.target.value, anio:'', materiaId:''})} required>
                    <option value="">Seleccioná...</option>
                    {carreras.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'.82rem', color:'var(--text-secondary)', marginBottom:'.35rem' }}>Año *</label>
                  <select value={formArchivo.anio} onChange={e => setFormArchivo({...formArchivo, anio:e.target.value, materiaId:''})} required disabled={!formArchivo.carreraId}>
                    <option value="">Seleccioná...</option>
                    {ANIOS.map(a => <option key={a} value={a}>{a}° año</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={{ display:'block', fontSize:'.82rem', color:'var(--text-secondary)', marginBottom:'.35rem' }}>Materia *</label>
                <select value={formArchivo.materiaId} onChange={e => setFormArchivo({...formArchivo, materiaId:e.target.value})} required disabled={!formArchivo.anio || materiasDisponibles.length === 0}>
                  <option value="">{materiasDisponibles.length === 0 && formArchivo.anio ? 'No hay materias en este año' : 'Seleccioná...'}</option>
                  {materiasDisponibles.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
              </div>
              <div style={{ display:'flex', gap:'.75rem', justifyContent:'flex-end' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setModalArchivo(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={guardando}><Link size={14}/> {guardando ? 'Guardando...' : 'Agregar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
