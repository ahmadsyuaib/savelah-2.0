import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { THEME, COLORS } from "./config";
import { SupabaseProvider } from "./contexts/SupabaseContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { OnboardingProvider, useOnboarding } from "./contexts/OnboardingContext";
import { UserSettingsProvider } from "./contexts/UserSettingsContext";
import { GmailProvider } from "./contexts/GmailContext";
import { DataProvider } from "./contexts/DataContext";
import MainTabNavigator from "./navigation/MainTabNavigator";
import OnboardingNavigator from "./navigation/OnboardingNavigator";
import { configureNotifications } from "./services/notificationService";

const LoadingView = () => (
    <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.accent} size="large" />
    </View>
);

const RootNavigator = () => {
    const { onboardingComplete, loading: onboardingLoading } = useOnboarding();
    const { loading: authLoading } = useAuth();

    if (onboardingLoading || authLoading) {
        return <LoadingView />;
    }

    return onboardingComplete ? <MainTabNavigator /> : <OnboardingNavigator />;
};

export default function App() {
    useEffect(() => {
        configureNotifications();
    }, []);

    return (
        <SafeAreaProvider>
            <SupabaseProvider>
                <OnboardingProvider>
                    <UserSettingsProvider>
                        <GmailProvider>
                            <AuthProvider>
                                <DataProvider>
                                    <NavigationContainer theme={THEME}>
                                        <RootNavigator />
                                    </NavigationContainer>
                                </DataProvider>
                            </AuthProvider>
                        </GmailProvider>
                    </UserSettingsProvider>
                </OnboardingProvider>
            </SupabaseProvider>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        backgroundColor: COLORS.background,
        alignItems: "center",
        justifyContent: "center",
    },
});
