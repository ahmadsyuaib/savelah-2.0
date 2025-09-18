import "dotenv/config";

export default {
    expo: {
        name: "savelah",
        slug: "savelah",
        scheme: process.env.APP_SCHEME ?? "savelah",
        extra: {
            SUPABASE_URL: process.env.SUPABASE_URL,
            SUPABASE_API_KEY: process.env.SUPABASE_API_KEY,
            GMAIL_CLIENT_ID: process.env.GMAIL_CLIENT_ID,
            APP_SCHEME: process.env.APP_SCHEME ?? "savelah",
        },
        plugins: [["expo-notifications", { icon: "./assets/icon.png" }]],
    },
};
