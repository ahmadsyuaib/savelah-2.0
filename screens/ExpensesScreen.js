import { useCallback, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import TransactionItem from "../components/TransactionItem";
import ManualTransactionModal from "../components/ManualTransactionModal";
import CategoryAssignModal from "../components/CategoryAssignModal";
import { COLORS } from "../config";
import { useData } from "../contexts/DataContext";
import { useGmail } from "../contexts/GmailContext";
import { useUserSettings } from "../contexts/UserSettingsContext";

const ExpensesScreen = () => {
    const {
        transactions,
        categories,
        loadingTransactions,
        syncing,
        syncTransactionsFromGmail,
        addManualTransaction,
        updateTransactionCategory,
    } = useData();
    const { credentials, signIn } = useGmail();
    const { settings } = useUserSettings();

    const [manualVisible, setManualVisible] = useState(false);
    const [assignVisible, setAssignVisible] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [statusMessage, setStatusMessage] = useState("");

    const handleSync = useCallback(async () => {
        try {
            const result = await syncTransactionsFromGmail();
            if (result) {
                setStatusMessage(
                    `Imported ${result.imported} transactions (${result.new} new)`
                );
            }
        } catch (error) {
            setStatusMessage(error.message);
        }
    }, [syncTransactionsFromGmail]);

    const handleManualSubmit = useCallback(
        async (payload) => {
            try {
                await addManualTransaction(payload);
                setManualVisible(false);
                setStatusMessage("Manual transaction saved");
            } catch (error) {
                setStatusMessage(error.message);
            }
        },
        [addManualTransaction]
    );

    const handleAssignCategory = useCallback(
        (transaction) => {
            setSelectedTransaction(transaction);
            setAssignVisible(true);
        },
        []
    );

    const handleSelectCategory = useCallback(
        async (category) => {
            if (!selectedTransaction) return;
            try {
                await updateTransactionCategory(selectedTransaction.id, category.id);
                setAssignVisible(false);
                setSelectedTransaction(null);
                setStatusMessage(`Assigned ${category.name}`);
            } catch (error) {
                setStatusMessage(error.message);
            }
        },
        [selectedTransaction, updateTransactionCategory]
    );

    const renderItem = useCallback(
        ({ item }) => (
            <TransactionItem
                transaction={item}
                categories={categories}
                onAssignCategory={handleAssignCategory}
            />
        ),
        [categories, handleAssignCategory]
    );

    const keyExtractor = useCallback((item) => item.id?.toString() ?? item.message_id, []);

    const sortedTransactions = useMemo(
        () =>
            [...transactions].sort((a, b) =>
                new Date(b.transacted_at) - new Date(a.transacted_at)
            ),
        [transactions]
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.headerTextGroup}>
                    <Text style={styles.title}>Expenses</Text>
                    <Text style={styles.subtitle}>
                        Transactions for {settings.transactionEmail || "your account"}
                    </Text>
                </View>
                {credentials ? (
                    <TouchableOpacity
                        style={[styles.syncButton, syncing && styles.syncButtonDisabled]}
                        onPress={handleSync}
                        disabled={syncing}
                    >
                        {syncing ? (
                            <ActivityIndicator color={COLORS.text} />
                        ) : (
                            <Text style={styles.syncText}>Sync Gmail</Text>
                        )}
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={styles.syncButton}
                        onPress={async () => {
                            try {
                                await signIn();
                                setStatusMessage("Gmail connected");
                            } catch (error) {
                                setStatusMessage(error.message);
                            }
                        }}
                    >
                        <Text style={styles.syncText}>Connect Gmail</Text>
                    </TouchableOpacity>
                )}
            </View>
            {statusMessage ? <Text style={styles.status}>{statusMessage}</Text> : null}
            <FlatList
                data={sortedTransactions}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                style={styles.list}
                refreshControl={
                    <RefreshControl
                        refreshing={loadingTransactions}
                        onRefresh={handleSync}
                        tintColor={COLORS.accent}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyText}>
                            No transactions yet. Connect Gmail or add one manually.
                        </Text>
                    </View>
                }
                contentContainerStyle={
                    sortedTransactions.length === 0
                        ? styles.emptyContainer
                        : styles.listContent
                }
            />
            <TouchableOpacity
                style={styles.fab}
                onPress={() => setManualVisible(true)}
            >
                <Text style={styles.fabText}>+</Text>
            </TouchableOpacity>
            <ManualTransactionModal
                visible={manualVisible}
                onClose={() => setManualVisible(false)}
                onSubmit={handleManualSubmit}
            />
            <CategoryAssignModal
                visible={assignVisible}
                onClose={() => setAssignVisible(false)}
                onSelect={handleSelectCategory}
                categories={categories}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: 16,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    headerTextGroup: {
        flex: 1,
        marginRight: 12,
    },
    title: {
        fontSize: 28,
        color: COLORS.text,
        fontWeight: "bold",
    },
    subtitle: {
        color: COLORS.subText,
        marginTop: 4,
    },
    syncButton: {
        backgroundColor: COLORS.accent,
        paddingVertical: 10,
        paddingHorizontal: 18,
        borderRadius: 12,
    },
    syncButtonDisabled: {
        opacity: 0.6,
    },
    syncText: {
        color: COLORS.text,
        fontWeight: "600",
    },
    status: {
        color: COLORS.subText,
        marginBottom: 8,
    },
    list: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 120,
    },
    emptyContainer: {
        flexGrow: 1,
        justifyContent: "center",
    },
    emptyState: {
        alignItems: "center",
        marginTop: 80,
    },
    emptyText: {
        color: COLORS.subText,
        textAlign: "center",
    },
    fab: {
        position: "absolute",
        right: 20,
        bottom: 30,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.accent,
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
    },
    fabText: {
        color: COLORS.text,
        fontSize: 32,
        marginTop: -4,
    },
});

export default ExpensesScreen;
