import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { 
    BookOpen, 
    ChevronLeft, 
    Upload, 
    X, 
    Save, 
    Image as ImageIcon,
    Info,
    AlertCircle,
    Trash2
} from 'lucide-react';
import Swal from 'sweetalert2';

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

const AdminHealthTipForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEdit = !!id;

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(isEdit);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        image: null,
        is_published: true
    });
    
    // Crop states
    const [imagePreview, setImagePreview] = useState(null);
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [selectedFileUrl, setSelectedFileUrl] = useState(null);
    const [crop, setCrop] = useState({ unit: '%', width: 80, aspect: 2 / 1 });
    const [completedCrop, setCompletedCrop] = useState(null);
    const imgRef = useRef(null);

    const getConfig = () => ({
        headers: { 
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}` 
        }
    });

    useEffect(() => {
        if (isEdit) {
            fetchTip();
        }
    }, [id]);

    const fetchTip = async () => {
        try {
            const response = await axios.get(`http://127.0.0.1:8000/api/admin/health-tips/${id}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            const tip = response.data.tip;
            setFormData({
                title: tip.title,
                content: tip.content,
                image: null,
                is_published: !!tip.is_published
            });
            if (tip.image_path) {
                setImagePreview(`http://127.0.0.1:8000/storage/${tip.image_path}`);
            }
        } catch (error) {
            Swal.fire('Error', 'Failed to load health tip details.', 'error');
            navigate('/admin/health-tips');
        } finally {
            setFetching(false);
        }
    };

    const handleImageSelect = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            if (file.size > 2 * 1024 * 1024) {
                Swal.fire('File too large', 'Please upload an image smaller than 2MB', 'warning');
                return;
            }
            const url = URL.createObjectURL(file);
            setSelectedFileUrl(url);
            setCrop({ unit: '%', width: 80, aspect: 2 / 1 });
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
            const fileName = `health_tip_crop_${Date.now()}.jpg`;
            const { file, url } = await getCroppedImg(imgRef.current, completedCrop, fileName);
            
            setFormData(prev => ({ ...prev, image: file }));
            setImagePreview(url);
            setCropModalOpen(false);
        } catch (error) {
            console.error("Cropping failed:", error);
            Swal.fire('Error', 'Failed to crop image.', 'error');
        }
    };

    const clearImage = () => {
        setFormData(prev => ({ ...prev, image: null }));
        setImagePreview(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const data = new FormData();
        data.append('title', formData.title);
        data.append('content', formData.content);
        data.append('is_published', formData.is_published ? 1 : 0);
        if (formData.image) {
            data.append('image', formData.image);
        }
        
        if (isEdit) {
            data.append('_method', 'PUT');
        }

        try {
            const url = isEdit 
                ? `http://127.0.0.1:8000/api/admin/health-tips/${id}` 
                : 'http://127.0.0.1:8000/api/admin/health-tips';
            
            await axios.post(url, data, getConfig());
            
            Swal.fire({
                title: 'Success!',
                text: `Health tip ${isEdit ? 'updated' : 'created'} successfully.`,
                icon: 'success',
                timer: 2000,
                showConfirmButton: false
            });
            
            navigate('/admin/health-tips');
        } catch (error) {
            console.error("Submit error:", error);
            const msg = error.response?.data?.message || 'Failed to save health tip.';
            Swal.fire('Error', msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#A3C93A]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 pt-2 pb-12 max-w-[1200px] mx-auto px-4">
            {/* Header Area */}
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#A3C93A]/10 rounded-lg">
                        <BookOpen size={28} className="text-[#A3C93A]" strokeWidth={2.5}/>
                    </div>
                    <div>
                        <h2 className="text-2xl text-gray-800 font-black tracking-tight">
                            {isEdit ? 'Edit Health Tip' : 'Create New Health-tip'}
                        </h2>
                    </div>
                </div>
                
                <button 
                    onClick={() => navigate('/admin/health-tips')}
                    className="flex items-center gap-2 text-gray-500 hover:text-gray-800 font-bold text-sm bg-white px-4 py-2 rounded-[4px] border border-gray-200 transition-all shadow-sm"
                >
                    <ChevronLeft size={18} /> Back to Health Tips
                </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Content Fields */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-50 mb-6">
                            <Info size={18} className="text-[#A3C93A]" />
                            <h3 className="font-black text-gray-800 uppercase tracking-widest text-xs">Tip Details</h3>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-600 uppercase tracking-wide">Title <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                required
                                placeholder="Enter a compelling title for your health tip"
                                className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#A3C93A]/10 focus:border-[#A3C93A] outline-none text-gray-700 font-bold transition-all placeholder:text-gray-400"
                                value={formData.title}
                                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-black text-gray-600 uppercase tracking-wide">Content <span className="text-red-500">*</span></label>
                            <textarea 
                                required
                                placeholder="Write your health tip content here..."
                                rows="12"
                                className="w-full px-5 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-[#A3C93A]/10 focus:border-[#A3C93A] outline-none text-gray-700 leading-relaxed transition-all placeholder:text-gray-400 resize-none"
                                value={formData.content}
                                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                            ></textarea>
                            <div className="flex justify-end">
                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Character count: {formData.content.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Image Upload & Actions */}
                <div className="space-y-6">
                    {/* Featured Image Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-2 pb-4 border-b border-gray-50 mb-6">
                            <ImageIcon size={18} className="text-[#A3C93A]" />
                            <h3 className="font-black text-gray-800 uppercase tracking-widest text-xs">Featured Image</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="relative group">
                                {imagePreview ? (
                                    <div className="relative aspect-[2/1] rounded-2xl overflow-hidden border-2 border-gray-100 shadow-inner group">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button 
                                                type="button"
                                                onClick={clearImage}
                                                className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all scale-75 group-hover:scale-100"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center aspect-[2/1] bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-100 hover:border-[#A3C93A] transition-all group">
                                        <div className="p-4 bg-white rounded-2xl shadow-sm group-hover:scale-110 transition-transform">
                                            <Upload className="text-gray-400 group-hover:text-[#A3C93A]" size={32} />
                                        </div>
                                        <span className="mt-4 text-sm font-bold text-gray-500">Click to upload image</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageSelect} />
                                    </label>
                                )}
                            </div>

                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex gap-3">
                                <AlertCircle size={18} className="text-blue-500 shrink-0" />
                                <div className="space-y-1">
                                    <p className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Primary Image</p>
                                    <p className="text-[10px] text-blue-600 leading-tight">Recommended size: 800x400px (2:1 ratio). Max size 2MB.</p>
                                </div>
                            </div>
                            
                            {imagePreview && (
                                <button 
                                    type="button" 
                                    onClick={clearImage}
                                    className="w-full py-3 text-red-500 font-bold text-xs uppercase tracking-widest border border-red-100 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={14}/> Clear Image
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Publish Settings Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center justify-between pb-4 border-b border-gray-50 mb-6">
                            <div className="flex items-center gap-2">
                                <AlertCircle size={18} className="text-[#A3C93A]" />
                                <h3 className="font-black text-gray-800 uppercase tracking-widest text-xs">Publish Settings</h3>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${formData.is_published ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                                {formData.is_published ? 'Published' : 'Draft'}
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="space-y-0.5">
                                <p className="text-sm font-bold text-gray-700">Visibility</p>
                                <p className="text-[10px] text-gray-400">Control if this tip is visible to users</p>
                            </div>
                            <button 
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, is_published: !prev.is_published }))}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${formData.is_published ? 'bg-[#A3C93A]' : 'bg-gray-300'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.is_published ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Submit Card */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col gap-3">
                        <button 
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-[#A3C93A] text-white rounded-2xl font-bold text-lg shadow-lg shadow-[#A3C93A]/20 hover:bg-[#8eb132] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                            ) : (
                                <><Save size={20} /> {isEdit ? 'Update Health Tip' : 'Save Health Tip'}</>
                            )}
                        </button>
                        
                        <button 
                            type="button"
                            onClick={() => navigate('/admin/health-tips')}
                            className="w-full py-4 bg-gray-50 text-gray-500 rounded-2xl font-bold hover:bg-gray-100 transition-all"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </form>

            {/* Crop Modal */}
            {cropModalOpen && selectedFileUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100">
                            <h3 className="font-black text-gray-800 text-lg">Crop Health Tip Image</h3>
                            <button onClick={() => setCropModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-1 rounded-full transition-colors"><X size={20}/></button>
                        </div>
                        
                        <div className="p-6 bg-gray-900 flex justify-center items-center overflow-auto max-h-[60vh] min-h-[300px]">
                            <ReactCrop 
                                crop={crop} 
                                onChange={c => setCrop(c)} 
                                onComplete={c => setCompletedCrop(c)} 
                                aspect={2 / 1} 
                                className="max-w-full"
                            >
                                <img 
                                    src={selectedFileUrl} 
                                    ref={imgRef} 
                                    alt="Crop target" 
                                    className="max-h-[50vh] object-contain mx-auto"
                                    onLoad={(e) => {
                                        setCrop({
                                            unit: '%',
                                            width: 80,
                                            aspect: 2 / 1,
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
                                className="px-6 py-2.5 bg-white border-2 border-[#A3C93A] text-[#A3C93A] rounded-lg font-bold hover:bg-[#f3f9eb] shadow-sm transition-colors"
                            >
                                Crop & Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminHealthTipForm;
