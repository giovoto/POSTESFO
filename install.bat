@echo off
REM Script de instalación para Windows
REM Ejecutar: install.bat

echo ========================================
echo  Sistema de Postes de Fibra Optica
echo  Script de Instalacion - Windows
echo ========================================
echo.

REM Verificar Node.js
echo Verificando Node.js...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js no esta instalado
    echo Por favor instalar Node.js 18+ desde https://nodejs.org/
    pause
    exit /b 1
)

node -v
echo Node.js instalado correctamente
echo.

REM Verificar npm
echo Verificando npm...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm no esta disponible
    pause
    exit /b 1
)

npm -v
echo npm instalado correctamente
echo.

REM Instalar dependencias del backend
echo ========================================
echo Instalando dependencias del backend...
echo ========================================
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Fallo al instalar dependencias del backend
    pause
    exit /b 1
)
echo Backend: Dependencias instaladas correctamente
echo.

REM Instalar dependencias del frontend
echo ========================================
echo Instalando dependencias del frontend...
echo ========================================
cd ..\frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Fallo al instalar dependencias del frontend
    pause
    exit /b 1
)
echo Frontend: Dependencias instaladas correctamente
echo.

REM Configurar variables de entorno
echo ========================================
echo Configurando variables de entorno...
echo ========================================
cd ..\backend
if not exist .env (
    copy .env.example .env
    echo Archivo .env creado en backend
    echo IMPORTANTE: Editar backend\.env con tus credenciales
) else (
    echo Archivo .env ya existe en backend
)

cd ..\frontend
if not exist .env (
    copy .env.example .env
    echo Archivo .env creado en frontend
) else (
    echo Archivo .env ya existe en frontend
)
echo.

REM Instrucciones finales
echo ========================================
echo  Instalacion completada!
echo ========================================
echo.
echo Proximos pasos:
echo 1. Editar backend\.env con tus credenciales de PostgreSQL
echo 2. Crear base de datos en PostgreSQL
echo 3. Ejecutar: cd backend ^&^& npm run init-db
echo 4. Iniciar backend: cd backend ^&^& npm run dev
echo 5. Iniciar frontend: cd frontend ^&^& npm run dev
echo.
echo Ver guia_instalacion.md para mas detalles
echo.
pause
