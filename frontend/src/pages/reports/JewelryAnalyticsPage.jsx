import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Award, HelpCircle, Calendar, ShieldCheck, Tag } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';

import {
    useJewelryAgingStock,
    useJewelryBrandProfitability,
    useJewelryAovBundles,
    useJewelrySeasonality
} from '../../features/reports/useReports';

export default function JewelryAnalyticsPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('aging');

    // Fetch queries
    const { data: agingRes, isLoading: loadingAging } = useJewelryAgingStock();
    const { data: brandsRes, isLoading: loadingBrands } = useJewelryBrandProfitability();
    const { data: bundlesRes, isLoading: loadingBundles } = useJewelryAovBundles();
    const { data: seasonalRes, isLoading: loadingSeasonal } = useJewelrySeasonality();

    const fmt = (n) => new Intl.NumberFormat('en-LK', { style: 'currency', currency: 'LKR', minimumFractionDigits: 0 }).format(n || 0);

    const agingData = agingRes?.data;
    const brandsData = brandsRes?.data || [];
    const bundlesData = bundlesRes?.data;
    const seasonalData = seasonalRes?.data || [];

    const tabs = [
        { id: 'aging', label: 'Inventory Aging', icon: Clock },
        { id: 'brands', label: 'Brand Profitability', icon: Award },
        { id: 'bundles', label: 'AOV & Bundles', icon: Tag },
        { id: 'seasonality', label: 'Seasonality Velocity', icon: Calendar },
    ];

    return (
        <div>
            <PageHeader
                title="Jewelry & Retail Analytics"
                description="Specialized retail metrics and intelligence for jewelry inventory"
                actions={
                    <Button variant="outline" onClick={() => navigate('/reports')}>
                        <ArrowLeft size={16} className="mr-1.5" /> Back to Reports
                    </Button>
                }
            />

            {/* Tab Navigation */}
            <div className="flex border-b border-gray-200 mb-6 overflow-x-auto bg-white p-1 rounded-xl shadow-sm">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                                isActive
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            <Icon size={16} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Tab Contents */}
            <div className="space-y-6">
                {/* 1. Inventory Aging Tab */}
                {activeTab === 'aging' && (
                    <div>
                        {loadingAging || !agingData ? (
                            <div className="py-16 text-center text-gray-500">Loading aging stock...</div>
                        ) : (
                            <div className="space-y-6">
                                {/* Aging Summary Cards */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {Object.entries(agingData).map(([key, bucket]) => {
                                        const isDead = key === '181_plus';
                                        const isSlow = key === '91_180';
                                        const isNormal = key === '31_90';
                                        const isFast = key === '0_30';
                                        
                                        let colorClass = 'bg-green-50 border-green-200 text-green-700';
                                        let badgeColor = 'bg-green-100 text-green-800';
                                        if (isDead) {
                                            colorClass = 'bg-red-50 border-red-200 text-red-700';
                                            badgeColor = 'bg-red-100 text-red-800';
                                        } else if (isSlow) {
                                            colorClass = 'bg-orange-50 border-orange-200 text-orange-700';
                                            badgeColor = 'bg-orange-100 text-orange-800';
                                        } else if (isNormal) {
                                            colorClass = 'bg-blue-50 border-blue-200 text-blue-700';
                                            badgeColor = 'bg-blue-100 text-blue-800';
                                        }

                                        return (
                                            <Card key={key} className={`p-5 border ${colorClass}`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${badgeColor}`}>
                                                        {bucket.label.split(' ')[0]}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500 font-semibold">{bucket.items.length} unique models</span>
                                                </div>
                                                <p className="text-2xl font-bold text-gray-900 mt-1">{fmt(bucket.value)}</p>
                                                <p className="text-xs text-gray-600 font-medium mt-1">
                                                    Locked Capital ({bucket.count} units)
                                                </p>
                                            </Card>
                                        );
                                    })}
                                </div>

                                <Card className="p-5">
                                    <h3 className="text-sm font-semibold text-gray-800 mb-4">Oldest Inventory & Slow Movers (Review Required)</h3>
                                    
                                    {/* Flatten and sort oldest items */}
                                    {(() => {
                                        const allItems = [
                                            ...agingData['181_plus'].items,
                                            ...agingData['91_180'].items
                                        ];

                                        if (allItems.length === 0) {
                                            return <div className="text-center py-6 text-sm text-gray-500">No slow-moving inventory detected. Awesome!</div>;
                                        }

                                        const columns = [
                                            { key: 'productCode', label: 'Code', render: (r) => <span className="font-mono text-xs">{r.productCode}</span> },
                                            { key: 'productName', label: 'Product Name', render: (r) => <span className="font-semibold text-gray-800">{r.productName}</span> },
                                            { key: 'brandName', label: 'Brand' },
                                            { key: 'ageDays', label: 'Age (Days)', render: (r) => <span className="font-bold text-orange-600">{r.ageDays} days</span> },
                                            { key: 'onHand', label: 'In Stock (Units)' },
                                            { key: 'totalValue', label: 'Capital Value', render: (r) => fmt(r.totalValue) }
                                        ];

                                        return (
                                            <Table 
                                                columns={columns}
                                                data={allItems}
                                            />
                                        );
                                    })()}
                                </Card>
                            </div>
                        )}
                    </div>
                )}

                {/* 2. Brand Profitability Tab */}
                {activeTab === 'brands' && (
                    <div>
                        {loadingBrands ? (
                            <div className="py-16 text-center text-gray-500">Loading brand profitability...</div>
                        ) : brandsData.length === 0 ? (
                            <div className="py-16 text-center text-gray-500">No brand profitability data available.</div>
                        ) : (
                            <Card className="p-5">
                                <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Award size={16} className="text-indigo-600" />
                                    Brand Profitability (Pareto Analysis)
                                </h3>

                                <p className="text-xs text-gray-500 mb-4">
                                    Analysis sorted by total revenue. High margin brands with lower sales volumes or high revenue brands with narrow margins are highlighted to identify optimization options.
                                </p>

                                {(() => {
                                    const totalRevenue = brandsData.reduce((s, b) => s + b.revenue, 0);

                                    const columns = [
                                        { key: 'brandName', label: 'Brand Name', render: (r) => <span className="font-bold text-gray-900">{r.brandName}</span> },
                                        { key: 'unitsSold', label: 'Units Sold' },
                                        { key: 'revenue', label: 'Revenue', render: (r) => fmt(r.revenue) },
                                        {
                                            key: 'revenueShare',
                                            label: 'Revenue Share',
                                            render: (r) => {
                                                const pct = totalRevenue > 0 ? ((r.revenue / totalRevenue) * 100).toFixed(1) : 0;
                                                return (
                                                    <div className="flex items-center gap-2 w-32">
                                                        <div className="flex-1 bg-gray-200 h-1.5 rounded-full overflow-hidden">
                                                            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${pct}%` }}></div>
                                                        </div>
                                                        <span className="text-xs font-mono font-semibold">{pct}%</span>
                                                    </div>
                                                );
                                            }
                                        },
                                        { key: 'profit', label: 'Gross Profit', render: (r) => <span className="text-green-600 font-semibold">{fmt(r.profit)}</span> },
                                        {
                                            key: 'margin',
                                            label: 'Margin %',
                                            render: (r) => {
                                                let badgeVariant = 'info';
                                                if (r.margin >= 40) badgeVariant = 'success';
                                                else if (r.margin < 20) badgeVariant = 'danger';
                                                return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                                                    r.margin >= 40 ? 'bg-green-100 text-green-800' :
                                                    r.margin < 20 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                                                }`}>{r.margin}%</span>;
                                            }
                                        }
                                    ];

                                    return (
                                        <Table
                                            columns={columns}
                                            data={brandsData}
                                        />
                                    );
                                })()}
                            </Card>
                        )}
                    </div>
                )}

                {/* 3. AOV & Bundles Tab */}
                {activeTab === 'bundles' && (
                    <div>
                        {loadingBundles || !bundlesData ? (
                            <div className="py-16 text-center text-gray-500">Loading AOV & bundles...</div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Left Side KPIs */}
                                <div className="space-y-4 lg:col-span-1">
                                    <Card className="p-5 flex flex-col justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Average Order Value (AOV)</p>
                                            <p className="text-3xl font-extrabold text-indigo-600 mt-2">{fmt(bundlesData.aov)}</p>
                                        </div>
                                        <p className="text-[10px] text-gray-400 mt-4">
                                            Calculated based on {bundlesData.totalOrders} total orders. Higher AOV can be driven by styling bundle recommendations (e.g. jewelry item + box + premium packaging).
                                        </p>
                                    </Card>

                                    <Card className="p-5">
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Sales Turnover</p>
                                        <p className="text-2xl font-extrabold text-gray-800 mt-2">{fmt(bundlesData.totalSales)}</p>
                                        <p className="text-xs text-gray-400 mt-1">Excludes cancelled invoices</p>
                                    </Card>
                                </div>

                                {/* Right Side Bundle Recommendations */}
                                <Card className="p-5 lg:col-span-2">
                                    <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                        <Tag size={16} className="text-indigo-600" />
                                        Affinity Bundle Recommendations
                                    </h3>
                                    <p className="text-xs text-gray-500 mb-4">
                                        Items frequently co-purchased on the same invoice. Displaying these bundles or discount packages can improve Average Order Value.
                                    </p>

                                    {bundlesData.topBundles.length === 0 ? (
                                        <div className="py-12 text-center text-gray-400 text-sm">
                                            No co-purchased items detected. All invoices contain single items.
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {bundlesData.topBundles.map((b, index) => (
                                                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 border rounded-xl hover:bg-indigo-50/20 transition-all">
                                                    <div className="min-w-0 flex-1">
                                                        <span className="text-xs font-bold text-indigo-600 mr-2">#{index + 1}</span>
                                                        <span className="font-semibold text-gray-800 text-sm">{b.bundleName}</span>
                                                    </div>
                                                    <div className="shrink-0 text-right">
                                                        <span className="text-xs font-bold px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-full">
                                                            Bought together {b.frequency} times
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </Card>
                            </div>
                        )}
                    </div>
                )}

                {/* 4. Seasonality Velocity Tab */}
                {activeTab === 'seasonality' && (
                    <div>
                        {loadingSeasonal ? (
                            <div className="py-16 text-center text-gray-500">Loading seasonality metrics...</div>
                        ) : seasonalData.length === 0 ? (
                            <div className="py-16 text-center text-gray-500">No seasonal data available yet. Check in after sales orders are logged.</div>
                        ) : (
                            <Card className="p-5">
                                <h3 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <Calendar size={16} className="text-indigo-600" />
                                    Monthly Sales Velocity Matrix
                                </h3>

                                <p className="text-xs text-gray-500 mb-6">
                                    Sales turnover aggregated by calendar year and month. This enables seasonality planning for restocking and special brand promotional launches (e.g. holiday sales spikes).
                                </p>

                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left border-collapse border">
                                        <thead>
                                            <tr className="bg-gray-50 text-gray-700 font-bold border-b">
                                                <th className="p-3 border">Year</th>
                                                {Array.from({ length: 12 }, (_, i) => (
                                                    <th key={i} className="p-3 border text-center font-mono">
                                                        {new Date(2000, i).toLocaleString('default', { month: 'short' })}
                                                    </th>
                                                ))}
                                                <th className="p-3 border text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {(() => {
                                                // Group data by year
                                                const years = {};
                                                seasonalData.forEach(item => {
                                                    if (!years[item.year]) {
                                                        years[item.year] = Array(12).fill(0);
                                                    }
                                                    years[item.year][item.month - 1] = item.sales;
                                                });

                                                return Object.entries(years).map(([year, months]) => {
                                                    const yearTotal = months.reduce((s, m) => s + m, 0);
                                                    return (
                                                        <tr key={year} className="hover:bg-gray-50/50">
                                                            <td className="p-3 border font-bold text-gray-800">{year}</td>
                                                            {months.map((val, idx) => (
                                                                <td key={idx} className="p-3 border text-center font-mono text-xs">
                                                                    {val > 0 ? (
                                                                        <span className="font-semibold text-gray-900" title={`LKR ${val.toFixed(2)}`}>
                                                                            {new Intl.NumberFormat('en-LK', { notation: 'compact' }).format(val)}
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-gray-300">—</span>
                                                                    )}
                                                                </td>
                                                            ))}
                                                            <td className="p-3 border text-right font-bold text-indigo-600">{fmt(yearTotal)}</td>
                                                        </tr>
                                                    );
                                                });
                                            })()}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
