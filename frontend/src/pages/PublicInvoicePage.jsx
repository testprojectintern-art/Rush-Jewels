import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Printer, RefreshCw, AlertTriangle, ArrowLeft, Gem } from 'lucide-react';
import PrintableInvoice from '../components/print/PrintableInvoice';
import Button from '../components/ui/Button';

export default function PublicInvoicePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const printRef = useRef(null);

    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [companyInfo, setCompanyInfo] = useState(null);

    useEffect(() => {
        const fetchInvoiceAndSettings = async () => {
            setLoading(true);
            setError('');
            try {
                // Fetch public invoice data
                const invRes = await axios.get(`/api/public/invoice/${id}`);
                setInvoice(invRes.data.data);

                // Fetch public company settings
                const settingsRes = await axios.get('/api/public/settings');
                const s = settingsRes.data.data;
                setCompanyInfo({
                    name: s.companyName,
                    address: s.address,
                    phone: s.phone,
                    email: s.email,
                    website: s.website,
                    taxNumber: s.taxRegistrationNumber,
                    logo: s.logo
                });
            } catch (err) {
                console.error('Error fetching public invoice details:', err);
                setError(err.response?.data?.message || 'Failed to retrieve invoice details.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchInvoiceAndSettings();
        }
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
                <RefreshCw className="animate-spin text-indigo-500 mb-4" size={32} />
                <p className="text-sm font-medium text-slate-400">Loading invoice details...</p>
            </div>
        );
    }

    if (error || !invoice) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full bg-slate-800 border border-slate-700 rounded-3xl p-8 text-center space-y-4">
                    <div className="inline-flex p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl">
                        <AlertTriangle size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-white">Error Retrieving Invoice</h2>
                    <p className="text-sm text-slate-400 leading-relaxed">{error || 'Invoice not found.'}</p>
                    <div className="pt-2">
                        <Button variant="primary" onClick={() => navigate('/login')} className="w-full">
                            Go to Login
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-955 py-8 px-4 md:px-8 print:p-0 print:bg-white flex flex-col items-center">
            {/* Top Toolbar - hidden during printing */}
            <div className="w-full max-w-[800px] bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 mb-6 flex justify-between items-center shadow-lg print:hidden">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-500/15 border border-indigo-500/20 text-indigo-400 rounded-lg flex items-center justify-center">
                        <Gem size={18} />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-white">Rush Jewels Online Bill</h4>
                        <p className="text-[10px] text-slate-500">Invoice: {invoice.invoiceNumber}</p>
                    </div>
                </div>
                <Button onClick={handlePrint} variant="primary" size="sm" className="flex items-center gap-1.5 shadow-md">
                    <Printer size={14} /> Print / Save PDF
                </Button>
            </div>

            {/* Printable Area */}
            <div className="w-full max-w-[800px] bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden print:border-0 print:shadow-none print:rounded-none">
                <PrintableInvoice
                    ref={printRef}
                    companyInfo={companyInfo}
                    invoice={invoice}
                    payments={[]}
                />
            </div>

            {/* Footer */}
            <p className="text-[10px] text-slate-650 font-medium mt-8 print:hidden">
                &copy; {new Date().getFullYear()} Rush Jewels Pvt Ltd. All rights reserved.
            </p>
        </div>
    );
}