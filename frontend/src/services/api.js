import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Instancia de Axios configurada
 */
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

/**
 * Interceptor para agregar token JWT a todas las peticiones
 */
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Interceptor para manejar errores de autenticación
 */
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expirado o inválido
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Solo redirigir si NO estamos ya en login
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// ============ AUTH ============

export const authAPI = {
    login: (email, password) =>
        api.post('/auth/login', { email, password }),

    register: (userData) =>
        api.post('/auth/register', userData),

    getMe: () =>
        api.get('/auth/me'),

    logout: () =>
        api.post('/auth/logout')
};

// ============ POSTES ============

export const postesAPI = {
    getAll: (params) =>
        api.get('/postes', { params }),

    getById: (id) =>
        api.get(`/postes/${id}`),

    getNearby: (latitud, longitud, radio = 5) =>
        api.get('/postes/nearby', { params: { latitud, longitud, radio } }),

    create: (posteData) =>
        api.post('/postes', posteData),

    update: (id, posteData) =>
        api.put(`/postes/${id}`, posteData),

    delete: (id) =>
        api.delete(`/postes/${id}`)
};

// ============ FOTOS ============

export const fotosAPI = {
    getByPoste: (posteId) =>
        api.get(`/postes/${posteId}/fotos`),

    upload: (posteId, formData) =>
        api.post(`/postes/${posteId}/fotos`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    uploadPhoto: (posteId, formData) =>
        api.post(`/postes/${posteId}/fotos`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        }),

    delete: (fotoId) =>
        api.delete(`/fotos/${fotoId}`)
};

// ============ USERS ============

export const usersAPI = {
    getAll: () =>
        api.get('/users'),

    create: (userData) =>
        api.post('/users', userData),

    update: (id, userData) =>
        api.put(`/users/${id}`, userData),

    delete: (id) =>
        api.delete(`/users/${id}`)
};

export default api;
