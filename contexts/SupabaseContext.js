import { createContext, useContext, useMemo, useRef, useState } from "react";
import { createSupabaseClient } from "../lib/supabaseClient";
import { DEFAULT_SUPABASE_ANON_KEY, DEFAULT_SUPABASE_URL } from "../config";

const SupabaseContext = createContext(null);

export const SupabaseProvider = ({ children }) => {
    const defaultConfig = useMemo(
        () => ({
            url: DEFAULT_SUPABASE_URL,
            anonKey: DEFAULT_SUPABASE_ANON_KEY,
        }),
        []
    );

    const authClientRef = useRef(
        createSupabaseClient(
            DEFAULT_SUPABASE_URL,
            DEFAULT_SUPABASE_ANON_KEY
        )
    );

    const [dataConfig, setDataConfig] = useState({
        url: DEFAULT_SUPABASE_URL,
        anonKey: DEFAULT_SUPABASE_ANON_KEY,
    });

    const supabase = useMemo(
        () => createSupabaseClient(dataConfig.url, dataConfig.anonKey),
        [dataConfig]
    );

    const value = useMemo(
        () => ({
            authSupabase: authClientRef.current,
            supabase,
            dataSupabase: supabase,
            supabaseConfig: dataConfig,
            defaultSupabaseConfig: defaultConfig,
            setSupabaseConfig: setDataConfig,
            setDataSupabaseConfig: setDataConfig,
            resetDataSupabaseConfig: () => setDataConfig(defaultConfig),
        }),
        [defaultConfig, supabase, dataConfig]
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
