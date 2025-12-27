# 📡 Documentación de la API

API REST para el Sistema de Postes de Fibra Óptica

**Base URL:** `http://localhost:5000/api`

---

## 🔐 Autenticación

Todas las rutas (excepto login) requieren autenticación mediante JWT.

**Header requerido:**
```
Authorization: Bearer <token>
```

---

## 📍 Endpoints

### Autenticación

#### POST /auth/login
Login de usuario

**Request:**
```json
{
  "email": "admin@fiberoptic.com",
  "password": "admin123"
}
```

**Response (200):**
```json
{
  "message": "Login exitoso",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "admin@fiberoptic.com",
    "nombre": "Administrador",
    "rol": "admin"
  }
}
```

#### POST /auth/register
Registro de nuevo usuario (solo admin)

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "email": "tecnico@example.com",
  "password": "password123",
  "nombre": "Juan Pérez",
  "rol": "tecnico"
}
```

**Response (201):**
```json
{
  "message": "Usuario creado exitosamente",
  "user": {
    "id": "uuid",
    "email": "tecnico@example.com",
    "nombre": "Juan Pérez",
    "rol": "tecnico",
    "activo": true,
    "created_at": "2024-12-26T10:00:00.000Z"
  }
}
```

#### GET /auth/me
Obtener usuario actual

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "user": {
    "id": "uuid",
    "email": "admin@fiberoptic.com",
    "nombre": "Administrador",
    "rol": "admin",
    "activo": true,
    "created_at": "2024-12-26T10:00:00.000Z"
  }
}
```

---

### Postes

#### GET /postes
Listar postes con filtros y paginación

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 50)
- `estado` (string, optional)
- `material` (string, optional)
- `search` (string, optional)

**Example:** `/postes?page=1&limit=10&estado=operativo`

**Response (200):**
```json
{
  "postes": [
    {
      "id": "uuid",
      "nombre": "Poste 001",
      "direccion": "Calle Principal #123",
      "latitud": 4.60971,
      "longitud": -74.08175,
      "estado": "operativo",
      "material": "concreto",
      "altura": 12.5,
      "numero_serie": "SN-12345",
      "tipo_mantenimiento": "preventivo",
      "observaciones": "En buen estado",
      "created_by_nombre": "Administrador",
      "created_at": "2024-12-26T10:00:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "totalPages": 10
}
```

#### GET /postes/:id
Obtener poste específico

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "poste": {
    "id": "uuid",
    "nombre": "Poste 001",
    "direccion": "Calle Principal #123",
    "latitud": 4.60971,
    "longitud": -74.08175,
    "estado": "operativo",
    "material": "concreto",
    "altura": 12.5,
    "numero_serie": "SN-12345",
    "tipo_mantenimiento": "preventivo",
    "observaciones": "En buen estado",
    "created_by": "uuid",
    "created_by_nombre": "Administrador",
    "created_by_email": "admin@fiberoptic.com",
    "created_at": "2024-12-26T10:00:00.000Z",
    "updated_at": "2024-12-26T10:00:00.000Z"
  }
}
```

#### GET /postes/nearby
Buscar postes cercanos

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `latitud` (number, required)
- `longitud` (number, required)
- `radio` (number, default: 5) - Radio en kilómetros

**Example:** `/postes/nearby?latitud=4.60971&longitud=-74.08175&radio=10`

**Response (200):**
```json
{
  "postes": [
    {
      "id": "uuid",
      "nombre": "Poste 001",
      "latitud": 4.60971,
      "longitud": -74.08175,
      "distancia_km": 0.5,
      "estado": "operativo",
      "material": "concreto"
    }
  ]
}
```

#### POST /postes
Crear nuevo poste

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "nombre": "Poste 002",
  "direccion": "Avenida 123 #45-67",
  "latitud": 4.60971,
  "longitud": -74.08175,
  "estado": "operativo",
  "material": "concreto",
  "altura": 15.0,
  "numero_serie": "SN-67890",
  "tipo_mantenimiento": "preventivo",
  "observaciones": "Nuevo poste instalado"
}
```

**Response (201):**
```json
{
  "message": "Poste creado exitosamente",
  "poste": {
    "id": "uuid",
    "nombre": "Poste 002",
    ...
  }
}
```

#### PUT /postes/:id
Actualizar poste

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "estado": "mantenimiento",
  "observaciones": "Requiere revisión"
}
```

**Response (200):**
```json
{
  "message": "Poste actualizado exitosamente",
  "poste": {
    "id": "uuid",
    ...
  }
}
```

#### DELETE /postes/:id
Eliminar poste (solo admin)

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Poste eliminado exitosamente"
}
```

---

### Fotos

#### POST /postes/:id/fotos
Subir foto a un poste

**Headers:** 
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Form Data:**
- `foto` (file, required) - Archivo de imagen
- `tipo` (string, required) - "panoramica" o "detalle"

**Response (201):**
```json
{
  "message": "Foto subida exitosamente",
  "foto": {
    "id": "uuid",
    "poste_id": "uuid",
    "tipo": "panoramica",
    "url": "/uploads/foto-123456.jpg",
    "thumbnail_url": "/uploads/thumbnails/thumb-foto-123456.jpg",
    "filename": "foto-123456.jpg",
    "size": 1024000,
    "created_at": "2024-12-26T10:00:00.000Z"
  }
}
```

#### GET /postes/:id/fotos
Obtener fotos de un poste

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "fotos": [
    {
      "id": "uuid",
      "poste_id": "uuid",
      "tipo": "panoramica",
      "url": "/uploads/foto-123456.jpg",
      "thumbnail_url": "/uploads/thumbnails/thumb-foto-123456.jpg",
      "created_at": "2024-12-26T10:00:00.000Z"
    }
  ]
}
```

#### DELETE /fotos/:id
Eliminar foto

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "message": "Foto eliminada exitosamente"
}
```

---

### Reportes

#### GET /reportes/pdf
Generar reporte PDF

**Headers:** `Authorization: Bearer <token>`

**Roles permitidos:** admin, supervisor

**Query Parameters:**
- `estado` (string, optional)
- `material` (string, optional)
- `fecha_inicio` (date, optional)
- `fecha_fin` (date, optional)

**Example:** `/reportes/pdf?estado=operativo&material=concreto`

**Response:** Archivo PDF descargable

#### GET /reportes/excel
Generar reporte Excel

**Headers:** `Authorization: Bearer <token>`

**Roles permitidos:** admin, supervisor

**Query Parameters:**
- `estado` (string, optional)
- `material` (string, optional)
- `fecha_inicio` (date, optional)
- `fecha_fin` (date, optional)

**Response:** Archivo Excel descargable

#### GET /reportes/stats
Obtener estadísticas

**Headers:** `Authorization: Bearer <token>`

**Roles permitidos:** admin, supervisor

**Response (200):**
```json
{
  "stats": {
    "total": 150,
    "por_estado": {
      "operativo": 120,
      "mantenimiento": 20,
      "dañado": 10
    },
    "por_material": {
      "concreto": 100,
      "metal": 30,
      "madera": 20
    },
    "altura_promedio": 12.5
  }
}
```

---

### Usuarios (Admin)

#### GET /users
Listar usuarios

**Headers:** `Authorization: Bearer <token>`

**Roles permitidos:** admin

**Response (200):**
```json
{
  "users": [
    {
      "id": "uuid",
      "email": "admin@fiberoptic.com",
      "nombre": "Administrador",
      "rol": "admin",
      "activo": true,
      "created_at": "2024-12-26T10:00:00.000Z"
    }
  ]
}
```

#### PUT /users/:id
Actualizar usuario

**Headers:** `Authorization: Bearer <token>`

**Roles permitidos:** admin

**Request:**
```json
{
  "nombre": "Juan Pérez Actualizado",
  "rol": "supervisor",
  "activo": true
}
```

**Response (200):**
```json
{
  "message": "Usuario actualizado exitosamente",
  "user": {
    "id": "uuid",
    ...
  }
}
```

#### DELETE /users/:id
Eliminar usuario

**Headers:** `Authorization: Bearer <token>`

**Roles permitidos:** admin

**Response (200):**
```json
{
  "message": "Usuario eliminado exitosamente"
}
```

---

## 🔒 Códigos de Estado

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

## 🛡️ Seguridad

- Todas las contraseñas se hashean con bcryptjs
- Tokens JWT con expiración de 7 días
- Validación de roles en backend
- Protección CORS
- Límite de tamaño de archivos: 10MB

---

## 📝 Notas

- Las coordenadas usan el sistema WGS84 (SRID 4326)
- Las fechas están en formato ISO 8601
- Los UUIDs son generados automáticamente
- Las imágenes se procesan y optimizan automáticamente
