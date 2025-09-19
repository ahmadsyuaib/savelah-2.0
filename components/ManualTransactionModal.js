import { useState } from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS } from "../config";

const ManualTransactionModal = ({ visible, onClose, onSubmit }) => {
    const [direction, setDirection] = useState("outgoing");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [fromAccount, setFromAccount] = useState("");
    const [toAccount, setToAccount] = useState("");
    const [mode, setMode] = useState("Manual Entry");

    const reset = () => {
        setDirection("outgoing");
        setAmount("");
        setDescription("");
        setFromAccount("");
        setToAccount("");
        setMode("Manual Entry");
    };

    const handleSubmit = () => {
        const numericAmount = parseFloat(amount);
        if (Number.isNaN(numericAmount)) {
            return;
        }
        const payload = {
            direction,
            amount: numericAmount,
            description: description || "Manual Transaction",
            from_account: fromAccount || (direction === "incoming" ? "Unknown" : "Me"),
            to_account: toAccount || (direction === "incoming" ? "Me" : "Unknown"),
            mode_of_payment: mode,
            transacted_at: new Date().toISOString(),
            source: "manual",
        };
        onSubmit(payload);
        reset();
    };

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!visible) {
        return null;
    }

    return (
        <Modal visible={visible} animationType="slide" onRequestClose={handleClose}>
            <ScrollView style={styles.container} contentContainerStyle={styles.content}>
                <Text style={styles.title}>Create Transaction</Text>
                <View style={styles.segmentWrapper}>
                    <Text style={styles.label}>Direction</Text>
                    <View style={styles.segmentGroup}>
                        {[
                            { label: "Outgoing", value: "outgoing" },
                            { label: "Incoming", value: "incoming" },
                        ].map((option) => {
                            const isSelected = direction === option.value;
                            return (
                                <TouchableOpacity
                                    key={option.value}
                                    style={[
                                        styles.segmentButton,
                                        isSelected && styles.segmentButtonSelected,
                                    ]}
                                    onPress={() => setDirection(option.value)}
                                    accessibilityRole="button"
                                    accessibilityState={{ selected: isSelected }}
                                >
                                    <Text
                                        style={[
                                            styles.segmentText,
                                            isSelected && styles.segmentTextSelected,
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>
                <Text style={styles.label}>Amount (SGD)</Text>
                <TextInput
                    style={styles.input}
                    keyboardType="numeric"
                    value={amount}
                    onChangeText={setAmount}
                />
                <Text style={styles.label}>Description</Text>
                <TextInput
                    style={styles.input}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="What was this for?"
                    placeholderTextColor={COLORS.subText}
                />
                <Text style={styles.label}>From</Text>
                <TextInput
                    style={styles.input}
                    value={fromAccount}
                    onChangeText={setFromAccount}
                    placeholder="Who paid?"
                    placeholderTextColor={COLORS.subText}
                />
                <Text style={styles.label}>To</Text>
                <TextInput
                    style={styles.input}
                    value={toAccount}
                    onChangeText={setToAccount}
                    placeholder="Who received?"
                    placeholderTextColor={COLORS.subText}
                />
                <Text style={styles.label}>Mode of Payment</Text>
                <TextInput
                    style={styles.input}
                    value={mode}
                    onChangeText={setMode}
                />
                <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.cancelButton} onPress={handleClose}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
                        <Text style={styles.submitText}>Save</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        padding: 24,
        paddingBottom: 48,
    },
    title: {
        color: COLORS.text,
        fontSize: 24,
        fontWeight: "bold",
        marginBottom: 16,
    },
    label: {
        color: COLORS.subText,
        marginBottom: 8,
    },
    input: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 14,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 16,
    },
    segmentWrapper: {
        marginBottom: 16,
    },
    segmentGroup: {
        flexDirection: "row",
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 4,
    },
    segmentButton: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    segmentButtonSelected: {
        backgroundColor: COLORS.accent,
    },
    segmentText: {
        color: COLORS.subText,
        fontWeight: "600",
    },
    segmentTextSelected: {
        color: COLORS.text,
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8,
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        alignItems: "center",
        marginRight: 12,
    },
    cancelText: {
        color: COLORS.subText,
    },
    submitButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: COLORS.accent,
        alignItems: "center",
    },
    submitText: {
        color: COLORS.text,
        fontWeight: "600",
    },
});

export default ManualTransactionModal;
