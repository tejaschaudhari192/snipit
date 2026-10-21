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
            className={`flex-1 min-h-screen ${isLight ? "bg-slate-50" : "bg-slate-950"}`}
            style={Platform.OS === "android" ? { paddingTop: StatusBar.currentHeight } : undefined}
        >
            {/* Header */}
            <View
                className={`flex-row items-center justify-between px-4 py-3 border-b ${
                    isLight ? "bg-white border-slate-200" : "bg-slate-950 border-slate-800"
                }`}
            >
                <TouchableOpacity
                    onPress={onBack}
                    className="p-1.5"
                    hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                    activeOpacity={0.7}
                >
                    <ArrowLeft color={isLight ? "#0f172a" : "#ffffff"} size={20} />
                </TouchableOpacity>
                <Text
                    className={`text-lg font-bold ${
                        isLight ? "text-slate-900" : "text-slate-100"
                    }`}
                >
                    {mode === "login" ? "Sign In to Snipit" : "Create Snipit Account"}
                </Text>
                <View className="w-10" />
            </View>

            <ScrollView
                className={`flex-1 ${isLight ? "bg-slate-50" : "bg-slate-950"}`}
                contentContainerClassName="p-6 items-center"
                keyboardShouldPersistTaps="handled"
            >
                {/* User Icon Circle */}
                <View
                    className={`w-20 h-20 rounded-full justify-center items-center my-4 ${
                        isLight ? "bg-violet-100" : "bg-violet-950"
                    }`}
                >
                    <User color="#8b5cf6" size={40} />
                </View>

                <Text
                    className={`text-2xl font-extrabold text-center mb-1.5 ${
                        isLight ? "text-slate-900" : "text-white"
                    }`}
                >
                    {mode === "login" ? "Welcome Back" : "Get Started"}
                </Text>
                <Text
                    className={`text-sm text-center leading-5 mb-5 px-2 ${
                        isLight ? "text-slate-600" : "text-slate-400"
                    }`}
                >
                    Sign in to sync your encrypted vault and snippets across devices, or keep using offline.
                </Text>

                {error ? (
                    <Text className="text-red-500 text-xs text-center mb-3 px-2">
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
                    className="mt-4 p-2"
                    onPress={() => setMode(mode === "login" ? "register" : "login")}
                >
                    <Text
                        className={`text-sm font-semibold text-center ${
                            isLight ? "text-violet-600" : "text-violet-400"
                        }`}
                    >
                        {mode === "login"
                            ? "Don't have an account? Create one"
                            : "Already have an account? Sign In"}
                    </Text>
                </TouchableOpacity>

                {/* Server URL Config Toggle */}
                <TouchableOpacity
                    className="flex-row items-center gap-1.5 mt-7 py-2"
                    onPress={() => setShowServerConfig(!showServerConfig)}
                >
                    <Globe color="#64748b" size={14} />
                    <Text className="text-slate-500 text-xs">
                        {showServerConfig ? "Hide server endpoint" : "Configure API Server"}
                    </Text>
                </TouchableOpacity>

                {showServerConfig && (
                    <View
                        className={`w-full rounded-2xl p-4 mt-2 border ${
                            isLight
                                ? "bg-white border-slate-200"
                                : "bg-slate-900 border-slate-800"
                        }`}
                    >
                        <Text
                            className={`text-xs font-semibold mb-2 ${
                                isLight ? "text-slate-600" : "text-slate-400"
                            }`}
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
