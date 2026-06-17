import React, { useState } from 'react';
import { 
    FileText, Plus, Search, RefreshCw, AlertTriangle, ShieldCheck, 
    ArrowRightLeft, CheckCircle2, AlertCircle, Clock, Trash2, Edit 
} from 'lucide-react';
import { 
    useWarrantyClaims, 
    useCreateWarrantyClaim, 
    useUpdateWarrantyClaimStatus,
    useUpdateWarrantyClaim 
} from '../features/warrantyClaims/useWarrantyClaims';
import { useCustomers } from '../features/customers/useCustomers';
import { useProducts } from '../features/products/useProducts';
import { useSuppliers } from '../features/suppliers/useSuppliers';
import Button from '../components/ui/Button';

export default function WarrantyClaimsPage() {
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isStatusOpen, setIsStatusOpen] = useState(false);
    const [selectedClaim, setSelectedClaim] = useState(null);

    // Form states
    const [claimForm, setClaimForm] = useState({
        serialNumber: '',
        productId: '',
        customerId: '',
        issueDescription: '',
        supplierId: '',
        notes: ''
    });

    const [statusForm, setStatusForm] = useState({
        status: '',
        notes: ''
    });

    // Queries
    const filters = { page, limit: 10, search, status: statusFilter };
    const { data: claimsRes, isLoading, refetch, isRefetching } = useWarrantyClaims(filters);
    const { data: customersRes } = useCustomers({ limit: 1000 });
    const { data: productsRes } = useProducts({ limit: 1000 });
    const { data: suppliersRes } = useSuppliers({ limit: 1000 });

    // Mutations
    const createClaimMutation = useCreateWarrantyClaim();
    const updateStatusMutation = useUpdateWarrantyClaimStatus();

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            await createClaimMutation.mutateAsync(claimForm);
            setIsCreateOpen(false);
            setClaimForm({
                serialNumber: '',
                productId: '',
                customerId: '',
                issueDescription: '',
                supplierId: '',
                notes: ''
            });
        } catch (err) {
            // Error toast handled by mutation
        }
    };

    const handleStatusSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateStatusMutation.mutateAsync({
                id: selectedClaim._id,
                status: statusForm.status,
                notes: statusForm.notes
            });
            setIsStatusOpen(false);
            setStatusForm({ status: '', notes: '' });
            setSelectedClaim(null);
        } catch (err) {
            // Error toast handled by mutation
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            received_from_customer: 'bg-blue-50 text-blue-700 border-blue-200',
            sent_to_supplier: 'bg-purple-50 text-purple-700 border-purple-200',
            returned_from_supplier: 'bg-amber-50 text-amber-700 border-amber-200',
            delivered_to_customer: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            rejected: 'bg-red-50 text-red-700 border-red-200'
        };

        const labels = {
            received_from_customer: 'Received From Customer',
            sent_to_supplier: 'Sent To Supplier',
            returned_from_supplier: 'Returned From Supplier',
            delivered_to_customer: 'Delivered (Resolved)',
            rejected: 'Claim Rejected'
        };

        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[status] || 'bg-gray-50 text-gray-700'}`}>
                {labels[status] || status}
            </span>
        );
    };

    const formatClaimDate = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="space-y-6 p-4 md:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <ShieldCheck className="text-primary-600" />
                        Warranty Claims Management
                    </h1>
                    <p className="text-gray-500 mt-1">Track manufacturer warranty claims, client watch returns, and service statuses.</p>
                </div>
                <Button onClick={() => setIsCreateOpen(true)} variant="primary" className="flex items-center gap-2">
                    <Plus size={18} /> File Warranty Claim
                </Button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search by serial / claim number..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="py-2 px-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
                    >
                        <option value="">All Statuses</option>
                        <option value="received_from_customer">Received From Customer</option>
                        <option value="sent_to_supplier">Sent To Supplier</option>
                        <option value="returned_from_supplier">Returned From Supplier</option>
                        <option value="delivered_to_customer">Delivered (Resolved)</option>
                        <option value="rejected">Rejected</option>
                    </select>
                </div>

                <button
                    onClick={() => refetch()}
                    disabled={isRefetching}
                    className="p-2 border rounded-lg hover:bg-gray-50 text-gray-600 disabled:opacity-50 transition-colors"
                >
                    <RefreshCw size={16} className={isRefetching ? 'animate-spin' : ''} />
                </button>
            </div>

            {/* Table / Grid */}
            <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="p-12 text-center text-gray-500">Loading warranty claims...</div>
                ) : claimsRes?.data?.length > 0 ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-sm">
                            <thead>
                                <tr className="bg-gray-50 text-gray-400 font-semibold border-b uppercase text-xs">
                                    <th className="py-3.5 px-5">Claim Number</th>
                                    <th className="py-3.5 px-5">Serial Number</th>
                                    <th className="py-3.5 px-5">Product Name</th>
                                    <th className="py-3.5 px-5">Customer Name</th>
                                    <th className="py-3.5 px-5">Status</th>
                                    <th className="py-3.5 px-5">Logged Date</th>
                                    <th className="py-3.5 px-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y text-gray-700">
                                {claimsRes.data.map((claim) => (
                                    <tr key={claim._id} className="hover:bg-gray-50">
                                        <td className="py-3.5 px-5 font-semibold text-gray-900">{claim.claimNumber}</td>
                                        <td className="py-3.5 px-5 font-mono text-xs">{claim.serialNumber}</td>
                                        <td className="py-3.5 px-5">
                                            <div className="font-medium">{claim.productId?.name}</div>
                                            <div className="text-xs text-gray-400">{claim.productId?.productCode}</div>
                                        </td>
                                        <td className="py-3.5 px-5">
                                            <div className="font-medium">{claim.customerId?.name}</div>
                                            <div className="text-xs text-gray-400">{claim.customerId?.phone}</div>
                                        </td>
                                        <td className="py-3.5 px-5">{getStatusBadge(claim.status)}</td>
                                        <td className="py-3.5 px-5 text-gray-500">{formatClaimDate(claim.createdAt)}</td>
                                        <td className="py-3.5 px-5 text-right">
                                            <Button 
                                                onClick={() => {
                                                    setSelectedClaim(claim);
                                                    setStatusForm({ status: claim.status, notes: '' });
                                                    setIsStatusOpen(true);
                                                }}
                                                variant="secondary"
                                                size="sm"
                                                className="inline-flex items-center gap-1.5"
                                            >
                                                <ArrowRightLeft size={14} /> Update Status
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {claimsRes.pagination && claimsRes.pagination.totalPages > 1 && (
                            <div className="p-4 border-t flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                    Page {page} of {claimsRes.pagination.totalPages}
                                </span>
                                <div className="flex gap-2">
                                    <Button
                                        disabled={page === 1}
                                        onClick={() => setPage(prev => Math.max(1, prev - 1))}
                                        variant="secondary"
                                        size="sm"
                                    >
                                        Previous
                                    </Button>
                                    <Button
                                        disabled={page === claimsRes.pagination.totalPages}
                                        onClick={() => setPage(prev => prev + 1)}
                                        variant="secondary"
                                        size="sm"
                                    >
                                        Next
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="p-12 text-center text-gray-400">
                        No warranty claims found. File a new claim to get started.
                    </div>
                )}
            </div>

            {/* Modal: Create Warranty Claim */}
            {isCreateOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl border max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
                        <div className="flex justify-between items-center border-b pb-3">
                            <h3 className="font-bold text-lg text-gray-900">File Warranty Claim</h3>
                            <button onClick={() => setIsCreateOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
                        </div>

                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Watch Serial Number *</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Enter watch serial / warranty code"
                                    value={claimForm.serialNumber}
                                    onChange={(e) => setClaimForm(prev => ({ ...prev, serialNumber: e.target.value }))}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm uppercase"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Product *</label>
                                    <select
                                        required
                                        value={claimForm.productId}
                                        onChange={(e) => setClaimForm(prev => ({ ...prev, productId: e.target.value }))}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm bg-white"
                                    >
                                        <option value="">Choose Watch model</option>
                                        {productsRes?.data?.map(p => (
                                            <option key={p._id} value={p._id}>{p.name} ({p.productCode})</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Customer *</label>
                                    <select
                                        required
                                        value={claimForm.customerId}
                                        onChange={(e) => setClaimForm(prev => ({ ...prev, customerId: e.target.value }))}
                                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm bg-white"
                                    >
                                        <option value="">Choose Customer</option>
                                        {customersRes?.data?.map(c => (
                                            <option key={c._id} value={c._id}>{c.displayName} ({c.customerCode})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select Supplier (Manufacturer) *</label>
                                <select
                                    required
                                    value={claimForm.supplierId}
                                    onChange={(e) => setClaimForm(prev => ({ ...prev, supplierId: e.target.value }))}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm bg-white"
                                >
                                    <option value="">Choose Supplier</option>
                                    {suppliersRes?.data?.map(s => (
                                        <option key={s._id} value={s._id}>{s.displayName} ({s.supplierCode})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Issue / Defect Description *</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Explain the problem (e.g. dial cracked, battery leakage, automatic mechanism stuck)"
                                    value={claimForm.issueDescription}
                                    onChange={(e) => setClaimForm(prev => ({ ...prev, issueDescription: e.target.value }))}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
                                <textarea
                                    rows={2}
                                    placeholder="Enter internal details or comments..."
                                    value={claimForm.notes}
                                    onChange={(e) => setClaimForm(prev => ({ ...prev, notes: e.target.value }))}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                                />
                            </div>

                            <div className="pt-4 border-t flex justify-end gap-3">
                                <Button type="button" variant="secondary" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
                                <Button type="submit" variant="primary" loading={createClaimMutation.isPending}>File Claim</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal: Update Warranty Claim Status */}
            {isStatusOpen && selectedClaim && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl shadow-xl border max-w-md w-full p-6 space-y-4">
                        <div className="flex justify-between items-center border-b pb-3">
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">Update Status</h3>
                                <p className="text-xs text-gray-400">Claim: {selectedClaim.claimNumber} (SN: {selectedClaim.serialNumber})</p>
                            </div>
                            <button onClick={() => setIsStatusOpen(false)} className="text-gray-400 hover:text-gray-600 text-xl font-bold">&times;</button>
                        </div>

                        <form onSubmit={handleStatusSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Claim Status *</label>
                                <select
                                    required
                                    value={statusForm.status}
                                    onChange={(e) => setStatusForm(prev => ({ ...prev, status: e.target.value }))}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm bg-white"
                                >
                                    <option value="received_from_customer">Received From Customer</option>
                                    <option value="sent_to_supplier">Sent To Supplier (Manufacturer)</option>
                                    <option value="returned_from_supplier">Returned From Supplier</option>
                                    <option value="delivered_to_customer">Delivered to Customer (Resolved)</option>
                                    <option value="rejected">Rejected / Out of Warranty</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status Update Notes *</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Enter reasoning or updates (e.g. Courier tracking code, parts replaced by supplier)"
                                    value={statusForm.notes}
                                    onChange={(e) => setStatusForm(prev => ({ ...prev, notes: e.target.value }))}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
                                />
                            </div>

                            <div className="pt-4 border-t flex justify-end gap-3">
                                <Button type="button" variant="secondary" onClick={() => setIsStatusOpen(false)}>Cancel</Button>
                                <Button type="submit" variant="primary" loading={updateStatusMutation.isPending}>Save Status</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
