import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, Eye, EyeOff, BookOpen } from 'lucide-react'
import { loginUsuario, resetPassword } from '../services/authService'

export default function Login() {
  const nav = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [verPass, setVerPass] = useState(false)
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)
  const [resetMode, setResetMode] = useState(false)
  const [resetMsg, setResetMsg] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setError(''); setCargando(true)
    try {
      const { perfil } = await loginUsuario(form.email, form.password)
      if (perfil?.rol === 'admin') nav('/admin')
      else nav('/estudiante')
    } catch (err) {
      setError('Email o contraseña incorrectos.')
    } finally { setCargando(false) }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    try {
      await resetPassword(form.email)
      setResetMsg('Revisá tu email para restablecer la contraseña.')
    } catch { setError('No se pudo enviar el correo de recuperación.') }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-base)',
      padding: '1rem',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Glow fondo */}
      <div style={{
        position: 'absolute',
        top: '-20%', left: '50%', transform: 'translateX(-50%)',
        width: '600px', height: '600px',
        background: 'radial-gradient(circle, rgba(47,128,237,.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            width: '60px', height: '60px',
            background: 'linear-gradient(135deg, #1a3a6b, #2f80ed)',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: 'var(--glow-primary)',
          }}>
            <BookOpen size={28} color="white" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', marginBottom: '.25rem' }}>
            Portal CEFAEN
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '.85rem' }}>
            Centro de Estudiantes Facultad de Administración, Economía y Negocios - LineAzul
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '2rem' }}>
          {!resetMode ? (
            <form onSubmit={handleLogin}>
              <h2 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Iniciar sesión</h2>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '.82rem', color: 'var(--text-secondary)', marginBottom: '.4rem' }}>
                  Correo electrónico
                </label>
                <input
                  type="email"
                  placeholder="tu@email.com"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '.82rem', color: 'var(--text-secondary)', marginBottom: '.4rem' }}>
                  Contraseña
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={verPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    required
                    style={{ paddingRight: '2.5rem' }}
                  />
                  <button type="button" onClick={() => setVerPass(!verPass)} style={{
                    position: 'absolute', right: '.75rem', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: 'var(--text-muted)', padding: 0,
                  }}>
                    {verPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <p style={{ color: 'var(--danger)', fontSize: '.85rem', marginBottom: '1rem' }}>{error}</p>
              )}

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '.75rem' }}
                disabled={cargando}
              >
                {cargando ? 'Ingresando...' : <><LogIn size={16} /> Ingresar</>}
              </button>

              <button
                type="button"
                onClick={() => setResetMode(true)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '.82rem',
                  display: 'block', margin: '.75rem auto 0', cursor: 'pointer' }}
              >
                ¿Olvidaste tu contraseña?
              </button>

              <p style={{ textAlign: 'center', fontSize: '.82rem', color: 'var(--text-muted)', marginTop: '.5rem' }}>
                ¿No tenés cuenta?{' '}
                <a href="/registro" style={{ color: 'var(--primary-light)' }}>Registrate con tu código</a>
              </p>
            </form>
          ) : (
            <form onSubmit={handleReset}>
              <h2 style={{ fontSize: '1.1rem', marginBottom: '.5rem' }}>Recuperar contraseña</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '.85rem', marginBottom: '1.25rem' }}>
                Te enviaremos un link a tu email.
              </p>
              <input
                type="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                required
                style={{ marginBottom: '1rem' }}
              />
              {resetMsg && <p style={{ color: 'var(--success)', fontSize: '.85rem', marginBottom: '1rem' }}>{resetMsg}</p>}
              {error   && <p style={{ color: 'var(--danger)',  fontSize: '.85rem', marginBottom: '1rem' }}>{error}</p>}
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginBottom: '.75rem' }}>
                Enviar link
              </button>
              <button type="button" className="btn btn-ghost" style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => { setResetMode(false); setError(''); setResetMsg('') }}>
                Volver al login
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
