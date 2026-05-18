import {
  collection, doc, getDoc, addDoc, updateDoc,
  getDocs, query, orderBy, serverTimestamp, increment
} from 'firebase/firestore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { db, auth } from './firebase'

// ── Generar código aleatorio ──────────────────
const generarCodigo = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let codigo = 'FAEN-'
  for (let i = 0; i < 8; i++) {
    if (i === 4) codigo += '-'
    codigo += chars[Math.floor(Math.random() * chars.length)]
  }
  return codigo // Ej: FAEN-ABCD-EF23
}

// ── Crear código (admin) ──────────────────────
export const crearCodigo = async ({ cupo, vencimiento, descripcion }) => {
  const codigo = generarCodigo()
  await addDoc(collection(db, 'codigos_registro'), {
    codigo,
    cupo: parseInt(cupo),
    usados: 0,
    vencimiento: new Date(vencimiento),
    descripcion: descripcion || '',
    activo: true,
    creadoEn: serverTimestamp(),
  })
  return codigo
}

// ── Listar códigos (admin) ────────────────────
export const getCodigos = async () => {
  const q = query(collection(db, 'codigos_registro'), orderBy('creadoEn', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

// ── Desactivar código (admin) ─────────────────
export const desactivarCodigo = (id) =>
  updateDoc(doc(db, 'codigos_registro', id), { activo: false })

// ── Validar código (paso 1 del registro) ─────
export const validarCodigo = async (codigoIngresado) => {
  const q = query(collection(db, 'codigos_registro'))
  const snap = await getDocs(q)
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }))
  const found = docs.find(d => d.codigo === codigoIngresado.toUpperCase().trim())

  if (!found) throw new Error('Código inválido.')
  if (!found.activo) throw new Error('Este código fue desactivado.')

  const venc = found.vencimiento?.toDate ? found.vencimiento.toDate() : new Date(found.vencimiento)
  if (venc < new Date()) throw new Error('Este código está vencido.')
  if (found.usados >= found.cupo) throw new Error('Este código ya alcanzó el cupo máximo.')

  return found // devuelve el doc del código válido
}

// ── Registrar estudiante (paso 2) ─────────────
export const registrarEstudiante = async ({ codigoId, nombre, apellido, dni, carrera, email, password }) => {
  // Crear usuario en Firebase Auth
  const cred = await createUserWithEmailAndPassword(auth, email, password)
  const uid = cred.user.uid

  // Guardar perfil en Firestore
  await addDoc(collection(db, 'usuarios'), {
    uid,
    nombre: `${nombre} ${apellido}`,
    nombre_raw: nombre,
    apellido,
    dni,
    carrera,
    email,
    rol: 'estudiante',
    codigoUsado: codigoId,
    creadoEn: serverTimestamp(),
  })

  // Consumir un lugar del código
  await updateDoc(doc(db, 'codigos_registro', codigoId), {
    usados: increment(1)
  })

  return cred.user
}

// ── Listar estudiantes (admin) ────────────────
export const getEstudiantes = async () => {
  const snap = await getDocs(collection(db, 'usuarios'))
  return snap.docs
    .map(d => ({ id: d.id, ...d.data() }))
    .filter(u => u.rol === 'estudiante')
    .sort((a, b) => (a.apellido || '').localeCompare(b.apellido || ''))
}
