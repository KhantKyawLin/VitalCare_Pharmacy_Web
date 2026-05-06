import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
    Palette, 
    Upload, 
    Globe, 
    Save, 
    RefreshCcw, 
    CheckCircle2,
    Layout,
    Type
} from 'lucide-react';
import Swal from 'sweetalert2';
import { useSettings } from '../../context/SettingsContext';

const AdminBrandingSettings = () => {
    const { settings, updateSettingsState, fetchSettings } = useSettings();
    const [formData, setFormData] = useState({
        site_name: '',
        primary_color: '#8DB600',
        accent_color: '#7fa400'
    });
    const [logoFile, setLogoFile] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (settings) {
            setFormData({
                site_name: settings.site_name || 'Vital Care Pharmacy',
                primary_color: settings.primary_color || '#8DB600',
                accent_color: settings.accent_color || '#7fa400'
            });
            if (settings.site_logo) {
                setLogoPreview(`http://127.0.0.1:8000/storage/${settings.site_logo}`);
            }
        }
    }, [settings]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        const data = new FormData();
        data.append('site_name', formData.site_name);
        data.append('primary_color', formData.primary_color);
        data.append('accent_color', formData.accent_color);
        if (logoFile) {
            data.append('logo', logoFile);
        }

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
                    text: 'Branding and UI settings have been updated globally.',
                    timer: 2000,
                    showConfirmButton: false
                });
            }
        } catch (error) {
            console.error("Error saving settings:", error);
            Swal.fire('Error', 'Failed to save branding settings.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const PRESET_THEMES = [
        { name: 'Vital Care', primary: '#8DB600', accent: '#7fa400' },
        { name: 'Ocean Medical', primary: '#0ea5e9', accent: '#0284c7' },
        { name: 'Rose Pharmacy', primary: '#e11d48', accent: '#be123c' },
        { name: 'Amber Health', primary: '#f59e0b', accent: '#d97706' },
        { name: 'Royal Care', primary: '#6366f1', accent: '#4f46e5' },
        { name: 'Midnight', primary: '#334155', accent: '#1e293b' },
    ];

    const handleApplyTheme = (theme) => {
        setFormData({
            ...formData,
            primary_color: theme.primary,
            accent_color: theme.accent
        });
    };

    return (
        <div className="space-y-6 pt-2 pb-12 max-w-5xl">
            <div className="flex items-center gap-3 mb-2">
                <div className="bg-slate-900 p-1.5 rounded-full text-white">
                    <Palette size={20} className="stroke-2" />
                </div>
                <div>
                    <h2 className="text-[22px] text-gray-800 font-bold">Branding & UI Design</h2>
                    <p className="text-xs text-gray-500">Configure your pharmacy's visual identity and global theme.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* General Identity */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Preset Themes Section */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 border-b border-gray-50 pb-4 mb-6">
                            <Palette size={18} className="text-primary-green" />
                            <h3 className="font-bold text-gray-800">Predefined Themes</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {PRESET_THEMES.map((theme) => (
                                <button
                                    key={theme.name}
                                    type="button"
                                    onClick={() => handleApplyTheme(theme)}
                                    className={`p-3 rounded-xl border transition-all text-left group hover:shadow-md ${
                                        formData.primary_color === theme.primary 
                                        ? 'border-gray-900 ring-2 ring-gray-900/5' 
                                        : 'border-gray-100 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex -space-x-1">
                                            <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: theme.primary }}></div>
                                            <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: theme.accent }}></div>
                                        </div>
                                        <span className="text-[10px] font-black uppercase text-gray-400 group-hover:text-gray-600 transition-colors">{theme.name}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full w-2/3" style={{ backgroundColor: theme.primary }}></div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-2 border-b border-gray-50 pb-4 mb-2">
                            <Globe size={18} className="text-primary-green" />
                            <h3 className="font-bold text-gray-800">Pharmacy Identity</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                                    <Type size={16} className="text-gray-400" /> Site Name
                                </label>
                                <input 
                                    type="text"
                                    name="site_name"
                                    value={formData.site_name}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-green/30 focus:border-primary-green transition-all"
                                    placeholder="Enter Pharmacy Name"
                                    required
                                />
                                <p className="text-[11px] text-gray-400 italic">This name appears in the browser tab and throughout the portal.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700">Primary Brand Color</label>
                                    <div className="flex gap-3">
                                        <input 
                                            type="color"
                                            name="primary_color"
                                            value={formData.primary_color}
                                            onChange={handleInputChange}
                                            className="h-11 w-11 p-0.5 rounded-lg border border-gray-200 cursor-pointer"
                                        />
                                        <input 
                                            type="text"
                                            name="primary_color"
                                            value={formData.primary_color}
                                            onChange={handleInputChange}
                                            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm uppercase font-mono"
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-400">Used for buttons, active states, and primary icons.</p>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-gray-700">Accent Color</label>
                                    <div className="flex gap-3">
                                        <input 
                                            type="color"
                                            name="accent_color"
                                            value={formData.accent_color}
                                            onChange={handleInputChange}
                                            className="h-11 w-11 p-0.5 rounded-lg border border-gray-200 cursor-pointer"
                                        />
                                        <input 
                                            type="text"
                                            name="accent_color"
                                            value={formData.accent_color}
                                            onChange={handleInputChange}
                                            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm uppercase font-mono"
                                        />
                                    </div>
                                    <p className="text-[11px] text-gray-400">Used for subtle hovers and secondary elements.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Live Preview Simulation */}
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 border-b border-gray-50 pb-4 mb-6">
                            <Layout size={18} className="text-primary-green" />
                            <h3 className="font-bold text-gray-800">Visual Standards Preview</h3>
                        </div>

                        <div className="space-y-8 bg-gray-50/50 p-6 rounded-xl border border-dashed border-gray-200">
                            {/* Buttons Preview */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Buttons & Hover Effects</h4>
                                <div className="flex flex-wrap gap-4">
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-bold text-gray-400">Normal</p>
                                        <button 
                                            type="button" 
                                            style={{ backgroundColor: formData.primary_color }} 
                                            className="px-6 py-2.5 text-white rounded text-[13px] font-bold shadow-lg shadow-primary-green/10 transition-all"
                                        >
                                            Solid Button
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-bold text-gray-400">Hover State</p>
                                        <button 
                                            type="button" 
                                            style={{ backgroundColor: formData.primary_color, filter: 'brightness(0.9)', transform: 'translateY(-1px)' }} 
                                            className="px-6 py-2.5 text-white rounded text-[13px] font-bold shadow-xl transition-all"
                                        >
                                            Hovered Button
                                        </button>
                                    </div>
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-bold text-gray-400">Outline</p>
                                        <button 
                                            type="button" 
                                            style={{ color: formData.primary_color, borderColor: formData.primary_color }} 
                                            className="px-6 py-2.5 border rounded text-[13px] font-bold bg-white transition-all hover:bg-gray-50"
                                        >
                                            Outline Action
                                        </button>
                                        <div className="flex items-center gap-1.5 mt-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: formData.accent_color }}></div>
                                            <span className="text-[9px] font-bold text-gray-400">Accent Highlight</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* UI Components Preview */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Dashboard Elements</h4>
                                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
                                        <div className="space-y-1">
                                            <p className="text-[11px] text-gray-500 font-medium uppercase tracking-tight">Total Revenue</p>
                                            <h5 className="text-2xl font-black text-gray-800">$12,450</h5>
                                            <div className="flex items-center gap-1 mt-2">
                                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: formData.primary_color }}></div>
                                                <span className="text-[10px] font-bold text-gray-400 italic">Live Syncing</span>
                                            </div>
                                        </div>
                                        <div className="p-2.5 rounded-lg text-white shadow-lg" style={{ backgroundColor: formData.primary_color }}>
                                            <Save size={20} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Navigation Highlight</h4>
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="px-4 py-3 border-l-4" style={{ borderColor: formData.primary_color, backgroundColor: `${formData.primary_color}10` }}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white shadow-sm" style={{ color: formData.primary_color }}>
                                                    <Globe size={16} />
                                                </div>
                                                <span className="text-sm font-black" style={{ color: formData.primary_color }}>Dashboard Overview</span>
                                            </div>
                                        </div>
                                        <div className="px-4 py-3 opacity-40">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100">
                                                    <Layout size={16} className="text-gray-400" />
                                                </div>
                                                <span className="text-sm font-bold text-gray-400 uppercase tracking-tight">System Logs</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Logo Section */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center">
                        <div className="w-full flex items-center gap-2 border-b border-gray-50 pb-4 mb-6">
                            <Upload size={18} className="text-primary-green" />
                            <h3 className="font-bold text-gray-800 text-left w-full">Pharmacy Logo</h3>
                        </div>

                        <div className="relative group w-full aspect-video bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center overflow-hidden transition-all hover:bg-gray-100/80">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo Preview" className="max-h-[80%] max-w-[80%] object-contain p-4" />
                            ) : (
                                <div className="flex flex-col items-center text-gray-400">
                                    <Upload size={40} className="mb-2 opacity-20" />
                                    <p className="text-xs font-medium">No Logo Selected</p>
                                </div>
                            )}
                            
                            <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <Upload size={24} className="mb-1" />
                                <span className="text-xs font-bold uppercase tracking-wider">Change Logo</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>
                        <p className="text-[11px] text-gray-400 text-center mt-4 italic px-4">
                            Recommended size: 250x100px. PNG or SVG with transparent background works best.
                        </p>
                    </div>

                    <div className="bg-[#1A1A1A] p-6 rounded-xl shadow-xl text-white space-y-6">
                        <h4 className="text-sm font-bold border-b border-white/10 pb-3 flex items-center gap-2">
                            <Save size={16} className="text-primary-green" /> Review Changes
                        </h4>
                        <div className="space-y-4">
                            <p className="text-xs text-white/60 leading-relaxed">
                                Updating these settings will affect all users, including customers and staff. Changes take effect immediately after saving.
                            </p>
                            <button 
                                type="submit"
                                disabled={saving}
                                style={{ backgroundColor: formData.primary_color }}
                                className="w-full py-3.5 rounded-lg text-white font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 shadow-lg shadow-primary-green/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
                            >
                                {saving ? (
                                    <><RefreshCcw size={16} className="animate-spin" /> Updating...</>
                                ) : (
                                    <><Save size={16} /> Save Changes</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default AdminBrandingSettings;
