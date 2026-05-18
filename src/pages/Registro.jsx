import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { BookOpen, ArrowRight, ArrowLeft, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { validarCodigo, registrarEstudiante } from '../services/registroService'

const CARRERAS = [
  'Contador Público',
  'Licenciatura en Comercio Exterior',

]

export default function Registro() {
  const nav = useNavigate()
  const [paso, setPaso] = useState(1) // 1: código, 2: datos, 3: éxito
  const [codigoDoc, setCodigoDoc] = useState(null)
  const [codigoInput, setCodigoInput] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [verPass, setVerPass] = useState(false)

  const [form, setForm] = useState({
    nombre: '', apellido: '', dni: '', carrera: '', email: '', password: '', confirmar: ''
  })

  // ── Paso 1: validar código ──
  const handleValidarCodigo = async (e) => {
    e.preventDefault()
    setError(''); setCargando(true)
    try {
      const doc = await validarCodigo(codigoInput)
      setCodigoDoc(doc)
      setPaso(2)
    } catch (err) {
      setError(err.message)
    } finally { setCargando(false) }
  }

  // ── Paso 2: registrar ──
  const handleRegistrar = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.confirmar) return setError('Las contraseñas no coinciden.')
    if (form.password.length < 6) return setError('La contraseña debe tener al menos 6 caracteres.')
    if (!/^\d{7,8}$/.test(form.dni)) return setError('DNI inválido (7 u 8 dígitos).')

    setCargando(true)
    try {
      await registrarEstudiante({ ...form, codigoId: codigoDoc.id })
      setPaso(3)
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') setError('Ese email ya está registrado.')
      else setError('Error al registrarse. Intentá de nuevo.')
    } finally { setCargando(false) }
  }

  const campo = (key, label, type = 'text', placeholder = '') => (
    <div>
      <label style={{ display: 'block', fontSize: '.82rem', color: 'var(--text-secondary)', marginBottom: '.35rem' }}>
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={e => setForm({ ...form, [key]: e.target.value })}
        required
      />
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-base)', padding: '1rem', position: 'relative', overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute', top: '-20%', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(47,128,237,.1) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '54px', height: '54px',
            background: 'linear-gradient(135deg, #1a3a6b, #2f80ed)',
            borderRadius: '14px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto .9rem',
            boxShadow: 'var(--glow-primary)',
          }}>
            <BookOpen size={26} color="white" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', marginBottom: '.2rem' }}>
            Registro de Estudiante
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '.82rem' }}>
            CEFAEN — Portal Estudiantil
          </p>
        </div>

        {/* Indicador de pasos */}
        {paso < 3 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
            {[1, 2].map(n => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: paso >= n ? 'var(--primary)' : 'var(--bg-hover)',
                  border: `2px solid ${paso >= n ? 'var(--primary)' : 'var(--border-accent)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '.75rem', fontWeight: 700,
                  color: paso >= n ? 'white' : 'var(--text-muted)',
                  transition: 'all .3s',
                }}>{n}</div>
                <span style={{ fontSize: '.78rem', color: paso === n ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {n === 1 ? 'Código de acceso' : 'Tus datos'}
                </span>
                {n === 1 && <div style={{ width: '30px', height: '2px', background: paso > 1 ? 'var(--primary)' : 'var(--border-accent)', borderRadius: '2px' }} />}
              </div>
            ))}
          </div>
        )}

        {/* ── PASO 1: Código ── */}
        {paso === 1 && (
          <div className="card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1rem', marginBottom: '.5rem' }}>Ingresá tu código de acceso</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '.83rem', marginBottom: '1.5rem' }}>
              El código fue entregado por la facultad. Tiene un cupo y fecha de vencimiento.
            </p>
            <form onSubmit={handleValidarCodigo} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '.82rem', color: 'var(--text-secondary)', marginBottom: '.35rem' }}>
                  Código
                </label>
                <input
                  value={codigoInput}
                  onChange={e => setCodigoInput(e.target.value.toUpperCase())}
                  placeholder="FAEN-XXXX-XXXX"
                  required
                  style={{ fontFamily: 'monospace', fontSize: '1.1rem', letterSpacing: '.1em', textAlign: 'center' }}
                />
              </div>
              {error && <p style={{ color: 'var(--danger)', fontSize: '.85rem' }}>{error}</p>}
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '.75rem' }} disabled={cargando}>
                {cargando ? 'Validando...' : <><ArrowRight size={16} /> Continuar</>}
              </button>
              <p style={{ textAlign: 'center', fontSize: '.82rem', color: 'var(--text-muted)' }}>
                ¿Ya tenés cuenta? <Link to="/login" style={{ color: 'var(--primary-light)' }}>Iniciá sesión</Link>
              </p>
            </form>
          </div>
        )}

        {/* ── PASO 2: Datos ── */}
        {paso === 2 && (
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', marginBottom: '1.25rem' }}>
              <button onClick={() => setPaso(1)} className="btn btn-ghost btn-sm"><ArrowLeft size={14} /></button>
              <h2 style={{ fontSize: '1rem' }}>Completá tus datos</h2>
            </div>
            {codigoDoc && (
              <div style={{
                background: 'rgba(39,174,96,.1)', border: '1px solid rgba(39,174,96,.3)',
                borderRadius: 'var(--radius-sm)', padding: '.6rem .9rem',
                fontSize: '.8rem', color: 'var(--success)', marginBottom: '1.25rem',
                display: 'flex', gap: '.5rem', alignItems: 'center',
              }}>
                <CheckCircle size={14} /> Código válido — {codigoDoc.cupo - codigoDoc.usados} lugar{codigoDoc.cupo - codigoDoc.usados !== 1 ? 'es' : ''} disponible{codigoDoc.cupo - codigoDoc.usados !== 1 ? 's' : ''}
              </div>
            )}
            <form onSubmit={handleRegistrar} style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }}>
                {campo('nombre',   'Nombre',   'text', 'Juan')}
                {campo('apellido', 'Apellido', 'text', 'Pérez')}
              </div>
              {campo('dni', 'DNI', 'text', '12345678')}

              <div>
                <label style={{ display: 'block', fontSize: '.82rem', color: 'var(--text-secondary)', marginBottom: '.35rem' }}>Carrera</label>
                <select value={form.carrera} onChange={e => setForm({ ...form, carrera: e.target.value })} required>
                  <option value="">Seleccioná una carrera...</option>
                  {CARRERAS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {campo('email', 'Email', 'email', 'tu@email.com')}

              <div>
                <label style={{ display: 'block', fontSize: '.82rem', color: 'var(--text-secondary)', marginBottom: '.35rem' }}>Contraseña</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={verPass ? 'text' : 'password'}
                    placeholder="Mínimo 6 caracteres"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required style={{ paddingRight: '2.5rem' }}
                  />
                  <button type="button" onClick={() => setVerPass(!verPass)} style={{
                    position: 'absolute', right: '.75rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-muted)', padding: 0,
                  }}>{verPass ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '.82rem', color: 'var(--text-secondary)', marginBottom: '.35rem' }}>Confirmar contraseña</label>
                <input
                  type="password" placeholder="Repetí la contraseña"
                  value={form.confirmar}
                  onChange={e => setForm({ ...form, confirmar: e.target.value })}
                  required
                />
              </div>

              {error && <p style={{ color: 'var(--danger)', fontSize: '.85rem' }}>{error}</p>}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '.75rem', marginTop: '.25rem' }} disabled={cargando}>
                {cargando ? 'Registrando...' : 'Crear mi cuenta'}
              </button>
            </form>
          </div>
        )}

        {/* ── PASO 3: Éxito ── */}
        {paso === 3 && (
          <div className="card" style={{ padding: '2.5rem', textAlign: 'center' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'rgba(39,174,96,.15)', border: '2px solid var(--success)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 1.25rem',
            }}>
              <CheckCircle size={32} color="var(--success)" />
            </div>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '.5rem' }}>¡Cuenta creada!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '.9rem', marginBottom: '1.75rem' }}>
              Tu registro fue exitoso. Ya podés ingresar al portal con tu email y contraseña.
            </p>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '.75rem' }}
              onClick={() => nav('/login')}>
              Ir al inicio de sesión
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
