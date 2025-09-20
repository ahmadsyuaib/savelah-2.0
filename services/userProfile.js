import { DEFAULT_SUPABASE_ANON_KEY, DEFAULT_SUPABASE_URL } from "../config";

export const fetchUserProfile = async (supabase, userId) => {
    if (!userId) return null;
    const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

    if (error) {
        console.warn("Failed to fetch user profile", error);
        return null;
    }

    return data;
};

export const upsertUserProfile = async (supabase, userId, payload) => {
    if (!userId) throw new Error("Missing user identifier");
    const record = {
        user_id: userId,
        ...payload,
        updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
        .from("user_settings")
        .upsert(record, { onConflict: "user_id" })
        .select()
        .single();

    if (error) {
        throw error;
    }

    return data;
};

export const toLocalSettings = (profile) => {
    if (!profile) {
        return null;
    }

    return {
        transactionEmail: profile.transaction_email || "",
        notificationsEnabled:
            profile.notifications_enabled !== undefined
                ? profile.notifications_enabled
                : true,
        useDefaultSupabase:
            profile.use_default_supabase !== undefined
                ? profile.use_default_supabase
                : true,
        customSupabaseUrl: profile.custom_supabase_url || "",
        customSupabaseAnonKey: profile.custom_supabase_anon_key || "",
    };
};

export const resolveSupabaseConfig = (profile) => {
    const useDefault =
        profile?.use_default_supabase !== undefined
            ? profile.use_default_supabase
            : true;

    if (useDefault) {
        return {
            url: DEFAULT_SUPABASE_URL,
            anonKey: DEFAULT_SUPABASE_ANON_KEY,
        };
    }

    if (profile?.custom_supabase_url && profile?.custom_supabase_anon_key) {
        return {
            url: profile.custom_supabase_url,
            anonKey: profile.custom_supabase_anon_key,
        };
    }

    return {
        url: DEFAULT_SUPABASE_URL,
        anonKey: DEFAULT_SUPABASE_ANON_KEY,
    };
};
