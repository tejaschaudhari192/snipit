import React, { useState } from "react";
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    SafeAreaView,
    Platform,
    StatusBar,
    BackHandler,
} from "react-native";
import { ArrowLeft, User, Lock, Mail, Globe, Eye, EyeOff } from "lucide-react-native";
import { offlineVault } from "../core/vault-storage";
import { CONFIG } from "../config/configuration";

interface Props {
    onBack: () => void;
    onAuthSuccess: () => void;
}

export function AuthScreen({ onBack, onAuthSuccess }: Props) {
    const [mode, setMode] = useState<"login" | "register">("login");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [apiUrl, setApiUrl] = useState(CONFIG.DEFAULT_API_URL);
    const [showServerConfig, setShowServerConfig] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    React.useEffect(() => {
        const handleHardwareBack = () => {
            onBack();
            return true;
        };
        const subscription = BackHandler.addEventListener("hardwareBackPress", handleHardwareBack);
        return () => subscription.remove();
    }, [onBack]);

    const normalizeApiBaseUrl = (url: string) => {
        const clean = url.trim().replace(/\/+$/, "");
        if (clean.endsWith("/api/v1")) return clean;
        if (clean.endsWith("/api")) return `${clean}/v1`;
        return `${clean}/api/v1`;
    };

    const handleSubmit = async () => {
        if (!email.trim() || !password.trim()) {
            setError(mode === "login" ? "Username/Email and password are required." : "Email and password are required.");
            return;
        }
        if (mode === "register" && !username.trim()) {
            setError("Username is required for registration.");
            return;
        }

        setError("");
        setLoading(true);

        try {
            const baseUrl = normalizeApiBaseUrl(apiUrl);
            await offlineVault.setApiBaseUrl(baseUrl);
            const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
            const body = mode === "login"
                ? { email: email.trim(), password }
                : { email: email.trim(), password, username: username.trim() };

            const res = await fetch(`${baseUrl}${endpoint}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            });

            const rawText = await res.text();
            let data: any = {};
            try {
                data = JSON.parse(rawText);
            } catch {
                throw new Error(`Server returned status ${res.status}: ${rawText.slice(0, 100)}`);
            }

            if (!res.ok) {
                throw new Error(data.message || data.error || `Authentication failed (Status ${res.status}).`);
            }

            const token = data.token;
            let avatar = data.avatar || "";

            // Fetch latest user profile from /auth/me to get the user's avatar
            if (token) {
                try {
                    const meRes = await fetch(`${baseUrl}/auth/me`, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    });
                    if (meRes.ok) {
                        const meData = await meRes.json();
                        if (meData.avatar) avatar = meData.avatar;
                        if (meData.username) data.username = meData.username;
                    }
                } catch {
                    // Fall back to login response
                }
            }

            // Store logged-in user session
            const userData = {
                id: data._id || data.id || email,
                email: data.email || email,
                username: data.username || username || email.split("@")[0],
                token,
                avatar,
            };

            await offlineVault.saveUser(userData);
            Alert.alert("Success", `Welcome, ${userData.username || "User"}!`);
            onAuthSuccess();
        } catch (err: any) {
            setError(err.message || "Failed to reach Snipit server. Check server URL.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={onBack}
                    style={styles.iconBtn}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                    activeOpacity={0.7}
                >
                    <ArrowLeft color="#fff" size={20} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>
                    {mode === "login" ? "Sign In to Snipit" : "Create Snipit Account"}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.userIconCircle}>
                    <User color="#8b5cf6" size={40} />
                </View>

                <Text style={styles.title}>
                    {mode === "login" ? "Welcome Back" : "Get Started"}
                </Text>
                <Text style={styles.subText}>
                    Sign in to sync your encrypted vault and snippets across devices, or keep using offline.
                </Text>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                {mode === "register" && (
                    <TextInput
                        style={styles.input}
                        placeholder="Username"
                        placeholderTextColor="#6b7280"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                    />
                )}

                <TextInput
                    style={styles.input}
                    placeholder={mode === "login" ? "Email or Username" : "Email address"}
                    placeholderTextColor="#6b7280"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                />

                <View style={styles.passwordContainer}>
                    <TextInput
                        style={styles.passwordInput}
                        placeholder="Account Password"
                        placeholderTextColor="#6b7280"
                        secureTextEntry={!showPassword}
                        value={password}
                        onChangeText={setPassword}
                        autoCapitalize="none"
                    />
                    <TouchableOpacity
                        style={styles.eyeBtn}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? (
                            <EyeOff color="#9ca3af" size={20} />
                        ) : (
                            <Eye color="#9ca3af" size={20} />
                        )}
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={styles.primaryBtn}
                    onPress={handleSubmit}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.btnText}>
                            {mode === "login" ? "Sign In" : "Register"}
                        </Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.toggleRow}
                    onPress={() => setMode(mode === "login" ? "register" : "login")}
                >
                    <Text style={styles.toggleText}>
                        {mode === "login"
                            ? "Don't have an account? Create one"
                            : "Already have an account? Sign In"}
                    </Text>
                </TouchableOpacity>

                {/* Server URL Config Toggle */}
                <TouchableOpacity
                    style={styles.serverToggle}
                    onPress={() => setShowServerConfig(!showServerConfig)}
                >
                    <Globe color="#64748b" size={14} />
                    <Text style={styles.serverToggleText}>
                        {showServerConfig ? "Hide server endpoint" : "Configure API Server"}
                    </Text>
                </TouchableOpacity>

                {showServerConfig && (
                    <View style={styles.serverBox}>
                        <Text style={styles.serverLabel}>Backend Server URL</Text>
                        <TextInput
                            style={[styles.input, { marginBottom: 0 }]}
                            placeholder="http://localhost:3000"
                            placeholderTextColor="#6b7280"
                            value={apiUrl}
                            onChangeText={setApiUrl}
                        />
                    </View>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#090d16",
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#1e293b",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#f8fafc",
    },
    iconBtn: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: "#1e293b",
    },
    content: {
        padding: 24,
        alignItems: "center",
    },
    userIconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: "rgba(139, 92, 246, 0.15)",
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 16,
    },
    title: {
        fontSize: 22,
        fontWeight: "800",
        color: "#f8fafc",
        marginBottom: 6,
    },
    subText: {
        fontSize: 13,
        color: "#94a3b8",
        textAlign: "center",
        lineHeight: 18,
        marginBottom: 20,
        paddingHorizontal: 8,
    },
    input: {
        width: "100%",
        backgroundColor: "#131b2e",
        borderRadius: 12,
        padding: 14,
        color: "#fff",
        fontSize: 15,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#1e293b",
    },
    passwordContainer: {
        width: "100%",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#131b2e",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#1e293b",
        marginBottom: 12,
    },
    passwordInput: {
        flex: 1,
        padding: 14,
        color: "#fff",
        fontSize: 15,
    },
    eyeBtn: {
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    primaryBtn: {
        width: "100%",
        backgroundColor: "#7c3aed",
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
        marginTop: 8,
    },
    btnText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    toggleRow: {
        marginTop: 18,
        padding: 8,
    },
    toggleText: {
        color: "#a78bfa",
        fontSize: 14,
        fontWeight: "600",
    },
    errorText: {
        color: "#ef4444",
        fontSize: 13,
        marginBottom: 12,
        textAlign: "center",
    },
    serverToggle: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 32,
    },
    serverToggleText: {
        color: "#64748b",
        fontSize: 12,
    },
    serverBox: {
        width: "100%",
        backgroundColor: "#0f172a",
        borderRadius: 12,
        padding: 14,
        marginTop: 10,
        borderWidth: 1,
        borderColor: "#1e293b",
    },
    serverLabel: {
        color: "#94a3b8",
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 8,
    },
});
