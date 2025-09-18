import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useSupabase } from "./SupabaseContext";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const { supabase } = useSupabase();
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        const init = async () => {
            setLoading(true);
            const {
                data: { session: activeSession },
            } = await supabase.auth.getSession();
            if (mounted) {
                setSession(activeSession ?? null);
                setLoading(false);
            }
        };
        init();

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, activeSession) => {
            setSession(activeSession ?? null);
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, [supabase]);

    const value = useMemo(
        () => ({
            session,
            user: session?.user ?? null,
            loading,
            signIn: (payload) => supabase.auth.signInWithPassword(payload),
            signUp: (payload) => supabase.auth.signUp(payload),
            signOut: () => supabase.auth.signOut(),
        }),
        [session, loading, supabase]
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
