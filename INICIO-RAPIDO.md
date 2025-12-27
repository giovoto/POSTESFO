# 🚀 INICIO RÁPIDO - 3 Pasos

## ✅ Requisitos Previos

- [x] Node.js instalado ✅ (lo estás instalando ahora)
- [ ] PostgreSQL 15+ con PostGIS instalado
- [ ] Base de datos `fiber_optic_db` creada

---

## 📋 Pasos para Ejecutar

### 1️⃣ Instalar Dependencias

**Doble click en:** `1-instalar-dependencias.bat`

Esto instalará todas las dependencias de npm en backend y frontend.

⏱️ Tiempo estimado: 3-5 minutos

---

### 2️⃣ Configurar PostgreSQL

#### A. Instalar PostgreSQL (si no lo tienes)

1. Descargar desde: https://www.postgresql.org/download/windows/
2. Durante instalación, anotar la contraseña del usuario `postgres`
3. En Stack Builder, seleccionar **PostGIS**

#### B. Crear Base de Datos

Abrir PowerShell o CMD:

```powershell
# Conectarse a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE fiber_optic_db;

# Salir
\q
```

#### C. Configurar Credenciales

1. Abrir: `backend\.env`
2. Editar la línea:
   ```
   DB_PASSWORD=TU_PASSWORD_DE_POSTGRES_AQUI
   ```
3. Guardar el archivo

---

### 3️⃣ Inicializar Base de Datos

**Doble click en:** `2-inicializar-db.bat`

Esto creará todas las tablas y el usuario admin.

⏱️ Tiempo estimado: 10 segundos

---

### 4️⃣ Iniciar la Aplicación

**Doble click en:** `3-iniciar.bat`

Esto iniciará:
- ✅ Backend en puerto 5000
- ✅ Frontend en puerto 5173
- ✅ Abrirá el navegador automáticamente

---

## 🎯 Acceder a la Aplicación

**URL:** http://localhost:5173

**Credenciales:**
- Email: `admin@fiberoptic.com`
- Password: `admin123`

---

## ❌ Solución de Problemas

### Error: "Cannot connect to database"

**Solución:**
1. Verificar que PostgreSQL esté corriendo
2. Verificar credenciales en `backend\.env`
3. Verificar que la base de datos `fiber_optic_db` exista

### Error: "Port already in use"

**Solución:**
- Cerrar otras aplicaciones que usen los puertos 5000 o 5173
- O cambiar los puertos en los archivos `.env`

### Error: "npm not found"

**Solución:**
1. Cerrar y volver a abrir PowerShell/CMD
2. Verificar: `node --version` y `npm --version`
3. Si no funciona, reiniciar el PC

---

## 🎬 Resumen Visual

```
1. Doble click → 1-instalar-dependencias.bat
   ↓
2. Configurar backend\.env con password de PostgreSQL
   ↓
3. Doble click → 2-inicializar-db.bat
   ↓
4. Doble click → 3-iniciar.bat
   ↓
5. ¡Listo! Aplicación corriendo en http://localhost:5173
```

---

## 📝 Notas Importantes

- **NO CERRAR** las ventanas de Backend y Frontend mientras uses la app
- Para detener: Cerrar las ventanas de Backend y Frontend
- Para reiniciar: Ejecutar `3-iniciar.bat` de nuevo

---

## 🆘 ¿Necesitas Ayuda?

Revisa los archivos:
- `guia_instalacion.md` - Guía detallada
- `como_ejecutar.md` - Instrucciones completas
- `README.md` - Documentación general

---

**¡Todo listo para usar!** 🎉
