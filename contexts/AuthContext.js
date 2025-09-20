import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useSupabase } from "./SupabaseContext";
import { useUserSettings } from "./UserSettingsContext";
import { useOnboarding } from "./OnboardingContext";
import {
    fetchUserProfile,
    resolveSupabaseConfig,
    toLocalSettings,
} from "../services/userProfile";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const { authSupabase, setDataSupabaseConfig } = useSupabase();
    const { updateSettings } = useUserSettings();
    const { onboardingComplete, completeOnboarding } = useOnboarding();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const init = async () => {
            setLoading(true);
            const {
                data: { session: activeSession },
            } = await authSupabase.auth.getSession();
            if (mounted) {
                setSession(activeSession ?? null);
                setLoading(false);
            }
        };
        init();

        const {
            data: { subscription },
        } = authSupabase.auth.onAuthStateChange((_event, activeSession) => {
            setSession(activeSession ?? null);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [authSupabase]);

    useEffect(() => {
        const syncProfile = async () => {
            if (!session?.user?.id) return;

            try {
                const profile = await fetchUserProfile(
                    authSupabase,
                    session.user.id
                );

                if (!profile) {
                    return;
                }

                const localSettings = toLocalSettings(profile);
                if (localSettings) {
                    await updateSettings(localSettings);
                }

                const config = resolveSupabaseConfig(profile);
                setDataSupabaseConfig(config);

                if (!onboardingComplete) {
                    await completeOnboarding();
                }
            } catch (error) {
                console.warn("Failed to synchronise user profile", error);
            }
        };

        syncProfile();
    }, [
        authSupabase,
        completeOnboarding,
        onboardingComplete,
        session?.user?.id,
        setDataSupabaseConfig,
        updateSettings,
    ]);

    const value = useMemo(
        () => ({
            session,
            user: session?.user ?? null,
            loading,
            signIn: (payload) => authSupabase.auth.signInWithPassword(payload),
            signUp: (payload) => authSupabase.auth.signUp(payload),
            signOut: () => authSupabase.auth.signOut(),
        }),
        [authSupabase, session, loading]
    );

    return (
        <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
