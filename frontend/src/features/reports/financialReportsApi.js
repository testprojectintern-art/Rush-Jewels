import api from '../../api/axios';

export const financialReportsApi = {
    getProfitAndLoss: (params) => api.get('/financial-reports/profit-and-loss', { params }),
};
