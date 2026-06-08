import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Receipt } from 'lucide-react';
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

    const { data: expensesData, isLoading } = useQuery({
        queryKey: ['expenses'],
        queryFn: () => expensesApi.list({ limit: 100 }),
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

    const formatCurrency = (val) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(val);

    const columns = [
        { key: 'expenseNumber', label: 'Expense #', render: (row) => <span className="font-mono text-xs">{row.expenseNumber}</span> },
        { key: 'date', label: 'Date', render: (row) => new Date(row.date).toLocaleDateString() },
        { key: 'category', label: 'Category', render: (row) => <span className="font-medium text-gray-900">{row.category}</span> },
        { key: 'amount', label: 'Amount', render: (row) => <span className="font-bold text-red-600">{formatCurrency(row.amount)}</span> },
        { key: 'paymentMethod', label: 'Payment', render: (row) => <Badge className="uppercase text-[10px]">{row.paymentMethod.replace('_', ' ')}</Badge> },
        { key: 'description', label: 'Description', render: (row) => <span className="text-sm text-gray-500">{row.description || '—'}</span> },
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

            <Card>
                {isLoading ? (
                    <div className="py-12 text-center text-gray-500">Loading expenses...</div>
                ) : expenses.length === 0 ? (
                    <EmptyState
                        icon={Receipt}
                        title="No expenses recorded"
                        description="Record your first operating expense or cash payout."
                        action={<Button variant="primary" onClick={() => setIsFormOpen(true)}><Plus size={16} className="mr-1.5" /> Record Expense</Button>}
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
