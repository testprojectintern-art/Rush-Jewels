import React, { useEffect, useState } from 'react';
import { Settings, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCompanySettings, useUpdateCompanySettings } from '../features/settings/useSettings';
import Button from '../components/ui/Button';

export default function SettingsPage() {
    const { data: settingsRes, isLoading } = useCompanySettings();
    const updateSettings = useUpdateCompanySettings();

    const [formData, setFormData] = useState({
        companyName: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        taxRegistrationNumber: '',
        receiptFooterMessage: '',
    });

    useEffect(() => {
        if (settingsRes?.data) {
            const s = settingsRes.data;
            setFormData({
                companyName: s.companyName || '',
                address: s.address || '',
                phone: s.phone || '',
                email: s.email || '',
                website: s.website || '',
                taxRegistrationNumber: s.taxRegistrationNumber || '',
                receiptFooterMessage: s.receiptFooterMessage || '',
            });
        }
    }, [settingsRes]);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await updateSettings.mutateAsync(formData);
            toast.success('Settings updated successfully');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to update settings');
        }
    };

    if (isLoading) {
        return <div className="p-6">Loading settings...</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Settings className="text-primary-600" />
                        Company Settings
                    </h1>
                    <p className="text-gray-500 mt-1">Manage your company details for receipts and invoices.</p>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
                            <input
                                type="text"
                                name="companyName"
                                required
                                value={formData.companyName}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                            <input
                                type="text"
                                name="website"
                                value={formData.website}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tax / Registration Number</label>
                            <input
                                type="text"
                                name="taxRegistrationNumber"
                                value={formData.taxRegistrationNumber}
                                onChange={handleChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Receipt Footer Message</label>
                            <textarea
                                name="receiptFooterMessage"
                                rows={3}
                                value={formData.receiptFooterMessage}
                                onChange={handleChange}
                                placeholder="E.g. Thank you for your business! Please visit again."
                                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                            />
                            <p className="text-xs text-gray-500 mt-1">This message will be printed at the bottom of thermal receipts.</p>
                        </div>
                    </div>

                    <div className="pt-4 border-t flex justify-end">
                        <Button type="submit" variant="primary" loading={updateSettings.isPending}>
                            <Save size={18} className="mr-2" /> Save Settings
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
