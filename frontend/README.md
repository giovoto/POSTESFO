# Frontend - Sistema de Postes

Aplicación web progresiva (PWA) para la gestión de postes de fibra óptica.

## 🚀 Inicio Rápido

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar en modo desarrollo
npm run dev

# Build para producción
npm run build
```

## 📋 Variables de Entorno

Crear archivo `.env` con:

```env
VITE_API_URL=http://localhost:5000/api
```

## 🎨 Características

- ✅ React 18 con Vite
- ✅ PWA con modo offline
- ✅ Autenticación JWT
- ✅ Geolocalización GPS
- ✅ Captura de fotos
- ✅ Mapa interactivo con Leaflet
- ✅ Sincronización automática
- ✅ Diseño responsive

## 📁 Estructura

```
src/
├── components/      # Componentes React
│   ├── auth/        # Login, ProtectedRoute
│   ├── dashboard/   # Dashboard principal
│   ├── postes/      # Gestión de postes
│   ├── map/         # Mapa interactivo
│   ├── reportes/    # Generación de reportes
│   └── common/      # Componentes comunes
├── hooks/           # Hooks personalizados
├── services/        # API y sincronización
├── store/           # IndexedDB
└── App.jsx          # Componente principal
```

## 🔧 Scripts

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build para producción
- `npm run preview` - Preview del build

## 📱 PWA

La aplicación es instalable en dispositivos móviles y funciona offline.

## 🗺️ Mapas

Utiliza Leaflet para visualización de postes en mapa interactivo.

## 💾 Almacenamiento Offline

Usa IndexedDB (Dexie.js) para almacenar datos offline y sincronizar automáticamente.
