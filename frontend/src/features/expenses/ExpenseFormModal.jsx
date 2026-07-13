import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import Modal from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Textarea from '../../components/ui/Textarea';
import { expensesApi } from './expensesApi';

const DEFAULT_CATEGORIES = [
    'Meals & Entertainment',
    'Fuel & Travel',
    'Office Supplies',
    'Repairs & Maintenance',
    'Salary',
    'Utilities',
    'Rent',
    'Marketing',
    'Bank',
    'General / Other',
];

export default function ExpenseFormModal({ isOpen, onClose }) {
    const queryClient = useQueryClient();
    const [categoryInput, setCategoryInput] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
    const categoryRef = useRef(null);

    const { data: categoriesData } = useQuery({
        queryKey: ['expense-categories'],
        queryFn: expensesApi.getCategories,
        staleTime: 30000,
    });

    const dbCategories = categoriesData?.data || [];
    const allCategories = [...new Set([...DEFAULT_CATEGORIES, ...dbCategories])];

    const filteredSuggestions = categoryInput
        ? allCategories.filter(c => c.toLowerCase().includes(categoryInput.toLowerCase()))
        : allCategories;

    const { register, handleSubmit, reset } = useForm({
        defaultValues: {
            date: new Date().toISOString().split('T')[0],
            amount: '',
            paymentMethod: 'cash',
            description: ''
        }
    });

    // Close suggestions on outside click
    useEffect(() => {
        const handler = (e) => {
            if (categoryRef.current && !categoryRef.current.contains(e.target)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const createMutation = useMutation({
        mutationFn: expensesApi.create,
        onSuccess: () => {
            toast.success('Expense recorded successfully');
            queryClient.invalidateQueries({ queryKey: ['expenses'] });
            queryClient.invalidateQueries({ queryKey: ['expense-categories'] });
            queryClient.invalidateQueries({ queryKey: ['pos-sessions', 'active'] });
            reset();
            setCategoryInput('');
            onClose();
        },
        onError: (err) => toast.error(err.response?.data?.message || 'Failed to record expense')
    });

    const onSubmit = (data) => {
        if (!categoryInput.trim()) {
            toast.error('Please enter a category');
            return;
        }
        createMutation.mutate({ ...data, category: categoryInput.trim() });
    };

    const handleKeyDown = (e) => {
        if (!showSuggestions) return;

        const showAddOption = categoryInput && !allCategories.some(c => c.toLowerCase() === categoryInput.toLowerCase());
        const totalOptions = filteredSuggestions.length + (showAddOption ? 1 : 0);

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActiveSuggestionIndex((prev) => (prev + 1) % totalOptions);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActiveSuggestionIndex((prev) => (prev - 1 + totalOptions) % totalOptions);
        } else if (e.key === 'Enter') {
            if (activeSuggestionIndex >= 0 && activeSuggestionIndex < totalOptions) {
                e.preventDefault();
                if (activeSuggestionIndex < filteredSuggestions.length) {
                    const selectedCat = filteredSuggestions[activeSuggestionIndex];
                    setCategoryInput(selectedCat);
                }
                setShowSuggestions(false);
                setActiveSuggestionIndex(-1);
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setShowSuggestions(false);
            setActiveSuggestionIndex(-1);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Record Expense" size="md">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="p-4 space-y-4">
                    <Input label="Date" type="date" required {...register('date')} />

                    {/* Category with autocomplete */}
                    <div className="relative" ref={categoryRef}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-500 text-sm"
                            placeholder="Type or select a category..."
                            value={categoryInput}
                            onChange={(e) => {
                                setCategoryInput(e.target.value);
                                setShowSuggestions(true);
                                setActiveSuggestionIndex(-1);
                            }}
                            onFocus={() => {
                                setShowSuggestions(true);
                                setActiveSuggestionIndex(-1);
                            }}
                            onKeyDown={handleKeyDown}
                            autoComplete="off"
                        />
                        {showSuggestions && filteredSuggestions.length > 0 && (
                            <div className="absolute left-0 right-0 top-full z-50 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden max-h-52 overflow-y-auto">
                                {filteredSuggestions.map((cat, idx) => (
                                    <button
                                        key={cat}
                                        type="button"
                                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors border-b last:border-0 font-medium text-gray-700 ${
                                            idx === activeSuggestionIndex ? 'bg-primary-50' : 'hover:bg-primary-50'
                                        }`}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            setCategoryInput(cat);
                                            setShowSuggestions(false);
                                        }}
                                    >
                                        {cat}
                                    </button>
                                ))}
                                {categoryInput && !allCategories.some(c => c.toLowerCase() === categoryInput.toLowerCase()) && (
                                    <button
                                        type="button"
                                        className={`w-full text-left px-4 py-2.5 text-sm transition-colors text-green-700 font-semibold flex items-center gap-2 ${
                                            activeSuggestionIndex === filteredSuggestions.length ? 'bg-green-50' : 'hover:bg-green-50'
                                        }`}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            setShowSuggestions(false);
                                        }}
                                    >
                                        <span className="text-green-500">+</span> Add &quot;{categoryInput}&quot; as new category
                                    </button>
                                )}
                            </div>
                        )}
                        {!categoryInput && (
                            <p className="text-xs text-gray-400 mt-1">Type a category or pick from suggestions</p>
                        )}
                    </div>

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
