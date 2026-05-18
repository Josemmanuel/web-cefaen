import {
  collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query, orderBy, limit, where, serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'

// ── Noticias ──────────────────────────────────
export const getNoticias = async (cantidad = 10) => {
  const q = query(collection(db, 'noticias'), orderBy('fecha', 'desc'), limit(cantidad))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const agregarNoticia = (data) =>
  addDoc(collection(db, 'noticias'), { ...data, fecha: serverTimestamp() })

export const eliminarNoticia = (id) => deleteDoc(doc(db, 'noticias', id))

// ── Eventos ───────────────────────────────────
export const getEventos = async () => {
  const q = query(collection(db, 'eventos'), orderBy('fecha', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const agregarEvento = (data) =>
  addDoc(collection(db, 'eventos'), { ...data, creadoEn: serverTimestamp() })

export const eliminarEvento = (id) => deleteDoc(doc(db, 'eventos', id))

// ── Calendario Académico ──────────────────────
export const getCalendario = async () => {
  const q = query(collection(db, 'calendario'), orderBy('fecha', 'asc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const agregarCalendario = (data) =>
  addDoc(collection(db, 'calendario'), { ...data, creadoEn: serverTimestamp() })

export const eliminarCalendario = (id) => deleteDoc(doc(db, 'calendario', id))

// ── Mensajes (del admin a estudiantes) ───────
export const getMensajes = async (uid) => {
  const q = query(
    collection(db, 'mensajes'),
    where('destinatario', 'in', [uid, 'todos']),
    orderBy('fecha', 'desc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const enviarMensaje = (data) =>
  addDoc(collection(db, 'mensajes'), { ...data, fecha: serverTimestamp(), leido: false })

// ── Biblioteca Virtual ────────────────────────
export const getBiblioteca = async (categoria = null) => {
  let q = categoria
    ? query(collection(db, 'biblioteca'), where('categoria', '==', categoria), orderBy('titulo'))
    : query(collection(db, 'biblioteca'), orderBy('titulo'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const agregarRecurso = (data) =>
  addDoc(collection(db, 'biblioteca'), { ...data, creadoEn: serverTimestamp() })

export const eliminarRecurso = (id) => deleteDoc(doc(db, 'biblioteca', id))

// ── Redes Sociales (links configurable por admin) ──
export const getRedesSociales = async () => {
  const snap = await getDoc(doc(db, 'configuracion', 'redes'))
  return snap.exists() ? snap.data().links : []
}

export const actualizarRedesSociales = (links) =>
  updateDoc(doc(db, 'configuracion', 'redes'), { links })

// ── Usuarios ──────────────────────────────────
export const getUsuarios = async () => {
  const snap = await getDocs(collection(db, 'usuarios'))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}
