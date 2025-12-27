import api from './api';

export const proyectosAPI = {
    // Obtener todos los proyectos del usuario
    getAll: () => api.get('/proyectos'),

    // Obtener proyecto por ID
    getById: (id) => api.get(`/proyectos/${id}`),

    // Crear proyecto (solo admin)
    create: (data) => api.post('/proyectos', data),

    // Actualizar proyecto (solo admin)
    update: (id, data) => api.put(`/proyectos/${id}`, data),

    // Eliminar proyecto (solo admin)
    delete: (id) => api.delete(`/proyectos/${id}`),

    // Obtener usuarios del proyecto
    getUsers: (proyectoId) => api.get(`/proyectos/${proyectoId}/users`),

    // Asignar usuario a proyecto (solo admin)
    assignUser: (proyectoId, userId, rolProyecto = 'miembro') =>
        api.post(`/proyectos/${proyectoId}/users`, { userId, rolProyecto }),

    // Remover usuario de proyecto (solo admin)
    removeUser: (proyectoId, userId) =>
        api.delete(`/proyectos/${proyectoId}/users/${userId}`),

    // Obtener estadísticas del proyecto
    getStats: (proyectoId) => api.get(`/proyectos/${proyectoId}/stats`)
};
