import { useState, useCallback, useEffect } from "react";
import { Platform, Linking } from "react-native";
import { CONFIG } from "../config/configuration";
import { offlineVault } from "../core/vault-storage";
import { authApi, normalizeApiBaseUrl, UserSessionData } from "../services/auth-service";

export type AuthMode = "login" | "register" | "forgot";

interface UseAuthFlowProps {
    onAuthSuccess: () => void;
    showSuccessAlert: (title: string, message: string, onContinue: () => void) => void;
    showInfoAlert: (title: string, message: string, onDismiss: () => void) => void;
}

export function useAuthFlow({
    onAuthSuccess,
    showSuccessAlert,
    showInfoAlert,
}: UseAuthFlowProps) {
    const [mode, setMode] = useState<AuthMode>("login");
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleAuthData = useCallback(async (data: any, fallbackEmail = "") => {
        const baseUrl = normalizeApiBaseUrl(CONFIG.DEFAULT_API_URL);
        const token = data.token;
        let avatar = data.avatar || "";
        let finalUsername = data.username || data.email?.split("@")[0] || fallbackEmail.split("@")[0] || "User";

        if (token) {
            const profile = await authApi.fetchUserProfile(baseUrl, token);
            if (profile.avatar) avatar = profile.avatar;
            if (profile.username) finalUsername = profile.username;
        }

        const userData: UserSessionData = {
            id: data._id || data.id || data.email || fallbackEmail,
            email: data.email || fallbackEmail,
            username: finalUsername,
            token,
            avatar,
        };

        await offlineVault.saveUser(userData);
        showSuccessAlert("Welcome", `Logged in successfully as ${userData.username}!`, onAuthSuccess);
    }, [showSuccessAlert, onAuthSuccess]);

    // Deep link & OAuth redirection handler
    useEffect(() => {
        const processUrl = async (urlStr?: string | null) => {
            if (!urlStr) return;
            try {
                let queryOrHash = "";
                if (urlStr.includes("#")) {
                    queryOrHash = urlStr.split("#")[1];
                } else if (urlStr.includes("?")) {
                    queryOrHash = urlStr.split("?")[1];
                }
                const params = new URLSearchParams(queryOrHash);
                const code = params.get("code");
                const token = params.get("token");
                const idToken = params.get("id_token");

                if (token) {
                    setLoading(true);
                    await handleAuthData({ token });
                    setLoading(false);
                } else if (idToken) {
                    setLoading(true);
                    const data = await authApi.googleLogin(idToken);
                    await handleAuthData(data);
                } else if (code) {
                    setLoading(true);
                    const data = await authApi.githubLogin(code);
                    await handleAuthData(data);
                }
            } catch (err: any) {
                setError(err.message || "OAuth login failed.");
            } finally {
                setLoading(false);
            }
        };

        if (Platform.OS === "web" && typeof window !== "undefined") {
            processUrl(window.location.href);
        }

        Linking.getInitialURL().then(processUrl);
        const sub = Linking.addEventListener("url", (e) => processUrl(e.url));
        return () => sub.remove();
    }, [handleAuthData]);

    const handleSubmit = async () => {
        if (mode === "forgot") {
            if (!email.trim()) {
                setError("Email is required to reset password.");
                return;
            }
            setLoading(true);
            try {
                await authApi.forgotPassword(email.trim());
                showInfoAlert(
                    "Reset Link Sent",
                    `If an account exists with ${email}, password reset instructions have been sent.`,
                    () => setMode("login")
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
            if (mode === "login") {
                const data = await authApi.login({ email: email.trim(), password });
                await handleAuthData(data, email.trim());
            } else {
                const data = await authApi.register({
                    email: email.trim(),
                    password,
                    username: username.trim(),
                });
                await handleAuthData(data, email.trim());
            }
        } catch (err: any) {
            setError(err.message || "Failed to reach Snipit authentication server.");
        } finally {
            setLoading(false);
        }
    };

    return {
        mode,
        setMode,
        email,
        setEmail,
        username,
        setUsername,
        password,
        setPassword,
        loading,
        error,
        setError,
        handleSubmit,
    };
}

