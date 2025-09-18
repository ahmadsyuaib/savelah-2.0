import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSupabase } from "./SupabaseContext";
import { useAuth } from "./AuthContext";
import { useGmail } from "./GmailContext";
import { useUserSettings } from "./UserSettingsContext";
import {
    assignCategoryToTransaction,
    createCategory,
    createManualTransaction,
    fetchCategories,
    fetchTransactions,
    topCategoriesBySpend,
    upsertTransactions,
} from "../services/database";
import { scheduleTransactionNotification } from "../services/notificationService";

const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
    const { supabase } = useSupabase();
    const { user } = useAuth();
    const { getService } = useGmail();
    const { settings } = useUserSettings();

    const [transactions, setTransactions] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loadingTransactions, setLoadingTransactions] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [syncing, setSyncing] = useState(false);

    const loadTransactions = useCallback(async () => {
        if (!user) {
            setTransactions([]);
            return;
        }
        setLoadingTransactions(true);
        const data = await fetchTransactions(supabase, user.id);
        setTransactions(data);
        setLoadingTransactions(false);
    }, [supabase, user]);

    const loadCategories = useCallback(async () => {
        if (!user) {
            setCategories([]);
            return;
        }
        setLoadingCategories(true);
        const data = await fetchCategories(supabase, user.id);
        setCategories(data);
        setLoadingCategories(false);
    }, [supabase, user]);

    useEffect(() => {
        if (user) {
            loadTransactions();
            loadCategories();
        }
    }, [user, loadTransactions, loadCategories]);

    const syncTransactionsFromGmail = useCallback(async () => {
        if (!user) return;
        const service = getService();
        if (!service) {
            throw new Error("Connect your Gmail account to sync transactions");
        }
        setSyncing(true);
        try {
            const existingIds = new Set(transactions.map((item) => item.message_id));
            const parsed = await service.fetchTransactionEmails(
                settings.transactionEmail
            );
            const newTransactions = parsed.filter(
                (transaction) => !existingIds.has(transaction.message_id)
            );
            if (parsed.length) {
                await upsertTransactions(supabase, user.id, parsed);
                await loadTransactions();
            }
            if (settings.notificationsEnabled) {
                await Promise.all(
                    newTransactions.map((transaction) =>
                        scheduleTransactionNotification({
                            ...transaction,
                            id: transaction.message_id,
                        })
                    )
                );
            }
            return { imported: parsed.length, new: newTransactions.length };
        } finally {
            setSyncing(false);
        }
    }, [
        getService,
        loadTransactions,
        settings.notificationsEnabled,
        settings.transactionEmail,
        supabase,
        transactions,
        user,
    ]);

    const addManualTransaction = useCallback(
        async (payload) => {
            if (!user) return null;
            const data = await createManualTransaction(supabase, user.id, payload);
            setTransactions((prev) => [data, ...prev]);
            return data;
        },
        [supabase, user]
    );

    const updateTransactionCategory = useCallback(
        async (transactionId, categoryId) => {
            const data = await assignCategoryToTransaction(
                supabase,
                transactionId,
                categoryId
            );
            setTransactions((prev) =>
                prev.map((item) => (item.id === data.id ? { ...item, ...data } : item))
            );
            return data;
        },
        [supabase]
    );

    const addCategory = useCallback(
        async (payload) => {
            if (!user) return null;
            const data = await createCategory(supabase, user.id, payload);
            setCategories((prev) => [...prev, data]);
            return data;
        },
        [supabase, user]
    );

    const summaryTopCategories = useMemo(
        () => topCategoriesBySpend(transactions, categories),
        [transactions, categories]
    );

    const value = useMemo(
        () => ({
            transactions,
            categories,
            loadingTransactions,
            loadingCategories,
            syncing,
            loadTransactions,
            loadCategories,
            syncTransactionsFromGmail,
            addManualTransaction,
            updateTransactionCategory,
            addCategory,
            summaryTopCategories,
        }),
        [
            transactions,
            categories,
            loadingTransactions,
            loadingCategories,
            syncing,
            loadTransactions,
            loadCategories,
            syncTransactionsFromGmail,
            addManualTransaction,
            updateTransactionCategory,
            addCategory,
            summaryTopCategories,
        ]
    );

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error("useData must be used within a DataProvider");
    }
    return context;
};
