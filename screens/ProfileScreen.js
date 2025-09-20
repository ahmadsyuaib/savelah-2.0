import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Modal,
    StyleSheet,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { COLORS } from "../config";
import { useAuth } from "../contexts/AuthContext";
import { useOnboarding } from "../contexts/OnboardingContext";
import { useSupabase } from "../contexts/SupabaseContext";
import { useUserSettings } from "../contexts/UserSettingsContext";
import { upsertUserProfile } from "../services/userProfile";

const ProfileScreen = () => {
    const { user, signOut } = useAuth();
    const { resetOnboarding } = useOnboarding();
    const { authSupabase, setDataSupabaseConfig, defaultSupabaseConfig } =
        useSupabase();
    const { settings, updateSettings } = useUserSettings();
    const [editing, setEditing] = useState(false);
    const [formEmail, setFormEmail] = useState(settings.transactionEmail);
    const [formUseDefault, setFormUseDefault] = useState(
        settings.useDefaultSupabase
    );
    const [formUrl, setFormUrl] = useState(settings.customSupabaseUrl);
    const [formKey, setFormKey] = useState(settings.customSupabaseAnonKey);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!editing) return;
        setFormEmail(settings.transactionEmail);
        setFormUseDefault(settings.useDefaultSupabase);
        setFormUrl(settings.customSupabaseUrl);
        setFormKey(settings.customSupabaseAnonKey);
    }, [
        editing,
        settings.customSupabaseAnonKey,
        settings.customSupabaseUrl,
        settings.transactionEmail,
        settings.useDefaultSupabase,
    ]);

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

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            if (!user?.id) {
                throw new Error("You must be signed in to update settings");
            }
            if (!formEmail?.trim()) {
                throw new Error("Please provide a transaction email");
            }
            if (!formUseDefault && (!formUrl?.trim() || !formKey?.trim())) {
                throw new Error("Please provide Supabase URL and API key");
            }

            await updateSettings({
                transactionEmail: formEmail.trim(),
                useDefaultSupabase: formUseDefault,
                customSupabaseUrl: formUseDefault ? "" : formUrl.trim(),
                customSupabaseAnonKey: formUseDefault ? "" : formKey.trim(),
            });

            await upsertUserProfile(authSupabase, user.id, {
                transaction_email: formEmail.trim(),
                use_default_supabase: formUseDefault,
                custom_supabase_url: formUseDefault ? null : formUrl.trim(),
                custom_supabase_anon_key: formUseDefault ? null : formKey.trim(),
                notifications_enabled: settings.notificationsEnabled,
            });

            if (formUseDefault) {
                setDataSupabaseConfig(defaultSupabaseConfig);
            } else {
                setDataSupabaseConfig({
                    url: formUrl.trim(),
                    anonKey: formKey.trim(),
                });
            }

            setEditing(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile</Text>
            <View style={styles.profileCard}>
                <Text style={styles.label}>Signed in as</Text>
                <Text style={styles.email}>{user?.email ?? "Anonymous"}</Text>
            </View>
            <TouchableOpacity
                style={styles.button}
                onPress={() => setEditing(true)}
            >
                <Text style={styles.buttonText}>Update Transaction Email</Text>
            </TouchableOpacity>
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
            <Modal
                visible={editing}
                transparent
                animationType="slide"
                onRequestClose={() => (!saving ? setEditing(false) : null)}
            >
                <View style={styles.modalBackdrop}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Update Supabase</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Transaction email"
                            placeholderTextColor={COLORS.subText}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            value={formEmail}
                            onChangeText={setFormEmail}
                        />
                        <View style={styles.switchRow}>
                            <Text style={styles.switchLabel}>Use default Supabase</Text>
                            <Switch
                                value={formUseDefault}
                                onValueChange={setFormUseDefault}
                                thumbColor={COLORS.accent}
                                trackColor={{ true: COLORS.accentSecondary, false: COLORS.border }}
                            />
                        </View>
                        {!formUseDefault ? (
                            <>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Custom Supabase URL"
                                    placeholderTextColor={COLORS.subText}
                                    autoCapitalize="none"
                                    value={formUrl}
                                    onChangeText={setFormUrl}
                                />
                                <TextInput
                                    style={styles.input}
                                    placeholder="Custom Supabase anon key"
                                    placeholderTextColor={COLORS.subText}
                                    autoCapitalize="none"
                                    value={formKey}
                                    onChangeText={setFormKey}
                                />
                            </>
                        ) : null}
                        {error ? <Text style={styles.error}>{error}</Text> : null}
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.cancelButton]}
                                onPress={() => (!saving ? setEditing(false) : null)}
                                disabled={saving}
                            >
                                <Text style={styles.modalButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.saveButton]}
                                onPress={handleSave}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator color={COLORS.text} />
                                ) : (
                                    <Text style={styles.modalButtonText}>Save</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
    error: {
        color: COLORS.danger,
        marginBottom: 8,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        padding: 16,
    },
    modalContent: {
        backgroundColor: COLORS.card,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    modalTitle: {
        color: COLORS.text,
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 16,
    },
    input: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 14,
        color: COLORS.text,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    switchRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    switchLabel: {
        color: COLORS.text,
        fontWeight: "600",
    },
    modalActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        marginTop: 12,
    },
    modalButton: {
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: 1,
    },
    cancelButton: {
        borderColor: COLORS.border,
    },
    saveButton: {
        borderColor: COLORS.accent,
        backgroundColor: COLORS.accent,
        marginLeft: 12,
    },
    modalButtonText: {
        color: COLORS.text,
        fontWeight: "600",
    },
});

export default ProfileScreen;
