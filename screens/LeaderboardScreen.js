import { ScrollView, StyleSheet, Text, View } from "react-native";
import { COLORS } from "../config";

const dummyData = [
    { id: 1, name: "Alicia", savings: 1250 },
    { id: 2, name: "Bryan", savings: 980 },
    { id: 3, name: "Cher", savings: 860 },
    { id: 4, name: "Devan", savings: 650 },
];

const LeaderboardScreen = () => (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Leaderboards</Text>
        <Text style={styles.subtitle}>Friendly competition keeps everyone saving!</Text>
        {dummyData.map((entry, index) => (
            <View style={styles.card} key={entry.id}>
                <Text style={styles.rank}>#{index + 1}</Text>
                <View style={styles.cardContent}>
                    <Text style={styles.name}>{entry.name}</Text>
                    <Text style={styles.meta}>Savings this month</Text>
                </View>
                <Text style={styles.amount}>SGD {entry.savings.toFixed(2)}</Text>
            </View>
        ))}
    </ScrollView>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        padding: 16,
        paddingBottom: 80,
    },
    title: {
        color: COLORS.text,
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 8,
    },
    subtitle: {
        color: COLORS.subText,
        marginBottom: 24,
    },
    card: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    rank: {
        color: COLORS.accent,
        fontSize: 22,
        fontWeight: "700",
        width: 48,
    },
    cardContent: {
        flex: 1,
    },
    name: {
        color: COLORS.text,
        fontSize: 18,
        fontWeight: "600",
    },
    meta: {
        color: COLORS.subText,
        fontSize: 12,
        marginTop: 4,
    },
    amount: {
        color: COLORS.accent,
        fontWeight: "700",
    },
});

export default LeaderboardScreen;
