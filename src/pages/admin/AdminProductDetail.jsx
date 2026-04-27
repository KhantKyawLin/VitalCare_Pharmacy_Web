import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
    Package, 
    Edit, 
    Trash2, 
    ChevronLeft, 
    ChevronRight,
    Info,
    ImageIcon,
    Stethoscope,
    ArrowLeft,
    AlertTriangle,
    ShieldCheck
} from 'lucide-react';
import Swal from 'sweetalert2';

const AdminProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);

    const getConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/admin/products/${id}`, getConfig());
            setProduct(response.data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching product:", error);
            Swal.fire('Error', 'Failed to load product details', 'error');
            navigate('/admin/products');
        }
    };

    const handleDelete = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: `You want to delete ${product.name}?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`http://127.0.0.1:8000/api/admin/products/${id}`, getConfig());
                Swal.fire('Deleted!', 'Product has been deleted.', 'success');
                navigate('/admin/products');
            } catch (error) {
                Swal.fire('Error', 'Failed to delete product', 'error');
            }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6CA52C]"></div>
            </div>
        );
    }

    const totalStock = product.movements?.reduce((sum, m) => 
        m.movement_type !== 'sold-out' ? sum + parseInt(m.instock_quantity) : sum, 0) || 0;
    
    const isLowStock = totalStock <= product.minimum_quantity;

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-[#6CA52C] p-2 rounded-lg text-white shadow-md shadow-[#6CA52C]/20">
                        <Info size={22} className="stroke-[2.5]" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Product Details</h2>
                        <p className="text-gray-500 text-sm">Detailed overview and medical information for {product.name}.</p>
                    </div>
                </div>
                <Link to="/admin/products" className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-all font-medium shadow-sm hover:shadow-md">
                    <ArrowLeft size={18} /> Back to Products
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Images */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden sticky top-6">
                        <div className="p-4 border-b border-gray-50 flex items-center gap-2">
                            <div className="p-1.5 bg-green-50 rounded text-[#6CA52C]">
                                <ImageIcon size={18} />
                            </div>
                            <h3 className="font-bold text-gray-800">Product Images</h3>
                        </div>
                        
                        <div className="p-6">
                            <div className="relative group aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 mb-6">
                                {product.pictures?.length > 0 ? (
                                    <>
                                        <img 
                                            src={product.pictures[activeImage].image_path.startsWith('http') 
                                                ? product.pictures[activeImage].image_path 
                                                : `http://127.0.0.1:8000/storage/${product.pictures[activeImage].image_path}`} 
                                            alt={product.name}
                                            className="w-full h-full object-contain p-4"
                                        />
                                        
                                        {product.pictures.length > 1 && (
                                            <>
                                                <button 
                                                    onClick={() => setActiveImage(prev => (prev === 0 ? product.pictures.length - 1 : prev - 1))}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 transition-all hover:bg-[#6CA52C] hover:text-white"
                                                >
                                                    <ChevronLeft size={20} />
                                                </button>
                                                <button 
                                                    onClick={() => setActiveImage(prev => (prev === product.pictures.length - 1 ? 0 : prev + 1))}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-lg flex items-center justify-center text-gray-700 opacity-0 group-hover:opacity-100 transition-all hover:bg-[#6CA52C] hover:text-white"
                                                >
                                                    <ChevronRight size={20} />
                                                </button>
                                            </>
                                        )}
                                    </>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                                        <Package size={80} className="opacity-10 mb-4" />
                                        <p className="italic text-sm">No images available</p>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-wrap gap-3">
                                {product.pictures?.map((pic, idx) => (
                                    <button 
                                        key={pic.id}
                                        onClick={() => setActiveImage(idx)}
                                        className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all p-1 bg-white shadow-sm ${
                                            activeImage === idx ? 'border-[#6CA52C] scale-105 shadow-md shadow-[#6CA52C]/10' : 'border-gray-100 hover:border-gray-200'
                                        }`}
                                    >
                                        <img 
                                            src={pic.image_path.startsWith('http') ? pic.image_path : `http://127.0.0.1:8000/storage/${pic.image_path}`} 
                                            alt=""
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Info */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-50 flex items-center gap-2">
                            <div className="p-1.5 bg-blue-50 rounded text-blue-500">
                                <Info size={18} />
                            </div>
                            <h3 className="font-bold text-gray-800">Basic Information</h3>
                        </div>
                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Product Name</p>
                                <p className="text-lg font-bold text-gray-800">{product.name}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Category</p>
                                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 rounded-lg font-bold text-sm border border-blue-100">
                                    {product.category?.name || 'Uncategorized'}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Unit</p>
                                <p className="text-gray-700 font-medium">{product.unit?.name || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Dosage</p>
                                <p className="text-gray-700 font-medium">{product.dosage || 'N/A'}</p>
                            </div>
                            <div className="md:col-span-2">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Description</p>
                                <p className="text-gray-600 leading-relaxed text-sm bg-gray-50/50 p-4 rounded-xl border border-gray-50 italic">
                                    {product.description || 'No description provided.'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Medical & Stock Information */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-50 flex items-center gap-2">
                            <div className="p-1.5 bg-red-50 rounded text-red-500">
                                <Stethoscope size={18} />
                            </div>
                            <h3 className="font-bold text-gray-800">Medical Information</h3>
                        </div>
                        <div className="p-6 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-4 rounded-2xl border border-gray-50 bg-gray-50/30">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Inventory Status</p>
                                    <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                                        <div className="flex flex-col">
                                            <span className="text-xl font-black text-gray-800">{totalStock}</span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase">Current Stock</span>
                                        </div>
                                        <span className={`px-3 py-1.5 rounded-lg font-bold text-[11px] shadow-sm flex items-center gap-1.5 ${
                                            isLowStock ? 'bg-red-500 text-white' : 'bg-[#6CA52C] text-white'
                                        }`}>
                                            {isLowStock ? <AlertTriangle size={14} /> : <ShieldCheck size={14} />}
                                            {isLowStock ? 'Needs Reorder' : 'Healthy Stock'}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl border border-gray-50 bg-gray-50/30">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Price Info</p>
                                    <div className="flex items-center justify-between p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                                        <div className="flex flex-col">
                                            <span className="text-xl font-black text-[#6CA52C]">{product.price?.toLocaleString() || '0'} Ks</span>
                                            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wide">Selling Price</span>
                                        </div>
                                        <div className="p-2 bg-green-50 rounded-lg">
                                            <Package size={20} className="text-[#6CA52C]" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-[#6CA52C] rounded-full"></div>
                                        Usage Instructions
                                    </p>
                                    <p className="text-gray-700 text-[13.5px] leading-relaxed pl-3.5 border-l-2 border-[#6CA52C]/20 py-1">
                                        {product.usage || 'No usage instructions specified.'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                                        Side Effects
                                    </p>
                                    <p className="text-gray-700 text-[13.5px] leading-relaxed pl-3.5 border-l-2 border-red-100 py-1 italic">
                                        {product.side_effects || 'No side effects recorded.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Bar */}
                    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-end gap-3 px-6">
                        <button 
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-6 py-2.5 bg-white border border-red-100 text-red-500 rounded-xl hover:bg-red-50 transition-all font-bold text-sm shadow-sm"
                        >
                            <Trash2 size={18} /> Delete Product
                        </button>
                        <Link 
                            to={`/admin/products/edit/${product.id}`}
                            className="flex items-center gap-2 px-8 py-2.5 bg-[#6CA52C] text-white rounded-xl hover:bg-[#5a8b24] transition-all font-bold text-sm shadow-md shadow-[#6CA52C]/20"
                        >
                            <Edit size={18} /> Edit Product
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminProductDetail;
