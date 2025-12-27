# Backend - Sistema de Documentación de Postes

Backend API REST para el sistema de documentación de postes de fibra óptica.

## 🚀 Tecnologías

- **Node.js** + **Express** - Framework web
- **PostgreSQL** + **PostGIS** - Base de datos con capacidades geoespaciales
- **JWT** - Autenticación
- **Multer** + **Sharp** - Upload y procesamiento de imágenes
- **bcryptjs** - Encriptación de contraseñas

## 📋 Requisitos Previos

- Node.js 18+ instalado
- PostgreSQL 15+ instalado con extensión PostGIS
- npm o yarn

## ⚙️ Configuración

### 1. Instalar dependencias

```bash
cd backend
npm install
```

### 2. Configurar variables de entorno

Copia el archivo `.env.example` a `.env` y configura las variables:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales de PostgreSQL:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fiber_optic_db
DB_USER=postgres
DB_PASSWORD=tu_password
JWT_SECRET=tu_secret_key_segura
```

### 3. Crear base de datos

En PostgreSQL, crea la base de datos:

```sql
CREATE DATABASE fiber_optic_db;
```

### 4. Inicializar base de datos

Ejecuta el script de inicialización para crear tablas y usuario admin:

```bash
npm run init-db
```

Esto creará:
- Tablas: `users`, `postes`, `fotos`
- Extensión PostGIS
- Usuario admin por defecto:
  - Email: `admin@fiberoptic.com`
  - Password: `admin123`

## 🏃 Ejecutar

### Modo desarrollo (con auto-reload)

```bash
npm run dev
```

### Modo producción

```bash
npm start
```

El servidor estará disponible en `http://localhost:5000`

## 📚 Endpoints de la API

### Autenticación (`/api/auth`)

- `POST /api/auth/login` - Login de usuario
- `POST /api/auth/register` - Registro (solo admin)
- `GET /api/auth/me` - Obtener usuario actual
- `POST /api/auth/logout` - Logout

### Postes (`/api/postes`)

- `GET /api/postes` - Listar postes (con filtros)
- `GET /api/postes/nearby` - Buscar postes cercanos
- `GET /api/postes/:id` - Obtener poste específico
- `POST /api/postes` - Crear nuevo poste
- `PUT /api/postes/:id` - Actualizar poste
- `DELETE /api/postes/:id` - Eliminar poste (solo admin)

### Fotos (`/api`)

- `POST /api/postes/:id/fotos` - Subir foto a un poste
- `GET /api/postes/:id/fotos` - Obtener fotos de un poste
- `DELETE /api/fotos/:id` - Eliminar foto

### Usuarios (`/api/users`) - Solo Admin

- `GET /api/users` - Listar usuarios
- `PUT /api/users/:id` - Actualizar usuario
- `DELETE /api/users/:id` - Eliminar usuario

## 🔐 Autenticación

Todas las rutas (excepto login) requieren autenticación mediante JWT.

Incluye el token en el header:

```
Authorization: Bearer <token>
```

## 👥 Roles

- **admin**: Acceso completo
- **supervisor**: Visualización y reportes
- **tecnico**: Captura de datos

## 📁 Estructura del Proyecto

```
backend/
├── src/
│   ├── config/          # Configuración (DB, Auth)
│   ├── models/          # Modelos de datos
│   ├── controllers/     # Lógica de negocio
│   ├── routes/          # Rutas de la API
│   ├── middleware/      # Middleware (auth, upload)
│   └── server.js        # Servidor principal
├── uploads/             # Archivos subidos
├── package.json
└── .env
```

## 🗺️ Búsqueda Geoespacial

El sistema utiliza PostGIS para búsquedas geoespaciales eficientes:

```
GET /api/postes/nearby?latitud=4.6097&longitud=-74.0817&radio=5
```

Retorna postes dentro de un radio de 5km.

## 🛠️ Desarrollo

Para reiniciar la base de datos:

```bash
npm run init-db
```

**⚠️ Advertencia**: Esto eliminará todos los datos existentes.
