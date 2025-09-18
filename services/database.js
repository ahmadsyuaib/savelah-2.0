import { MONTH_RESET_DAY } from "../config";

export const getCurrentMonthRange = () => {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), MONTH_RESET_DAY));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, MONTH_RESET_DAY));
    return { start, end };
};

export const fetchTransactions = async (supabase, userId) => {
    const { start, end } = getCurrentMonthRange();
    const { data, error } = await supabase
        .from("transactions")
        .select("*, categories(name, monthly_budget)")
        .eq("user_id", userId)
        .gte("transacted_at", start.toISOString())
        .lt("transacted_at", end.toISOString())
        .order("transacted_at", { ascending: false });

    if (error) {
        console.warn("Failed to fetch transactions", error);
        return [];
    }
    return data ?? [];
};

export const upsertTransactions = async (supabase, userId, transactions) => {
    if (!transactions?.length) return { data: [], error: null };
    const records = transactions.map((t) => ({
        ...t,
        user_id: userId,
    }));
    const { data, error } = await supabase
        .from("transactions")
        .upsert(records, { onConflict: "message_id" })
        .select();
    if (error) {
        console.warn("Failed to upsert transactions", error);
    }
    return { data, error };
};

export const createManualTransaction = async (supabase, userId, payload) => {
    const { data, error } = await supabase
        .from("transactions")
        .insert([{ ...payload, user_id: userId, source: "manual" }])
        .select()
        .single();
    if (error) {
        throw error;
    }
    return data;
};

export const assignCategoryToTransaction = async (
    supabase,
    transactionId,
    categoryId
) => {
    const { data, error } = await supabase
        .from("transactions")
        .update({ category_id: categoryId })
        .eq("id", transactionId)
        .select()
        .single();
    if (error) {
        throw error;
    }
    return data;
};

export const fetchCategories = async (supabase, userId) => {
    const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });
    if (error) {
        console.warn("Failed to fetch categories", error);
        return [];
    }
    return data ?? [];
};

export const createCategory = async (supabase, userId, payload) => {
    const { data, error } = await supabase
        .from("categories")
        .insert([{ ...payload, user_id: userId }])
        .select()
        .single();
    if (error) {
        throw error;
    }
    return data;
};

export const getCategoryUsage = (transactions, categories) => {
    const usageMap = new Map();
    transactions.forEach((transaction) => {
        if (!transaction.category_id || transaction.direction !== "outgoing") return;
        const amount = Number(transaction.amount) || 0;
        usageMap.set(
            transaction.category_id,
            (usageMap.get(transaction.category_id) || 0) + amount
        );
    });

    return categories.map((category) => ({
        ...category,
        spent: usageMap.get(category.id) || 0,
    }));
};

export const calculateSummary = (transactions) => {
    const totals = transactions.reduce(
        (acc, transaction) => {
            const amount = Number(transaction.amount) || 0;
            if (transaction.direction === "incoming") {
                acc.income += amount;
            } else {
                acc.expenses += amount;
            }
            return acc;
        },
        { income: 0, expenses: 0 }
    );
    return {
        ...totals,
        balance: totals.income - totals.expenses,
    };
};

export const topCategoriesBySpend = (transactions, categories, limit = 3) => {
    const usage = getCategoryUsage(transactions, categories);
    return usage
        .sort((a, b) => (b.spent || 0) - (a.spent || 0))
        .slice(0, limit);
};
