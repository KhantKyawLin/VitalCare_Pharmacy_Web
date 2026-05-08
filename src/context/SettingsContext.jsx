import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

export const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState({
        site_name: 'Vital Care Pharmacy',
        site_logo: null,
        primary_color: '#8DB600',
        accent_color: '#7fa400'
    });
    const [loading, setLoading] = useState(true);

    const fetchSettings = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/site-settings');
            if (response.data) {
                const newSettings = { ...settings, ...response.data };
                setSettings(newSettings);
                applyColors(newSettings);
                // Cache settings to prevent FOUC on next load
                localStorage.setItem('site_settings', JSON.stringify(newSettings));
            }
        } catch (error) {
            console.error("Error fetching site settings:", error);
        } finally {
            setLoading(false);
        }
    };

    // Helper to darken a hex color for hover states
    const darkenColor = (hex, amount = 0.15) => {
        if (!hex) return hex;
        try {
            let color = hex.replace('#', '');
            if (color.length === 3) color = color.split('').map(c => c + c).join('');
            
            const r = parseInt(color.substring(0, 2), 16);
            const g = parseInt(color.substring(2, 4), 16);
            const b = parseInt(color.substring(4, 6), 16);

            const dr = Math.max(0, Math.min(255, Math.floor(r * (1 - amount))));
            const dg = Math.max(0, Math.min(255, Math.floor(g * (1 - amount))));
            const db = Math.max(0, Math.min(255, Math.floor(b * (1 - amount))));

            return `#${((1 << 24) + (dr << 16) + (dg << 8) + db).toString(16).slice(1)}`;
        } catch (e) {
            return hex;
        }
    };

    const applyColors = (data) => {
        const root = document.documentElement;
        
        // Identity
        if (data.site_name) {
            document.title = data.site_name;
        }

        if (data.site_logo) {
            const favicon = document.querySelector('link[rel="icon"]');
            if (favicon) {
                favicon.href = `http://127.0.0.1:8000/storage/${data.site_logo}`;
            }
        }

        // Colors
        if (data.primary_color) {
            root.style.setProperty('--primary-color', data.primary_color);
            // Dynamic Hover States
            root.style.setProperty('--primary-color-dark', darkenColor(data.primary_color, 0.15));
            root.style.setProperty('--primary-color-light', `${data.primary_color}15`); 
        }
        if (data.accent_color) {
            root.style.setProperty('--accent-color', data.accent_color);
        }
    };

    const updateSettingsState = (newSettings) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        applyColors(updated);
    };

    useEffect(() => {
        // Load from cache first for immediate UI application
        const cached = localStorage.getItem('site_settings');
        if (cached) {
            try {
                const parsed = JSON.parse(cached);
                setSettings(parsed);
                applyColors(parsed);
            } catch (e) {
                console.error("Error parsing cached settings");
            }
        }
        fetchSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, loading, fetchSettings, updateSettingsState }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
