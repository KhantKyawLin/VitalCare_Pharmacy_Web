import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Truck, 
    Plus, 
    Search,
    Edit, 
    Trash2, 
    Eye,
    Filter,
    Package,
    ClipboardList,
    Link as LinkIcon,
    Download
} from 'lucide-react';
import Swal from 'sweetalert2';

const AdminSupplierList = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [stats, setStats] = useState({
        total_suppliers: 0,
        avg_products: 0,
        total_orders: 0
    });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const getConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://127.0.0.1:8000/api/admin/suppliers', getConfig());
            setSuppliers(res.data.suppliers);
            setStats(res.data.stats);
        } catch (error) {
            console.error("Error fetching suppliers:", error);
            Swal.fire('Error', 'Failed to load suppliers', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUpdate = async (supplier = null) => {
        const isEditing = !!supplier;
        
        const { value: formValues } = await Swal.fire({
            title: isEditing ? 'Update Supplier' : 'Add New Supplier',
            html: `
                <div class="flex flex-col gap-4 text-left">
                    <div>
                        <label class="text-sm font-bold text-gray-700 ml-1">Supplier Name *</label>
                        <input id="swal-input-name" class="swal2-input !w-full !m-0 !mt-1" placeholder="Enter name" value="${supplier?.name || ''}">
                    </div>
                    <div>
                        <label class="text-sm font-bold text-gray-700 ml-1">Phone Number</label>
                        <input id="swal-input-phone" class="swal2-input !w-full !m-0 !mt-1" placeholder="Enter phone" value="${supplier?.phone || ''}">
                    </div>
                    <div>
                        <label class="text-sm font-bold text-gray-700 ml-1">Address</label>
                        <textarea id="swal-input-address" class="swal2-textarea !w-full !m-0 !mt-1" placeholder="Enter full address">${supplier?.address || ''}</textarea>
                    </div>
                </div>
            `,
            focusConfirm: false,
            showCancelButton: true,
            confirmButtonText: isEditing ? 'Update Supplier' : 'Save Supplier',
            confirmButtonColor: '#8DB600',
            preConfirm: () => {
                const name = document.getElementById('swal-input-name').value;
                const phone = document.getElementById('swal-input-phone').value;
                const address = document.getElementById('swal-input-address').value;
                
                if (!name) {
                    Swal.showValidationMessage('Supplier name is required');
                    return false;
                }
                return { name, phone, address };
            }
        });

        if (formValues) {
            try {
                if (isEditing) {
                    await axios.put(`http://127.0.0.1:8000/api/admin/suppliers/${supplier.id}`, formValues, getConfig());
                    Swal.fire('Updated!', 'Supplier updated successfully.', 'success');
                } else {
                    await axios.post('http://127.0.0.1:8000/api/admin/suppliers', formValues, getConfig());
                    Swal.fire('Added!', 'New supplier added.', 'success');
                }
                fetchSuppliers();
            } catch (error) {
                const msg = error.response?.data?.message || 'Failed to save supplier.';
                Swal.fire('Error', msg, 'error');
            }
        }
    };

    const handleDelete = async (id, name) => {
        const result = await Swal.fire({
            title: `Are you sure?`,
            text: `Remove ${name} from your suppliers?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/admin/suppliers/${id}`, getConfig());
                Swal.fire('Deleted!', 'Supplier has been deleted.', 'success');
                fetchSuppliers();
            } catch (error) {
                Swal.fire('Error', 'Failed to delete supplier. Ensure they have no active dependencies.', 'error');
            }
        }
    };

    const openSupplierDetail = (supplier) => {
        Swal.fire({
            title: `<div class="flex items-center gap-3 text-left"><div class="w-10 h-10 bg-green-50 text-[#8DB600] rounded-xl flex items-center justify-center font-bold">${supplier.name.substring(0,1)}</div><div class="text-xl font-bold">${supplier.name}</div></div>`,
            html: `
                <div class="text-left mt-4 space-y-4">
                    <div class="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col gap-1">
                        <span class="text-xs text-gray-500 font-bold uppercase tracking-wider">Contact Phone</span>
                        <span class="font-semibold text-gray-800">${supplier.phone || 'N/A'}</span>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col gap-1">
                        <span class="text-xs text-gray-500 font-bold uppercase tracking-wider">Location Address</span>
                        <span class="font-semibold text-gray-800">${supplier.address || 'N/A'}</span>
                    </div>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="bg-[#8DB600]/10 p-4 rounded-xl border border-[#8DB600]/20 flex flex-col items-center justify-center">
                            <span class="text-2xl font-black text-[#8DB600]">${supplier.products_count || 0}</span>
                            <span class="text-[10px] text-gray-600 font-bold uppercase">Products</span>
                        </div>
                        <div class="bg-[#3b82f6]/10 p-4 rounded-xl border border-[#3b82f6]/20 flex flex-col items-center justify-center">
                            <span class="text-2xl font-black text-[#3b82f6]">${supplier.purchases_count || 0}</span>
                            <span class="text-[10px] text-gray-600 font-bold uppercase">Orders</span>
                        </div>
                    </div>
                </div>
            `,
            confirmButtonText: 'Close',
            confirmButtonColor: '#4b5563',
            customClass: {
                popup: 'rounded-2xl'
            }
        });
    };

    const filteredSuppliers = search 
        ? suppliers.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || (s.phone && s.phone.includes(search)))
        : suppliers;

    return (
        <div className="space-y-6 pt-2 pb-8 max-w-[1500px] mx-auto px-4 sm:px-6">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <Truck size={28} className="text-gray-800" strokeWidth={2.5}/>
                    <h2 className="text-[24px] text-gray-800 font-bold">Suppliers Management</h2>
                </div>
                <button 
                    onClick={() => handleCreateUpdate()}
                    className="bg-[#8DB600] hover:bg-[#7a9d00] text-white px-5 py-2.5 rounded font-bold flex items-center gap-2 shadow-lg shadow-[#8DB600]/20 transition-all active:scale-95"
                >
                    <Plus size={20} className="stroke-2"/>
                    Add New Supplier
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-6 flex justify-between items-start border border-gray-100">
                    <div>
                        <p className="text-[13px] text-gray-500 mb-1 font-bold">Total Suppliers</p>
                        <h3 className="text-3xl font-black text-gray-800">{stats.total_suppliers}</h3>
                        <p className="text-[12px] text-gray-400 mt-2 font-medium">In your network</p>
                    </div>
                    <div className="bg-[#8DB600]/10 p-3 rounded text-[#8DB600]">
                        <Truck size={28} />
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-6 flex justify-between items-start border border-gray-100">
                    <div>
                        <p className="text-[13px] text-gray-500 mb-1 font-bold">Avg. Products</p>
                        <h3 className="text-3xl font-black text-gray-800">{stats.avg_products}</h3>
                        <p className="text-[12px] text-gray-400 mt-2 font-medium">Per supplier</p>
                    </div>
                    <div className="bg-[#0ea5e9]/10 p-3 rounded text-[#0ea5e9]">
                        <Package size={28} />
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-6 flex justify-between items-start border border-gray-100">
                    <div>
                        <p className="text-[13px] text-gray-500 mb-1 font-bold">Total Orders</p>
                        <h3 className="text-3xl font-black text-gray-800">{stats.total_orders}</h3>
                        <p className="text-[12px] text-gray-400 mt-2 font-medium">All time</p>
                    </div>
                    <div className="bg-[#fbbf24]/10 p-3 rounded text-[#fbbf24]">
                        <ClipboardList size={28} />
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-2xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 overflow-hidden">
                {/* Toolbar */}
                <div className="flex flex-col md:flex-row justify-between items-center p-6 gap-4 border-b border-gray-100">
                    <h3 className="text-[18px] font-bold text-gray-800 flex items-center gap-2">
                        <ListIcon />
                        All Suppliers
                    </h3>
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex w-full md:w-64 rounded overflow-hidden border border-gray-200 focus-within:border-[#8DB600] focus-within:ring-2 focus-within:ring-[#8DB600]/30 transition-all text-gray-600 group">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#8DB600]" />
                            <input 
                                type="text" 
                                className="w-full pl-9 pr-4 text-[13px] border-none outline-none py-2.5 font-medium bg-transparent"
                                placeholder="Search suppliers..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[13px] whitespace-nowrap">
                        <thead className="text-gray-500 bg-gray-50/50">
                            <tr>
                                <th className="py-4 px-6 font-bold text-gray-600">Supplier</th>
                                <th className="py-4 px-6 font-bold text-gray-600">Phone</th>
                                <th className="py-4 px-6 font-bold text-gray-600">Address</th>
                                <th className="py-4 px-6 font-bold text-gray-600">Products</th>
                                <th className="py-4 px-6 font-bold text-gray-600">Orders</th>
                                <th className="py-4 px-6 font-bold text-gray-600 text-center w-32">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="border-b border-gray-50">
                                        <td colSpan="6" className="py-5 px-6"><div className="h-4 bg-gray-100 rounded animate-pulse w-full"></div></td>
                                    </tr>
                                ))
                            ) : filteredSuppliers.length > 0 ? filteredSuppliers.map((supplier) => (
                                <tr key={supplier.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                    <td className="py-4 px-6">
                                        <span className="font-bold text-gray-800 text-[14px]">{supplier.name}</span>
                                    </td>
                                    <td className="py-4 px-6 font-medium text-gray-600">{supplier.phone || '-'}</td>
                                    <td className="py-4 px-6 font-medium text-gray-600 truncate max-w-[200px]" title={supplier.address}>
                                        {supplier.address || '-'}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="font-bold text-gray-800 bg-gray-100 px-2.5 py-1 rounded">
                                            {supplier.products_count || 0}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className="font-bold text-gray-800 bg-gray-100 px-2.5 py-1 rounded">
                                            {supplier.purchases_count || 0}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                onClick={() => openSupplierDetail(supplier)}
                                                className="p-1.5 border border-[#0ea5e9]/30 text-[#0ea5e9] hover:bg-[#0ea5e9] hover:text-white rounded transition-colors bg-white hover:shadow-md"
                                                title="View"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleCreateUpdate(supplier)}
                                                className="p-1.5 border border-[#3b82f6]/30 text-[#3b82f6] hover:bg-[#3b82f6] hover:text-white rounded transition-colors bg-white hover:shadow-md"
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(supplier.id, supplier.name)}
                                                className="p-1.5 border border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444] hover:text-white rounded transition-colors bg-white hover:shadow-md"
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="py-16 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center opacity-50">
                                            <Truck size={40} className="mb-2"/>
                                            <p className="font-bold text-[15px]">No suppliers found</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom Operation Cards mapped to UI */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 object-cover hover:shadow-md transition-shadow cursor-pointer group">
                    <h4 className="text-[16px] font-bold text-gray-800 flex items-center gap-2 mb-4">
                        <LinkIcon size={18} className="text-gray-500" /> Supplier Links
                    </h4>
                    <div className="flex items-center gap-4">
                        <div className="bg-[#8DB600]/10 p-3 rounded text-[#8DB600] group-hover:bg-[#8DB600] group-hover:text-white transition-colors">
                            <Package size={20} />
                        </div>
                        <div>
                            <p className="text-[#3b82f6] font-bold text-sm">Manage Product Links</p>
                            <p className="text-xs text-gray-500 mt-0.5">Connect products to suppliers</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 object-cover hover:shadow-md transition-shadow cursor-pointer group">
                    <h4 className="text-[16px] font-bold text-gray-800 flex items-center gap-2 mb-4">
                        <Truck size={18} className="text-gray-500" /> Bulk Operations
                    </h4>
                    <div className="flex items-center gap-4">
                        <div className="bg-[#8DB600]/10 p-3 rounded text-[#8DB600] group-hover:bg-[#8DB600] group-hover:text-white transition-colors">
                            <Download size={20} />
                        </div>
                        <div>
                            <p className="text-[#3b82f6] font-bold text-sm">Export Suppliers</p>
                            <p className="text-xs text-gray-500 mt-0.5">Download supplier data</p>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

// Add a tiny placeholder list icon component since lucide 'List' might conflict with other imports and we want it simple
const ListIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#8DB600]"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
);

export default AdminSupplierList;
