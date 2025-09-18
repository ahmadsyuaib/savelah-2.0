import { Platform } from "react-native";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { NOTIFICATION_CHANNEL_ID } from "../config";

export const configureNotifications = async () => {
    if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
            name: "Transactions",
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7C",
        });
    }
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });
};

export const requestNotificationPermissions = async () => {
    if (!Device.isDevice) {
        return { granted: false };
    }
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }
    return { granted: finalStatus === "granted" };
};

export const scheduleTransactionNotification = async (transaction) => {
    if (!transaction) return;
    await Notifications.scheduleNotificationAsync({
        content: {
            title:
                transaction.direction === "incoming"
                    ? "Incoming Transaction"
                    : "Outgoing Transaction",
            body: `${transaction.description ?? "Transaction"} • SGD ${Number(
                transaction.amount || 0
            ).toFixed(2)}`,
            data: { transactionId: transaction.id, messageId: transaction.message_id },
        },
        trigger: null,
    });
};
