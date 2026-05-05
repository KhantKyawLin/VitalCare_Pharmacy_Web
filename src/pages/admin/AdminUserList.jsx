import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
    Search, Plus, Shield, User, Stethoscope, 
    Key, Trash2, X, ActivitySquare, Mail, Phone, ChevronLeft, ChevronRight, UserCircle, Eye, AlertTriangle
} from 'lucide-react';

const AdminUserList = () => {
    const { token, user: currentUser } = useContext(AuthContext);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [creating, setCreating] = useState(false);
    
    // New Staff Form Data
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'staff',
        phone: '',
        gender: 'male',
    });
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        fetchUsers();
    }, [search, roleFilter, pagination.current_page]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/admin/users', {
                params: {
                    search: search,
                    role: roleFilter,
                    page: pagination.current_page,
                    per_page: 10
                },
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(response.data.data);
            setPagination({
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                total: response.data.total
            });
        } catch (error) {
            console.error("Failed to fetch users:", error);
            Swal.fire('Error', 'Failed to load users data.', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateStaff = async (e) => {
        e.preventDefault();
        setCreating(true);
        setFormErrors({});

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/admin/staff', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.status === 201) {
                Swal.fire({
                    icon: 'success',
                    title: 'Account Created',
                    html: `
                        <div class="text-left mt-4">
                            <p><strong>Name:</strong> ${response.data.user.name}</p>
                            <p><strong>Email:</strong> ${response.data.user.email}</p>
                            <p><strong>Role:</strong> <span class="capitalize">${response.data.user.role}</span></p>
                            <div class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p class="text-sm text-yellow-800 mb-2"><strong>Temporary Password:</strong></p>
                                <p class="text-xl font-mono font-bold text-center tracking-wider">${response.data.temporary_password}</p>
                                <p class="text-xs text-yellow-600 mt-2 text-center">Please copy this and share it securely. It will only be shown once.</p>
                            </div>
                        </div>
                    `,
                    confirmButtonColor: '#8DB600',
                    confirmButtonText: 'I have copied the password'
                });
                setIsCreateModalOpen(false);
                setFormData({ name: '', email: '', role: 'staff', phone: '', gender: 'male' });
                fetchUsers();
            }
        } catch (error) {
            if (error.response?.status === 422) {
                setFormErrors(error.response.data);
            } else {
                Swal.fire('Error', error.response?.data?.error || 'Failed to create account.', 'error');
            }
        } finally {
            setCreating(false);
        }
    };

    const handleDeleteUser = async (id, name, role) => {
        if (['admin', 'superadmin'].includes(role)) {
            Swal.fire('Restricted', 'Admin accounts cannot be deleted from this interface.', 'warning');
            return;
        }

        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete the account for ${name}. This action cannot be undone.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Yes, delete account'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/admin/users/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                Swal.fire('Deleted!', 'User account has been deleted.', 'success');
                fetchUsers();
            } catch (error) {
                Swal.fire('Error', error.response?.data?.error || 'Failed to delete user.', 'error');
            }
        }
    };

    const handleResetPassword = async (id, name) => {
        const result = await Swal.fire({
            title: 'Reset Password?',
            text: `Generate a new temporary password for ${name}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#8DB600',
            confirmButtonText: 'Yes, reset it'
        });

        if (result.isConfirmed) {
            try {
                const response = await axios.post(`http://127.0.0.1:8000/api/admin/users/${id}/reset-password`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                Swal.fire({
                    icon: 'success',
                    title: 'Password Reset Successful',
                    html: `
                        <div class="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-left">
                            <p class="text-sm text-yellow-800 mb-2"><strong>New Temporary Password:</strong></p>
                            <p class="text-xl font-mono font-bold text-center tracking-wider">${response.data.new_password}</p>
                            <p class="text-xs text-yellow-600 mt-2 text-center">Please share this securely with ${name}.</p>
                        </div>
                    `,
                    confirmButtonColor: '#8DB600'
                });
            } catch (error) {
                Swal.fire('Error', 'Failed to reset password.', 'error');
            }
        }
    };

    const handleViewUser = (user) => {
        setSelectedUser(user);
        setIsViewModalOpen(true);
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'superadmin':
            case 'admin':
                return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider"><Shield size={12} /> Admin</span>;
            case 'pharmacist':
                return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider"><Stethoscope size={12} /> Pharmacist</span>;
            case 'staff':
                return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider"><ActivitySquare size={12} /> Staff</span>;
            default:
                return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider"><User size={12} /> Customer</span>;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-md shadow-sm border border-slate-100">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">User Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage staff accounts, customer profiles, and system access.</p>
                </div>
                {['admin', 'superadmin'].includes(currentUser?.role) && (
                    <button 
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2 bg-[#8DB600] text-white px-5 py-2.5 rounded font-bold shadow-lg shadow-[#8DB600]/20 hover:bg-[#769900] hover:scale-105 transition-all"
                    >
                        <Plus size={18} strokeWidth={3} />
                        Add New Staff
                    </button>
                )}
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-md shadow-sm border border-slate-100">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Search users by name or email..." 
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPagination(prev => ({...prev, current_page: 1}));
                        }}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-[#8DB600]/20 focus:border-[#8DB600] transition-all"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                    {['', 'admin', 'pharmacist', 'staff', 'user'].map((role) => (
                        <button
                            key={role}
                            onClick={() => {
                                setRoleFilter(role);
                                setPagination(prev => ({...prev, current_page: 1}));
                            }}
                            className={`px-4 py-2.5 rounded text-sm font-bold whitespace-nowrap transition-all ${
                                roleFilter === role 
                                ? 'bg-[#8DB600] text-white shadow-md' 
                                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                        >
                            {role === '' ? 'All Users' : role.charAt(0).toUpperCase() + role.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-md shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-xs uppercase tracking-wider text-slate-500">
                                <th className="p-4 font-bold">User</th>
                                <th className="p-4 font-bold">Role</th>
                                <th className="p-4 font-bold">Contact</th>
                                <th className="p-4 font-bold">Joined Date</th>
                                <th className="p-4 font-bold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <div className="w-8 h-8 border-4 border-[#8DB600]/30 border-t-[#8DB600] rounded-full animate-spin mb-4"></div>
                                            <p className="font-medium">Loading users...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                                <Search size={24} className="text-slate-300" />
                                            </div>
                                            <p className="text-lg font-bold text-slate-600">No users found</p>
                                            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                users.map((u) => (
                                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 shrink-0 overflow-hidden">
                                                    {u.profile ? (
                                                        <img src={`http://127.0.0.1:8000/storage/${u.profile}`} alt={u.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <UserCircle size={20} />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-bold text-slate-800">{u.name}</p>
                                                        {u.pending_resets_count > 0 && (
                                                            <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-red-100 text-red-600 text-[9px] font-black uppercase tracking-tighter animate-pulse border border-red-200 shadow-sm">
                                                                <AlertTriangle size={10} strokeWidth={3} /> Reset Req
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-500">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {getRoleBadge(u.role)}
                                        </td>
                                        <td className="p-4">
                                            <div className="text-sm text-slate-600">
                                                {u.phone ? (
                                                    <span className="flex items-center gap-1"><Phone size={12}/> {u.phone}</span>
                                                ) : (
                                                    <span className="text-slate-400 italic">No phone</span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="text-sm font-medium text-slate-700">
                                                {new Date(u.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                            </p>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-1">
                                                 <button 
                                                     onClick={() => handleViewUser(u)}
                                                     className="p-1.5 border border-[#00b0e4]/30 text-[#00b0e4] hover:bg-[#00b0e4] hover:text-white rounded transition-colors shadow-sm bg-white cursor-pointer"
                                                     title="View Details"
                                                 >
                                                     <Eye size={14} strokeWidth={2.5} />
                                                 </button>
                                                {['admin', 'superadmin'].includes(currentUser?.role) && u.id !== currentUser.id && (
                                                    <>
                                                         <button 
                                                             onClick={() => handleResetPassword(u.id, u.name)}
                                                             className={`p-1.5 border rounded transition-colors shadow-sm cursor-pointer ${
                                                                 u.pending_resets_count > 0 
                                                                 ? 'bg-amber-500 border-amber-600 text-white hover:bg-amber-600 animate-bounce mt-[-4px]' 
                                                                 : 'bg-white border-amber-500/30 text-amber-500 hover:bg-amber-500 hover:text-white'
                                                             }`}
                                                             title={u.pending_resets_count > 0 ? "Pending Reset Request!" : "Reset Password"}
                                                         >
                                                             <Key size={14} strokeWidth={2.5} />
                                                         </button>
                                                         {!['admin', 'superadmin'].includes(u.role) && (
                                                             <button 
                                                                 onClick={() => handleDeleteUser(u.id, u.name, u.role)}
                                                                 className="p-1.5 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors shadow-sm bg-white cursor-pointer"
                                                                 title="Delete User"
                                                             >
                                                                 <Trash2 size={14} strokeWidth={2.5} />
                                                             </button>
                                                         )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                
                {/* Pagination */}
                {pagination.last_page > 1 && (
                    <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <p className="text-sm text-slate-500">
                            Showing page <span className="font-bold text-slate-700">{pagination.current_page}</span> of <span className="font-bold text-slate-700">{pagination.last_page}</span>
                        </p>
                        <div className="flex gap-2">
                            <button 
                                disabled={pagination.current_page === 1}
                                onClick={() => setPagination(prev => ({...prev, current_page: prev.current_page - 1}))}
                                className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button 
                                disabled={pagination.current_page === pagination.last_page}
                                onClick={() => setPagination(prev => ({...prev, current_page: prev.current_page + 1}))}
                                className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create Staff Modal */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded bg-[#8DB600]/10 flex items-center justify-center text-[#8DB600]">
                                    <Shield size={20} />
                                </div>
                                <div>
                                    <h2 className="font-black text-xl text-slate-800">Add New Staff</h2>
                                    <p className="text-xs text-slate-500 font-medium mt-0.5">Create a new pharmacist or staff account.</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsCreateModalOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        
                        <form onSubmit={handleCreateStaff} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Full Name *</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            required
                                            className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${formErrors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-[#8DB600] focus:ring-[#8DB600]/20'} rounded focus:outline-none focus:ring-2 transition-all`}
                                            placeholder="Enter full name"
                                        />
                                    </div>
                                    {formErrors.name && <p className="text-xs text-red-500 ml-1">{formErrors.name[0]}</p>}
                                </div>

                                <div className="space-y-2 md:col-span-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email Address *</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            required
                                            className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border ${formErrors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-slate-200 focus:border-[#8DB600] focus:ring-[#8DB600]/20'} rounded focus:outline-none focus:ring-2 transition-all`}
                                            placeholder="staff@vitalcare.com"
                                        />
                                    </div>
                                    {formErrors.email && <p className="text-xs text-red-500 ml-1">{formErrors.email[0]}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Role *</label>
                                    <select
                                        value={formData.role}
                                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-[#8DB600]/20 focus:border-[#8DB600] transition-all font-medium"
                                    >
                                        <option value="staff">Staff</option>
                                        <option value="pharmacist">Pharmacist</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Gender</label>
                                    <select
                                        value={formData.gender}
                                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-[#8DB600]/20 focus:border-[#8DB600] transition-all font-medium"
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="others">Others</option>
                                    </select>
                                </div>
                            </div>
                            
                            <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsCreateModalOpen(false)}
                                    className="px-6 py-2.5 rounded font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex items-center gap-2 px-6 py-2.5 rounded font-bold text-white bg-[#8DB600] hover:bg-[#769900] shadow-lg shadow-[#8DB600]/20 disabled:opacity-50 transition-all"
                                >
                                    {creating ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <Plus size={18} strokeWidth={3} />
                                    )}
                                    Create Account
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View User Modal */}
            {isViewModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-md shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 border border-slate-200">
                        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded bg-[#8DB600]/10 flex items-center justify-center text-[#8DB600]">
                                    <User size={20} />
                                </div>
                                <div>
                                    <h2 className="font-black text-lg text-slate-800">User Profile</h2>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Information Details</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsViewModalOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-6">
                            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded border border-slate-100">
                                <div className="w-16 h-16 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-300 overflow-hidden shadow-sm">
                                    {selectedUser.profile ? (
                                        <img src={`http://127.0.0.1:8000/storage/${selectedUser.profile}`} alt={selectedUser.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <UserCircle size={40} />
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-800">{selectedUser.name}</h3>
                                    <div className="mt-1">{getRoleBadge(selectedUser.role)}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email Address</p>
                                    <p className="text-sm font-bold text-slate-700 flex items-center gap-2"><Mail size={14} className="text-[#8DB600]" /> {selectedUser.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone Number</p>
                                    <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                        <Phone size={14} className="text-[#8DB600]" /> 
                                        {selectedUser.phone || <span className="text-slate-400 italic font-normal">Not Provided</span>}
                                    </p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gender</p>
                                    <p className="text-sm font-bold text-slate-700 capitalize">{selectedUser.gender || 'Not Specified'}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Joined Date</p>
                                    <p className="text-sm font-bold text-slate-700">
                                        {new Date(selectedUser.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                    </p>
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</p>
                                    <p className="text-sm font-bold text-slate-700 bg-slate-50 p-3 rounded border border-slate-100 min-h-[60px]">
                                        {selectedUser.address || <span className="text-slate-400 italic font-normal">No address on file</span>}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                            <button
                                onClick={() => setIsViewModalOpen(false)}
                                className="px-6 py-2 bg-[#8DB600] text-white rounded font-bold hover:bg-[#769900] shadow-md transition-all active:scale-95"
                            >
                                Close Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUserList;
