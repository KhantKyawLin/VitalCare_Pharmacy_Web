import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Layout, 
    Upload, 
    Save, 
    RefreshCcw, 
    CheckCircle2,
    Type,
    Heart,
    Target,
    Image as ImageIcon,
    Info
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useSettings } from '../../context/SettingsContext';

const AdminAboutSettings = () => {
    const { settings, updateSettingsState } = useSettings();
    const [formData, setFormData] = useState({
        about_title: '',
        about_description: '',
        about_mission_title: 'Our Mission',
        about_mission_desc: '',
        about_vision_title: 'Our Vision',
        about_vision_desc: '',
    });
    
    const [heroFile, setHeroFile] = useState(null);
    const [heroPreview, setHeroPreview] = useState(null);
    const [storyFile, setStoryFile] = useState(null);
    const [storyPreview, setStoryPreview] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (settings) {
            setFormData({
                about_title: settings.about_title || 'Your Health, Our Commitment.',
                about_description: settings.about_description || '',
                about_mission_title: settings.about_mission_title || 'Our Mission',
                about_mission_desc: settings.about_mission_desc || '',
                about_vision_title: settings.about_vision_title || 'Our Vision',
                about_vision_desc: settings.about_vision_desc || '',
            });
            if (settings.about_hero_image) setHeroPreview(`http://127.0.0.1:8000/storage/${settings.about_hero_image}`);
            if (settings.about_story_image) setStoryPreview(`http://127.0.0.1:8000/storage/${settings.about_story_image}`);
        }
    }, [settings]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const data = new FormData();
        Object.keys(formData).forEach(key => data.append(key, formData[key]));
        
        if (heroFile) data.append('about_hero_image', heroFile);
        if (storyFile) data.append('about_story_image', storyFile);

        try {
            const response = await axios.post('http://127.0.0.1:8000/api/admin/site-settings', data, {
                headers: { 
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data) {
                updateSettingsState(response.data.settings);
                Swal.fire({
                    icon: 'success',
                    title: 'Settings Saved',
                    text: 'About Us content has been updated.',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            console.error("Error saving settings:", error);
            Swal.fire('Error', 'Failed to save about settings.', 'error');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 pt-2 pb-12 max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-3 mb-2">
                <div className="bg-primary-green p-1.5 rounded-full text-white">
                    <Info size={20} className="stroke-2" />
                </div>
                <div>
                    <h2 className="text-[22px] text-gray-800 font-bold uppercase tracking-tight">About Us Management</h2>
                    <p className="text-xs text-gray-500 font-medium">Customize the story and vision of Vital Care Pharmacy.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content Column */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Page Content Card */}
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 border-b border-gray-50 pb-4 mb-2">
                            <Type size={18} className="text-primary-green" />
                            <h3 className="font-bold text-gray-800 text-base">Core Information</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Hero Section Title</label>
                                <input 
                                    type="text"
                                    name="about_title"
                                    value={formData.about_title}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-green/20 transition-all font-bold"
                                    placeholder="e.g. Your Health, Our Commitment."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Our Story Description</label>
                                <textarea 
                                    name="about_description"
                                    value={formData.about_description}
                                    onChange={handleInputChange}
                                    rows="5"
                                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary-green/20 transition-all resize-none leading-relaxed font-medium"
                                    placeholder="Tell the story of your pharmacy..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Mission & Vision Card */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
                                <Target size={18} className="text-amber-500" />
                                <h3 className="font-bold text-gray-800 text-base">Our Mission</h3>
                            </div>
                            <div className="space-y-4">
                                <input 
                                    type="text"
                                    name="about_mission_title"
                                    value={formData.about_mission_title}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-50 border-b border-slate-200 p-2 text-xs font-black uppercase tracking-widest outline-none focus:border-amber-500 transition-all"
                                />
                                <textarea 
                                    name="about_mission_desc"
                                    value={formData.about_mission_desc}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full bg-slate-50 rounded-lg p-3 text-xs font-medium leading-relaxed outline-none focus:ring-2 focus:ring-amber-500/10 transition-all resize-none"
                                    placeholder="Describe your mission..."
                                />
                            </div>
                        </div>

                        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
                                <Heart size={18} className="text-rose-500" />
                                <h3 className="font-bold text-gray-800 text-base">Our Vision</h3>
                            </div>
                            <div className="space-y-4">
                                <input 
                                    type="text"
                                    name="about_vision_title"
                                    value={formData.about_vision_title}
                                    onChange={handleInputChange}
                                    className="w-full bg-slate-50 border-b border-slate-200 p-2 text-xs font-black uppercase tracking-widest outline-none focus:border-rose-500 transition-all"
                                />
                                <textarea 
                                    name="about_vision_desc"
                                    value={formData.about_vision_desc}
                                    onChange={handleInputChange}
                                    rows="3"
                                    className="w-full bg-slate-50 rounded-lg p-3 text-xs font-medium leading-relaxed outline-none focus:ring-2 focus:ring-rose-500/10 transition-all resize-none"
                                    placeholder="Describe your vision..."
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar Assets Column */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Images Card */}
                    <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
                            <ImageIcon size={18} className="text-primary-green" />
                            <h3 className="font-bold text-gray-800 text-base">Visual Assets</h3>
                        </div>

                        <div className="space-y-8">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Hero Image (Background)</label>
                                <div className="relative group aspect-[4/3] bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center overflow-hidden transition-all hover:bg-slate-100">
                                    {heroPreview ? (
                                        <img src={heroPreview} alt="Hero" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-slate-300">
                                            <Upload size={32} />
                                            <span className="text-[10px] font-bold uppercase">Upload Photo</span>
                                        </div>
                                    )}
                                    <label className="absolute inset-0 cursor-pointer bg-black/50 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all">
                                        <Upload size={24} className="mb-1" />
                                        <span className="text-xs font-black uppercase tracking-widest">Change Image</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) { setHeroFile(file); setHeroPreview(URL.createObjectURL(file)); }
                                        }} />
                                    </label>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest">Story Image (Secondary)</label>
                                <div className="relative group aspect-[4/3] bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center overflow-hidden transition-all hover:bg-slate-100">
                                    {storyPreview ? (
                                        <img src={storyPreview} alt="Story" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 text-slate-300">
                                            <Upload size={32} />
                                            <span className="text-[10px] font-bold uppercase">Upload Photo</span>
                                        </div>
                                    )}
                                    <label className="absolute inset-0 cursor-pointer bg-black/50 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all">
                                        <Upload size={24} className="mb-1" />
                                        <span className="text-xs font-black uppercase tracking-widest">Change Image</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                            const file = e.target.files[0];
                                            if (file) { setStoryFile(file); setStoryPreview(URL.createObjectURL(file)); }
                                        }} />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Card */}
                    <div className="bg-[#1A1A1A] p-8 rounded-2xl shadow-xl text-white space-y-6">
                        <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                            <Save size={18} className="text-primary-green" />
                            <h3 className="font-bold text-base">Save Changes</h3>
                        </div>
                        <p className="text-xs text-white/40 italic font-medium">
                            * Updating these settings will modify the About Us page content for all visitors immediately.
                        </p>
                        <button 
                            type="submit"
                            disabled={saving}
                            className="w-full py-4 rounded-xl text-white font-black uppercase tracking-widest text-[11px] flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                            style={{ backgroundColor: settings?.primary_color || '#8DB600' }}
                        >
                            {saving ? (
                                <><RefreshCcw size={16} className="animate-spin" /> Publishing...</>
                            ) : (
                                <><CheckCircle2 size={16} /> Publish Changes</>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AdminAboutSettings;
