import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { settingsApi } from '../services/settings.service.js';

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState({
    app_name: 'EduLedger',
    app_subtitle: 'School & Tuition Management',
    institution_name: 'Demo Public School & Tuition Centre',
    institution_phone: '',
    institution_address: '',
    allow_overpayment: 'false',
  });
  const [loading, setLoading] = useState(true);

  const refreshSettings = useCallback(async () => {
    try {
      const { data } = await settingsApi.getAll();
      if (data && data.data) {
        setSettings((prev) => ({ ...prev, ...data.data }));
      }
    } catch (err) {
      console.error('Failed to load app settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);

  const value = {
    settings,
    loading,
    refreshSettings,
    institutionName: settings.institution_name || 'Demo Public School & Tuition Centre',
    appName: settings.app_name || 'EduLedger',
    appSubtitle: settings.app_subtitle || 'School & Tuition Management',
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
