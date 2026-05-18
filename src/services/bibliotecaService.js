import {
  collection, doc, addDoc, getDocs, deleteDoc,
  query, orderBy, where, serverTimestamp
} from 'firebase/firestore'
import { db } from './firebase'

// ── CARRERAS ──────────────────────────────────
export const getCarreras = async () => {
  const q = query(collection(db, 'carreras'), orderBy('nombre'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

export const agregarCarrera = (nombre) =>
  addDoc(collection(db, 'carreras'), { nombre, creadoEn: serverTimestamp() })

export const eliminarCarrera = (id) => deleteDoc(doc(db, 'carreras', id))

// ── MATERIAS ──────────────────────────────────
export const getMaterias = async (carreraId = null, anio = null) => {
  let q = query(collection(db, 'materias'), orderBy('nombre'))
  if (carreraId) q = query(collection(db, 'materias'), where('carreraId', '==', carreraId), orderBy('nombre'))
  const snap = await getDocs(q)
  let result = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  if (anio) result = result.filter(m => m.anio === anio)
  return result
}

export const agregarMateria = ({ nombre, carreraId, carreraNombre, anio }) =>
  addDoc(collection(db, 'materias'), {
    nombre, carreraId, carreraNombre,
    anio: parseInt(anio),
    creadoEn: serverTimestamp()
  })

export const eliminarMateria = (id) => deleteDoc(doc(db, 'materias', id))

// ── BIBLIOTECA ────────────────────────────────
export const getRecursos = async ({ carreraId, anio, materiaId } = {}) => {
  let q = query(collection(db, 'biblioteca'), orderBy('titulo'))
  if (carreraId) q = query(collection(db, 'biblioteca'), where('carreraId', '==', carreraId), orderBy('titulo'))
  const snap = await getDocs(q)
  let result = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  if (anio)      result = result.filter(r => r.anio === parseInt(anio))
  if (materiaId) result = result.filter(r => r.materiaId === materiaId)
  return result
}

// Convierte link de Drive a URL de preview embebible
export const drivePreviewUrl = (url) => {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
  if (match) return `https://drive.google.com/file/d/${match[1]}/preview`
  return url
}

// Convierte link de Drive a URL de descarga directa
export const driveDownloadUrl = (url) => {
  const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/)
  if (match) return `https://drive.google.com/uc?export=download&id=${match[1]}`
  return url
}

export const agregarRecurso = ({ titulo, url, tipo, carreraId, carreraNombre, anio, materiaId, materiaNombre }) =>
  addDoc(collection(db, 'biblioteca'), {
    titulo,
    url,
    tipo: tipo || 'pdf',
    carreraId,
    carreraNombre,
    anio: parseInt(anio),
    materiaId,
    materiaNombre,
    creadoEn: serverTimestamp(),
  })

export const eliminarRecurso = (id) => deleteDoc(doc(db, 'biblioteca', id))
