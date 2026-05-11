import React, { useState, useEffect } from 'react';
import api, { getStorageUrl } from '../../utils/api';
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
                setLogoPreview(getStorageUrl(settings.site_logo));
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
            const response = await api.post('/admin/site-settings', data, {
                headers: { 
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
        <div className="space-y-6 pt-2 pb-12 max-w-7xl mx-auto">
            <div className="flex items-center gap-3 mb-2 px-4">
                <div className="bg-slate-900 p-1.5 rounded-full text-white">
                    <Palette size={20} className="stroke-2" />
                </div>
                <div>
                    <h2 className="text-[22px] text-gray-800 font-bold">Branding & UI Design</h2>
                    <p className="text-xs text-gray-500">Configure your pharmacy's visual identity and global theme.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4">
                {/* Column 1: Configuration */}
                <div className="space-y-6">
                    {/* Preset Themes Section */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 border-b border-gray-50 pb-3 mb-4">
                            <Palette size={16} className="text-primary-green" />
                            <h3 className="font-bold text-gray-800 text-sm">Predefined Themes</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {PRESET_THEMES.map((theme) => (
                                <button
                                    key={theme.name}
                                    type="button"
                                    onClick={() => handleApplyTheme(theme)}
                                    className={`p-2.5 rounded-lg border transition-all text-left group hover:shadow-sm ${
                                        formData.primary_color === theme.primary 
                                        ? 'border-gray-900 ring-2 ring-gray-900/5' 
                                        : 'border-gray-100 hover:border-gray-300'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex -space-x-1">
                                            <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: theme.primary }}></div>
                                            <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: theme.accent }}></div>
                                        </div>
                                        <span className="text-[9px] font-black uppercase text-gray-400 group-hover:text-gray-600 transition-colors">{theme.name}</span>
                                    </div>
                                    <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div className="h-full w-2/3" style={{ backgroundColor: theme.primary }}></div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Pharmacy Identity */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 border-b border-gray-50 pb-3 mb-1">
                            <Globe size={16} className="text-primary-green" />
                            <h3 className="font-bold text-gray-800 text-sm">Pharmacy Identity</h3>
                        </div>

                        <div className="space-y-3">
                            <div className="space-y-1">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                    <Type size={14} /> Site Name
                                </label>
                                <input 
                                    type="text"
                                    name="site_name"
                                    value={formData.site_name}
                                    onChange={handleInputChange}
                                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-green/30 focus:border-primary-green transition-all"
                                    placeholder="Pharmacy Name"
                                    required
                                />
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Primary Color</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="color"
                                            name="primary_color"
                                            value={formData.primary_color}
                                            onChange={handleInputChange}
                                            className="h-9 w-9 p-0.5 rounded border border-gray-200 cursor-pointer"
                                        />
                                        <input 
                                            type="text"
                                            name="primary_color"
                                            value={formData.primary_color}
                                            onChange={handleInputChange}
                                            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-[11px] uppercase font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Accent Color</label>
                                    <div className="flex gap-2">
                                        <input 
                                            type="color"
                                            name="accent_color"
                                            value={formData.accent_color}
                                            onChange={handleInputChange}
                                            className="h-9 w-9 p-0.5 rounded border border-gray-200 cursor-pointer"
                                        />
                                        <input 
                                            type="text"
                                            name="accent_color"
                                            value={formData.accent_color}
                                            onChange={handleInputChange}
                                            className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-[11px] uppercase font-mono"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 2: Visual Standards Preview (Centerpiece) */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm h-full flex flex-col">
                        <div className="flex items-center gap-2 border-b border-gray-50 pb-3 mb-4 flex-shrink-0">
                            <Layout size={16} className="text-primary-green" />
                            <h3 className="font-bold text-gray-800 text-sm">Visual Standards Preview</h3>
                        </div>

                        <div className="flex-grow space-y-6 bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-200">
                            {/* Buttons Preview */}
                            <div className="space-y-3">
                                <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Interactive Buttons</h4>
                                <div className="flex flex-col gap-3">
                                    <button 
                                        type="button" 
                                        style={{ backgroundColor: formData.primary_color }} 
                                        className="w-full py-2.5 text-white rounded-[4px] text-xs font-black uppercase tracking-widest shadow-lg shadow-primary-green/10 transition-all"
                                    >
                                        Solid Action
                                    </button>
                                    <button 
                                        type="button" 
                                        style={{ color: formData.primary_color, borderColor: formData.primary_color }} 
                                        className="w-full py-2.5 border rounded-[4px] text-xs font-black uppercase tracking-widest bg-white transition-all"
                                    >
                                        Outline Action
                                    </button>
                                </div>
                            </div>

                            {/* UI Components Preview */}
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Widget Style</h4>
                                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
                                        <div className="space-y-1">
                                            <p className="text-[9px] text-gray-500 font-bold uppercase">Total Sales</p>
                                            <h5 className="text-xl font-black text-gray-800">$12,450</h5>
                                            <div className="flex items-center gap-1">
                                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: formData.primary_color }}></div>
                                                <span className="text-[9px] font-bold text-gray-400 italic">Syncing</span>
                                            </div>
                                        </div>
                                        <div className="p-2 rounded-lg text-white" style={{ backgroundColor: formData.primary_color }}>
                                            <Save size={16} />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Menu Selection</h4>
                                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                                        <div className="px-3 py-2 border-l-4" style={{ borderColor: formData.primary_color, backgroundColor: `${formData.primary_color}10` }}>
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 rounded-full flex items-center justify-center bg-white shadow-sm" style={{ color: formData.primary_color }}>
                                                    <Globe size={14} />
                                                </div>
                                                <span className="text-[11px] font-black" style={{ color: formData.primary_color }}>Active Link</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Column 3: Assets & Actions */}
                <div className="space-y-6">
                    {/* Logo Section */}
                    <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center">
                        <div className="w-full flex items-center gap-2 border-b border-gray-50 pb-3 mb-4">
                            <Upload size={16} className="text-primary-green" />
                            <h3 className="font-bold text-gray-800 text-sm">Pharmacy Logo</h3>
                        </div>

                        <div className="relative group w-full aspect-[4/3] bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center overflow-hidden transition-all hover:bg-gray-100/80">
                            {logoPreview ? (
                                <img src={logoPreview} alt="Logo Preview" className="max-h-[70%] max-w-[70%] object-contain p-2" />
                            ) : (
                                <div className="flex flex-col items-center text-gray-400">
                                    <Upload size={30} className="mb-1 opacity-20" />
                                    <p className="text-[10px] font-bold">No Logo</p>
                                </div>
                            )}
                            
                            <label className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                <Upload size={20} className="mb-1" />
                                <span className="text-[10px] font-bold uppercase">Change</span>
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                            </label>
                        </div>
                    </div>

                    {/* Review & Save */}
                    <div className="bg-[#1A1A1A] p-5 rounded-xl shadow-xl text-white space-y-4">
                        <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                            <Save size={16} className="text-primary-green" />
                            <h3 className="font-bold text-sm">Review & Save</h3>
                        </div>
                        <div className="space-y-4">
                            <p className="text-[10px] text-white/50 leading-relaxed italic">
                                * Updates affect all users immediately across the entire storefront and dashboard.
                            </p>
                            <button 
                                type="submit"
                                disabled={saving}
                                style={{ backgroundColor: formData.primary_color }}
                                className="w-full py-3 rounded-lg text-white font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 shadow-lg shadow-primary-green/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:grayscale"
                            >
                                {saving ? (
                                    <><RefreshCcw size={14} className="animate-spin" /> Updating...</>
                                ) : (
                                    <><CheckCircle2 size={14} /> Update Branding</>
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
