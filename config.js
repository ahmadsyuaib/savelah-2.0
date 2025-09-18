import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra ?? {};

export const COLORS = {
    background: "#080010",
    card: "#150022",
    surface: "#1f0a32",
    text: "#ffffff",
    subText: "#d1c4ff",
    accent: "#a259ff",
    accentSecondary: "#7a2dff",
    success: "#27ae60",
    warning: "#f39c12",
    danger: "#e74c3c",
    border: "#3f2460",
};

export const DEFAULT_SUPABASE_URL =
    extra.SUPABASE_URL ?? "https://your-default-project.supabase.co";
export const DEFAULT_SUPABASE_ANON_KEY =
    extra.SUPABASE_API_KEY ?? "public-anon-key";

export const GMAIL_CLIENT_ID =
    extra.GMAIL_CLIENT_ID ?? "YOUR_GOOGLE_OAUTH_CLIENT_ID";
export const GMAIL_SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
];
export const APP_SCHEME = extra.APP_SCHEME ?? "savelah";

export const NOTIFICATION_CHANNEL_ID = "transactions";
export const MONTH_RESET_DAY = 1;

export const THEME = {
    dark: true,
    colors: {
        primary: COLORS.accent,
        background: COLORS.background,
        card: COLORS.card,
        text: COLORS.text,
        border: COLORS.border,
        notification: COLORS.accentSecondary,
    },
};

export const CATEGORY_COLORS = [
    "#a259ff",
    "#ff6fb7",
    "#4dd2ff",
    "#ffd166",
    "#70e7a1",
];
