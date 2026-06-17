import api from '../../api/axios';

export const warrantyClaimsApi = {
    list: async (params = {}) => (await api.get('/warranty-claims', { params })).data,
    getById: async (id) => (await api.get(`/warranty-claims/${id}`)).data,
    create: async (data) => (await api.post('/warranty-claims', data)).data,
    update: async (id, data) => (await api.put(`/warranty-claims/${id}`, data)).data,
    updateStatus: async (id, data) => (await api.patch(`/warranty-claims/${id}/status`, data)).data,
};
