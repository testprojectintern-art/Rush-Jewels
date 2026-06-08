import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import { expensesApi } from './expensesApi';

export default function ExpenseFormModal({ isOpen, onClose }) {
    const queryClient = useQueryClient();
    
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            category: 'general',
            amount: '',
            paymentMethod: 'cash',
            description: ''
        }
    });

    const createMutation = useMutation({
        mutationFn: expensesApi.create,
        onSuccess: () => {
            toast.success('Expense recorded successfully');
            queryClient.invalidateQueries(['expenses']);
            queryClient.invalidateQueries(['pos-sessions', 'active']);
            reset();
            onClose();
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to record expense')
    });

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Record Expense" size="md">
            <form onSubmit={handleSubmit(createMutation.mutate)}>
                <div className="p-4 space-y-4">
                    <Input label="Date" type="date" required {...register('date')} />
                    
                    <Select 
                        label="Category" 
                        required 
                        options={[
                            { value: 'meals', label: 'Meals & Entertainment' },
                            { value: 'fuel', label: 'Fuel & Travel' },
                            { value: 'supplies', label: 'Office Supplies' },
                            { value: 'maintenance', label: 'Repairs & Maintenance' },
                            { value: 'general', label: 'General / Other' }
                        ]}
                        {...register('category')}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Amount (LKR)" type="number" step="0.01" required {...register('amount')} />
                        <Select 
                            label="Payment Method" 
                            required 
                            options={[
                                { value: 'cash', label: 'Cash (Deducts from Register)' },
                                { value: 'card', label: 'Card' },
                                { value: 'bank_transfer', label: 'Bank Transfer' }
                            ]}
                            {...register('paymentMethod')}
                        />
                    </div>
                    
                    <Textarea label="Description / Notes" rows={3} {...register('description')} />
                </div>
                
                <div className="flex justify-end gap-2 p-4 border-t bg-gray-50">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" variant="primary" loading={createMutation.isPending}>Record Expense</Button>
                </div>
            </form>
        </Modal>
    );
}
