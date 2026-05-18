# FAEN — Portal Estudiantil
> React + Vite + Firebase (Auth + Firestore + Hosting)

---

## 1. Instalación

```bash
npm install
```

---

## 2. Configurar Firebase

### 2.1 Crear proyecto en Firebase Console
1. Ir a https://console.firebase.google.com
2. **Crear proyecto** → Nombre: `faen-portal`
3. Habilitar **Authentication** → Método: Email/Contraseña
4. Habilitar **Firestore Database** → Modo producción (reglas abajo)
5. Habilitar **Hosting**

### 2.2 Obtener credenciales
En Firebase Console → ⚙️ Configuración del proyecto → Tus apps → SDK de configuración

Copiá los valores en `src/services/firebase.js`:

```js
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
}
```

---

## 3. Reglas de Firestore

En Firebase Console → Firestore → Reglas:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
  
    // Perfil de usuario: solo el dueño o admin
    match /usuarios/{uid} {
      allow read: if request.auth != null && (request.auth.uid == uid || isAdmin());
      allow write: if isAdmin();
    }
    
    // Contenido público para autenticados
    match /noticias/{id}   { allow read: if request.auth != null; allow write: if isAdmin(); }
    match /eventos/{id}    { allow read: if request.auth != null; allow write: if isAdmin(); }
    match /calendario/{id} { allow read: if request.auth != null; allow write: if isAdmin(); }
    match /biblioteca/{id} { allow read: if request.auth != null; allow write: if isAdmin(); }
    
    // Mensajes: leer los propios o los de "todos"
    match /mensajes/{id} {
      allow read: if request.auth != null && 
        (resource.data.destinatario == request.auth.uid || resource.data.destinatario == 'todos');
      allow write: if isAdmin();
    }
    
    // Configuración global (redes sociales, etc.)
    match /configuracion/{id} { allow read: if request.auth != null; allow write: if isAdmin(); }
    
    function isAdmin() {
      return request.auth != null && 
        get(/databases/$(database)/documents/usuarios/$(request.auth.uid)).data.rol == 'admin';
    }
  }
}
```

---

## 4. Crear usuario administrador

1. En Firebase Console → Authentication → Agregar usuario
   - Email: `admin@faen.edu.ar`
   - Password: (elegís vos)
2. Copiá el **UID** del usuario creado
3. En Firestore → Colección `usuarios` → Nuevo documento con ID = ese UID:

```json
{
  "nombre": "Administrador FAEN",
  "email": "admin@faen.edu.ar",
  "rol": "admin"
}
```

---

## 5. Crear usuario estudiante (ejemplo)

1. Authentication → Agregar usuario: `alumno@faen.edu.ar`
2. Firestore → `usuarios` → documento con el UID:

```json
{
  "nombre": "Juan Pérez",
  "email": "alumno@faen.edu.ar",
  "rol": "estudiante",
  "legajo": "2024001",
  "carrera": "Licenciatura en Administración"
}
```

---

## 6. Estructura de colecciones Firestore

### `noticias`
| Campo      | Tipo      | Descripción           |
|------------|-----------|-----------------------|
| titulo     | string    | Título de la noticia  |
| contenido  | string    | Cuerpo del texto      |
| categoria  | string    | Ej: "Académico"       |
| imagen     | string    | URL de imagen         |
| link       | string    | URL externa opcional  |
| fecha      | timestamp | Fecha de publicación  |

### `eventos`
| Campo       | Tipo      |
|-------------|-----------|
| titulo      | string    |
| descripcion | string    |
| fecha       | timestamp |
| lugar       | string    |
| imagen      | string    |

### `calendario`
| Campo       | Tipo      | Descripción                          |
|-------------|-----------|--------------------------------------|
| titulo      | string    |                                      |
| descripcion | string    |                                      |
| fecha       | timestamp |                                      |
| tipo        | string    | examen / feriado / inscripcion / evento / otro |

### `mensajes`
| Campo       | Tipo      | Descripción                     |
|-------------|-----------|----------------------------------|
| asunto      | string    |                                  |
| cuerpo      | string    |                                  |
| destinatario| string    | UID del estudiante o "todos"     |
| fecha       | timestamp |                                  |
| leido       | boolean   |                                  |

### `biblioteca`
| Campo    | Tipo   | Descripción                       |
|----------|--------|-----------------------------------|
| titulo   | string |                                   |
| url      | string | Link de descarga o visualización  |
| tipo     | string | pdf / video / otro                |
| categoria| string | Apuntes / Libros / Reglamentos... |
| materia  | string | Nombre de la materia              |

### `configuracion/redes`
```json
{
  "links": [
    { "red": "instagram", "usuario": "faen_oficial", "url": "https://instagram.com/..." },
    { "red": "facebook",  "usuario": "FAENoficial",  "url": "https://facebook.com/..." }
  ]
}
```

---

## 7. Desarrollo local

```bash
npm run dev
```

---

## 8. Deploy a Firebase Hosting

```bash
# Instalar Firebase CLI (una sola vez)
npm install -g firebase-tools

# Login
firebase login

# Inicializar (solo la primera vez)
firebase init hosting
# → proyecto: faen-portal
# → public: dist
# → SPA: yes

# Build + deploy
npm run build
firebase deploy --only hosting
```

---

## Estructura del proyecto

```
src/
├── assets/
│   └── global.css          # Design system completo
├── context/
│   └── AuthContext.jsx     # Estado global de sesión
├── services/
│   ├── firebase.js         # Configuración Firebase ← EDITAR
│   ├── authService.js      # Login / logout / perfil
│   └── dataService.js      # CRUD de todas las colecciones
├── pages/
│   ├── Login.jsx
│   ├── estudiante/
│   │   ├── EstudianteLayout.jsx
│   │   ├── Dashboard.jsx
│   │   └── Modulos.jsx     # Noticias, Mensajes, Calendario, Eventos, Biblioteca, Redes
│   └── admin/
│       ├── AdminLayout.jsx
│       ├── AdminDashboard.jsx
│       └── AdminNoticias.jsx  # (base para otros módulos admin)
└── AppRouter.jsx           # Rutas protegidas por rol
```
