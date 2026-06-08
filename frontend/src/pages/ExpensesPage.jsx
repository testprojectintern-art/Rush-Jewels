import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Receipt, Search, Filter, X } from 'lucide-react';
import toast from 'react-hot-toast';

import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import ExpenseFormModal from '../features/expenses/ExpenseFormModal';
import { expensesApi } from '../features/expenses/expensesApi';

export default function ExpensesPage() {
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [deletingExpense, setDeletingExpense] = useState(null);
    const queryClient = useQueryClient();

    // Filters
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

    const [filters, setFilters] = useState({
        startDate: '',
        endDate: '',
        category: '',
        page: 1,
        limit: 50,
    });

    const { data: expensesData, isLoading } = useQuery({
        queryKey: ['expenses', filters],
        queryFn: () => expensesApi.list({
            ...filters,
            startDate: filters.startDate || undefined,
            endDate: filters.endDate || undefined,
            category: filters.category || undefined,
        }),
    });

    const { data: categoriesData } = useQuery({
        queryKey: ['expense-categories'],
        queryFn: expensesApi.getCategories,
        staleTime: 30000,
    });

    const deleteMutation = useMutation({
        mutationFn: expensesApi.delete,
        onSuccess: () => {
            toast.success('Expense deleted');
            queryClient.invalidateQueries(['expenses']);
            queryClient.invalidateQueries(['pos-sessions', 'active']);
            setDeletingExpense(null);
        },
    });

    const expenses = expensesData?.data || [];
    const total = expensesData?.total || 0;
    const allCategories = categoriesData?.data || [];

    const formatCurrency = (val) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(val);

    const totalAmount = expenses.reduce((s, e) => s + (e.amount || 0), 0);

    const clearFilters = () => {
        setFilters({ startDate: '', endDate: '', category: '', page: 1, limit: 50 });
    };

    const hasFilters = filters.startDate || filters.endDate || filters.category;

    const columns = [
        { key: 'expenseNumber', label: 'Expense #', render: (row) => <span className="font-mono text-xs">{row.expenseNumber}</span> },
        { key: 'date', label: 'Date', render: (row) => new Date(row.date).toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: '2-digit' }) },
        {
            key: 'category', label: 'Category',
            render: (row) => (
                <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 cursor-pointer hover:bg-indigo-100 transition"
                    onClick={() => setFilters(f => ({ ...f, category: row.category }))}
                    title="Filter by this category"
                >
                    {row.category}
                </span>
            )
        },
        { key: 'amount', label: 'Amount', render: (row) => <span className="font-bold text-red-600">{formatCurrency(row.amount)}</span> },
        { key: 'paymentMethod', label: 'Payment', render: (row) => <Badge className="uppercase text-[10px]">{row.paymentMethod.replace('_', ' ')}</Badge> },
        { key: 'description', label: 'Description', render: (row) => <span className="text-sm text-gray-500">{row.description || row.reference || '—'}</span> },
        {
            key: 'actions',
            label: 'Actions',
            width: '80px',
            render: (row) => (
                <button onClick={() => setDeletingExpense(row)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded">
                    <Trash2 size={16} />
                </button>
            )
        }
    ];

    return (
        <div>
            <PageHeader
                title="Expenses"
                description="Track operating expenses and cash drawer payouts"
                actions={
                    <Button variant="primary" onClick={() => setIsFormOpen(true)}>
                        <Plus size={16} className="mr-1.5" /> Record Expense
                    </Button>
                }
            />

            {/* Summary Card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded-xl border p-4">
                    <p className="text-xs text-gray-500 font-medium">Showing Expenses</p>
                    <p className="text-2xl font-black text-gray-800">{expenses.length}</p>
                </div>
                <div className="bg-white rounded-xl border p-4">
                    <p className="text-xs text-gray-500 font-medium">Total Records</p>
                    <p className="text-2xl font-black text-gray-800">{total}</p>
                </div>
                <div className="bg-red-50 rounded-xl border border-red-100 p-4">
                    <p className="text-xs text-red-600 font-medium">Total Amount (shown)</p>
                    <p className="text-2xl font-black text-red-700">{formatCurrency(totalAmount)}</p>
                </div>
            </div>

            <Card>
                {/* Filters */}
                <div className="p-4 border-b border-gray-200 flex flex-wrap gap-3 items-end">
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-600">From Date</label>
                        <input
                            type="date"
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
                            value={filters.startDate}
                            onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value, page: 1 }))}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs font-medium text-gray-600">To Date</label>
                        <input
                            type="date"
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200"
                            value={filters.endDate}
                            onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value, page: 1 }))}
                        />
                    </div>
                    <div className="flex flex-col gap-1 min-w-[180px]">
                        <label className="text-xs font-medium text-gray-600">Category</label>
                        <select
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-200 bg-white"
                            value={filters.category}
                            onChange={(e) => setFilters(f => ({ ...f, category: e.target.value, page: 1 }))}
                        >
                            <option value="">All Categories</option>
                            {allCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                    {hasFilters && (
                        <Button variant="outline" size="sm" onClick={clearFilters} className="h-[38px] mt-auto flex items-center gap-1.5 text-red-600 border-red-200 hover:bg-red-50">
                            <X size={14} /> Clear Filters
                        </Button>
                    )}
                    <div className="ml-auto mt-auto">
                        <Button variant="outline" size="sm" onClick={() => setFilters(f => ({
                            ...f,
                            startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
                            endDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0],
                        }))} className="h-[38px] text-xs">
                            This Month
                        </Button>
                    </div>
                </div>

                {isLoading ? (
                    <div className="py-12 text-center text-gray-500">Loading expenses...</div>
                ) : expenses.length === 0 ? (
                    <EmptyState
                        icon={Receipt}
                        title="No expenses found"
                        description={hasFilters ? 'Try adjusting your filters' : 'Record your first operating expense or cash payout.'}
                        action={!hasFilters && <Button variant="primary" onClick={() => setIsFormOpen(true)}><Plus size={16} className="mr-1.5" /> Record Expense</Button>}
                    />
                ) : (
                    <Table columns={columns} data={expenses} />
                )}
            </Card>

            <ExpenseFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} />

            <ConfirmDialog
                isOpen={!!deletingExpense}
                onClose={() => setDeletingExpense(null)}
                onConfirm={() => deleteMutation.mutate(deletingExpense._id)}
                title="Delete Expense"
                message="Are you sure you want to delete this expense? If it was a cash expense, it will be refunded to the active cash register."
                confirmText="Delete"
                variant="danger"
                loading={deleteMutation.isPending}
            />
        </div>
    );
}
