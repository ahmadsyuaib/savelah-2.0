import { StatusBar } from "expo-status-bar";
import { useState, useEffect } from "react";
import {
    StyleSheet,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Alert,
} from "react-native";
import supabase from "./lib/supabase";

export default function App() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [authMode, setAuthMode] = useState("signIn"); // 'signIn' or 'signUp'

    useEffect(() => {
        const session = supabase.auth
            .getSession()
            .then(({ data: { session } }) => {
                setUser(session?.user ?? null);
            });
        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user ?? null);
            }
        );
        return () => {
            listener?.subscription.unsubscribe();
        };
    }, []);

    const handleAuth = async () => {
        setLoading(true);
        try {
            if (authMode === "signIn") {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            } else {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (error) throw error;
                Alert.alert("Check your email for confirmation!");
            }
        } catch (error) {
            Alert.alert("Auth Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <Text style={styles.title}>SaveLah Login!</Text>
            {user ? (
                <View style={styles.authBox}>
                    <Text style={styles.text}>Signed in as:</Text>
                    <Text style={styles.email}>{user.email}</Text>
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleSignOut}
                    >
                        <Text style={styles.buttonText}>Sign Out</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View style={styles.authBox}>
                    <TextInput
                        style={styles.input}
                        placeholder="Email"
                        placeholderTextColor="#bbb"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Password"
                        placeholderTextColor="#bbb"
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleAuth}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {authMode === "signIn" ? "Sign In" : "Sign Up"}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.switchButton}
                        onPress={() =>
                            setAuthMode(
                                authMode === "signIn" ? "signUp" : "signIn"
                            )
                        }
                    >
                        <Text style={styles.switchText}>
                            {authMode === "signIn"
                                ? "Don't have an account? Sign Up"
                                : "Already have an account? Sign In"}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#1a0025",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
    },
    title: {
        fontSize: 32,
        color: "#a259ff",
        fontWeight: "bold",
        marginBottom: 30,
    },
    authBox: {
        backgroundColor: "#2d0036",
        borderRadius: 16,
        padding: 24,
        width: "100%",
        maxWidth: 350,
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
    },
    input: {
        width: "100%",
        height: 48,
        backgroundColor: "#3d005c",
        borderRadius: 8,
        paddingHorizontal: 16,
        color: "#fff",
        marginBottom: 16,
        fontSize: 16,
    },
    button: {
        backgroundColor: "#a259ff",
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 32,
        marginTop: 8,
        width: "100%",
        alignItems: "center",
    },
    buttonText: {
        color: "#fff",
        fontWeight: "bold",
        fontSize: 18,
    },
    switchButton: {
        marginTop: 16,
    },
    switchText: {
        color: "#a259ff",
        fontSize: 15,
        textDecorationLine: "underline",
    },
    text: {
        color: "#fff",
        fontSize: 16,
        marginBottom: 8,
    },
    email: {
        color: "#a259ff",
        fontSize: 18,
        marginBottom: 16,
        fontWeight: "bold",
    },
});
