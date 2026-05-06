import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Search, 
    Filter, 
    Calendar, 
    User, 
    Activity, 
    Info, 
    ChevronLeft, 
    ChevronRight,
    Trash2,
    ShieldAlert,
    Clock,
    Terminal,
    Eye,
    RefreshCcw
} from 'lucide-react';
import Swal from 'sweetalert2';

const API = 'http://127.0.0.1:8000/api/admin/activity-logs';

const AdminActivityLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        user_id: 'all',
        action: 'all',
        start_date: '',
        end_date: '',
        search: '',
        page: 1,
        per_page: 50
    });
    const [availableFilters, setAvailableFilters] = useState({ users: [], actions: [] });
    const [pagination, setPagination] = useState(null);
    const [selectedLog, setSelectedLog] = useState(null);

    const getConfig = () => ({
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });

    useEffect(() => {
        fetchFilters();
    }, []);

    useEffect(() => {
        fetchLogs();
    }, [filters.page, filters.user_id, filters.action, filters.start_date, filters.end_date]);

    const fetchFilters = async () => {
        try {
            const res = await axios.get(`${API}/filters`, getConfig());
            setAvailableFilters(res.data);
        } catch (e) { console.error(e); }
    };

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams(filters).toString();
            const res = await axios.get(`${API}?${params}`, getConfig());
            setLogs(res.data.data);
            setPagination(res.data);
        } catch (e) {
            console.error(e);
            Swal.fire('Error', 'Failed to fetch logs', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchLogs();
    };

    const handleCleanup = async () => {
        const { value: days } = await Swal.fire({
            title: 'Cleanup Old Logs',
            text: 'Delete logs older than a certain number of days.',
            input: 'number',
            inputValue: 30,
            inputLabel: 'Days to keep',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            confirmButtonText: 'Cleanup Now'
        });

        if (days) {
            try {
                const res = await axios.delete(`${API}/cleanup?days=${days}`, getConfig());
                Swal.fire('Cleaned!', res.data.message, 'success');
                fetchLogs();
            } catch (e) {
                Swal.fire('Error', 'Cleanup failed', 'error');
            }
        }
    };

    const viewLogDetails = (log) => {
        setSelectedLog(log);
    };

    const getActionColor = (action) => {
        const a = action.toLowerCase();
        if (a.includes('create') || a.includes('add')) return 'text-green-600 bg-green-50 border-green-100';
        if (a.includes('update') || a.includes('edit')) return 'text-blue-600 bg-blue-50 border-blue-100';
        if (a.includes('delete') || a.includes('remove')) return 'text-red-600 bg-red-50 border-red-100';
        if (a.includes('password')) return 'text-purple-600 bg-purple-50 border-purple-100';
        return 'text-gray-600 bg-gray-50 border-gray-100';
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Terminal className="text-primary-green" /> System Activity Logs
                    </h2>
                    <p className="text-gray-500 text-sm italic mt-1">Audit trail of all administrative and staff actions.</p>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={fetchLogs}
                        className="p-2 bg-white border border-gray-200 rounded text-gray-600 hover:text-primary-green transition-colors shadow-sm"
                        title="Refresh Logs"
                    >
                        <RefreshCcw size={18} />
                    </button>
                    <button 
                        onClick={handleCleanup}
                        className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 border border-red-100 rounded text-xs font-bold hover:bg-red-100 transition-all shadow-sm uppercase"
                    >
                        <Trash2 size={14} /> Cleanup
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-4 rounded border border-gray-100 shadow-sm space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <form onSubmit={handleSearch} className="lg:col-span-2 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input 
                            type="text" 
                            name="search"
                            placeholder="Search description, IP, or type..."
                            value={filters.search}
                            onChange={handleFilterChange}
                            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded text-xs focus:ring-1 focus:ring-primary-green outline-none transition-all"
                        />
                    </form>
                    
                    <select 
                        name="user_id"
                        value={filters.user_id}
                        onChange={handleFilterChange}
                        className="w-full px-2 py-2 bg-white border border-gray-200 rounded text-[11px] font-bold uppercase outline-none cursor-pointer"
                    >
                        <option value="all">ALL USERS</option>
                        {availableFilters.users.map(u => (
                            <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                        ))}
                    </select>

                    <select 
                        name="action"
                        value={filters.action}
                        onChange={handleFilterChange}
                        className="w-full px-2 py-2 bg-white border border-gray-200 rounded text-[11px] font-bold uppercase outline-none cursor-pointer"
                    >
                        <option value="all">ALL ACTIONS</option>
                        {availableFilters.actions.map(a => (
                            <option key={a} value={a}>{a.toUpperCase()}</option>
                        ))}
                    </select>

                    <div className="flex gap-2">
                        <input 
                            type="date" 
                            name="start_date"
                            value={filters.start_date}
                            onChange={handleFilterChange}
                            className="w-1/2 px-2 py-2 bg-white border border-gray-200 rounded text-[11px] font-bold outline-none"
                        />
                        <input 
                            type="date" 
                            name="end_date"
                            value={filters.end_date}
                            onChange={handleFilterChange}
                            className="w-1/2 px-2 py-2 bg-white border border-gray-200 rounded text-[11px] font-bold outline-none"
                        />
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded border border-gray-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead className="bg-gray-50/50 text-gray-400 uppercase text-[10px] font-black tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Time & User</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4">Description</th>
                                <th className="px-6 py-4">IP Address</th>
                                <th className="px-6 py-4 text-center">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                Array(10).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan="5" className="px-6 py-4 h-12 bg-gray-50/20"></td>
                                    </tr>
                                ))
                            ) : logs.length > 0 ? logs.map(log => (
                                <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold shrink-0">
                                                {log.user?.name?.charAt(0) || '?'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-800">{log.user?.name || 'System'}</div>
                                                <div className="text-[10px] text-gray-400 flex items-center gap-1">
                                                    <Clock size={10} /> {new Date(log.created_at).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase border ${getActionColor(log.action)}`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-600 line-clamp-1 max-w-md font-medium" title={log.description}>
                                            {log.description}
                                        </div>
                                        {log.model_type && (
                                            <div className="text-[10px] text-gray-400 uppercase tracking-tighter mt-0.5">
                                                {log.model_type} #{log.model_id}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-gray-400 font-mono text-[10px]">
                                        {log.ip_address}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button 
                                            onClick={() => viewLogDetails(log)}
                                            className="p-1.5 text-gray-400 hover:text-primary-green hover:bg-primary-light rounded transition-all"
                                        >
                                            <Eye size={16} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400 italic">
                                        <Activity size={48} className="mx-auto mb-4 text-gray-200" />
                                        No logs found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination && pagination.last_page > 1 && (
                    <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex justify-between items-center">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Showing {logs.length} of {pagination.total} entries
                        </span>
                        <div className="flex gap-2">
                            <button 
                                disabled={filters.page === 1}
                                onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                                className="p-2 border border-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white transition-all"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <div className="flex items-center px-4 text-xs font-bold text-gray-700">
                                Page {filters.page} of {pagination.last_page}
                            </div>
                            <button 
                                disabled={filters.page === pagination.last_page}
                                onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                                className="p-2 border border-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white transition-all"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Log Details Modal */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col border border-gray-200 scale-in">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <div className="flex items-center gap-2">
                                <Info size={20} className="text-primary-green" />
                                <h3 className="font-bold text-gray-800 text-lg">Log Activity Details</h3>
                            </div>
                            <button onClick={() => setSelectedLog(null)} className="p-1.5 hover:bg-gray-200 rounded-full transition-colors">
                                <Search size={20} className="rotate-45" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Performed By</span>
                                    <div className="font-bold text-gray-800 text-base">{selectedLog.user?.name || 'System'}</div>
                                    <div className="text-xs text-gray-500">{selectedLog.user?.email || 'N/A'}</div>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Timestamp</span>
                                    <div className="font-bold text-gray-800 text-base">{new Date(selectedLog.created_at).toLocaleString()}</div>
                                    <div className="text-xs text-gray-500 font-mono">{selectedLog.ip_address}</div>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Action</span>
                                    <span className={`px-3 py-1 rounded-full text-[11px] font-black uppercase border ${getActionColor(selectedLog.action)}`}>
                                        {selectedLog.action}
                                    </span>
                                </div>
                                <div>
                                    <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Target Object</span>
                                    <div className="font-bold text-gray-800 text-sm">{selectedLog.model_type || 'None'}</div>
                                    <div className="text-xs text-gray-500 italic">ID: {selectedLog.model_id || 'N/A'}</div>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                                <span className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Description</span>
                                <p className="text-gray-700 text-sm font-medium leading-relaxed">{selectedLog.description}</p>
                            </div>

                            {/* Data Changes */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <span className="block text-[10px] font-black text-red-400 uppercase tracking-widest">Old Values</span>
                                    <div className="bg-red-50/30 p-3 rounded border border-red-50 overflow-x-auto max-h-48 overflow-y-auto">
                                        {selectedLog.old_values ? (
                                            <pre className="text-[10px] font-mono text-red-600">
                                                {JSON.stringify(selectedLog.old_values, null, 2)}
                                            </pre>
                                        ) : <span className="text-[10px] italic text-gray-400">No previous values</span>}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <span className="block text-[10px] font-black text-green-400 uppercase tracking-widest">New Values</span>
                                    <div className="bg-green-50/30 p-3 rounded border border-green-50 overflow-x-auto max-h-48 overflow-y-auto">
                                        {selectedLog.new_values ? (
                                            <pre className="text-[10px] font-mono text-green-600">
                                                {JSON.stringify(selectedLog.new_values, null, 2)}
                                            </pre>
                                        ) : <span className="text-[10px] italic text-gray-400">No new values</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                            <button 
                                onClick={() => setSelectedLog(null)}
                                className="px-6 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-100 transition-all uppercase tracking-widest"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{ __html: `
                .scale-in { animation: scaleIn 0.2s ease-out; }
                @keyframes scaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            ` }} />
        </div>
    );
};

export default AdminActivityLogs;
