import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Swal from 'sweetalert2';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { 
    User, Mail, Phone, MapPin, Package, Clock, CheckCircle2, 
    XCircle, ChevronRight, LogOut, Camera, Upload, Edit3, X, Save 
} from 'lucide-react';

// Reusing crop utility from Admin
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
      0, 0, crop.width * scaleX, crop.height * scaleY
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        if (!blob) return reject(new Error('Canvas is empty'));
        blob.name = fileName;
        resolve({ file: new File([blob], fileName, { type: blob.type || 'image/jpeg' }), url: window.URL.createObjectURL(blob) });
      }, 'image/jpeg', 1);
    });
};

const UserProfile = () => {
    const { user, token, setUser, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Edit Profile State
    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        address: user?.address || ''
    });
    const [isUpdating, setIsUpdating] = useState(false);

    // Profile Photo State
    const [profilePreview, setProfilePreview] = useState(user?.profile ? `http://localhost:8000/storage/${user.profile}` : null);
    const [profileFile, setProfileFile] = useState(null);
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [selectedFileUrl, setSelectedFileUrl] = useState(null);
    const [crop, setCrop] = useState({ unit: '%', width: 80, aspect: 1 });
    const [completedCrop, setCompletedCrop] = useState(null);
    const imgRef = useRef(null);
    const fileInputRef = useRef(null);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }

        // Initialize state if user data changes
        setProfileData({
            name: user?.name || '',
            phone: user?.phone || '',
            address: user?.address || ''
        });
        setProfilePreview(user?.profile ? `http://localhost:8000/storage/${user.profile}` : null);

        const fetchOrders = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/auth/orders');
                setOrders(response.data);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, [token, navigate, user]);

    // --- Profile Editing ---
    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            const response = await axios.put('http://localhost:8000/api/auth/profile', profileData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.user) {
                setUser(response.data.user);
                setIsEditing(false);
                Swal.fire({ icon: 'success', title: 'Profile Updated', text: 'Your information has been saved.', timer: 2000, showConfirmButton: false });
            }
        } catch (err) {
            Swal.fire('Error', 'Failed to update profile.', 'error');
        } finally {
            setIsUpdating(false);
        }
    };

    // --- Photo Upload ---
    const handlePhotoSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFileUrl(URL.createObjectURL(file));
            setCrop({ unit: '%', width: 80, aspect: 1 });
            setCompletedCrop(null);
            setCropModalOpen(true);
        }
        e.target.value = '';
    };

    const handleCropSave = async () => {
        if (!completedCrop || !imgRef.current) return;
        try {
            const { file, url } = await getCroppedImg(imgRef.current, completedCrop, `profile_${Date.now()}.jpg`);
            setProfileFile(file);
            setProfilePreview(url);
            setCropModalOpen(false);
        } catch (error) {
            Swal.fire('Error', 'Failed to crop image.', 'error');
        }
    };

    const uploadProfilePhoto = async () => {
        if (!profileFile) return;
        setIsUploadingPhoto(true);
        try {
            const formData = new FormData();
            formData.append('profile_image', profileFile);
            formData.append('name', user.name);
            
            const response = await axios.post('http://localhost:8000/api/auth/profile', formData, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });

            if (response.data.user) {
                setUser(response.data.user);
                setProfileFile(null);
                Swal.fire({ icon: 'success', title: 'Photo Updated', timer: 2000, showConfirmButton: false });
            }
        } catch (err) {
            Swal.fire('Error', 'Failed to upload photo.', 'error');
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    const getStatusConfig = (status) => {
        switch(status) {
            case 'pending': return { icon: <Clock size={16}/>, color: 'text-amber-600', bg: 'bg-amber-100' };
            case 'processing': return { icon: <Package size={16}/>, color: 'text-blue-600', bg: 'bg-blue-100' };
            case 'completed': return { icon: <CheckCircle2 size={16}/>, color: 'text-emerald-600', bg: 'bg-emerald-100' };
            case 'cancelled': return { icon: <XCircle size={16}/>, color: 'text-red-600', bg: 'bg-red-100' };
            default: return { icon: <Clock size={16}/>, color: 'text-slate-600', bg: 'bg-slate-100' };
        }
    };

    if (!user) return null;

    return (
        <div className="bg-[#f4f6f9] min-h-screen pb-20">
            {/* Header Banner */}
            <div className="bg-[#6CA52C] h-48 w-full">
                <div className="container mx-auto px-4 h-full flex flex-col justify-end pb-8">
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">My Health Portal</h1>
                    <p className="text-[#e2f3cc] mt-2 font-medium">Manage your wellness orders and personal details.</p>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-12 flex flex-col lg:flex-row gap-8">
                {/* Left Column: Profile Card */}
                <div className="lg:w-1/3">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden sticky top-24">
                        <div className="p-8 flex flex-col items-center relative">
                            {/* Profile Photo */}
                            <div className="relative group mb-4">
                                <div className="w-28 h-28 rounded-full bg-white p-1.5 shadow-lg">
                                    <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-[#6CA52C] overflow-hidden">
                                        {profilePreview ? (
                                            <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={48} strokeWidth={1.5} />
                                        )}
                                    </div>
                                </div>
                                <button 
                                    onClick={() => fileInputRef.current?.click()} 
                                    className="absolute inset-0 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer m-1.5"
                                >
                                    <Camera size={24} />
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handlePhotoSelect} accept="image/*" className="hidden" />
                            </div>

                            {profileFile && (
                                <button 
                                    onClick={uploadProfilePhoto} disabled={isUploadingPhoto}
                                    className="mb-4 flex items-center gap-2 text-sm font-bold text-white bg-[#6CA52C] hover:bg-[#5a8c24] px-4 py-2 rounded-full shadow-md transition-all"
                                >
                                    {isUploadingPhoto ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Upload size={16} />}
                                    Save Photo
                                </button>
                            )}

                            {!isEditing ? (
                                <>
                                    <h2 className="text-2xl font-black text-slate-800 text-center">{user.name}</h2>
                                    <p className="text-slate-500 font-medium mt-1">{user.email}</p>
                                    
                                    <div className="w-full mt-8 space-y-4 pt-6 border-t border-slate-100">
                                        <div className="flex items-start gap-4 text-slate-600">
                                            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 text-[#6CA52C]">
                                                <Phone size={18} />
                                            </div>
                                            <div className="flex flex-col pt-1">
                                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Phone Number</span>
                                                <span className="font-medium text-slate-800">{user.phone || 'Not provided'}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4 text-slate-600">
                                            <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0 text-[#6CA52C]">
                                                <MapPin size={18} />
                                            </div>
                                            <div className="flex flex-col pt-1">
                                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Delivery Address</span>
                                                <span className="font-medium text-slate-800 leading-relaxed">{user.address || 'Not provided'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => setIsEditing(true)}
                                        className="w-full mt-8 flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 py-3 rounded-xl font-bold transition-colors border border-slate-200"
                                    >
                                        <Edit3 size={18} /> Edit Profile
                                    </button>
                                </>
                            ) : (
                                <form onSubmit={handleProfileSubmit} className="w-full space-y-4 animate-in fade-in">
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Full Name</label>
                                        <input type="text" required value={profileData.name} onChange={e => setProfileData({...profileData, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6CA52C]/20 focus:border-[#6CA52C] outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Phone Number</label>
                                        <input type="text" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6CA52C]/20 focus:border-[#6CA52C] outline-none" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Delivery Address</label>
                                        <textarea rows="3" value={profileData.address} onChange={e => setProfileData({...profileData, address: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#6CA52C]/20 focus:border-[#6CA52C] outline-none resize-none"></textarea>
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button type="button" onClick={() => setIsEditing(false)} className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200">Cancel</button>
                                        <button type="submit" disabled={isUpdating} className="flex-1 flex items-center justify-center gap-2 bg-[#6CA52C] text-white py-2.5 rounded-xl font-bold hover:bg-[#5a8c24] disabled:opacity-50">
                                            {isUpdating ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Save size={18} />} Save
                                        </button>
                                    </div>
                                </form>
                            )}

                            <button onClick={logout} className="mt-8 flex items-center gap-2 text-red-500 hover:text-red-700 font-bold transition-colors">
                                <LogOut size={18} /> Sign Out
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column: Order History */}
                <div className="lg:w-2/3">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden pt-8 px-8 pb-4">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-[#6CA52C]/10 flex items-center justify-center text-[#6CA52C]">
                                <Package size={24} />
                            </div>
                            <h2 className="text-2xl font-black text-slate-800">Order History</h2>
                        </div>

                        {isLoading ? (
                            <div className="py-12 flex flex-col items-center text-slate-400">
                                <div className="w-10 h-10 border-4 border-[#6CA52C]/30 border-t-[#6CA52C] rounded-full animate-spin mb-4"></div>
                                <p className="font-medium">Loading your orders...</p>
                            </div>
                        ) : orders.length === 0 ? (
                            <div className="py-16 flex flex-col items-center text-center">
                                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                    <Package size={40} className="text-slate-300" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">No orders yet</h3>
                                <p className="text-slate-500 mb-8 max-w-sm">When you place orders for your health needs, they will appear here so you can track them.</p>
                                <Link to="/products" className="bg-[#6CA52C] hover:bg-[#5a8c24] text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-[#6CA52C]/20 transition-all hover:-translate-y-1">
                                    Browse Products
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-6 pb-6">
                                {orders.map(order => {
                                    const statusConfig = getStatusConfig(order.status);
                                    return (
                                        <div key={order.id} className="border border-slate-100 rounded-2xl overflow-hidden hover:border-[#6CA52C]/30 transition-colors group">
                                            <div className="bg-slate-50/50 p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                                                <div className="flex gap-6">
                                                    <div>
                                                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block mb-1">Order Placed</span>
                                                        <span className="text-slate-800 font-bold">{new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block mb-1">Total Amount</span>
                                                        <span className="text-[#6CA52C] font-black">${parseFloat(order.total_amount).toFixed(2)}</span>
                                                    </div>
                                                    <div className="hidden sm:block">
                                                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block mb-1">Order #</span>
                                                        <span className="text-slate-600 font-mono font-medium">#{order.id.toString().padStart(6, '0')}</span>
                                                    </div>
                                                </div>
                                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${statusConfig.bg} ${statusConfig.color} w-fit`}>
                                                    {statusConfig.icon}
                                                    <span className="text-xs font-bold uppercase tracking-wider">{order.status}</span>
                                                </div>
                                            </div>
                                            <div className="p-5 divide-y divide-slate-100">
                                                {order.products.map(op => {
                                                    const imageUrl = op.product.pictures?.length > 0 ? `http://localhost:8000/storage/${op.product.pictures[0].image_path}` : "https://placehold.co/80x80/f8fafc/a3c93a?text=Item";
                                                    return (
                                                        <div key={op.id} className="py-4 flex items-center gap-4 first:pt-0 last:pb-0">
                                                            <div className="w-16 h-16 rounded-xl overflow-hidden border border-slate-100 bg-white shrink-0">
                                                                <img src={imageUrl} alt={op.product.name} className="w-full h-full object-cover" />
                                                            </div>
                                                            <div className="flex-grow min-w-0">
                                                                <Link to={`/products/${op.product.id}`} className="font-bold text-slate-800 hover:text-[#6CA52C] truncate block transition-colors">
                                                                    {op.product.name}
                                                                </Link>
                                                                <div className="text-sm font-medium text-slate-500 mt-0.5">Qty: {op.quantity}</div>
                                                            </div>
                                                            <div className="font-bold text-slate-800 shrink-0">
                                                                ${parseFloat(op.price).toFixed(2)}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Crop Modal */}
            {cropModalOpen && selectedFileUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-5 border-b border-slate-100">
                            <h3 className="font-bold text-slate-800">Crop Profile Photo</h3>
                            <button onClick={() => setCropModalOpen(false)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded-full"><X size={20}/></button>
                        </div>
                        <div className="p-6 bg-slate-900 flex justify-center overflow-auto max-h-[60vh]">
                            <ReactCrop crop={crop} onChange={c => setCrop(c)} onComplete={c => setCompletedCrop(c)} aspect={1} circularCrop>
                                <img src={selectedFileUrl} ref={imgRef} alt="Crop" className="max-h-[50vh] object-contain" onLoad={() => setCrop({unit: '%', width: 80, aspect: 1, x: 10, y: 10})} />
                            </ReactCrop>
                        </div>
                        <div className="p-5 flex justify-end gap-3 bg-slate-50">
                            <button onClick={() => setCropModalOpen(false)} className="px-6 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-600">Cancel</button>
                            <button onClick={handleCropSave} className="px-6 py-2 bg-[#6CA52C] text-white rounded-xl font-bold">Crop & Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserProfile;
