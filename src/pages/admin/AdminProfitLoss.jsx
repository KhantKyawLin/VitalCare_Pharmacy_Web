import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    TrendingUp, 
    TrendingDown, 
    Search, 
    Filter, 
    Download, 
    Calendar,
    ArrowUpDown,
    ShoppingCart,
    AlertTriangle,
    Wallet,
    Info,
    ArrowLeft,
    Tag,
    Receipt
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminProfitLoss = () => {
    const [loading, setLoading] = useState(true);
    const [records, setRecords] = useState([]);
    const [summary, setSummary] = useState({ total_profit_impact: 0 });
    const [filters, setFilters] = useState({
        start_date: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        type: 'all',
        per_page: 100,
        page: 1
    });
    const [searchTerm, setSearchTerm] = useState('');

    const getConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

    useEffect(() => {
        fetchLedger();
    }, [filters]);

    const fetchLedger = async () => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams(filters).toString();
            const response = await axios.get(`http://127.0.0.1:8000/api/admin/reports/detailed-ledger?${queryParams}`, getConfig());
            setRecords(response.data.data);
            setSummary(response.data.summary);
        } catch (error) {
            console.error("Error fetching ledger:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
    };

    const filteredRecords = records.filter(record => 
        record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const exportToCSV = () => {
        const headers = ['Date', 'Type', 'Category', 'Description', 'Revenue (Ks)', 'Cost (Ks)', 'Profit Impact (Ks)', 'Reference'];
        const rows = records.map(r => [
            r.date, r.type, r.category, r.title, r.revenue, r.cost, r.profit_impact, r.reference
        ]);
        let csvContent = "data:text/csv;charset=utf-8," + headers.join(",") + "\n" + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `VC_Ledger_${filters.start_date}_to_${filters.end_date}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold text-gray-800">Profit & Loss Ledger</h2>
                    <p className="text-gray-500 text-sm italic">Audit every Kyat. Detailed record of sales, losses, and overheads.</p>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={exportToCSV}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded text-xs font-bold hover:bg-slate-900 transition-all shadow-sm uppercase tracking-wider"
                    >
                        <Download size={14} /> EXPORT LEDGER
                    </button>
                    
                    <Link to="/admin/reports" className="flex items-center gap-1.5 text-gray-500 hover:text-gray-800 transition-colors font-bold text-xs bg-white border border-gray-100 rounded px-3 py-2 shadow-sm uppercase tracking-wider">
                        <ArrowLeft size={14} /> BACK TO REPORTS
                    </Link>
                </div>
            </div>

            {/* Summary Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-2 bg-white p-5 rounded border border-gray-100 shadow-sm border-l-4 border-l-[#8DB600]">
                    <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">NET PROFIT IMPACT</span>
                        <Info size={14} className="text-gray-300" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-3xl font-black ${summary.total_profit_impact >= 0 ? 'text-[#8DB600]' : 'text-red-500'}`}>
                            {summary.total_profit_impact.toLocaleString()}
                        </span>
                        <span className="text-xs font-bold text-gray-400">KS</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-tighter">
                        TOTAL EARNINGS FOR THE PERIOD {filters.start_date} TO {filters.end_date}
                    </p>
                </div>

                <div className="bg-white p-5 rounded border border-gray-100 shadow-sm flex flex-col justify-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">RECORDS</span>
                    <div className="text-2xl font-black text-gray-800">
                        {records.length} <span className="text-xs font-bold text-gray-400">ITEMS</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded border border-gray-100 shadow-sm flex flex-col justify-center">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">PERIOD STATUS</span>
                    <div className={`text-xs font-black uppercase flex items-center gap-1.5 ${summary.total_profit_impact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {summary.total_profit_impact >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        {summary.total_profit_impact >= 0 ? 'PROFITABLE' : 'NET LOSS'}
                    </div>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded border border-gray-100 shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="lg:col-span-2 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            placeholder="Search by description, reference, or category..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-[#8DB600] outline-none transition-all"
                        />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 lg:col-span-2">
                        <input 
                            type="date" 
                            name="start_date"
                            value={filters.start_date}
                            onChange={handleFilterChange}
                            className="w-full px-2 py-2 bg-white border border-gray-200 rounded text-[11px] font-bold outline-none uppercase"
                        />
                        <input 
                            type="date" 
                            name="end_date"
                            value={filters.end_date}
                            onChange={handleFilterChange}
                            className="w-full px-2 py-2 bg-white border border-gray-200 rounded text-[11px] font-bold outline-none uppercase"
                        />
                    </div>

                    <select 
                        name="type"
                        value={filters.type}
                        onChange={handleFilterChange}
                        className="w-full px-2 py-2 bg-white border border-gray-200 rounded text-[11px] font-black uppercase outline-none cursor-pointer"
                    >
                        <option value="all">ALL TRANSACTION TYPES</option>
                        <option value="sales">PRODUCT SALES ONLY</option>
                        <option value="losses">INVENTORY LOSSES</option>
                        <option value="external">OVERHEADS & BILLS</option>
                    </select>
                </div>
            </div>

            {/* Detailed Ledger Cards */}
            <div className="space-y-4">
                {loading ? (
                    [1, 2, 3].map(i => (
                        <div key={i} className="bg-white rounded border border-gray-100 shadow-sm h-48 animate-pulse"></div>
                    ))
                ) : filteredRecords.length > 0 ? (
                    filteredRecords.map((record, idx) => (
                        <div key={idx} className="bg-white rounded border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                            {/* Card Header */}
                            <div className="flex justify-between items-center bg-gray-50/50 px-6 py-4 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2.5 rounded-full ${
                                        record.type === 'Sale Order' ? 'bg-blue-50 text-blue-500' :
                                        record.type === 'Inventory Loss' ? 'bg-orange-50 text-orange-500' :
                                        record.profit_impact > 0 ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'
                                    }`}>
                                        {getTypeIcon(record.type)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-gray-800 flex items-center gap-2 text-base">
                                            {record.title}
                                            <span className="text-[10px] font-black px-2 py-0.5 bg-white text-gray-500 rounded border border-gray-200 uppercase shadow-sm">
                                                {record.reference}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-400 font-medium mt-0.5 flex items-center gap-1">
                                            <span className="uppercase tracking-wider font-bold text-gray-500">{record.type}</span> • {new Date(record.date).toLocaleDateString()} at {new Date(record.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-0.5">Net Profit Impact</span>
                                    <span className={`text-xl font-black ${record.profit_impact >= 0 ? 'text-[#8DB600]' : 'text-red-500'}`}>
                                        {record.profit_impact > 0 ? '+' : ''}{(record.profit_impact || 0).toLocaleString()} Ks
                                    </span>
                                </div>
                            </div>

                            {/* Card Body (Order Items) */}
                            {record.type === 'Sale Order' && record.items && (
                                <div className="p-0 overflow-x-auto">
                                    <table className="w-full text-left text-xs min-w-[600px]">
                                        <thead className="bg-white text-gray-400 uppercase text-[10px] font-black tracking-widest border-b border-gray-50">
                                            <tr>
                                                <th className="px-6 py-3.5 font-medium">Product</th>
                                                <th className="px-6 py-3.5 font-medium text-center">Quantity</th>
                                                <th className="px-6 py-3.5 font-medium text-right">Selling Price</th>
                                                <th className="px-6 py-3.5 font-medium text-right">Cost Price</th>
                                                <th className="px-6 py-3.5 font-medium text-right">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {record.items.map((item, i) => (
                                                <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                                                    <td className="px-6 py-3.5 font-bold text-gray-700">
                                                        {item.product_name}
                                                        <span className="block text-[10px] font-medium text-gray-400 uppercase mt-0.5">{item.category}</span>
                                                    </td>
                                                    <td className="px-6 py-3.5 text-center text-gray-600 font-bold">{item.quantity}</td>
                                                    <td className="px-6 py-3.5 text-right text-gray-500">{(item.original_price || 0).toLocaleString()} Ks</td>
                                                    <td className="px-6 py-3.5 text-right text-red-400">{item.purchase_price > 0 ? (item.purchase_price || 0).toLocaleString() + ' Ks' : '-'}</td>
                                                    <td className="px-6 py-3.5 text-right text-gray-800 font-bold">{(item.original_subtotal || 0).toLocaleString()} Ks</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}

                            {/* Card Body (Other Types) */}
                            {record.type !== 'Sale Order' && (
                                <div className="p-6 bg-white flex flex-col md:flex-row justify-between items-start md:items-center border-t border-gray-50 text-sm">
                                    <div className="flex gap-12">
                                        <div>
                                            <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Category</span>
                                            <span className="font-bold text-gray-700">{record.category}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Revenue</span>
                                            <span className="font-bold text-gray-600">{record.revenue > 0 ? (record.revenue || 0).toLocaleString() + ' Ks' : '-'}</span>
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Cost / Value</span>
                                            <span className="font-bold text-red-400">{record.cost > 0 ? (record.cost || 0).toLocaleString() + ' Ks' : '-'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Card Footer (Sale Summary) */}
                            {record.type === 'Sale Order' && (
                                <div className="bg-gray-50/30 p-6 border-t border-gray-100 flex flex-col items-end gap-2 text-sm">
                                    <div className="flex justify-between w-64 text-gray-500">
                                        <span>Subtotal</span>
                                        <span>{(record.subtotal || 0).toLocaleString()} Ks</span>
                                    </div>
                                    <div className="flex justify-between w-64 text-red-500">
                                        <span>Discount</span>
                                        <span>-{(record.discount || 0).toLocaleString()} Ks</span>
                                    </div>
                                    <div className="flex justify-between w-64 text-gray-800 font-bold border-t border-gray-200 pt-2 mt-1">
                                        <span>Total Amount</span>
                                        <span className="text-[#8DB600]">{(record.revenue || 0).toLocaleString()} Ks</span>
                                    </div>
                                    <div className="flex justify-between w-64 text-red-400 pt-1">
                                        <span>Total Cost</span>
                                        <span>{record.cost > 0 ? (record.cost || 0).toLocaleString() + ' Ks' : '-'}</span>
                                    </div>
                                    <div className="flex justify-between w-64 font-black border-t border-gray-200 pt-2 mt-1">
                                        <span className="text-gray-800">Gross Profit</span>
                                        <span className={`${record.profit_impact >= 0 ? 'text-[#8DB600]' : 'text-red-500'}`}>
                                            {record.profit_impact > 0 ? '+' : ''}{(record.profit_impact || 0).toLocaleString()} Ks
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded border border-gray-100 p-12 text-center flex flex-col items-center justify-center text-gray-400 italic shadow-sm">
                        <Receipt size={48} className="text-gray-200 mb-4" />
                        <p>No financial records found. Try adjusting your date range or filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const getTypeIcon = (type) => {
    switch(type) {
        case 'Sale Order': return <ShoppingCart size={20} />;
        case 'Inventory Loss': return <AlertTriangle size={20} />;
        case 'External Expense': return <Wallet size={20} />;
        case 'External Income': return <TrendingUp size={20} />;
        default: return <Receipt size={20} />;
    }
};


export default AdminProfitLoss;
