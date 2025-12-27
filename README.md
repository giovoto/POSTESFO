# 🗼 Sistema de Documentación de Postes - Fibra Óptica

Sistema web progresivo (PWA) para documentar y gestionar postes de fibra óptica con geolocalización, captura de fotos y modo offline.

![Estado](https://img.shields.io/badge/Estado-Producción%20Ready-success)
![Versión](https://img.shields.io/badge/Versión-1.0.0-blue)
![Licencia](https://img.shields.io/badge/Licencia-MIT-green)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación](#-instalación)
- [Configuración](#️-configuración)
- [Uso](#-uso)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [API Endpoints](#-api-endpoints)
- [Capturas de Pantalla](#-capturas-de-pantalla)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## ✨ Características

### Funcionalidades Principales

- ✅ **Autenticación JWT** con 3 roles (Admin, Supervisor, Técnico)
- ✅ **Captura de postes** con geolocalización GPS automática
- ✅ **Upload de fotos** (panorámica y detalle) con thumbnails
- ✅ **Mapa interactivo** con Leaflet para visualizar postes
- ✅ **Búsqueda geoespacial** con PostGIS (postes cercanos)
- ✅ **Modo offline** con IndexedDB y sincronización automática
- ✅ **Reportes PDF/Excel** con filtros personalizados
- ✅ **Diseño responsive** para móvil y desktop
- ✅ **PWA** instalable en dispositivos móviles

### Características Técnicas

- 🔐 Autenticación segura con JWT
- 🗺️ Búsquedas geoespaciales eficientes con PostGIS
- 📱 Progressive Web App (PWA)
- 💾 Almacenamiento offline con IndexedDB
- 🔄 Sincronización automática en segundo plano
- 📊 Generación de reportes PDF y Excel
- 🎨 Interfaz moderna con Tailwind CSS
- ⚡ Optimización de imágenes con Sharp

---

## 🚀 Tecnologías

### Backend
- **Node.js 18+** - Runtime de JavaScript
- **Express 4** - Framework web
- **PostgreSQL 15+** - Base de datos
- **PostGIS** - Extensión geoespacial
- **JWT** - Autenticación
- **Multer + Sharp** - Procesamiento de imágenes
- **ExcelJS + PDFKit** - Generación de reportes

### Frontend
- **React 18** - Librería UI
- **Vite** - Build tool
- **React Router** - Enrutamiento
- **Leaflet** - Mapas interactivos
- **Dexie.js** - IndexedDB wrapper
- **Axios** - Cliente HTTP
- **Tailwind CSS** - Estilos

---

## 📋 Requisitos Previos

Antes de instalar, asegúrate de tener:

- **Node.js 18+** y npm instalados
- **PostgreSQL 15+** instalado
- **PostGIS** extensión para PostgreSQL
- Git (opcional)

### Instalación de PostgreSQL con PostGIS

#### Windows
```bash
# Descargar PostgreSQL desde https://www.postgresql.org/download/windows/
# Durante la instalación, seleccionar PostGIS en Stack Builder
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib postgis
```

#### macOS
```bash
brew install postgresql postgis
```

---

## 🔧 Instalación

### 1. Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd fiber-optic-system
```

### 2. Instalar dependencias del Backend

```bash
cd backend
npm install
```

### 3. Instalar dependencias del Frontend

```bash
cd ../frontend
npm install
```

---

## ⚙️ Configuración

### Backend

1. **Crear base de datos en PostgreSQL**

```sql
-- Conectarse a PostgreSQL
psql -U postgres

-- Crear base de datos
CREATE DATABASE fiber_optic_db;

-- Salir
\q
```

2. **Configurar variables de entorno**

```bash
cd backend
cp .env.example .env
```

Editar `.env` con tus credenciales:

```env
PORT=5000

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fiber_optic_db
DB_USER=postgres
DB_PASSWORD=TU_PASSWORD_AQUI

# JWT
JWT_SECRET=tu_secret_key_super_segura_cambiar_en_produccion
JWT_EXPIRES_IN=7d

# Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=10485760

# CORS
CORS_ORIGIN=http://localhost:5173

# Entorno
NODE_ENV=development
```

3. **Inicializar base de datos**

```bash
npm run init-db
```

Esto creará:
- Tablas: `users`, `postes`, `fotos`
- Extensión PostGIS
- Usuario admin por defecto:
  - **Email:** admin@fiberoptic.com
  - **Password:** admin123

### Frontend

1. **Configurar variables de entorno**

```bash
cd frontend
cp .env.example .env
```

Editar `.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🏃 Uso

### Iniciar el Backend

```bash
cd backend
npm run dev
```

El servidor estará disponible en `http://localhost:5000`

### Iniciar el Frontend

```bash
cd frontend
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Acceder a la Aplicación

1. Abrir navegador en `http://localhost:5173`
2. Iniciar sesión con:
   - **Email:** admin@fiberoptic.com
   - **Password:** admin123

---

## 📁 Estructura del Proyecto

```
fiber-optic-system/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuración (DB, Auth)
│   │   ├── models/          # Modelos de datos
│   │   ├── controllers/     # Lógica de negocio
│   │   ├── routes/          # Rutas de la API
│   │   ├── middleware/      # Middleware (auth, upload)
│   │   └── server.js        # Servidor principal
│   ├── uploads/             # Archivos subidos
│   ├── package.json
│   ├── .env.example
│   └── README.md
│
└── frontend/
    ├── src/
    │   ├── components/      # Componentes React
    │   │   ├── auth/        # Login, ProtectedRoute
    │   │   ├── dashboard/   # Dashboard
    │   │   ├── postes/      # Gestión de postes
    │   │   ├── map/         # Mapa interactivo
    │   │   ├── reportes/    # Generación de reportes
    │   │   ├── admin/       # Gestión de usuarios
    │   │   └── common/      # Componentes comunes
    │   ├── hooks/           # Hooks personalizados
    │   ├── services/        # API y sincronización
    │   ├── store/           # IndexedDB
    │   ├── App.jsx
    │   └── main.jsx
    ├── public/
    ├── package.json
    ├── vite.config.js
    └── .env.example
```

---

## 📡 API Endpoints

### Autenticación
```
POST   /api/auth/login       - Login de usuario
POST   /api/auth/register    - Registro (solo admin)
GET    /api/auth/me          - Obtener usuario actual
POST   /api/auth/logout      - Logout
```

### Postes
```
GET    /api/postes           - Listar postes (con filtros)
GET    /api/postes/nearby    - Buscar postes cercanos
GET    /api/postes/:id       - Obtener poste específico
POST   /api/postes           - Crear nuevo poste
PUT    /api/postes/:id       - Actualizar poste
DELETE /api/postes/:id       - Eliminar poste (solo admin)
```

### Fotos
```
POST   /api/postes/:id/fotos - Subir foto a un poste
GET    /api/postes/:id/fotos - Obtener fotos de un poste
DELETE /api/fotos/:id        - Eliminar foto
```

### Reportes
```
GET    /api/reportes/pdf     - Generar reporte PDF
GET    /api/reportes/excel   - Generar reporte Excel
GET    /api/reportes/stats   - Obtener estadísticas
```

### Usuarios (Admin)
```
GET    /api/users            - Listar usuarios
PUT    /api/users/:id        - Actualizar usuario
DELETE /api/users/:id        - Eliminar usuario
```

---

## 👥 Roles y Permisos

### Admin
- ✅ Acceso completo al sistema
- ✅ Gestión de usuarios
- ✅ Generación de reportes
- ✅ CRUD de postes
- ✅ Eliminación de postes

### Supervisor
- ✅ Visualización de postes
- ✅ Generación de reportes
- ✅ Visualización de mapa
- ❌ Gestión de usuarios
- ❌ Eliminación de postes

### Técnico
- ✅ Captura de nuevos postes
- ✅ Edición de sus propios postes
- ✅ Upload de fotos
- ✅ Visualización de mapa
- ❌ Reportes
- ❌ Gestión de usuarios

---

## 🔒 Seguridad

- Autenticación JWT con tokens seguros
- Contraseñas hasheadas con bcryptjs
- Validación de roles en backend
- Protección CORS configurada
- Sanitización de inputs
- Límites de tamaño de archivos

---

## 📱 Modo Offline

El sistema funciona completamente offline:

1. **Captura offline:** Los datos se guardan en IndexedDB
2. **Sincronización automática:** Al recuperar conexión, los datos se sincronizan
3. **Indicadores visuales:** Badge muestra items pendientes
4. **Background sync:** Service Workers sincronizan en segundo plano

---

## 📊 Reportes

### Generar Reportes

1. Ir a **Reportes** en el menú
2. Seleccionar filtros (estado, material, fechas)
3. Click en **Descargar PDF** o **Descargar Excel**

### Contenido de Reportes

- Resumen de postes
- Listado completo con todos los datos
- Estadísticas por estado y material
- Filtros aplicados

---

## 🛠️ Desarrollo

### Scripts Disponibles

#### Backend
```bash
npm run dev      # Modo desarrollo con auto-reload
npm start        # Modo producción
npm run init-db  # Inicializar base de datos
```

#### Frontend
```bash
npm run dev      # Modo desarrollo
npm run build    # Build para producción
npm run preview  # Preview del build
```

---

## 🐛 Solución de Problemas

### Error: "Cannot connect to database"
- Verificar que PostgreSQL esté corriendo
- Verificar credenciales en `.env`
- Verificar que la base de datos exista

### Error: "PostGIS extension not found"
- Instalar PostGIS: `CREATE EXTENSION postgis;`
- Verificar instalación: `SELECT PostGIS_version();`

### Error: "Port already in use"
- Cambiar puerto en `.env` (backend)
- Cambiar puerto en `vite.config.js` (frontend)

### Problemas con geolocalización
- Usar HTTPS en producción
- Permitir permisos de ubicación en el navegador
- Verificar que el dispositivo tenga GPS

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT.

---

## 👨‍💻 Autor

Desarrollado para la gestión de redes de fibra óptica.

---

## 🙏 Agradecimientos

- Leaflet por los mapas interactivos
- PostGIS por las capacidades geoespaciales
- React y Vite por el excelente DX

---

## 📞 Soporte

Para reportar bugs o solicitar features, por favor crear un issue en el repositorio.

---

**¡Gracias por usar el Sistema de Documentación de Postes!** 🗼📍
