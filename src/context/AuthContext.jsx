import { createContext, useContext, useEffect, useState } from 'react'
import { onSesionCambia, obtenerPerfil } from '../services/authService'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [perfil, setPerfil] = useState(null)
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    const unsub = onSesionCambia(async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        const p = await obtenerPerfil(firebaseUser.uid)
        setPerfil(p)
      } else {
        setUser(null)
        setPerfil(null)
      }
      setCargando(false)
    })
    return unsub
  }, [])

  const esAdmin = perfil?.rol === 'admin'
  const esEstudiante = perfil?.rol === 'estudiante'

  return (
    <AuthContext.Provider value={{ user, perfil, cargando, esAdmin, esEstudiante }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
