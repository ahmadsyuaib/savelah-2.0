import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useState } from "react";

const STORAGE_KEY = "onboardingComplete";

const OnboardingContext = createContext(null);

export const OnboardingProvider = ({ children }) => {
    const [onboardingComplete, setOnboardingComplete] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const value = await AsyncStorage.getItem(STORAGE_KEY);
            setOnboardingComplete(value === "true");
            setLoading(false);
        };
        load();
    }, []);

    const completeOnboarding = async () => {
        await AsyncStorage.setItem(STORAGE_KEY, "true");
        setOnboardingComplete(true);
    };

    const resetOnboarding = async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
        setOnboardingComplete(false);
    };

    return (
        <OnboardingContext.Provider
            value={{ onboardingComplete, loading, completeOnboarding, resetOnboarding }}
        >
            {children}
        </OnboardingContext.Provider>
    );
};

export const useOnboarding = () => {
    const context = useContext(OnboardingContext);
    if (!context) {
        throw new Error("useOnboarding must be used within an OnboardingProvider");
    }
    return context;
};
