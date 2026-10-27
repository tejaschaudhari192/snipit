import React, { useState, useEffect } from "react";
import {
    View,
    Platform,
    StatusBar,
    BackHandler,
    ScrollView,
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

            const token = data.token;
            let avatar = data.avatar || "";

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
                    // Fall back
                }
            }

            const userData = {
                id: data._id || data.id || email,
                email: data.email || email,
                username: data.username || username || email.split("@")[0],
                token,
                avatar,
            };

            await offlineVault.saveUser(userData);
            showAlert(
                "Welcome",
                `Logged in successfully as ${userData.username || "User"}!`,
                "success",
                [
                    {
                        text: "Continue",
                        style: "default",
                        onPress: onAuthSuccess,
                    },
                ]
            );
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
