import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'

// Login con email/password
export const loginUsuario = async (email, password) => {
  const cred = await signInWithEmailAndPassword(auth, email, password)
  const perfil = await obtenerPerfil(cred.user.uid)
  return { user: cred.user, perfil }
}

// Logout
export const logout = () => signOut(auth)

// Obtener perfil desde Firestore
export const obtenerPerfil = async (uid) => {
  const ref = doc(db, 'usuarios', uid)
  const snap = await getDoc(ref)
  return snap.exists() ? snap.data() : null
}

// Resetear contraseña
export const resetPassword = (email) => sendPasswordResetEmail(auth, email)

// Observador de sesión
export const onSesionCambia = (callback) => onAuthStateChanged(auth, callback)
