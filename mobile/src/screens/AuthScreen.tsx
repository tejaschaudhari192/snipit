import React, { useState, useEffect, useCallback } from "react";
import {
    View,
    Platform,
    StatusBar,
    BackHandler,
    ScrollView,
    Linking,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { offlineVault } from "../core/vault-storage";
import { CONFIG } from "../config/configuration";
import { useCustomAlert } from "../hooks/useCustomAlert";
import { Button } from "../components/ui/button";
import { Text } from "../components/ui/text";
import { SignInForm } from "../components/sign-in-form";
import { SignUpForm } from "../components/sign-up-form";
import { ForgotPasswordForm } from "../components/forgot-password-form";

interface Props {
    onBack: () => void;
    onAuthSuccess: () => void;
    theme?: "dark" | "light";
}

type AuthMode = "login" | "register" | "forgot";

export function AuthScreen({ onBack, onAuthSuccess, theme = "dark" }: Props) {
    const [mode, setMode] = useState<AuthMode>("login");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { showAlert, alertModal } = useCustomAlert(theme);

    const handleAuthData = useCallback(async (data: any, fallbackEmail = "") => {
        const baseUrl = CONFIG.DEFAULT_API_URL;
        const token = data.token;
        let avatar = data.avatar || "";
        let finalUsername = data.username || data.email?.split("@")[0] || fallbackEmail.split("@")[0] || "User";

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
                    if (meData.username) finalUsername = meData.username;
                }
            } catch {
                // Keep default
            }
        }

        const userData = {
            id: data._id || data.id || data.email || fallbackEmail,
            email: data.email || fallbackEmail,
            username: finalUsername,
            token,
            avatar,
        };

        await offlineVault.saveUser(userData);
        showAlert(
            "Welcome",
            `Logged in successfully as ${userData.username}!`,
            "success",
            [
                {
                    text: "Continue",
                    style: "default",
                    onPress: onAuthSuccess,
                },
            ]
        );
    }, [showAlert, onAuthSuccess]);

    // Handle OAuth callback (both web URL query and native deep link scheme)
    useEffect(() => {
        const processUrl = async (urlStr?: string | null) => {
            if (!urlStr) return;
            try {
                const parsed = new URL(urlStr);
                const code = parsed.searchParams.get("code");
                const token = parsed.searchParams.get("token");

                if (token) {
                    setLoading(true);
                    await handleAuthData({ token });
                    setLoading(false);
                } else if (code) {
                    setLoading(true);
                    const res = await fetch(`${CONFIG.DEFAULT_API_URL}/auth/github`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ code }),
                    });
                    const data = await res.json();
                    if (!res.ok) {
                        throw new Error(data.message || "GitHub authentication failed.");
                    }
                    await handleAuthData(data);
                }
            } catch (err: any) {
                setError(err.message || "OAuth login failed.");
            } finally {
                setLoading(false);
            }
        };

        // Check current web URL params
        if (Platform.OS === "web" && typeof window !== "undefined") {
            processUrl(window.location.href);
        }

        // Native deep link check
        Linking.getInitialURL().then(processUrl);
        const sub = Linking.addEventListener("url", (e) => processUrl(e.url));
        return () => sub.remove();
    }, [handleAuthData]);

    useEffect(() => {
        const handleHardwareBack = () => {
            if (mode !== "login") {
                setMode("login");
                return true;
            }
            onBack();
            return true;
        };
        const subscription = BackHandler.addEventListener("hardwareBackPress", handleHardwareBack);
        return () => subscription.remove();
    }, [onBack, mode]);

    const normalizeApiBaseUrl = (url: string) => {
        const clean = url.trim().replace(/\/+$/, "");
        if (clean.endsWith("/api/v1")) return clean;
        if (clean.endsWith("/api")) return `${clean}/v1`;
        return `${clean}/api/v1`;
    };

    const handleSubmit = async () => {
        if (mode === "forgot") {
            if (!email.trim()) {
                setError("Email is required to reset password.");
                return;
            }
            setLoading(true);
            try {
                const baseUrl = normalizeApiBaseUrl(CONFIG.DEFAULT_API_URL);
                const res = await fetch(`${baseUrl}/auth/forgotpassword`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email: email.trim() }),
                });
                const data = await res.json().catch(() => ({}));
                if (!res.ok) {
                    throw new Error(data.message || "Failed to send reset link.");
                }
                showAlert(
                    "Reset Link Sent",
                    `If an account exists with ${email}, password reset instructions have been sent.`,
                    "info",
                    [{ text: "OK", onPress: () => setMode("login") }]
                );
            } catch (err: any) {
                setError(err.message || "Failed to request password reset.");
            } finally {
                setLoading(false);
            }
            return;
        }

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
            const baseUrl = normalizeApiBaseUrl(CONFIG.DEFAULT_API_URL);
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

            await handleAuthData(data, email.trim());
        } catch (err: any) {
            setError(err.message || "Failed to reach Snipit authentication server.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background" edges={["top", "bottom", "left", "right"]}>
            {/* Top Navigation */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-border bg-background">
                <Button variant="ghost" size="icon" onPress={mode === "login" ? onBack : () => setMode("login")} className="h-9 w-9">
                    <ArrowLeft className="text-foreground" size={18} />
                </Button>
                <Text className="text-sm font-semibold tracking-tight">
                    {mode === "login" ? "Sign In" : mode === "register" ? "Sign Up" : "Reset Password"}
                </Text>
                <View className="w-9" />
            </View>

            <ScrollView
                className="flex-1 bg-background"
                contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
                contentContainerClassName="p-4 max-w-sm w-full mx-auto"
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
            >
                {mode === "login" && (
                    <SignInForm
                        email={email}
                        setEmail={setEmail}
                        password={password}
                        setPassword={setPassword}
                        onSubmit={handleSubmit}
                        loading={loading}
                        error={error}
                        onNavigateToSignUp={() => {
                            setError("");
                            setMode("register");
                        }}
                        onNavigateToForgotPassword={() => {
                            setError("");
                            setMode("forgot");
                        }}
                    />
                )}

                {mode === "register" && (
                    <SignUpForm
                        email={email}
                        setEmail={setEmail}
                        username={username}
                        setUsername={setUsername}
                        password={password}
                        setPassword={setPassword}
                        onSubmit={handleSubmit}
                        loading={loading}
                        error={error}
                        onNavigateToSignIn={() => {
                            setError("");
                            setMode("login");
                        }}
                    />
                )}

                {mode === "forgot" && (
                    <ForgotPasswordForm
                        email={email}
                        setEmail={setEmail}
                        onSubmit={handleSubmit}
                        loading={loading}
                        error={error}
                        onNavigateToSignIn={() => {
                            setError("");
                            setMode("login");
                        }}
                    />
                )}
            </ScrollView>

            {alertModal}
        </SafeAreaView>
    );
}
