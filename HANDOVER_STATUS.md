# 🚀 Documentación de Estado del Proyecto (Handover) v2.0

Este documento detalla el estado actual del proyecto `fiber-optic-system`. Sirve como guía maestra para futuras sesiones de desarrollo.

## ⚡ Guía de Inicio para IA / Desarrollador

Esta sección contiene los **comandos exactos** que se deben ejecutar para arrancar el sistema, considerando posibles restricciones de seguridad en Windows (PowerShell).

### 1. Iniciar el Backend
La IA debe abrir una terminal en la carpeta `backend` y ejecutar:
```bash
# Opción Estándar
npm run dev

# ⚠️ SI FALLA por políticas de ejecución (UnauthorizedAccess/PSSecurityException):
cmd /c "npm run dev"
```

### 2. Iniciar el Frontend
La IA debe abrir **otra** terminal en la carpeta `frontend` y ejecutar:
```bash
# Opción Estándar
npm run dev

# ⚠️ SI FALLA por políticas de ejecución:
cmd /c "npm run dev"
```

---

## 📋 Guía de Instalación Completa

### 1. Prerrequisitos
- **Node.js**: v16+ (Recomendado v18+).
- **PostgreSQL**: Debe estar ejecutándose. Asegúrate de tener una base de datos creada (ej. `fiber_optic_db`) y configurar las credenciales en un archivo `.env` en la carpeta `backend/`.

### 2. Instalación de Dependencias
Debes instalar dependencias en ambos directorios (`backend` y `frontend`).

```bash
# Terminal 1: Backend
cd backend
npm install
# NOTA: Si ves errores de PowerShell, usa "cmd /c npm install"

# Terminal 2: Frontend
cd frontend
npm install
```

### 3. Configuración de Base de Datos
Si es la primera vez que ejecutas el proyecto, inicializa la base de datos:

```bash
cd backend
npm run init-db
# Esto crea las tablas: users, postes, fotos, proyectos, usuarios_proyectos
# Y crea el usuario admin por defecto.
```

### 4. Arrancar Servidores
Necesitas dos terminales abiertas.

**Terminal 1 (Backend - Puerto 3000):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend - Puerto 5173 aprox.):**
```bash
cd frontend
npm run dev
```

### 5. Acceso al Sistema
- **URL Frontend**: `http://localhost:5173` (Revisar consola de Vite para puerto exacto).
- **Credenciales por defecto**:
  - **Email**: `admin@fiberoptic.com`
  - **Contraseña**: `admin123`

---

## 🛠️ Referencia Técnica

### Stack Tecnológico
**Backend**:
- **Framework**: Express (Node.js).
- **Base de Datos**: PostgreSQL (driver `pg`).
- **Autenticación**: JWT (`jsonwebtoken`) + `bcryptjs`.
- **Archivos**: `multer` (subidas) + `sharp` (procesamiento imagen).
- **Reportes**: `pdfkit` (PDF), `exceljs` (Excel).
- **Pruebas**: `vitest` + `supertest`.

**Frontend**:
- **Framework**: React + Vite.
- **Estilos**: Tailwind CSS (Previamente CSS plano, en proceso de migración total).
- **Mapas**: Leaflet / React-Leaflet.
- **Offline**: Dexie.js (IndexedDB) + PWA (`vite-plugin-pwa`).
- **Estado**: Context API + Hooks.

### API Endpoints Disponibles
Base URL: `http://localhost:3000/api`

| Recurso | Rutas Principales | Descripción |
| :--- | :--- | :--- |
| **Auth** | `/auth/login`, `/auth/register` | Autenticación y registro. |
| **Users** | `/users` (GET, POST, PUT, DELETE) | Gestión CRUD de usuarios (Solo Admin). |
| **Postes** | `/postes` (GET, POST), `/postes/:id` | Gestión de postes de fibra óptica. |
| **Fotos** | `/postes/:id/fotos` | Subida y listado de fotos de postes. |
| **Proyectos**| `/proyectos` | Gestión de agrupaciones de trabajo. |
| **Reportes**| `/reportes/pdf`, `/reportes/excel` | Descarga de informes. |

---

## 🔍 Estado del Código (Modernización vs Legacy)

### ✅ Componentes Modernizados (Fase Reciente)
El proyecto ha sido **completamente modernizado** a los nuevos estándares.
- **Frontend**:
  - `src/components/auth/Login.jsx`: UI Premium, Tailwind.
  - `src/components/dashboard/Dashboard.jsx`: UI Premium, Charts, Tailwind.
  - `src/components/proyectos/ProyectoList.jsx`: UI Premium, Tailwind.
  - `src/components/postes/PosteForm.jsx`: UI Premium, Validaciones, Tailwind.
  - `src/components/admin/UserManagement.jsx`: UI Premium, Tablas Responsive, Tailwind (Updated Phase 4).
  - `src/components/map/MapView.jsx`: UI Premium, Sidebar glassmorphism, Tailwind (Updated Phase 4).
  - `src/components/common/ErrorBoundary.jsx`: Manejo de crashes.
- **Backend**:
  - `src/controllers/usersController.js`: Error handling robusto.
  - `src/controllers/reportesController.js`: Error handling robusto, Optimizado (Updated Phase 4).
  - `src/middleware/errorHandler.js`: Manejo global de errores.
  - `src/models/Poste.js`: Auditado (Seguro contra SQL Injection).

### ⚠️ Código Legado / Pendiente
**¡Ninguno!** 🎉 Todos los componentes principales han sido revisados y modernizados.

---

---

## 📝 Instrucciones para la Próxima IA
1.  **Objetivo**: Continuar la migración a Tailwind CSS.
2.  **Punto de Partida**: Abrir `src/components/auth/Login.jsx` y refactorizar para eliminar `Login.css` y usar clases de utilidad (Tailwind), similar a lo hecho en `ProyectoList.jsx`.
3.  **Seguridad**: Revisar `src/controllers/usersController.js` para integrar `middleware/validation.js` y `middleware/errorHandler.js`.

---

## 🕵️ Detalles de Configuración e Infraestructura "Oculta"

Esta sección revela configuraciones internas que no son obvias a simple vista.

### 1. Variables de Entorno (.env)
El backend espera estas variables. Si no existen, usa los valores por defecto listados:
```ini
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fiber_optic_db
DB_USER=postgres
DB_PASSWORD=[REQUERIDO]
JWT_SECRET=[REQUERIDO_PARA_PROD] # Por defecto usa una string insegura si no se define
MAX_FILE_SIZE=10485760 # 10MB por defecto
```

### 2. Almacenamiento de Archivos (Images)
- **Ruta**: `backend/uploads/` (Se crea automáticamente al iniciar si no existe).
- **Lógica**: Manejado por `middleware/upload.middleware.js`.
- **Restricciones**: Solo imágenes (jpg, png, webp) de hasta 10MB.
- **Nombres**: Se generan con timestamp + random suffix (`foto-170123...png`).

### 3. Base de Datos Offline (Frontend)
El frontend usa **Dexie.js** (Wrapper de IndexedDB) con este esquema versionado (`src/store/db.js`):
- **Nombre DB**: `FiberOpticDB`
- **Versión Actual**: 2
- **Tablas**:
    - `postes`: Datos de postes creados offline.
    - `fotos`: Blobs de imágenes (antes de subir).
    - `syncQueue`: Cola de operaciones pendientes (`CREATE_POSTE`, `UPLOAD_FOTO`) con sistema de reintentos (`retries`).

### 4. Flujo de Sincronización
1.  El usuario guarda un poste offline -> Se guarda en Dexie (`postes` table) y se añade una tarea a `syncQueue`.
2.  `services/offlineSync.js` detecta conexión.
3.  Procesa `syncQueue` en orden cronológico.
4.  Si falla, incrementa `retries`. Si éxito, elimina de la cola.

### 5. Configuración de Base de Datos (Backend)
- Usa `pg.Pool` con límite de **20 conexiones concurrentes** (`max: 20`).
- Timeout de inactividad: 30s.
- Las consultas usan `pool.query()` directamente (sin ORM completo, estilo "Raw SQL").

