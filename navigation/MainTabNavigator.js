import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import ExpensesScreen from "../screens/ExpensesScreen";
import BudgetsScreen from "../screens/BudgetsScreen";
import SummaryScreen from "../screens/SummaryScreen";
import LeaderboardScreen from "../screens/LeaderboardScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { COLORS } from "../config";

const Tab = createBottomTabNavigator();

const icons = {
    Expenses: "card-outline",
    Budgets: "pie-chart-outline",
    Summary: "stats-chart-outline",
    Leaderboards: "people-outline",
    Profile: "person-circle-outline",
};

const MainTabNavigator = () => (
    <Tab.Navigator
        screenOptions={({ route }) => ({
            headerShown: false,
            tabBarStyle: {
                backgroundColor: COLORS.card,
                borderTopColor: COLORS.border,
            },
            tabBarActiveTintColor: COLORS.accent,
            tabBarInactiveTintColor: COLORS.subText,
            tabBarIcon: ({ color, size }) => (
                <Ionicons name={icons[route.name]} size={size} color={color} />
            ),
        })}
    >
        <Tab.Screen name="Expenses" component={ExpensesScreen} />
        <Tab.Screen name="Budgets" component={BudgetsScreen} />
        <Tab.Screen name="Summary" component={SummaryScreen} />
        <Tab.Screen name="Leaderboards" component={LeaderboardScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
);

export default MainTabNavigator;
