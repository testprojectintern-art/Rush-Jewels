import { useState, useEffect } from 'react';
import { Search, ShieldCheck, Calendar, Filter, User, FileText, CheckCircle2, ShieldAlert, AlertCircle, Clock } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Table from '../components/ui/Table';
import Select from '../components/ui/Select';
import PageHeader from '../components/ui/PageHeader';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import api from '../api/axios';

export default function WarrantyRegistryPage() {
    const [serials, setSerials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedSerial, setSelectedSerial] = useState(null);
    const [isEditOpen, setIsEditOpen] = useState(false);
    
    // Modal Edit Form State
    const [editForm, setEditForm] = useState({
        status: '',
        warrantyExpiryDate: ''
    });

    const fetchSerials = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/serial-numbers`, {
                params: { search, status: statusFilter, page, limit: 10 }
            });
            if (res.data?.success) {
                setSerials(res.data.data);
                setTotalPages(res.data.pages || 1);
            }
        } catch (err) {
            console.error('Failed to fetch serial numbers:', err);
            toast.error('Failed to load warranty registry records');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchSerials();
        }, 300); // debounce search input
        return () => clearTimeout(timer);
    }, [search, statusFilter, page]);

    const handleEditClick = (serial) => {
        setSelectedSerial(serial);
        setEditForm({
            status: serial.status || 'in_stock',
            warrantyExpiryDate: serial.warrantyExpiryDate ? new Date(serial.warrantyExpiryDate).toISOString().split('T')[0] : ''
        });
        setIsEditOpen(true);
    };

    const handleQuickDuration = (months) => {
        const baseDate = selectedSerial?.invoiceId?.invoiceDate ? new Date(selectedSerial.invoiceId.invoiceDate) : new Date();
        const futureDate = new Date(baseDate.setMonth(baseDate.getMonth() + months));
        setEditForm(f => ({ ...f, warrantyExpiryDate: futureDate.toISOString().split('T')[0] }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.put(`/serial-numbers/${selectedSerial._id}/warranty`, editForm);
            if (res.data?.success) {
                toast.success('Warranty details updated successfully');
                setIsEditOpen(false);
                fetchSerials();
            }
        } catch (err) {
            console.error('Failed to update warranty expiry:', err);
            toast.error(err.response?.data?.message || 'Failed to update warranty details');
        }
    };

    const fmtDate = (d) => {
        if (!d) return 'Not Activated';
        const dateObj = new Date(d);
        return dateObj.toLocaleDateString('en-LK', { year: 'numeric', month: 'short', day: 'numeric' });
    };

    const isExpired = (expiryStr) => {
        if (!expiryStr) return false;
        return new Date(expiryStr) < new Date();
    };

    const columns = [
        {
            key: 'serialNumber',
            label: 'Serial Number',
            render: (r) => (
                <span className="font-mono font-bold text-gray-900 dark:text-white uppercase tracking-wider">{r.serialNumber}</span>
            )
        },
        {
            key: 'product',
            label: 'Jewelry Item',
            render: (r) => (
                <div className="flex flex-col">
                    <span className="font-semibold text-gray-800 dark:text-gray-200">{r.productId?.name || 'Unknown'}</span>
                    <span className="text-[10px] text-gray-400 font-mono">Code: {r.productId?.productCode}</span>
                </div>
            )
        },
        {
            key: 'status',
            label: 'Status',
            render: (r) => {
                const styles = {
                    in_stock: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-800',
                    sold: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-800',
                    scrapped: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/10 dark:text-rose-400 dark:border-rose-800'
                };
                return (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border capitalize ${styles[r.status] || 'bg-gray-50 text-gray-700'}`}>
                        {r.status?.replace('_', ' ')}
                    </span>
                );
            }
        },
        {
            key: 'invoice',
            label: 'Sales Invoice',
            render: (r) => {
                if (!r.invoiceId) return <span className="text-gray-400 italic text-xs">—</span>;
                return (
                    <div className="flex flex-col">
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{r.invoiceId.invoiceNumber}</span>
                        <span className="text-[10px] text-gray-550 flex items-center gap-1">
                            <User size={10} /> {r.invoiceId.customerId?.displayName || 'Valued Customer'}
                        </span>
                    </div>
                );
            }
        },
        {
            key: 'warranty',
            label: 'Warranty Expiry',
            render: (r) => {
                if (!r.warrantyExpiryDate) {
                    return <span className="text-gray-400 italic text-xs">Not Activated</span>;
                }
                const expired = isExpired(r.warrantyExpiryDate);
                return (
                    <div className="flex items-center space-x-1.5">
                        <span className={`font-semibold text-xs ${expired ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {fmtDate(r.warrantyExpiryDate)}
                        </span>
                        {expired ? (
                            <span className="px-1.5 py-0.2 bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-450 border border-rose-200 dark:border-rose-900 text-[9px] rounded font-bold uppercase">Expired</span>
                        ) : (
                            <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-450 border border-emerald-200 dark:border-emerald-900 text-[9px] rounded font-bold uppercase">Active</span>
                        )}
                    </div>
                );
            }
        },
        {
            key: 'actions',
            label: 'Actions',
            render: (r) => (
                <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEditClick(r)}
                    className="flex items-center gap-1.5"
                >
                    <ShieldCheck size={14} className="text-amber-500" />
                    <span>Manage Expiry</span>
                </Button>
            )
        }
    ];

    return (
        <div className="space-y-6 p-4 md:p-6">
            <PageHeader
                title="Warranty Registry & Activation"
                description="Securely manage jewelry serial numbers, activate warranties, and override expirations"
            />

            {/* Filters bar */}
            <Card className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm bg-white dark:bg-slate-900">
                <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    <input
                        type="text"
                        placeholder="Search by serial number..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-9 pr-4 py-2 border border-gray-300 dark:border-slate-800 rounded-lg text-sm bg-transparent outline-none focus:ring-2 focus:ring-amber-500/35"
                    />
                </div>

                <div className="w-full md:w-48">
                    <Select
                        placeholder="All Statuses"
                        options={[
                            { value: 'in_stock', label: 'In Stock' },
                            { value: 'sold', label: 'Sold' },
                            { value: 'returned_to_vendor', label: 'Returned to Vendor' }
                        ]}
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                    />
                </div>
            </Card>

            {/* List Table */}
            <Card className="p-4 shadow-sm bg-white dark:bg-slate-900">
                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : serials.length === 0 ? (
                    <div className="text-center py-16 text-gray-450 italic">
                        No serial numbers matching filters were found.
                    </div>
                ) : (
                    <>
                        <Table columns={columns} data={serials} />
                        
                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-end items-center gap-2 mt-4">
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    disabled={page === 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                >
                                    Previous
                                </Button>
                                <span className="text-xs text-gray-500">Page {page} of {totalPages}</span>
                                <Button 
                                    variant="outline" 
                                    size="sm"
                                    disabled={page === totalPages}
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </>
                )}
            </Card>

            {/* Warranty Edit Modal */}
            <Modal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                title="Manage Expiry & Register Warranty"
            >
                {selectedSerial && (
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-3 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-400 font-medium">Serial Number</span>
                                <span className="font-mono font-bold text-gray-900 dark:text-white uppercase tracking-wider">{selectedSerial.serialNumber}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs border-t pt-2 mt-2">
                                <span className="text-gray-400 font-medium">Product</span>
                                <span className="font-semibold text-gray-900 dark:text-white">{selectedSerial.productId?.name}</span>
                            </div>
                            {selectedSerial.invoiceId && (
                                <>
                                    <div className="flex justify-between items-center text-xs border-t pt-2 mt-2">
                                        <span className="text-gray-400 font-medium">Sold Date</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">{fmtDate(selectedSerial.invoiceId.invoiceDate)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs border-t pt-2 mt-2">
                                        <span className="text-gray-400 font-medium">Customer</span>
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {selectedSerial.invoiceId.customerId?.displayName || 'Valued Customer'}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Serial Status</label>
                            <Select
                                options={[
                                    { value: 'in_stock', label: 'In Stock' },
                                    { value: 'sold', label: 'Sold (Warranty Active)' },
                                    { value: 'returned_to_vendor', label: 'Returned to Vendor' }
                                ]}
                                value={editForm.status}
                                onChange={(e) => setEditForm(f => ({ ...f, status: e.target.value }))}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">Warranty Expiry Date</label>
                            <Input
                                type="date"
                                value={editForm.warrantyExpiryDate}
                                onChange={(e) => setEditForm(f => ({ ...f, warrantyExpiryDate: e.target.value }))}
                            />
                        </div>

                        {/* Quick Durations helper */}
                        <div className="space-y-1.5">
                            <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider block">Quick Preset (from Invoice/Today)</span>
                            <div className="flex gap-2">
                                <Button type="button" variant="outline" size="sm" onClick={() => handleQuickDuration(6)}>6 Months</Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => handleQuickDuration(12)}>1 Year</Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => handleQuickDuration(24)}>2 Years</Button>
                                <Button type="button" variant="outline" size="sm" onClick={() => handleQuickDuration(36)}>3 Years</Button>
                            </div>
                        </div>

                        <div className="flex justify-end gap-2.5 pt-4 border-t">
                            <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                            <Button type="submit" variant="primary" className="flex items-center gap-1.5">
                                <ShieldCheck size={16} />
                                <span>Save Changes</span>
                            </Button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}
