# 🐳 Guía de Despliegue con Docker

Esta guía explica cómo desplegar el sistema completo usando Docker.

## Requisitos

- Docker Desktop instalado
- Docker Compose instalado

## Instalación de Docker

### Windows
1. Descargar Docker Desktop desde https://www.docker.com/products/docker-desktop
2. Ejecutar el instalador
3. Reiniciar el sistema
4. Verificar: `docker --version`

### Linux
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
```

### macOS
1. Descargar Docker Desktop desde https://www.docker.com/products/docker-desktop
2. Instalar la aplicación
3. Verificar: `docker --version`

## Despliegue Rápido

### 1. Clonar el proyecto

```bash
git clone <url-del-repositorio>
cd fiber-optic-system
```

### 2. Configurar variables de entorno (opcional)

Editar `docker-compose.yml` si necesitas cambiar:
- Contraseñas
- Puertos
- JWT Secret

### 3. Iniciar todos los servicios

```bash
docker-compose up -d
```

Esto iniciará:
- PostgreSQL con PostGIS (puerto 5432)
- Backend API (puerto 5000)
- Frontend (puerto 3000)

### 4. Verificar que todo esté corriendo

```bash
docker-compose ps
```

Deberías ver 3 contenedores corriendo.

### 5. Inicializar la base de datos

```bash
# Ejecutar script de inicialización
docker-compose exec backend npm run init-db
```

### 6. Acceder a la aplicación

Abrir navegador en: **http://localhost:3000**

Login:
- Email: admin@fiberoptic.com
- Password: admin123

## Comandos Útiles

### Ver logs
```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo frontend
docker-compose logs -f frontend

# Solo base de datos
docker-compose logs -f postgres
```

### Detener servicios
```bash
docker-compose stop
```

### Iniciar servicios
```bash
docker-compose start
```

### Reiniciar servicios
```bash
docker-compose restart
```

### Detener y eliminar contenedores
```bash
docker-compose down
```

### Detener y eliminar TODO (incluye volúmenes)
```bash
docker-compose down -v
```

## Acceso a la Base de Datos

### Desde el host
```bash
psql -h localhost -U postgres -d fiber_optic_db
# Password: postgres123
```

### Desde Docker
```bash
docker-compose exec postgres psql -U postgres -d fiber_optic_db
```

## Backup de la Base de Datos

### Crear backup
```bash
docker-compose exec postgres pg_dump -U postgres fiber_optic_db > backup.sql
```

### Restaurar backup
```bash
docker-compose exec -T postgres psql -U postgres fiber_optic_db < backup.sql
```

## Actualizar la Aplicación

### 1. Detener servicios
```bash
docker-compose down
```

### 2. Actualizar código
```bash
git pull
```

### 3. Reconstruir imágenes
```bash
docker-compose build
```

### 4. Iniciar servicios
```bash
docker-compose up -d
```

## Producción

Para producción, modificar `docker-compose.yml`:

1. **Cambiar contraseñas:**
```yaml
POSTGRES_PASSWORD: contraseña_segura_aqui
DB_PASSWORD: contraseña_segura_aqui
JWT_SECRET: clave_jwt_super_segura_aqui
```

2. **Configurar dominio:**
```yaml
CORS_ORIGIN: https://tu-dominio.com
```

3. **Usar volúmenes nombrados para persistencia**

4. **Configurar HTTPS con nginx-proxy o Traefik**

## Solución de Problemas

### Error: "Port already in use"
Cambiar puertos en `docker-compose.yml`:
```yaml
ports:
  - "5001:5000"  # Backend
  - "3001:80"    # Frontend
```

### Error: "Cannot connect to database"
Verificar que el contenedor de postgres esté corriendo:
```bash
docker-compose ps postgres
docker-compose logs postgres
```

### Reiniciar desde cero
```bash
docker-compose down -v
docker-compose up -d
docker-compose exec backend npm run init-db
```

## Monitoreo

### Ver uso de recursos
```bash
docker stats
```

### Ver contenedores
```bash
docker ps
```

### Inspeccionar contenedor
```bash
docker inspect fiber_optic_backend
```

## Seguridad

- ✅ Cambiar todas las contraseñas por defecto
- ✅ Usar HTTPS en producción
- ✅ Configurar firewall
- ✅ Actualizar imágenes regularmente
- ✅ Hacer backups periódicos

## Ventajas de Docker

- ✅ Instalación en un comando
- ✅ Mismo entorno en desarrollo y producción
- ✅ Fácil escalabilidad
- ✅ Aislamiento de servicios
- ✅ Fácil actualización

---

**¡El sistema está listo para usar con Docker!** 🐳
