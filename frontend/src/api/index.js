import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Applications API
export const applicationsApi = {
    getAll: async (params = {}) => {
        const response = await api.get('/applications', { params });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/applications/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/applications', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/applications/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/applications/${id}`);
        return response.data;
    },

    updateDocuments: async (id, documents) => {
        const response = await api.put(`/applications/${id}/documents`, documents);
        return response.data;
    },

    getStats: async () => {
        const response = await api.get('/applications/stats/summary');
        return response.data;
    },
};

// Preparation API
export const preparationApi = {
    getAll: async (type = null) => {
        const params = type ? { type } : {};
        const response = await api.get('/preparation', { params });
        return response.data;
    },

    getStats: async () => {
        const response = await api.get('/preparation/stats');
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/preparation', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/preparation/${id}`, data);
        return response.data;
    },

    toggle: async (id) => {
        const response = await api.patch(`/preparation/${id}/toggle`);
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/preparation/${id}`);
        return response.data;
    },
};

// Research API
export const researchApi = {
    getAll: async (params = {}) => {
        const response = await api.get('/research', { params });
        return response.data;
    },

    getStats: async () => {
        const response = await api.get('/research/stats');
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/research', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/research/${id}`, data);
        return response.data;
    },

    updateStatus: async (id, status) => {
        const response = await api.patch(`/research/${id}/status`, { status });
        return response.data;
    },

    delete: async (id) => {
        const response = await api.delete(`/research/${id}`);
        return response.data;
    },
};

export default api;
