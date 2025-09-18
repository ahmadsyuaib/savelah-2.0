import "dotenv/config";

export default {
    expo: {
        name: "savelah",
        slug: "savelah",
        extra: {
            SUPABASE_URL: process.env.SUPABASE_URL,
            SUPABASE_API_KEY: process.env.SUPABASE_API_KEY,
        },
    },
};
