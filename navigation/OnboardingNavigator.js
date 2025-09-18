import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AuthStepScreen from "../screens/onboarding/AuthStepScreen";
import EmailStepScreen from "../screens/onboarding/EmailStepScreen";
import NotificationsStepScreen from "../screens/onboarding/NotificationsStepScreen";
import SupabaseStepScreen from "../screens/onboarding/SupabaseStepScreen";
import { COLORS } from "../config";

const Stack = createNativeStackNavigator();

const OnboardingNavigator = () => (
    <Stack.Navigator
        screenOptions={{
            headerStyle: { backgroundColor: COLORS.card },
            headerTintColor: COLORS.text,
            contentStyle: { backgroundColor: COLORS.background },
        }}
    >
        <Stack.Screen
            name="AuthStep"
            component={AuthStepScreen}
            options={{ title: "Welcome" }}
        />
        <Stack.Screen
            name="EmailStep"
            component={EmailStepScreen}
            options={{ title: "Transaction Email" }}
        />
        <Stack.Screen
            name="NotificationsStep"
            component={NotificationsStepScreen}
            options={{ title: "Notifications" }}
        />
        <Stack.Screen
            name="SupabaseStep"
            component={SupabaseStepScreen}
            options={{ title: "Supabase" }}
        />
    </Stack.Navigator>
);

export default OnboardingNavigator;
