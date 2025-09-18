import { createContext, useContext, useState } from "react";
import * as AuthSession from "expo-auth-session";
import * as Crypto from "expo-crypto";

const GmailContext = createContext(null);

const GMAIL_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const GMAIL_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GMAIL_SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
].join(" ");

export const GmailProvider = ({ children }) => {
    const [tokens, setTokens] = useState(null);

    const signIn = async () => {
        const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
        if (!clientId) {
            throw new Error("EXPO_PUBLIC_GOOGLE_CLIENT_ID is not configured");
        }

        const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
        const { codeVerifier, codeChallenge } = await createPKCECodes();

        const authParams = new URLSearchParams({
            client_id: clientId,
            redirect_uri: redirectUri,
            response_type: "code",
            scope: GMAIL_SCOPES,
            access_type: "offline",
            prompt: "consent",
            code_challenge: codeChallenge,
            code_challenge_method: "S256",
        });

        const authResult = await AuthSession.startAsync({
            authUrl: `${GMAIL_AUTH_ENDPOINT}?${authParams.toString()}`,
        });

        if (authResult.type !== "success" || !authResult.params?.code) {
            throw new Error("Gmail sign-in was cancelled or failed");
        }

        const tokenResponse = await fetch(GMAIL_TOKEN_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: new URLSearchParams({
                code: authResult.params.code,
                client_id: clientId,
                redirect_uri: redirectUri,
                grant_type: "authorization_code",
                code_verifier: codeVerifier,
            }).toString(),
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            throw new Error(
                `Failed to exchange Gmail authorization code: ${errorText}`
            );
        }

        const tokenJson = await tokenResponse.json();
        setTokens(tokenJson);
        return tokenJson;
    };

    const signOut = () => {
        setTokens(null);
    };

    return (
        <GmailContext.Provider value={{ tokens, signIn, signOut }}>
            {children}
        </GmailContext.Provider>
    );
};

export const useGmail = () => {
    const context = useContext(GmailContext);
    if (!context) {
        throw new Error("useGmail must be used within a GmailProvider");
    }
    return context;
};

const createPKCECodes = async () => {
    const codeVerifier = await AuthSession.generateRandomAsync(128);
    const codeChallenge = await deriveCodeChallenge(codeVerifier);
    return { codeVerifier, codeChallenge };
};

const deriveCodeChallenge = async (codeVerifier) => {
    const digest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        codeVerifier,
        { encoding: Crypto.CryptoEncoding.BASE64 }
    );

    return toBase64Url(digest);
};

const toBase64Url = (value) =>
    value.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

export default GmailContext;
