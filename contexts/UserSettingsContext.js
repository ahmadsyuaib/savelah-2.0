import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "userSettings";

const defaultSettings = {
    transactionEmail: "",
    notificationsEnabled: false,
};

const UserSettingsContext = createContext(null);

export const UserSettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(defaultSettings);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const raw = await AsyncStorage.getItem(STORAGE_KEY);
            if (raw) {
                try {
                    const parsed = JSON.parse(raw);
                    setSettings({ ...defaultSettings, ...parsed });
                } catch (error) {
                    console.warn("Failed to parse user settings", error);
                }
            }
            setLoading(false);
        };
        load();
    }, []);

    const updateSettings = async (updates) => {
        const next = { ...settings, ...updates };
        setSettings(next);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    };

    return (
        <UserSettingsContext.Provider value={{ settings, loading, updateSettings }}>
            {children}
        </UserSettingsContext.Provider>
    );
};

export const useUserSettings = () => {
    const context = useContext(UserSettingsContext);
    if (!context) {
        throw new Error("useUserSettings must be used within a UserSettingsProvider");
    }
    return context;
};
