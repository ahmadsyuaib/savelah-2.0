import { memo, useMemo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../config";

const formatDateTime = (value) => {
    if (!value) return "";
    try {
        const date = new Date(value);
        return new Intl.DateTimeFormat("en-SG", {
            timeZone: "Asia/Singapore",
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    } catch (error) {
        return new Date(value).toLocaleString();
    }
};

const TransactionItem = ({ transaction, categories, onAssignCategory }) => {
    const amountColor =
        transaction.direction === "incoming" ? COLORS.success : COLORS.danger;

    const category = useMemo(
        () => categories.find((item) => item.id === transaction.category_id),
        [categories, transaction.category_id]
    );

    const amountValue = Number(transaction.amount || 0);
    const formattedAmount = `${transaction.direction === "incoming" ? "+" : "-"}SGD ${amountValue.toFixed(
        2
    )}`;

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.title}>{transaction.description}</Text>
                <Text style={[styles.amount, { color: amountColor }]}>
                    {formattedAmount}
                </Text>
            </View>
            <Text style={styles.meta}>{formatDateTime(transaction.transacted_at)}</Text>
            <Text style={styles.meta}>
                From: {transaction.from_account || transaction.gmail_from || "Unknown"}
            </Text>
            <Text style={styles.meta}>
                To: {transaction.to_account || transaction.gmail_to || "Unknown"}
            </Text>
            <Text style={styles.meta}>Mode: {transaction.mode_of_payment || "Unknown"}</Text>
            <TouchableOpacity
                style={styles.categoryButton}
                onPress={() => onAssignCategory(transaction)}
            >
                <Text style={styles.categoryText}>
                    {category ? `Category: ${category.name}` : "Assign Category"}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    headerRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    title: {
        color: COLORS.text,
        fontWeight: "600",
        flex: 1,
        marginRight: 12,
    },
    amount: {
        fontSize: 18,
        fontWeight: "700",
    },
    meta: {
        color: COLORS.subText,
        marginBottom: 4,
    },
    categoryButton: {
        marginTop: 12,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: COLORS.surface,
        alignItems: "center",
    },
    categoryText: {
        color: COLORS.accent,
        fontWeight: "600",
    },
});

export default memo(TransactionItem);
