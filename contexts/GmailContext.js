import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as AuthSession from "expo-auth-session";
import * as SecureStore from "expo-secure-store";
import {
    APP_SCHEME,
    GMAIL_CLIENT_ID,
    GMAIL_SCOPES,
} from "../config";
import GmailService from "../services/gmailService";

const discovery = {
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenEndpoint: "https://oauth2.googleapis.com/token",
    revocationEndpoint: "https://oauth2.googleapis.com/revoke",
};

const STORAGE_KEY = "gmailCredentials";

const GmailContext = createContext(null);

export const GmailProvider = ({ children }) => {
    const [credentials, setCredentials] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        AuthSession.maybeCompleteAuthSession();
        const load = async () => {
            try {
                const stored = await SecureStore.getItemAsync(STORAGE_KEY);
                if (stored) {
                    const parsed = JSON.parse(stored);
                    setCredentials(parsed);
                }
            } catch (error) {
                console.warn("Failed to load Gmail credentials", error);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const persistCredentials = async (payload) => {
        setCredentials(payload);
        await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(payload));
    };

    const signIn = async () => {
        const redirectUri = AuthSession.makeRedirectUri({ scheme: APP_SCHEME });
        const authUrl = `${discovery.authorizationEndpoint}?client_id=${encodeURIComponent(
            GMAIL_CLIENT_ID
        )}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&access_type=offline&prompt=consent&scope=${encodeURIComponent(
            GMAIL_SCOPES.join(" ")
        )}`;

        const response = await AuthSession.startAsync({
            authUrl,
            returnUrl: redirectUri,
        });

        if (response.type !== "success" || !response.params?.code) {
            throw new Error("Gmail authorization cancelled or failed");
        }

        const tokenRes = await fetch(discovery.tokenEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                code: response.params.code,
                client_id: GMAIL_CLIENT_ID,
                redirect_uri: redirectUri,
                grant_type: "authorization_code",
            }).toString(),
        });

        const tokenData = await tokenRes.json();
        if (tokenData.error) {
            throw new Error(tokenData.error_description || "Failed to retrieve tokens");
        }

        const payload = {
            ...tokenData,
            expires_at: Date.now() + tokenData.expires_in * 1000,
        };

        await persistCredentials(payload);
        return payload;
    };

    const refreshToken = async () => {
        if (!credentials?.refresh_token) return null;
        const redirectUri = AuthSession.makeRedirectUri({ scheme: APP_SCHEME });

        const response = await fetch(discovery.tokenEndpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                client_id: GMAIL_CLIENT_ID,
                refresh_token: credentials.refresh_token,
                grant_type: "refresh_token",
                redirect_uri: redirectUri,
            }).toString(),
        });
        const tokenData = await response.json();
        if (tokenData.error) {
            throw new Error(tokenData.error_description || "Token refresh failed");
        }
        const payload = {
            ...credentials,
            ...tokenData,
            expires_at: Date.now() + tokenData.expires_in * 1000,
        };
        await persistCredentials(payload);
        return payload;
    };

    const signOut = async () => {
        setCredentials(null);
        await SecureStore.deleteItemAsync(STORAGE_KEY);
    };

    const getService = () => {
        if (!credentials) return null;
        return new GmailService(credentials, refreshToken);
    };

    const value = useMemo(
        () => ({
            credentials,
            loading,
            signIn,
            refreshToken,
            signOut,
            getService,
        }),
        [credentials, loading]
    );

    return (
        <GmailContext.Provider value={value}>{children}</GmailContext.Provider>
    );
};

export const useGmail = () => {
    const context = useContext(GmailContext);
    if (!context) {
        throw new Error("useGmail must be used within a GmailProvider");
    }
    return context;
};
