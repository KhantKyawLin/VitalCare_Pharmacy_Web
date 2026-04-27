import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Plus, 
    Search, 
    Edit, 
    Trash2, 
    Tag,
    Package,
    Calculator,
    Star,
    LayoutGrid,
    X
} from 'lucide-react';
import Swal from 'sweetalert2';

const AdminCategoryList = () => {
    const [categories, setCategories] = useState([]);
    const [stats, setStats] = useState({
        total_categories: 0,
        total_products: 0,
        avg_products: 0,
        top_category: null
    });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({ name: '' });
    const [saving, setSaving] = useState(false);

    const getConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/admin/categories`, getConfig());
            setCategories(response.data.categories);
            setStats(response.data.stats);
        } catch (error) {
            console.error("Error fetching categories:", error);
            Swal.fire('Error', 'Failed to load categories', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({ name: category.name });
        } else {
            setEditingCategory(null);
            setFormData({ name: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({ name: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editingCategory) {
                await axios.put(`http://127.0.0.1:8000/api/admin/categories/${editingCategory.id}`, formData, getConfig());
                Swal.fire({
                    icon: 'success',
                    title: 'Updated!',
                    text: 'Category has been updated successfully.',
                    timer: 1500,
                    showConfirmButton: false
                });
            } else {
                await axios.post(`http://127.0.0.1:8000/api/admin/categories`, formData, getConfig());
                Swal.fire({
                    icon: 'success',
                    title: 'Created!',
                    text: 'New category has been added successfully.',
                    timer: 1500,
                    showConfirmButton: false
                });
            }
            handleCloseModal();
            fetchCategories();
        } catch (error) {
            const message = error.response?.data?.name?.[0] || 'Something went wrong';
            Swal.fire('Error', message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id, name) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You want to delete category "${name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/admin/categories/${id}`, getConfig());
                Swal.fire('Deleted!', 'Category has been deleted.', 'success');
                fetchCategories();
            } catch (error) {
                Swal.fire('Error', 'Failed to delete category. It might be in use.', 'error');
            }
        }
    };

    const filteredCategories = categories.filter(cat => 
        cat.name.toLowerCase().includes(search.toLowerCase()) ||
        `CAT-${String(cat.id).padStart(3, '0')}`.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-6 pt-2 pb-8 max-w-[1600px] mx-auto px-4 sm:px-6">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <Tag size={26} className="text-gray-800" strokeWidth={2.5}/>
                    <h2 className="text-[22px] text-gray-800 font-bold">Categories Management</h2>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="bg-[#8DB600] text-white px-5 py-2.5 rounded shadow flex items-center gap-2 hover:bg-[#7a9e00] transition-colors text-[14px] font-bold"
                >
                    <Plus size={18} strokeWidth={3}/> Add New Category
                </button>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 flex justify-between items-start border border-gray-100">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Total Categories</p>
                        <h3 className="text-3xl font-bold text-gray-800">{stats.total_categories}</h3>
                        <p className="text-[13px] text-gray-400 mt-2">In your system</p>
                    </div>
                    <div className="bg-green-50 p-2.5 rounded-lg text-[#8DB600]">
                        <Tag size={24} />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 flex justify-between items-start border border-gray-100">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Total Products</p>
                        <h3 className="text-3xl font-bold text-gray-800">{stats.total_products}</h3>
                        <p className="text-[13px] text-gray-400 mt-2">Across all categories</p>
                    </div>
                    <div className="bg-green-50 p-2.5 rounded-lg text-[#8DB600]">
                        <Package size={24} />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 flex justify-between items-start border border-gray-100">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Avg Products/Category</p>
                        <h3 className="text-3xl font-bold text-gray-800">{stats.avg_products}</h3>
                        <p className="text-[13px] text-gray-400 mt-2">Distribution</p>
                    </div>
                    <div className="bg-green-50 p-2.5 rounded-lg text-[#8DB600]">
                        <Calculator size={24} />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 flex justify-between items-start border border-gray-100">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Top Category</p>
                        <h3 className="text-[20px] font-bold text-gray-800 truncate max-w-[180px]">{stats.top_category?.name || 'N/A'}</h3>
                        <p className="text-[13px] text-gray-400 mt-2">{stats.top_category?.count || 0} products</p>
                    </div>
                    <div className="bg-green-50 p-2.5 rounded-lg text-[#8DB600]">
                        <Star size={24} />
                    </div>
                </div>
            </div>

            {/* Main Table Container */}
            <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 mt-6 pt-5 overflow-hidden">
                <div className="flex flex-col md:flex-row justify-between items-center px-6 pb-4 gap-4">
                    <div className="flex items-center gap-2">
                        <LayoutGrid size={20} className="text-gray-800 font-bold"/>
                        <h3 className="text-lg font-bold text-gray-800">All Categories</h3>
                    </div>
                    <div className="relative flex w-full md:w-72 rounded-lg overflow-hidden border border-gray-200 focus-within:border-[#8DB600] focus-within:ring-2 focus-within:ring-[#8DB600]/30 transition-all bg-gray-50 focus-within:bg-white text-gray-600">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            className="w-full pl-9 pr-4 text-[13px] border-none outline-none py-2.5 bg-transparent"
                            placeholder="Search categories..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto px-6">
                    <table className="w-full text-left text-[13px] whitespace-nowrap align-middle">
                        <thead className="text-gray-500 border-b-2 border-gray-100 bg-white sticky top-0 font-semibold">
                            <tr>
                                <th className="py-3 font-medium text-gray-600">No.</th>
                                <th className="py-3 font-medium text-gray-600">ID</th>
                                <th className="py-3 font-medium text-gray-600">Category Name</th>
                                <th className="py-3 font-medium text-gray-600 text-center">Products</th>
                                <th className="py-3 font-medium text-gray-600">Created At</th>
                                <th className="py-3 font-medium text-gray-600 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 align-middle">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse border-b border-gray-50">
                                        <td colSpan="6" className="py-5"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : filteredCategories.length > 0 ? filteredCategories.map((cat, index) => {
                                const formattedId = `CAT-${String(cat.id).padStart(3, '0')}`;
                                return (
                                    <tr key={cat.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/40 transition-colors group">
                                        <td className="py-4 text-gray-500">{index + 1}</td>
                                        <td className="py-4 text-gray-600 font-medium">{formattedId}</td>
                                        <td className="py-4">
                                            <span className="font-bold text-gray-800">{cat.name}</span>
                                        </td>
                                        <td className="py-4 text-center">
                                            <span className="px-3 py-1 bg-gray-100 rounded-full text-gray-600 font-semibold">{cat.products_count}</span>
                                        </td>
                                        <td className="py-4 text-gray-500">
                                            {new Date(cat.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                        <td className="py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    onClick={() => handleOpenModal(cat)}
                                                    className="p-1.5 border border-[#3b82f6]/30 text-[#3b82f6] hover:bg-[#3b82f6] hover:text-white rounded transition-colors shadow-sm bg-white cursor-pointer"
                                                >
                                                    <Edit size={14} strokeWidth={2.5}/>
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(cat.id, cat.name)}
                                                    className="p-1.5 border border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444] hover:text-white rounded transition-colors shadow-sm bg-white cursor-pointer"
                                                >
                                                    <Trash2 size={14} strokeWidth={2.5}/>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            }) : (
                                <tr>
                                    <td colSpan="6" className="py-16 text-center text-gray-500">
                                        No categories found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-bold text-gray-800">
                                {editingCategory ? 'Edit Category' : 'Add New Category'}
                            </h3>
                            <button onClick={handleCloseModal} className="p-1.5 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                                <X size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category Name</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-[#8DB600] focus:ring-4 focus:ring-[#8DB600]/10 outline-none transition-all text-sm"
                                    placeholder="e.g. Pain Killers"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button 
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-semibold hover:bg-gray-50 transition-all text-sm"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    disabled={saving}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#8DB600] text-white font-bold hover:bg-[#7a9e00] shadow-lg shadow-[#8DB600]/20 transition-all text-sm disabled:opacity-50"
                                >
                                    {saving ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminCategoryList;
