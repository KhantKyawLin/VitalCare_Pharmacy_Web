import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import Swal from 'sweetalert2';
import { 
    Plus, 
    ArrowLeft, 
    Save, 
    Upload, 
    X, 
    ImageIcon,
    Trash2,
    Undo2,
    Minus,
    Tag,
    ActivitySquare
} from 'lucide-react';

// Extract cropped image as Blob File
const getCroppedImg = (imageElement, crop, fileName) => {
    const canvas = document.createElement("canvas");
    const scaleX = imageElement.naturalWidth / imageElement.width;
    const scaleY = imageElement.naturalHeight / imageElement.height;
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    const ctx = canvas.getContext("2d");

    ctx.drawImage(
      imageElement,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width * scaleX,
      crop.height * scaleY
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (!blob) {
            reject(new Error('Canvas is empty'));
            return;
        }
        blob.name = fileName;
        const file = new File([blob], fileName, { type: blob.type || 'image/jpeg' });
        resolve({ file, url: window.URL.createObjectURL(blob) });
      }, 'image/jpeg', 1);
    });
};

const AdminProductForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;

    const getConfig = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

    const [loading, setLoading] = useState(isEdit);
    const [submitting, setSubmitting] = useState(false);
    const [categories, setCategories] = useState([]);
    const [units, setUnits] = useState([]);

    // Image slots management
    const [visibleSlots, setVisibleSlots] = useState(2);
    const [slots, setSlots] = useState([null, null, null, null, null]);

    // Crop Modal States
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [selectedFileUrl, setSelectedFileUrl] = useState(null);
    const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
    const [crop, setCrop] = useState({ unit: '%', width: 50, aspect: 1 });
    const [completedCrop, setCompletedCrop] = useState(null);
    const imgRef = useRef(null);

    // Quick Add Modals
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showUnitModal, setShowUnitModal] = useState(false);
    const [newUnitName, setNewUnitName] = useState('');

    const [formData, setFormData] = useState({
        name: '', category_id: '', unit_id: '', minimum_quantity: '10', price: '', description: '', dosage: '', usage: '', side_effects: '',
        is_published: true
    });

    const [errors, setErrors] = useState({});
    const [deletedImageIds, setDeletedImageIds] = useState([]);

    useEffect(() => {
        fetchInitialData();
        if (isEdit) fetchProduct();
    }, [id]);

    const fetchInitialData = async () => {
        try {
            const [catRes, unitRes] = await Promise.all([
                axios.get('http://127.0.0.1:8000/api/categories', getConfig()),
                axios.get('http://127.0.0.1:8000/api/admin/units', getConfig())
            ]);
            setCategories(catRes.data);
            setUnits(unitRes.data.units || unitRes.data || []);
        } catch (error) {
            console.error("Error fetching dependencies:", error);
        }
    };

    const fetchProduct = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/admin/products/${id}`, getConfig());
            const product = response.data;
            if (product) {
                setFormData({
                    name: product.name || '',
                    category_id: product.category_id || '',
                    unit_id: product.unit_id || '',
                    price: product.price || '',
                    minimum_quantity: product.minimum_quantity || '10',
                    description: product.description || '',
                    usage: product.usage || '',
                    side_effects: product.side_effects || '',
                    dosage: product.dosage || '',
                    is_published: product.is_published === 1 || product.is_published === true
                });

                if (product.pictures && product.pictures.length > 0) {
                    const newSlots = [...slots];
                    product.pictures.forEach((pic, i) => {
                        if (i < 5) {
                            newSlots[i] = { 
                                url: pic.image_path.startsWith('http') 
                                    ? pic.image_path 
                                    : `http://127.0.0.1:8000/storage/${pic.image_path}`, 
                                existing: true, 
                                id: pic.id 
                            };
                        }
                    });
                    setSlots(newSlots);
                    setVisibleSlots(Math.max(2, Math.min(product.pictures.length + 1, 5)));
                }
            }
        } catch (error) {
            console.error("Error fetching product:", error);
            Swal.fire('Error', 'Failed to load product data', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const handleQuickAddCategory = async () => {
        if (!newCategoryName.trim()) return;
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/admin/categories', { name: newCategoryName }, getConfig());
            setCategories(prev => [...prev, response.data.category]);
            setFormData(prev => ({ ...prev, category_id: response.data.category.id }));
            setNewCategoryName('');
            setShowCategoryModal(false);
        } catch (error) {
            Swal.fire('Error', 'Failed to add category. Name might already exist.', 'error');
        }
    };

    const handleQuickAddUnit = async () => {
        if (!newUnitName.trim()) return;
        try {
            const response = await axios.post('http://127.0.0.1:8000/api/admin/units', { name: newUnitName }, getConfig());
            setUnits(prev => [...prev, response.data.unit]);
            setFormData(prev => ({ ...prev, unit_id: response.data.unit.id }));
            setNewUnitName('');
            setShowUnitModal(false);
        } catch (error) {
            Swal.fire('Error', 'Failed to add unit. Name might already exist.', 'error');
        }
    };

    const handleImageSelect = (e, index) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);
            setSelectedFileUrl(url);
            setSelectedSlotIndex(index);
            setCrop({ unit: '%', width: 50, aspect: 1 });
            setCompletedCrop(null);
            setCropModalOpen(true);
            e.target.value = null; // reset
        }
    };

    const handleCropSave = async () => {
        if (!completedCrop || !imgRef.current) {
            setCropModalOpen(false);
            return;
        }

        try {
            const fileName = `crop_${Date.now()}.jpg`;
            const { file, url } = await getCroppedImg(imgRef.current, completedCrop, fileName);
            
            const newSlots = [...slots];
            newSlots[selectedSlotIndex] = { file, url };
            setSlots(newSlots);
            setCropModalOpen(false);
        } catch (error) {
            console.error("Cropping failed:", error);
            alert("Failed to crop image.");
        }
    };

    const handleClearSlot = (index) => {
        const slot = slots[index];
        if (slot && slot.existing) {
            // It's an existing image, we need to mark it for deletion
            toggleDeleteExistingImage(slot.id);
        }
        const newSlots = [...slots];
        newSlots[index] = null;
        setSlots(newSlots);
    };

    const toggleDeleteExistingImage = (id) => {
        setDeletedImageIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'is_published') {
                data.append(key, formData[key] ? '1' : '0');
            } else {
                data.append(key, formData[key]);
            }
        });

        // Gather filled slots
        let imageIndex = 0;
        slots.forEach((slot) => {
            if (slot && slot.file) {
                data.append(`images[${imageIndex}]`, slot.file);
                imageIndex++;
            }
        });

        if (isEdit && deletedImageIds.length > 0) {
            deletedImageIds.forEach(id => data.append('deleted_image_ids[]', id));
        }

        try {
            if (isEdit) {
                data.append('_method', 'PUT');
                await axios.post(`http://127.0.0.1:8000/api/admin/products/${id}`, data, getConfig());
            } else {
                await axios.post('http://127.0.0.1:8000/api/admin/products', data, getConfig());
            }
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Product saved successfully.',
                confirmButtonColor: '#6CA52C'
            }).then(() => {
                navigate('/admin/products');
            });
        } catch (error) {
            if (error.response?.status === 422) {
                setErrors(error.response.data);
                Swal.fire({
                    icon: 'warning',
                    title: 'Validation Error',
                    text: 'Please check the form fields and try again.',
                    confirmButtonColor: '#3085d6'
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: error.response?.data?.message || error.response?.data?.error || 'An error occurred while saving.',
                    confirmButtonColor: '#d33'
                });
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6CA52C]"></div></div>;

    return (
        <div className="max-w-7xl mx-auto py-6 px-4">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4 border-b border-gray-200 pb-4">
                <div className="flex items-center text-[#6CA52C] font-bold text-xl rounded-md">
                    <div className="w-8 h-8 rounded-full bg-[#6CA52C] text-white flex items-center justify-center mr-3 shadow-sm">
                        <Plus size={20} />
                    </div>
                    {isEdit ? 'Edit Product' : 'Create New Product'}
                </div>
                <button onClick={() => navigate('/admin/products')} className="flex items-center gap-2 text-gray-600 border border-gray-300 px-4 py-2 rounded shadow-sm bg-white hover:bg-gray-50 text-sm font-medium transition-colors">
                    <ArrowLeft size={16} /> Back to Products
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column (Forms) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3 bg-gray-50/50">
                            <div className="bg-[#6CA52C] text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-sm italic">i</div>
                            <h3 className="text-gray-800 font-bold text-lg">Basic Information</h3>
                        </div>
                        
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm text-gray-700 mb-1.5 font-medium">Product Name <span className="text-red-500">*</span></label>
                                <input 
                                    type="text" 
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`w-full border ${errors.name ? 'border-red-400 focus:ring-red-500' : 'border-[#A3C93A]/50 focus:border-[#6CA52C] focus:ring-[#6CA52C]/20'} border-opacity-60 rounded px-4 py-2.5 outline-none focus:ring-2 transition-all shadow-sm`}
                                />
                                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name[0]}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label className="text-sm text-gray-700 font-medium">Category <span className="text-red-500">*</span></label>
                                        <button 
                                            type="button" 
                                            onClick={() => setShowCategoryModal(true)}
                                            className="text-[11px] text-[#6CA52C] font-bold hover:text-[#5a8b24] flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full transition-colors shadow-sm"
                                        >
                                            <Plus size={10} strokeWidth={3} /> Quick Add
                                        </button>
                                    </div>
                                    <select 
                                        name="category_id"
                                        value={formData.category_id}
                                        onChange={handleChange}
                                        className="w-full border border-[#A3C93A]/50 rounded px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#6CA52C]/20 focus:border-[#6CA52C] transition-all shadow-sm text-gray-700 bg-white"
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label className="text-sm text-gray-700 font-medium">Unit <span className="text-red-500">*</span></label>
                                        <button 
                                            type="button" 
                                            onClick={() => setShowUnitModal(true)}
                                            className="text-[11px] text-[#6CA52C] font-bold hover:text-[#5a8b24] flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full transition-colors shadow-sm"
                                        >
                                            <Plus size={10} strokeWidth={3} /> Quick Add
                                        </button>
                                    </div>
                                    <select 
                                        name="unit_id"
                                        value={formData.unit_id}
                                        onChange={handleChange}
                                        className="w-full border border-[#A3C93A]/50 rounded px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#6CA52C]/20 focus:border-[#6CA52C] transition-all shadow-sm text-gray-700 bg-white"
                                    >
                                        <option value="">Select Unit</option>
                                        {units.map(unit => <option key={unit.id} value={unit.id}>{unit.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1.5 font-medium">Minimum Quantity</label>
                                    <input 
                                        type="number" 
                                        name="minimum_quantity"
                                        value={formData.minimum_quantity}
                                        onChange={handleChange}
                                        className="w-full border border-[#A3C93A]/50 rounded px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#6CA52C]/20 focus:border-[#6CA52C] transition-all shadow-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-1.5">Alert when stock reaches this level</p>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1.5 font-medium">Selling Price (Ks)</label>
                                    <input 
                                        type="number" 
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="w-full border border-[#A3C93A]/50 rounded px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#6CA52C]/20 focus:border-[#6CA52C] transition-all shadow-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-1.5">Optional. Can be set during purchase.</p>
                                </div>
                            </div>

                            <div className="pt-2">
                                <label className="flex items-center gap-3 cursor-pointer group w-fit">
                                    <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none border-2 border-transparent">
                                        <input 
                                            type="checkbox" 
                                            name="is_published"
                                            checked={formData.is_published}
                                            onChange={handleChange}
                                            className="sr-only"
                                        />
                                        <div className={`w-full h-full rounded-full transition-colors ${formData.is_published ? 'bg-[#6CA52C]' : 'bg-gray-200'}`}></div>
                                        <div className={`absolute left-1 bg-white w-4 h-4 rounded-full transition-transform ${formData.is_published ? 'translate-x-5' : ''}`}></div>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-gray-700 group-hover:text-[#6CA52C] transition-colors">Publish to Storefront</span>
                                        <span className="text-[11px] text-gray-400 font-medium">When enabled, customers can see and buy this product online</span>
                                    </div>
                                </label>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-700 mb-1.5 font-medium">Description</label>
                                <textarea 
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows="4" 
                                    className="w-full border border-[#A3C93A]/50 rounded px-4 py-3 outline-none focus:ring-2 focus:ring-[#6CA52C]/20 focus:border-[#6CA52C] transition-all shadow-sm resize-none"
                                ></textarea>
                                <p className="text-xs text-gray-500 mt-1">Maximum 500 characters</p>
                            </div>
                        </div>
                    </div>

                    {/* Medical Information */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3 bg-gray-50/50">
                            <ActivitySquare size={22} className="text-[#6CA52C]" />
                            <h3 className="text-gray-800 font-bold text-lg">Medical Information</h3>
                        </div>
                        
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm text-gray-700 mb-1.5 font-medium">Dosage</label>
                                <input 
                                    type="text" 
                                    name="dosage"
                                    value={formData.dosage}
                                    onChange={handleChange}
                                    placeholder="Example: 500mg per tablet"
                                    className="w-full sm:w-1/2 border border-[#A3C93A]/50 rounded px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#6CA52C]/20 focus:border-[#6CA52C] transition-all shadow-sm"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm text-gray-700 mb-1.5 font-medium">Usage Instructions</label>
                                <textarea 
                                    name="usage"
                                    value={formData.usage}
                                    onChange={handleChange}
                                    rows="3" 
                                    className="w-full border border-[#A3C93A]/50 rounded px-4 py-3 outline-none focus:ring-2 focus:ring-[#6CA52C]/20 focus:border-[#6CA52C] transition-all shadow-sm resize-none"
                                ></textarea>
                                <p className="text-xs text-gray-500 mt-1">Maximum 500 characters</p>
                            </div>

                            <div>
                                <label className="block text-sm text-gray-700 mb-1.5 font-medium">Side Effects</label>
                                <textarea 
                                    name="side_effects"
                                    value={formData.side_effects}
                                    onChange={handleChange}
                                    rows="3" 
                                    className="w-full border border-[#A3C93A]/50 rounded px-4 py-3 outline-none focus:ring-2 focus:ring-[#6CA52C]/20 focus:border-[#6CA52C] transition-all shadow-sm resize-none"
                                ></textarea>
                                <p className="text-xs text-gray-500 mt-1">Maximum 500 characters</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (Images & Actions) */}
                <div className="space-y-6">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-3 bg-gray-50/50">
                            <ImageIcon size={20} className="text-[#6CA52C]" /> 
                            <h3 className="text-gray-800 font-bold">Product Images</h3>
                        </div>
                        <div className="p-5">
                            <p className="text-sm text-gray-600 mb-4 font-medium">First image will be set as primary</p>
                            
                            <div className="space-y-4">
                                {slots.slice(0, visibleSlots).map((slot, index) => {
                                    const isDeleted = slot && slot.existing && deletedImageIds.includes(slot.id);
                                    
                                    return (
                                        <div key={index} className={`bg-gray-50 border rounded-xl p-4 flex flex-col items-center transition-all ${isDeleted ? 'opacity-50 grayscale border-red-200 bg-red-50/10' : 'border-gray-100 hover:border-gray-200 shadow-sm'}`}>
                                            <div className="flex justify-between items-center w-full mb-3">
                                                <p className="font-bold text-sm text-gray-700">{index === 0 ? 'Primary Image' : `Image ${index + 1}`}</p>
                                                {slot && slot.existing && (
                                                    <label className="flex items-center gap-2 cursor-pointer group">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={isDeleted}
                                                            onChange={() => toggleDeleteExistingImage(slot.id)}
                                                            className="w-4 h-4 rounded border-gray-300 text-red-500 focus:ring-red-500"
                                                        />
                                                        <span className="text-[11px] font-bold text-red-500 group-hover:text-red-600">Delete this image</span>
                                                    </label>
                                                )}
                                            </div>
                                            
                                            <div className={`bg-white border text-center border-gray-200 border-dashed h-40 w-full flex items-center justify-center mb-4 rounded-xl p-2 overflow-hidden shadow-inner relative group/img ${isDeleted ? 'border-red-300' : ''}`}>
                                                {slot ? (
                                                    <img src={slot.url} alt={`Slot ${index + 1}`} className="max-h-full max-w-full object-contain" />
                                                ) : (
                                                    <div className="flex flex-col items-center gap-2 text-gray-300">
                                                        <ImageIcon size={40} className="opacity-20" />
                                                        <span className="text-[10px] font-bold uppercase tracking-wider">No Image</span>
                                                    </div>
                                                )}
                                                
                                                {slot && !isDeleted && (
                                                    <button 
                                                        type="button"
                                                        onClick={() => handleClearSlot(index)}
                                                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover/img:opacity-100 transition-opacity shadow-lg"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                )}
                                            </div>
                                            
                                            <div className="w-full">
                                                <label className={`w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold cursor-pointer transition-all shadow-sm border ${
                                                    isDeleted 
                                                    ? 'bg-gray-100 text-gray-400 border-transparent cursor-not-allowed' 
                                                    : 'bg-[#4A90E2] text-white border-transparent hover:bg-[#357ABD] hover:shadow-md active:scale-95'
                                                }`}>
                                                    <Upload size={14} /> {slot ? 'Replace Image' : 'Upload Image'}
                                                    <input 
                                                        type="file" 
                                                        accept="image/*" 
                                                        className="hidden" 
                                                        onChange={(e) => handleImageSelect(e, index)} 
                                                        disabled={isDeleted}
                                                    />
                                                </label>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-5 flex justify-start gap-2">
                               {visibleSlots < 5 && (
                                   <button 
                                        type="button" 
                                        onClick={() => setVisibleSlots(prev => prev + 1)} 
                                        className="text-gray-500 border border-gray-300 rounded px-4 py-2 text-sm font-medium flex items-center gap-1.5 hover:bg-gray-50 transition-colors shadow-sm bg-white"
                                   >
                                        <Plus size={15}/> Show More Slots
                                   </button>
                               )}
                               {visibleSlots > 2 && (
                                   <button 
                                        type="button" 
                                        onClick={() => setVisibleSlots(prev => prev - 1)} 
                                        className="text-gray-500 border border-gray-300 rounded px-4 py-2 text-sm font-medium flex items-center gap-1.5 hover:bg-gray-50 transition-colors shadow-sm bg-white"
                                   >
                                        <Minus size={15}/> Show Fewer Slots
                                   </button>
                               )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex justify-end items-center gap-3 pt-2">
                        <button 
                            type="button" 
                            onClick={() => navigate('/admin/products')} 
                            className="flex items-center gap-1.5 px-6 py-2.5 bg-white border-2 border-gray-300 text-gray-500 rounded-lg font-bold hover:bg-gray-50 hover:text-gray-700 transition-colors shadow-sm"
                        >
                            <Undo2 size={18} /> Reset
                        </button>
                        <button 
                            onClick={handleSubmit} 
                            disabled={submitting}
                            className="flex items-center gap-1.5 px-6 py-2.5 bg-[#6CA52C] border-2 border-[#6CA52C] text-white rounded-lg font-bold hover:bg-[#5a8a25] transition-colors shadow-sm disabled:opacity-50"
                        >
                            {submitting ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div> : <Save size={18} />}
                            Save Product
                        </button>
                    </div>
                </div>
            </div>

            {/* Crop Modal */}
            {cropModalOpen && selectedFileUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100">
                            <h3 className="font-bold text-gray-800 text-lg">Crop Product Image</h3>
                            <button onClick={() => setCropModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-1 rounded-full transition-colors"><X size={20}/></button>
                        </div>
                        
                        <div className="p-6 bg-gray-900 flex justify-center items-center overflow-auto max-h-[60vh] min-h-[300px]">
                            <ReactCrop 
                                crop={crop} 
                                onChange={c => setCrop(c)} 
                                onComplete={c => setCompletedCrop(c)} 
                                aspect={1} // Keep square aspect ratio for consistent pharmacy images
                                className="max-w-full"
                            >
                                <img 
                                    src={selectedFileUrl} 
                                    ref={imgRef} 
                                    alt="Crop target" 
                                    className="max-h-[50vh] object-contain mx-auto"
                                    onLoad={(e) => {
                                        const { naturalWidth, naturalHeight } = e.currentTarget;
                                        setCrop({
                                            unit: '%',
                                            width: 80,
                                            aspect: 1,
                                            x: 10,
                                            y: 10
                                        });
                                    }}
                                />
                            </ReactCrop>
                        </div>
                        
                        <div className="p-5 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                            <button 
                                onClick={() => setCropModalOpen(false)} 
                                className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-600 font-bold hover:bg-gray-50 shadow-sm"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleCropSave} 
                                className="px-6 py-2.5 bg-white border-2 border-[#6CA52C] text-[#6CA52C] rounded-lg font-bold hover:bg-[#f3f9eb] shadow-sm transition-colors"
                            >
                                Crop & Save
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Add Category Modal */}
            {showCategoryModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 flex flex-col animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-5 border-b border-gray-100 pb-3">
                            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                <Tag size={18} className="text-[#6CA52C]" /> Add New Category
                            </h3>
                            <button onClick={() => setShowCategoryModal(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full transition-colors"><X size={16}/></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Category Name</label>
                                <input 
                                    type="text" 
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    placeholder="e.g. Vitamins, Care..." 
                                    autoFocus
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6CA52C]/20 focus:border-[#6CA52C] outline-none transition-all shadow-sm"
                                />
                            </div>
                            <button 
                                onClick={handleQuickAddCategory}
                                className="w-full bg-[#6CA52C] hover:bg-[#5a8b24] text-white py-2.5 rounded-lg font-bold shadow-sm transition-colors"
                            >
                                Save Category
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quick Add Unit Modal */}
            {showUnitModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 flex flex-col animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-5 border-b border-gray-100 pb-3">
                            <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                                <ActivitySquare size={18} className="text-[#6CA52C]" /> Add New Unit
                            </h3>
                            <button onClick={() => setShowUnitModal(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-1.5 rounded-full transition-colors"><X size={16}/></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Unit Type</label>
                                <input 
                                    type="text" 
                                    value={newUnitName}
                                    onChange={(e) => setNewUnitName(e.target.value)}
                                    placeholder="e.g. tablet, capsule, ml..." 
                                    autoFocus
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#6CA52C]/20 focus:border-[#6CA52C] outline-none transition-all shadow-sm"
                                />
                            </div>
                            <button 
                                onClick={handleQuickAddUnit}
                                className="w-full bg-[#6CA52C] hover:bg-[#5a8b24] text-white py-2.5 rounded-lg font-bold shadow-sm transition-colors"
                            >
                                Save Unit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminProductForm;
