import React, { useState, useEffect } from "react";
import {
    Text,
    View,
    TouchableOpacity,
    SafeAreaView,
    Platform,
    StatusBar,
    BackHandler,
    ScrollView,
    StyleSheet,
} from "react-native";
import { ArrowLeft, User, Globe } from "lucide-react-native";
import { offlineVault } from "../core/vault-storage";
import { CONFIG } from "../config/configuration";
import { CustomAlertModal, CustomAlertConfig } from "../components/CustomAlertModal";
import { FormInput, FormPasswordInput, PrimaryButton } from "../components/FormControls";

interface Props {
    onBack: () => void;
    onAuthSuccess: () => void;
    theme?: "dark" | "light";
}

export function AuthScreen({ onBack, onAuthSuccess, theme = "dark" }: Props) {
    const isLight = theme === "light";
    const [mode, setMode] = useState<"login" | "register">("login");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [apiUrl, setApiUrl] = useState(CONFIG.DEFAULT_API_URL);
    const [showServerConfig, setShowServerConfig] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Custom Alert State
    const [alertConfig, setAlertConfig] = useState<CustomAlertConfig>({
        visible: false,
        title: "",
    });

    useEffect(() => {
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
            setAlertConfig({
                visible: true,
                title: "Welcome Back",
                message: `Logged in successfully as ${userData.username || "User"}!`,
                type: "success",
                buttons: [
                    {
                        text: "Continue",
                        style: "default",
                        onPress: () => {
                            setAlertConfig((prev) => ({ ...prev, visible: false }));
                            onAuthSuccess();
                        },
                    },
                ],
            });
        } catch (err: any) {
            setError(err.message || "Failed to reach Snipit server. Check server URL.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView
            style={[
                styles.container,
                { backgroundColor: isLight ? "#f8fafc" : "#090d16" },
            ]}
        >
            {/* Header */}
            <View
                style={[
                    styles.header,
                    {
                        backgroundColor: isLight ? "#ffffff" : "#090d16",
                        borderBottomColor: isLight ? "#e2e8f0" : "#1e293b",
                    },
                ]}
            >
                <TouchableOpacity
                    onPress={onBack}
                    style={styles.backBtn}
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                    activeOpacity={0.7}
                >
                    <ArrowLeft color={isLight ? "#0f172a" : "#ffffff"} size={20} />
                </TouchableOpacity>
                <Text
                    style={[
                        styles.headerTitle,
                        { color: isLight ? "#0f172a" : "#f1f5f9" },
                    ]}
                >
                    {mode === "login" ? "Sign In to Snipit" : "Create Snipit Account"}
                </Text>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* User Icon Circle */}
                <View
                    style={[
                        styles.avatarCircle,
                        { backgroundColor: isLight ? "rgba(124, 58, 237, 0.1)" : "rgba(124, 58, 237, 0.18)" },
                    ]}
                >
                    <User color="#8b5cf6" size={40} />
                </View>

                <Text
                    style={[
                        styles.mainTitle,
                        { color: isLight ? "#0f172a" : "#ffffff" },
                    ]}
                >
                    {mode === "login" ? "Welcome Back" : "Get Started"}
                </Text>
                <Text
                    style={[
                        styles.subTitle,
                        { color: isLight ? "#64748b" : "#94a3b8" },
                    ]}
                >
                    Sign in to sync your encrypted vault and snippets across devices, or keep using offline.
                </Text>

                {error ? (
                    <Text style={styles.errorText}>
                        {error}
                    </Text>
                ) : null}

                {mode === "register" && (
                    <FormInput
                        placeholder="Username"
                        value={username}
                        onChangeText={setUsername}
                        autoCapitalize="none"
                        theme={theme}
                    />
                )}

                <FormInput
                    placeholder={mode === "login" ? "Email or Username" : "Email address"}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    theme={theme}
                />

                <FormPasswordInput
                    placeholder="Account Password"
                    showPassword={showPassword}
                    onToggleShowPassword={() => setShowPassword(!showPassword)}
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                    theme={theme}
                />

                <PrimaryButton
                    title={mode === "login" ? "Sign In" : "Register"}
                    loading={loading}
                    onPress={handleSubmit}
                    theme={theme}
                />

                <TouchableOpacity
                    style={styles.toggleModeBtn}
                    onPress={() => setMode(mode === "login" ? "register" : "login")}
                >
                    <Text
                        style={[
                            styles.toggleModeText,
                            { color: isLight ? "#7c3aed" : "#a78bfa" },
                        ]}
                    >
                        {mode === "login"
                            ? "Don't have an account? Create one"
                            : "Already have an account? Sign In"}
                    </Text>
                </TouchableOpacity>

                {/* Server URL Config Toggle */}
                <TouchableOpacity
                    style={styles.serverConfigToggle}
                    onPress={() => setShowServerConfig(!showServerConfig)}
                >
                    <Globe color={isLight ? "#64748b" : "#64748b"} size={14} />
                    <Text
                        style={[
                            styles.serverConfigText,
                            { color: isLight ? "#64748b" : "#64748b" },
                        ]}
                    >
                        {showServerConfig ? "Hide server endpoint" : "Configure API Server"}
                    </Text>
                </TouchableOpacity>

                {showServerConfig && (
                    <View
                        style={[
                            styles.serverConfigBox,
                            {
                                backgroundColor: isLight ? "#ffffff" : "#0f172a",
                                borderColor: isLight ? "#e2e8f0" : "#1e293b",
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.serverConfigLabel,
                                { color: isLight ? "#475569" : "#94a3b8" },
                            ]}
                        >
                            Backend Server URL
                        </Text>
                        <FormInput
                            containerClassName="mb-0"
                            placeholder="http://localhost:3000"
                            value={apiUrl}
                            onChangeText={setApiUrl}
                            theme={theme}
                        />
                    </View>
                )}
            </ScrollView>

            {/* Custom Theme-matched Alert Modal */}
            <CustomAlertModal config={alertConfig} theme={theme} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
    },
    backBtn: {
        padding: 6,
    },
    headerTitle: {
        fontSize: 17,
        fontWeight: "700",
    },
    scrollContent: {
        padding: 24,
        alignItems: "center",
    },
    avatarCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: "center",
        alignItems: "center",
        marginVertical: 16,
    },
    mainTitle: {
        fontSize: 24,
        fontWeight: "800",
        textAlign: "center",
        marginBottom: 6,
    },
    subTitle: {
        fontSize: 14,
        textAlign: "center",
        lineHeight: 20,
        marginBottom: 20,
        paddingHorizontal: 8,
    },
    errorText: {
        color: "#ef4444",
        fontSize: 13,
        textAlign: "center",
        marginBottom: 12,
        paddingHorizontal: 8,
    },
    toggleModeBtn: {
        marginTop: 16,
        padding: 8,
    },
    toggleModeText: {
        fontSize: 14,
        fontWeight: "600",
        textAlign: "center",
    },
    serverConfigToggle: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 28,
        paddingVertical: 8,
    },
    serverConfigText: {
        fontSize: 12,
    },
    serverConfigBox: {
        width: "100%",
        borderRadius: 14,
        padding: 14,
        marginTop: 8,
        borderWidth: 1,
    },
    serverConfigLabel: {
        fontSize: 12,
        fontWeight: "600",
        marginBottom: 8,
    },
});
