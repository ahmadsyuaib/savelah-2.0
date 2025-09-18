const POSBParser = {
    id: "posb",
    supportedSender: "ibanking.alert@dbs.com",
    match: (email) =>
        email.from?.toLowerCase().includes("ibanking.alert@dbs.com"),
    parse: (email) => {
        const body = email.body ?? "";
        const amountMatch = body.match(/SGD\s*([\d,]+\.?\d{0,2})/i);
        const amount = amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : 0;

        const isIncoming = /received|incoming/i.test(body);
        const isOutgoing = /transferred|transfer|debited|paid/i.test(body);

        const counterpartyMatch = body.match(
            isIncoming
                ? /from\s+([A-Za-z0-9 .'-]+)/i
                : /to\s+([A-Za-z0-9 .'-]+)/i
        );
        const counterparty = counterpartyMatch ? counterpartyMatch[1].trim() : "Unknown";

        const modeMatch = body.match(/via\s+([A-Za-z0-9 .'-]+)/i);
        const descriptionMatch = body.match(/Reference:\s*([A-Za-z0-9 .'-]+)/i);

        return {
            message_id: email.id,
            provider: "gmail",
            bank: "POSB",
            direction: isIncoming && !isOutgoing ? "incoming" : "outgoing",
            amount,
            currency: "SGD",
            description:
                descriptionMatch?.[1]?.trim() || email.subject || email.snippet || "POSB Transaction",
            from_account: isIncoming ? counterparty : "Me",
            to_account: isIncoming ? "Me" : counterparty,
            mode_of_payment: modeMatch?.[1]?.trim() || "Funds Transfer",
            transacted_at: new Date(Number(email.internalDate)).toISOString(),
        };
    },
};

export default POSBParser;
