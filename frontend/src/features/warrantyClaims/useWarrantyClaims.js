import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { warrantyClaimsApi } from './warrantyClaimsApi';

export const useWarrantyClaims = (filters = {}) => {
    return useQuery({
        queryKey: ['warranty-claims', filters],
        queryFn: () => warrantyClaimsApi.list(filters),
        placeholderData: (prev) => prev,
    });
};

export const useWarrantyClaim = (id) => {
    return useQuery({
        queryKey: ['warranty-claim', id],
        queryFn: () => warrantyClaimsApi.getById(id),
        enabled: !!id,
    });
};

export const useCreateWarrantyClaim = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: warrantyClaimsApi.create,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['warranty-claims'] });
            toast.success('Warranty claim registered successfully');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to register warranty claim'),
    });
};

export const useUpdateWarrantyClaim = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }) => warrantyClaimsApi.update(id, data),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['warranty-claims'] });
            toast.success('Warranty claim details updated');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to update details'),
    });
};

export const useUpdateWarrantyClaimStatus = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status, notes }) => warrantyClaimsApi.updateStatus(id, { status, notes }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['warranty-claims'] });
            qc.invalidateQueries({ queryKey: ['warranty-claim'] });
            toast.success('Status updated successfully');
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to update status'),
    });
};
