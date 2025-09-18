import { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { useUserSettings } from "../../contexts/UserSettingsContext";
import { COLORS } from "../../config";

const EmailStepScreen = ({ navigation }) => {
    const { user } = useAuth();
    const { settings, updateSettings } = useUserSettings();
    const [transactionEmail, setTransactionEmail] = useState(settings.transactionEmail);

    useEffect(() => {
        if (!user) {
            navigation.replace("AuthStep");
        }
    }, [navigation, user]);

    const handleNext = async () => {
        await updateSettings({ transactionEmail });
        navigation.navigate("NotificationsStep");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Which email do you use for transactions?</Text>
            <Text style={styles.subtitle}>
                We'll use this to match Gmail receipts and sync your expenses.
            </Text>
            <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={COLORS.subText}
                value={transactionEmail}
                onChangeText={setTransactionEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TouchableOpacity style={styles.button} onPress={handleNext}>
                <Text style={styles.buttonText}>Next</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 24,
        backgroundColor: COLORS.background,
    },
    title: {
        fontSize: 26,
        color: COLORS.text,
        fontWeight: "bold",
        marginBottom: 12,
    },
    subtitle: {
        color: COLORS.subText,
        marginBottom: 24,
        lineHeight: 20,
    },
    input: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
        color: COLORS.text,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    button: {
        backgroundColor: COLORS.accent,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
    },
    buttonText: {
        color: COLORS.text,
        fontWeight: "600",
    },
});

export default EmailStepScreen;
