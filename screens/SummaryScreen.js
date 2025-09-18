import { useMemo } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../config";
import { useData } from "../contexts/DataContext";
import { calculateSummary } from "../services/database";

const SummaryScreen = () => {
    const { transactions, summaryTopCategories } = useData();

    const summary = useMemo(() => calculateSummary(transactions), [transactions]);

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Summary</Text>
            <View style={styles.cardGroup}>
                <SummaryCard
                    title="Income"
                    value={`SGD ${summary.income.toFixed(2)}`}
                    color={COLORS.success}
                />
                <SummaryCard
                    title="Expenses"
                    value={`SGD ${summary.expenses.toFixed(2)}`}
                    color={COLORS.danger}
                />
                <SummaryCard
                    title="Balance"
                    value={`SGD ${summary.balance.toFixed(2)}`}
                    color={COLORS.accent}
                />
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Top Categories</Text>
                {summaryTopCategories.length ? (
                    summaryTopCategories.map((category) => (
                        <View
                            key={category.id ?? category.name}
                            style={styles.categoryRow}
                        >
                            <Text style={styles.categoryName}>{category.name}</Text>
                            <Text style={styles.categoryAmount}>
                                SGD {Number(category.spent || 0).toFixed(2)}
                            </Text>
                        </View>
                    ))
                ) : (
                    <Text style={styles.placeholder}>No spending yet this month.</Text>
                )}
            </View>
        </ScrollView>
    );
};

const SummaryCard = ({ title, value, color }) => (
    <View style={[styles.summaryCard, { borderColor: color }]}>
        <Text style={styles.summaryTitle}>{title}</Text>
        <Text style={[styles.summaryValue, { color }]}>{value}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        padding: 16,
        paddingBottom: 80,
    },
    title: {
        color: COLORS.text,
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 16,
    },
    cardGroup: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
    },
    summaryCard: {
        width: "32%",
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
    },
    summaryTitle: {
        color: COLORS.subText,
        marginBottom: 8,
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: "700",
    },
    section: {
        marginTop: 16,
    },
    sectionTitle: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 12,
    },
    categoryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.border,
    },
    categoryName: {
        color: COLORS.text,
    },
    categoryAmount: {
        color: COLORS.subText,
    },
    placeholder: {
        color: COLORS.subText,
    },
});

export default SummaryScreen;
