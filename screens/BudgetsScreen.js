import { useMemo, useState } from "react";
import {
    Alert,
    Modal,
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
    const {
        categories,
        transactions,
        addCategory,
        loadingCategories,
        updateCategory,
        deleteCategory,
    } = useData();
    const [name, setName] = useState("");
    const [budget, setBudget] = useState("");
    const [error, setError] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [editBudget, setEditBudget] = useState("");
    const [editError, setEditError] = useState(null);
    const [modalLoading, setModalLoading] = useState(false);

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

    const openCategoryModal = (category) => {
        setSelectedCategory(category);
        setEditBudget(
            category?.monthly_budget !== undefined && category?.monthly_budget !== null
                ? String(category.monthly_budget)
                : ""
        );
        setEditError(null);
    };

    const closeCategoryModal = () => {
        if (modalLoading) return;
        setSelectedCategory(null);
        setEditBudget("");
        setEditError(null);
    };

    const handleSaveCategory = async () => {
        if (!selectedCategory) return;
        setEditError(null);
        const numericBudget = parseFloat(editBudget || "0");
        if (Number.isNaN(numericBudget)) {
            setEditError("Budget must be a valid number");
            return;
        }
        setModalLoading(true);
        try {
            await updateCategory(selectedCategory.id, { monthly_budget: numericBudget });
            closeCategoryModal();
        } catch (err) {
            setEditError(err.message);
        } finally {
            setModalLoading(false);
        }
    };

    const confirmDeleteCategory = () => {
        if (!selectedCategory) return;
        Alert.alert(
            "Delete category",
            `Are you sure you want to delete ${selectedCategory.name}? This cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        setModalLoading(true);
                        try {
                            await deleteCategory(selectedCategory.id);
                            closeCategoryModal();
                        } catch (err) {
                            setEditError(err.message);
                        } finally {
                            setModalLoading(false);
                        }
                    },
                },
            ]
        );
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
                            <TouchableOpacity
                                style={styles.categoryCard}
                                key={item.id ?? item.name}
                                activeOpacity={0.85}
                                onPress={() => openCategoryModal(item)}
                            >
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
                            </TouchableOpacity>
                        );
                    })
                ) : (
                    <Text style={styles.info}>No categories yet.</Text>
                )}
            </View>
            <Modal
                visible={!!selectedCategory}
                transparent
                animationType="slide"
                onRequestClose={closeCategoryModal}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            Edit {selectedCategory?.name ?? "category"}
                        </Text>
                        <Text style={styles.modalLabel}>Monthly budget (SGD)</Text>
                        <TextInput
                            style={styles.input}
                            value={editBudget}
                            onChangeText={setEditBudget}
                            keyboardType="numeric"
                            placeholder="0.00"
                            placeholderTextColor={COLORS.subText}
                        />
                        {editError ? <Text style={styles.error}>{editError}</Text> : null}
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalCancel]}
                                onPress={closeCategoryModal}
                                disabled={modalLoading}
                            >
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalDelete]}
                                onPress={confirmDeleteCategory}
                                disabled={modalLoading}
                            >
                                <Text style={styles.modalDeleteText}>Delete</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalSave]}
                                onPress={handleSaveCategory}
                                disabled={modalLoading}
                            >
                                <Text style={styles.modalSaveText}>
                                    {modalLoading ? "Saving..." : "Save"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        padding: 24,
    },
    modalContent: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    modalTitle: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 16,
    },
    modalLabel: {
        color: COLORS.subText,
        marginBottom: 8,
    },
    modalActions: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 16,
        gap: 12,
    },
    modalButton: {
        flex: 1,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: "center",
        borderWidth: 1,
    },
    modalCancel: {
        borderColor: COLORS.border,
    },
    modalDelete: {
        borderColor: COLORS.danger,
    },
    modalSave: {
        borderColor: COLORS.accent,
        backgroundColor: COLORS.accent,
    },
    modalButtonText: {
        color: COLORS.text,
        fontWeight: "600",
    },
    modalDeleteText: {
        color: COLORS.danger,
        fontWeight: "600",
    },
    modalSaveText: {
        color: COLORS.text,
        fontWeight: "600",
    },
});

export default BudgetsScreen;
