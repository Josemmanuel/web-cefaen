import { useEffect, useState } from 'react'
import { Plus, X, Copy, Check, Ban, KeyRound } from 'lucide-react'
import { crearCodigo, getCodigos, desactivarCodigo } from '../../services/registroService'

export default function AdminCodigos() {
  const [codigos, setCodigos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [modal, setModal] = useState(false)
  const [copiado, setCopiado] = useState(null)
  const [form, setForm] = useState({ cupo: '', vencimiento: '', descripcion: '' })
  const [guardando, setGuardando] = useState(false)
  const [msg, setMsg] = useState('')

  const cargar = () => getCodigos().then(d => { setCodigos(d); setCargando(false) })
  useEffect(() => { cargar() }, [])

  const hoy = new Date().toISOString().split('T')[0]

  const guardar = async (e) => {
    e.preventDefault()
    setGuardando(true)
    try {
      const codigo = await crearCodigo(form)
      setMsg(`Código creado: ${codigo}`)
      setModal(false)
      setForm({ cupo: '', vencimiento: '', descripcion: '' })
      cargar()
    } catch { setMsg('Error al crear el código.') }
    finally { setGuardando(false) }
  }

  const copiar = (codigo) => {
    navigator.clipboard.writeText(codigo)
    setCopiado(codigo)
    setTimeout(() => setCopiado(null), 2000)
  }

  const desactivar = async (id) => {
    if (!confirm('¿Desactivar este código?')) return
    await desactivarCodigo(id)
    setMsg('Código desactivado.')
    cargar()
  }

  const estadoCodigo = (c) => {
    const venc = c.vencimiento?.toDate ? c.vencimiento.toDate() : new Date(c.vencimiento)
    if (!c.activo) return { label: 'Desactivado', color: 'var(--text-muted)', bg: 'rgba(139,145,160,.1)' }
    if (venc < new Date()) return { label: 'Vencido', color: 'var(--danger)', bg: 'rgba(231,76,60,.1)' }
    if (c.usados >= c.cupo) return { label: 'Sin cupo', color: 'var(--warning)', bg: 'rgba(230,126,34,.1)' }
    return { label: 'Activo', color: 'var(--success)', bg: 'rgba(39,174,96,.1)' }
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Códigos de Registro</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '.25rem' }}>Generá códigos de acceso para que los estudiantes puedan registrarse</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal(true)}>
          <Plus size={16} /> Nuevo código
        </button>
      </div>

      {msg && (
        <div className="card" style={{ marginBottom: '1rem', borderLeft: '3px solid var(--success)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--success)', fontSize: '.9rem' }}>✓ {msg}</span>
          <button onClick={() => setMsg('')} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={14} /></button>
        </div>
      )}

      {cargando ? <div className="spinner" /> : codigos.length === 0 ? (
        <div className="empty-state"><KeyRound size={48} /><h3>No hay códigos creados</h3></div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          {codigos.map(c => {
            const estado = estadoCodigo(c)
            const venc = c.vencimiento?.toDate ? c.vencimiento.toDate() : new Date(c.vencimiento)
            const porcentaje = Math.round((c.usados / c.cupo) * 100)
            return (
              <div key={c.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                  {/* Código + info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '.5rem', flexWrap: 'wrap' }}>
                      <span style={{
                        fontFamily: 'monospace', fontSize: '1.1rem', fontWeight: 700,
                        color: 'var(--primary-light)', letterSpacing: '.08em',
                      }}>{c.codigo}</span>
                      <button onClick={() => copiar(c.codigo)} className="btn btn-ghost btn-sm">
                        {copiado === c.codigo ? <><Check size={12} /> Copiado</> : <><Copy size={12} /> Copiar</>}
                      </button>
                      <span className="badge" style={{ background: estado.bg, color: estado.color }}>
                        {estado.label}
                      </span>
                    </div>

                    {c.descripcion && (
                      <p style={{ color: 'var(--text-secondary)', fontSize: '.85rem', marginBottom: '.5rem' }}>{c.descripcion}</p>
                    )}

                    <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '.8rem', color: 'var(--text-muted)' }}>
                      <span>📅 Vence: {venc.toLocaleDateString('es-AR')}</span>
                      <span>👥 Cupo: {c.usados}/{c.cupo} usados</span>
                    </div>

                    {/* Barra de uso */}
                    <div style={{ marginTop: '.75rem', height: '4px', background: 'var(--bg-hover)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{
                        width: `${porcentaje}%`, height: '100%', borderRadius: '4px',
                        background: porcentaje >= 100 ? 'var(--danger)' : porcentaje >= 80 ? 'var(--warning)' : 'var(--success)',
                        transition: 'width .4s',
                      }} />
                    </div>
                  </div>

                  {/* Acciones */}
                  {c.activo && (
                    <button className="btn btn-danger btn-sm" onClick={() => desactivar(c.id)}>
                      <Ban size={13} /> Desactivar
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal crear código */}
      {modal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h2>Nuevo código de registro</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}><X size={16} /></button>
            </div>
            <form onSubmit={guardar} style={{ display: 'flex', flexDirection: 'column', gap: '.9rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '.82rem', color: 'var(--text-secondary)', marginBottom: '.35rem' }}>
                  Descripción (opcional)
                </label>
                <input
                  value={form.descripcion}
                  onChange={e => setForm({ ...form, descripcion: e.target.value })}
                  placeholder="Ej: Ingresantes 2026 — Turno mañana"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '.82rem', color: 'var(--text-secondary)', marginBottom: '.35rem' }}>
                    Cupo (cantidad de usos) *
                  </label>
                  <input
                    type="number" min="1" max="500"
                    value={form.cupo}
                    onChange={e => setForm({ ...form, cupo: e.target.value })}
                    placeholder="Ej: 30"
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '.82rem', color: 'var(--text-secondary)', marginBottom: '.35rem' }}>
                    Fecha de vencimiento *
                  </label>
                  <input
                    type="date" min={hoy}
                    value={form.vencimiento}
                    onChange={e => setForm({ ...form, vencimiento: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div style={{
                background: 'rgba(47,128,237,.08)', border: '1px solid rgba(47,128,237,.2)',
                borderRadius: 'var(--radius-sm)', padding: '.75rem', fontSize: '.82rem', color: 'var(--text-secondary)',
              }}>
                💡 Se generará un código único automáticamente con el formato <strong style={{ fontFamily: 'monospace', color: 'var(--primary-light)' }}>FAEN-XXXX-XXXX</strong>
              </div>

              <div style={{ display: 'flex', gap: '.75rem', justifyContent: 'flex-end', marginTop: '.25rem' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary" disabled={guardando}>
                  {guardando ? 'Generando...' : <><Plus size={15} /> Generar código</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
