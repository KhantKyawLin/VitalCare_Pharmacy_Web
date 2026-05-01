import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    TrendingUp, 
    ArrowLeft, 
    Search, 
    ShoppingCart,
    Filter,
    Calendar,
    ArrowUpDown,
    Download,
    Package
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminTopProfitableProducts = () => {
    const [loading, setLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [range, setRange] = useState('this_month');
    const [searchTerm, setSearchTerm] = useState('');

    const getConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

    useEffect(() => {
        fetchProducts();
    }, [range]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/admin/reports/top-profitable?range=${range}`, getConfig());
            setProducts(response.data);
        } catch (error) {
            console.error("Error fetching top products:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(p => 
        p.product?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link to="/admin/reports" className="p-2 bg-white rounded border border-gray-100 hover:bg-gray-50 transition-colors">
                        <ArrowLeft size={18} className="text-gray-500" />
                    </Link>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Top Profitable Products</h2>
                        <p className="text-gray-500 text-sm">Products ranked by their contribution to your net profit.</p>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-white p-1 rounded border border-gray-100">
                    {[
                        { id: 'today', label: 'Today' },
                        { id: 'last_7_days', label: '7 Days' },
                        { id: 'this_month', label: 'Month' },
                        { id: 'year_to_date', label: 'YTD' }
                    ].map(btn => (
                        <button
                            key={btn.id}
                            onClick={() => setRange(btn.id)}
                            className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${
                                range === btn.id 
                                ? 'bg-[#8DB600] text-white shadow-sm' 
                                : 'text-gray-500 hover:bg-gray-50'
                            }`}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded border border-gray-100 shadow-sm">
                <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search product by name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded text-sm focus:ring-1 focus:ring-[#8DB600] focus:border-[#8DB600] outline-none transition-all"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-400 uppercase text-[10px] font-black tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Product Details</th>
                                <th className="px-6 py-4 text-center">Units Sold</th>
                                <th className="px-6 py-4 text-right">Revenue</th>
                                <th className="px-6 py-4 text-right">Cost (COGS)</th>
                                <th className="px-6 py-4 text-right">Gross Profit</th>
                                <th className="px-6 py-4 text-center">Profit Margin</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="6" className="px-6 py-8 bg-gray-50/20"></td>
                                    </tr>
                                ))
                            ) : filteredProducts.length > 0 ? (
                                filteredProducts.map((p, idx) => {
                                    const profit = parseFloat(p.gross_profit);
                                    const revenue = parseFloat(p.revenue);
                                    const cost = revenue - profit;
                                    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
                                    
                                    return (
                                        <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                                                        <Package size={20} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-gray-800">{p.product?.name}</div>
                                                        <div className="text-[10px] text-gray-400 uppercase font-black">{p.product?.category?.name || 'Medicine'}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center font-bold text-gray-600">
                                                {p.units_sold}
                                            </td>
                                            <td className="px-6 py-4 text-right font-medium text-gray-600">
                                                {revenue.toLocaleString()} Ks
                                            </td>
                                            <td className="px-6 py-4 text-right text-xs text-gray-400">
                                                {cost.toLocaleString()} Ks
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-black text-[#8DB600]">
                                                    {profit.toLocaleString()} Ks
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <div className="inline-flex flex-col items-center">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border ${
                                                        margin > 20 ? 'bg-green-50 text-green-600 border-green-100' :
                                                        margin > 10 ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                        'bg-gray-50 text-gray-600 border-gray-100'
                                                    }`}>
                                                        {margin.toFixed(1)}%
                                                    </span>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-300 italic">
                                        No products found for this period.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pro-tip */}
            <div className="bg-blue-50 border border-blue-100 rounded p-4 flex gap-3">
                <div className="p-2 bg-blue-100 rounded text-blue-600 h-fit">
                    <TrendingUp size={18} />
                </div>
                <div>
                    <h4 className="text-sm font-bold text-blue-800 uppercase tracking-tight">Business Insight</h4>
                    <p className="text-xs text-blue-600 leading-relaxed mt-0.5">
                        Focus on products with high margins (>20%) but low sales volume to identify potential marketing opportunities.
                        Products with low margins but high volume are your "Cash Cows" — keep them well-stocked!
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminTopProfitableProducts;
