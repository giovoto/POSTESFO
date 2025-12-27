#!/bin/bash

# Script de instalación completa del sistema
# Ejecutar: bash install.sh

echo "🚀 Instalando Sistema de Postes de Fibra Óptica"
echo "================================================"
echo ""

# Verificar Node.js
echo "📦 Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado"
    echo "Por favor instalar Node.js 18+ desde https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v)
echo "✅ Node.js $NODE_VERSION instalado"
echo ""

# Verificar PostgreSQL
echo "🗄️  Verificando PostgreSQL..."
if ! command -v psql &> /dev/null; then
    echo "⚠️  PostgreSQL no encontrado en PATH"
    echo "Asegúrate de tener PostgreSQL 15+ instalado"
else
    PSQL_VERSION=$(psql --version)
    echo "✅ $PSQL_VERSION"
fi
echo ""

# Instalar dependencias del backend
echo "📦 Instalando dependencias del backend..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Error al instalar dependencias del backend"
    exit 1
fi
echo "✅ Dependencias del backend instaladas"
echo ""

# Instalar dependencias del frontend
echo "📦 Instalando dependencias del frontend..."
cd ../frontend
npm install
if [ $? -ne 0 ]; then
    echo "❌ Error al instalar dependencias del frontend"
    exit 1
fi
echo "✅ Dependencias del frontend instaladas"
echo ""

# Configurar variables de entorno
echo "⚙️  Configurando variables de entorno..."
cd ../backend
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Archivo .env creado en backend"
    echo "⚠️  IMPORTANTE: Editar backend/.env con tus credenciales de PostgreSQL"
else
    echo "ℹ️  Archivo .env ya existe en backend"
fi

cd ../frontend
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Archivo .env creado en frontend"
else
    echo "ℹ️  Archivo .env ya existe en frontend"
fi
echo ""

# Instrucciones finales
echo "✅ Instalación completada!"
echo ""
echo "📝 Próximos pasos:"
echo "1. Editar backend/.env con tus credenciales de PostgreSQL"
echo "2. Crear base de datos: psql -U postgres -c 'CREATE DATABASE fiber_optic_db;'"
echo "3. Inicializar DB: cd backend && npm run init-db"
echo "4. Iniciar backend: cd backend && npm run dev"
echo "5. Iniciar frontend: cd frontend && npm run dev"
echo ""
echo "📚 Ver guia_instalacion.md para más detalles"
