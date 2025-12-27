# 🚀 Guía de Despliegue en Vercel

Esta guía te ayudará a desplegar tu aplicación (Frontend y Backend) en Vercel para realizar pruebas en línea.

## ⚠️ REQUISITO CRÍTICO: Base de Datos

Vercel es una plataforma "Serverless" y **NO puede conectarse a tu base de datos local** (`localhost`).
Para que el backend funcione en la nube, necesitas una base de datos PostgreSQL en la nube.

**Opción recomendada (Gratis y rápida):**
1. Crea una cuenta en **[Neon Tech](https://neon.tech)** o **[Supabase](https://supabase.com)**.
2. Crea un nuevo proyecto/database.
3. Copia la "Connection String" (URL de conexión), se verá algo como:
   `postgres://usuario:password@host.aws.neon.tech/nombredb?sslmode=require`

---

## 📦 Paso 1: Preparar el Repositorio

Asegúrate de que todo tu código esté subido a un repositorio de **GitHub**.

1. Si no lo has hecho, inicializa git y sube el código:
   ```bash
   git init
   git add .
   git commit -m "Preparando deploy"
   # Agrega tu remoto y haz push
   ```

---

## 🛠️ Paso 2: Desplegar el Backend

Vamos a desplegar el backend primero para obtener su URL.

1. Entra a **[Vercel Dashboard](https://vercel.com/dashboard)**.
2. Click en **"Add New..."** -> **"Project"**.
3. Importa tu repositorio de GitHub.
4. **Configuración del Proyecto:**
   - **Framework Preset:** `Other`
   - **Root Directory:** `backend` (Click en Edit y selecciona la carpeta backend)
   - **Environment Variables:** Agrega las siguientes:
     - `DATABASE_URL`: Pegar la URL de tu base de datos nube (Neon/Supabase).
     - `JWT_SECRET`: `tu_secreto_super_seguro`
     - `NODE_ENV`: `production`
5. Click **Deploy**.

Cuando termine, Vercel te dará una URL (ej: `https://fiber-optic-backend.vercel.app`).
**Copia esta URL.**

---

## 🎨 Paso 3: Desplegar el Frontend

Ahora desplegamos el frontend conectado a ese backend.

1. Vuelve al Dashboard de Vercel.
2. Click **"Add New..."** -> **"Project"**.
3. Importa **EL MISMO repositorio** de nuevo.
4. **Configuración del Proyecto:**
   - **Framework Preset:** `Vite`
   - **Root Directory:** `frontend` (Click en Edit y selecciona la carpeta frontend)
   - **Environment Variables:**
     - `VITE_API_URL`: `https://tu-backend-url.vercel.app/api`
     *(Asegúrate de agregar `/api` al final)*
5. Click **Deploy**.

---

## ✅ Paso 4: Inicializar la Base de Datos

Como es una base de datos nueva en la nube, estará vacía. Necesitas crear las tablas.

Puedes hacerlo conectándote a ella con tu herramienta local (pgAdmin, DBeaver) usando la URL de conexión de Neon/Supabase y ejecutando el script `backend/database/init_schema.sql` (si lo tienes) o simplemente dejando que la aplicación corra (si tienes auto-migración).

*Nota: En este proyecto, revisa `backend/src/config/initDatabase.js`. Puedes ejecutar este script localmente apuntando a la base de datos de producción:*

1. En tu PC, edita temporalmente el archivo `.env` del backend.
2. Cambia `DB_USER`, `DB_HOST`, etc., por los datos de Neon/Supabase.
3. Ejecuta: `npm run init-db` (desde la carpeta backend).
4. Restaura tu `.env` local.

---

## 🎉 ¡Listo!

Ahora puedes entrar a la URL de tu Frontend en Vercel y probar la aplicación desde cualquier dispositivo.
