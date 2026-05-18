import { useEffect, useState } from 'react'
import { BookMarked, FileText, ChevronRight, Eye, Download, X } from 'lucide-react'
import { getCarreras, getMaterias, getRecursos, drivePreviewUrl, driveDownloadUrl } from '../../services/bibliotecaService'
import { useAuth } from '../../context/AuthContext'

const ANIOS = [1, 2, 3, 4, 5]

export default function Biblioteca() {
  const { perfil } = useAuth()

  const [carreras, setCarreras] = useState([])
  const [materias, setMaterias] = useState([])
  const [recursos, setRecursos] = useState([])
  const [cargando, setCargando] = useState(false)

  const [carreraId, setCarreraId] = useState('')
  const [anio, setAnio] = useState('')
  const [materiaId, setMateriaId] = useState('')

  // Previsualizador
  const [preview, setPreview] = useState(null) // { titulo, url, tipo }

  // Al montar, pre-seleccionar la carrera y año del estudiante si están en su perfil
  useEffect(() => {
    getCarreras().then(lista => {
      setCarreras(lista)
      if (perfil?.carreraId) {
        setCarreraId(perfil.carreraId)
      }
    })
  }, [perfil])

  useEffect(() => {
    setAnio(''); setMateriaId(''); setMaterias([]); setRecursos([])
    if (carreraId) {
      getMaterias(carreraId).then(setMaterias)
      // Pre-seleccionar año del perfil si coincide con la carrera
      if (perfil?.anio) setAnio(String(perfil.anio))
    }
  }, [carreraId])

  useEffect(() => {
    setMateriaId(''); setRecursos([])
  }, [anio])

  useEffect(() => {
    if (!carreraId) return
    setCargando(true)
    getRecursos({ carreraId, anio: anio || undefined, materiaId: materiaId || undefined })
      .then(d => { setRecursos(d); setCargando(false) })
  }, [carreraId, anio, materiaId])

  const materiasDelAnio = materias.filter(m => !anio || m.anio === parseInt(anio))

  // Determinar si el estudiante puede ver un año (solo su año o anteriores)
  const anioPermitido = (a) => {
    if (!perfil?.anio) return true // sin restricción si no tiene año en perfil
    return parseInt(a) <= parseInt(perfil.anio)
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>Biblioteca Virtual</h1>
        <p>Material de estudio organizado por carrera, año y materia</p>
      </div>

      {/* Filtros jerárquicos */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>

          {/* Carrera */}
          <div style={{ flex: 1, minWidth: '180px' }}>
            <label style={{ display: 'block', fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: '.35rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Carrera</label>
            <select value={carreraId} onChange={e => setCarreraId(e.target.value)}>
              <option value="">Seleccioná una carrera...</option>
              {carreras.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>

          {carreraId && (
            <>
              <ChevronRight size={16} color="var(--text-muted)" style={{ flexShrink: 0, marginBottom: '.6rem' }} />
              <div style={{ minWidth: '130px' }}>
                <label style={{ display: 'block', fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: '.35rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Año</label>
                <select value={anio} onChange={e => setAnio(e.target.value)}>
                  <option value="">Todos</option>
                  {ANIOS.filter(a => anioPermitido(a)).map(a => (
                    <option key={a} value={a}>{a}° año</option>
                  ))}
                </select>
              </div>
            </>
          )}

          {anio && materiasDelAnio.length > 0 && (
            <>
              <ChevronRight size={16} color="var(--text-muted)" style={{ flexShrink: 0, marginBottom: '.6rem' }} />
              <div style={{ flex: 1, minWidth: '160px' }}>
                <label style={{ display: 'block', fontSize: '.75rem', color: 'var(--text-muted)', marginBottom: '.35rem', textTransform: 'uppercase', letterSpacing: '.06em' }}>Materia</label>
                <select value={materiaId} onChange={e => setMateriaId(e.target.value)}>
                  <option value="">Todas</option>
                  {materiasDelAnio.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Resultados */}
      {!carreraId ? (
        <div className="empty-state">
          <BookMarked size={48} />
          <h3>Seleccioná una carrera para ver el material disponible</h3>
        </div>
      ) : cargando ? (
        <div className="spinner" />
      ) : recursos.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} />
          <h3>No hay archivos en esta selección</h3>
        </div>
      ) : (
        <>
          <p style={{ color: 'var(--text-muted)', fontSize: '.82rem', marginBottom: '1rem' }}>
            {recursos.length} recurso{recursos.length !== 1 ? 's' : ''} encontrado{recursos.length !== 1 ? 's' : ''}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
            {recursos.map(r => (
              <div key={r.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div style={{ display: 'flex', gap: '.75rem', alignItems: 'center' }}>
                  <div style={{
                    width: '44px', height: '44px', flexShrink: 0,
                    background: r.tipo === 'pdf' ? 'rgba(231,76,60,.15)' : 'rgba(47,128,237,.15)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '.7rem', fontWeight: 800,
                    color: r.tipo === 'pdf' ? 'var(--danger)' : 'var(--primary-light)',
                  }}>
                    {r.tipo?.toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '.92rem', color: 'var(--text-primary)', marginBottom: '.15rem' }}>{r.titulo}</p>
                    <p style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>
                      {r.materiaNombre} · {r.anio}° año
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '.5rem', flexShrink: 0 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => setPreview(r)}>
                    <Eye size={13} /> Ver
                  </button>
                  <a href={driveDownloadUrl(r.url)} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                    <Download size={13} /> Descargar
                  </a>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── MODAL PREVISUALIZADOR ── */}
      {preview && (
        <div className="modal-overlay" style={{ alignItems: 'stretch', padding: '1rem' }} onClick={e => e.target === e.currentTarget && setPreview(null)}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-accent)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            maxWidth: '860px',
            maxHeight: '90vh',
            overflow: 'hidden',
            boxShadow: 'var(--shadow-lg)',
          }}>
            {/* Header del modal */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '1rem 1.5rem',
              borderBottom: '1px solid var(--border)',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                <div style={{
                  width: '32px', height: '32px',
                  background: preview.tipo === 'pdf' ? 'rgba(231,76,60,.15)' : 'rgba(47,128,237,.15)',
                  borderRadius: 'var(--radius-sm)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '.65rem', fontWeight: 800,
                  color: preview.tipo === 'pdf' ? 'var(--danger)' : 'var(--primary-light)',
                }}>
                  {preview.tipo?.toUpperCase()}
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', lineHeight: 1.2 }}>{preview.titulo}</h3>
                  <p style={{ fontSize: '.75rem', color: 'var(--text-muted)' }}>{preview.materiaNombre} · {preview.anio}° año</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                <a href={driveDownloadUrl(preview.url)} target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                  <Download size={13} /> Descargar
                </a>
                <button className="btn btn-ghost btn-sm" onClick={() => setPreview(null)}>
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Iframe de Google Drive */}
            <div style={{ flex: 1, position: 'relative', minHeight: '500px' }}>
              <iframe
                src={drivePreviewUrl(preview.url)}
                style={{
                  width: '100%',
                  height: '100%',
                  border: 'none',
                  display: 'block',
                  minHeight: '500px',
                }}
                title={preview.titulo}
                allow="autoplay"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
