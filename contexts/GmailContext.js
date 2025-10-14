import { createContext, useContext, useState } from "react";
import * as AuthSession from "expo-auth-session";

const GmailContext = createContext(null);

const GMAIL_AUTH_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth";
const GMAIL_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GMAIL_SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
];

export const GmailProvider = ({ children }) => {
    const [tokens, setTokens] = useState(null);

    const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
    const redirectUri = AuthSession.makeRedirectUri();

    const [request, , promptAsync] = AuthSession.useAuthRequest(
        clientId
            ? {
                  clientId,
                  redirectUri,
                  responseType: AuthSession.ResponseType.Code,
                  scopes: GMAIL_SCOPES,
                  extraParams: {
                      access_type: "offline",
                      prompt: "consent",
                  },
                  codeChallengeMethod: AuthSession.CodeChallengeMethod.S256,
              }
            : null,
        {
            authorizationEndpoint: GMAIL_AUTH_ENDPOINT,
            tokenEndpoint: GMAIL_TOKEN_ENDPOINT,
        }
    );

    const signIn = async () => {
        if (!clientId) {
            throw new Error("EXPO_PUBLIC_GOOGLE_CLIENT_ID is not configured");
        }

        if (!request) {
            throw new Error("Gmail auth request is not ready");
        }

        const authResult = await promptAsync();

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
                redirect_uri: request.redirectUri ?? redirectUri,
                grant_type: "authorization_code",
                code_verifier: request.codeVerifier,
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

export default GmailContext;
