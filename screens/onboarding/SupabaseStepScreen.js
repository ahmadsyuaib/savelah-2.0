import { useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useSupabase } from "../../contexts/SupabaseContext";
import { useOnboarding } from "../../contexts/OnboardingContext";
import { COLORS, DEFAULT_SUPABASE_ANON_KEY, DEFAULT_SUPABASE_URL } from "../../config";

const SupabaseStepScreen = () => {
    const { setSupabaseConfig } = useSupabase();
    const { completeOnboarding } = useOnboarding();
    const [useCustom, setUseCustom] = useState(false);
    const [url, setUrl] = useState("");
    const [anonKey, setAnonKey] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFinish = async () => {
        setLoading(true);
        setError(null);
        try {
            if (useCustom) {
                if (!url || !anonKey) {
                    throw new Error("Please provide both URL and API key");
                }
                setSupabaseConfig({ url, anonKey });
            } else {
                setSupabaseConfig({
                    url: DEFAULT_SUPABASE_URL,
                    anonKey: DEFAULT_SUPABASE_ANON_KEY,
                });
            }
            await completeOnboarding();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Connect to Supabase</Text>
            <Text style={styles.subtitle}>
                Use the default backend or plug in your own Supabase project.
            </Text>
            <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>Provide my own project</Text>
                <Switch
                    value={useCustom}
                    onValueChange={setUseCustom}
                    thumbColor={useCustom ? COLORS.accent : COLORS.surface}
                    trackColor={{ true: COLORS.accentSecondary, false: COLORS.border }}
                />
            </View>
            {useCustom ? (
                <>
                    <TextInput
                        style={styles.input}
                        placeholder="Supabase project URL"
                        placeholderTextColor={COLORS.subText}
                        autoCapitalize="none"
                        value={url}
                        onChangeText={setUrl}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Supabase anon/public API key"
                        placeholderTextColor={COLORS.subText}
                        autoCapitalize="none"
                        value={anonKey}
                        onChangeText={setAnonKey}
                    />
                </>
            ) : (
                <View style={styles.defaultBox}>
                    <Text style={styles.defaultText}>Using default project:</Text>
                    <Text style={styles.defaultMeta}>{DEFAULT_SUPABASE_URL}</Text>
                </View>
            )}
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TouchableOpacity style={styles.button} onPress={handleFinish} disabled={loading}>
                {loading ? (
                    <ActivityIndicator color={COLORS.text} />
                ) : (
                    <Text style={styles.buttonText}>Finish</Text>
                )}
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
    switchRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 16,
    },
    switchLabel: {
        color: COLORS.text,
        fontSize: 16,
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
    defaultBox: {
        backgroundColor: COLORS.surface,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: 16,
    },
    defaultText: {
        color: COLORS.subText,
        marginBottom: 4,
    },
    defaultMeta: {
        color: COLORS.text,
        fontWeight: "600",
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
    error: {
        color: COLORS.danger,
        marginBottom: 12,
    },
});

export default SupabaseStepScreen;
