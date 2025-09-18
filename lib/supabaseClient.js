import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    DEFAULT_SUPABASE_ANON_KEY,
    DEFAULT_SUPABASE_URL,
} from "../config";

const AsyncStorageAdapter = {
    getItem: (key) => AsyncStorage.getItem(key),
    setItem: (key, value) => AsyncStorage.setItem(key, value),
    removeItem: (key) => AsyncStorage.removeItem(key),
};

export const createSupabaseClient = (
    url = DEFAULT_SUPABASE_URL,
    anonKey = DEFAULT_SUPABASE_ANON_KEY
) =>
    createClient(url, anonKey, {
        auth: {
            persistSession: true,
            storage: AsyncStorageAdapter,
            autoRefreshToken: true,
            detectSessionInUrl: false,
        },
    });
