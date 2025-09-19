import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { COLORS } from "../config";
import { useAuth } from "../contexts/AuthContext";
import { useOnboarding } from "../contexts/OnboardingContext";

const ProfileScreen = () => {
    const { user, signOut } = useAuth();
    const { resetOnboarding } = useOnboarding();

    const handleSignOut = async () => {
        try {
            await signOut();
        } finally {
            await resetOnboarding();
        }
    };

    const handleReset = async () => {
        await handleSignOut();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>
            <View style={styles.profileCard}>
                <Text style={styles.label}>Signed in as</Text>
                <Text style={styles.email}>{user?.email ?? "Anonymous"}</Text>
            </View>
            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>Friends</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button} onPress={handleReset}>
                <Text style={styles.buttonText}>Supabase Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.button}>
                <Text style={styles.buttonText}>App Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
                <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        padding: 16,
    },
    title: {
        color: COLORS.text,
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 16,
    },
    profileCard: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 16,
        marginBottom: 24,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    label: {
        color: COLORS.subText,
        marginBottom: 4,
    },
    email: {
        color: COLORS.text,
        fontWeight: "600",
    },
    button: {
        backgroundColor: COLORS.card,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    buttonText: {
        color: COLORS.text,
        fontWeight: "600",
    },
    signOutButton: {
        marginTop: 24,
        alignItems: "center",
    },
    signOutText: {
        color: COLORS.danger,
        fontWeight: "700",
    },
});

export default ProfileScreen;
