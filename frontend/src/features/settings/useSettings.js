import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from './settingsApi';
import { useAuthStore } from '../../store/authStore';

export const useCompanySettings = () => {
    const isAuthenticated = useAuthStore(state => state.isAuthenticated);
    return useQuery({
        queryKey: ['company-settings'],
        queryFn: settingsApi.getCompanySettings,
        enabled: isAuthenticated,
    });
};

export const useUpdateCompanySettings = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: settingsApi.updateCompanySettings,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['company-settings'] });
        },
    });
};

export const useDbStats = () => {
    return useQuery({
        queryKey: ['db-stats'],
        queryFn: settingsApi.getDbStats,
    });
};
