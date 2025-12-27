# 🤝 Guía de Contribución

¡Gracias por tu interés en contribuir al Sistema de Postes de Fibra Óptica!

## 📋 Código de Conducta

Este proyecto adhiere a un código de conducta. Al participar, se espera que mantengas este código.

## 🚀 Cómo Contribuir

### Reportar Bugs

Si encuentras un bug, por favor crea un issue con:

- **Título descriptivo**
- **Pasos para reproducir**
- **Comportamiento esperado**
- **Comportamiento actual**
- **Screenshots** (si aplica)
- **Versión** del sistema
- **Navegador/OS**

### Sugerir Mejoras

Para sugerir nuevas funcionalidades:

- Describe el problema que resuelve
- Explica la solución propuesta
- Proporciona ejemplos de uso
- Considera alternativas

### Pull Requests

1. **Fork** el repositorio
2. **Crea una rama** para tu feature (`git checkout -b feature/AmazingFeature`)
3. **Commit** tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. **Push** a la rama (`git push origin feature/AmazingFeature`)
5. **Abre un Pull Request**

## 📝 Estándares de Código

### JavaScript/React

- Usar ES6+ syntax
- Componentes funcionales con hooks
- Nombres descriptivos para variables y funciones
- Comentarios para lógica compleja
- Evitar código duplicado

### Commits

Formato de commits:
```
tipo(alcance): descripción corta

Descripción detallada (opcional)

Fixes #123
```

Tipos:
- `feat`: Nueva funcionalidad
- `fix`: Corrección de bug
- `docs`: Documentación
- `style`: Formato, punto y coma, etc
- `refactor`: Refactorización de código
- `test`: Agregar tests
- `chore`: Mantenimiento

Ejemplos:
```
feat(postes): agregar filtro por fecha
fix(auth): corregir validación de token
docs(readme): actualizar guía de instalación
```

### Testing

- Escribir tests para nuevas funcionalidades
- Asegurar que todos los tests pasen
- Mantener cobertura de código > 80%

## 🏗️ Estructura del Proyecto

```
fiber-optic-system/
├── backend/          # API REST
│   ├── src/
│   │   ├── config/   # Configuración
│   │   ├── models/   # Modelos de datos
│   │   ├── controllers/  # Lógica de negocio
│   │   ├── routes/   # Rutas de API
│   │   └── middleware/  # Middleware
│   └── tests/        # Tests del backend
│
└── frontend/         # Aplicación React
    ├── src/
    │   ├── components/  # Componentes React
    │   ├── hooks/    # Hooks personalizados
    │   ├── services/ # Servicios (API, etc)
    │   └── store/    # Estado global
    └── tests/        # Tests del frontend
```

## 🔍 Proceso de Revisión

1. Revisión automática de código
2. Tests automáticos
3. Revisión manual por mantenedores
4. Aprobación y merge

## 📚 Recursos

- [Documentación de React](https://react.dev/)
- [Documentación de Express](https://expressjs.com/)
- [Documentación de PostgreSQL](https://www.postgresql.org/docs/)
- [Documentación de PostGIS](https://postgis.net/documentation/)

## ❓ Preguntas

Si tienes preguntas, puedes:
- Abrir un issue
- Contactar a los mantenedores
- Revisar la documentación

## 📄 Licencia

Al contribuir, aceptas que tus contribuciones se licencien bajo la misma licencia MIT del proyecto.

---

**¡Gracias por contribuir!** 🎉
