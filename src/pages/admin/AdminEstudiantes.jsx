import { useEffect, useState } from 'react'
import { Users, Search } from 'lucide-react'
import { getEstudiantes } from '../../services/registroService'

export default function AdminEstudiantes() {
  const [estudiantes, setEstudiantes] = useState([])
  const [cargando, setCargando] = useState(true)
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    getEstudiantes().then(d => { setEstudiantes(d); setCargando(false) })
  }, [])

  const filtrados = estudiantes.filter(e =>
    `${e.nombre} ${e.dni} ${e.carrera} ${e.email}`.toLowerCase().includes(busqueda.toLowerCase())
  )

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem' }}>Estudiantes</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '.25rem' }}>
            {estudiantes.length} estudiante{estudiantes.length !== 1 ? 's' : ''} registrado{estudiantes.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Buscador */}
        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={15} style={{ position: 'absolute', left: '.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            placeholder="Buscar por nombre, DNI..."
            style={{ paddingLeft: '2.2rem' }}
          />
        </div>
      </div>

      {cargando ? <div className="spinner" /> : filtrados.length === 0 ? (
        <div className="empty-state">
          <Users size={48} />
          <h3>{busqueda ? 'No se encontraron resultados' : 'No hay estudiantes registrados aún'}</h3>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="tabla">
            <thead>
              <tr>
                <th>Estudiante</th>
                <th>DNI</th>
                <th>Carrera</th>
                <th>Email</th>
                <th>Registrado</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map(e => {
                const fecha = e.creadoEn?.toDate ? e.creadoEn.toDate() : null
                const iniciales = e.nombre?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'E'
                return (
                  <tr key={e.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
                        <div style={{
                          width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
                          background: 'linear-gradient(135deg, var(--primary-dim), var(--primary))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '.72rem', fontWeight: 700, color: 'white',
                        }}>{iniciales}</div>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{e.nombre}</span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'monospace' }}>{e.dni}</td>
                    <td>
                      <span className="badge badge-primary" style={{ fontSize: '.7rem' }}>
                        {e.carrera?.split(' ').slice(0, 2).join(' ')}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '.85rem' }}>{e.email}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '.82rem' }}>
                      {fecha ? fecha.toLocaleDateString('es-AR') : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
