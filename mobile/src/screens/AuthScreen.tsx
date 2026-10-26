import React, { useState, useEffect, useRef } from "react";
import {
    View,
    SafeAreaView,
    Platform,
    StatusBar,
    BackHandler,
    ScrollView,
    Pressable,
    TextInput,
} from "react-native";
import { ArrowLeft, Globe } from "lucide-react-native";
import { offlineVault } from "../core/vault-storage";
import { CONFIG } from "../config/configuration";
import { useCustomAlert } from "../hooks/useCustomAlert";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Text } from "../components/ui/text";

interface Props {
    onBack: () => void;
    onAuthSuccess: () => void;
    theme?: "dark" | "light";
}

export function AuthScreen({ onBack, onAuthSuccess, theme = "dark" }: Props) {
    const [mode, setMode] = useState<"login" | "register">("login");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [apiUrl, setApiUrl] = useState(CONFIG.DEFAULT_API_URL);
    const [showServerConfig, setShowServerConfig] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const passwordInputRef = useRef<any>(null);
    const { showAlert, alertModal } = useCustomAlert(theme);

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
            setError(err.message || "Failed to reach Snipit server. Check server URL.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView
            className="flex-1 bg-background"
            style={Platform.OS === "android" ? { paddingTop: StatusBar.currentHeight } : undefined}
        >
            {/* Top Navigation */}
            <View className="flex-row items-center justify-between px-4 py-3 border-b border-border bg-background">
                <Button variant="ghost" size="icon" onPress={onBack} className="h-9 w-9">
                    <ArrowLeft className="text-foreground" size={18} />
                </Button>
                <Text className="text-sm font-semibold tracking-tight">
                    {mode === "login" ? "Sign In" : "Sign Up"}
                </Text>
                <View className="w-9" />
            </View>

            <ScrollView
                className="flex-1 bg-background"
                contentContainerClassName="p-4 flex-1 justify-center max-w-sm w-full mx-auto"
                keyboardShouldPersistTaps="handled"
            >
                {/* Official React Native Reusables Auth Card */}
                <Card className="border-border shadow-sm shadow-black/5">
                    <CardHeader>
                        <CardTitle className="text-center text-xl sm:text-left">
                            {mode === "login" ? "Sign in to Snipit" : "Create your account"}
                        </CardTitle>
                        <CardDescription className="text-center sm:text-left">
                            {mode === "login"
                                ? "Welcome back! Please sign in to continue"
                                : "Welcome! Please fill in the details to get started"}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="gap-6">
                        <View className="gap-4">
                            {error ? (
                                <Text className="text-destructive text-xs text-center">{error}</Text>
                            ) : null}

                            {mode === "register" && (
                                <View className="gap-1.5">
                                    <Label htmlFor="username">Username</Label>
                                    <Input
                                        id="username"
                                        placeholder="username"
                                        autoCapitalize="none"
                                        value={username}
                                        onChangeText={setUsername}
                                        returnKeyType="next"
                                    />
                                </View>
                            )}

                            <View className="gap-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    placeholder="m@example.com"
                                    keyboardType="email-address"
                                    autoComplete="email"
                                    autoCapitalize="none"
                                    value={email}
                                    onChangeText={setEmail}
                                    onSubmitEditing={() => passwordInputRef.current?.focus()}
                                    returnKeyType="next"
                                />
                            </View>

                            <View className="gap-1.5">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    ref={passwordInputRef}
                                    id="password"
                                    secureTextEntry
                                    returnKeyType="send"
                                    value={password}
                                    onChangeText={setPassword}
                                    onSubmitEditing={handleSubmit}
                                />
                            </View>

                            <Button className="w-full" disabled={loading} onPress={handleSubmit}>
                                <Text>{loading ? "Please wait..." : "Continue"}</Text>
                            </Button>
                        </View>

                        <Text className="text-center text-sm">
                            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                            <Pressable onPress={() => setMode(mode === "login" ? "register" : "login")}>
                                <Text className="text-sm underline underline-offset-4">
                                    {mode === "login" ? "Sign up" : "Sign in"}
                                </Text>
                            </Pressable>
                        </Text>

                        {/* Optional Server URL Setting */}
                        <Pressable
                            className="flex-row items-center justify-center gap-1.5 py-1"
                            onPress={() => setShowServerConfig(!showServerConfig)}
                        >
                            <Globe size={13} className="text-muted-foreground" />
                            <Text className="text-muted-foreground text-[11px]">
                                {showServerConfig ? "Hide server endpoint" : "Configure server URL"}
                            </Text>
                        </Pressable>

                        {showServerConfig && (
                            <View className="pt-2 border-t border-border gap-1.5">
                                <Label htmlFor="server">Server URL</Label>
                                <Input
                                    id="server"
                                    placeholder="http://localhost:3000"
                                    value={apiUrl}
                                    onChangeText={setApiUrl}
                                />
                            </View>
                        )}
                    </CardContent>
                </Card>
            </ScrollView>

            {alertModal}
        </SafeAreaView>
    );
}
