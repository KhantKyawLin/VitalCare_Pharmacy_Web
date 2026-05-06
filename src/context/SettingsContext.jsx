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
            }
        } catch (error) {
            console.error("Error fetching site settings:", error);
        } finally {
            setLoading(false);
        }
    };

    const applyColors = (data) => {
        const root = document.documentElement;
        if (data.primary_color) {
            root.style.setProperty('--primary-color', data.primary_color);
            // Add a lighter version for hovers
            root.style.setProperty('--primary-color-light', `${data.primary_color}15`); // 15 is ~8% opacity
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
        fetchSettings();
    }, []);

    return (
        <SettingsContext.Provider value={{ settings, loading, fetchSettings, updateSettingsState }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => useContext(SettingsContext);
