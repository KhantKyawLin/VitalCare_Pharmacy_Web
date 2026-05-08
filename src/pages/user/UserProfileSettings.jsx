import React, { useState, useContext, useRef } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { User, Mail, Phone, MapPin, Lock, Save, Key, Camera, UserCircle, X, Upload } from 'lucide-react';

// Reuse the same cropping utility from AdminProductForm
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

const UserProfileSettings = () => {
    const { user, token, setUser } = useContext(AuthContext);
    
    // Profile State
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        gender: user?.gender || 'others'
    });

    // Password State
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        password: '',
        password_confirmation: ''
    });

    // Profile Image State
    const [profilePreview, setProfilePreview] = useState(
        user?.profile ? `http://localhost:8000/storage/${user.profile}` : null
    );
    const [profileFile, setProfileFile] = useState(null);

    // Crop Modal States (same pattern as AdminProductForm)
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [selectedFileUrl, setSelectedFileUrl] = useState(null);
    const [crop, setCrop] = useState({ unit: '%', width: 80, aspect: 1 });
    const [completedCrop, setCompletedCrop] = useState(null);
    const imgRef = useRef(null);
    const fileInputRef = useRef(null);

    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
    const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
    const [errors, setErrors] = useState({});

    const handleProfileChange = (e) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: null });
        }
    };

    // --- Photo Upload Flow (reuses crop pattern) ---
    const handlePhotoSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setSelectedFileUrl(url);
            setCrop({ unit: '%', width: 80, aspect: 1 });
            setCompletedCrop(null);
            setCropModalOpen(true);
        }
        // Reset input so same file can be re-selected
        e.target.value = '';
    };

    const handleCropSave = async () => {
        if (!completedCrop || !imgRef.current) {
            setCropModalOpen(false);
            return;
        }
        try {
            const fileName = `profile_${Date.now()}.jpg`;
            const { file, url } = await getCroppedImg(imgRef.current, completedCrop, fileName);
            setProfileFile(file);
            setProfilePreview(url);
            setCropModalOpen(false);
        } catch (error) {
            console.error("Cropping failed:", error);
            Swal.fire('Error', 'Failed to crop image.', 'error');
        }
    };

    const uploadProfilePhoto = async () => {
        if (!profileFile) return;
        setIsUploadingPhoto(true);
        try {
            const formData = new FormData();
            formData.append('profile_image', profileFile);
            // Send current profile data along with the image
            formData.append('name', profileData.name);
            formData.append('phone', profileData.phone || '');
            formData.append('address', profileData.address || '');
            formData.append('gender', profileData.gender);

            const response = await axios.post('http://localhost:8000/api/auth/profile', formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.user) {
                setUser(response.data.user);
                setProfileFile(null);
                setProfilePreview(
                    response.data.user.profile 
                        ? `http://localhost:8000/storage/${response.data.user.profile}` 
                        : null
                );
                Swal.fire({
                    icon: 'success',
                    title: 'Photo Updated',
                    text: 'Your profile photo has been saved.',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        } catch (err) {
            console.error('Upload error:', err);
            Swal.fire('Error', 'Failed to upload photo. Please try again.', 'error');
        } finally {
            setIsUploadingPhoto(false);
        }
    };

    const updateProfile = async (e) => {
        e.preventDefault();
        setIsUpdatingProfile(true);
        setErrors({});

        try {
            // If there's a new photo, use FormData
            if (profileFile) {
                const formData = new FormData();
                formData.append('profile_image', profileFile);
                formData.append('name', profileData.name);
                formData.append('phone', profileData.phone || '');
                formData.append('address', profileData.address || '');
                formData.append('gender', profileData.gender);

                const response = await axios.post('http://localhost:8000/api/auth/profile', formData, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                if (response.data.user) {
                    setUser(response.data.user);
                    setProfileFile(null);
                    setProfilePreview(
                        response.data.user.profile
                            ? `http://localhost:8000/storage/${response.data.user.profile}`
                            : null
                    );
                }
            } else {
                const response = await axios.put('http://localhost:8000/api/auth/profile', profileData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.user) {
                    setUser(response.data.user);
                }
            }

            Swal.fire({
                icon: 'success',
                title: 'Profile Updated',
                text: 'Your profile information has been saved successfully.',
                timer: 2000,
                showConfirmButton: false
            });
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data);
            } else {
                Swal.fire('Error', 'Failed to update profile. Please try again.', 'error');
            }
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const updatePassword = async (e) => {
        e.preventDefault();
        setIsUpdatingPassword(true);
        setErrors({});

        try {
            const response = await axios.put('http://localhost:8000/api/auth/profile', {
                ...profileData,
                ...passwordData
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.status === 'success') {
                setPasswordData({ current_password: '', password: '', password_confirmation: '' });
                Swal.fire({
                    icon: 'success',
                    title: 'Password Changed',
                    text: 'Your password has been updated successfully.',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        } catch (err) {
            if (err.response?.status === 422) {
                setErrors(err.response.data);
            } else {
                Swal.fire('Error', 'Failed to change password. Please try again.', 'error');
            }
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Account Management</h1>
                    <p className="text-slate-500 text-sm mt-1">Manage your profile information and security settings.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Profile Card */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden sticky top-24">
                        <div className="h-24 bg-gradient-to-r from-primary-green to-primary-dark"></div>
                        <div className="px-6 pb-8 -mt-12">
                            <div className="flex flex-col items-center">
                                {/* Profile Photo with Upload Trigger */}
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg overflow-hidden">
                                        <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center text-primary-green overflow-hidden">
                                            {profilePreview ? (
                                                <img src={profilePreview} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={42} strokeWidth={1.5} />
                                            )}
                                        </div>
                                    </div>
                                    {/* Camera overlay */}
                                    <button 
                                        onClick={() => fileInputRef.current?.click()} 
                                        className="absolute inset-0 rounded-full bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer"
                                    >
                                        <Camera size={22} />
                                    </button>
                                    {/* Online dot */}
                                    <div className="absolute bottom-1 right-1 w-5 h-5 bg-primary-green border-2 border-white rounded-full flex items-center justify-center z-10 shadow-sm">
                                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                    </div>
                                    {/* Hidden File Input */}
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handlePhotoSelect}
                                        accept="image/*" 
                                        className="hidden" 
                                    />
                                </div>

                                {/* Upload button (only show when a new photo is cropped) */}
                                {profileFile && (
                                    <button 
                                        onClick={uploadProfilePhoto}
                                        disabled={isUploadingPhoto}
                                        className="mt-3 flex items-center gap-1.5 text-xs font-bold text-primary-green hover:text-primary-dark bg-primary-green/10 hover:bg-primary-green/20 px-3 py-1.5 rounded-full transition-all"
                                    >
                                        {isUploadingPhoto ? (
                                            <div className="w-3.5 h-3.5 border-2 border-primary-green/30 border-t-primary-green rounded-full animate-spin"></div>
                                        ) : (
                                            <Upload size={14} />
                                        )}
                                        Save Photo
                                    </button>
                                )}

                                <h2 className="text-xl font-bold text-slate-800 mt-4">{user?.name}</h2>
                                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold uppercase tracking-wider mt-1">{user?.role}</span>
                                
                                <div className="w-full mt-8 space-y-4 pt-6 border-t border-slate-50">
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center">
                                            <Mail size={16} />
                                        </div>
                                        <span className="text-sm truncate">{user?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center">
                                            <Phone size={16} />
                                        </div>
                                        <span className="text-sm">{user?.phone || 'Not provided'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600">
                                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center">
                                            <UserCircle size={16} />
                                        </div>
                                        <span className="text-sm capitalize">{user?.gender || 'N/A'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Settings Forms */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Profile Form */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-primary-green/10 flex items-center justify-center text-primary-green">
                                <UserCircle size={20} />
                            </div>
                            <h3 className="font-bold text-slate-800">Profile Information</h3>
                        </div>
                        <form onSubmit={updateProfile} className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            name="name"
                                            value={profileData.name}
                                            onChange={handleProfileChange}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green transition-all"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    {errors.name && <p className="text-xs text-red-500 ml-1">{errors.name[0]}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="email"
                                            value={profileData.email}
                                            disabled
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 cursor-not-allowed"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-400 ml-1 mt-1">* Email cannot be changed</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="text"
                                            name="phone"
                                            value={profileData.phone}
                                            onChange={handleProfileChange}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green transition-all"
                                            placeholder="+95 9..."
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Gender</label>
                                    <select
                                        name="gender"
                                        value={profileData.gender}
                                        onChange={handleProfileChange}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green transition-all"
                                    >
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="others">Others</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Delivery Address</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-3 text-slate-400" size={18} />
                                    <textarea
                                        name="address"
                                        rows="3"
                                        value={profileData.address}
                                        onChange={handleProfileChange}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green transition-all resize-none"
                                        placeholder="Detailed address..."
                                    ></textarea>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={isUpdatingProfile}
                                    className="flex items-center gap-2 bg-primary-green hover:bg-primary-dark text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-primary-green/20 transition-all disabled:opacity-50"
                                >
                                    {isUpdatingProfile ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <Save size={18} />
                                    )}
                                    Save Profile Changes
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Password Form */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 flex items-center gap-3 text-slate-800">
                            <div className="w-10 h-10 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500">
                                <Lock size={20} />
                            </div>
                            <h3 className="font-bold">Security Settings</h3>
                        </div>
                        <form onSubmit={updatePassword} className="p-6 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Current Password</label>
                                <div className="relative">
                                    <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                    <input
                                        type="password"
                                        name="current_password"
                                        value={passwordData.current_password}
                                        onChange={handlePasswordChange}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green transition-all"
                                        placeholder="••••••••"
                                    />
                                </div>
                                {errors.current_password && <p className="text-xs text-red-500 ml-1">{errors.current_password[0]}</p>}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="password"
                                            name="password"
                                            value={passwordData.password}
                                            onChange={handlePasswordChange}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green transition-all"
                                            placeholder="Minimum 6 characters"
                                        />
                                    </div>
                                    {errors.password && <p className="text-xs text-red-500 ml-1">{errors.password[0]}</p>}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Confirm New Password</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="password"
                                            name="password_confirmation"
                                            value={passwordData.password_confirmation}
                                            onChange={handlePasswordChange}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-green/20 focus:border-primary-green transition-all"
                                            placeholder="Repeat new password"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="submit"
                                    disabled={isUpdatingPassword}
                                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-slate-200 transition-all disabled:opacity-50"
                                >
                                    {isUpdatingPassword ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <Key size={18} />
                                    )}
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* --- Crop Modal (same pattern as AdminProductForm) --- */}
            {cropModalOpen && selectedFileUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center p-5 border-b border-gray-100">
                            <h3 className="font-bold text-gray-800 text-lg">Crop Profile Photo</h3>
                            <button onClick={() => setCropModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-1 rounded-full transition-colors"><X size={20}/></button>
                        </div>
                        
                        <div className="p-6 bg-gray-900 flex justify-center items-center overflow-auto max-h-[60vh] min-h-[300px]">
                            <ReactCrop 
                                crop={crop} 
                                onChange={c => setCrop(c)} 
                                onComplete={c => setCompletedCrop(c)} 
                                aspect={1}
                                circularCrop
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
                                className="px-6 py-2.5 bg-white border-2 border-primary-green text-primary-green rounded-lg font-bold hover:bg-primary-light shadow-sm transition-colors"
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

export default UserProfileSettings;
