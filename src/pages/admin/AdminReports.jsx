import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Swal from 'sweetalert2';
import {
    TrendingUp, TrendingDown, DollarSign, ShoppingCart, AlertTriangle,
    ArrowRight, PieChart, BarChart3, Plus, Trash2, Edit, X, Receipt,
    Wallet, ArrowDownCircle, ArrowUpCircle, Info
} from 'lucide-react';

const API = 'http://127.0.0.1:8000/api/admin';

const AdminReports = () => {
    const [range, setRange] = useState('this_month');
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState(null);
    const [chartData, setChartData] = useState([]);
    const [losses, setLosses] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [txStats, setTxStats] = useState({ total_expenses: 0, total_income: 0 });
    const [categories, setCategories] = useState({ expense: [], income: [] });
    const [showForm, setShowForm] = useState(false);
    const [editId, setEditId] = useState(null);
    const [form, setForm] = useState({ type: 'expense', category: '', title: '', amount: '', transaction_date: new Date().toISOString().split('T')[0], notes: '', reference_number: '' });

    const getConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

    useEffect(() => { fetchReportData(); }, [range]);
    useEffect(() => { fetchCategories(); }, []);

    const fetchReportData = async () => {
        setLoading(true);
        try {
            const [overviewRes, chartRes, lossRes, topRes, txRes] = await Promise.all([
                axios.get(`${API}/reports/overview?range=${range}`, getConfig()),
                axios.get(`${API}/reports/charts?range=${range}`, getConfig()),
                axios.get(`${API}/reports/losses?range=${range}`, getConfig()),
                axios.get(`${API}/reports/top-profitable?range=${range}`, getConfig()),
                axios.get(`${API}/external-transactions`, getConfig())
            ]);
            setSummary(overviewRes.data.summary);
            setChartData(chartRes.data);
            setLosses(lossRes.data);
            setTopProducts(topRes.data);
            setTransactions(txRes.data.transactions?.data || []);
            setTxStats(txRes.data.stats);
        } catch (error) { console.error("Error fetching report data:", error); }
        finally { setLoading(false); }
    };

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${API}/external-transactions/categories`, getConfig());
            setCategories(res.data);
        } catch (e) { console.error(e); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await axios.put(`${API}/external-transactions/${editId}`, form, getConfig());
                Swal.fire('Updated!', 'Transaction updated.', 'success');
            } else {
                await axios.post(`${API}/external-transactions`, form, getConfig());
                Swal.fire('Recorded!', 'Transaction added.', 'success');
            }
            resetForm();
            fetchReportData();
        } catch (err) {
            Swal.fire('Error', err.response?.data?.errors ? Object.values(err.response.data.errors).flat().join('\n') : 'Failed to save.', 'error');
        }
    };

    const handleEdit = (tx) => {
        setForm({ type: tx.type, category: tx.category, title: tx.title, amount: tx.amount, transaction_date: tx.transaction_date?.split('T')[0], notes: tx.notes || '', reference_number: tx.reference_number || '' });
        setEditId(tx.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        const result = await Swal.fire({ title: 'Delete this record?', icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Delete' });
        if (result.isConfirmed) {
            await axios.delete(`${API}/external-transactions/${id}`, getConfig());
            Swal.fire('Deleted!', '', 'success');
            fetchReportData();
        }
    };

    const resetForm = () => { setForm({ type: 'expense', category: '', title: '', amount: '', transaction_date: new Date().toISOString().split('T')[0], notes: '', reference_number: '' }); setEditId(null); setShowForm(false); };

    if (loading && !summary) return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8DB600]"></div></div>;

    const currentCats = form.type === 'expense' ? categories.expense : categories.income;

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Financial Reports</h2>
                    <div className="flex items-center gap-2 mt-1">
                        <p className="text-gray-500 text-sm italic">Track your pharmacy's financial performance at a glance.</p>
                    </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-1 bg-white p-1 rounded border border-gray-100 shadow-sm">
                        {[{ id: 'today', label: 'Today' }, { id: 'last_7_days', label: '7 Days' }, { id: 'this_month', label: 'Month' }, { id: 'year_to_date', label: 'YTD' }].map(btn => (
                            <button key={btn.id} onClick={() => setRange(btn.id)} className={`px-4 py-1.5 rounded text-xs font-bold transition-all ${range === btn.id ? 'bg-[#8DB600] text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}>{btn.label}</button>
                        ))}
                    </div>
                    <Link to="/admin/profit-loss" className="px-4 py-1.5 bg-[#8DB600] text-white rounded text-xs font-bold hover:bg-[#7a9e00] transition-all shadow-sm flex items-center gap-2 mt-1">
                        <ArrowRight size={14} />
                    </Link>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard title="Total Revenue" value={summary?.total_revenue} icon={<DollarSign className="text-blue-600" />} trend={summary?.revenue_trend} color="blue" />
                <StatCard title="Gross Profit" value={summary?.gross_profit} icon={<TrendingUp className="text-green-600" />} subtitle={`Margin: ${summary?.margin}%`} color="green" />
                <StatCard title="Inventory Losses" value={summary?.total_losses} icon={<AlertTriangle className="text-red-600" />} subtitle="Expired & Damaged" color="red" />
                <StatCard title="Operating Expenses" value={summary?.external_expenses} icon={<Wallet className="text-orange-600" />} subtitle="Utility & Bills" color="orange" />
                <StatCard title="Net Profit" value={summary?.net_profit} icon={<BarChart3 className="text-[#8DB600]" />} subtitle="Final Earnings" color="lime" />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded border border-gray-100 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-800 text-sm flex items-center gap-2 underline decoration-[#8DB600] decoration-2 underline-offset-4">
                            REVENUE VS PROFIT TREND
                        </h3>
                        <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest">
                            <div className="flex items-center gap-1.5 text-blue-500"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Revenue</div>
                            <div className="flex items-center gap-1.5 text-[#8DB600]"><div className="w-2 h-2 bg-[#8DB600] rounded-full"></div> Profit</div>
                        </div>
                    </div>
                    <div className="h-[250px] relative">
                        {chartData.length > 0 ? (
                            <div className="w-full h-full flex items-end gap-1 px-1">
                                {chartData.map((data, idx) => {
                                    const maxVal = Math.max(...chartData.map(d => parseFloat(d.revenue))) || 1;
                                    const revH = (parseFloat(data.revenue) / maxVal) * 100;
                                    const profH = (parseFloat(data.profit) / maxVal) * 100;
                                    return (
                                        <div key={idx} className="flex-1 flex flex-col justify-end group relative">
                                            <div className="w-full bg-blue-100/50 group-hover:bg-blue-100 transition-colors rounded-t-sm" style={{ height: `${revH}%` }}>
                                                <div className="w-full bg-[#8DB600]/40 rounded-t-sm" style={{ height: `${(profH / revH) * 100}%` }}></div>
                                            </div>
                                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-10">
                                                {new Date(data.date).toLocaleDateString()}: {parseFloat(data.revenue).toLocaleString()} Ks
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs italic border border-dashed border-gray-100 rounded">No sales data for this period</div>}
                    </div>
                </div>

                <div className="bg-white rounded border border-gray-100 shadow-sm p-6">
                    <h3 className="font-bold text-gray-800 text-sm mb-6 underline decoration-red-500 decoration-2 underline-offset-4">
                        LOSS DISTRIBUTION
                    </h3>
                    <div className="space-y-5">
                        {losses.length > 0 ? losses.map((loss, idx) => {
                            const totalLoss = losses.reduce((s, l) => s + parseFloat(l.value), 0);
                            const pct = (parseFloat(loss.value) / totalLoss) * 100;
                            return (
                                <div key={idx} className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-500"><span>{loss.reason}</span><span className="text-gray-800 font-bold">{parseFloat(loss.value).toLocaleString()} Ks</span></div>
                                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden"><div className={`h-full rounded-full ${loss.reason === 'expired' ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${pct}%` }}></div></div>
                                </div>
                            );
                        }) : <div className="text-center py-10 text-gray-300 text-xs italic">No losses recorded.</div>}
                    </div>
                </div>
            </div>

            {/* External Transactions Management */}
            <div className="bg-white rounded border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Receipt size={18} className="text-orange-500" />
                        <h3 className="font-bold text-gray-800 text-sm">EXTERNAL EXPENSES & INCOME</h3>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase">
                            <span className="text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">OUT: {parseFloat(txStats.total_expenses).toLocaleString()} Ks</span>
                            <span className="text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100">IN: {parseFloat(txStats.total_income).toLocaleString()} Ks</span>
                        </div>
                        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#8DB600] text-white rounded text-xs font-bold hover:bg-[#7a9e00] transition-colors shadow-sm">
                            <Plus size={14} /> ADD RECORD
                        </button>
                    </div>
                </div>

                {showForm && (
                    <div className="p-4 bg-white border-b border-gray-100">
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Type</label>
                                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value, category: '' })} className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs outline-none focus:border-[#8DB600]">
                                    <option value="expense">Expense</option>
                                    <option value="income">Income</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</label>
                                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs outline-none focus:border-[#8DB600]" required>
                                    <option value="">Select Category</option>
                                    {currentCats.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</label>
                                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Meter Bill" className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs outline-none focus:border-[#8DB600]" required />
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount (Ks)</label>
                                <div className="flex gap-1">
                                    <input type="number" step="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="w-full border border-gray-200 rounded px-2 py-1.5 text-xs outline-none focus:border-[#8DB600]" required />
                                    <button type="submit" className="px-4 bg-[#8DB600] text-white rounded text-[10px] font-black hover:bg-[#7a9e00]">{editId ? 'UPDATE' : 'SAVE'}</button>
                                    <button type="button" onClick={resetForm} className="px-2 bg-gray-100 text-gray-500 rounded hover:bg-gray-200"><X size={14} /></button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-black tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3">Date</th>
                                <th className="px-6 py-3">Category</th>
                                <th className="px-6 py-3">Description</th>
                                <th className="px-6 py-3 text-right">Amount</th>
                                <th className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {transactions.length > 0 ? transactions.slice(0, 5).map(tx => (
                                <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-3 text-gray-500">{new Date(tx.transaction_date).toLocaleDateString()}</td>
                                    <td className="px-6 py-3 text-gray-400 font-bold">{tx.category}</td>
                                    <td className="px-6 py-3 text-gray-800 font-bold">{tx.title}</td>
                                    <td className={`px-6 py-3 text-right font-black ${tx.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>{tx.type === 'expense' ? '-' : '+'}{parseFloat(tx.amount).toLocaleString()} Ks</td>
                                    <td className="px-6 py-3 text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <button onClick={() => handleEdit(tx)} className="p-1 border border-blue-100 text-blue-500 hover:bg-blue-500 hover:text-white rounded transition-colors"><Edit size={12} /></button>
                                            <button onClick={() => handleDelete(tx.id)} className="p-1 border border-red-100 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors"><Trash2 size={12} /></button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="5" className="px-6 py-10 text-center text-gray-300 italic">No external records found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Top Profitable Section */}
            <div className="bg-white rounded border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <ShoppingCart size={18} className="text-blue-500" />
                        <h3 className="font-bold text-gray-800 text-sm uppercase">TOP PROFITABLE MEDICINES</h3>
                    </div>
                    <Link to="/admin/top-profitable" className="text-[10px] font-black text-blue-500 hover:underline flex items-center gap-1">
                        VIEW FULL RANKING <ArrowRight size={14} />
                    </Link>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-black tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-3">Medicine Name</th>
                                <th className="px-6 py-3 text-center">Qty Sold</th>
                                <th className="px-6 py-3 text-right">Revenue</th>
                                <th className="px-6 py-3 text-right">Gross Profit</th>
                                <th className="px-6 py-3 text-center">Margin</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {topProducts.slice(0, 5).map((tp, idx) => {
                                const profit = parseFloat(tp.gross_profit), rev = parseFloat(tp.revenue), margin = rev > 0 ? (profit / rev) * 100 : 0;
                                return (
                                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-3 font-bold text-gray-700">{tp.product?.name}</td>
                                        <td className="px-6 py-3 text-center text-gray-500">{tp.units_sold}</td>
                                        <td className="px-6 py-3 text-right font-medium">{rev.toLocaleString()} Ks</td>
                                        <td className="px-6 py-3 text-right font-black text-[#8DB600]">{profit.toLocaleString()} Ks</td>
                                        <td className="px-6 py-3 text-center"><span className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-[10px] font-bold border border-green-100">{margin.toFixed(1)}%</span></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, trend, subtitle, color }) => {
    const isPositive = parseFloat(trend) >= 0;
    const colors = {
        blue: "bg-blue-50 border-blue-100 text-blue-600",
        green: "bg-green-50 border-green-100 text-green-600",
        red: "bg-red-50 border-red-100 text-red-600",
        orange: "bg-orange-50 border-orange-100 text-orange-600",
        lime: "bg-[#8DB600]/5 border-[#8DB600]/10 text-[#8DB600]"
    };
    return (
        <div className="bg-white p-4 rounded border border-gray-100 shadow-sm hover:border-[#8DB600] transition-all group">
            <div className="flex justify-between items-start mb-3">
                <div className={`p-1.5 rounded border ${colors[color]}`}>{React.cloneElement(icon, { size: 18 })}</div>
                {trend !== undefined && (
                    <div className={`flex items-center gap-0.5 text-[10px] font-black px-1.5 py-0.5 rounded ${isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}{Math.abs(trend)}%
                    </div>
                )}
            </div>
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{title}</h4>
            <div className="flex items-baseline gap-1">
                <span className="text-xl font-black text-gray-800">{parseFloat(value || 0).toLocaleString()}</span>
                <span className="text-[10px] font-bold text-gray-400">KS</span>
            </div>
            {subtitle && <p className="text-[10px] text-gray-400 font-medium mt-0.5">{subtitle}</p>}
        </div>
    );
};

export default AdminReports;
