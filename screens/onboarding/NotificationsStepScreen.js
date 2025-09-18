import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../config";
import { useUserSettings } from "../../contexts/UserSettingsContext";
import { requestNotificationPermissions } from "../../services/notificationService";

const NotificationsStepScreen = ({ navigation }) => {
    const { updateSettings } = useUserSettings();
    const [status, setStatus] = useState(null);

    const handleEnable = async () => {
        const { granted } = await requestNotificationPermissions();
        setStatus(granted ? "granted" : "denied");
        await updateSettings({ notificationsEnabled: granted });
        navigation.navigate("SupabaseStep");
    };

    const handleSkip = async () => {
        await updateSettings({ notificationsEnabled: false });
        navigation.navigate("SupabaseStep");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Enable push notifications?</Text>
            <Text style={styles.subtitle}>
                We'll notify you when new transactions arrive in your inbox.
            </Text>
            <TouchableOpacity style={styles.button} onPress={handleEnable}>
                <Text style={styles.buttonText}>Enable Notifications</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={handleSkip}>
                <Text style={styles.secondaryText}>Skip for now</Text>
            </TouchableOpacity>
            {status === "denied" ? (
                <Text style={styles.warning}>
                    Notifications are disabled. You can enable them later in settings.
                </Text>
            ) : null}
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
    button: {
        backgroundColor: COLORS.accent,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 16,
    },
    buttonText: {
        color: COLORS.text,
        fontWeight: "600",
    },
    secondaryButton: {
        paddingVertical: 12,
        alignItems: "center",
    },
    secondaryText: {
        color: COLORS.subText,
    },
    warning: {
        color: COLORS.warning,
        marginTop: 24,
    },
});

export default NotificationsStepScreen;
