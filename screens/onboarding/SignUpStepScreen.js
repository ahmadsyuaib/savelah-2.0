import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { COLORS } from "../../config";

const SignUpStepScreen = ({ navigation }) => {
    const { user, signUp, loading } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            navigation.replace("EmailStep");
        }
    }, [navigation, user]);

    const handleSubmit = async () => {
        if (password !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setSubmitting(true);
        setError(null);
        try {
            const { error: signUpError } = await signUp({ email, password });
            if (signUpError) throw signUpError;
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create your account</Text>
            <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={COLORS.subText}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={COLORS.subText}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                placeholderTextColor={COLORS.subText}
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
            />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TouchableOpacity
                style={styles.button}
                onPress={handleSubmit}
                disabled={submitting || loading}
            >
                {submitting ? (
                    <ActivityIndicator color={COLORS.text} />
                ) : (
                    <Text style={styles.buttonText}>Create Account</Text>
                )}
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.switcher}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.switcherText}>Already have an account? Sign in</Text>
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
        color: COLORS.text,
        fontSize: 28,
        fontWeight: "bold",
        marginBottom: 24,
    },
    input: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
        color: COLORS.text,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    button: {
        backgroundColor: COLORS.accent,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 8,
    },
    buttonText: {
        color: COLORS.text,
        fontWeight: "600",
    },
    switcher: {
        marginTop: 24,
        alignItems: "center",
    },
    switcherText: {
        color: COLORS.subText,
    },
    error: {
        color: COLORS.danger,
        marginBottom: 12,
    },
});

export default SignUpStepScreen;
