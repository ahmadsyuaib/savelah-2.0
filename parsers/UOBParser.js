const UOBParser = {
    id: "uob",
    supportedSender: "alert@uobgroup.com",
    match: (email) => /uob/i.test(email.from ?? ""),
    parse: (email) => {
        const body = email.body ?? "";
        const amountMatch = body.match(/SGD\s*([\d,]+\.?\d{0,2})/i);
        const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : 0;

        const incomingKeywords = /received|credit/i.test(body);
        const outgoingKeywords = /spent|charged|debit|purchase|paid/i.test(body);

        const merchantMatch = body.match(/at\s+([A-Za-z0-9 .'-]+)/i);
        const counterpartyMatch = body.match(/from\s+([A-Za-z0-9 .'-]+)/i);

        const modeMatch = body.match(/using\s+([A-Za-z0-9 .'-]+)/i);
        const referenceMatch = body.match(/Reference\s*No\.?\s*[:\-]?\s*([A-Za-z0-9 -]+)/i);

        const incoming = incomingKeywords && !outgoingKeywords;

        return {
            message_id: email.id,
            provider: "gmail",
            bank: "UOB",
            direction: incoming ? "incoming" : "outgoing",
            amount,
            currency: "SGD",
            description:
                referenceMatch?.[1]?.trim() ||
                merchantMatch?.[1]?.trim() ||
                email.subject ||
                email.snippet ||
                "UOB Transaction",
            from_account: incoming
                ? counterpartyMatch?.[1]?.trim() || "Unknown"
                : "Me",
            to_account: incoming ? "Me" : merchantMatch?.[1]?.trim() || "Unknown",
            mode_of_payment: modeMatch?.[1]?.trim() || "Card",
            transacted_at: new Date(Number(email.internalDate)).toISOString(),
        };
    },
};

export default UOBParser;
