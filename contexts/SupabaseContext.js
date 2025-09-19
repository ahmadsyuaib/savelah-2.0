import { createContext, useContext, useMemo, useState } from "react";
import { createSupabaseClient } from "../lib/supabaseClient";
import { DEFAULT_SUPABASE_ANON_KEY, DEFAULT_SUPABASE_URL } from "../config";

const SupabaseContext = createContext(null);

export const SupabaseProvider = ({ children }) => {
    const [config, setConfig] = useState({
        url: DEFAULT_SUPABASE_URL,
        anonKey: DEFAULT_SUPABASE_ANON_KEY,
    });

    // console.log("🧩 Supabase url: ", config.url);
    // console.log("🧩 Supabase anon key: ", config.anonKey);

    const supabase = useMemo(
        () => createSupabaseClient(config.url, config.anonKey),
        [config]
    );

    const value = useMemo(
        () => ({
            supabase,
            supabaseConfig: config,
            setSupabaseConfig: setConfig,
        }),
        [supabase, config]
    );

    return (
        <SupabaseContext.Provider value={value}>
            {children}
        </SupabaseContext.Provider>
    );
};

export const useSupabase = () => {
    const context = useContext(SupabaseContext);
    if (!context) {
        throw new Error("useSupabase must be used within a SupabaseProvider");
    }
    return context;
};
