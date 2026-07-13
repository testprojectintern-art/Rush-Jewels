import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Landmark, ArrowUpRight, Wallet, History, FileText, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import api from '../api/axios';

export default function BankDepositsPage() {
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        bankAccountId: '',
        amount: '',
        reference: '',
        notes: '',
        posSessionId: 'none'
    });

    // 1. Fetch active cashier register session
    const { data: activeSessionData, isLoading: isLoadingSession } = useQuery({
        queryKey: ['pos-sessions', 'active'],
        queryFn: async () => {
            const { data } = await api.get('/pos-sessions/active');
            return data;
        }
    });

    // 2. Fetch recent POS sessions list to link/tally closed or active registers
    const { data: recentSessionsData, isLoading: isLoadingRecent } = useQuery({
        queryKey: ['pos-sessions', 'list-recent-deposits'],
        queryFn: async () => {
            const { data } = await api.get('/pos-sessions', { params: { limit: 20 } });
            return data;
        }
    });

    // 3. Fetch all bank accounts
    const { data: accountsData, isLoading: isLoadingAccounts } = useQuery({
        queryKey: ['bank-accounts'],
        queryFn: async () => {
            const { data } = await api.get('/bank-accounts');
            return data;
        }
    });

    // 4. Fetch bank deposits history
    const { data: depositsData, isLoading: isLoadingDeposits } = useQuery({
        queryKey: ['bank-deposits'],
        queryFn: async () => {
            const { data } = await api.get('/bank-deposits');
            return data;
        }
    });

    // 5. Create bank deposit mutation
    const createMutation = useMutation({
        mutationFn: async (payload) => {
            const res = await api.post('/bank-deposits', payload);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bank-deposits'] });
            queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
            queryClient.invalidateQueries({ queryKey: ['pos-sessions', 'active'] });
            queryClient.invalidateQueries({ queryKey: ['pos-sessions', 'list-recent-deposits'] });
            toast.success('Cash deposit recorded successfully');
            closeModal();
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to record deposit');
        }
    });

    // 6. Delete/Reverse bank deposit mutation
    const deleteMutation = useMutation({
        mutationFn: async (id) => {
            const res = await api.delete(`/bank-deposits/${id}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['bank-deposits'] });
            queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
            queryClient.invalidateQueries({ queryKey: ['pos-sessions', 'active'] });
            queryClient.invalidateQueries({ queryKey: ['pos-sessions', 'list-recent-deposits'] });
            toast.success('Deposit reversed successfully');
        },
        onError: (err) => {
            toast.error(err.response?.data?.message || 'Failed to reverse deposit');
        }
    });

    const activeSession = activeSessionData?.data;
    const recentSessions = recentSessionsData?.data || [];
    const accounts = accountsData?.data || [];
    const deposits = depositsData?.data || [];

    // Helper functions for calculation
    const fmt = (n) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR' }).format(n || 0);

    const getRegisterCash = (sessionObj) => {
        if (!sessionObj) return 0;
        return (sessionObj.openingBalance || 0) + (sessionObj.cashSales || 0) - (sessionObj.cashExpenses || 0) - (sessionObj.bankDeposits || 0);
    };

    const registerCash = getRegisterCash(activeSession);
    const totalBankBalance = accounts.reduce((acc, curr) => acc + (curr.currentBalance || 0), 0);

    // Find the selected POS session if any
    const selectedSession = formData.posSessionId && formData.posSessionId !== 'none'
        ? (recentSessions.find(s => s._id === formData.posSessionId) || (activeSession?._id === formData.posSessionId ? activeSession : null))
        : null;

    const selectedSessionCash = selectedSession ? getRegisterCash(selectedSession) : 0;

    const openModal = () => {
        setFormData({
            bankAccountId: '',
            amount: '',
            reference: '',
            notes: '',
            posSessionId: activeSession ? activeSession._id : 'none'
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFormData({ bankAccountId: '', amount: '', reference: '', notes: '', posSessionId: 'none' });
    };

    const handleSubmit = () => {
        if (!formData.bankAccountId || !formData.amount) {
            return toast.error('Please select a bank account and enter an amount');
        }
        const amt = parseFloat(formData.amount);
        if (isNaN(amt) || amt <= 0) {
            return toast.error('Please enter a valid amount');
        }

        if (formData.posSessionId && formData.posSessionId !== 'none') {
            if (amt > selectedSessionCash) {
                return toast.error(`Insufficient cash in selected register. Available: ${fmt(selectedSessionCash)}`);
            }
        }

        createMutation.mutate({
            bankAccountId: formData.bankAccountId,
            amount: amt,
            reference: formData.reference,
            notes: formData.notes,
            posSessionId: formData.posSessionId
        });
    };

    const columns = [
        { key: 'depositNumber', label: 'Deposit #', render: (r) => <span className="font-mono font-bold text-gray-900">{r.depositNumber}</span> },
        { key: 'date', label: 'Date', render: (r) => new Date(r.depositDate).toLocaleString('en-LK', { dateStyle: 'medium', timeStyle: 'short' }) },
        { key: 'source', label: 'Cash Source', render: (r) => (
            r.posSessionId ? (
                <div>
                    <Badge variant="info" className="text-[10px]">POS Register</Badge>
                    <p className="text-2xs text-gray-400 font-mono mt-0.5">Session: {r.posSessionId.status === 'open' ? 'Active' : 'Closed'}</p>
                </div>
            ) : (
                <Badge variant="default" className="text-[10px]">General Cash</Badge>
            )
        )},
        { key: 'bankAccount', label: 'Target Bank Account', render: (r) => (
            <div>
                <p className="font-bold text-gray-900">{r.bankAccountId?.bankName}</p>
                <p className="text-xs text-gray-500">{r.bankAccountId?.accountName} - {r.bankAccountId?.accountNumber}</p>
            </div>
        )},
        { key: 'amount', label: 'Amount', render: (r) => <span className="font-bold text-emerald-600">+{fmt(r.amount)}</span> },
        { key: 'cashier', label: 'Deposited By', render: (r) => <span className="text-sm font-medium">{r.createdBy ? `${r.createdBy.firstName} ${r.createdBy.lastName}` : '—'}</span> },
        { key: 'reference', label: 'Reference / Notes', render: (r) => (
            <div>
                <p className="text-sm text-gray-700">{r.reference || '—'}</p>
                {r.notes && <p className="text-xs text-gray-400 font-medium italic">{r.notes}</p>}
            </div>
        )},
        {
            key: 'actions', label: 'Actions', width: '80px', render: (r) => (
                <div className="flex gap-2 justify-end">
                    <button 
                        onClick={() => {
                            if (window.confirm('Are you sure you want to reverse this bank deposit? The deposit amount will be deducted from the bank account balance.')) {
                                deleteMutation.mutate(r._id);
                            }
                        }}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Reverse / Cancel Deposit"
                        disabled={deleteMutation.isPending}
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            )
        }
    ];

    const isLoading = isLoadingSession || isLoadingAccounts || isLoadingDeposits || isLoadingRecent;

    // Filter out active session from recent sessions so there are no duplicates
    const availableRecentSessions = recentSessions.filter(s => s._id !== activeSession?._id);

    return (
        <div className="space-y-6">
            <PageHeader 
                title="Cash & Bank Deposit Tally" 
                description="Deposit cashier register cash directly to company bank accounts and reconcile balances."
                icon={Landmark}
                actions={
                    <Button variant="primary" onClick={openModal}>
                        <Plus size={16} className="mr-1.5" /> Deposit Cash to Bank
                    </Button>
                }
            />

            {/* Reconciliation Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* 1. Cashier Balance Card */}
                <Card className="p-6 relative overflow-hidden group border-t-4 border-t-amber-500">
                    <div className="absolute top-0 right-0 p-8 -mr-4 -mt-4 opacity-10 group-hover:opacity-20 transition-opacity text-amber-500">
                        <Wallet className="h-20 w-20" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Cashier Register Drawer</p>
                    <h3 className="text-2xl font-black text-gray-900 mb-4">
                        {activeSession ? fmt(registerCash) : 'No Active Session'}
                    </h3>
                    {activeSession ? (
                        <div className="text-xs space-y-1.5 border-t pt-3 text-gray-600">
                            <div className="flex justify-between"><span>Opening cash:</span> <span className="font-semibold">{fmt(activeSession.openingBalance)}</span></div>
                            <div className="flex justify-between text-green-600"><span>Cash sales:</span> <span className="font-semibold">+{fmt(activeSession.cashSales)}</span></div>
                            <div className="flex justify-between text-red-600"><span>Cash expenses:</span> <span className="font-semibold">-{fmt(activeSession.cashExpenses)}</span></div>
                            <div className="flex justify-between text-blue-600 border-b pb-1.5"><span>Bank deposits:</span> <span className="font-semibold">-{fmt(activeSession.bankDeposits)}</span></div>
                            <div className="flex justify-between font-bold text-gray-800 pt-1"><span>Current Cash:</span> <span>{fmt(registerCash)}</span></div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 italic mt-6">Open the register under POS page to start cashier sessions.</p>
                    )}
                </Card>

                {/* 2. Total Bank Balance Card */}
                <Card className="p-6 relative overflow-hidden group border-t-4 border-t-emerald-500">
                    <div className="absolute top-0 right-0 p-8 -mr-4 -mt-4 opacity-10 group-hover:opacity-20 transition-opacity text-emerald-500">
                        <Landmark className="h-20 w-20" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Total Bank Accounts Balance</p>
                    <h3 className="text-2xl font-black text-emerald-700 mb-4">{fmt(totalBankBalance)}</h3>
                    
                    <div className="text-xs space-y-1.5 border-t pt-3 text-gray-600 max-h-36 overflow-y-auto">
                        {accounts.length === 0 ? (
                            <p className="text-gray-500 italic">No bank accounts added yet.</p>
                        ) : (
                            accounts.map(acc => (
                                <div key={acc._id} className="flex justify-between">
                                    <span className="truncate max-w-[180px]">{acc.bankName} - {acc.accountName}</span>
                                    <span className="font-semibold text-gray-800">{fmt(acc.currentBalance)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </Card>

                {/* 3. Tally & Reconciliation Card */}
                <Card className="p-6 relative overflow-hidden group border-t-4 border-t-blue-500 bg-blue-50/30">
                    <div className="absolute top-0 right-0 p-8 -mr-4 -mt-4 opacity-10 group-hover:opacity-20 transition-opacity text-blue-500">
                        <ArrowUpRight className="h-20 w-20" />
                    </div>
                    <p className="text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">Active Session Cash Deposited</p>
                    <h3 className="text-2xl font-black text-blue-800 mb-3">
                        {activeSession ? fmt(activeSession.bankDeposits) : fmt(0)}
                    </h3>
                    <p className="text-xs text-gray-500 leading-relaxed pt-2 border-t border-blue-100">
                        This reflects cash taken out of the active register session and directly deposited into bank accounts. When you perform a deposit, the register expectation decreases, allowing cashier reconciliation to tally cleanly.
                    </p>
                </Card>
            </div>

            {/* Deposits Log Table */}
            <Card className="mt-6">
                <div className="p-5 border-b flex items-center gap-2">
                    <History size={18} className="text-gray-400" />
                    <h3 className="font-bold text-gray-900">Bank Deposit History</h3>
                </div>
                {isLoading ? (
                    <div className="py-20 text-center text-gray-500">Loading bank deposits history...</div>
                ) : deposits.length === 0 ? (
                    <div className="py-20 text-center m-4 border-2 border-dashed border-gray-100 rounded-xl">
                        <FileText size={48} className="mx-auto text-gray-200 mb-4" />
                        <h3 className="text-gray-800 font-bold">No bank deposits logged</h3>
                        <p className="text-gray-500 text-sm mt-1">Cash deposits from POS sessions to bank accounts will appear here.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <Table columns={columns} data={deposits} />
                    </div>
                )}
            </Card>

            {/* New Deposit Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title="Deposit Cash to Bank" size="md">
                <div className="p-6 space-y-4">
                    
                    {/* Source of Cash Selector */}
                    <Select 
                        label="Source of Cash (Register Tally)" required
                        value={formData.posSessionId}
                        onChange={(e) => setFormData({...formData, posSessionId: e.target.value})}
                        options={[
                            { value: 'none', label: 'General Cash (Do not link to any Register)' },
                            ...(activeSession ? [{ 
                                value: activeSession._id, 
                                label: `Active Register - ${activeSession.userId?.firstName || 'Cashier'} (Cash: ${fmt(registerCash)})` 
                            }] : []),
                            ...availableRecentSessions.map(s => {
                                const formattedDate = new Date(s.openedAt).toLocaleDateString('en-LK', { month: 'short', day: 'numeric' });
                                const cashLeft = getRegisterCash(s);
                                return {
                                    value: s._id,
                                    label: `[Closed ${formattedDate}] Register - ${s.userId?.firstName || 'User'} (Cash: ${fmt(cashLeft)})`
                                };
                            })
                        ]}
                    />

                    {/* Available Cash Summary Box */}
                    {formData.posSessionId && formData.posSessionId !== 'none' && (
                        <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg space-y-1">
                            <p className="text-xs font-bold text-amber-800 uppercase tracking-wider">Available Cash in Selected Register</p>
                            <p className="text-lg font-black text-amber-900">{fmt(selectedSessionCash)}</p>
                            <p className="text-2xs text-amber-700">The deposit amount will be subtracted from this register session's expected closing balance, updating its tally discrepancy.</p>
                        </div>
                    )}

                    <Select 
                        label="Target Bank Account" required
                        options={accounts.filter(a => a.isActive).map(a => ({ value: a._id, label: `${a.bankName} - ${a.accountName} (${a.accountNumber}) (Bal: ${fmt(a.currentBalance)})` }))}
                        value={formData.bankAccountId}
                        onChange={(e) => setFormData({...formData, bankAccountId: e.target.value})}
                    />

                    <Input 
                        label="Amount to Deposit (LKR)" required type="number" step="0.01" min="0.01"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                    />

                    <Input 
                        label="Slip Reference Number"
                        placeholder="e.g. Deposit Slip #, Teller ID"
                        value={formData.reference}
                        onChange={(e) => setFormData({...formData, reference: e.target.value})}
                    />

                    <Input 
                        label="Notes"
                        placeholder="e.g. Deposited by Cashier during mid-day check"
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    />

                    <div className="pt-4 flex gap-2">
                        <Button 
                            variant="primary" fullWidth 
                            onClick={handleSubmit} 
                            loading={createMutation.isPending}
                        >
                            Confirm Deposit
                        </Button>
                        <Button variant="outline" fullWidth onClick={closeModal}>
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
