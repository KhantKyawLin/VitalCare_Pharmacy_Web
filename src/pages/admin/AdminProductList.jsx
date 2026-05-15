import React, { useState, useEffect } from 'react';
import api, { getStorageUrl } from '../../utils/api';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    Eye,
    Package,
    AlertTriangle,
    Clock,
    Truck,
    List as ListIcon,
    SlidersHorizontal,
    ChevronDown,
    Check
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import echo from '../../utils/echo';

const AdminProductList = () => {
    const [products, setProducts] = useState([]);
    const [metrics, setMetrics] = useState({
        total_products: 0,
        low_stock: 0,
        expiring_soon: 0,
        active_suppliers: 0
    });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalResults, setTotalResults] = useState(0);
    const [showColumnDropdown, setShowColumnDropdown] = useState(false);
    const [visibleColumns, setVisibleColumns] = useState({
        id: false,
        category: true,
        stock: true,
        supplier: false,
        mfg_date: false,
        expiry: true,
        purchase_price: true,
        sale_price: true,
        discount: true,
        status: true,
        visibility: true,
    });

    useEffect(() => {
        fetchProducts();

        // Real-time Listeners
        const channel = echo.channel('admin-alerts')
            .listen('.new-order', (e) => {
                fetchProducts();
            })
            .listen('.new-purchase', (e) => {
                fetchProducts();
            })
            .listen('.low-stock', (e) => {
                fetchProducts();
            });

        return () => {
            echo.leaveChannel('admin-alerts');
        };
    }, [currentPage]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/admin/products`, {
                params: {
                    page: currentPage,
                    search: search,
                    per_page: 8
                }
            });
            setProducts(response.data.data);
            setTotalPages(response.data.last_page);
            setTotalResults(response.data.total);
            if (response.data.metrics) {
                setMetrics(response.data.metrics);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    };

    // Auto-search when cleared
    useEffect(() => {
        if (search === '') {
            setCurrentPage(1);
            fetchProducts();
        }
    }, [search]);

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            setCurrentPage(1);
            fetchProducts();
        }
    };

    const handleToggleColumn = (col) => {
        setVisibleColumns(prev => ({ ...prev, [col]: !prev[col] }));
    };

    // Close dropdown on outside click helper
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (showColumnDropdown && !e.target.closest('.customize-columns-dropdown')) {
                setShowColumnDropdown(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [showColumnDropdown]);

    const handleTogglePublish = async (id, currentStatus) => {
        try {
            await api.patch(`/admin/products/${id}/toggle-publish`, {});
            setProducts(products.map(p => p.id === id ? { ...p, is_published: !currentStatus } : p));
        } catch (error) {
            Swal.fire('Error', 'Failed to update visibility', 'error');
        }
    };

    const handleDelete = async (id, name) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You want to delete ${name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#94a3b8',
            confirmButtonText: 'Yes, delete it!',
            reverseButtons: true
        });

        if (result.isConfirmed) {
            try {
                await api.delete(`/admin/products/${id}`);
                Swal.fire('Deleted!', 'Product has been deleted.', 'success');
                fetchProducts();
            } catch (error) {
                Swal.fire('Error', 'Failed to delete product', 'error');
            }
        }
    };

    return (
        <div className="space-y-6 pt-2 pb-8 max-w-[1600px] mx-auto px-4 sm:px-6">

            {/* Minimalist Top Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <Package size={26} className="text-gray-800" strokeWidth={2.5} />
                    <h2 className="text-[22px] text-gray-800 font-bold">Products Management</h2>
                </div>
                <Link to="/admin/products/create" className="bg-primary-green text-white px-5 py-2.5 rounded shadow flex items-center gap-2 hover:bg-primary-dark transition-colors text-[14px] font-bold">
                    <Plus size={18} strokeWidth={3} /> Add New Product
                </Link>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Total Products */}
                <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 flex justify-between items-start border border-gray-100">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Total Products</p>
                        <h3 className="text-3xl font-bold text-gray-800">{metrics.total_products}</h3>
                        <p className="text-[13px] text-gray-400 mt-2">In your inventory</p>
                    </div>
                    <div className="bg-primary-light p-2.5 rounded-lg text-primary-green">
                        <Package size={24} />
                    </div>
                </div>

                {/* Low Stock Items */}
                <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 flex justify-between items-start border border-gray-100">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Low Stock Items</p>
                        <h3 className="text-3xl font-bold text-gray-800">{metrics.low_stock}</h3>
                        <p className="text-[13px] text-gray-400 mt-2">Below reorder level</p>
                    </div>
                    <div className="bg-yellow-50 p-2.5 rounded-lg text-yellow-500">
                        <AlertTriangle size={24} />
                    </div>
                </div>

                {/* Expiring Soon */}
                <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 flex justify-between items-start border border-gray-100">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Expiring Soon</p>
                        <h3 className="text-3xl font-bold text-gray-800">{metrics.expiring_soon}</h3>
                        <p className="text-[13px] text-gray-400 mt-2">Within 30 days</p>
                    </div>
                    <div className="bg-primary-light p-2.5 rounded-lg text-primary-green">
                        <Clock size={24} />
                    </div>
                </div>

                {/* Active Suppliers */}
                <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] p-5 flex justify-between items-start border border-gray-100">
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Active Suppliers</p>
                        <h3 className="text-3xl font-bold text-gray-800">{metrics.active_suppliers}</h3>
                        <p className="text-[13px] text-gray-400 mt-2">Providing products</p>
                    </div>
                    <div className="bg-primary-light p-2.5 rounded-lg text-primary-green">
                        <Truck size={24} />
                    </div>
                </div>
            </div>

            {/* Main Table Container */}
            <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 mt-6 pt-5">
                {/* Table Header Controls */}
                <div className="flex flex-col md:flex-row justify-between items-center px-6 pb-4 gap-4">
                    <div className="flex items-center gap-2">
                        <ListIcon size={20} className="text-gray-800 font-bold" />
                        <h3 className="text-lg font-bold text-gray-800">All Products</h3>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex w-full md:w-72 rounded-lg overflow-hidden border border-gray-200 focus-within:border-primary-green focus-within:ring-2 focus-within:ring-primary-green/30 transition-all bg-gray-50 focus-within:bg-white text-gray-600">
                            <button onClick={fetchProducts} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-green transition-colors">
                                <Search size={16} />
                            </button>
                            <input
                                type="text"
                                className="w-full pl-9 pr-4 text-[13px] border-none outline-none py-2.5 bg-transparent"
                                placeholder="Search products..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleSearch}
                            />
                        </div>

                        <div className="relative customize-columns-dropdown shrink-0">
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setShowColumnDropdown(!showColumnDropdown); }}
                                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-gray-600 text-[13px] font-medium hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <SlidersHorizontal size={15} /> Customize Columns <ChevronDown size={14} className={`transition-transform ${showColumnDropdown ? 'rotate-180' : ''}`} />
                            </button>

                            {showColumnDropdown && (
                                <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 py-4 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="px-4 pb-2 mb-2 border-b border-gray-100 font-black text-[10px] text-gray-400 tracking-widest uppercase">
                                        Default Columns
                                    </div>
                                    <div className="px-2 space-y-0.5">
                                        {[
                                            { id: 'category', label: 'Category' },
                                            { id: 'stock', label: 'Stock Status' },
                                            { id: 'expiry', label: 'Expiry Date' },
                                            { id: 'purchase_price', label: 'Purchase Price' },
                                            { id: 'sale_price', label: 'Sale Price' },
                                            { id: 'discount', label: 'Discount' },
                                            { id: 'status', label: 'Stock Alert' },
                                            { id: 'visibility', label: 'Visibility' },
                                        ].map(col => (
                                            <label key={col.id} className="flex items-center px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-50 group">
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 transition-colors ${visibleColumns[col.id] ? 'bg-primary-green border-primary-green' : 'border-gray-300 bg-white group-hover:border-primary-green'}`}>
                                                    {visibleColumns[col.id] && <Check size={10} className="text-white" strokeWidth={4} />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={visibleColumns[col.id]}
                                                    onChange={() => handleToggleColumn(col.id)}
                                                />
                                                <span className={`text-[13px] transition-colors ${visibleColumns[col.id] ? 'text-gray-900 font-bold' : 'text-gray-500 font-medium'}`}>{col.label}</span>
                                            </label>
                                        ))}
                                    </div>

                                    <div className="px-4 pb-2 mt-4 mb-2 border-b border-gray-100 font-black text-[10px] text-gray-400 tracking-widest uppercase">
                                        Additional Columns
                                    </div>
                                    <div className="px-2 space-y-0.5">
                                        {[
                                            { id: 'id', label: 'Product ID' },
                                            { id: 'supplier', label: 'Supplier Info' },
                                            { id: 'mfg_date', label: 'MFG Date' },
                                        ].map(col => (
                                            <label key={col.id} className="flex items-center px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-50 group">
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 transition-colors ${visibleColumns[col.id] ? 'bg-primary-green border-primary-green' : 'border-gray-300 bg-white group-hover:border-primary-green'}`}>
                                                    {visibleColumns[col.id] && <Check size={10} className="text-white" strokeWidth={4} />}
                                                </div>
                                                <input
                                                    type="checkbox"
                                                    className="hidden"
                                                    checked={visibleColumns[col.id]}
                                                    onChange={() => handleToggleColumn(col.id)}
                                                />
                                                <span className={`text-[13px] transition-colors ${visibleColumns[col.id] ? 'text-gray-900 font-bold' : 'text-gray-500 font-medium'}`}>{col.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto px-6">
                    <table className="w-full text-left text-[13px] whitespace-nowrap align-middle">
                        <thead className="text-gray-500 border-b-2 border-gray-100 bg-white sticky top-0 font-semibold">
                            <tr>
                                <th className="py-3 font-medium text-gray-600">No.</th>
                                {visibleColumns.id && <th className="py-3 font-medium text-gray-600">ID</th>}
                                <th className="py-3 font-medium text-gray-600">Product</th>
                                {visibleColumns.category && <th className="py-3 font-medium text-gray-600">Category</th>}
                                {visibleColumns.stock && <th className="py-3 font-medium text-gray-600 w-48">Stock</th>}
                                {visibleColumns.supplier && <th className="py-3 font-medium text-gray-600">Supplier</th>}
                                {visibleColumns.mfg_date && <th className="py-3 font-medium text-gray-600">MFG Date</th>}
                                {visibleColumns.expiry && <th className="py-3 font-medium text-gray-600">Expiry Date</th>}
                                {visibleColumns.purchase_price && <th className="py-3 font-medium text-gray-600">Purchase Price</th>}
                                {visibleColumns.sale_price && <th className="py-3 font-medium text-gray-600">Sale Price</th>}
                                {visibleColumns.discount && <th className="py-3 font-medium text-gray-600">Discount</th>}
                                {visibleColumns.status && <th className="py-3 font-medium text-gray-600">Status</th>}
                                {visibleColumns.visibility && <th className="py-3 font-medium text-gray-600">Visibility</th>}
                                <th className="py-3 font-medium text-gray-600 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700 align-middle">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="animate-pulse border-b border-gray-100">
                                        <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 3} className="py-5"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                                    </tr>
                                ))
                            ) : products.length > 0 ? products.map((product, index) => {
                                const realIndex = (currentPage - 1) * 8 + index + 1;
                                const formattedId = `VC-${String(product.id).padStart(4, '0')}`;

                                const allBatches = product.movements || [];
                                const totalStock = allBatches.reduce((sum, m) => sum + (parseInt(m.instock_quantity) || 0), 0);
                                const currentBatches = allBatches.filter(m => m.movement_type !== 'sold-out') || [];
                                
                                const referenceBatch = allBatches.length > 0 ? allBatches[0] : null;
                                const physicalBatch = currentBatches.length > 0 ? currentBatches[0] : null;

                                const supplierName = physicalBatch?.purchase_product?.purchase?.supplier?.name || referenceBatch?.purchase_product?.purchase?.supplier?.name || '-';
                                const mfgDate = physicalBatch?.manufactured_date ? new Date(physicalBatch.manufactured_date).toLocaleDateString() : (referenceBatch?.manufactured_date ? new Date(referenceBatch.manufactured_date).toLocaleDateString() : '-');
                                const expireDate = physicalBatch?.expired_date ? new Date(physicalBatch.expired_date).toLocaleDateString() : (referenceBatch?.expired_date ? new Date(referenceBatch.expired_date).toLocaleDateString() : '-');

                                const purchasePrice = currentBatches[0]?.purchase_price || allBatches.find(m => parseFloat(m.purchase_price) > 0)?.purchase_price || 0;
                                const salePrice = product.price || physicalBatch?.sale_price || referenceBatch?.sale_price || 0;

                                const isLowStock = totalStock <= product.minimum_quantity;
                                const statusString = isLowStock ? 'Reorder' : 'Active';
                                const activePromotion = product.promotions && product.promotions.length > 0 ? product.promotions[0] : null;

                                return (
                                    <tr key={product.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/40 transition-colors group">
                                        <td className="py-3.5 text-gray-500">{realIndex}</td>
                                        {visibleColumns.id && <td className="py-3.5 text-gray-600 font-medium">{formattedId}</td>}
                                        <td className="py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded border border-gray-200 overflow-hidden bg-white flex items-center justify-center flex-shrink-0">
                                                    {product.pictures?.length > 0 ? (
                                                        <img
                                                            src={getStorageUrl(product.pictures[0].image_path)}
                                                            alt={product.name}
                                                            className="w-full h-full object-contain p-0.5"
                                                        />
                                                    ) : (
                                                        <Package size={16} className="text-gray-300" />
                                                    )}
                                                </div>
                                                <span className="font-medium text-gray-700">{product.name}</span>
                                            </div>
                                        </td>
                                        {visibleColumns.category && <td className="py-3.5 text-gray-600">{product.category?.name || '-'}</td>}

                                        {visibleColumns.stock && (
                                            <td className="py-3.5 pr-6">
                                                <div className="flex items-center justify-between mb-1.5 w-full">
                                                    <span className="text-gray-700 font-bold">{totalStock} <span className="font-normal text-xs text-gray-500">available ({product.unit?.name || 'Item'})</span></span>
                                                </div>
                                                <div className="w-full bg-gray-200 h-[3px] rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${isLowStock ? 'bg-yellow-400' : 'bg-primary-green'}`}
                                                        style={{ width: `${Math.min((totalStock / (product.minimum_quantity * 5 || 1)) * 100, 100)}%` }}
                                                    ></div>
                                                </div>
                                            </td>
                                        )}

                                        {visibleColumns.supplier && (
                                            <td className="py-3.5">
                                                <span className="text-xs font-semibold text-gray-600 px-2 py-0.5 bg-gray-100 rounded border border-gray-200 block w-fit max-w-[120px] truncate" title={supplierName}>{supplierName}</span>
                                            </td>
                                        )}

                                        {visibleColumns.mfg_date && (
                                            <td className="py-3.5">
                                                <span className="text-[12px] font-bold text-gray-500">{mfgDate}</span>
                                            </td>
                                        )}

                                        {visibleColumns.expiry && (
                                            <td className="py-3.5">
                                                <span className={`text-[12px] font-bold ${new Date(expireDate) < new Date() ? 'text-red-500' : 'text-gray-500'}`}>{expireDate}</span>
                                            </td>
                                        )}

                                        {visibleColumns.purchase_price && (
                                            <td className="py-3.5 text-gray-700 font-medium whitespace-nowrap">
                                                Ks. {parseFloat(purchasePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                        )}

                                        {visibleColumns.sale_price && (
                                            <td className="py-3.5 text-gray-700 font-medium whitespace-nowrap">
                                                Ks. {parseFloat(salePrice).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                            </td>
                                        )}

                                        {visibleColumns.discount && (
                                            <td className="py-3.5">
                                                {activePromotion ? (
                                                    <span className="px-2.5 py-1 bg-primary-light text-primary-green rounded-full text-[11px] font-bold border border-primary-green/20 flex items-center gap-1 w-fit">
                                                        <Check size={12} strokeWidth={3} /> Yes
                                                    </span>
                                                ) : (
                                                    <span className="px-2.5 py-1 bg-gray-50 text-gray-400 rounded-full text-[11px] font-bold border border-gray-100 flex items-center gap-1 w-fit">
                                                        None
                                                    </span>
                                                )}
                                            </td>
                                        )}

                                        {visibleColumns.status && (
                                            <td className="py-3.5">
                                                <span className={`px-3 py-1 rounded text-[11px] font-bold text-white shadow-sm inline-block min-w-[70px] text-center ${isLowStock ? 'bg-yellow-500' : 'bg-primary-dark'}`}>
                                                    {statusString}
                                                </span>
                                            </td>
                                        )}

                                        {visibleColumns.visibility && (
                                            <td className="py-3.5">
                                                <button
                                                    onClick={() => handleTogglePublish(product.id, product.is_published)}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${product.is_published ? 'bg-primary-green' : 'bg-gray-200'}`}
                                                >
                                                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${product.is_published ? 'translate-x-6' : 'translate-x-1'}`} />
                                                </button>
                                            </td>
                                        )}

                                        <td className="py-3.5 align-middle">
                                            <div className="flex items-center justify-center gap-2">
                                                <Link to={`/admin/products/${product.id}`} className="p-1.5 border border-primary-green/30 text-primary-green hover:bg-primary-green hover:text-white rounded transition-colors shadow-sm bg-white cursor-pointer">
                                                    <Eye size={14} strokeWidth={2.5} />
                                                </Link>
                                                <Link to={`/admin/products/edit/${product.id}`} className="p-1.5 border border-accent-green/30 text-accent-green hover:bg-accent-green hover:text-white rounded transition-colors shadow-sm bg-white cursor-pointer">
                                                    <Edit size={14} strokeWidth={2.5} />
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product.id, product.name)}
                                                    className="p-1.5 border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white rounded transition-colors shadow-sm bg-white cursor-pointer"
                                                >
                                                    <Trash2 size={14} strokeWidth={2.5} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            }) : (
                                <tr>
                                    <td colSpan={Object.values(visibleColumns).filter(Boolean).length + 3} className="py-16 text-center text-gray-500">
                                        No products matching your search criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Modern Pagination Footer */}
                <div className="px-6 py-5 border-t border-gray-100 flex justify-between items-center text-[13px] text-gray-500 mt-2">
                    <div>
                        Page {currentPage} of {totalPages} <span className="mx-2">•</span> {totalResults} result(s)
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-5 py-2 border border-gray-200 rounded-lg text-primary-green font-bold hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            Previous
                        </button>

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-5 py-2 border border-gray-200 rounded-lg text-primary-green font-bold hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProductList;
