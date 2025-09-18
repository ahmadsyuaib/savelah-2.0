import { google } from "googleapis";
import { Buffer } from "buffer";
import { parseEmail } from "../parsers";

const gmailClient = (() => {
    try {
        const client = google.gmail({ version: "v1" });
        google.options({ fetch: (url, init) => fetch(url, init) });
        return client;
    } catch (error) {
        console.warn("Falling back to manual Gmail client", error);
        return null;
    }
})();
void gmailClient;

const decodeBase64Url = (input) => {
    if (!input) return "";
    const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
    const buffer = Buffer.from(normalized, "base64");
    return buffer.toString("utf-8");
};

const flattenPayload = (payload) => {
    if (!payload) return "";
    if (payload.body?.data) {
        return decodeBase64Url(payload.body.data);
    }
    if (payload.parts?.length) {
        for (const part of payload.parts) {
            const content = flattenPayload(part);
            if (content) return content;
        }
    }
    return "";
};

const normaliseHeaders = (headers = []) => {
    const map = {};
    headers.forEach((header) => {
        map[header.name?.toLowerCase()] = header.value;
    });
    return map;
};

class GmailService {
    constructor(credentials, refreshTokenFn) {
        this.credentials = credentials;
        this.refreshTokenFn = refreshTokenFn;
    }

    async ensureToken() {
        if (!this.credentials) {
            throw new Error("Missing Gmail credentials");
        }
        if (this.credentials.expires_at && Date.now() > this.credentials.expires_at - 60_000) {
            if (this.refreshTokenFn) {
                const refreshed = await this.refreshTokenFn();
                if (refreshed) {
                    this.credentials = refreshed;
                }
            }
        }
        return this.credentials;
    }

    async request(path, options = {}) {
        const tokens = await this.ensureToken();
        const url = `https://gmail.googleapis.com/gmail/v1/${path}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                Authorization: `Bearer ${tokens.access_token}`,
                "Content-Type": "application/json",
                ...(options.headers || {}),
            },
        });
        if (!response.ok) {
            const message = await response.text();
            throw new Error(`Gmail API error: ${response.status} ${message}`);
        }
        return response.json();
    }

    async listMessages(query) {
        const encodedQuery = encodeURIComponent(query);
        const data = await this.request(`users/me/messages?maxResults=50&q=${encodedQuery}`);
        return data.messages ?? [];
    }

    async getMessage(id) {
        const data = await this.request(`users/me/messages/${id}?format=full`);
        return data;
    }

    normaliseMessage(raw) {
        const headers = normaliseHeaders(raw.payload?.headers);
        return {
            id: raw.id,
            snippet: raw.snippet,
            subject: headers["subject"],
            from: headers["from"],
            to: headers["delivered-to"] || headers["to"],
            body: flattenPayload(raw.payload),
            internalDate: raw.internalDate,
            raw,
        };
    }

    async fetchTransactionEmails(transactionEmail) {
        const queryParts = [
            "(from:ibanking.alert@dbs.com OR from:alert@uobgroup.com OR from:no-reply@uobgroup.com)",
            "category:promotions OR category:primary",
            "newer_than:60d",
        ];
        if (transactionEmail) {
            queryParts.push(`to:${transactionEmail}`);
        }
        const messages = await this.listMessages(queryParts.join(" "));
        const detailed = await Promise.all(
            messages.map(async (message) => {
                const raw = await this.getMessage(message.id);
                return this.normaliseMessage(raw);
            })
        );

        const parsed = detailed
            .map((email) => ({ email, transaction: parseEmail(email) }))
            .filter(({ transaction }) => transaction && transaction.amount > 0)
            .map(({ email, transaction }) => ({
                ...transaction,
                gmail_to: email.to,
                gmail_from: email.from,
                message_id: transaction.message_id ?? email.id,
                source: transaction.source ?? "gmail",
            }));
        return parsed;
    }
}

export default GmailService;
