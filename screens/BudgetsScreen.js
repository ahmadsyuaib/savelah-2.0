import { useMemo, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS } from "../config";
import { useData } from "../contexts/DataContext";
import { getCategoryUsage } from "../services/database";

const BudgetsScreen = () => {
    const { categories, transactions, addCategory, loadingCategories } = useData();
    const [name, setName] = useState("");
    const [budget, setBudget] = useState("");
    const [error, setError] = useState(null);

    const usage = useMemo(
        () => getCategoryUsage(transactions, categories),
        [transactions, categories]
    );

    const handleCreateCategory = async () => {
        setError(null);
        if (!name) {
            setError("Category name is required");
            return;
        }
        const numericBudget = parseFloat(budget || "0");
        try {
            await addCategory({ name, monthly_budget: numericBudget });
            setName("");
            setBudget("");
        } catch (err) {
            setError(err.message);
        }
    };

    const renderBarColor = (percentage) => {
        if (percentage < 0.8) return COLORS.success;
        if (percentage < 1) return COLORS.warning;
        return COLORS.danger;
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Budgets</Text>
            <View style={styles.form}>
                <Text style={styles.formTitle}>Create Category</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Category name"
                    placeholderTextColor={COLORS.subText}
                    value={name}
                    onChangeText={setName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Monthly budget (SGD)"
                    placeholderTextColor={COLORS.subText}
                    value={budget}
                    onChangeText={setBudget}
                    keyboardType="numeric"
                />
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <TouchableOpacity style={styles.button} onPress={handleCreateCategory}>
                    <Text style={styles.buttonText}>Add Category</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Usage</Text>
                {loadingCategories ? (
                    <Text style={styles.info}>Loading categories...</Text>
                ) : usage.length ? (
                    usage.map((item) => {
                        const budgetValue = Number(item.monthly_budget || 0);
                        const spent = Number(item.spent || 0);
                        const percentage = budgetValue
                            ? Math.min(spent / budgetValue, 1)
                            : 0;
                        const color = renderBarColor(budgetValue ? spent / budgetValue : 0);
                        return (
                            <View style={styles.categoryCard} key={item.id ?? item.name}>
                                <View style={styles.categoryHeader}>
                                    <Text style={styles.categoryName}>{item.name}</Text>
                                    <Text style={styles.categoryAmount}>
                                        SGD {spent.toFixed(2)} / {budgetValue.toFixed(2)}
                                    </Text>
                                </View>
                                <View style={styles.progressTrack}>
                                    <View
                                        style={[
                                            styles.progressFill,
                                            {
                                                width: `${percentage * 100}%`,
                                                backgroundColor: color,
                                            },
                                        ]}
                                    />
                                </View>
                            </View>
                        );
                    })
                ) : (
                    <Text style={styles.info}>No categories yet.</Text>
                )}
            </View>
        </ScrollView>
    );
};

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
    form: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 24,
    },
    formTitle: {
        color: COLORS.subText,
        marginBottom: 12,
    },
    input: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 14,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 12,
    },
    button: {
        backgroundColor: COLORS.accent,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
    },
    buttonText: {
        color: COLORS.text,
        fontWeight: "600",
    },
    error: {
        color: COLORS.danger,
        marginBottom: 8,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: "700",
        marginBottom: 12,
    },
    info: {
        color: COLORS.subText,
    },
    categoryCard: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    categoryHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    categoryName: {
        color: COLORS.text,
        fontWeight: "600",
    },
    categoryAmount: {
        color: COLORS.subText,
    },
    progressTrack: {
        height: 10,
        borderRadius: 8,
        backgroundColor: COLORS.surface,
        overflow: "hidden",
    },
    progressFill: {
        height: "100%",
        borderRadius: 8,
    },
});

export default BudgetsScreen;
