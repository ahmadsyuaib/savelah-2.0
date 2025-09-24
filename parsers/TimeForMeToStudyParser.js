const TEST_SENDER = "timeformetostudy@gmail.com";

const parseKeyValue = (body, key) => {
    const regex = new RegExp(`${key}\\s*[:=-]\\s*([^\n]+)`, "i");
    const match = body.match(regex);
    return match ? match[1].trim() : null;
};

const TestEmailParser = {
    id: "timeformetostudy-test",
    supportedSender: TEST_SENDER,
    match: (email) => (email.from ?? "").toLowerCase().includes(TEST_SENDER),
    parse: (email) => {
        const body = email.body ?? "";
        const amountMatch = parseKeyValue(body, "amount");
        const amount = amountMatch
            ? Math.abs(parseFloat(amountMatch.replace(/,/g, "")))
            : 0;
        if (!amount || Number.isNaN(amount)) {
            return null;
        }

        const directionMatch = parseKeyValue(body, "direction");
        const direction =
            directionMatch?.toLowerCase() === "incoming"
                ? "incoming"
                : directionMatch?.toLowerCase() === "outgoing"
                ? "outgoing"
                : /incoming|credit/i.test(email.subject ?? "")
                ? "incoming"
                : "outgoing";

        const description =
            parseKeyValue(body, "description") ||
            email.subject ||
            email.snippet ||
            "Test transaction";

        const counterparty =
            parseKeyValue(body, "counterparty") ||
            parseKeyValue(body, "with") ||
            (direction === "incoming" ? "Unknown sender" : "Unknown recipient");

        const mode = parseKeyValue(body, "method") || parseKeyValue(body, "mode");

        return {
            message_id: email.id,
            provider: "gmail",
            source: "gmail-test",
            bank: "Test",
            direction,
            amount,
            currency: parseKeyValue(body, "currency") || "SGD",
            description,
            from_account: direction === "incoming" ? counterparty : "Me",
            to_account: direction === "incoming" ? "Me" : counterparty,
            mode_of_payment: mode || "Email Test",
            transacted_at: new Date(Number(email.internalDate)).toISOString(),
        };
    },
};

export default TestEmailParser;
